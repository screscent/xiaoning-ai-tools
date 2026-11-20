/* R1135 SVG 图表与折线图合集 — 人用友好增强（幂等，不碰 React 状态） */
(function () {
  "use strict";
  if (window.__xnChart) return;
  window.__xnChart = true;

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
      return (s === "SVG图表" || s === "折线图") && VIS(b);
    });
    if (btns.length < 2) return;
    var box = btns[0].parentElement;
    if (box && box.getAttribute("data-xn-chart-tabs") !== "1") {
      box.setAttribute("data-xn-chart-tabs", "1");
      box.setAttribute("role", "tablist");
      box.setAttribute("aria-label", "图表工具");
    }
    btns.forEach(function (b) {
      var active = /(^|\s)(bg-blue-600|bg-indigo-600|bg-slate-900)(\s|$)/.test(b.className);
      b.classList.add("xn-chart-tab");
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", active ? "true" : "false");
      if (active) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    });
  }

  /* 按钮层级 */
  function actions() {
    BTNS().forEach(function (b) {
      if (!VIS(b)) return;
      var s = TXT(b);
      if (s === "生成图表" || s === "生成折线图") {
        b.classList.add("xn-chart-primary");
        b.setAttribute("aria-label", s);
      } else if (s === "下载 chart.svg" || s === "复制 SVG") {
        b.classList.add("xn-chart-secondary");
        b.setAttribute("aria-label", s === "复制 SVG" ? "复制 SVG 源码到剪贴板" : "下载 SVG 图表文件");
      } else if (s === "清空") {
        b.classList.add("xn-chart-ghost");
        b.setAttribute("aria-label", "清空数据与图表");
      }
    });
  }

  /* H2/H3 去 ①–⑩ 序号 */
  function headings() {
    [].slice.call(document.querySelectorAll("#root h2, #root h3")).forEach(function (h) {
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
