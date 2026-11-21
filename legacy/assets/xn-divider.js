/* R1191 SVG 分割线生成合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnDivider) return;
  window.__xnDivider = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var HAS = function (el, cls) { return new RegExp("(^|\\s)" + cls + "(\\s|$)").test(el.className || ""); };
  var ALL = function (sel) { return [].slice.call(document.querySelectorAll("#root " + sel)); };

  /* 1) 页面柔光 */
  function page() {
    var el = document.querySelector("#root .min-h-screen");
    if (el) el.classList.add("xn-divider-page");
  }

  /* 2) 页签 37 → 44 + aria */
  function tabs() {
    var list = ALL("button").filter(function (b) { return VIS(b) && /^(波浪线|斜切线)$/.test(TXT(b)); });
    list.forEach(function (b) {
      b.classList.add("xn-divider-tab");
      b.setAttribute("role", "tab");
      var on = HAS(b, "text-white") && /bg-(slate|gray|zinc)-9/.test(b.className || "");
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  /* 3) 开关 / 按钮 */
  function controls() {
    ALL("button").forEach(function (b) {
      if (!VIS(b)) return;
      if (/w-11/.test(b.className || "")) {
        b.classList.add("xn-divider-switch");
        if (!b.getAttribute("role")) b.setAttribute("role", "switch");
        return;
      }
      var v = TXT(b);
      if (/^(复制 SVG|下载 \.svg|重置默认)$/.test(v)) b.classList.add("xn-divider-action");
      else if (v.length <= 3 && (/复制/.test(b.getAttribute("aria-label") || "") || /^复制$/.test(v))) b.classList.add("xn-divider-copy");
    });
  }

  function run() {
    page();
    tabs();
    controls();
  }

  var timer = null;
  function schedule() {
    if (timer) return;
    timer = setTimeout(function () { timer = null; run(); }, 90);
  }

  document.addEventListener("click", schedule, true);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule);
  else schedule();
  window.addEventListener("load", schedule);
  var mo = new MutationObserver(schedule);
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  setTimeout(run, 250);
  setTimeout(run, 700);
  setTimeout(run, 1600);
})();
