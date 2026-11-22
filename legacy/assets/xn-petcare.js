/* R1236 宠物健康与护理计算合集：标签语义 / 按钮胶囊 / 关键数值（事件驱动，不改 React 状态） */
(function () {
  "use strict";
  var root = document.querySelector("#root");
  if (!root) return;
  var txt = function (e) { return (e.textContent || "").replace(/\s+/g, " ").trim(); };
  var vis = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };

  var ROUTES = ["#/age", "#/feed", "#/vaccine", "#/cost", "#/safety", "#/travel"];

  function tabs() {
    var links = [].slice.call(root.querySelectorAll("nav a[href^='#/']")).filter(vis);
    if (!links.length) return;
    var nav = links[0].parentElement;
    nav.setAttribute("role", "tablist");
    nav.setAttribute("aria-label", "宠物工具切换");
    var cur = location.hash || "#/age";
    links.forEach(function (a) {
      a.setAttribute("role", "tab");
      var href = a.getAttribute("href") || "";
      var on = href === cur || (ROUTES.indexOf(cur) < 0 && href === "#/age");
      var next = on ? "true" : "false";
      if (a.getAttribute("aria-selected") !== next) a.setAttribute("aria-selected", next);
      a.setAttribute("tabindex", on ? "0" : "-1");
      if (txt(a) === "食物适宜性速查") a.textContent = "食物禁忌";
    });
  }

  /* 复制 / 清空：结果卡头部两个纯文本按钮改胶囊 */
  function actions() {
    [].slice.call(root.querySelectorAll("button")).forEach(function (b) {
      var s = txt(b);
      if (s !== "复制" && s !== "清空") return;
      b.classList.add("xn-pet-act");
      b.setAttribute("type", "button");
      if (s === "复制") b.classList.add("xn-pet-copy");
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", s === "复制" ? "复制计算结果" : "清空当前工具输入");
    });
  }

  /* 是/否等二元切换 */
  function toggles() {
    [].slice.call(root.querySelectorAll("div.flex.gap-2")).forEach(function (g) {
      var bs = [].slice.call(g.querySelectorAll("button")).filter(vis);
      if (bs.length !== 2) return;
      var names = bs.map(txt);
      if (!names.every(function (n) { return /^(是|否|公|母|猫|狗|室内|室外|已绝育|未绝育)$/.test(n); })) return;
      g.setAttribute("role", "group");
      var label = "";
      var prev = g.previousElementSibling;
      while (prev && !label) {
        if (prev.children.length === 0) label = txt(prev);
        prev = prev.previousElementSibling;
      }
      if (label) g.setAttribute("aria-label", label);
      var p = g.parentElement;
      if (p) {
        var lab = p.querySelector("label");
        if (lab && !g.getAttribute("aria-label")) g.setAttribute("aria-label", txt(lab));
      }
      bs.forEach(function (b) {
        b.classList.add("xn-pet-toggle");
        b.setAttribute("type", "button");
        var on = /(^|\s)bg-indigo-(50|100|600)(\s|$)/.test(b.className);
        var next = on ? "true" : "false";
        if (b.getAttribute("aria-pressed") !== next) b.setAttribute("aria-pressed", next);
      });
    });
  }

  /* 关键结果值：短文本且以数字/金额/结论词开头 */
  function keys() {
    [].slice.call(root.querySelectorAll("dl > div > dd")).forEach(function (dd) {
      var s = txt(dd);
      var isKey = s.length > 0 && s.length <= 22 && (/^[¥￥\d]/.test(s) || /^(可以|限量|不建议|禁止|适宜|不适宜)/.test(s));
      if (isKey) dd.classList.add("xn-pet-key");
      else dd.classList.remove("xn-pet-key");
    });
  }

  function tweaks() {
    [].slice.call(root.querySelectorAll("a")).forEach(function (a) {
      if (!/返回工具集/.test(txt(a))) return;
      a.style.setProperty("min-height", "44px", "important");
      a.style.setProperty("display", "inline-flex", "important");
      a.style.setProperty("align-items", "center", "important");
    });
    [].slice.call(root.querySelectorAll("select,input[type='date'],input[type='text']")).forEach(function (i) {
      if (getComputedStyle(i).fontSize !== "16px") i.style.setProperty("font-size", "16px", "important");
      i.style.setProperty("min-height", "48px", "important");
    });
  }

  function run() {
    try { tabs(); actions(); toggles(); keys(); tweaks(); } catch (e) {}
  }

  root.addEventListener("click", function () { [60, 240, 700].forEach(function (ms) { setTimeout(run, ms); }); }, true);
  root.addEventListener("input", function () { setTimeout(run, 140); }, true);
  root.addEventListener("change", function () { setTimeout(run, 140); }, true);
  window.addEventListener("hashchange", function () { setTimeout(run, 90); });
  window.addEventListener("load", function () { setTimeout(run, 300); });
  run();
  [200, 600, 1400].forEach(function (ms) { setTimeout(run, ms); });
  setInterval(function () { if (!document.hidden) run(); }, 1500);
})();
