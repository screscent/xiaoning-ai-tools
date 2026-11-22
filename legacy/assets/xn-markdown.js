/* R1227 Markdown 目录与锚点合集：语义与尺寸增强（事件驱动，不改 React 状态） */
(function () {
  "use strict";
  var root = document.querySelector("#root");
  if (!root) return;
  var txt = function (e) { return (e.textContent || "").replace(/\s+/g, " ").trim(); };
  var vis = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var ROUTES = ["#/toc", "#/anchor", "#/links", "#/outline", "#/slug", "#/toccheck"];

  function nav() {
    var links = [].slice.call(root.querySelectorAll("a[href^='#/']")).filter(vis);
    if (!links.length) return;
    var bar = links[0].parentElement;
    if (bar) {
      bar.classList.add("xn-markdown-nav");
      bar.setAttribute("role", "tablist");
      bar.setAttribute("aria-label", "Markdown 工具切换");
    }
    var cur = location.hash || "#/toc";
    links.forEach(function (a) {
      a.setAttribute("role", "tab");
      var href = a.getAttribute("href") || "";
      var on = href === cur || (!ROUTES.includes(cur) && href === "#/toc") || a.getAttribute("aria-current") === "page";
      var next = on ? "true" : "false";
      if (a.getAttribute("aria-selected") !== next) a.setAttribute("aria-selected", next);
      a.setAttribute("tabindex", on ? "0" : "-1");
    });
  }

  function buttons() {
    [].slice.call(root.querySelectorAll("button")).forEach(function (b) {
      if (!vis(b)) return;
      var cls = b.className.toString();
      if (/(^|\s)w-10(\s|$)/.test(cls) && /rounded-full/.test(cls)) {
        b.classList.add("xn-markdown-switch");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "切换选项");
        return;
      }
      var label = txt(b);
      if (/^复制/.test(label)) {
        b.classList.add(/bg-blue-5/.test(cls) ? "xn-markdown-primary" : "xn-markdown-secondary");
        b.setAttribute("type", "button");
        return;
      }
      if (/^(恢复示例|清空|目录 → 大纲|大纲 → 标题)$/.test(label)) {
        b.classList.add(label.indexOf("→") >= 0 ? "xn-markdown-dir" : "xn-markdown-secondary");
        b.setAttribute("type", "button");
      }
    });
    // 方向切换：有 aria-pressed 的按钮（页面已有）
    [].slice.call(root.querySelectorAll("button[aria-pressed]")).forEach(function (b) {
      if (!vis(b)) return;
      if (/→/.test(txt(b))) b.classList.add("xn-markdown-dir");
    });
  }

  function fields() {
    [].slice.call(root.querySelectorAll("select")).forEach(function (s) {
      if (getComputedStyle(s).fontSize !== "16px") s.style.setProperty("font-size", "16px", "important");
      s.style.setProperty("min-height", "48px", "important");
    });
    [].slice.call(root.querySelectorAll("textarea")).forEach(function (t) {
      if (getComputedStyle(t).fontSize !== "16px") t.style.setProperty("font-size", "16px", "important");
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

  function cleanHeadings() {
    [].slice.call(root.querySelectorAll("h1,h2,h3")).forEach(function (h) {
      var target = h;
      if (h.children.length === 1 && !h.children[0].children.length) target = h.children[0];
      else if (h.children.length) return;
      var s = target.textContent || "";
      if (!/^\s*工具[A-Z]\s+/.test(s)) return;
      var next = s.replace(/^\s*工具[A-Z]\s+/, "");
      if (next) target.textContent = next;
    });
  }

  function run() {
    try { nav(); buttons(); fields(); back(); cleanHeadings(); } catch (e) {}
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
