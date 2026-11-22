/* R1235 口腔与牙齿护理速查合集：语义与尺寸增强（事件驱动，不改 React 状态） */
(function () {
  "use strict";
  var root = document.querySelector("#root");
  if (!root) return;
  var txt = function (e) { return (e.textContent || "").replace(/\s+/g, " ").trim(); };
  var vis = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };

  function cards() {
    var links = [].slice.call(root.querySelectorAll("a[href^='#/']")).filter(vis);
    if (!links.length) return;
    var wrap = links[0].parentElement;
    if (wrap) wrap.classList.add("xn-oral-cards");
    links.forEach(function (a) {
      a.setAttribute("aria-label", txt(a).replace(/\s+/g, " "));
      var sub = a.querySelector("span.mt-0\\.5");
      if (sub) {
        var s = sub.textContent || "";
        if (/^\s*工具[A-Z]\s*/.test(s)) sub.textContent = s.replace(/^\s*工具[A-Z]\s*/, "");
      }
    });
  }

  /* 选项芯片：组名取 aria-label 前缀，组容器补 role/aria-label */
  function chips() {
    var list = [].slice.call(root.querySelectorAll("button[aria-pressed]")).filter(vis);
    if (!list.length) return;
    var groups = [];
    list.forEach(function (b) {
      b.classList.add("xn-oral-chip");
      var g = b.parentElement;
      if (g && groups.indexOf(g) < 0) groups.push(g);
    });
    groups.forEach(function (g) {
      var first = g.querySelector("button[aria-pressed]");
      var label = (first && first.getAttribute("aria-label") || "").split("：")[0].trim();
      if (!label) {
        var prev = g.previousElementSibling;
        label = prev ? txt(prev) : "";
      }
      if (label) {
        g.setAttribute("role", "group");
        g.setAttribute("aria-label", label);
        var prevEl = g.previousElementSibling;
        if (prevEl && prevEl.children.length === 0 && txt(prevEl).length < 20) prevEl.classList.add("xn-oral-label");
      }
    });
  }

  /* 标题去「工具D/E/F」前缀 */
  function headings() {
    [].slice.call(root.querySelectorAll("h2,h3")).forEach(function (h) {
      if (h.children.length) return;
      var s = h.textContent || "";
      if (/^\s*工具[A-F]\s+/.test(s)) h.textContent = s.replace(/^\s*工具[A-F]\s+/, "");
    });
  }

  function tweaks() {
    [].slice.call(root.querySelectorAll("a")).forEach(function (a) {
      if (!/返回工具集/.test(txt(a))) return;
      a.style.setProperty("min-height", "44px", "important");
      a.style.setProperty("display", "inline-flex", "important");
      a.style.setProperty("align-items", "center", "important");
      a.style.setProperty("padding", "0 4px", "important");
    });
    [].slice.call(root.querySelectorAll("input[type='date'],input[type='text']")).forEach(function (i) {
      if (getComputedStyle(i).fontSize !== "16px") i.style.setProperty("font-size", "16px", "important");
      i.style.setProperty("min-height", "48px", "important");
    });
    /* 结果中的日期值：加大字重与字号 */
    [].slice.call(root.querySelectorAll("dd")).forEach(function (dd) {
      if (dd.children.length === 0 && /^\d{4}-\d{2}-\d{2}$/.test(txt(dd))) {
        dd.classList.add("xn-oral-date");
        dd.style.setProperty("font-size", "24px", "important");
        dd.style.setProperty("font-weight", "800", "important");
        dd.style.setProperty("font-variant-numeric", "tabular-nums", "important");
        dd.style.setProperty("color", "#0f766e", "important");
      }
    });
  }

  function run() {
    try { cards(); chips(); headings(); tweaks(); } catch (e) {}
  }

  root.addEventListener("click", function () { [60, 260, 700].forEach(function (ms) { setTimeout(run, ms); }); }, true);
  window.addEventListener("hashchange", function () { setTimeout(run, 80); });
  window.addEventListener("load", function () { setTimeout(run, 300); });
  run();
  [200, 600, 1400].forEach(function (ms) { setTimeout(run, ms); });
  setInterval(function () { if (!document.hidden) run(); }, 1500);
})();
