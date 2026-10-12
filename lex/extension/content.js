(function () {
  "use strict";
  try {
    if (!window.LEX_DATA) return;

    var DATA = window.LEX_DATA;
    var TERMS = Object.keys(DATA);
    var KEY_BY_UPPER = {};
    TERMS.forEach(function (k) { KEY_BY_UPPER[k.toUpperCase()] = k; });
    var LEX_LAB_URL = "https://vidiflow.net/monetization/vidiflow-lex.html";

    var RX = new RegExp(
      "\\b(?:" + TERMS.slice().sort(function (a, b) { return b.length - a.length; })
        .map(function (k) { return k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); })
        .join("|") + ")\\b",
      "gi"
    );

    var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEMPLATE: 1, INPUT: 1, TEXTAREA: 1, SELECT: 1, CODE: 1, PRE: 1, BUTTON: 1, OPTION: 1, IFRAME: 1, SVG: 1, CANVAS: 1 };

    function acceptableTextParent(p) {
      if (!p) return false;
      if (SKIP_TAGS[p.tagName]) return false;
      if (p.isContentEditable) return false;
      if (p.closest && p.closest(".lex-term")) return false;
      return true;
    }

    function wrapNode(textNode) {
      var text = textNode.nodeValue;
      if (!text || text.length < 2) return;
      RX.lastIndex = 0;
      if (!RX.test(text)) return;
      RX.lastIndex = 0;
      var frag = document.createDocumentFragment();
      var last = 0;
      var m;
      while ((m = RX.exec(text))) {
        if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        var key = KEY_BY_UPPER[m[0].toUpperCase()];
        var span = document.createElement("span");
        span.className = "lex-term";
        span.setAttribute("data-lex", key);
        span.textContent = m[0];
        frag.appendChild(span);
        last = m.index + m[0].length;
        if (RX.lastIndex === m.index) RX.lastIndex++;
      }
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      textNode.parentNode.replaceChild(frag, textNode);
    }

    function scan(root) {
      var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: function (node) {
          if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          return acceptableTextParent(node.parentElement) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
      });
      var nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      for (var i = 0; i < nodes.length; i++) wrapNode(nodes[i]);
    }

    var card = document.createElement("div");
    card.className = "lex-card";
    card.style.display = "none";
    (document.body || document.documentElement).appendChild(card);

    var currentKey = null;
    var showTimer = null;
    var hideTimer = null;

    function el(tag, cls, text) {
      var n = document.createElement(tag);
      if (cls) n.className = cls;
      if (text != null) n.textContent = text;
      return n;
    }

    function positionCard(anchor) {
      var r = anchor.getBoundingClientRect();
      var cw = card.offsetWidth;
      var ch = card.offsetHeight;
      var x = r.left + r.width / 2 - cw / 2;
      x = Math.max(8, Math.min(x, window.innerWidth - cw - 8));
      var y = r.bottom + 10;
      if (y + ch > window.innerHeight - 8) y = r.top - ch - 10;
      y = Math.max(8, Math.min(y, window.innerHeight - ch - 8));
      card.style.left = Math.round(x) + "px";
      card.style.top = Math.round(y) + "px";
    }

    function showCard(key, anchor) {
      var d = DATA[key];
      if (!d) return;
      currentKey = key;
      card.textContent = "";
      
      // Header
      var head = el("div", "lex-head");
      head.appendChild(el("span", "lex-acr", d.acr));
      head.appendChild(el("span", "lex-full", d.full));
      card.appendChild(head);
      
      // Plain Language One-Liner
      card.appendChild(el("div", "lex-oneliner", d.oneLiner));

      // Smart Stack Dual View (Legacy vs Smart)
      var dualBox = el("div", "lex-dual-box");
      
      var legacyRow = el("div", "lex-dual-row");
      legacyRow.appendChild(el("span", "lex-badge-legacy", "Legacy SaaS"));
      var legacyText = d.replaces && d.replaces.length ? d.replaces.join(" · ") : "Manual silos & multi-week training";
      legacyRow.appendChild(el("span", "lex-dual-text", legacyText));
      dualBox.appendChild(legacyRow);

      var smartRow = el("div", "lex-dual-row");
      smartRow.appendChild(el("span", "lex-badge-smart", "Smart Stack"));
      smartRow.appendChild(el("span", "lex-dual-text", "Autonomous agent workflows · Intention to outcome"));
      dualBox.appendChild(smartRow);

      card.appendChild(dualBox);

      // Meta Info
      var meta = el("div", "lex-meta");
      meta.appendChild(el("span", "lex-anat", d.anatomy.length + "-part anatomy"));
      meta.appendChild(el("span", "lex-twins-tag", "✨ Lexi & Max Verified"));
      card.appendChild(meta);

      // Action Buttons
      var btns = el("div", "lex-btns");
      var save = el("button", "lex-save", "Save to Stack");
      save.addEventListener("click", function () { saveTerm(key, save); });
      var open = el("button", "lex-open", "Lex Lab ↗");
      open.addEventListener("click", function () { window.open(LEX_LAB_URL, "_blank"); });
      btns.appendChild(save);
      btns.appendChild(open);
      card.appendChild(btns);
      
      card.style.display = "block";
      positionCard(anchor);
    }

    function hideCard() {
      card.style.display = "none";
      currentKey = null;
    }

    function scheduleHide() {
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(function () { hideTimer = null; hideCard(); }, 150);
    }

    function saveTerm(key, btn) {
      var d = DATA[key];
      if (!chrome.storage || !chrome.storage.local) return;
      chrome.storage.local.get({ notes: [] }, function (res) {
        var notes = res.notes || [];
        var exists = notes.some(function (n) { return n.term === key; });
        if (!exists) {
          notes.push({
            term: key,
            full: d.full,
            oneLiner: d.oneLiner,
            url: location.href,
            note: "",
            savedAt: new Date().toISOString()
          });
          chrome.storage.local.set({ notes: notes });
        }
        if (btn) {
          btn.textContent = exists ? "In Stack" : "Saved";
          btn.disabled = true;
        }
      });
    }

    document.addEventListener("mouseover", function (e) {
      var t = e.target && e.target.closest ? e.target.closest(".lex-term") : null;
      if (!t) return;
      var key = t.getAttribute("data-lex");
      if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
      if (currentKey === key && card.style.display === "block") return;
      if (showTimer) clearTimeout(showTimer);
      showTimer = setTimeout(function () { showTimer = null; showCard(key, t); }, 250);
    });

    document.addEventListener("mouseout", function (e) {
      var t = e.target && e.target.closest ? e.target.closest(".lex-term") : null;
      if (!t) return;
      if (showTimer) { clearTimeout(showTimer); showTimer = null; }
      scheduleHide();
    });

    card.addEventListener("mouseenter", function () {
      if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
    });
    card.addEventListener("mouseleave", scheduleHide);

    window.addEventListener("scroll", function () {
      if (card.style.display === "block") hideCard();
    }, { passive: true });

    var moTimer = null;
    var mo = new MutationObserver(function (muts) {
      if (moTimer) clearTimeout(moTimer);
      moTimer = setTimeout(function () {
        moTimer = null;
        for (var i = 0; i < muts.length; i++) {
          var added = muts[i].addedNodes;
          for (var j = 0; j < added.length; j++) {
            var n = added[j];
            if (n.nodeType === 3) {
              if (acceptableTextParent(n.parentElement)) wrapNode(n);
            } else if (n.nodeType === 1) {
              if (SKIP_TAGS[n.tagName]) continue;
              if (n.classList && n.classList.contains("lex-card")) continue;
              if (n.closest && n.closest(".lex-term")) continue;
              scan(n);
            }
          }
        }
      }, 300);
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });

    if (document.body) scan(document.body);
  } catch (err) {
    /* never break the host page */
  }
})();
