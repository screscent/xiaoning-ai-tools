/* R1155 学车考驾照费用与进度合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnLic) return;
  window.__xnLic = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  var H = function (el) { return Math.round(el.getBoundingClientRect().height); };

  var TAB = /^(费用拆解|学时进度|科目要点|补考预算|拿证规划|预约考场)$/;

  function tabs() {
    var list = [].slice.call(document.querySelectorAll("#root a")).filter(function (a) {
      return VIS(a) && TAB.test(TXT(a)) && H(a) >= 32 && H(a) <= 60;
    });
    if (list.length < 6) return;
    var bar = list[0].parentElement;
    if (bar && bar.children.length === 6) {
      bar.classList.add("xn-lic-tabbar");
      bar.setAttribute("role", "tablist");
    }
    list.forEach(function (a) {
      a.classList.add("xn-lic-tab");
      a.setAttribute("role", "tab");
      var on = /bg-slate-900/.test(a.className) && /text-white/.test(a.className);
      if (on) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
      a.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  function copyBtn() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      if (TXT(b) !== "复制结果") return;
      b.classList.add("xn-lic-copy");
      b.setAttribute("type", "button");
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "复制计算结果");
    });
  }

  function controls() {
    [].slice.call(document.querySelectorAll("#root select")).forEach(function (s) {
      s.classList.add("xn-lic-select");
      if (getComputedStyle(s).fontSize !== "16px") s.style.setProperty("font-size", "16px", "important");
      if (H(s) < 48) s.style.setProperty("min-height", "48px", "important");
    });
    [].slice.call(document.querySelectorAll("#root input")).forEach(function (i) {
      var ty = (i.getAttribute("type") || "text").toLowerCase();
      if (ty === "checkbox" || ty === "radio" || ty === "range" || ty === "color" || ty === "file") return;
      i.classList.add("xn-lic-input");
      if (getComputedStyle(i).fontSize !== "16px") i.style.setProperty("font-size", "16px", "important");
      if (H(i) < 48) i.style.setProperty("min-height", "48px", "important");
    });
  }

  /* 「工具 1 / 6」→「第 1 / 6 个工具」 */
  function progress() {
    [].slice.call(document.querySelectorAll("#root span")).forEach(function (s) {
      if (s.children.length) return;
      var v = TXT(s);
      var m = v.match(/^工具\s*(\d+)\s*\/\s*(\d+)$/);
      if (!m) return;
      s.textContent = "第 " + m[1] + " / " + m[2] + " 个工具";
      s.classList.add("xn-lic-progress");
    });
  }

  /* 内部代号：标题与徽标「工具D」 */
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
      var v = TXT(e);
      if (!/^工具\s*[A-Z]$/.test(v) && !/^工具\s*\d+$/.test(v)) return;
      if (H(e) > 32) return;
      e.style.setProperty("display", "none", "important");
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
    copyBtn();
    controls();
    progress();
    codes();
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
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  setTimeout(run, 700);
  setTimeout(run, 1600);
})();
