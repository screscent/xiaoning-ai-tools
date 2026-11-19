/* 纸箱与打包耗材计算合集页增强（仅 4gmjfubtnf 引用） */
(function () {
  "use strict";
  if (window.__XN_BOX__) return;
  window.__XN_BOX__ = true;

  var TOOL_NO = { A: "01", B: "02", C: "03", D: "04", E: "05" };
  var RULES = [
    { re: /^房间数/, vals: [1, 2, 3, 5] },
    { re: /^每间物品体积/, vals: [0.5, 1, 1.5, 3] },
    { re: /^单箱容量/, vals: [30, 50, 80, 120] },
    { re: /^纸箱数/, vals: [10, 24, 50, 100] },
    { re: /^每箱胶带米数|^单箱胶带米数/, vals: [2, 3, 5] },
    { re: /^每箱气泡膜米数/, vals: [0, 1, 2, 3] },
    { re: /^胶带单价/, vals: [3, 5, 8] },
    { re: /^气泡膜单价/, vals: [10, 15, 25] },
    { re: /^物品件数/, vals: [50, 100, 300] },
    { re: /^每件打包/, vals: [2, 4, 6] },
    { re: /^人手数/, vals: [1, 2, 3, 5] },
    { re: /^每小时人工成本/, vals: [0, 20, 30, 50] },
    { re: /^缓冲材料每箱克数/, vals: [20, 50, 100] },
    { re: /^长/, vals: [30, 40, 50, 60] },
    { re: /^宽/, vals: [30, 40, 50, 60] },
    { re: /^高/, vals: [20, 30, 40, 50] },
    { re: /^实重|^包裹实重/, vals: [1, 5, 10, 20] }
  ];

  function txt(el) { return (el.textContent || "").trim(); }
  function visible(el) {
    if (!el) return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }
  function setVal(el, v) {
    var proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    proto.set.call(el, String(v));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  /* ---------- 1. 工具A–E ---------- */
  function fixPlaceholders() {
    var nodes = document.querySelectorAll("#root span, #root p, #root h1, #root h2, #root h3, #root a, #root strong, #root b, #root button");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.children.length) continue;
      var t = txt(el);
      var m = /^工具([A-E])(\s*)(.*)$/.exec(t);
      if (m) {
        el.textContent = "工具 " + TOOL_NO[m[1]] + (m[3] ? " " + m[3] : "");
        if (!m[3]) {
          var sib = el.nextSibling;
          if (sib && sib.nodeType === 3 && /^\S/.test(sib.nodeValue)) el.textContent += " ";
        }
      }
    }
    var links = document.querySelectorAll('#root a[href^="#/"]');
    for (var k = 0; k < links.length; k++) {
      var badge = links[k].querySelector("span");
      if (!badge) continue;
      var bt = txt(badge);
      if (TOOL_NO[bt]) badge.textContent = TOOL_NO[bt];
      else if (bt === "⑤") badge.textContent = "05";
    }
    /* h2 文本节点（含「工具A …」「⑤…」） */
    var h2s = document.querySelectorAll("#root h2");
    for (var j = 0; j < h2s.length; j++) {
      var kids = h2s[j].childNodes;
      for (var q = 0; q < kids.length; q++) {
        var n = kids[q];
        if (n.nodeType !== 3) continue;
        var nt = n.nodeValue || "";
        var nm = /^工具([A-E])\s*(.*)$/.exec(nt);
        if (nm) {
          n.nodeValue = "工具 " + TOOL_NO[nm[1]] + (nm[2] ? " " + nm[2] : "");
          continue;
        }
        var vm = /^⑤\s*(.*)$/.exec(nt);
        if (vm) n.nodeValue = "工具 05 " + vm[1];
      }
    }
  }

  /* ---------- 2. tab ---------- */
  function markTabs() {
    var root = document.getElementById("root");
    if (!root) return;
    var links = [].slice.call(root.querySelectorAll("a")).filter(function (a) { return /^#\//.test(a.getAttribute("href") || ""); });
    if (!links.length) return;
    var wrap = links[0].parentElement;
    if (wrap && !wrap.classList.contains("xn-tabs")) wrap.classList.add("xn-tabs");
    var r = (location.hash || "").replace(/^#/, "");
    links.forEach(function (a) {
      var on = a.getAttribute("href") === "#" + r;
      if (on && a.getAttribute("aria-current") !== "page") a.setAttribute("aria-current", "page");
      if (!on && a.getAttribute("aria-current")) a.removeAttribute("aria-current");
    });
  }

  /* ---------- 3. 数字框语义与快捷值 ---------- */
  function ruleFor(name) {
    for (var i = 0; i < RULES.length; i++) if (RULES[i].re.test(name)) return RULES[i];
    return null;
  }
  function syncChip(input, wrap, rule) {
    var n = parseFloat(input.value);
    [].slice.call(wrap.children).forEach(function (b, i) {
      b.classList.toggle("is-on", !isNaN(n) && n === rule.vals[i]);
    });
  }
  function fixNumbers() {
    var fields = [].slice.call(document.querySelectorAll('#root [data-code-inspect-component="NumberField"]')).filter(visible);
    fields.forEach(function (field) {
      var input = field.querySelector('input[type="number"]');
      var lab = field.querySelector("label");
      if (!input || !lab) return;
      var name = txt(lab).replace(/\s+/g, "");
      var wrapInp = input.parentElement;
      var unitEl = wrapInp ? wrapInp.querySelector("span") : null;
      var unit = unitEl ? txt(unitEl).replace(/\s+/g, "") : "";
      var aria = name;
      if (!/[（(]/.test(name) && unit) aria = name + "（" + unit + "）";
      if (input.getAttribute("aria-label") !== aria) input.setAttribute("aria-label", aria);
      var rule = ruleFor(name);
      if (!rule) return;
      if (field.__xnChips && field.__xnChips.isConnected) return;
      var wrap = document.createElement("div");
      wrap.className = "xn-chips";
      rule.vals.forEach(function (v) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "xn-chip";
        b.textContent = v;
        b.setAttribute("aria-label", name + "设为 " + v);
        b.onclick = function () { setVal(input, v); syncChip(input, wrap, rule); };
        wrap.appendChild(b);
      });
      field.appendChild(wrap);
      field.__xnChips = wrap;
      input.addEventListener("input", function () { syncChip(input, wrap, rule); });
      syncChip(input, wrap, rule);
    });
  }

  /* ---------- 4. 体积重系数 ---------- */
  function markChoices() {
    var btns = [].slice.call(document.querySelectorAll("#root button")).filter(visible);
    btns.forEach(function (b) {
      var t = txt(b);
      if (t !== "6000" && t !== "5000" && t !== "12000") return;
      if (!b.classList.contains("xn-choice")) b.classList.add("xn-choice");
      var on = (b.className || "").toString().indexOf("bg-amber-600") >= 0;
      var v = on ? "true" : "false";
      if (b.getAttribute("aria-pressed") !== v) b.setAttribute("aria-pressed", v);
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "体积重系数 " + t);
    });
  }

  /* ---------- 5. 复制 ---------- */
  function markCopy() {
    var btns = [].slice.call(document.querySelectorAll("#root button"));
    btns.forEach(function (b) {
      if (!/一键复制/.test(txt(b))) return;
      if (!b.classList.contains("xn-copy")) b.classList.add("xn-copy");
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "复制计算结果");
    });
  }

  /* ---------- 6. 结果层级 ---------- */
  function markResult() {
    var cards = [].slice.call(document.querySelectorAll('#root section[data-code-inspect-component="ResultCard"]')).filter(visible);
    cards.forEach(function (c) {
      var vals = c.querySelectorAll("span.text-lg");
      for (var i = 0; i < vals.length; i++) {
        if (!vals[i].classList.contains("xn-res-val")) vals[i].classList.add("xn-res-val");
      }
      if (vals[0] && !vals[0].classList.contains("xn-res-primary")) vals[0].classList.add("xn-res-primary");
    });
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    fixPlaceholders();
    markTabs();
    fixNumbers();
    markChoices();
    markCopy();
    markResult();
  }

  var scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(function () { scheduled = false; try { updateAll(); } catch (e) {} }, 180);
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
