/* R1232 JSON 与 SQL 互转合集：语义与尺寸增强（事件驱动，不改 React 状态） */
(function () {
  "use strict";
  var root = document.querySelector("#root");
  if (!root) return;
  var txt = function (e) { return (e.textContent || "").replace(/\s+/g, " ").trim(); };
  var vis = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };

  function nav() {
    var links = [].slice.call(root.querySelectorAll("a[href^='#']")).filter(function (a) {
      return vis(a) && a.getBoundingClientRect().height <= 80;
    });
    if (!links.length) return;
    var bar = links[0].parentElement;
    if (bar) bar.classList.add("xn-sql-nav");
    links.forEach(function (a) {
      a.classList.add("xn-sql-tab");
      var current = a.getAttribute("aria-current") === "page";
      var next = current ? "true" : "false";
      if (a.getAttribute("aria-selected") !== next) a.setAttribute("aria-selected", next);
    });
  }

  function buttons() {
    [].slice.call(root.querySelectorAll("button")).forEach(function (b) {
      if (!vis(b)) return;
      var cls = b.className.toString();
      var label = txt(b);
      if (/^(是|否|是（按月）)$/.test(label)) {
        b.classList.add("xn-sql-toggle");
        var on = /(^|\s)bg-(indigo|blue|slate)-(600|900)(\s|$)/.test(cls) || getComputedStyle(b).backgroundColor === "rgb(79, 70, 229)";
        var next = on ? "true" : "false";
        if (b.getAttribute("aria-pressed") !== next) b.setAttribute("aria-pressed", next);
        return;
      }
      if (/^(复制|清空)$/.test(label)) {
        b.classList.add(label === "复制" ? "xn-sql-primary" : "xn-sql-secondary");
        b.setAttribute("type", "button");
        return;
      }
      // 关键字速查 / 连接场景等标签按钮
      b.classList.add("xn-sql-secondary");
      b.setAttribute("type", "button");
    });
  }

  function fields() {
    [].slice.call(root.querySelectorAll("textarea")).forEach(function (t) {
      if (getComputedStyle(t).fontSize !== "16px") t.style.setProperty("font-size", "16px", "important");
      t.style.setProperty("min-height", "280px", "important");
    });
    [].slice.call(root.querySelectorAll("input[type='text']")).forEach(function (i) {
      if (getComputedStyle(i).fontSize !== "16px") i.style.setProperty("font-size", "16px", "important");
      i.style.setProperty("min-height", "48px", "important");
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
    try { nav(); buttons(); fields(); back(); } catch (e) {}
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
