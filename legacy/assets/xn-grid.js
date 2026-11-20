/* R1131 CSS 表格样式与斑马纹合集 — 人用友好增强（幂等，不碰 React 状态） */
(function () {
  "use strict";
  if (window.__xnGrid) return;
  window.__xnGrid = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  var BTNS = function () { return [].slice.call(document.querySelectorAll("#root button")); };

  /* 页签 */
  function tabs() {
    var btns = BTNS().filter(function (b) {
      var s = TXT(b);
      return (s === "表格样式" || s === "斑马纹预设") && VIS(b);
    });
    if (btns.length < 2) return;
    var box = btns[0].parentElement;
    if (box && box.getAttribute("data-xn-grid-tabs") !== "1") {
      box.setAttribute("data-xn-grid-tabs", "1");
      box.setAttribute("role", "tablist");
      box.setAttribute("aria-label", "表格工具");
    }
    btns.forEach(function (b) {
      var active = /(^|\s)bg-indigo-600(\s|$)/.test(b.className) || /(^|\s)bg-slate-900(\s|$)/.test(b.className);
      b.classList.add("xn-grid-tab");
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", active ? "true" : "false");
      if (active) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    });
  }

  /* 斑马纹开关：空文本 + w-11 h-6 轨道 */
  function switches() {
    BTNS().forEach(function (b) {
      if (TXT(b)) return;
      if (!/(^|\s)w-11(\s|$)/.test(b.className) || !/(^|\s)h-6(\s|$)/.test(b.className)) return;
      var on = /(^|\s)bg-indigo-500(\s|$)/.test(b.className);
      b.classList.add("xn-grid-switch");
      b.setAttribute("role", "switch");
      b.setAttribute("aria-checked", on ? "true" : "false");
      b.setAttribute("aria-label", "斑马纹");
      b.setAttribute("title", "斑马纹：" + (on ? "开" : "关") + "（点击切换）");
    });
  }

  /* 按钮层级 */
  function actions() {
    var cssBtns = BTNS().filter(function (b) { return TXT(b) === "复制 CSS"; });
    BTNS().forEach(function (b) {
      if (!VIS(b)) return;
      var s = TXT(b);
      if (s === "复制 CSS") {
        b.classList.add("xn-grid-primary");
        var name = "";
        if (cssBtns.length > 1) {
          var card = b.closest("div.bg-white.rounded-xl");
          if (card && card.firstElementChild) name = TXT(card.firstElementChild).replace(/\s*复制 CSS$/, "").slice(0, 16);
        }
        b.setAttribute("aria-label", name ? "复制「" + name + "」的 CSS" : "复制生成的 CSS 到剪贴板");
      } else if (s === "复制 HTML") {
        b.classList.add("xn-grid-secondary");
        b.setAttribute("aria-label", "复制 HTML 结构到剪贴板");
      } else if (s === "重置默认") {
        b.classList.add("xn-grid-ghost");
        b.setAttribute("aria-label", "恢复默认表格样式");
      }
    });
  }

  /* 标题去 ①–⑩ 序号 */
  function headings() {
    [].slice.call(document.querySelectorAll("#root h2")).forEach(function (h) {
      for (var i = 0; i < h.childNodes.length; i++) {
        var n = h.childNodes[i];
        if (n.nodeType === 3) {
          var v = n.nodeValue.replace(/^[\s\u2460-\u2469]+/, "");
          if (v !== n.nodeValue) n.nodeValue = v;
          break;
        }
      }
    });
  }

  function run() {
    tabs();
    switches();
    actions();
    headings();
  }

  var timer = null;
  function schedule() {
    if (timer) return;
    timer = setTimeout(function () { timer = null; run(); }, 90);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule);
  else schedule();
  window.addEventListener("load", schedule);
  var mo = new MutationObserver(schedule);
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  setTimeout(run, 700);
  setTimeout(run, 1600);
})();
