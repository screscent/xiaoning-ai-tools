/* xn-invest.js · 复利与定投合集：快捷卡片当前区位 + 焦点/语义增强（幂等） */
(function () {
  if (window.__XN_INVEST__) return;
  window.__XN_INVEST__ = 1;

  var root = null;
  var navs = [];
  var sections = [];
  var raf = 0;

  function pick() {
    root = document.querySelector("#root");
    if (!root) return false;
    navs = Array.prototype.slice.call(root.querySelectorAll('a[href^="#/"]'));
    sections = Array.prototype.slice.call(root.querySelectorAll("section")).filter(function (s) {
      return s.querySelector("h2");
    });
    return navs.length > 0;
  }

  function setActive(idx) {
    navs.forEach(function (a, i) {
      var on = i === idx;
      if (on) {
        if (!a.classList.contains("px-nav-active")) a.classList.add("px-nav-active");
        if (a.getAttribute("aria-current") !== "true") a.setAttribute("aria-current", "true");
      } else {
        if (a.classList.contains("px-nav-active")) a.classList.remove("px-nav-active");
        if (a.hasAttribute("aria-current")) a.removeAttribute("aria-current");
      }
    });
  }

  function compute() {
    raf = 0;
    if (!navs.length || !sections.length) return;
    var offset = Math.max(160, Math.round(window.innerHeight * 0.35));
    var idx = -1;
    for (var i = 0; i < sections.length && i < navs.length; i++) {
      var top = sections[i].getBoundingClientRect().top;
      if (top - offset <= 0) idx = i;
      else break;
    }
    setActive(idx);
  }

  function schedule() {
    if (raf) return;
    raf = requestAnimationFrame(compute);
  }

  function normalizeIndex() {
    if (!root) return;
    var secs = Array.prototype.slice.call(root.querySelectorAll("section")).filter(function (s) { return s.querySelector("h2"); });
    secs.forEach(function (s, i) {
      var span = s.querySelector('span[class*="font-mono"]');
      if (!span) return;
      var t = (span.textContent || "").trim();
      // 页面内置了「工具E/工具F」占位编号，统一归一为 01..06
      if (/^工具[A-Z]$/.test(t) || /^\d{1,2}$/.test(t)) {
        var want = String(i + 1).padStart(2, "0");
        if (t !== want) span.textContent = want;
      }
    });
  }

  function ensureAria() {
    if (!root) return;
    normalizeIndex();
    // 计算按钮补 aria-label（文案即说明），下拉/输入已有 aria-label 时不重复
    var btns = root.querySelectorAll("section button");
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      if (!b.getAttribute("aria-label")) {
        var t = (b.textContent || "").replace(/\s+/g, " ").trim();
        if (t) b.setAttribute("aria-label", t);
      }
    }
    // 结果数值区语义：aria-live 让读屏播报
    var res = root.querySelectorAll('div[class*="mt-1.5"][class*="font-bold"]');
    for (var j = 0; j < res.length; j++) {
      var el = res[j];
      if (el.getAttribute("data-xn-live") === "1") continue;
      var box = el.parentElement;
      if (box && !box.getAttribute("aria-live")) box.setAttribute("aria-live", "polite");
      el.setAttribute("data-xn-live", "1");
    }
  }

  function boot() {
    if (!pick()) return;
    ensureAria();
    compute();
  }

  function onScroll() { schedule(); }

  function start() {
    boot();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("hashchange", function () {
      schedule();
      setTimeout(schedule, 260);
      setTimeout(schedule, 700);
      setTimeout(schedule, 1300);
    });
    window.addEventListener("resize", schedule);
    if ("onscrollend" in window) window.addEventListener("scrollend", schedule);
    var mo = new MutationObserver(function () {
      ensureAria();
      schedule();
    });
    if (root) mo.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(start, 60); });
  } else {
    setTimeout(start, 60);
  }
})();
