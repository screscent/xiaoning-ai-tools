/* R1163 签证与出入境速查合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnVisa) return;
  window.__xnVisa = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  var H = function (el) { return Math.round(el.getBoundingClientRect().height); };

  var NAV = /^(签证速查|护照有效期|海关通关|免签|转机|入境)/;

  function nav() {
    var items = [].slice.call(document.querySelectorAll("#root a")).filter(function (a) {
      return VIS(a) && NAV.test(TXT(a)) && H(a) < 80;
    });
    if (items.length < 6) return;
    var bar = items[0].parentElement;
    if (bar && bar.children.length === 6) {
      bar.classList.add("xn-visa-nav");
      bar.setAttribute("role", "tablist");
    }
    items.forEach(function (a) {
      a.classList.add("xn-visa-link");
      a.setAttribute("role", "tab");
      var on = /bg-indigo-600/.test(a.className) && /text-white/.test(a.className);
      if (on) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
      a.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  function controls() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      var v = TXT(b);
      if (v !== "复制结果" && v !== "使用说明") return;
      b.classList.add("xn-visa-btn");
      b.setAttribute("type", "button");
    });
    [].slice.call(document.querySelectorAll("#root select")).forEach(function (s) {
      s.classList.add("xn-visa-select");
      if (getComputedStyle(s).fontSize !== "16px") s.style.setProperty("font-size", "16px", "important");
      if (H(s) < 48) s.style.setProperty("min-height", "48px", "important");
    });
  }

  function run() {
    nav();
    controls();
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
