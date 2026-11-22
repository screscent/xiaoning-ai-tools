/* R1231 语言学习进度与复习合集：语义与尺寸增强（事件驱动，不改 React 状态） */
(function () {
  "use strict";
  var root = document.querySelector("#root");
  if (!root) return;
  var txt = function (e) { return (e.textContent || "").replace(/\s+/g, " ").trim(); };
  var vis = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };

  function nav() {
    var links = [].slice.call(root.querySelectorAll("a[href^='#']")).filter(function (a) {
      return vis(a) && /^0[1-6]/.test(txt(a));
    });
    if (!links.length) return;
    var bar = links[0].parentElement;
    if (bar) bar.classList.add("xn-study-nav");
    var cur = location.hash;
    links.forEach(function (a) {
      a.classList.add("xn-study-tab");
      var href = a.getAttribute("href") || "";
      var current = a.getAttribute("aria-current") === "page";
      var on = current || (cur && href === cur);
      var next = on ? "true" : "false";
      if (a.getAttribute("aria-selected") !== next) a.setAttribute("aria-selected", next);
    });
  }

  function copies() {
    [].slice.call(root.querySelectorAll("button")).forEach(function (b) {
      if (!vis(b)) return;
      if (/^复制/.test(txt(b))) { b.classList.add("xn-study-copy"); b.setAttribute("type", "button"); }
    });
  }

  function values() {
    [].slice.call(root.querySelectorAll("h3")).forEach(function (h) {
      if (!/结果|对照|计划|建议/.test(txt(h))) return;
      var box = h.parentElement;
      if (!box) return;
      [].slice.call(box.querySelectorAll("p")).forEach(function (p) {
        if (p.children.length) return;
        var s = txt(p);
        if (s.length > 40) return;
        if (!p.classList.contains("xn-study-value")) p.classList.add("xn-study-value");
      });
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
    try { nav(); copies(); values(); fields(); back(); } catch (e) {}
  }

  root.addEventListener("click", function () { [80, 360, 900].forEach(function (ms) { setTimeout(run, ms); }); }, true);
  root.addEventListener("input", function () { setTimeout(run, 120); }, true);
  root.addEventListener("change", function () { setTimeout(run, 120); }, true);
  window.addEventListener("load", function () { setTimeout(run, 300); });
  run();
  [200, 600, 1400].forEach(function (ms) { setTimeout(run, ms); });
  setInterval(function () { if (!document.hidden) run(); }, 1500);
})();
