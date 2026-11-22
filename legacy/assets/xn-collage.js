/* R1229 图片拼接与拼图合集：语义与尺寸增强（事件驱动，不改 React 状态） */
(function () {
  "use strict";
  var root = document.querySelector("#root");
  if (!root) return;
  var txt = function (e) { return (e.textContent || "").replace(/\s+/g, " ").trim(); };
  var vis = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var ROUTES = ["#/vertical", "#/horizontal", "#/grid", "#/border", "#/gap", "#/ratio"];

  function nav() {
    var links = [].slice.call(root.querySelectorAll("a[href^='#/']")).filter(vis);
    if (!links.length) return;
    var bar = links[0].parentElement;
    if (bar) {
      bar.classList.add("xn-collage-nav");
      bar.setAttribute("role", "tablist");
      bar.setAttribute("aria-label", "拼图工具切换");
    }
    var cur = location.hash || "#/vertical";
    links.forEach(function (a) {
      a.setAttribute("role", "tab");
      var href = a.getAttribute("href") || "";
      var on = href === cur || (!ROUTES.includes(cur) && href === "#/vertical") || a.getAttribute("aria-current") === "page";
      var next = on ? "true" : "false";
      if (a.getAttribute("aria-selected") !== next) a.setAttribute("aria-selected", next);
      a.setAttribute("tabindex", on ? "0" : "-1");
    });
  }

  function upload() {
    [].slice.call(root.querySelectorAll("div,label")).forEach(function (e) {
      if (!vis(e)) return;
      if (/点击或拖拽图片/.test(txt(e)) && txt(e).length < 120 && !e.classList.contains("xn-collage-upload")) {
        e.classList.add("xn-collage-upload");
      }
    });
  }

  function stats() {
    [].slice.call(root.querySelectorAll("div")).forEach(function (e) {
      if (!vis(e)) return;
      var s = txt(e);
      if (!/^图片数量[：:]/.test(s)) return;
      if (s.length > 90) return;
      if (!e.classList.contains("xn-collage-stats")) e.classList.add("xn-collage-stats");
    });
  }

  function fields() {
    [].slice.call(root.querySelectorAll("select")).forEach(function (s) {
      if (getComputedStyle(s).fontSize !== "16px") s.style.setProperty("font-size", "16px", "important");
      s.style.setProperty("min-height", "48px", "important");
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
    try { nav(); upload(); stats(); fields(); back(); } catch (e) {}
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
