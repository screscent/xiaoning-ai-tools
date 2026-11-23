/* xn-httpdoc.js · HTTP 合集：tab 当前态 / 开关 aria-pressed / 搜索 aria / 胶囊打标（幂等） */
(function () {
  if (window.__XN_HTTPDOC__) return;
  window.__XN_HTTPDOC__ = 1;

  var root = null;

  function pick() {
    root = document.querySelector("#root");
    return !!root;
  }

  function syncTabs() {
    if (!root) return;
    var hash = location.hash || "#/status";
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
      var text = (b.textContent || "").replace(/\s+/g, " ").trim();
      // 开关式筛选：文案固定，状态在内部 span 的 font-medium / text-gray-900
      if (/^显示英文名称$|^显示排查建议$/.test(text)) {
        if (!b.classList.contains("px-toggle")) b.classList.add("px-toggle");
        var span = b.querySelector("span");
        var on = !!(span && /font-medium|text-gray-900/.test(span.className));
        var want = on ? "true" : "false";
        if (b.getAttribute("aria-pressed") !== want) b.setAttribute("aria-pressed", want);
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", text);
        continue;
      }
      if (!b.getAttribute("aria-label") && text) b.setAttribute("aria-label", text);
    }
    // 搜索框 aria：用 placeholder 兜底
    var inputs = root.querySelectorAll('input[type="text"]');
    for (var j = 0; j < inputs.length; j++) {
      var inp = inputs[j];
      if (!inp.getAttribute("aria-label") && inp.placeholder) inp.setAttribute("aria-label", inp.placeholder);
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
