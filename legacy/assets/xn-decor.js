/* R1164 家装尺寸与材料速查合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnDecor) return;
  window.__xnDecor = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  var H = function (el) { return Math.round(el.getBoundingClientRect().height); };

  var TAB = /^\d{2}\s*(尺寸速查|材料用量|灯具照度|墙面配色与涂料|收纳柜体|插座点位)$/;

  function tabs() {
    var list = [].slice.call(document.querySelectorAll("#root a")).filter(function (a) {
      return VIS(a) && TAB.test(TXT(a)) && H(a) >= 40 && H(a) <= 60;
    });
    if (list.length < 6) return;
    var bar = list[0].parentElement;
    if (bar && bar.children.length === 6) {
      bar.classList.add("xn-decor-tabbar");
      bar.setAttribute("role", "tablist");
    }
    list.forEach(function (a) {
      a.classList.add("xn-decor-tab");
      a.setAttribute("role", "tab");
      var on = /(^|\s)text-\[#1f1c19\](\s|$)/.test(a.className);
      if (on) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
      a.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  function controls() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      var v = TXT(b);
      var isPill = /rounded-full/.test(b.className) && H(b) <= 42 && v !== "复制";
      if (/^(客厅|卧室|厨房|卫浴)$/.test(v) || isPill) {
        b.classList.add("xn-decor-chip");
        b.setAttribute("type", "button");
        return;
      }
      if (v === "复制") {
        b.classList.add("xn-decor-copy");
        b.setAttribute("type", "button");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "复制该段尺寸");
      }
    });
    [].slice.call(document.querySelectorAll("#root input")).forEach(function (i) {
      var ty = (i.getAttribute("type") || "text").toLowerCase();
      if (ty === "checkbox" || ty === "radio" || ty === "range" || ty === "color" || ty === "file") return;
      i.classList.add("xn-decor-input");
      if (getComputedStyle(i).fontSize !== "16px") i.style.setProperty("font-size", "16px", "important");
      if (H(i) < 48) i.style.setProperty("min-height", "48px", "important");
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
