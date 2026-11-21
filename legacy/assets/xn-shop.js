/* R1166 海淘税费与禁限速查 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnShop) return;
  window.__xnShop = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  var H = function (el) { return Math.round(el.getBoundingClientRect().height); };

  var TAB = /^(工具\s*[A-Z]\s*)?(税费|运费|禁限|退换|行邮税与免税额度|合箱拆单)$/;

  function cleanText(el) {
    for (var i = 0; i < el.childNodes.length; i++) {
      var n = el.childNodes[i];
      if (n.nodeType === 3) {
        var v = n.nodeValue.replace(/^\s*工具\s*([A-Z]|\d+)\s*[·:：\-]?\s*/, "");
        if (v !== n.nodeValue) n.nodeValue = v;
      }
    }
  }

  /* 列数内联兜底（运行期 Tailwind 会压过外链） */
  function applyCols(bar) {
    var n = window.innerWidth <= 640 ? 3 : 6;
    bar.style.setProperty("grid-template-columns", "repeat(" + n + ", minmax(0, 1fr))", "important");
    bar.style.setProperty("gap", "4px", "important");
  }

  function tabs() {
    var list = [].slice.call(document.querySelectorAll("#root a")).filter(function (a) {
      return VIS(a) && TAB.test(TXT(a)) && H(a) < 110;
    });
    if (list.length < 6) return;
    var bar = list[0].parentElement;
    if (bar && bar.children.length === 6) {
      bar.classList.add("xn-shop-tabbar");
      bar.setAttribute("role", "tablist");
      applyCols(bar);
    }
    list.forEach(function (a) {
      a.classList.add("xn-shop-tab");
      a.setAttribute("role", "tab");
      cleanText(a);
      var on = /(^|\s)bg-blue-600(\s|$)/.test(a.className) || /(^|\s)bg-blue-500(\s|$)/.test(a.className) || /text-blue-700/.test(a.className);
      if (on) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
      a.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  window.addEventListener("resize", function () {
    var bar = document.querySelector("#root .xn-shop-tabbar");
    if (bar) applyCols(bar);
  });

  function controls() {
    [].slice.call(document.querySelectorAll("#root button[role='switch']")).forEach(function (b) {
      b.classList.add("xn-shop-switch");
      b.style.setProperty("min-height", "44px", "important");
    });
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      if (!/^复制结果$/.test(TXT(b))) return;
      b.classList.add("xn-shop-copy");
      b.setAttribute("type", "button");
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "复制计算结果");
    });
    [].slice.call(document.querySelectorAll("#root input")).forEach(function (i) {
      var ty = (i.getAttribute("type") || "text").toLowerCase();
      if (ty === "checkbox" || ty === "radio" || ty === "range" || ty === "color" || ty === "file") return;
      i.classList.add("xn-shop-input");
      if (getComputedStyle(i).fontSize !== "16px") i.style.setProperty("font-size", "16px", "important");
      if (H(i) < 48) i.style.setProperty("min-height", "48px", "important");
    });
    [].slice.call(document.querySelectorAll("#root select")).forEach(function (s) {
      s.classList.add("xn-shop-select");
      if (getComputedStyle(s).fontSize !== "16px") s.style.setProperty("font-size", "16px", "important");
      if (H(s) < 48) s.style.setProperty("min-height", "48px", "important");
    });
  }

  function results() {
    [].slice.call(document.querySelectorAll("#root dt, #root p, #root span, #root div")).forEach(function (e) {
      if (e.children.length) return;
      var v = TXT(e);
      if (/^(适用税率|完税价格|应征税额|实际税费|到手价)$/.test(v)) {
        e.classList.add("xn-shop-label");
        if (getComputedStyle(e).fontSize !== "12.5px") e.style.setProperty("font-size", "12.5px", "important");
        return;
      }
      if (!/^¥[\d,]+(\.\d+)?$/.test(v)) return;
      var fs = parseFloat(getComputedStyle(e).fontSize) || 0;
      if (fs !== 14) return;
      e.classList.add("xn-shop-amount");
      e.style.setProperty("font-size", "16px", "important");
    });
  }

  function summary() {
    [].slice.call(document.querySelectorAll("#root details > summary")).forEach(function (s) {
      s.style.setProperty("min-height", "44px", "important");
      s.style.setProperty("display", "flex", "important");
      s.style.setProperty("align-items", "center", "important");
    });
  }

  function run() {
    tabs();
    controls();
    results();
    summary();
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
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "aria-checked"] });
  setTimeout(run, 700);
  setTimeout(run, 1600);
})();
