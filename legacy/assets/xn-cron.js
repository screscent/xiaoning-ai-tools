/* xn-cron.js · Cron 合集：tab 当前态 / 占位编号归一 / 示例 chip / aria 补全（幂等） */
(function () {
  if (window.__XN_CRON__) return;
  window.__XN_CRON__ = 1;

  var root = null;

  function pick() {
    root = document.querySelector("#root");
    return !!root;
  }

  function syncTabs() {
    if (!root) return;
    var hash = location.hash || "#/parse";
    var tabs = root.querySelectorAll('a[href^="#/"]');
    for (var i = 0; i < tabs.length; i++) {
      var a = tabs[i];
      if (a.getAttribute("href") === hash) {
        if (a.getAttribute("aria-current") !== "page") a.setAttribute("aria-current", "page");
      } else if (a.hasAttribute("aria-current")) {
        a.removeAttribute("aria-current");
      }
    }
  }

  function normalizeHeading() {
    if (!root) return;
    var h2s = root.querySelectorAll("h2");
    for (var i = 0; i < h2s.length; i++) {
      var h = h2s[i];
      var t = (h.textContent || "").trim();
      // 页面内置「工具F 批量表达式体检」占位编号 → ⑥
      if (/^工具[A-Z]\s*/.test(t)) {
        h.textContent = t.replace(/^工具[A-Z]\s*/, "⑥ ");
      }
    }
  }

  function decorate() {
    if (!root) return;
    normalizeHeading();
    var btns = root.querySelectorAll("button");
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      var text = (b.textContent || "").replace(/\s+/g, " ").trim();
      if (!text) continue;
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", text);
      if (!b.classList.contains("px-chip")) {
        var fs = parseFloat(getComputedStyle(b).fontSize) || 16;
        if (fs <= 12.5 && text.length > 4) b.classList.add("px-chip");
      }
    }
  }

  function start() {
    if (!pick()) return;
    decorate();
    syncTabs();
    window.addEventListener("hashchange", function () {
      setTimeout(function () { decorate(); syncTabs(); }, 60);
      setTimeout(syncTabs, 300);
    });
    var mo = new MutationObserver(function () { decorate(); syncTabs(); });
    mo.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(start, 60); });
  } else {
    setTimeout(start, 60);
  }
})();
