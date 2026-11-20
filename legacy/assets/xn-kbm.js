/* R1123 键鼠手感与灵敏度配置合集 — 人用友好增强（幂等，不碰 React 状态） */
(function () {
  "use strict";
  if (window.__xnKbm) return;
  window.__xnKbm = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  var UNITS = /^(cm|mm|ms|Hz|hz|dpi|DPI|个|层|人|元|%|°|℃)$/;

  function tabs() {
    var btns = [].slice.call(document.querySelectorAll("#root button")).filter(function (b) {
      var p = b.parentElement;
      return (
        p &&
        p.className &&
        p.className.indexOf("grid-cols-3") >= 0 &&
        p.querySelectorAll("button").length >= 3 &&
        TXT(b).length >= 2 &&
        TXT(b).length <= 10
      );
    });
    if (!btns.length) return;
    var box = btns[0].parentElement;
    if (box.getAttribute("data-xn-kbm-tabs") !== "1") {
      box.setAttribute("data-xn-kbm-tabs", "1");
      box.setAttribute("role", "tablist");
      box.setAttribute("aria-label", "键鼠工具");
    }
    btns.forEach(function (b) {
      var active = (b.className || "").indexOf("from-cyan-500") >= 0;
      b.classList.add("xn-kbm-tab");
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", active ? "true" : "false");
      if (active) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", TXT(b));
    });
  }

  function options() {
    var byParent = {};
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      if (b.classList.contains("xn-kbm-tab")) return;
      var s = TXT(b);
      if (!s || s.length > 12 || /^开始计算/.test(s)) return;
      var r = b.getBoundingClientRect();
      if (r.height < 40 || r.height > 60 || r.width < 40) return;
      var c = b.className || "";
      if (c.indexOf("bg-slate-900") < 0 && c.indexOf("bg-emerald-400") < 0) return;
      var on = c.indexOf("text-emerald-300") >= 0 || c.indexOf("bg-emerald-400") >= 0;
      b.classList.add("xn-kbm-opt");
      b.setAttribute("aria-pressed", on ? "true" : "false");
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", s);
      var p = b.parentElement;
      (byParent[p.className || ""] = byParent[p.className || ""] || { p: p, n: 0 }).n++;
    });
    Object.keys(byParent).forEach(function (k) {
      var g = byParent[k];
      if (g.n < 2) return;
      if (g.p.getAttribute("data-xn-kbm-group") === "1") return;
      g.p.setAttribute("data-xn-kbm-group", "1");
      g.p.setAttribute("role", "group");
      g.p.setAttribute("aria-label", "选项");
    });
  }

  function labelFor(el) {
    var out = [];
    var n = el.parentElement;
    for (var i = 0; i < 3 && n; i++) {
      var kids = [].slice.call(n.querySelectorAll("div,label,span"));
      for (var k = 0; k < kids.length; k++) {
        var x = kids[k];
        if (x === el || x.contains(el)) continue;
        if (x.children.length) continue;
        var s = TXT(x);
        if (!s || s.length < 2 || s.length > 12) continue;
        if (UNITS.test(s)) continue;
        if (/^\d/.test(s)) continue;
        if (/^范围/.test(s)) continue;
        out.push(s);
      }
      n = n.parentElement;
    }
    if (!out.length) return "";
    out.sort(function (a, b) { return a.length - b.length; });
    return out[0];
  }

  var PH_LABEL = {
    "100–26000": "鼠标 DPI",
    "0.01–100": "游戏内灵敏度",
    "10–120": "鼠标垫宽度（cm）",
    "60–540": "显示器刷新率（Hz）",
    "0–500": "网络延迟（ms）",
    "13–23": "手长（cm）",
    "1–30": "宏数量（个）",
    "1–8": "按键层数（层）"
  };

  function inputs() {
    [].slice.call(document.querySelectorAll("#root input:not([type=checkbox]):not([type=radio]):not([type=range])")).forEach(function (el) {
      if (!VIS(el)) return;
      var own = PH_LABEL[(el.placeholder || "").trim()];
      if (own) {
        el.setAttribute("aria-label", own);
        return;
      }
      var cur = el.getAttribute("aria-label") || "";
      if (cur && !UNITS.test(cur)) return;
      var l = labelFor(el);
      if (l) el.setAttribute("aria-label", l);
    });
  }

  function headings() {
    [].slice.call(document.querySelectorAll("#root h1, #root h2, #root h3")).forEach(function (h) {
      [].slice.call(h.childNodes).forEach(function (node) {
        if (node.nodeType !== 3) return;
        node.textContent = node.textContent
          .replace(/^\s*工具[A-Z]\s+/, "")
          .replace(/^\s*[①-⑩]\s*/, "");
      });
    });
  }

  function run() {
    tabs();
    options();
    inputs();
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
  setTimeout(run, 1500);
})();
