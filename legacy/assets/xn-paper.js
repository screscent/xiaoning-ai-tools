/* 纸张尺寸与印刷出血合集页增强（仅 qhnnmmstfq 引用） */
(function () {
  "use strict";
  if (window.__XN_PAPER__) return;
  window.__XN_PAPER__ = true;

  function txt(el) { return (el.textContent || "").trim(); }
  function visible(el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }
  function setVal(el, v) {
    var proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    proto.set.call(el, String(v));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  /* ---------- 占位标题 ---------- */
  var TOOL_NO = { D: "04", E: "05", F: "06" };
  function fixPlaceholders() {
    var nodes = document.querySelectorAll("#root span, #root p, #root h1, #root h2, #root h3, #root a, #root strong, #root b, #root button");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.children.length) continue;
      var t = txt(el);
      var m = /^工具([DEF])(\s*)(.*)$/.exec(t);
      if (m) {
        el.textContent = "工具 " + TOOL_NO[m[1]] + (m[3] ? " " + m[3] : "");
        continue;
      }
      if (t === "D" || t === "E" || t === "F") {
        var nx = el.nextElementSibling;
        if (nx && /^H2$/.test(nx.tagName) && /^工具 0[456]/.test(txt(nx))) el.textContent = TOOL_NO[t];
      }
    }
    var h2s = document.querySelectorAll("#root h2");
    for (var j = 0; j < h2s.length; j++) {
      var kids = h2s[j].childNodes;
      for (var k = 0; k < kids.length; k++) {
        var n = kids[k];
        if (n.nodeType !== 3) continue;
        var nt = (n.nodeValue || "").trim();
        var nm = /^工具([DEF])(\s*)(.*)$/.exec(nt);
        if (nm) n.nodeValue = "工具 " + TOOL_NO[nm[1]] + (nm[3] ? " " + nm[3] : "");
      }
    }
  }

  /* ---------- 输入语义 ---------- */
  var NAMES = [
    { re: /快速筛选/, name: "快速筛选尺寸" },
    { re: /折后单板.*宽|成品宽（折后单板）/, name: "折后成品宽（mm）" },
    { re: /折后单板.*高|成品高（折后单板）/, name: "折后成品高（mm）" },
    { re: /成品宽mm/, name: "成品宽（mm）" },
    { re: /成品高mm/, name: "成品高（mm）" },
    { re: /出血/, name: "出血（mm，四边相同）" },
    { re: /安全边距/, name: "安全边距（mm）" },
    { re: /像素宽/, name: "图像像素宽（px）" },
    { re: /像素高/, name: "图像像素高（px）" },
    { re: /^印量/, name: "印量（册）" },
    { re: /每版拼数/, name: "每版拼数（件）" },
    { re: /加放率/, name: "加放率（%）" },
    { re: /^页数/, name: "页数（页）" },
    { re: /^印数/, name: "印数（册）" }
  ];

  function ctxOf(input) {
    var lab = input.closest("label");
    if (lab) return txt(lab).replace(/\s+/g, "");
    var p = input.parentElement;
    for (var i = 0; i < 2 && p; i++) {
      var t = txt(p).replace(/\s+/g, "");
      if (t.length > 1) return t;
      p = p.parentElement;
    }
    return input.getAttribute("placeholder") || "";
  }

  function fixAria() {
    var ins = [].slice.call(document.querySelectorAll("#root input")).filter(visible);
    ins.forEach(function (input) {
      var ctx = ctxOf(input);
      for (var i = 0; i < NAMES.length; i++) {
        if (!NAMES[i].re.test(ctx)) continue;
        input.setAttribute("aria-label", NAMES[i].name);
        return;
      }
    });
  }

  /* ---------- 快捷值 ---------- */
  var RULES = [
    { re: /快速筛选/, vals: ["A4", "A3", "A5", "B5", "名片"] },
    { re: /成品宽（mm）|折后成品宽/, vals: [90, 148, 210, 297] },
    { re: /成品高（mm）|折后成品高/, vals: [54, 210, 297, 420] },
    { re: /出血/, vals: [0, 3, 5] },
    { re: /安全边距/, vals: [3, 5, 10] },
    { re: /印量|印数/, vals: [1000, 3000, 5000, 10000] },
    { re: /每版拼数/, vals: [8, 16, 32] },
    { re: /加放率/, vals: [3, 5, 8] },
    { re: /页数/, vals: [16, 32, 64, 128] }
  ];

  function addChips(input) {
    if (!visible(input)) return;
    if (input.type === "search" || input.type === "number" || input.type === "text") { /* ok */ }
    var w = input.getBoundingClientRect().width;
    if (w < 120) return;
    var label = (input.getAttribute("aria-label") || "").trim();
    var rule = null;
    for (var i = 0; i < RULES.length; i++) if (RULES[i].re.test(label)) { rule = RULES[i]; break; }
    if (!rule) return;
    if (input.__xnChips && input.__xnChips.isConnected) return;
    var host = input.parentElement;
    if (!host) return;
    var wrap = document.createElement("div");
    wrap.className = "xn-chips";
    rule.vals.forEach(function (v) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "xn-chip";
      b.textContent = v;
      b.onclick = function () { setVal(input, v); setTimeout(updateAll, 60); };
      wrap.appendChild(b);
    });
    host.appendChild(wrap);
    input.__xnChips = wrap;
    input.addEventListener("input", function () { sync(input, wrap, rule); });
    sync(input, wrap, rule);
  }

  function sync(input, wrap, rule) {
    var cur = input.value;
    var num = parseFloat(cur);
    [].slice.call(wrap.children).forEach(function (b, i) {
      var v = rule.vals[i];
      b.classList.toggle("is-on", typeof v === "string" ? cur === v : (!isNaN(num) && num === v));
    });
  }

  /* ---------- 表格 ---------- */
  function paintTables() {
    var rows = document.querySelectorAll("#root table tbody tr");
    for (var i = 0; i < rows.length; i++) {
      var tr = rows[i];
      var first = tr.firstElementChild;
      if (!first) continue;
      if (/^A4$/.test(txt(first))) tr.classList.add("xn-paper-a4");
    }
  }

  /* ---------- 折页板宽 ---------- */
  function markPanels() {
    var nodes = document.querySelectorAll("#root span, #root p, #root div");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.children.length) continue;
      var t = txt(el);
      if (!/^\d+(\.\d+)?\s*mm/.test(t)) continue;
      var p = el.parentElement ? txt(el.parentElement) : "";
      if (/封面|内板|内芯/.test(p)) el.classList.add("xn-paper-panel");
    }
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    fixPlaceholders();
    fixAria();
    [].slice.call(document.querySelectorAll("#root input")).forEach(addChips);
    paintTables();
    markPanels();
  }

  var scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(function () { scheduled = false; try { updateAll(); } catch (e) {} }, 220);
  }

  function boot() {
    var root = document.getElementById("root");
    if (!root) { setTimeout(boot, 300); return; }
    updateAll();
    new MutationObserver(schedule).observe(root, {
      childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["class"]
    });
    window.addEventListener("hashchange", schedule);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
