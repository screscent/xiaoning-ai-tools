/* R1180 行李打包与件数估算合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnPack) return;
  window.__xnPack = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var H = function (el) { return Math.round(el.getBoundingClientRect().height); };
  var W = function (el) { return Math.round(el.getBoundingClientRect().width); };

  var TAB = /^(打包清单|件数估算)$/;

  function tabs() {
    var list = [].slice.call(document.querySelectorAll("#root button")).filter(function (b) {
      return VIS(b) && TAB.test(TXT(b));
    });
    if (!list.length) return;
    var bar = list[0].parentElement;
    if (bar) bar.setAttribute("role", "tablist");
    list.forEach(function (b) {
      b.classList.add("xn-pack-tab");
      b.setAttribute("role", "tab");
      var on = /(^|\s)bg-indigo-500(\s|$)/.test(b.className) && /(^|\s)text-white(\s|$)/.test(b.className);
      b.setAttribute("aria-current", on ? "true" : "false");
      b.setAttribute("aria-selected", on ? "true" : "false");
      b.setAttribute("tabindex", on ? "0" : "-1");
    });
  }

  function buttons() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      if (/w-11/.test(b.className) && H(b) <= 44) {
        b.classList.add("xn-pack-switch");
        var on = /(^|\s)bg-indigo-500(\s|$)/.test(b.className) || /(^|\s)bg-indigo-600(\s|$)/.test(b.className);
        b.removeAttribute("aria-pressed");
        b.setAttribute("role", "switch");
        b.setAttribute("aria-checked", on ? "true" : "false");
        if (!b.getAttribute("aria-label")) {
          var label = (b.parentElement ? TXT(b.parentElement) : "").replace(/开关|切换/g, "").trim();
          if (!label && b.parentElement) {
            var sib = b.parentElement.previousElementSibling;
            if (sib) label = TXT(sib);
          }
          b.setAttribute("aria-label", (label || "切换选项").slice(0, 16));
        }
        return;
      }
      var v = TXT(b);
      if (/^生成打包清单$/.test(v)) { b.classList.add("xn-pack-primary"); return; }
      /* 清单勾选项：整行可点，36 → 44 */
      if (!b.getAttribute("role") && /hover:bg-gray-50/.test(b.className) && H(b) >= 30 && H(b) <= 40) {
        b.classList.add("xn-pack-item");
        b.setAttribute("type", "button");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", (v || "勾选物品").slice(0, 16));
      }
    });
  }

  function fields() {
    [].slice.call(document.querySelectorAll("#root select")).forEach(function (s) {
      s.classList.add("xn-pack-field");
      if (getComputedStyle(s).fontSize !== "16px") s.style.setProperty("font-size", "16px", "important");
      if (H(s) < 48) s.style.setProperty("min-height", "48px", "important");
    });
  }

  function run() {
    tabs();
    buttons();
    fields();
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
  setTimeout(run, 250);
  setTimeout(run, 700);
  setTimeout(run, 1600);
})();
