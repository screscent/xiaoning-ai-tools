/* 节拍器与速度合集页增强（仅 2qeyjmqqxb 引用）
 * - BPM 快捷值：滑杆（节拍器）与数字框（毫秒/复节奏/细分）
 * - 节拍器设置摘要 + 工具 tab aria-current
 * - 每拍毫秒数值加强；术语搜索框补 aria
 */
(function () {
  "use strict";
  if (window.__XN_BEAT__) return;
  window.__XN_BEAT__ = true;

  function txt(el) { return (el.textContent || "").trim(); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function setInput(el, v) {
    var proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    proto.set.call(el, String(v));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  var PRESETS = [60, 80, 90, 100, 120, 140, 160, 180, 200];

  function addChips(input) {
    var label = input.getAttribute("aria-label") || "";
    if (!/BPM/.test(label)) return;
    var field = input.parentElement;
    if (!field || field.querySelector(".xn-chips")) return;
    var wrap = document.createElement("div");
    wrap.className = "xn-chips";
    PRESETS.forEach(function (v) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = v;
      b.onclick = function () { setInput(input, v); setTimeout(updateAll, 40); };
      wrap.appendChild(b);
    });
    field.appendChild(wrap);
    input.addEventListener("input", function () { sync(input, wrap); });
    sync(input, wrap);
  }

  function sync(input, wrap) {
    var cur = parseFloat(input.value);
    [].slice.call(wrap.children).forEach(function (b, i) {
      b.classList.toggle("is-on", !isNaN(cur) && cur === PRESETS[i]);
    });
  }

  function fixNav() {
    [].slice.call(document.querySelectorAll('#root nav a[href^="#/"]')).forEach(function (a) {
      if (/bg-blue-600/.test((a.className || "").toString())) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  function fixSearch() {
    var s = document.querySelector("#root input[type=search]");
    if (s && !s.getAttribute("aria-label")) s.setAttribute("aria-label", "搜索速度术语");
  }

  function markMs() {
    [].slice.call(document.querySelectorAll("#root span, #root div, #root p")).forEach(function (el) {
      if (el.children.length) return;
      if (/^\d+(\.\d+)? ms$/.test(txt(el))) el.classList.add("xn-ms");
    });
  }

  function updateBar() {
    var start = [].slice.call(document.querySelectorAll("#root button")).filter(function (b) { return txt(b) === "开始"; })[0];
    if (!start) {
      var bar0 = document.querySelector("#root .xn-setbar");
      if (bar0) bar0.style.display = "none";
      return;
    }
    var bar = document.querySelector("#root .xn-setbar");
    if (!bar) {
      bar = document.createElement("div");
      bar.className = "xn-setbar";
      var row = start.parentElement;
      var cs = window.getComputedStyle(row);
      var flexRow = cs.display.indexOf("flex") === 0 && cs.flexDirection.indexOf("row") === 0;
      if (flexRow && row.parentElement) row.parentElement.insertBefore(bar, row);
      else row.insertBefore(bar, start);
    }
    bar.style.display = "flex";
    var bpm = [].slice.call(document.querySelectorAll("#root input[type=range]")).filter(function (i) { return /BPM/.test(i.getAttribute("aria-label") || ""); })[0];
    var vol = [].slice.call(document.querySelectorAll("#root input[type=range]")).filter(function (i) { return /音量/.test(i.getAttribute("aria-label") || ""); })[0];
    var sig = [].slice.call(document.querySelectorAll("#root button")).filter(function (b) {
      return /^\d\/\d$/.test(txt(b)) && /border-blue-600/.test((b.className || "").toString());
    })[0];
    var sw = document.querySelector('#root button[role="switch"]');
    var parts = [];
    if (bpm) parts.push("BPM " + bpm.value);
    if (sig) parts.push(txt(sig));
    if (sw) parts.push("首拍重音 " + (sw.getAttribute("aria-checked") === "true" ? "开" : "关"));
    if (vol) parts.push("音量 " + vol.value);
    var html = '<span class="xn-setlabel">当前设置</span>' +
      parts.map(function (p) { return "<b>" + esc(p) + "</b>"; }).join("<span>·</span>");
    if (bar.innerHTML !== html) bar.innerHTML = html;
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    fixNav();
    fixSearch();
    [].slice.call(document.querySelectorAll("#root input")).forEach(addChips);
    markMs();
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
