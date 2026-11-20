/* R1129 节假日与调休合集 — 人用友好增强（幂等，不碰 React 状态） */
(function () {
  "use strict";
  if (window.__xnHoli) return;
  window.__xnHoli = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var BTNS = function () { return [].slice.call(document.querySelectorAll("#root button")); };

  /* 页签语义 */
  function tabs() {
    var els = [].slice.call(document.querySelectorAll("#root .tabs .tab"));
    if (!els.length) return;
    var box = els[0].parentElement;
    if (box && box.getAttribute("data-xn-holi-tabs") !== "1") {
      box.setAttribute("data-xn-holi-tabs", "1");
      box.setAttribute("role", "tablist");
      box.setAttribute("aria-label", "假期工具");
    }
    els.forEach(function (b) {
      var active = /(^|\s)active(\s|$)/.test(b.className);
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", active ? "true" : "false");
      if (active) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", TXT(b));
    });
  }

  /* 复制按钮 38 → 44 */
  function copies() {
    BTNS().forEach(function (b) {
      var s = TXT(b);
      if (s !== "复制结果") return;
      if (b.getBoundingClientRect().height === 0) return;
      b.classList.add("xn-holi-copy");
      b.setAttribute("aria-label", "复制当前页结果到剪贴板");
    });
  }

  /* 标题去「工具E / 工具F 」前缀与 ①–⑩ */
  function headings() {
    [].slice.call(document.querySelectorAll("#root h2, #root h3")).forEach(function (h) {
      for (var i = 0; i < h.childNodes.length; i++) {
        var n = h.childNodes[i];
        if (n.nodeType === 3) {
          var v = n.nodeValue.replace(/^[\s\u2460-\u2469]+/, "").replace(/^工具[A-Za-z]\s*[·:：]?\s*/, "");
          if (v !== n.nodeValue) n.nodeValue = v;
          break;
        }
      }
    });
  }

  /* 倒计时：突出天数 */
  function bigNumber() {
    [].slice.call(document.querySelectorAll("#root .result .big")).forEach(function (d) {
      if (d.getAttribute("data-xn-hl") === "1") return;
      var s = TXT(d);
      var m = s.match(/^(\d+)\s*(.*)$/);
      if (!m) return;
      d.setAttribute("data-xn-hl", "1");
      d.textContent = "";
      var em = document.createElement("span");
      em.className = "xn-hl";
      em.textContent = m[1];
      d.appendChild(em);
      d.appendChild(document.createTextNode(" " + m[2]));
    });
  }

  /* 从放假清单表格查节日的真实起止（表格在隐藏页签里也可读） */
  function holidayRange(name) {
    var rows = [].slice.call(document.querySelectorAll("#root table tbody tr"));
    for (var i = 0; i < rows.length; i++) {
      var c = rows[i].children;
      if (!c.length || TXT(c[0]) !== name || !c[1]) continue;
      var m = TXT(c[1]).match(/(\d{1,2})月(\d{1,2})日/g);
      if (!m || !m.length) continue;
      var a = m[0].match(/(\d{1,2})月(\d{1,2})日/);
      var b = (m[1] || m[0]).match(/(\d{1,2})月(\d{1,2})日/);
      return { m1: a[1], d1: a[2], m2: b[1], d2: b[2] };
    }
    return null;
  }

  /* 修复「16月NaN日 ~ 23月NaN日」：按所选节日的真实起止还原 */
  function fixNaN() {
    var sel = document.querySelector("#root select");
    var name = sel && sel.options[sel.selectedIndex] ? TXT(sel.options[sel.selectedIndex]) : "";
    var real = name ? holidayRange(name) : null;
    [].slice.call(document.querySelectorAll("#root .result")).forEach(function (card) {
      if (!/NaN/.test(card.textContent || "")) return;
      var ref = (TXT(card).match(/(\d{1,2})月\d{1,2}日/) || [])[1];
      [].slice.call(card.querySelectorAll(".kv, div, p, span")).forEach(function (el) {
        if (el.children.length > 1) return;
        for (var i = 0; i < el.childNodes.length; i++) {
          var n = el.childNodes[i];
          if (n.nodeType !== 3 || n.nodeValue.indexOf("NaN") < 0) continue;
          var v = n.nodeValue;
          if (real) {
            v = v.replace(/（\d{1,2}月NaN日\s*~\s*\d{1,2}月NaN日）/g,
              "（" + real.m1 + "月" + real.d1 + "日 ~ " + real.m2 + "月" + real.d2 + "日）");
            v = v.replace(/^\d{1,2}月NaN日$/, real.m1 + "月" + real.d1 + "日");
          }
          if (ref) {
            v = v.replace(/（(\d{1,2})月NaN日\s*~\s*(\d{1,2})月NaN日）/g, "（" + ref + "月$1日 ~ " + ref + "月$2日）");
          }
          v = v.replace(/(\d{1,2})月NaN日/g, ref ? ref + "月$1日" : "—");
          v = v.replace(/月0(\d)日/g, "月$1日");
          n.nodeValue = v;
        }
      });
    });
  }

  /* 表格：数值列右对齐（按表头语义） */
  function tableAlign() {
    [].slice.call(document.querySelectorAll("#root .result table")).forEach(function (tb) {
      var ths = [].slice.call(tb.querySelectorAll("thead th"));
      if (!ths.length) return;
      ths.forEach(function (th, i) {
        if (!/数值|金额|天数|小时|倍数|合计/.test(TXT(th))) return;
        [].slice.call(tb.querySelectorAll("tbody tr")).forEach(function (tr) {
          var td = tr.children[i];
          if (td) {
            td.style.textAlign = "right";
            td.style.fontVariantNumeric = "tabular-nums";
          }
        });
        th.style.textAlign = "right";
      });
    });
  }

  function run() {
    tabs();
    copies();
    headings();
    bigNumber();
    fixNaN();
    tableAlign();
  }

  var timer = null;
  function schedule() {
    if (timer) return;
    timer = setTimeout(function () { timer = null; run(); }, 90);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule);
  else schedule();
  window.addEventListener("load", schedule);
  window.addEventListener("hashchange", schedule);
  var mo = new MutationObserver(schedule);
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  setTimeout(run, 700);
  setTimeout(run, 1600);
})();
