document.addEventListener("DOMContentLoaded", function () {
  var widget = document.getElementById("board-vote");
  if (!widget) return;
  var slug = widget.getAttribute("data-plan-slug");
  var buttons = widget.querySelectorAll("[data-vote]");
  var status = document.getElementById("vote-status");
  var comment = document.getElementById("vote-comment");

  function setActive(vote) {
    buttons.forEach(function (b) {
      b.classList.toggle("vb-active", b.getAttribute("data-vote") === vote);
    });
  }

  function setStatus(msg, ok) {
    if (!status) return;
    status.textContent = msg;
    status.style.color = ok ? "var(--accent-emerald)" : "var(--text-muted)";
  }

  fetch("/api/vote?plan=" + encodeURIComponent(slug))
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data.vote) {
        setActive(data.vote.vote);
        if (comment && data.vote.comment) comment.value = data.vote.comment;
        setStatus("Your current vote: " + data.vote.vote, true);
      }
    })
    .catch(function () {});

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var vote = btn.getAttribute("data-vote");
      setStatus("Saving...", false);
      fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: slug,
          vote: vote,
          comment: comment ? comment.value : ""
        })
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.ok) {
            setActive(vote);
            setStatus("Saved - your vote: " + vote, true);
          } else {
            setStatus("Could not save your vote. Try again.", false);
          }
        })
        .catch(function () { setStatus("Could not save your vote. Try again.", false); });
    });
  });
});
