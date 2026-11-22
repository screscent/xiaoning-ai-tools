/* R1224 手绘与标注合集：语义与尺寸增强（事件驱动，不改 React 状态） */
(function () {
  "use strict";
  var root = document.querySelector("#root");
  if (!root) return;
  var txt = function (e) { return (e.textContent || "").replace(/\s+/g, " ").trim(); };
  var vis = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var ROUTES = ["#/draw", "#/annotate", "#/flow", "#/sign", "#/legend", "#/template"];

  function hex(c) {
    var m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(c || "");
    if (!m) return "";
    var t = function (n) { return ("0" + parseInt(n, 10).toString(16)).slice(-2); };
    return "#" + t(m[1]) + t(m[2]) + t(m[3]);
  }

  function nav() {
    var links = [].slice.call(root.querySelectorAll("a[href^='#/']")).filter(vis);
    if (!links.length) return;
    var bar = links[0].parentElement;
    if (bar) {
      bar.classList.add("xn-draw-nav");
      bar.setAttribute("role", "tablist");
      bar.setAttribute("aria-label", "绘图工具切换");
    }
    var cur = location.hash || "#/draw";
    links.forEach(function (a) {
      a.setAttribute("role", "tab");
      var href = a.getAttribute("href") || "";
      var on = href === cur || (!ROUTES.includes(cur) && href === "#/draw");
      var next = on ? "true" : "false";
      if (a.getAttribute("aria-selected") !== next) a.setAttribute("aria-selected", next);
      a.setAttribute("tabindex", on ? "0" : "-1");
    });
  }

  function swatches() {
    [].slice.call(root.querySelectorAll("button")).forEach(function (b) {
      if (!vis(b)) return;
      var cls = b.className.toString();
      if (!/(^|\s)(w-8|w-7)(\s|$)/.test(cls) || !/rounded-full/.test(cls)) return;
      b.classList.add("xn-draw-swatch");
      var on = /border-blue-600/.test(cls) || /ring-2/.test(cls);
      var next = on ? "true" : "false";
      if (b.getAttribute("aria-pressed") !== next) b.setAttribute("aria-pressed", next);
      if (!b.getAttribute("aria-label")) {
        var h = hex(getComputedStyle(b).backgroundColor);
        b.setAttribute("aria-label", h ? "颜色 " + h : "颜色选项");
      }
    });
  }

  function groups() {
    var seen = [];
    [].slice.call(root.querySelectorAll("button")).forEach(function (b) {
      if (!vis(b)) return;
      var cls = b.className.toString();
      if (b.classList.contains("xn-draw-swatch")) return;
      var parent = b.parentElement;
      if (!parent || seen.includes(parent)) return;
      var kids = [].slice.call(parent.querySelectorAll("button")).filter(vis);
      var hasBlue = kids.some(function (k) { return /(^|\s)bg-blue-600(\s|$)/.test(k.className); });
      if (!hasBlue) return;
      seen.push(parent);
      kids.forEach(function (k) {
        var kc = k.className.toString();
        if (k.classList.contains("xn-draw-swatch")) return;
        if (/(^|\s)bg-green-6/.test(kc) || /(^|\s)bg-red-5/.test(kc)) return;
        k.classList.add("xn-draw-mode");
        var on = /(^|\s)bg-blue-600(\s|$)/.test(kc);
        var next = on ? "true" : "false";
        if (k.getAttribute("aria-pressed") !== next) k.setAttribute("aria-pressed", next);
      });
    });
  }

  function actions() {
    [].slice.call(root.querySelectorAll("button")).forEach(function (b) {
      if (!vis(b)) return;
      if (b.classList.contains("xn-draw-swatch")) return;
      var cls = b.className.toString();
      if (/(^|\s)bg-green-6/.test(cls)) { b.classList.add("xn-draw-download"); b.setAttribute("type", "button"); return; }
      if (/(^|\s)bg-red-5/.test(cls)) { b.classList.add("xn-draw-clear"); b.setAttribute("type", "button"); return; }
      if (/(^|\s)bg-gray-100(\s|$)/.test(cls) && !b.classList.contains("xn-draw-mode")) {
        b.classList.add("xn-draw-secondary");
        b.setAttribute("type", "button");
      }
    });
  }

  function fields() {
    [].slice.call(root.querySelectorAll("input[type='text'],input[type='number'],input[type='time'],textarea")).forEach(function (i) {
      if (getComputedStyle(i).fontSize !== "16px") i.style.setProperty("font-size", "16px", "important");
      i.style.setProperty("min-height", i.tagName === "TEXTAREA" ? "200px" : "48px", "important");
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
    try { nav(); swatches(); groups(); actions(); fields(); back(); } catch (e) {}
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
