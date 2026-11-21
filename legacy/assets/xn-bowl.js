/* R1159 保龄球计分与换算合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnBowl) return;
  window.__xnBowl = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  /* 瓶位圆形按钮：文本 1–10 且近正方形 */
  function pins() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      var v = TXT(b);
      if (!/^(10|[1-9])$/.test(v)) return;
      var r = b.getBoundingClientRect();
      if (Math.abs(r.width - r.height) > 6 || r.width > 44) return;
      b.classList.add("xn-bowl-pin");
      b.style.setProperty("width", "44px", "important");
      b.style.setProperty("height", "44px", "important");
      b.setAttribute("aria-label", "选择 " + v + " 号瓶位");
    });
  }

  /* 输入：文本 46/15、数字 48/20 → 48/16 */
  function inputs() {
    [].slice.call(document.querySelectorAll("#root input")).forEach(function (i) {
      var ty = (i.getAttribute("type") || "text").toLowerCase();
      if (ty === "checkbox" || ty === "radio" || ty === "range" || ty === "color" || ty === "file") return;
      i.classList.add(ty === "number" ? "xn-bowl-num" : "xn-bowl-input");
      if (getComputedStyle(i).fontSize !== "16px") i.style.setProperty("font-size", "16px", "important");
      if (i.getBoundingClientRect().height < 48) i.style.setProperty("min-height", "48px", "important");
    });
  }

  /* 标题代号「工具E/F」 */
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

  /* 11px 提示文字 → 12px */
  function hints() {
    [].slice.call(document.querySelectorAll("#root p, #root span, #root div")).forEach(function (e) {
      if (e.children.length) return;
      var fs = parseFloat(getComputedStyle(e).fontSize) || 0;
      if (fs !== 11) return;
      if (TXT(e).length < 4) return;
      if (e.closest("button")) return;
      e.classList.add("xn-bowl-hint");
      e.style.setProperty("font-size", "12px", "important");
    });
  }

  function run() {
    pins();
    inputs();
    codes();
    hints();
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
