/* R1223 时间块规划合集：语义与尺寸增强（事件驱动，不改 React 状态） */
(function () {
  "use strict";
  var root = document.querySelector("#root");
  if (!root) return;
  var txt = function (e) { return (e.textContent || "").replace(/\s+/g, " ").trim(); };
  var vis = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var ROUTES = ["#/blocks", "#/energy", "#/capacity", "#/review", "#/interrupt", "#/deeptask"];

  function nav() {
    var links = [].slice.call(root.querySelectorAll("a[href^='#/']")).filter(vis);
    if (!links.length) return;
    var bar = links[0].parentElement;
    if (bar) {
      bar.classList.add("xn-time-nav");
      bar.setAttribute("role", "tablist");
      bar.setAttribute("aria-label", "时间工具切换");
    }
    var cur = location.hash || "#/blocks";
    links.forEach(function (a) {
      a.setAttribute("role", "tab");
      var href = a.getAttribute("href") || "";
      var on = href === cur || (!ROUTES.includes(cur) && href === "#/blocks");
      var next = on ? "true" : "false";
      if (a.getAttribute("aria-selected") !== next) a.setAttribute("aria-selected", next);
      a.setAttribute("tabindex", on ? "0" : "-1");
    });
  }

  function buttons() {
    [].slice.call(root.querySelectorAll("button")).forEach(function (b) {
      if (!vis(b)) return;
      var label = txt(b);
      if (label === "添加时间块") { b.classList.add("xn-time-primary"); b.setAttribute("type", "button"); return; }
      if (/^(复制结果|复制建议|清空)$/.test(label)) { b.classList.add("xn-time-secondary"); b.setAttribute("type", "button"); return; }
      if (/^(晨型|夜型)$/.test(label)) {
        var box = b.parentElement;
        if (box && !box.classList.contains("xn-time-energy")) box.classList.add("xn-time-energy");
        var on = /(^|\s)bg-blue-50(\s|$)/.test(b.className) || /border-blue-400/.test(b.className);
        var next = on ? "true" : "false";
        if (b.getAttribute("aria-pressed") !== next) b.setAttribute("aria-pressed", next);
      }
    });
  }

  function stats() {
    [].slice.call(root.querySelectorAll("div.text-xl.font-bold, div.text-2xl.font-bold")).forEach(function (n) {
      n.classList.add("xn-time-num");
      var card = n.parentElement;
      if (card && !card.classList.contains("xn-time-stat")) card.classList.add("xn-time-stat");
    });
  }

  function empty() {
    [].slice.call(root.querySelectorAll("div,p,span")).forEach(function (e) {
      if (e.children.length) return;
      if (/暂无时间块/.test(txt(e)) && !e.classList.contains("xn-time-empty")) e.classList.add("xn-time-empty");
    });
  }

  function fields() {
    [].slice.call(root.querySelectorAll("select")).forEach(function (s) {
      if (getComputedStyle(s).fontSize !== "16px") s.style.setProperty("font-size", "16px", "important");
      s.style.setProperty("min-height", "48px", "important");
    });
    [].slice.call(root.querySelectorAll("input[type='time'],input[type='text']")).forEach(function (i) {
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
    try { nav(); buttons(); stats(); empty(); fields(); back(); } catch (e) {}
  }

  root.addEventListener("click", function () { setTimeout(run, 80); setTimeout(run, 360); }, true);
  root.addEventListener("input", function () { setTimeout(run, 120); }, true);
  root.addEventListener("change", function () { setTimeout(run, 120); }, true);
  window.addEventListener("hashchange", function () { setTimeout(run, 60); });
  window.addEventListener("load", function () { setTimeout(run, 300); });
  run();
  [200, 600, 1400].forEach(function (ms) { setTimeout(run, ms); });
  setInterval(function () { if (!document.hidden) run(); }, 1500);
})();
