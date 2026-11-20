/* R1141 日历文件与订阅合集 — 人用友好增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnIcs) return;
  window.__xnIcs = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  var H = function (el) { return Math.round(el.getBoundingClientRect().height); };

  /* 顶部 6 个工具条：64 高 + 当前项标记 */
  function tabs() {
    var box = null;
    [].slice.call(document.querySelectorAll("#root div")).forEach(function (d) {
      if (box) return;
      if (d.children.length !== 6) return;
      var cuts = [].slice.call(d.children);
      var ok = cuts.every(function (c) { return c.tagName === "A" && H(c) >= 40 && H(c) <= 90 && c.children.length >= 1; });
      if (ok) box = d;
    });
    if (!box) return;
    box.setAttribute("data-xn-ics-nav", "1");
    box.setAttribute("role", "tablist");
    [].slice.call(box.children).forEach(function (a) {
      a.classList.add("xn-ics-tab");
      a.setAttribute("role", "tab");
      var on = /\bbg-blue-600\b/.test(a.className);
      a.setAttribute("aria-selected", on ? "true" : "false");
      if (on) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
      var title = a.querySelector("span");
      if (title && !a.getAttribute("aria-label")) a.setAttribute("aria-label", TXT(a));
    });
  }

  /* 按钮：填入示例 / 复制 / 下载 */
  function actions() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      var s = TXT(b);
      if (s === "填入示例数据") {
        b.classList.add("xn-ics-link");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "填入示例事件数据");
      } else if (s === "复制 ICS") {
        b.classList.add("xn-ics-secondary");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "复制生成的 ICS 文本");
      } else if (/^下载\s*calendar\.ics$/.test(s) || s === "下载 calendar.ics") {
        b.classList.add("xn-ics-primary");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "下载 calendar.ics 文件");
      } else if (s === "复制" || s === "一键复制") {
        b.classList.add("xn-ics-secondary");
      }
    });
  }

  /* 返回工具集 → 40px */
  function back() {
    [].slice.call(document.querySelectorAll("#root a")).forEach(function (a) {
      if (!VIS(a)) return;
      if (!/返回工具集/.test(TXT(a))) return;
      a.classList.add("xn-ics-back");
      a.setAttribute("aria-label", "返回工具集列表");
    });
  }

  /* 使用说明区 → 13px / 1.75 */
  function help() {
    [].slice.call(document.querySelectorAll("#root h2, #root h3, #root div, #root p, #root span")).forEach(function (h) {
      if (h.children.length) return;
      if (TXT(h) !== "使用说明") return;
      var sec = h.closest("section") || h.parentElement;
      if (sec && sec.getAttribute("data-xn-ics-help") !== "1") sec.setAttribute("data-xn-ics-help", "1");
    });
  }

  function run() {
    tabs();
    actions();
    back();
    help();
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
