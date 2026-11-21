/* R1142 高速通行费与 ETC 合集 — 人用友好增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnEtc) return;
  window.__xnEtc = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  var H = function (el) { return Math.round(el.getBoundingClientRect().height); };

  /* 顶部工具导航 */
  function tabs() {
    var box = null;
    [].slice.call(document.querySelectorAll("#root div")).forEach(function (d) {
      if (box) return;
      if (d.children.length !== 6) return;
      var cuts = [].slice.call(d.children);
      var ok = cuts.every(function (c) { return c.tagName === "A" && H(c) >= 34 && H(c) <= 80; });
      if (ok) box = d;
    });
    if (!box) return;
    box.setAttribute("data-xn-etc-nav", "1");
    box.setAttribute("role", "tablist");
    [].slice.call(box.children).forEach(function (a) {
      a.classList.add("xn-etc-tab");
      a.setAttribute("role", "tab");
      var cs = getComputedStyle(a);
      var on = /28, ?132, ?199|2, ?132, ?199/.test(cs.backgroundColor) || /rgb\(2, 132, 199\)/.test(cs.backgroundColor) || /\bbg-sky-600\b/.test(a.className);
      a.setAttribute("aria-selected", on ? "true" : "false");
      if (on) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
      if (!a.getAttribute("aria-label")) a.setAttribute("aria-label", TXT(a));
    });
  }

  /* 车型卡（一类客车 / 二类客车 / 货车） */
  function cars() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      if (H(b) > 90) return;
      if (!/^(一类客车|二类客车|货车)/.test(TXT(b))) return;
      b.classList.add("xn-etc-car");
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", TXT(b).replace(/([^\d])(\d)/g, "$1 $2"));
    });
  }

  /* 主按钮 */
  function actions() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      var s = TXT(b);
      if (s === "计算通行费") {
        b.classList.add("xn-etc-calc");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "计算本次高速通行费");
      } else if (s === "复制结果") {
        b.classList.add("xn-etc-copy");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "复制计算结果");
      }
    });
  }

  /* 返回工具集（深色页头内） */
  function back() {
    [].slice.call(document.querySelectorAll("#root a")).forEach(function (a) {
      if (!VIS(a)) return;
      if (!/返回工具集/.test(TXT(a))) return;
      a.classList.add("xn-etc-back");
      a.setAttribute("aria-label", "返回工具集列表");
    });
  }

  /* 顶部 hero（含 h1 的那个 header），避免误伤卡片内 header */
  function hero() {
    var h1 = document.querySelector("#root h1");
    if (!h1) return;
    var head = h1.closest("header");
    if (head && !head.classList.contains("xn-etc-hero")) head.classList.add("xn-etc-hero");
  }

  function run() {
    hero();
    tabs();
    cars();
    actions();
    back();
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
