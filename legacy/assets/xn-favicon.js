/* xn-favicon.js · Favicon 合集：入口卡滚动高亮 / 标题编号归一 / 小按钮与 emoji 打标（幂等） */
(function () {
  if (window.__XN_FAVICON__) return;
  window.__XN_FAVICON__ = 1;

  var root = null;
  var navs = [];
  var secs = [];
  var raf = 0;
  var NUM = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧"];

  function pick() {
    root = document.querySelector("#root");
    if (!root) return false;
    navs = Array.prototype.slice.call(root.querySelectorAll('a[href^="#/"]'));
    secs = Array.prototype.slice.call(root.querySelectorAll("section"));
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
    var list = secs.filter(function (s) { return s.querySelector("h2"); });
    if (!list.length || !navs.length) return;
    var marker = Math.max(160, Math.round(window.innerHeight * 0.35));
    var idx = -1;
    for (var i = 0; i < list.length && i < navs.length; i++) {
      if (list[i].getBoundingClientRect().top - marker <= 0) idx = i;
      else break;
    }
    setActive(idx);
  }

  function schedule() {
    if (raf) return;
    raf = requestAnimationFrame(compute);
  }

  function normalizeHeadings() {
    if (!root) return;
    var list = Array.prototype.slice.call(root.querySelectorAll("section")).filter(function (s) { return s.querySelector("h2"); });
    list.forEach(function (s, i) {
      var h = s.querySelector("h2");
      var t = (h.textContent || "").trim();
      var want = (NUM[i] || (i + 1)) + t.replace(/^[①②③④⑤⑥⑦⑧⑨⑩]/, "").trim();
      if (t !== want) h.textContent = want;
    });
  }

  function decorate() {
    if (!root) return;
    normalizeHeadings();
    var btns = root.querySelectorAll("button");
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      var text = (b.textContent || "").replace(/\s+/g, " ").trim();
      var fs = parseFloat(getComputedStyle(b).fontSize) || 16;
      if (/^复制$|^恢复默认$/.test(text)) {
        if (!b.classList.contains("px-mini")) b.classList.add("px-mini");
      }
      // Emoji 快捷按钮：单字符/emoji，字号 ≥16
      if (text.length <= 3 && fs >= 16 && !/^[\w\u4e00-\u9fa5]/.test(text)) {
        if (!b.classList.contains("px-emoji")) b.classList.add("px-emoji");
      }
      if (!b.getAttribute("aria-label") && text) b.setAttribute("aria-label", text);
    }
  }

  function start() {
    if (!pick()) return;
    decorate();
    compute();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    if ("onscrollend" in window) window.addEventListener("scrollend", schedule);
    window.addEventListener("hashchange", function () {
      schedule(); setTimeout(schedule, 300); setTimeout(schedule, 900);
    });
    var mo = new MutationObserver(function () { decorate(); schedule(); });
    mo.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(start, 60); });
  } else {
    setTimeout(start, 60);
  }
})();
