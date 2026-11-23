/* xn-growth.js · 增长指标：模式按钮 aria-pressed / 结果 aria-live（幂等） */
(function () {
  if (window.__XN_GROWTH__) return;
  window.__XN_GROWTH__ = 1;

  var root = null;

  function pick() {
    root = document.querySelector("#root");
    return !!root;
  }

  function decorate() {
    if (!root) return;
    var tabs = root.querySelectorAll("button.gm-tab");
    for (var i = 0; i < tabs.length; i++) {
      var b = tabs[i];
      var on = b.classList.contains("is-active");
      var want = on ? "true" : "false";
      if (b.getAttribute("aria-pressed") !== want) b.setAttribute("aria-pressed", want);
      if (!b.getAttribute("aria-label")) {
        var t = (b.textContent || "").replace(/\s+/g, " ").trim();
        if (t) b.setAttribute("aria-label", t);
      }
    }
    // 结果大数字：读屏播报变化
    var bigs = root.querySelectorAll(".gm-big");
    for (var j = 0; j < bigs.length; j++) {
      var el = bigs[j];
      var card = el.closest(".gm-card") || el.parentElement;
      if (card && card.getAttribute("aria-live") !== "polite") card.setAttribute("aria-live", "polite");
    }
  }

  function start() {
    if (!pick()) return;
    decorate();
    // 点击模式按钮后 React 更新 is-active，靠 observer 同步 aria
    var mo = new MutationObserver(function () { decorate(); });
    mo.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(start, 60); });
  } else {
    setTimeout(start, 60);
  }
})();
