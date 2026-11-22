/* R1242 到期管理合集：tabs / 结果卡 / 紧急度着色 / 标题清理（事件驱动，不改 React 状态） */
(function () {
  "use strict";
  var root = document.querySelector("#root");
  if (!root) return;
  var txt = function (e) { return (e.textContent || "").replace(/\s+/g, " ").trim(); };
  var vis = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var ROUTES = ["#/contract", "#/idcard", "#/insurance", "#/inspection", "#/license", "#/subscription"];

  function tabs() {
    var links = [].slice.call(root.querySelectorAll("nav a[href^='#/']")).filter(vis);
    if (!links.length) return;
    var nav = links[0].parentElement;
    nav.setAttribute("role", "tablist");
    nav.setAttribute("aria-label", "到期工具切换");
    var cur = location.hash || "#/contract";
    links.forEach(function (a) {
      a.setAttribute("role", "tab");
      var href = a.getAttribute("href") || "";
      var on = href === cur || (ROUTES.indexOf(cur) < 0 && href === "#/contract");
      var next = on ? "true" : "false";
      if (a.getAttribute("aria-selected") !== next) a.setAttribute("aria-selected", next);
      a.setAttribute("tabindex", on ? "0" : "-1");
    });
  }

  function cards() {
    [].slice.call(root.querySelectorAll("div.grid")).forEach(function (g) {
      var kids = [].slice.call(g.children).filter(vis);
      if (kids.length !== 4) return;
      var first = kids[0];
      if (!/^[\u2460\u2461\u2462\u2463]/.test(txt(first))) return;
      g.classList.add("xn-exp-grid");
      kids.forEach(function (c) {
        c.classList.add("xn-exp-card");
        var val = c.querySelector("p.text-lg");
        if (!val) return;
        var s = txt(val);
        c.classList.remove("xn-exp-warn", "xn-exp-danger");
        var m = s.match(/剩\s*(-?\d+)\s*天/);
        if (m) {
          var n = parseInt(m[1], 10);
          if (n < 0) c.classList.add("xn-exp-danger");
          else if (n <= 30) c.classList.add("xn-exp-danger");
          else if (n <= 60) c.classList.add("xn-exp-warn");
        }
        if (/已过期|逾期/.test(s)) c.classList.add("xn-exp-danger");
      });
    });
  }

  function actions() {
    [].slice.call(root.querySelectorAll("button")).forEach(function (b) {
      var s = txt(b);
      if (s !== "复制结果" && s !== "清空") return;
      b.classList.add("xn-exp-act");
      b.setAttribute("type", "button");
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", s === "复制结果" ? "复制计算结果" : "清空当前输入");
    });
  }

  function headings() {
    [].slice.call(root.querySelectorAll("h2")).forEach(function (h) {
      if (h.children.length) return;
      var s = h.textContent || "";
      if (/^\s*工具\d+\s*·\s*/.test(s)) h.textContent = s.replace(/^\s*工具\d+\s*·\s*/, "");
    });
  }

  function tweaks() {
    [].slice.call(root.querySelectorAll("a")).forEach(function (a) {
      if (!/返回工具集/.test(txt(a))) return;
      a.style.setProperty("min-height", "44px", "important");
      a.style.setProperty("display", "inline-flex", "important");
      a.style.setProperty("align-items", "center", "important");
    });
    [].slice.call(root.querySelectorAll("input[type='date'],select")).forEach(function (i) {
      if (getComputedStyle(i).fontSize !== "16px") i.style.setProperty("font-size", "16px", "important");
      i.style.setProperty("min-height", "48px", "important");
    });
  }

  function run() {
    try { tabs(); cards(); actions(); headings(); tweaks(); } catch (e) {}
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
