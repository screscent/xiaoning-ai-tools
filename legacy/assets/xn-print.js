/* xn-print.js · 打印尺寸与证件照换算合集 人用友好增强（幂等） */
(function () {
  if (window.__XN_PRINT__) return;
  window.__XN_PRINT__ = 1;

  var root = function () { return document.querySelector("#root"); };
  var norm = function (s) { return (s || "").replace(/\s+/g, " ").trim(); };

  function decorateModes() {
    var r = root(); if (!r) return;
    r.querySelectorAll("button").forEach(function (b) {
      var txt = norm(b.textContent);
      if (!/打印尺寸|证件照尺寸/.test(txt)) return;
      if (txt.length > 12) return;
      b.classList.add("px-mode");
      var on = /bg-indigo-600|bg-indigo-500/.test(b.className || "");
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function decorateButtons() {
    var r = root(); if (!r) return;
    r.querySelectorAll("section button").forEach(function (b) {
      var txt = norm(b.textContent);
      if (txt === "换算") { b.classList.add("px-primary"); return; }
      if (/复制结果|清空/.test(txt)) b.classList.add("px-sub");
    });
  }

  function decorateNumbers() {
    var r = root(); if (!r) return;
    /* 结果数值（可能含单位子元素，如 2480 × 3508<span>px</span>） */
    r.querySelectorAll("section p.font-mono, section p.text-xl, section p.sm\\:text-2xl").forEach(function (e) {
      if (e.classList.contains("px-num")) return;
      var txt = norm(e.textContent);
      if (!txt || !/\d/.test(txt)) return;
      if (parseFloat(getComputedStyle(e).fontSize) < 18) return;
      e.classList.add("px-num");
    });
    /* 其余大号纯数字叶子 */
    r.querySelectorAll("section p, section div, section span").forEach(function (e) {
      if (e.children.length) return;
      if (e.classList.contains("px-num")) return;
      if (/^(H1|H2|H3)$/.test(e.tagName)) return;
      var txt = norm(e.textContent);
      if (!txt || txt.length > 24) return;
      if (parseFloat(getComputedStyle(e).fontSize) < 20) return;
      if (!/\d/.test(txt)) return;
      e.classList.add("px-num");
    });
  }

  function run() { decorateModes(); decorateButtons(); decorateNumbers(); }

  function start() {
    run();
    var r = root();
    if (r && !window.__XN_PRINT_OBS__) {
      window.__XN_PRINT_OBS__ = 1;
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
