/* xn-flex.js · Flex 与 Grid 布局合集 人用友好增强（幂等） */
(function () {
  if (window.__XN_FLEX__) return;
  window.__XN_FLEX__ = 1;

  var root = function () { return document.querySelector("#root"); };
  var norm = function (s) { return (s || "").replace(/\s+/g, " ").trim(); };

  function decorateModes() {
    var r = root(); if (!r) return;
    r.querySelectorAll("button").forEach(function (b) {
      var txt = norm(b.textContent);
      if (!/^(Flex布局|Grid网格)$/.test(txt)) return;
      b.classList.add("px-mode");
      var on = /bg-indigo-600|bg-indigo-500/.test(b.className || "");
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function decorateButtons() {
    var r = root(); if (!r) return;
    r.querySelectorAll("section button").forEach(function (b) {
      if (b.classList.contains("px-mode")) return;
      if (/bg-indigo-600|bg-indigo-500/.test(b.className || "")) {
        b.classList.add("px-primary");
      } else {
        var txt = norm(b.textContent);
        if (/复制|下载|重置/.test(txt)) b.classList.add("px-sub");
      }
    });
  }

  function ensureAria() {
    var r = root(); if (!r) return;
    r.querySelectorAll("section button").forEach(function (b) {
      if (!b.getAttribute("aria-label")) {
        var txt = norm(b.textContent);
        if (txt) b.setAttribute("aria-label", txt);
      }
    });
  }

  function run() { decorateModes(); decorateButtons(); ensureAria(); }

  function start() {
    run();
    var r = root();
    if (r && !window.__XN_FLEX_OBS__) {
      window.__XN_FLEX_OBS__ = 1;
      var t = null;
      new MutationObserver(function () {
        if (t) return;
        t = setTimeout(function () { t = null; run(); }, 120);
      }).observe(r, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
