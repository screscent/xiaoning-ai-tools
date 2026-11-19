/* 咖啡与茶饮冲煮速查合集页增强（仅 nyjwtlpkdd 引用） */
(function () {
  "use strict";
  if (window.__XN_COFFEE__) return;
  window.__XN_COFFEE__ = true;

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
  var TOOL_NO = { E: "05", F: "06" };
  function fixPlaceholders() {
    var nodes = document.querySelectorAll("#root span, #root p, #root h1, #root h2, #root h3, #root a, #root strong, #root b, #root button");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.children.length) continue;
      var t = txt(el);
      var m = /^工具([EF])(\s*)(.*)$/.exec(t);
      if (m) {
        el.textContent = "工具 " + TOOL_NO[m[1]] + (m[3] ? " " + m[3] : "");
        var sib = el.nextSibling;
        if (!m[3] && sib && sib.nodeType === 3 && /^\S/.test(sib.nodeValue)) el.textContent += " ";
        continue;
      }
      if (t === "E" || t === "F") {
        var nx = el.nextElementSibling;
        if (nx && /^H2$/.test(nx.tagName) && /^工具 0[56]/.test(txt(nx))) el.textContent = TOOL_NO[t];
      }
    }
    var h2s = document.querySelectorAll("#root h2");
    for (var j = 0; j < h2s.length; j++) {
      var kids = h2s[j].childNodes;
      for (var k = 0; k < kids.length; k++) {
        var n = kids[k];
        if (n.nodeType !== 3) continue;
        var nt = (n.nodeValue || "").trim();
        var nm = /^工具([EF])(\s*)(.*)$/.exec(nt);
        if (nm) n.nodeValue = "工具 " + TOOL_NO[nm[1]] + (nm[3] ? " " + nm[3] : "");
      }
    }
  }

  /* ---------- 输入语义 ---------- */
  var NAMES = [
    { re: /投茶量/, name: "投茶量（g）" },
    { re: /成品杯量/, name: "成品杯量（ml）" },
    { re: /目标浓度/, name: "目标浓度（%TDS）" },
    { re: /萃取率/, name: "萃取率（%）" },
    { re: /烘焙日期/, name: "烘焙日期" },
    { re: /^杯数/, name: "杯数（杯）" },
    { re: /饮用时间/, name: "饮用时间" },
    { re: /就寝/, name: "计划就寝时间" },
    { re: /粉量/, name: "粉量（g）" }
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
    return "";
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
    { re: /投茶量/, vals: [3, 5, 7, 8] },
    { re: /成品杯量/, vals: [150, 200, 240, 300] },
    { re: /目标浓度/, vals: [1.15, 1.3, 1.35, 1.45] },
    { re: /萃取率/, vals: [18, 20, 22] },
    { re: /杯数/, vals: [1, 2, 3] },
    { re: /粉量/, vals: [12, 15, 18, 20] }
  ];
  function addChips(input) {
    if (!visible(input)) return;
    if (input.getBoundingClientRect().width < 120) return;
    var label = (input.getAttribute("aria-label") || "").trim();
    var rule = null;
    for (var i = 0; i < RULES.length; i++) if (RULES[i].re.test(label)) { rule = RULES[i]; break; }
    if (!rule) return;
    if (input.__xnChips && input.__xnChips.isConnected) return;
    var host = input.closest("label") || input.parentElement;
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
    var num = parseFloat(input.value);
    [].slice.call(wrap.children).forEach(function (b, i) {
      b.classList.toggle("is-on", !isNaN(num) && num === rule.vals[i]);
    });
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    fixPlaceholders();
    fixAria();
    [].slice.call(document.querySelectorAll("#root input")).forEach(addChips);
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
