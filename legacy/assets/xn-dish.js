/* R1154 洗碗机容量与耗材计算合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnDish) return;
  window.__xnDish = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  var H = function (el) { return Math.round(el.getBoundingClientRect().height); };

  var TAB = /^(工具\s*[A-Z]\s*)?(容量与餐具量|耗材月成本|洗涤水电费|摆放装载|烘干储存|预冲洗)$/;

  function cleanText(el) {
    for (var i = 0; i < el.childNodes.length; i++) {
      var n = el.childNodes[i];
      if (n.nodeType === 3) {
        var v = n.nodeValue.replace(/^\s*工具\s*([A-Z]|\d+)\s*[·:：\-]?\s*/, "");
        if (v !== n.nodeValue) n.nodeValue = v;
      }
    }
  }

  /* 页签：42→44、移动两列、aria-current、剥离代号 */
  function tabs() {
    var list = [].slice.call(document.querySelectorAll("#root a")).filter(function (a) {
      return VIS(a) && TAB.test(TXT(a)) && H(a) >= 34 && H(a) <= 50;
    });
    if (list.length < 6) return;
    var bar = list[0].parentElement;
    if (bar && bar.children.length === 6) {
      bar.classList.add("xn-dish-tabbar");
      bar.setAttribute("role", "tablist");
    }
    list.forEach(function (a) {
      a.classList.add("xn-dish-tab");
      a.setAttribute("role", "tab");
      cleanText(a);
      var on = /bg-white/.test(a.className) && /text-teal-700/.test(a.className);
      if (on) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
      a.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  /* 标题代号 */
  function headings() {
    [].slice.call(document.querySelectorAll("#root h1, #root h2, #root h3")).forEach(cleanText);
  }

  /* 复制按钮 36→40 */
  function copyBtn() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      if (!/一键复制结果/.test(TXT(b))) return;
      b.classList.add("xn-dish-copy");
      b.setAttribute("type", "button");
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "复制计算结果");
    });
  }

  /* 输入 46/15 → 48/16 */
  function inputs() {
    [].slice.call(document.querySelectorAll("#root input")).forEach(function (i) {
      var ty = (i.getAttribute("type") || "text").toLowerCase();
      if (ty === "checkbox" || ty === "radio" || ty === "range" || ty === "color" || ty === "file") return;
      i.classList.add("xn-dish-input");
      if (getComputedStyle(i).fontSize !== "16px") i.style.setProperty("font-size", "16px", "important");
      if (H(i) < 48) i.style.setProperty("min-height", "48px", "important");
    });
  }

  /* 结果指标：次级两枚 18 → 20，主枚保持 24 */
  function metrics() {
    [].slice.call(document.querySelectorAll("#root p, #root span, #root strong")).forEach(function (e) {
      if (e.children.length) return;
      var v = TXT(e);
      if (!/^≈?\s*[\d.]+\s*(件|升|套|元|度|次)$/.test(v)) return;
      var fs = parseFloat(getComputedStyle(e).fontSize) || 0;
      if (fs >= 20) return;
      e.classList.add("xn-dish-metric");
      e.style.setProperty("font-size", "20px", "important");
    });
  }

  function run() {
    tabs();
    headings();
    copyBtn();
    inputs();
    metrics();
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
