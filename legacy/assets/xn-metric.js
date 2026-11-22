/* R1237 健康指标计算合集：标签语义 / 示例填充 / 切换语义（事件驱动，不改 React 状态） */
(function () {
  "use strict";
  var root = document.querySelector("#root");
  if (!root) return;
  var txt = function (e) { return (e.textContent || "").replace(/\s+/g, " ").trim(); };
  var vis = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var ROUTES = ["#/bmi", "#/bmr", "#/bodyfat", "#/water", "#/heart", "#/sleep"];

  function tabs() {
    var links = [].slice.call(root.querySelectorAll("nav a[href^='#/']")).filter(vis);
    if (!links.length) return;
    var nav = links[0].parentElement;
    nav.setAttribute("role", "tablist");
    nav.setAttribute("aria-label", "健康工具切换");
    var cur = location.hash || "#/bmi";
    links.forEach(function (a) {
      a.setAttribute("role", "tab");
      var href = a.getAttribute("href") || "";
      var on = href === cur || (ROUTES.indexOf(cur) < 0 && href === "#/bmi");
      var next = on ? "true" : "false";
      if (a.getAttribute("aria-selected") !== next) a.setAttribute("aria-selected", next);
      a.setAttribute("tabindex", on ? "0" : "-1");
    });
  }

  /* 性别 / 天气 / 午睡 等二元切换 */
  function toggles() {
    [].slice.call(root.querySelectorAll("div.flex.gap-2")).forEach(function (g) {
      var bs = [].slice.call(g.querySelectorAll("button")).filter(vis);
      if (bs.length !== 2) return;
      var names = bs.map(txt);
      if (!names.every(function (n) { return /^(男|女|常温|炎热|不午睡|午睡)$/.test(n); })) return;
      g.setAttribute("role", "group");
      var label = "";
      var p = g.parentElement;
      if (p) {
        var lab = p.querySelector("label");
        if (lab) label = txt(lab);
      }
      if (label) g.setAttribute("aria-label", label);
      bs.forEach(function (b) {
        b.classList.add("xn-metric-toggle");
        b.setAttribute("type", "button");
        var on = /(^|\s)bg-emerald-(50|100|600)(\s|$)/.test(b.className);
        var next = on ? "true" : "false";
        if (b.getAttribute("aria-pressed") !== next) b.setAttribute("aria-pressed", next);
      });
    });
  }

  function currentSection() {
    var list = [].slice.call(root.querySelectorAll("section")).filter(vis);
    for (var i = list.length - 1; i >= 0; i--) {
      if (list[i].querySelector("h2[id^='tool-']")) return list[i];
    }
    return null;
  }

  function sampleValue(input) {
    var ph = (input.getAttribute("placeholder") || "").trim();
    if (/^\d+(\.\d+)?$/.test(ph)) return ph;
    var aria = (input.getAttribute("aria-label") || "").trim();
    if (input.type === "time") {
      if (/入睡/.test(aria)) return "23:00";
      if (/起床/.test(aria)) return "07:00";
      return "08:00";
    }
    if (aria === "cm") return "170";
    if (aria === "kg") return "65";
    if (/岁/.test(aria)) return "30";
    if (/分钟/.test(aria)) return "30";
    if (/mmHg/.test(aria)) return "120";
    if (/次\/分/.test(aria)) return "72";
    return "";
  }

  function fillExample(sec) {
    var inputs = [].slice.call(sec.querySelectorAll("input")).filter(vis);
    var setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    var changed = false;
    inputs.forEach(function (i) {
      var v = sampleValue(i);
      if (!v) return;
      setter.call(i, v);
      i.dispatchEvent(new Event("input", { bubbles: true }));
      i.dispatchEvent(new Event("change", { bubbles: true }));
      changed = true;
    });
    return changed;
  }

  function exampleRow() {
    var sec = currentSection();
    if (!sec) return;
    if (sec.querySelector(".xn-metric-ex")) return;
    var h2 = sec.querySelector("h2[id^='tool-']");
    if (!h2) return;
    var row = document.createElement("div");
    row.className = "xn-metric-ex";
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = "填入示例";
    b.setAttribute("aria-label", "填入示例数据并计算结果");
    b.addEventListener("click", function () { fillExample(sec); });
    var tip = document.createElement("span");
    tip.textContent = "用示例数据快速看结果";
    row.appendChild(b);
    row.appendChild(tip);
    h2.insertAdjacentElement("afterend", row);
  }

  function tweaks() {
    [].slice.call(root.querySelectorAll("a")).forEach(function (a) {
      if (!/返回工具集/.test(txt(a))) return;
      a.style.setProperty("min-height", "44px", "important");
      a.style.setProperty("display", "inline-flex", "important");
      a.style.setProperty("align-items", "center", "important");
    });
    [].slice.call(root.querySelectorAll("input[type='time'],input[type='text']")).forEach(function (i) {
      if (getComputedStyle(i).fontSize !== "16px") i.style.setProperty("font-size", "16px", "important");
      i.style.setProperty("min-height", "48px", "important");
    });
  }

  function run() {
    try { tabs(); toggles(); exampleRow(); tweaks(); } catch (e) {}
  }

  root.addEventListener("click", function () { [60, 260, 700].forEach(function (ms) { setTimeout(run, ms); }); }, true);
  root.addEventListener("input", function () { setTimeout(run, 120); }, true);
  root.addEventListener("change", function () { setTimeout(run, 120); }, true);
  window.addEventListener("hashchange", function () { setTimeout(run, 90); });
  window.addEventListener("load", function () { setTimeout(run, 300); });
  run();
  [200, 600, 1400].forEach(function (ms) { setTimeout(run, ms); });
  setInterval(function () { if (!document.hidden) run(); }, 1500);
})();
