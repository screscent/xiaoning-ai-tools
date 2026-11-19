/* 项目排期与进度合集页增强（仅 2qex6iqqxb 引用）
 * - 任务清单「填入示例」、日期今天/下周一
 * - 并行任务数/日速率/缓冲比例快捷值
 * - 开关补 aria；甘特条 13.5px；生成前设置摘要；工具E 标题归一
 */
(function () {
  "use strict";
  if (window.__XN_PROJ__) return;
  window.__XN_PROJ__ = true;

  function txt(el) { return (el.textContent || "").trim(); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function setVal(el, v) {
    var proto = Object.getOwnPropertyDescriptor(el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, "value");
    proto.set.call(el, String(v));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }
  function iso(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function today() { return iso(new Date()); }
  function nextMonday() {
    var d = new Date();
    var add = ((8 - d.getDay()) % 7) || 7;
    d.setDate(d.getDate() + add);
    return iso(d);
  }

  var SAMPLE = "需求评审,2\n方案设计,3\n开发实现,5\n联调测试,2\n上线准备,1";

  function fixTitles() {
    [].slice.call(document.querySelectorAll("#root button, #root a, #root h1, #root h2, #root h3")).forEach(function (el) {
      var t = txt(el);
      if (/^工具[A-Z]\s*/.test(t)) el.textContent = t.replace(/^工具[A-Z]\s*/, "");
    });
  }

  function fixNav() {
    [].slice.call(document.querySelectorAll('#root a[href^="#/"]')).forEach(function (a) {
      var c = (a.className || "").toString();
      if (/bg-blue-600|bg-blue-500|text-blue-700|border-blue-600/.test(c)) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  function fixSwitches() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (txt(b)) return;
      if (!/h-6/.test((b.className || "").toString())) return;
      var p = b.parentElement;
      var label = p ? (p.innerText || "").replace(/\s+/g, " ").trim() : "";
      if (!label || label.length > 20) return;
      var on = /bg-blue-600|bg-blue-500/.test((b.className || "").toString());
      if (!b.getAttribute("role")) b.setAttribute("role", "switch");
      b.setAttribute("aria-checked", on ? "true" : "false");
      b.setAttribute("aria-label", label);
      b.title = label + "：" + (on ? "开" : "关");
      b.classList.add("xn-switch");
    });
  }

  function addSample() {
    var ta = [].slice.call(document.querySelectorAll("#root textarea")).filter(function (t) {
      return /任务清单/.test(t.getAttribute("aria-label") || "");
    })[0];
    if (!ta || !ta.parentElement || ta.parentElement.querySelector(".xn-sample")) return;
    var b = document.createElement("button");
    b.type = "button";
    b.className = "xn-sample";
    b.textContent = "填入示例";
    b.title = "填入 5 条示例任务";
    b.onclick = function () { setVal(ta, SAMPLE); setTimeout(updateAll, 60); };
    ta.parentElement.insertBefore(b, ta);
  }

  var PRESETS = [
    { re: /^并行任务数/, vals: [1, 2, 3, 4] },
    { re: /^日速率/, vals: [4, 6, 8, 10] },
    { re: /^缓冲比例/, vals: [10, 15, 20, 25] }
  ];

  function addPresets(input) {
    var label = input.getAttribute("aria-label") || "";
    var rule = null;
    for (var i = 0; i < PRESETS.length; i++) if (PRESETS[i].re.test(label)) { rule = PRESETS[i]; break; }
    if (!rule) return;
    var field = input.parentElement;
    if (!field || field.querySelector(".xn-chips")) return;
    var wrap = document.createElement("div");
    wrap.className = "xn-chips";
    rule.vals.forEach(function (v) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = v;
      b.onclick = function () { setVal(input, v); setTimeout(updateAll, 40); };
      wrap.appendChild(b);
    });
    field.appendChild(wrap);
    input.addEventListener("input", function () { sync(input, wrap, rule); });
    sync(input, wrap, rule);
  }

  function sync(input, wrap, rule) {
    var cur = parseFloat(input.value);
    [].slice.call(wrap.children).forEach(function (b, i) {
      b.classList.toggle("is-on", !isNaN(cur) && cur === rule.vals[i]);
    });
  }

  function addDateChips() {
    [].slice.call(document.querySelectorAll("#root input[type=date]")).forEach(function (input) {
      var field = input.parentElement;
      if (!field || field.querySelector(".xn-chips")) return;
      var wrap = document.createElement("div");
      wrap.className = "xn-chips";
      [["今天", today()], ["下周一", nextMonday()]].forEach(function (pair) {
        var b = document.createElement("button");
        b.type = "button";
        b.textContent = pair[0];
        b.onclick = function () { setVal(input, pair[1]); setTimeout(updateAll, 40); };
        wrap.appendChild(b);
      });
      field.appendChild(wrap);
    });
  }

  function markBars() {
    [].slice.call(document.querySelectorAll("#root div")).forEach(function (el) {
      if (/font-mono/.test((el.className || "").toString()) && /█/.test(el.textContent)) el.classList.add("xn-bar");
    });
  }

  function updateBar() {
    var btn = [].slice.call(document.querySelectorAll("#root button")).filter(function (b) { return txt(b) === "生成甘特图"; })[0];
    var bar = document.querySelector("#root .xn-setbar");
    if (!btn) { if (bar) bar.style.display = "none"; return; }
    if (!bar) {
      bar = document.createElement("div");
      bar.className = "xn-setbar";
      var row = btn.parentElement;
      var cs = window.getComputedStyle(row);
      var flexRow = cs.display.indexOf("flex") === 0 && cs.flexDirection.indexOf("row") === 0;
      if (flexRow && row.parentElement) row.parentElement.insertBefore(bar, row);
      else row.insertBefore(bar, btn);
    }
    bar.style.display = "flex";
    var date = document.querySelector('#root input[type=date]');
    var par = [].slice.call(document.querySelectorAll("#root input")).filter(function (i) { return /^并行任务数/.test(i.getAttribute("aria-label") || ""); })[0];
    var sws = [].slice.call(document.querySelectorAll('#root button[role="switch"]'));
    var parts = [];
    if (date && date.value) parts.push("开始 " + date.value);
    if (par && par.value) parts.push("并行 " + par.value);
    sws.forEach(function (s) {
      var lab = s.getAttribute("aria-label");
      if (lab) parts.push(lab.replace(/（.*?）/g, "") + " " + (s.getAttribute("aria-checked") === "true" ? "开" : "关"));
    });
    var html = '<span class="xn-setlabel">当前设置</span>' +
      parts.map(function (p) { return "<b>" + esc(p) + "</b>"; }).join("<span>·</span>");
    if (bar.innerHTML !== html) bar.innerHTML = html;
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    fixTitles();
    fixNav();
    fixSwitches();
    addSample();
    [].slice.call(document.querySelectorAll("#root input")).forEach(addPresets);
    addDateChips();
    markBars();
    updateBar();
  }

  var scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(function () { scheduled = false; try { updateAll(); } catch (e) {} }, 240);
  }

  function boot() {
    var root = document.getElementById("root");
    if (!root) { setTimeout(boot, 300); return; }
    updateAll();
    new MutationObserver(schedule).observe(root, {
      childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["class", "aria-checked"]
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
