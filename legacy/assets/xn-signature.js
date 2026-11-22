/* R1228 邮箱签名与名片合集：语义与尺寸增强（事件驱动，不改 React 状态） */
(function () {
  "use strict";
  var root = document.querySelector("#root");
  if (!root) return;
  var txt = function (e) { return (e.textContent || "").replace(/\s+/g, " ").trim(); };
  var vis = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var ROUTES = ["#/sign", "#/card", "#/bio", "#/vcard", "#/closing"];

  function nav() {
    var links = [].slice.call(root.querySelectorAll("a[href^='#/']")).filter(vis);
    if (!links.length || links[0].getBoundingClientRect().height > 60) return; // 入口卡片页跳过
    var bar = links[0].parentElement;
    if (bar) {
      bar.classList.add("xn-signature-nav");
      bar.setAttribute("role", "tablist");
      bar.setAttribute("aria-label", "名片工具切换");
    }
    var cur = location.hash || "#/";
    links.forEach(function (a) {
      a.setAttribute("role", "tab");
      var href = a.getAttribute("href") || "";
      var on = href === cur || (!ROUTES.includes(cur) && href === "#/sign");
      var next = on ? "true" : "false";
      if (a.getAttribute("aria-selected") !== next) a.setAttribute("aria-selected", next);
      a.setAttribute("tabindex", on ? "0" : "-1");
    });
  }

  function buttons() {
    [].slice.call(root.querySelectorAll("button")).forEach(function (b) {
      if (!vis(b)) return;
      var cls = b.className.toString();
      var label = txt(b);
      if (/(^|\s)h-6(\s|$)/.test(cls) && /rounded-full/.test(cls)) {
        b.classList.add("xn-signature-switch");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "切换选项");
        return;
      }
      if (/^(源码|预览)$/.test(label)) {
        b.classList.add("xn-signature-tab");
        var on = /bg-blue-100/.test(cls) || /text-blue-700/.test(cls);
        var next = on ? "true" : "false";
        if (b.getAttribute("aria-pressed") !== next) b.setAttribute("aria-pressed", next);
        return;
      }
      if (/^(复制|复制文本|复制 HTML|复制当前文案|复制全部风格|复制全部|下载 .vcf|下载\.vcf|下载 vCard)$/.test(label)) {
        b.classList.add(/bg-blue-6/.test(cls) ? "xn-signature-primary" : "xn-signature-secondary");
        b.setAttribute("type", "button");
        return;
      }
      if (label === "清空") { b.classList.add("xn-signature-danger"); b.setAttribute("type", "button"); return; }
      if (/^生成/.test(label)) { b.classList.add("xn-signature-primary"); b.setAttribute("type", "button"); }
    });
  }

  function results() {
    [].slice.call(root.querySelectorAll("div")).forEach(function (e) {
      if (e.classList.contains("xn-signature-result")) return;
      var s = txt(e);
      if (!/^(①|②|③)/.test(s)) return;
      if (s.length > 1600) return;
      e.classList.add("xn-signature-result");
    });
  }

  function fields() {
    [].slice.call(root.querySelectorAll("input[type='text'],select,textarea")).forEach(function (i) {
      if (getComputedStyle(i).fontSize !== "16px") i.style.setProperty("font-size", "16px", "important");
      i.style.setProperty("min-height", i.tagName === "TEXTAREA" ? "61px" : "48px", "important");
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

  function back() {
    [].slice.call(root.querySelectorAll("a")).forEach(function (a) {
      if (!/返回工具集/.test(txt(a))) return;
      a.style.setProperty("min-height", "44px", "important");
      a.style.setProperty("display", "inline-flex", "important");
      a.style.setProperty("align-items", "center", "important");
    });
  }

  function run() {
    try { nav(); buttons(); results(); fields(); cleanHeadings(); back(); } catch (e) {}
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
