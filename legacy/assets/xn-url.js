/* R1173 URL 清理与参数合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnUrl) return;
  window.__xnUrl = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var H = function (el) { return Math.round(el.getBoundingClientRect().height); };

  var TAB = /^(追踪参数清理|参数解析|链接重建|分享前检查|UTM 链接构建|追踪识别)$/;

  function tabs() {
    var list = [].slice.call(document.querySelectorAll("#root button")).filter(function (b) {
      return VIS(b) && TAB.test(TXT(b));
    });
    if (!list.length) return;
    var bar = list[0].parentElement;
    if (bar) bar.setAttribute("role", "tablist");
    list.forEach(function (b) {
      b.classList.add("xn-url-tab");
      b.setAttribute("role", "tab");
      var on = /(^|\s)bg-blue-600(\s|$)/.test(b.className) || /(^|\s)bg-blue-500(\s|$)/.test(b.className);
      b.setAttribute("aria-current", on ? "true" : "false");
      b.setAttribute("aria-selected", on ? "true" : "false");
      b.setAttribute("tabindex", on ? "0" : "-1");
    });
  }

  function buttons() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      if (b.getAttribute("role") === "switch") {
        b.classList.add("xn-url-switch");
        b.removeAttribute("aria-pressed");
        if (!b.getAttribute("aria-label")) {
          var label = (b.parentElement ? TXT(b.parentElement) : "").replace(/开关|切换/g, "").replace(/[#＃]+$/, "").trim();
          b.setAttribute("aria-label", label || "切换选项");
        }
        return;
      }
      if (/^清理追踪参数$/.test(TXT(b))) { b.classList.add("xn-url-primary"); b.setAttribute("type", "button"); }
    });
  }

  function fields() {
    [].slice.call(document.querySelectorAll("#root textarea")).forEach(function (t) {
      t.classList.add("xn-url-area");
      if (getComputedStyle(t).fontSize !== "16px") t.style.setProperty("font-size", "16px", "important");
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
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "aria-pressed", "aria-checked"] });
  setTimeout(run, 700);
  setTimeout(run, 1600);
})();
