/* R1128 霓虹文字与边框效果合集 — 人用友好增强（幂等，不碰 React 状态） */
(function () {
  "use strict";
  if (window.__xnNeon) return;
  window.__xnNeon = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  var BTNS = function () { return [].slice.call(document.querySelectorAll("#root button")); };

  /* 页签：霓虹文字 / 霓虹边框（nav 内 pill 链接） */
  function tabs() {
    var els = [].slice.call(document.querySelectorAll("#root nav a, #root nav button")).filter(function (b) {
      var s = TXT(b);
      return (s === "霓虹文字" || s === "霓虹边框") && VIS(b);
    });
    if (els.length < 2) return;
    var box = els[0].parentElement;
    if (box && box.getAttribute("data-xn-neon-tabs") !== "1") {
      box.setAttribute("data-xn-neon-tabs", "1");
      box.setAttribute("role", "tablist");
      box.setAttribute("aria-label", "霓虹样式工具");
    }
    els.forEach(function (b) {
      var active = /(^|\s)(bg-slate-800|bg-slate-900|bg-indigo-600|bg-blue-600)(\s|$)/.test(b.className);
      b.classList.add("xn-neon-tab");
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", active ? "true" : "false");
      if (active) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    });
  }

  /* 开关：扩命中区 + 明确名称 */
  function switches() {
    BTNS().forEach(function (b) {
      if (b.getAttribute("role") !== "switch") return;
      b.classList.add("xn-neon-switch");
      b.setAttribute("aria-label", "闪烁动画");
      var on = b.getAttribute("aria-checked") === "true";
      b.setAttribute("title", "闪烁动画：" + (on ? "开" : "关") + "（点击切换）");
    });
  }

  /* 动作按钮层级 */
  function actions() {
    BTNS().forEach(function (b) {
      if (!VIS(b)) return;
      var s = TXT(b);
      if (s === "复制 CSS") {
        b.classList.add("xn-neon-primary");
        b.setAttribute("aria-label", "复制生成的 CSS 到剪贴板");
      } else if (s === "下载 HTML" || s === "重置默认") {
        b.classList.add("xn-neon-secondary");
        b.setAttribute("aria-label", s === "下载 HTML" ? "下载预览效果的 HTML 文件" : "恢复默认霓虹参数");
      }
    });
  }

  /* 滑杆补读屏名称与数值（aria-valuetext） */
  function ranges() {
    [].slice.call(document.querySelectorAll("#root input[type=range]")).forEach(function (r) {
      var row = r.parentElement && r.parentElement.parentElement;
      var label = r.getAttribute("aria-label") || "";
      if (!label && row) {
        var span = row.querySelector("span,label,div");
        if (span) label = TXT(span);
      }
      if (label) r.setAttribute("aria-label", label);
      r.setAttribute("aria-valuetext", r.value + "px");
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
    ranges();
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
