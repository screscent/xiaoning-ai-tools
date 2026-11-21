/* R1172 TOML / JSON / YAML 互转合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnCodec) return;
  window.__xnCodec = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var H = function (el) { return Math.round(el.getBoundingClientRect().height); };
  var W = function (el) { return Math.round(el.getBoundingClientRect().width); };

  var TAB = /^(TOML转JSON|JSON转YAML|JSON转TOML|YAML转JSON|TOML转YAML|YAML转TOML)$/;

  function tabs() {
    var list = [].slice.call(document.querySelectorAll("#root button")).filter(function (b) {
      return VIS(b) && TAB.test(TXT(b));
    });
    if (!list.length) return;
    var bar = list[0].parentElement;
    if (bar) bar.setAttribute("role", "tablist");
    list.forEach(function (b) {
      b.classList.add("xn-codec-tab");
      b.setAttribute("role", "tab");
      var on = /(^|\s)bg-blue-500(\s|$)/.test(b.className) && /(^|\s)text-white(\s|$)/.test(b.className);
      b.setAttribute("aria-current", on ? "true" : "false");
      b.setAttribute("aria-selected", on ? "true" : "false");
      b.setAttribute("tabindex", on ? "0" : "-1");
    });
  }

  function buttons() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      var v = TXT(b);
      if (/w-11/.test(b.className) && H(b) <= 30) {
        b.classList.add("xn-codec-switch");
        var on = /(^|\s)bg-blue-500(\s|$)/.test(b.className) || /(^|\s)bg-blue-600(\s|$)/.test(b.className);
        /* 通用皮肤会给 aria-pressed 按钮刷白底并加 ✓，开关必须用 role=switch/aria-checked */
        b.removeAttribute("aria-pressed");
        b.setAttribute("role", "switch");
        b.setAttribute("aria-checked", on ? "true" : "false");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "展开点号键");
        return;
      }
      if (/^转\s*换$/.test(v)) { b.classList.add("xn-codec-primary"); b.setAttribute("type", "button"); return; }
      if (/^(复制结果|交换方向|清空)$/.test(v)) { b.classList.add("xn-codec-action"); b.setAttribute("type", "button"); return; }
    });
  }

  function fields() {
    [].slice.call(document.querySelectorAll("#root select")).forEach(function (s) {
      s.classList.add("xn-codec-field");
      if (getComputedStyle(s).fontSize !== "16px") s.style.setProperty("font-size", "16px", "important");
      if (H(s) < 48) s.style.setProperty("min-height", "48px", "important");
    });
    [].slice.call(document.querySelectorAll("#root textarea")).forEach(function (t) {
      t.classList.add("xn-codec-area");
      if (getComputedStyle(t).fontSize !== "16px") t.style.setProperty("font-size", "16px", "important");
    });
    [].slice.call(document.querySelectorAll("#root pre")).forEach(function (e) {
      if (VIS(e)) e.classList.add("xn-codec-pre");
    });
  }

  var MARK = /^\s*[①②③④⑤⑥⑦⑧⑨⑩]\s*/;

  function headings() {
    [].slice.call(document.querySelectorAll("#root h1, #root h2, #root h3")).forEach(function (h) {
      var w = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
      var n;
      while ((n = w.nextNode())) {
        var v = n.nodeValue.replace(MARK, "");
        if (v !== n.nodeValue) n.nodeValue = v;
      }
    });
  }

  function run() {
    tabs();
    buttons();
    fields();
    headings();
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
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "aria-pressed"] });
  setTimeout(run, 700);
  setTimeout(run, 1600);
})();
