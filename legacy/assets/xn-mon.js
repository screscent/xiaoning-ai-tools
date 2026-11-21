/* R1157 显示器参数与选购计算合集 — 语义与字号增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnMon) return;
  window.__xnMon = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  var H = function (el) { return Math.round(el.getBoundingClientRect().height); };

  var LABELS = /^(像素密度|等效视网膜距离|文字缩放建议)$/;

  /* 分辨率选项：已具备 role=radio + aria-checked，仅补类名与键盘可见性 */
  function options() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      if (!/^\d{3,4} × \d{3,4}$/.test(TXT(b))) return;
      b.classList.add("xn-mon-opt");
      /* 已有 role=radio + aria-checked，由 React 维护，不再叠加 aria-pressed */
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "分辨率：" + TXT(b));
    });
  }

  function inputs() {
    [].slice.call(document.querySelectorAll("#root input")).forEach(function (i) {
      var ty = (i.getAttribute("type") || "text").toLowerCase();
      if (ty === "checkbox" || ty === "radio" || ty === "range" || ty === "color" || ty === "file") return;
      i.classList.add("xn-mon-input");
      if (getComputedStyle(i).fontSize !== "16px") i.style.setProperty("font-size", "16px", "important");
      if (H(i) < 48) i.style.setProperty("min-height", "48px", "important");
    });
  }

  /* 结果：数值 18→22，标签 12→13 */
  function results() {
    [].slice.call(document.querySelectorAll("#root dt")).forEach(function (e) {
      if (e.children.length) return;
      if (!LABELS.test(TXT(e))) return;
      e.classList.add("xn-mon-label");
      if (parseFloat(getComputedStyle(e).fontSize) < 13) e.style.setProperty("font-size", "13px", "important");
    });
    [].slice.call(document.querySelectorAll("#root p, #root span, #root strong")).forEach(function (e) {
      if (e.children.length) return;
      var v = TXT(e);
      if (!/^(\d+(\.\d+)?|100%)$/.test(v)) return;
      var fs = parseFloat(getComputedStyle(e).fontSize) || 0;
      if (fs < 16 || fs > 20) return;
      e.classList.add("xn-mon-num");
      e.style.setProperty("font-size", "22px", "important");
    });
  }

  /* 副标题（H1 下方说明）12 → 13.5 */
  function subtitle() {
    [].slice.call(document.querySelectorAll("#root p, #root div")).forEach(function (e) {
      if (e.children.length) return;
      var v = TXT(e);
      if (!/^PPI = 对角线像素/.test(v)) return;
      e.classList.add("xn-mon-sub");
      if (getComputedStyle(e).fontSize !== "13.5px") e.style.setProperty("font-size", "13.5px", "important");
    });
  }

  function codes() {
    [].slice.call(document.querySelectorAll("#root h1, #root h2, #root h3")).forEach(function (h) {
      for (var i = 0; i < h.childNodes.length; i++) {
        var n = h.childNodes[i];
        if (n.nodeType === 3) {
          var v = n.nodeValue.replace(/^\s*工具\s*([A-Z]|\d+)\s*[·:：\-]?\s*/, "");
          if (v !== n.nodeValue) n.nodeValue = v;
          break;
        }
      }
    });
  }

  function run() {
    options();
    inputs();
    results();
    subtitle();
    codes();
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
