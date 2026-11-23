/* xn-money.js · 单价与多规格比价合集 人用友好增强（幂等） */
(function () {
  if (window.__XN_MONEY__) return;
  window.__XN_MONEY__ = 1;

  var root = function () { return document.querySelector("#root"); };
  var norm = function (s) { return (s || "").replace(/\s+/g, " ").trim(); };

  /* 标题归一：工具E/F → 工具 05/06 */
  function normalizeH2() {
    var r = root(); if (!r) return;
    r.querySelectorAll("section h2").forEach(function (h) {
      if (h.dataset.pxNorm) return;
      var txt = norm(h.textContent);
      var m = txt.match(/^工具\s*([A-Z])\s*[·:：]?\s*(.*)$/);
      if (m) {
        var n = m[1].charCodeAt(0) - 64;
        h.textContent = "工具 " + String(n).padStart(2, "0") + " · " + m[2];
      }
      h.dataset.pxNorm = "1";
    });
  }

  /* 导航激活：按 hash 同步（不依赖页面自身 class 时序） */
  function markNav() {
    var r = root(); if (!r) return;
    var links = [].slice.call(r.querySelectorAll("nav a"));
    if (!links.length) return;
    var hash = (location.hash || "").replace(/\/+$/, "");
    var match = null;
    links.forEach(function (a) { if (a.getAttribute("href") === hash) match = a; });
    if (!match) { links.forEach(function (a) { if (/bg-blue-600/.test(a.className || "")) match = a; }); }
    if (!match) match = links[0];
    links.forEach(function (a) {
      a.classList.remove("bg-blue-600");
      a.classList.remove("text-white");
      var on = a === match;
      a.classList.toggle("px-active", on);
      if (on) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  function decorate() {
    var r = root(); if (!r) return;
    r.querySelectorAll("section button").forEach(function (b) {
      var txt = norm(b.textContent);
      if (txt === "计算") { b.classList.add("px-primary"); return; }
      if (/复制结果|添加记录|清空记录/.test(txt)) b.classList.add("px-sub");
    });
    r.querySelectorAll("section div.rounded-lg.border").forEach(function (d) {
      if (d.querySelector(".text-lg")) d.classList.add("px-metric");
    });
    r.querySelectorAll("section div.bg-yellow-50").forEach(function (d) { d.classList.add("px-concl"); });
    r.querySelectorAll("section div.font-mono.text-xs").forEach(function (d) { d.classList.add("px-formula"); });
    /* 空状态占位 */
    r.querySelectorAll("section div").forEach(function (d) {
      if (d.classList.contains("px-empty")) return;
      if (d.children.length) return;
      var txt = norm(d.textContent);
      if (!txt || txt.length > 40) return;
      if (/填写.*点击.*计算|暂无记录|填写商品名/.test(txt)) d.classList.add("px-empty");
    });
  }

  function run() { normalizeH2(); markNav(); decorate(); }

  function start() {
    run();
    window.addEventListener("hashchange", markNav);
    var r = root();
    if (r && !window.__XN_MONEY_OBS__) {
      window.__XN_MONEY_OBS__ = 1;
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
