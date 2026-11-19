/* 元素周期表与化学计算合集页增强（仅 ztnsb8hvkt 引用） */
(function () {
  "use strict";
  if (window.__XN_CHEM__) return;
  window.__XN_CHEM__ = true;

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
  function ctxName(el) {
    var lab = el.closest("label");
    if (lab) return txt(lab).replace(/\s+/g, " ").slice(0, 24);
    var p = el.parentElement;
    for (var i = 0; i < 3 && p; i++) {
      var t = txt(p);
      if (t.length > 3 && t.length < 40) return t.replace(/\s+/g, " ").slice(0, 24);
      p = p.parentElement;
    }
    return "";
  }

  function fixAria() {
    var els = [].slice.call(document.querySelectorAll("#root input, #root select")).filter(visible);
    els.forEach(function (el) {
      if (el.getAttribute("aria-label")) return;
      var name = ctxName(el);
      if (name && !/计算|清空|复制/.test(name)) el.setAttribute("aria-label", name);
    });
  }

  /* ---------- 快捷值 ---------- */
  var RULES = [
    { re: /^化学式/, vals: ["H2O", "NaCl", "H2SO4", "C6H12O6", "Ca(OH)2", "CuSO4·5H2O"] },
    { re: /质量 m/, vals: [1, 5, 10, 50, 100] },
    { re: /物质的量 n|摩尔数 n/, vals: [0.1, 0.5, 1, 2] },
    { re: /质量分数/, vals: [5, 10, 20, 37] },
    { re: /密度/, vals: [0.8, 1, 1.2, 1.84] },
    { re: /摩尔质量 M/, vals: [18, 44, 58.5, 98] },
    { re: /浓溶液浓度|母液浓度/, vals: [0.5, 1, 2, 5, 12] },
    { re: /所取体积 V1/, vals: [1, 5, 10, 25] },
    { re: /稀溶液浓度|目标浓度 C2/, vals: [0.05, 0.1, 0.2, 0.5] },
    { re: /稀溶液总体积|目标体积 V2/, vals: [100, 250, 500, 1000] },
    { re: /目标浓度 c/, vals: [0.01, 0.05, 0.1, 0.5] },
    { re: /溶液体积/, vals: [100, 250, 500, 1000] },
    { re: /压力 P/, vals: [50, 100, 101.325, 200] },
    { re: /体积 V/, vals: [1, 5, 10, 22.4] },
    { re: /温度/, vals: [0, 25, 37, 100] },
    { re: /摩尔浓度|浓度 c/, vals: [0.1, 0.5, 1, 2] }
  ];

  function addChips(input) {
    if (!visible(input)) return;
    if (input.getBoundingClientRect().width < 140) return;
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
      b.textContent = v;
      b.onclick = function () {
        setVal(input, v);
        setTimeout(function () {
          if (/^化学式/.test(label)) {
            var scope = input.closest("section") || document;
            var btn = [].slice.call(scope.querySelectorAll("button")).filter(function (x) {
              var t = x.textContent.trim();
              return /快速/.test(label) ? /填入 M/.test(t) : t === "计算摩尔质量";
            })[0];
            if (btn) btn.click();
          }
          setTimeout(updateAll, 80);
        }, 40);
      };
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

  /* ---------- 元素族类着色 ---------- */
  var SETS = {
    alkali: [3, 11, 19, 37, 55, 87],
    alkaline: [4, 12, 20, 38, 56, 88],
    metalloid: [5, 14, 32, 33, 51, 52],
    nonmetal: [1, 6, 7, 8, 15, 16, 34],
    halogen: [9, 17, 35, 53, 85, 117],
    noble: [2, 10, 18, 36, 54, 86, 118]
  };
  function catOf(z) {
    if (SETS.alkali.indexOf(z) >= 0) return "c-alkali";
    if (SETS.alkaline.indexOf(z) >= 0) return "c-alkaline";
    if (SETS.metalloid.indexOf(z) >= 0) return "c-metalloid";
    if (SETS.nonmetal.indexOf(z) >= 0) return "c-nonmetal";
    if (SETS.halogen.indexOf(z) >= 0) return "c-halogen";
    if (SETS.noble.indexOf(z) >= 0) return "c-noble";
    if (z >= 57 && z <= 71) return "c-lanthanide";
    if (z >= 89 && z <= 103) return "c-actinide";
    if ((z >= 21 && z <= 30) || (z >= 39 && z <= 48) || (z >= 72 && z <= 80) || (z >= 104 && z <= 112)) return "c-transition";
    return "c-post";
  }

  function paintTable() {
    var tool = document.getElementById("tool-element");
    if (!tool) return;
    var rows = tool.querySelectorAll("tbody tr");
    for (var i = 0; i < rows.length; i++) {
      var tr = rows[i];
      var first = tr.firstElementChild;
      if (!first) continue;
      var z = parseInt(txt(first), 10);
      if (!z) continue;
      var want = catOf(z);
      if (tr.classList.contains(want)) continue;
      var old = ["c-alkali", "c-alkaline", "c-transition", "c-post", "c-metalloid", "c-nonmetal", "c-halogen", "c-noble", "c-lanthanide", "c-actinide"];
      for (var j = 0; j < old.length; j++) tr.classList.remove(old[j]);
      tr.classList.add("xn-cat", want);
    }
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    fixPlaceholders();
    fixAria();
    [].slice.call(document.querySelectorAll("#root input")).forEach(addChips);
    paintTable();
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
      childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["class"]
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
