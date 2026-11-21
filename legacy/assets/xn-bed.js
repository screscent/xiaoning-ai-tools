/* R1152 床垫与枕头选购合集 — 语义与字号增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnBed) return;
  window.__xnBed = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  var H = function (el) { return Math.round(el.getBoundingClientRect().height); };

  /* 工具页签（6 个） */
  function tabs() {
    var names = /^(床垫尺寸|枕头高度|床品换洗|床垫清洁|试睡退换|除螨洗护)$/;
    var list = [].slice.call(document.querySelectorAll("#root button")).filter(function (b) {
      return VIS(b) && names.test(TXT(b));
    });
    if (list.length < 6) return;
    var box = list[0].parentElement;
    if (box && box.children.length === 6) box.setAttribute("role", "tablist");
    list.forEach(function (b) {
      b.classList.add("xn-bed-tab");
      b.setAttribute("role", "tab");
      var on = /from-amber-300|to-amber-400/.test(b.className);
      b.setAttribute("aria-selected", on ? "true" : "false");
      if (on) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    });
  }

  /* 选项组（床架尺寸 / 睡姿） */
  function options() {
    var names = /^(\d\.\d m|1\.2 m|1\.5 m|1\.8 m|2\.0 m|仰卧|侧卧|俯卧)$/;
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      if (!names.test(TXT(b))) return;
      b.classList.add("xn-bed-opt");
      var on = /border-amber-300|bg-amber-300\/15/.test(b.className);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  /* 输入字号（页面可能内联锁定） */
  function inputs() {
    [].slice.call(document.querySelectorAll("#root input")).forEach(function (i) {
      var ty = (i.getAttribute("type") || "text").toLowerCase();
      if (ty === "checkbox" || ty === "radio" || ty === "range" || ty === "color" || ty === "file") return;
      i.classList.add("xn-bed-input");
      if (getComputedStyle(i).fontSize !== "17px") i.style.setProperty("font-size", "17px", "important");
    });
  }

  /* 剥离「工具A」前缀 + 隐藏徽标 */
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
    [].slice.call(document.querySelectorAll("#root span, #root div")).forEach(function (e) {
      if (e.children.length) return;
      if (!/^工具\s*([A-Z]|\d+)$/.test(TXT(e))) return;
      if (H(e) > 40) return;
      e.classList.add("xn-bed-code");
    });
  }

  function run() {
    tabs();
    options();
    inputs();
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
