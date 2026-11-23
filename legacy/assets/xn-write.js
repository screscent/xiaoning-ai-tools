/* xn-write.js · 文案与写作结构速查合集 人用友好增强（幂等） */
(function () {
  if (window.__XN_WRITE__) return;
  window.__XN_WRITE__ = 1;

  var root = function () { return document.querySelector("#root"); };
  var norm = function (s) { return (s || "").replace(/\s+/g, " ").trim(); };

  function markTabs() {
    var r = root(); if (!r) return;
    var tabs = [].slice.call(r.querySelectorAll('a[href^="#/"]')).filter(function (a) {
      return !a.querySelector("img");
    });
    if (!tabs.length) return;
    var hash = (location.hash || "").replace(/\/+$/, "");
    var match = null;
    tabs.forEach(function (a) { if (a.getAttribute("href") === hash) match = a; });
    if (!match) match = tabs[0];
    tabs.forEach(function (a) {
      if (a === match) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  function normalizeH2() {
    var r = root(); if (!r) return;
    r.querySelectorAll("section h2").forEach(function (h) {
      if (h.dataset.wrNorm) return;
      var txt = norm(h.textContent);
      var m = txt.match(/^工具\s*([A-Z])\s*[·:：]?\s*(.*)$/);
      if (m) {
        var n = m[1].charCodeAt(0) - 64;
        h.textContent = "工具 " + String(n).padStart(2, "0") + " · " + m[2];
      }
      h.dataset.wrNorm = "1";
    });
  }

  function decorate() {
    var r = root(); if (!r) return;
    /* 行内复制图标按钮：把泛化的 aria 补成具名「复制标题」 */
    r.querySelectorAll("button.size-7").forEach(function (b) {
      var aria = b.getAttribute("aria-label");
      if (aria && aria !== "复制" && aria.length > 2) return;
      b.setAttribute("aria-label", "复制标题");
    });
    /* 示例标题行 13.5 */
    r.querySelectorAll("div").forEach(function (d) {
      if (d.children.length === 0) return;
      if (d.querySelector("button.size-7") && norm(d.textContent).length > 6) d.classList.add("px-title-row");
    });
  }

  function run() { markTabs(); normalizeH2(); decorate(); }

  function start() {
    run();
    window.addEventListener("hashchange", function () { setTimeout(run, 120); });
    var r = root();
    if (r && !window.__XN_WRITE_OBS__) {
      window.__XN_WRITE_OBS__ = 1;
      var t = null;
      new MutationObserver(function () {
        if (t) return;
        t = setTimeout(function () { t = null; run(); }, 130);
      }).observe(r, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
