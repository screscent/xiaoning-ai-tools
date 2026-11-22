/* R1225 电脑装机与硬件兼容合集：语义与尺寸增强（事件驱动，不改 React 状态） */
(function () {
  "use strict";
  var root = document.querySelector("#root");
  if (!root) return;
  var txt = function (e) { return (e.textContent || "").replace(/\s+/g, " ").trim(); };
  var vis = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };

  function tabs() {
    [].slice.call(root.querySelectorAll("button[role='tab']")).forEach(function (b) {
      if (!vis(b)) return;
      b.classList.add("xn-pc-tab");
      var bar = b.parentElement;
      if (bar && !bar.classList.contains("xn-pc-tabs")) bar.classList.add("xn-pc-tabs");
    });
  }

  function toggles() {
    [].slice.call(root.querySelectorAll("button")).forEach(function (b) {
      if (!vis(b)) return;
      var label = txt(b);
      if (/^(是|否)$/.test(label) && !b.getAttribute("role")) {
        b.classList.add("xn-pc-toggle");
        var on = /bg-\[#c9f75a\]/.test(b.className) || getComputedStyle(b).backgroundColor === "rgb(201, 247, 90)";
        var next = on ? "true" : "false";
        if (b.getAttribute("aria-pressed") !== next) b.setAttribute("aria-pressed", next);
      }
    });
  }

  function copies() {
    [].slice.call(root.querySelectorAll("button")).forEach(function (b) {
      if (!vis(b)) return;
      if (/^复制(结果|方案|清单|建议|文本)?/.test(txt(b))) b.classList.add("xn-pc-copy");
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
    try { tabs(); toggles(); copies(); fields(); back(); } catch (e) {}
  }

  root.addEventListener("click", function () { setTimeout(run, 80); setTimeout(run, 360); }, true);
  root.addEventListener("input", function () { setTimeout(run, 120); }, true);
  root.addEventListener("change", function () { setTimeout(run, 120); }, true);
  window.addEventListener("load", function () { setTimeout(run, 300); });
  run();
  [200, 600, 1400].forEach(function (ms) { setTimeout(run, ms); });
  setInterval(function () { if (!document.hidden) run(); }, 1500);
})();
