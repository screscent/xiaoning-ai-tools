/* xn-radix.js · 数字进制转换合集：tab 当前态 / 图标按钮 aria / 示例 chip 打标（幂等） */
(function () {
  if (window.__XN_RADIX__) return;
  window.__XN_RADIX__ = 1;

  var root = null;

  function pick() {
    root = document.querySelector("#root");
    return !!root;
  }

  function syncTabs() {
    if (!root) return;
    var hash = location.hash || "#/radix";
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

  function decorate() {
    if (!root) return;
    var btns = root.querySelectorAll("button");
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      var text = (b.textContent || "").trim();
      var title = b.getAttribute("title");
      // 图标按钮：无文本 + 有 title → aria 具名 + px-icon
      if (!text && title) {
        if (!b.classList.contains("px-icon")) b.classList.add("px-icon");
        if (b.getAttribute("aria-label") !== title) b.setAttribute("aria-label", title);
        continue;
      }
      // 示例快捷 chip：文本型且字号 ≤12.5
      if (text && !b.classList.contains("px-chip")) {
        var fs = parseFloat(getComputedStyle(b).fontSize) || 16;
        if (fs <= 12.5) b.classList.add("px-chip");
      }
      if (!b.getAttribute("aria-label") && text) b.setAttribute("aria-label", text);
    }
  }

  function boot() {
    if (!pick()) return;
    decorate();
    syncTabs();
  }

  function start() {
    boot();
    window.addEventListener("hashchange", function () {
      setTimeout(function () { decorate(); syncTabs(); }, 60);
      setTimeout(syncTabs, 400);
    });
    var mo = new MutationObserver(function () {
      decorate();
      syncTabs();
    });
    if (root) mo.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(start, 60); });
  } else {
    setTimeout(start, 60);
  }
})();
