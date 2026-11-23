/* xn-step.js · 步数与活动目标合集 人用友好增强（幂等，覆盖菜单与工具视图） */
(function () {
  if (window.__XN_STEP__) return;
  window.__XN_STEP__ = 1;

  var root = function () { return document.querySelector("#root"); };
  var norm = function (s) { return (s || "").replace(/\s+/g, " ").trim(); };

  function decorateCards() {
    var r = root(); if (!r) return;
    r.querySelectorAll('a[href^="#/"]').forEach(function (a) {
      if (/px-back/.test(a.className)) return;
      if (/rounded-xl|shadow/.test(a.className) && /block/.test(a.className)) a.classList.add("px-card");
    });
  }

  function decorateBack() {
    var r = root(); if (!r) return;
    r.querySelectorAll("a").forEach(function (a) {
      if (/返回/.test(norm(a.textContent))) {
        a.classList.add("px-back");
        if (!a.getAttribute("aria-label")) a.setAttribute("aria-label", norm(a.textContent));
      }
    });
  }

  function decorateButtons() {
    var r = root(); if (!r) return;
    r.querySelectorAll("button").forEach(function (b) {
      if (/计算/.test(norm(b.textContent))) b.classList.add("px-primary");
    });
  }

  function decorateMetrics() {
    var r = root(); if (!r) return;
    r.querySelectorAll(".text-2xl.font-bold.text-gray-900, .text-2xl.font-bold").forEach(function (e) {
      if (e.classList.contains("px-metric")) return;
      if (/^(H1|H2)$/.test(e.tagName)) return;
      var txt = norm(e.textContent);
      if (!txt || !/\d/.test(txt)) return;
      if (txt.length > 16) return;
      e.classList.add("px-metric");
    });
  }

  function run() { decorateCards(); decorateBack(); decorateButtons(); decorateMetrics(); }

  function start() {
    run();
    window.addEventListener("hashchange", function () { setTimeout(run, 120); });
    var r = root();
    if (r && !window.__XN_STEP_OBS__) {
      window.__XN_STEP_OBS__ = 1;
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
