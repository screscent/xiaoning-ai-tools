/* R1230 色温与照明计算合集：语义与尺寸增强（事件驱动，不改 React 状态） */
(function () {
  "use strict";
  var root = document.querySelector("#root");
  if (!root) return;
  var txt = function (e) { return (e.textContent || "").replace(/\s+/g, " ").trim(); };
  var vis = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };

  function grid() {
    [].slice.call(root.querySelectorAll("div.grid")).forEach(function (g) {
      if (g.classList.contains("xn-lamp-grid")) return;
      var links = g.querySelectorAll("a[href^='#/']");
      if (links.length >= 6) g.classList.add("xn-lamp-grid");
    });
  }

  function pills() {
    [].slice.call(root.querySelectorAll("button")).forEach(function (b) {
      if (!vis(b)) return;
      var label = txt(b);
      if (/\slx$/.test(label) || /^C1[06]/.test(label) || /^(LED|节能灯|白炽灯)$/.test(label)) {
        b.classList.add("xn-lamp-pill");
        var cls = b.className;
        var group = /bg-emerald-6/.test(cls) || /border-emerald-5/.test(cls) ? "emerald"
          : /bg-rose-6/.test(cls) || /border-rose-5/.test(cls) ? "rose"
          : /bg-amber-6/.test(cls) || /border-amber-5/.test(cls) ? "amber" : "sky";
        b.classList.add("xn-lamp-pill--" + group);
        var on = /(^|\s)bg-(sky|emerald|rose|amber)-600(\s|$)/.test(cls);
        var next = on ? "true" : "false";
        if (b.getAttribute("aria-pressed") !== next) b.setAttribute("aria-pressed", next);
        return;
      }
      if (label === "复制") { b.classList.add("xn-lamp-copy"); b.setAttribute("type", "button"); }
    });
  }

  function checks() {
    [].slice.call(root.querySelectorAll("label")).forEach(function (l) {
      if (!vis(l)) return;
      if (!l.querySelector("input[type='checkbox']")) return;
      if (!l.classList.contains("xn-lamp-check")) l.classList.add("xn-lamp-check");
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
    // 入口卡标题（a 内首个文本块）
    [].slice.call(root.querySelectorAll("a[href^='#/']")).forEach(function (a) {
      [].slice.call(a.children).forEach(function (c) {
        if (c.children.length) return;
        var s = c.textContent || "";
        if (!/^\s*工具[A-Z]\s+/.test(s)) return;
        var next = s.replace(/^\s*工具[A-Z]\s+/, "");
        if (next) c.textContent = next;
      });
    });
  }

  function back() {
    [].slice.call(root.querySelectorAll("a")).forEach(function (a) {
      if (!/^返回/.test(txt(a))) return;
      a.style.setProperty("min-height", "44px", "important");
      a.style.setProperty("display", "inline-flex", "important");
      a.style.setProperty("align-items", "center", "important");
    });
  }

  function run() {
    try { grid(); pills(); checks(); cleanHeadings(); back(); } catch (e) {}
  }

  root.addEventListener("click", function () { [80, 360, 900].forEach(function (ms) { setTimeout(run, ms); }); }, true);
  root.addEventListener("input", function () { setTimeout(run, 120); }, true);
  root.addEventListener("change", function () { setTimeout(run, 120); }, true);
  window.addEventListener("load", function () { setTimeout(run, 300); });
  run();
  [200, 600, 1400].forEach(function (ms) { setTimeout(run, ms); });
  setInterval(function () { if (!document.hidden) run(); }, 1500);
})();
