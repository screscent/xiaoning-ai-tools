/* R1233 待办与任务管理合集：语义与尺寸增强（事件驱动，不改 React 状态） */
(function () {
  "use strict";
  var root = document.querySelector("#root");
  if (!root) return;
  var txt = function (e) { return (e.textContent || "").replace(/\s+/g, " ").trim(); };
  var vis = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var ROUTES = ["#/todo", "#/routine", "#/review", "#/archive", "#/eisen", "#/timer"];

  function nav() {
    var links = [].slice.call(root.querySelectorAll("a[href^='#']")).filter(function (a) {
      return vis(a) && a.getBoundingClientRect().height <= 80;
    });
    if (!links.length) return;
    var bar = links[0].parentElement;
    if (bar) {
      bar.classList.add("xn-task-nav");
      bar.setAttribute("role", "tablist");
      bar.setAttribute("aria-label", "任务工具切换");
    }
    var cur = location.hash || "#/todo";
    links.forEach(function (a) {
      a.classList.add("xn-task-tab");
      a.setAttribute("role", "tab");
      var href = a.getAttribute("href") || "";
      var on = href === cur || (!ROUTES.includes(cur) && href === "#/todo");
      var next = on ? "true" : "false";
      if (a.getAttribute("aria-selected") !== next) a.setAttribute("aria-selected", next);
      a.setAttribute("tabindex", on ? "0" : "-1");
    });
  }

  function buttons() {
    [].slice.call(root.querySelectorAll("button")).forEach(function (b) {
      if (!vis(b)) return;
      var label = txt(b);
      if (label === "复制结果") { b.classList.add("xn-task-secondary"); b.setAttribute("type", "button"); return; }
      if (label === "生成今日待办") { b.classList.add("xn-task-primary"); b.setAttribute("type", "button"); return; }
      if (/^(今日回顾|本周回顾)$/.test(label)) {
        b.classList.add("xn-task-toggle");
        var on = /(^|\s)bg-blue-(500|600)(\s|$)/.test(b.className);
        var next = on ? "true" : "false";
        if (b.getAttribute("aria-pressed") !== next) b.setAttribute("aria-pressed", next);
      }
    });
  }

  function numbers() {
    [].slice.call(root.querySelectorAll("div,span")).forEach(function (e) {
      if (e.children.length || !/^\d+$/.test(txt(e))) return;
      var p = e.parentElement;
      if (!p) return;
      var pt = txt(p);
      if (!/总数|未完成|已完成|条/.test(pt)) return;
      if (!e.classList.contains("xn-task-num")) e.classList.add("xn-task-num");
    });
  }

  function fields() {
    [].slice.call(root.querySelectorAll("input[type='text'],input[type='date'],select")).forEach(function (i) {
      if (getComputedStyle(i).fontSize !== "16px") i.style.setProperty("font-size", "16px", "important");
      i.style.setProperty("min-height", "48px", "important");
    });
    [].slice.call(root.querySelectorAll("textarea")).forEach(function (t) {
      if (getComputedStyle(t).fontSize !== "16px") t.style.setProperty("font-size", "16px", "important");
      t.style.setProperty("min-height", "120px", "important");
    });
  }

  function cleanHeadings() {
    [].slice.call(root.querySelectorAll("h1,h2,h3,h4")).forEach(function (h) {
      var target = h;
      if (h.children.length === 1 && !h.children[0].children.length) target = h.children[0];
      else if (h.children.length) return;
      var s = target.textContent || "";
      if (!/^\s*工具[A-Z]\s+/.test(s)) return;
      var next = s.replace(/^\s*工具[A-Z]\s+/, "");
      if (next) target.textContent = next;
    });
  }

  function back() {
    [].slice.call(root.querySelectorAll("a")).forEach(function (a) {
      if (!/返回工具集/.test(txt(a))) return;
      a.style.setProperty("min-height", "44px", "important");
      a.style.setProperty("display", "inline-flex", "important");
      a.style.setProperty("align-items", "center", "important");
    });
  }

  function run() {
    try { nav(); buttons(); numbers(); fields(); cleanHeadings(); back(); } catch (e) {}
  }

  root.addEventListener("click", function () { [80, 360, 900].forEach(function (ms) { setTimeout(run, ms); }); }, true);
  root.addEventListener("input", function () { setTimeout(run, 120); }, true);
  root.addEventListener("change", function () { setTimeout(run, 120); }, true);
  window.addEventListener("hashchange", function () { setTimeout(run, 60); });
  window.addEventListener("load", function () { setTimeout(run, 300); });
  run();
  [200, 600, 1400].forEach(function (ms) { setTimeout(run, ms); });
  setInterval(function () { if (!document.hidden) run(); }, 1500);
})();
