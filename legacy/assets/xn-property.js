/* 邻里与物业事务合集页增强（仅 vfgaw6lsqf 引用） */
(function () {
  "use strict";
  if (window.__XN_PROPERTY__) return;
  window.__XN_PROPERTY__ = true;

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

  /* ---------- 1. 占位标题 工具D/E/F → 04/05/06 ---------- */
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
        if (!m[3]) {
          var sib = el.nextSibling;
          if (sib && sib.nodeType === 3 && /^\S/.test(sib.nodeValue)) el.textContent += " ";
        }
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
        var nm = /^工具([DEF])(\s*)(.*)$/.exec((n.nodeValue || "").trim());
        if (nm) n.nodeValue = "工具 " + TOOL_NO[nm[1]] + (nm[3] ? " " + nm[3] : "");
      }
    }
  }

  /* ---------- 2. 输入语义 ---------- */
  function fieldOf(input) {
    return input.closest('[data-code-inspect-component="Field"]') || input.closest("label") || (input.parentElement && input.parentElement.parentElement);
  }
  function labelSpanOf(field) {
    if (!field) return null;
    var first = field.firstElementChild;
    if (!first) return null;
    var sp = first.querySelector("span");
    if (sp && !sp.querySelector("input,select")) return sp;
    return null;
  }
  function unitSpanOf(field, input) {
    if (!input || input.type === "time" || input.type === "date") return null;
    var wrap = input.parentElement;
    if (!wrap || wrap === field) return null;
    var labelSpan = labelSpanOf(field);
    var sps = wrap.querySelectorAll("span");
    for (var i = sps.length - 1; i >= 0; i--) {
      var sp = sps[i];
      if (labelSpan && sp === labelSpan) continue;
      if (sp.contains(input)) continue;
      var t = txt(sp);
      if (!t || /^[▼▾]$/.test(t) || t.length > 6) continue;
      return sp;
    }
    return null;
  }
  function fixField(field, input) {
    var nameEl = labelSpanOf(field);
    var name = nameEl ? txt(nameEl).replace(/\s+/g, "") : "";
    if (!name) name = (input.getAttribute("placeholder") || "").replace(/\s+/g, "");
    if (!name) return "";
    if (nameEl && !nameEl.classList.contains("xn-flabel")) nameEl.classList.add("xn-flabel");
    var unitEl = unitSpanOf(field, input);
    var unit = unitEl ? txt(unitEl).replace(/\s+/g, "") : "";
    if (unitEl && !unitEl.classList.contains("xn-unit")) unitEl.classList.add("xn-unit");
    var aria = unit && unit !== "▼" && unit !== name ? name + "（" + unit + "）" : name;
    if (input.getAttribute("aria-label") !== aria) input.setAttribute("aria-label", aria);
    return name;
  }
  function fixAria() {
    var ins = [].slice.call(document.querySelectorAll("#root input")).filter(visible);
    ins.forEach(function (input) {
      var f = fieldOf(input);
      if (f) fixField(f, input);
    });
    var sels = [].slice.call(document.querySelectorAll("#root select")).filter(visible);
    sels.forEach(function (sel) {
      var f = fieldOf(sel);
      var name = f ? (labelSpanOf(f) ? txt(labelSpanOf(f)) : "") : "";
      if (name && sel.getAttribute("aria-label") !== name) sel.setAttribute("aria-label", name);
      if (!sel.classList.contains("xn-select")) sel.classList.add("xn-select");
    });
  }

  /* ---------- 3. 常用值快捷值 ---------- */
  var RULES = [
    { re: /房屋建筑面积|房屋面积/, vals: [60, 89, 110, 140] },
    { re: /物业费单价/, vals: [1.8, 2.3, 2.6, 3.2] },
    { re: /公摊水电/, vals: [15, 25, 40, 60] },
    { re: /车位管理费/, vals: [0, 50, 100, 150] },
    { re: /欠费月数/, vals: [0, 3, 6, 12] },
    { re: /违约金/, vals: [0.1, 0.3, 0.5] },
    { re: /平均单价|均价/, vals: [2.0, 2.5, 3.0] },
    { re: /维修基金单价/, vals: [50, 100, 150, 200] },
    { re: /维修预算/, vals: [500, 1500, 5000, 10000] },
    { re: /车位月租/, vals: [0, 200, 300, 500] },
    { re: /临停单价/, vals: [2, 5, 10] },
    { re: /临停次数/, vals: [5, 10, 20, 30] },
    { re: /工期|装修.*天|施工.*天/, vals: [15, 30, 60, 90] },
    { re: /发生天数|天\/周|每周.*天/, vals: [3, 5, 7] }
  ];
  function ruleFor(name) {
    for (var i = 0; i < RULES.length; i++) if (RULES[i].re.test(name)) return RULES[i];
    return null;
  }
  function syncChip(input, wrap, rule) {
    var num = parseFloat(input.value);
    [].slice.call(wrap.children).forEach(function (b, i) {
      b.classList.toggle("is-on", !isNaN(num) && num === rule.vals[i]);
    });
  }
  function addChips(field, input, name) {
    if (!ruleFor(name)) return;
    if (field.__xnChips && field.__xnChips.isConnected) return;
    var rule = ruleFor(name);
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
  }
  function buildChips() {
    var ins = [].slice.call(document.querySelectorAll("#root input")).filter(visible);
    ins.forEach(function (input) {
      var f = fieldOf(input);
      if (!f) return;
      var name = fixField(f, input);
      if (name) addChips(f, input, name);
    });
  }

  /* ---------- 4. 核心数字层级 ---------- */
  function markKpi() {
    var vals = document.querySelectorAll('#root p[class*="text-[21px]"]');
    for (var i = 0; i < vals.length; i++) {
      var p = vals[i];
      if (!p.classList.contains("xn-kpi")) p.classList.add("xn-kpi");
      var card = p.parentElement;
      if (card && !card.classList.contains("xn-kpi-card")) card.classList.add("xn-kpi-card");
      if (card) {
        var lab = card.querySelector("p");
        if (lab && lab !== p && !lab.classList.contains("xn-kpi-label")) lab.classList.add("xn-kpi-label");
      }
    }
  }

  /* ---------- 5. 按钮语义 ---------- */
  function fixButtons() {
    var btns = [].slice.call(document.querySelectorAll("#root button")).filter(visible);
    btns.forEach(function (b) {
      var t = txt(b);
      if (/计算/.test(t) && !b.getAttribute("aria-label")) {
        b.setAttribute("aria-label", "按当前输入计算");
        if (!b.classList.contains("xn-calc")) b.classList.add("xn-calc");
      }
      if (/复制结果/.test(t) && !b.getAttribute("aria-label")) {
        b.setAttribute("aria-label", "复制计算结果");
        if (!b.classList.contains("xn-copy")) b.classList.add("xn-copy");
      }
    });
  }

  /* ---------- 6. 当前输入摘要 ---------- */
  function currentSummary() {
    var calc = [].slice.call(document.querySelectorAll("#root button")).filter(visible).filter(function (b) { return /计算/.test(txt(b)); })[0];
    if (!calc) return;
    var host = calc.parentElement;
    if (!host) return;
    var parts = [];
    var ins = [].slice.call(document.querySelectorAll("#root input")).filter(visible);
    ins.forEach(function (input) {
      var f = fieldOf(input);
      if (!f) return;
      var nameEl = labelSpanOf(f);
      var name = nameEl ? txt(nameEl).replace(/\s+/g, "") : "";
      var v = input.value;
      if (!name || v === "") return;
      var unitEl = unitSpanOf(f, input);
      var unit = unitEl ? txt(unitEl).replace(/\s+/g, "") : "";
      parts.push(name + " " + v + (unit && unit !== "▼" ? unit : ""));
    });
    var sels = [].slice.call(document.querySelectorAll("#root select")).filter(visible);
    sels.forEach(function (sel) {
      var f = fieldOf(sel);
      var nameEl = f ? labelSpanOf(f) : null;
      var name = nameEl ? txt(nameEl).replace(/\s+/g, "") : "";
      if (!name) return;
      var opt = sel.options[sel.selectedIndex];
      parts.push(name + " " + (opt ? txt(opt) : sel.value));
    });
    if (!parts.length) {
      host.removeAttribute("data-xn-sum");
      return;
    }
    var text = "当前输入 · " + parts.slice(0, 6).join(" · ");
    if (host.getAttribute("data-xn-sum") !== text) host.setAttribute("data-xn-sum", text);
  }

  /* ---------- 7. 回到工具切换 ---------- */
  function ensureQuickTop() {
    var root = document.getElementById("root");
    if (!root) return;
    var b = root.querySelector(".xn-quick-top");
    if (!b) {
      b = document.createElement("button");
      b.type = "button";
      b.className = "xn-quick-top";
      b.textContent = "↑ 切换工具";
      b.setAttribute("aria-label", "回到顶部切换工具");
      b.onclick = function () {
        var nav = document.querySelector("#root nav");
        if (nav) nav.scrollIntoView({ behavior: "smooth", block: "start" });
        else window.scrollTo({ top: 0, behavior: "smooth" });
      };
      root.appendChild(b);
    }
    var show = window.scrollY > 520;
    b.classList.toggle("is-show", show);
  }

  function updateAll() {
    var root = document.getElementById("root");
    if (!root) return;
    fixPlaceholders();
    fixAria();
    buildChips();
    markKpi();
    fixButtons();
    currentSummary();
    ensureQuickTop();
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
    window.addEventListener("scroll", function () {
      try { ensureQuickTop(); } catch (e) {}
    }, { passive: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
