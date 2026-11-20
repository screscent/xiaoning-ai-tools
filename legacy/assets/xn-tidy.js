/* R1134 文本清理与重复行统计合集 — 人用友好增强（幂等，不碰 React 状态） */
(function () {
  "use strict";
  if (window.__xnClean) return;
  window.__xnClean = true;

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
      return (s === "空行清理" || s === "重复行") && VIS(b);
    });
    if (btns.length < 2) return;
    var box = btns[0].parentElement;
    if (box && box.getAttribute("data-xn-clean-tabs") !== "1") {
      box.setAttribute("data-xn-clean-tabs", "1");
      box.setAttribute("role", "tablist");
      box.setAttribute("aria-label", "文本清理工具");
    }
    btns.forEach(function (b) {
      var active = /(^|\s)(bg-indigo-500|bg-indigo-600|bg-teal-500|bg-emerald-500)(\s|$)/.test(b.className);
      b.classList.add("xn-clean-tab");
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", active ? "true" : "false");
      if (active) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    });
  }

  /* 开关：保留原 role=switch，只扩命中区 */
  function switches() {
    BTNS().forEach(function (b) {
      if (b.getAttribute("role") !== "switch") return;
      b.classList.add("xn-clean-switch");
      if (!b.getAttribute("title")) {
        var aria = b.getAttribute("aria-label") || "开关";
        b.setAttribute("title", aria + "：" + (b.getAttribute("aria-checked") === "true" ? "开" : "关") + "（点击切换）");
      }
    });
  }

  /* 按钮层级 */
  function actions() {
    BTNS().forEach(function (b) {
      if (!VIS(b)) return;
      var s = TXT(b);
      if (s === "处理") {
        b.classList.add("xn-clean-primary");
        b.setAttribute("aria-label", "处理文本");
      } else if (s === "去重保留首次" || s === "复制统计结果") {
        b.classList.add("xn-clean-secondary");
        b.setAttribute("aria-label", s === "复制统计结果" ? "复制重复行统计结果" : "去重并保留首次出现的行");
      }
    });
  }

  /* 标题去 ①–⑩ 序号 */
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
