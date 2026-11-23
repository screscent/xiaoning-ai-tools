/* xn-mortgage.js · 贷款合集：模式 aria-pressed / 次按钮打标 / 结果播报（幂等） */
(function () {
  if (window.__XN_MORTGAGE__) return;
  window.__XN_MORTGAGE__ = 1;

  var root = null;

  function pick() {
    root = document.querySelector("#root");
    return !!root;
  }

  function decorate() {
    if (!root) return;
    var btns = root.querySelectorAll("button");
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      var text = (b.textContent || "").replace(/\s+/g, " ").trim();
      var isMode = /^还款对比$|^提前还款$/.test(text);
      if (isMode) {
        var on = /bg-blue-500/.test(b.className);
        var want = on ? "true" : "false";
        if (b.getAttribute("aria-pressed") !== want) b.setAttribute("aria-pressed", want);
        if (on) {
          if (b.classList.contains("px-mode-off")) b.classList.remove("px-mode-off");
        } else if (!b.classList.contains("px-mode-off")) {
          b.classList.add("px-mode-off");
        }
      }
      if (text === "重置" && !b.classList.contains("px-reset")) b.classList.add("px-reset");
      if (!b.getAttribute("aria-label") && text) b.setAttribute("aria-label", text);
    }
    // 结果卡读屏播报
    var cards = root.querySelectorAll('div[class*="space-y-2"]');
    for (var j = 0; j < cards.length; j++) {
      var c = cards[j];
      var box = c.closest('div[class*="rounded-xl"]') || c.parentElement;
      if (box && box.getAttribute("aria-live") !== "polite") box.setAttribute("aria-live", "polite");
    }
  }

  function start() {
    if (!pick()) return;
    decorate();
    var mo = new MutationObserver(function () { decorate(); });
    mo.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(start, 60); });
  } else {
    setTimeout(start, 60);
  }
})();
