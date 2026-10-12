(function () {
  "use strict";
  var DATA = window.LEX_DATA || {};

  var searchBox = document.getElementById("searchBox");
  var searchResults = document.getElementById("searchResults");
  var stackList = document.getElementById("stackList");
  var stackCount = document.getElementById("stackCount");
  var exportBtn = document.getElementById("exportBtn");

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function getNotes(cb) {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get({ notes: [] }, function (res) { cb(res.notes || []); });
    } else {
      try {
        var raw = localStorage.getItem("lexi_notes");
        cb(raw ? JSON.parse(raw) : []);
      } catch (e) {
        cb([]);
      }
    }
  }

  function setNotes(notes, cb) {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ notes: notes }, cb || function () {});
    } else {
      try {
        localStorage.setItem("lexi_notes", JSON.stringify(notes));
      } catch (e) {}
      if (cb) cb();
    }
  }

  function renderSearch() {
    var q = searchBox.value.trim().toLowerCase();
    searchResults.textContent = "";
    if (!q) return;
    var hits = Object.keys(DATA).filter(function (k) {
      var d = DATA[k];
      return k.toLowerCase().indexOf(q) !== -1 ||
        d.full.toLowerCase().indexOf(q) !== -1 ||
        d.oneLiner.toLowerCase().indexOf(q) !== -1 ||
        d.keywords.some(function (kw) { return kw.toLowerCase().indexOf(q) !== -1; });
    });
    if (!hits.length) {
      searchResults.appendChild(el("div", "empty", "No dictionary match for \u201C" + searchBox.value.trim() + "\u201D."));
      return;
    }
    hits.forEach(function (k) {
      var d = DATA[k];
      var hit = el("div", "hit");
      var row = el("div");
      row.appendChild(el("span", "acr", d.acr));
      row.appendChild(el("span", "full", d.full));
      hit.appendChild(row);
      hit.appendChild(el("div", "one", d.oneLiner));
      searchResults.appendChild(hit);
    });
  }

  function renderStack() {
    getNotes(function (notes) {
      stackList.textContent = "";
      stackCount.textContent = notes.length + " saved";
      exportBtn.disabled = notes.length === 0;
      if (!notes.length) {
        stackList.appendChild(el("div", "empty", "Hover an acronym on any page and press \u201CSave to Stack\u201D."));
        return;
      }
      notes.forEach(function (n, idx) {
        var item = el("div", "note-item");
        var row1 = el("div", "row1");
        row1.appendChild(el("span", "acr", n.term));
        row1.appendChild(el("span", "full", n.full || ""));
        var del = el("button", "del", "\u2715");
        del.title = "Remove from Stack";
        del.addEventListener("click", function () {
          getNotes(function (cur) {
            setNotes(cur.filter(function (_, i) { return i !== idx; }), renderStack);
          });
        });
        row1.appendChild(del);
        item.appendChild(row1);
        var when = new Date(n.savedAt).toLocaleDateString();
        item.appendChild(el("div", "meta", "Saved " + when + " \u00B7 " + (n.url || "")));
        var ta = el("textarea");
        ta.rows = 1;
        ta.placeholder = "Add your own note...";
        ta.value = n.note || "";
        var noteTimer = null;
        var persistNote = function () {
          getNotes(function (cur) {
            if (cur[idx]) {
              cur[idx].note = ta.value;
              setNotes(cur);
            }
          });
        };
        ta.addEventListener("input", function () {
          if (noteTimer) clearTimeout(noteTimer);
          noteTimer = setTimeout(persistNote, 250);
        });
        ta.addEventListener("change", persistNote);
        item.appendChild(ta);
        stackList.appendChild(item);
      });
    });
  }

  function download(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
  }

  function exportPackage() {
    getNotes(function (notes) {
      if (!notes.length) return;
      var stamp = new Date().toISOString().slice(0, 10);

      var sections = notes.map(function (n) {
        var d = DATA[n.term] || {};
        var anatomy = (d.anatomy || []).map(function (a) {
          return "<li><strong>" + esc(a.letter) + " \u2014 " + esc(a.word) + "</strong> <em>(" + esc(a.role) + ")</em>: " + esc(a.desc) + "</li>";
        }).join("");
        return "<section>" +
          "<h2>" + esc(n.term) + " <span>" + esc(n.full || d.full || "") + "</span></h2>" +
          "<p class=\"one\">" + esc(n.oneLiner || d.oneLiner || "") + "</p>" +
          (d.origin ? "<p class=\"origin\">Origin: " + esc(d.origin) + "</p>" : "") +
          (anatomy ? "<ul>" + anatomy + "</ul>" : "") +
          (n.note ? "<p class=\"note\">My note: " + esc(n.note) + "</p>" : "") +
          "<p class=\"meta\">Saved " + esc(new Date(n.savedAt).toLocaleDateString()) + " from " + esc(n.url || "") + "</p>" +
          "</section>";
      }).join("\n");

      var html = "<!DOCTYPE html>\n<html>\n<head>\n<meta charset=\"utf-8\">\n" +
        "<title>Lexi \u2014 Study Package (" + esc(stamp) + ")</title>\n" +
        "<style>" +
        "body{background:#0b0f1e;color:#e5f6ff;font-family:'Segoe UI',system-ui,sans-serif;max-width:760px;margin:0 auto;padding:32px 20px;}" +
        "h1{color:#00e5ff;} h1 span{color:#a78bfa;}" +
        "section{border:1px solid rgba(0,229,255,.3);border-radius:12px;padding:16px 18px;margin:16px 0;background:rgba(13,20,38,.92);}" +
        "h2{color:#00e5ff;margin:0 0 6px;} h2 span{color:#a78bfa;font-size:14px;}" +
        ".one{color:#dbeafe;} .origin,.meta{color:#94a3b8;font-size:12px;} .note{color:#fbbf24;}" +
        "ul{margin:8px 0 0 18px;} li{margin:4px 0;}" +
        "</style>\n</head>\n<body>\n" +
        "<h1>Lexi \u2014 Study Package</h1>\n" +
        "<p class=\"meta\">" + notes.length + " terms \u00B7 exported " + esc(stamp) + "</p>\n" +
        sections + "\n</body>\n</html>";

      download(new Blob([html], { type: "text/html" }), "lexi-study-package-" + stamp + ".html");
      download(new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), notes: notes }, null, 2)], { type: "application/json" }), "lexi-stack-backup-" + stamp + ".json");
    });
  }

  searchBox.addEventListener("input", renderSearch);
  exportBtn.addEventListener("click", exportPackage);
  renderStack();
})();
