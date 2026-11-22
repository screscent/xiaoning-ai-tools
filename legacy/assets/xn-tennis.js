/* R1222 网球计分与场地换算合集：语义与交互增强（事件驱动，不改 React 状态） */
(function () {
  "use strict";
  var root = document.querySelector("#root");
  if (!root) return;
  var txt = function (e) { return (e.textContent || "").replace(/\s+/g, " ").trim(); };
  var vis = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var HASHES = ["#/score", "#/court", "#/gear", "#/train", "#/serve"];
  var segActive = "普通局";

  function nav() {
    var links = [].slice.call(root.querySelectorAll("a[href^='#/']")).filter(vis);
    if (!links.length) return;
    var bar = links[0].parentElement;
    if (bar) {
      bar.classList.add("xn-tennis-nav");
      bar.setAttribute("role", "tablist");
      bar.setAttribute("aria-label", "网球工具切换");
    }
    var cur = location.hash || "#/score";
    links.forEach(function (a) {
      a.classList.add("xn-tennis-navlink");
      a.setAttribute("role", "tab");
      var href = a.getAttribute("href") || "";
      var on = href === cur || (!HASHES.includes(cur) && href === "#/score");
      var next = on ? "true" : "false";
      if (a.getAttribute("aria-selected") !== next) a.setAttribute("aria-selected", next);
      a.setAttribute("tabindex", on ? "0" : "-1");
    });
  }

  function groups() {
    [].slice.call(root.querySelectorAll("button")).forEach(function (b) {
      if (!vis(b)) return;
      var label = txt(b);
      if (/^(普通局|抢七局)$/.test(label)) {
        var seg = b.parentElement;
        if (seg && !seg.classList.contains("xn-tennis-seg")) seg.classList.add("xn-tennis-seg");
        b.setAttribute("aria-pressed", label === segActive ? "true" : "false");
        return;
      }
      if (/^(右手|左手)$/.test(label)) {
        var hand = b.parentElement;
        if (hand && !hand.classList.contains("xn-tennis-hand")) hand.classList.add("xn-tennis-hand");
        var on = /(^|\s)bg-white(\s|$)/.test(b.className);
        var next = on ? "true" : "false";
        if (b.getAttribute("aria-pressed") !== next) b.setAttribute("aria-pressed", next);
        return;
      }
    });
  }

  function directions() {
    [].slice.call(root.querySelectorAll("button")).forEach(function (b) {
      if (!vis(b)) return;
      if (!/mph/.test(txt(b)) || !/km\/h/.test(txt(b))) return;
      b.classList.add("xn-tennis-dir");
      var on = /border-emerald/.test(b.className) && /bg-emerald/.test(b.className);
      var next = on ? "true" : "false";
      if (b.getAttribute("aria-pressed") !== next) b.setAttribute("aria-pressed", next);
    });
  }

  function actions() {
    [].slice.call(root.querySelectorAll("button")).forEach(function (b) {
      if (!vis(b)) return;
      var label = txt(b);
      if (/^(交换甲乙|重置|恢复默认)$/.test(label)) {
        b.classList.add("xn-tennis-secondary");
        b.setAttribute("type", "button");
        return;
      }
      if (/^复制/.test(label)) {
        b.classList.add("xn-tennis-copy");
        b.setAttribute("type", "button");
      }
    });
  }

  function branches() {
    [].slice.call(root.querySelectorAll("div[data-code-inspect-component='BranchCard']")).forEach(function (c) {
      if (!c.classList.contains("xn-tennis-branch")) c.classList.add("xn-tennis-branch");
    });
  }

  function state() {
    [].slice.call(root.querySelectorAll("div,p")).forEach(function (e) {
      if (e.children.length) return;
      var s = txt(e);
      if (s.indexOf("当前：") === 0 && s.length < 90 && !e.classList.contains("xn-tennis-state")) {
        e.classList.add("xn-tennis-state");
      }
    });
  }

  function court() {
    [].slice.call(root.querySelectorAll("svg")).forEach(function (s) {
      if (!vis(s) || s.getBoundingClientRect().width < 300) return;
      var box = s.parentElement;
      if (box && !box.classList.contains("xn-tennis-court")) box.classList.add("xn-tennis-court");
    });
  }

  function back() {
    [].slice.call(root.querySelectorAll("a")).forEach(function (a) {
      if (!/返回/.test(txt(a))) return;
      a.style.setProperty("min-height", "44px", "important");
      a.style.setProperty("display", "inline-flex", "important");
      a.style.setProperty("align-items", "center", "important");
    });
  }

  function run() {
    try { nav(); groups(); directions(); actions(); branches(); state(); court(); back(); } catch (e) {}
  }

  root.addEventListener("click", function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest("button") : null;
    if (b) {
      var label = txt(b);
      if (label === "普通局" || label === "抢七局") segActive = label;
    }
    setTimeout(run, 60);
    setTimeout(run, 320);
  }, true);
  root.addEventListener("input", function () { setTimeout(run, 120); }, true);
  root.addEventListener("change", function () { setTimeout(run, 120); }, true);
  window.addEventListener("hashchange", function () { setTimeout(run, 60); });
  window.addEventListener("load", function () { setTimeout(run, 300); });
  run();
  [200, 600, 1400].forEach(function (ms) { setTimeout(run, ms); });
  setInterval(function () { if (!document.hidden) run(); }, 1500);
})();
