/* R1121 日语五十音入门合集 — 人用友好增强（幂等，不碰 React 状态） */
(function () {
  "use strict";
  if (window.__xnJp) return;
  window.__xnJp = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  function tabs() {
    var anchors = [].slice.call(document.querySelectorAll("#root a")).filter(function (a) {
      var p = a.parentElement;
      var s = TXT(a);
      return p && p.className && p.className.indexOf("flex-wrap") >= 0 && p.querySelectorAll("a").length >= 4 && s.length >= 2 && s.length <= 8;
    });
    if (!anchors.length) return;
    var box = anchors[0].parentElement;
    if (box.getAttribute("data-xn-jp-tabs") !== "1") {
      box.setAttribute("data-xn-jp-tabs", "1");
      box.classList.add("xn-jp-tabs");
      box.setAttribute("role", "tablist");
      box.setAttribute("aria-label", "日语工具");
    }
    anchors.forEach(function (a) {
      var active = (a.className || "").indexOf("bg-slate-900") >= 0;
      a.classList.add("xn-jp-tab");
      a.setAttribute("role", "tab");
      a.setAttribute("aria-selected", active ? "true" : "false");
      if (active) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
      if (!a.getAttribute("aria-label")) a.setAttribute("aria-label", TXT(a));
    });
  }

  function actions() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      var s = TXT(b);
      if (/^一键复制|^复制/.test(s)) {
        b.classList.add("xn-jp-copy");
        var cl = "复制结果，复制到剪贴板";
        if (b.getAttribute("aria-label") !== cl) b.setAttribute("aria-label", cl);
        if (!b.getAttribute("title")) b.setAttribute("title", cl);
        return;
      }
      if (/^清空/.test(s)) {
        b.classList.add("xn-jp-clear");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "清空输入与结果");
        return;
      }
      if (/^重新抽题/.test(s)) {
        b.classList.add("xn-jp-again");
        var gl = "重新随机抽题";
        if (b.getAttribute("aria-label") !== gl) b.setAttribute("aria-label", gl);
      }
    });
  }

  function items() {
    [].slice.call(document.querySelectorAll("#root div.rounded-xl")).forEach(function (d) {
      if (d.getBoundingClientRect().height < 50) return;
      if (!d.querySelector("h4")) return;
      if (d.querySelector("input, select, textarea")) return;
      d.classList.add("xn-jp-item");
    });
  }

  function headings() {
    [].slice.call(document.querySelectorAll("#root h1, #root h2")).forEach(function (h) {
      [].slice.call(h.childNodes).forEach(function (node) {
        if (node.nodeType === 3 && /^\s*工具[A-Z]\s+/.test(node.textContent)) {
          node.textContent = node.textContent.replace(/^\s*工具[A-Z]\s+/, "");
        }
      });
    });
  }

  function run() {
    tabs();
    actions();
    items();
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
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  setTimeout(run, 700);
  setTimeout(run, 1500);
})();
