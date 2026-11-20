/* R1119 露营与户外安全合集 — 人用友好增强（幂等，不碰 React 状态） */
(function () {
  "use strict";
  if (window.__xnCamp) return;
  window.__xnCamp = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  function stripPrefix(el) {
    [].slice.call(el.childNodes).forEach(function (node) {
      if (node.nodeType === 3 && /^\s*工具[A-Z]\s+/.test(node.textContent)) {
        node.textContent = node.textContent.replace(/^\s*工具[A-Z]\s+/, "");
      }
    });
  }

  function tabs() {
    var pills = [].slice.call(document.querySelectorAll("#root button.tool-pill"));
    var groups = {};
    pills.forEach(function (b) {
      var p = b.parentElement;
      if (!p) return;
      var key = p.className || "";
      if (key.indexOf("mt-4") >= 0) return;
      (groups[key] = groups[key] || []).push(b);
    });
    var tabBtns = null;
    Object.keys(groups).forEach(function (k) {
      if (groups[k].length >= 4 && !tabBtns) tabBtns = groups[k];
    });
    if (!tabBtns) return;
    var box = tabBtns[0].parentElement;
    if (box.getAttribute("data-xn-camp-tabs") !== "1") {
      box.setAttribute("data-xn-camp-tabs", "1");
      box.classList.add("xn-camp-tabs");
      box.setAttribute("role", "tablist");
      box.setAttribute("aria-label", "露营工具");
    }
    tabBtns.forEach(function (b) {
      stripPrefix(b);
      var active = (b.className || "").indexOf("bg-emerald-700") >= 0;
      b.classList.add("xn-camp-tab");
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", active ? "true" : "false");
      if (active) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", TXT(b));
    });
  }

  function groups() {
    var pills = [].slice.call(document.querySelectorAll("#root button.tool-pill"));
    var byGroup = {};
    pills.forEach(function (b) {
      if (b.classList.contains("xn-camp-tab")) return;
      if (/^复制/.test(TXT(b))) return;
      var p = b.parentElement;
      if (!p || !VIS(b)) return;
      var active = (b.className || "").indexOf("bg-emerald-700") >= 0 || (b.className || "").indexOf("bg-amber-700") >= 0;
      var h = b.getBoundingClientRect().height;
      if (h > 50) {
        b.classList.add("xn-camp-opt");
        if ((b.className || "").indexOf("bg-amber-700") >= 0) b.classList.add("xn-camp-opt-amber");
      } else b.classList.add("xn-camp-chip");
      b.setAttribute("aria-pressed", active ? "true" : "false");
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", TXT(b));
      byGroup[p.className || ""] = byGroup[p.className || ""] || [];
      byGroup[p.className || ""].push({ b: b, p: p });
    });
    Object.keys(byGroup).forEach(function (k) {
      var first = byGroup[k][0];
      var p = first.p;
      if (p.getAttribute("data-xn-camp-group") === "1") return;
      p.setAttribute("data-xn-camp-group", "1");
      p.setAttribute("role", "group");
      var label = /amber/.test(k) ? "选择强度" : "选择场景或类型";
      p.setAttribute("aria-label", label);
    });
  }

  function copies() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      var s = TXT(b);
      if (!/^复制/.test(s)) return;
      b.classList.add("xn-camp-copy");
      var label = s + "，复制到剪贴板";
      if (b.getAttribute("aria-label") !== label) b.setAttribute("aria-label", label);
      if (!b.getAttribute("title")) b.setAttribute("title", label);
    });
  }

  function ranges() {
    var list = [].slice.call(document.querySelectorAll("#root input[type=range]")).filter(VIS);
    if (!list.length) return;
    var seen = {};
    list.forEach(function (r) {
      var cur = r.getAttribute("aria-label") || "";
      seen[cur] = (seen[cur] || 0) + 1;
      if ((cur === "人数" || cur === "") && seen[cur] === 2) r.setAttribute("aria-label", "天数");
      if (!r.getAttribute("aria-label")) r.setAttribute("aria-label", "滑动选择");
    });
  }

  function cards() {
    [].slice.call(document.querySelectorAll("#root div.rounded-xl")).forEach(function (d) {
      if (d.getBoundingClientRect().height < 80) return;
      if (d.className.indexOf("border-stone-200") < 0) return;
      if (d.querySelector("button")) return;
      d.classList.add("xn-camp-card");
    });
  }

  function headings() {
    [].slice.call(document.querySelectorAll("#root h1, #root h2, #root h3")).forEach(stripPrefix);
  }

  function run() {
    tabs();
    groups();
    copies();
    ranges();
    cards();
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
