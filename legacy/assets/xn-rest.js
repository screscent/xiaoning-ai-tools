/* R1126 久坐提醒与拉伸计划合集 — 人用友好增强（幂等，不碰 React 状态） */
(function () {
  "use strict";
  if (window.__xnRest) return;
  window.__xnRest = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  var BTNS = function () { return [].slice.call(document.querySelectorAll("#root button")); };

  /* 页签：久坐提醒 / 拉伸清单 */
  function tabs() {
    var btns = BTNS().filter(function (b) {
      var s = TXT(b);
      return (s === "久坐提醒" || s === "拉伸清单") && VIS(b);
    });
    if (btns.length < 2) return;
    var box = btns[0].parentElement;
    if (box && box.getAttribute("data-xn-rest-tabs") !== "1") {
      box.setAttribute("data-xn-rest-tabs", "1");
      box.setAttribute("role", "tablist");
      box.setAttribute("aria-label", "健康工具");
    }
    btns.forEach(function (b) {
      var active = /(^|\s)bg-blue-600(\s|$)/.test(b.className);
      b.classList.add("xn-rest-tab");
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", active ? "true" : "false");
      if (active) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    });
  }

  /* 午休开关：语义化 switch + 明确读屏名称 */
  function switches() {
    BTNS().forEach(function (b) {
      var aria = b.getAttribute("aria-label") || "";
      if (aria.indexOf("午休") < 0) return;
      var on = /(^|\s)bg-green-500(\s|$)/.test(b.className);
      b.classList.add("xn-rest-switch");
      b.setAttribute("role", "switch");
      b.setAttribute("aria-checked", on ? "true" : "false");
      b.setAttribute("aria-label", "午休时段跳过提醒");
      b.setAttribute("title", "开启后 12:00 - 13:00 不提醒");
    });
  }

  /* 部位芯片：34 → 44 触控高度 + 选中态 */
  function chips() {
    [].slice.call(document.querySelectorAll("#root label")).forEach(function (l) {
      var inp = l.querySelector('input[type="checkbox"]');
      if (!inp) return;
      var s = TXT(l);
      if (!s || s.length > 4) return;
      l.classList.add("xn-rest-chip");
      if (inp.getAttribute("aria-label") !== "重点部位：" + s) {
        inp.setAttribute("aria-label", "重点部位：" + s);
      }
      if (inp.checked) l.setAttribute("data-xn-on", "1");
      else l.removeAttribute("data-xn-on");
    });
  }

  /* 表单：下拉补读屏名称（拉伸页原为「颈」） */
  function controls() {
    [].slice.call(document.querySelectorAll("#root select")).forEach(function (s) {
      var a = s.getAttribute("aria-label") || "";
      if (a.length <= 1) s.setAttribute("aria-label", "可用时长");
    });
  }

  /* 按钮：主/次层级 + 读屏名称 */
  function actions() {
    BTNS().forEach(function (b) {
      if (!VIS(b)) return;
      var s = TXT(b);
      if (/^生成/.test(s) && s.length <= 8) {
        b.classList.add("xn-rest-primary");
      } else if (s === "复制清单" || s === "复制计划") {
        b.classList.add("xn-rest-secondary");
        b.setAttribute("aria-label", s + "到剪贴板");
      } else if (s === "清空") {
        b.classList.add("xn-rest-secondary");
        b.setAttribute("aria-label", "清空已生成的内容");
      }
    });
  }

  /* 标题去掉 ①–⑩ 序号（页签已表达步骤归属） */
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

  /* 结果条目去重：「1. 颈部 · 颈部左右侧弯」→「1. 颈部 · 左右侧弯」 */
  function dedupe() {
    [].slice.call(document.querySelectorAll("#root p.text-sm.font-medium")).forEach(function (p) {
      var s = TXT(p);
      var m = s.match(/^(\d+\.\s*)(颈|肩|背|腰|髋|腿)部?\s*·\s*(.+)$/);
      if (!m) return;
      var part = m[2];
      if (m[3].indexOf(part) !== 0) return;
      p.textContent = m[1] + part + "部 · " + m[3].slice(part.length).replace(/^部/, "");
    });
  }

  function run() {
    tabs();
    switches();
    chips();
    controls();
    actions();
    headings();
    dedupe();
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
