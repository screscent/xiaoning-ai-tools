/* xn-data.js · CSV 与 JSON 转换合集 人用友好增强（幂等） */
(function () {
  if (window.__XN_DATA__) return;
  window.__XN_DATA__ = 1;

  var root = function () { return document.querySelector("#root"); };
  var norm = function (s) { return (s || "").replace(/\s+/g, " ").trim(); };

  function normalizeH2() {
    var r = root(); if (!r) return;
    r.querySelectorAll("section h2").forEach(function (h) {
      if (h.dataset.dtNorm) return;
      var txt = norm(h.textContent);
      var m = txt.match(/^工具\s*([A-Z])\s*[·:：]?\s*(.*)$/);
      if (m) {
        var n = m[1].charCodeAt(0) - 64;
        h.textContent = "工具 " + String(n).padStart(2, "0") + " · " + m[2];
      }
      h.dataset.dtNorm = "1";
    });
  }

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
      if (txt === "填入示例") { b.classList.add("px-link"); if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "填入示例数据"); return; }
      if (txt === "清空") { b.classList.add("px-mini"); if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "清空输入"); return; }
      if (txt === "复制") { b.classList.add("px-mini"); if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "复制结果"); return; }
    });
    /* 指标：行数 / 列数 */
    r.querySelectorAll("section .text-xl.font-bold").forEach(function (v) {
      if (!v.classList.contains("px-metric-val")) v.classList.add("px-metric-val");
      var sib = v.nextElementSibling;
      if (sib && !sib.classList.contains("px-metric-label")) sib.classList.add("px-metric-label");
    });
    /* 空状态占位 */
    r.querySelectorAll("section div, section p").forEach(function (d) {
      if (d.classList.contains("px-empty")) return;
      if (d.children.length) return;
      var txt = norm(d.textContent);
      if (!txt || txt.length > 24) return;
      if (/^请输入|^暂无|^无数据/.test(txt)) d.classList.add("px-empty");
    });
  }

  function run() { normalizeH2(); markNav(); decorate(); }

  function start() {
    run();
    window.addEventListener("hashchange", markNav);
    var r = root();
    if (r && !window.__XN_DATA_OBS__) {
      window.__XN_DATA_OBS__ = 1;
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
