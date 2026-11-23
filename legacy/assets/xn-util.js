/* xn-util.js · 水电燃气账单计算合集 人用友好增强（幂等） */
(function () {
  if (window.__XN_UTIL__) return;
  window.__XN_UTIL__ = 1;

  var root = function () { return document.querySelector("#root"); };
  var norm = function (s) { return (s || "").replace(/\s+/g, " ").trim(); };

  function normalizeH2() {
    var r = root(); if (!r) return;
    r.querySelectorAll("section h2").forEach(function (h) {
      if (h.dataset.utNorm) return;
      var txt = norm(h.textContent);
      var m = txt.match(/^工具\s*([A-Z])\s*[·:：]?\s*(.*)$/);
      if (m) {
        var n = m[1].charCodeAt(0) - 64;
        h.textContent = "工具 " + String(n).padStart(2, "0") + " · " + m[2];
      }
      h.dataset.utNorm = "1";
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
      a.classList.remove("border-blue-600");
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
      if (/^计算/.test(norm(b.textContent))) b.classList.add("px-primary");
    });
    /* 结果合计 */
    r.querySelectorAll("section .text-3xl.font-bold").forEach(function (e) {
      if (!e.classList.contains("px-total")) e.classList.add("px-total");
    });
    /* 结果面板 */
    r.querySelectorAll("section div.rounded-lg.border").forEach(function (d) {
      if (d.querySelector(".text-3xl")) d.classList.add("px-result");
    });
    /* 分档行 */
    r.querySelectorAll("section .flex.flex-wrap.items-baseline.justify-between").forEach(function (d) {
      d.classList.add("px-tier-row");
    });
    /* 空状态 */
    r.querySelectorAll("section div").forEach(function (d) {
      if (d.classList.contains("px-empty")) return;
      if (d.children.length) return;
      var txt = norm(d.textContent);
      if (!txt || txt.length > 40) return;
      if (/^填写.*计算/.test(txt)) d.classList.add("px-empty");
    });
  }

  function run() { normalizeH2(); markNav(); decorate(); }

  function start() {
    run();
    window.addEventListener("hashchange", markNav);
    var r = root();
    if (r && !window.__XN_UTIL_OBS__) {
      window.__XN_UTIL_OBS__ = 1;
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
