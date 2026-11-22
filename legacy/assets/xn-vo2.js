/* R1238 体脂腰臀比与 VO2max 合集：工具切换 / 性别 / 操作按钮语义增强（事件驱动，不改 React 状态） */
(function () {
  "use strict";
  var root = document.querySelector("#root");
  if (!root) return;
  var txt = function (e) { return (e.textContent || "").replace(/\s+/g, " ").trim(); };
  var vis = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };

  function tools() {
    var nav = root.querySelector("nav.mb-5");
    if (!nav) return;
    var bs = [].slice.call(nav.querySelectorAll("button")).filter(vis);
    if (!bs.length) return;
    nav.setAttribute("role", "tablist");
    nav.setAttribute("aria-label", "健康工具切换");
    bs.forEach(function (b) {
      b.setAttribute("role", "tab");
      var on = /(^|\s)bg-blue-500(\s|$)/.test(b.className);
      var next = on ? "true" : "false";
      if (b.getAttribute("aria-selected") !== next) b.setAttribute("aria-selected", next);
      b.setAttribute("tabindex", on ? "0" : "-1");
    });
  }

  function genders() {
    [].slice.call(root.querySelectorAll("div.grid.grid-cols-2.gap-3")).forEach(function (g) {
      var bs = [].slice.call(g.querySelectorAll("button")).filter(vis);
      if (bs.length !== 2) return;
      var names = bs.map(txt);
      if (!names.every(function (n) { return /^(男|女)$/.test(n); })) return;
      g.setAttribute("role", "group");
      var label = "";
      var p = g.parentElement;
      if (p) {
        var lab = p.querySelector("label");
        if (lab) label = txt(lab);
      }
      if (!label) {
        var prev = g.previousElementSibling;
        if (prev && prev.children.length === 0) label = txt(prev);
      }
      if (label) g.setAttribute("aria-label", label);
      bs.forEach(function (b) {
        b.classList.add("xn-vo2-gender");
        b.setAttribute("type", "button");
        b.setAttribute("data-sex", txt(b));
        var on = /(^|\s)bg-(blue|pink)-500(\s|$)/.test(b.className);
        var next = on ? "true" : "false";
        if (b.getAttribute("aria-pressed") !== next) b.setAttribute("aria-pressed", next);
      });
    });
  }

  function actions() {
    [].slice.call(root.querySelectorAll("button")).forEach(function (b) {
      var s = txt(b);
      if (s !== "复制结果" && s !== "清空") return;
      b.classList.add("xn-vo2-act");
      b.setAttribute("type", "button");
      if (s === "复制结果") {
        b.classList.add("xn-vo2-copy");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "复制计算结果");
      } else if (!b.getAttribute("aria-label")) {
        b.setAttribute("aria-label", "清空当前输入");
      }
    });
  }

  function headings() {
    [].slice.call(root.querySelectorAll("h2")).forEach(function (h) {
      if (h.children.length) return;
      var s = h.textContent || "";
      if (/^[\u2460-\u2473]\s*/.test(s)) h.textContent = s.replace(/^[\u2460-\u2473]\s*/, "");
    });
  }

  function tweaks() {
    [].slice.call(root.querySelectorAll("a")).forEach(function (a) {
      if (!/返回工具集/.test(txt(a))) return;
      a.style.setProperty("min-height", "44px", "important");
      a.style.setProperty("display", "inline-flex", "important");
      a.style.setProperty("align-items", "center", "important");
    });
  }

  function run() {
    try { tools(); genders(); actions(); headings(); tweaks(); } catch (e) {}
  }

  root.addEventListener("click", function () { [60, 260, 700].forEach(function (ms) { setTimeout(run, ms); }); }, true);
  root.addEventListener("input", function () { setTimeout(run, 140); }, true);
  window.addEventListener("hashchange", function () { setTimeout(run, 90); });
  window.addEventListener("load", function () { setTimeout(run, 300); });
  run();
  [200, 600, 1400].forEach(function (ms) { setTimeout(run, ms); });
  setInterval(function () { if (!document.hidden) run(); }, 1500);
})();
