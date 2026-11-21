/* R1182 常用单位换算合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnConv) return;
  window.__xnConv = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var HAS = function (el, cls) { return new RegExp("(^|\\s)" + cls + "(\\s|$)").test(el.className || ""); };
  var ALL = function (sel) { return [].slice.call(document.querySelectorAll("#root " + sel)); };

  var TAB = /^(长度|重量|面积体积|温度压力|数据与带宽换算|速度配速)$/;

  /* 1) 去内部代号「工具F」 */
  function cleanCodeNames() {
    var walker = document.createTreeWalker(document.querySelector("#root"), NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (n) {
      var v = n.nodeValue;
      if (!v || !/工具\s*[A-Z]/.test(v)) return;
      var next = v.replace(/^\s*工具\s*[A-Z]\s*[·:：\-—]?\s*/, "");
      if (next !== v) n.nodeValue = next;
    });
  }

  /* 2) 页面底色（纯 CSS 柔光 + 点阵） */
  function page() {
    var el = document.querySelector("#root .min-h-screen");
    if (el) el.classList.add("xn-conv-page");
  }

  /* 3) 分类页签 38 → 44 */
  function tabs() {
    var list = ALL("nav button").filter(function (b) { return VIS(b) && TAB.test(TXT(b)); });
    if (!list.length) return;
    var nav = list[0].closest("nav");
    if (nav) {
      nav.classList.add("xn-conv-nav");
      nav.setAttribute("aria-label", "单位分类快速跳转");
    }
    list.forEach(function (b) {
      b.classList.add("xn-conv-tab");
      b.setAttribute("type", "button");
      if (!b.getAttribute("aria-current") && /(^|\s)bg-blue-600(\s|$)/.test(b.className)) {
        b.setAttribute("aria-current", "true");
      }
    });
  }

  /* 4) 下拉 / 数字输入 */
  function fields() {
    ALL("select").forEach(function (s) {
      s.classList.add("xn-conv-field");
      if (getComputedStyle(s).fontSize !== "16px") s.style.setProperty("font-size", "16px", "important");
      s.style.setProperty("min-height", "48px", "important");
    });
    ALL("input[type=number]").forEach(function (i) {
      i.classList.add("xn-conv-field");
      i.style.setProperty("font-size", "16px", "important");
      i.style.setProperty("min-height", "48px", "important");
    });
  }

  /* 5) 精度分段：40 → 44，radio 语义（规避 aria-pressed 白块） */
  function precision() {
    var chips = ALL("button").filter(function (b) { return VIS(b) && /^[024]\s*位$/.test(TXT(b)); });
    chips.forEach(function (b) {
      b.classList.add("xn-conv-chip");
      b.removeAttribute("aria-pressed");
      b.setAttribute("role", "radio");
      var on = HAS(b, "bg-blue-600") && HAS(b, "text-white");
      b.setAttribute("aria-checked", on ? "true" : "false");
      b.setAttribute("tabindex", on ? "0" : "-1");
      var group = b.parentElement;
      if (group && !group.getAttribute("role")) {
        group.setAttribute("role", "radiogroup");
        group.setAttribute("aria-label", "精度");
      }
    });
  }

  /* 6) 交换 / 复制按钮 40 → 44 */
  function actions() {
    ALL("button").forEach(function (b) {
      if (!VIS(b)) return;
      if (/^(交换单位|复制结果)$/.test(TXT(b))) b.classList.add("xn-conv-action");
    });
  }

  /* 7) 结果卡 / 对照表 / 换算控件网格 */
  function layout() {
    ALL("div").forEach(function (d) {
      var c = d.className || "";
      if (/bg-gradient-to-r/.test(c) && /from-blue-600/.test(c)) d.classList.add("xn-conv-result");
      if (/grid-cols-1/.test(c) && /md:grid-cols-4/.test(c) && d.children.length >= 4) d.classList.add("xn-conv-grid");
      if (/grid-cols-2/.test(c) && /sm:grid-cols-4/.test(c)) { d.classList.add("xn-conv-ref", "xn-conv-ref4"); return; }
      if (/grid-cols-\[3rem_1fr_1fr\]/.test(c)) d.classList.add("xn-conv-ref", "xn-conv-rowref");
    });
  }

  function run() {
    cleanCodeNames();
    page();
    tabs();
    fields();
    precision();
    actions();
    layout();
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
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "aria-current", "aria-checked"] });
  setTimeout(run, 250);
  setTimeout(run, 700);
  setTimeout(run, 1600);
})();
