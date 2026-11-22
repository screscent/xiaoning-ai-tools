/* R1239 保养与年检提醒合集：导航语义 / 重置 / 保养类型 / 标题清理（事件驱动，不改 React 状态） */
(function () {
  "use strict";
  var root = document.querySelector("#root");
  if (!root) return;
  var txt = function (e) { return (e.textContent || "").replace(/\s+/g, " ").trim(); };
  var vis = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };

  function nav() {
    var links = [].slice.call(root.querySelectorAll("a[href^='#/']")).filter(vis);
    if (!links.length) return;
    var wrap = links[0].parentElement;
    if (!wrap) return;
    wrap.setAttribute("role", "tablist");
    wrap.setAttribute("aria-label", "车务工具切换");
    links.forEach(function (a) {
      a.setAttribute("role", "tab");
      var on = a.getAttribute("aria-current") === "page";
      var next = on ? "true" : "false";
      if (a.getAttribute("aria-selected") !== next) a.setAttribute("aria-selected", next);
      a.setAttribute("tabindex", on ? "0" : "-1");
    });
  }

  function resets() {
    [].slice.call(root.querySelectorAll("button")).forEach(function (b) {
      if (txt(b) !== "重置") return;
      b.classList.add("xn-service-reset");
      b.setAttribute("type", "button");
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "重置当前工具输入");
    });
  }

  /* 小保养 / 大保养 二选一 */
  function toggles() {
    [].slice.call(root.querySelectorAll("div.flex.gap-2,div.grid.grid-cols-2")).forEach(function (g) {
      var bs = [].slice.call(g.querySelectorAll("button")).filter(vis);
      if (bs.length !== 2) return;
      var names = bs.map(txt);
      if (!names.every(function (n) { return /^(小保养|大保养)$/.test(n); })) return;
      g.setAttribute("role", "group");
      g.setAttribute("aria-label", "保养类型");
      bs.forEach(function (b) {
        b.classList.add("xn-service-toggle");
        b.setAttribute("type", "button");
        var on = /(^|\s)bg-blue-(600|500)(\s|$)/.test(b.className);
        var next = on ? "true" : "false";
        if (b.getAttribute("aria-pressed") !== next) b.setAttribute("aria-pressed", next);
      });
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
    [].slice.call(root.querySelectorAll("select,input[type='date']")).forEach(function (i) {
      if (getComputedStyle(i).fontSize !== "16px") i.style.setProperty("font-size", "16px", "important");
      i.style.setProperty("min-height", "48px", "important");
    });
    [].slice.call(root.querySelectorAll("button")).forEach(function (b) {
      var s = txt(b);
      if (/一键复制|复制结果/.test(s) && !b.getAttribute("aria-label")) b.setAttribute("aria-label", "复制判断结果");
    });
  }

  function run() {
    try { nav(); resets(); toggles(); headings(); tweaks(); } catch (e) {}
  }

  root.addEventListener("click", function () { [60, 260, 700].forEach(function (ms) { setTimeout(run, ms); }); }, true);
  root.addEventListener("input", function () { setTimeout(run, 140); }, true);
  root.addEventListener("change", function () { setTimeout(run, 140); }, true);
  window.addEventListener("hashchange", function () { setTimeout(run, 90); });
  window.addEventListener("load", function () { setTimeout(run, 300); });
  run();
  [200, 600, 1400].forEach(function (ms) { setTimeout(run, ms); });
  setInterval(function () { if (!document.hidden) run(); }, 1500);
})();
