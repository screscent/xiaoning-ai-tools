/* R1243 决策与抽签合集：tabs / 按钮 / 标题 / 输入语义（事件驱动，不改 React 状态） */
(function () {
  "use strict";
  var root = document.querySelector("#root");
  if (!root) return;
  var txt = function (e) { return (e.textContent || "").replace(/\s+/g, " ").trim(); };
  var vis = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var ROUTES = ["#/random", "#/weighted", "#/vote", "#/picker", "#/borda", "#/matrix"];

  function tabs() {
    var links = [].slice.call(root.querySelectorAll("nav a[href^='#/']")).filter(vis);
    if (!links.length) return;
    var nav = links[0].parentElement;
    nav.classList.add("xn-choice-tabs");
    nav.setAttribute("role", "tablist");
    nav.setAttribute("aria-label", "决策工具切换");
    var cur = location.hash || "#/random";
    links.forEach(function (a) {
      a.setAttribute("role", "tab");
      var href = a.getAttribute("href") || "";
      var on = href === cur || (ROUTES.indexOf(cur) < 0 && href === "#/random");
      var next = on ? "true" : "false";
      if (a.getAttribute("aria-selected") !== next) a.setAttribute("aria-selected", next);
      a.setAttribute("tabindex", on ? "0" : "-1");
    });
  }

  function buttons() {
    [].slice.call(root.querySelectorAll("button")).forEach(function (b) {
      if (!vis(b)) return;
      var s = txt(b);
      if (/^(再抽一次|按权重抽取|抽一个|重置|复制结果)$/.test(s)) {
        b.classList.add("xn-choice-act");
        b.setAttribute("type", "button");
        return;
      }
      if (s === "添加选项") {
        b.classList.add("xn-choice-add");
        b.setAttribute("type", "button");
        return;
      }
      if (s === "清空历史") {
        b.classList.add("xn-choice-hist");
        b.setAttribute("type", "button");
        return;
      }
      if (!s && b.getAttribute("aria-label") === "删除选项") {
        b.classList.add("xn-choice-del");
        b.setAttribute("type", "button");
      }
    });
  }

  function headings() {
    [].slice.call(root.querySelectorAll("h2")).forEach(function (h) {
      if (h.children.length) return;
      var s = h.textContent || "";
      if (/^\s*工具[A-Z]\s+/.test(s)) h.textContent = s.replace(/^\s*工具[A-Z]\s+/, "");
    });
  }

  function tweaks() {
    [].slice.call(root.querySelectorAll("a")).forEach(function (a) {
      if (!/返回工具集/.test(txt(a))) return;
      a.style.setProperty("min-height", "44px", "important");
      a.style.setProperty("display", "inline-flex", "important");
      a.style.setProperty("align-items", "center", "important");
    });
    [].slice.call(root.querySelectorAll("input:not([type]),input[type='text']")).forEach(function (i) {
      if (getComputedStyle(i).fontSize !== "16px") i.style.setProperty("font-size", "16px", "important");
      i.style.setProperty("min-height", "48px", "important");
    });
    [].slice.call(root.querySelectorAll("textarea")).forEach(function (t) {
      if (getComputedStyle(t).fontSize !== "16px") t.style.setProperty("font-size", "16px", "important");
    });
  }

  function run() {
    try { tabs(); buttons(); headings(); tweaks(); } catch (e) {}
  }

  root.addEventListener("click", function () { [60, 260, 700].forEach(function (ms) { setTimeout(run, ms); }); }, true);
  root.addEventListener("input", function () { setTimeout(run, 140); }, true);
  window.addEventListener("hashchange", function () { setTimeout(run, 90); });
  window.addEventListener("load", function () { setTimeout(run, 300); });
  run();
  [200, 600, 1400].forEach(function (ms) { setTimeout(run, ms); });
  setInterval(function () { if (!document.hidden) run(); }, 1500);
})();
