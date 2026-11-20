/* R1132 按钮样式与幽灵按钮合集 — 人用友好增强（幂等，不碰 React 状态） */
(function () {
  "use strict";
  if (window.__xnBtn) return;
  window.__xnBtn = true;

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
      return (s === "按钮样式" || s === "幽灵按钮") && VIS(b);
    });
    if (btns.length < 2) return;
    var box = btns[0].parentElement;
    if (box && box.getAttribute("data-xn-btn-tabs") !== "1") {
      box.setAttribute("data-xn-btn-tabs", "1");
      box.setAttribute("role", "tablist");
      box.setAttribute("aria-label", "按钮工具");
    }
    btns.forEach(function (b) {
      var active = /(^|\s)(bg-blue-500|bg-blue-600|bg-indigo-500|bg-indigo-600|bg-slate-900)(\s|$)/.test(b.className);
      b.classList.add("xn-btn-tab");
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", active ? "true" : "false");
      if (active) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    });
  }

  /* 投影开关 */
  function switches() {
    BTNS().forEach(function (b) {
      var aria = b.getAttribute("aria-label") || "";
      if (aria.indexOf("投影") < 0) return;
      var on = /(^|\s)bg-blue-500(\s|$)/.test(b.className) || /(^|\s)bg-indigo-500(\s|$)/.test(b.className);
      b.classList.add("xn-btn-switch");
      b.setAttribute("role", "switch");
      b.setAttribute("aria-checked", on ? "true" : "false");
      b.setAttribute("aria-label", "投影");
      b.setAttribute("title", "投影：" + (on ? "开" : "关") + "（点击切换）");
    });
  }

  /* 按钮层级 */
  function actions() {
    BTNS().forEach(function (b) {
      if (!VIS(b)) return;
      var s = TXT(b);
      if (s === "复制 CSS") {
        b.classList.add("xn-btn-primary");
        b.setAttribute("aria-label", "复制生成的 CSS 到剪贴板");
      } else if (s === "复制 HTML") {
        b.classList.add("xn-btn-secondary");
        b.setAttribute("aria-label", "复制 HTML 结构到剪贴板");
      } else if (s === "重置为默认值") {
        b.classList.add("xn-btn-reset");
        b.setAttribute("aria-label", "恢复默认按钮参数");
      }
    });
  }

  /* 标题去 ①–⑩ 序号 */
  function headings() {
    [].slice.call(document.querySelectorAll("#root h2")).forEach(function (h) {
      for (var i = 0; i < h.childNodes.length; i++) {
        var n = h.childNodes[i];
        if (n.nodeType === 3) {
          var v = n.nodeValue.replace(/^[\s\u2460-\u2469]+/, "").replace(/\s+/g, " ").trim();
          if (v !== n.nodeValue) n.nodeValue = v ? v : n.nodeValue;
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
