/* 钓鱼线组与装备合集页增强（仅 4gfi47btnf 引用） */
(function () {
  "use strict";
  if (window.__XN_FISH__) return;
  window.__XN_FISH__ = true;

  var RULES = [
    { re: /^水深/, vals: [1, 2, 3, 5] },
    { re: /^风力/, vals: [1, 2, 3, 4] }
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

  /* ---------- 1. 工具卡当前态 ---------- */
  function markTabs() {
    var links = [].slice.call(document.querySelectorAll('#root a[href^="#/"]'));
    links.forEach(function (a) {
      var on = (a.className || "").toString().indexOf("shadow-[0_6px_20px") >= 0;
      if (on && a.getAttribute("aria-current") !== "page") a.setAttribute("aria-current", "page");
      if (!on && a.getAttribute("aria-current")) a.removeAttribute("aria-current");
    });
  }

  /* ---------- 2. 输入语义与快捷值 ---------- */
  function labelInfo(input) {
    var lab = input.closest("label");
    if (!lab) return null;
    var span = lab.querySelector("span");
    if (!span) return null;
    var unitEl = span.querySelector("span");
    var nameNode = span.firstChild;
    var name = nameNode && nameNode.nodeType === 3 ? nameNode.nodeValue.trim() : txt(span);
    if (unitEl) name = name.replace(txt(unitEl), "").trim();
    var unit = unitEl ? txt(unitEl).replace(/\s+/g, "") : "";
    return { lab: lab, name: name, unit: unit };
  }
  function syncChip(input, wrap, rule) {
    var n = parseFloat(input.value);
    [].slice.call(wrap.children).forEach(function (b, i) {
      b.classList.toggle("is-on", !isNaN(n) && n === rule.vals[i]);
    });
  }
  function fixInputs() {
    var ins = [].slice.call(document.querySelectorAll('#root input[type="number"]')).filter(visible);
    ins.forEach(function (input) {
      var info = labelInfo(input);
      if (!info || !info.name) return;
      var aria = info.unit ? info.name + "（" + info.unit + "）" : info.name;
      if (input.getAttribute("aria-label") !== aria) input.setAttribute("aria-label", aria);
      var rule = null;
      for (var i = 0; i < RULES.length; i++) if (RULES[i].re.test(info.name)) { rule = RULES[i]; break; }
      if (!rule) return;
      if (info.lab.__xnChips && info.lab.__xnChips.isConnected) return;
      var wrap = document.createElement("div");
      wrap.className = "xn-chips";
      rule.vals.forEach(function (v) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "xn-chip";
        b.textContent = v;
        b.setAttribute("aria-label", info.name + "设为 " + v);
        b.onclick = function () { setVal(input, v); syncChip(input, wrap, rule); };
        wrap.appendChild(b);
      });
      info.lab.appendChild(wrap);
      info.lab.__xnChips = wrap;
      input.addEventListener("input", function () { syncChip(input, wrap, rule); });
      syncChip(input, wrap, rule);
    });
  }

  /* ---------- 3. 下拉语义 ---------- */
  function fixSelects() {
    var sels = [].slice.call(document.querySelectorAll("#root select")).filter(visible);
    sels.forEach(function (sel) {
      if (sel.getAttribute("aria-label")) return;
      var lab = sel.closest("label");
      if (!lab) return;
      var span = lab.querySelector("span");
      if (span) sel.setAttribute("aria-label", txt(span).replace(/\s+/g, ""));
    });
  }

  /* ---------- 4. 复制 ---------- */
  function markCopy() {
    var btns = [].slice.call(document.querySelectorAll("#root button"));
    btns.forEach(function (b) {
      if (!/^复制结果/.test(txt(b))) return;
      if (!b.classList.contains("xn-copy")) b.classList.add("xn-copy");
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "复制结果");
    });
  }

  /* ---------- 5. 结果值 ---------- */
  function markResult() {
    var panels = [].slice.call(document.querySelectorAll('#root [data-code-inspect-component="ResultPanel"]')).filter(visible);
    panels.forEach(function (panel) {
      var dds = panel.querySelectorAll("dd");
      for (var i = 0; i < dds.length; i++) {
        if (!dds[i].classList.contains("xn-val")) dds[i].classList.add("xn-val");
        dds[i].classList.remove("xn-val-primary");
      }
      if (dds[0]) dds[0].classList.add("xn-val-primary");
    });
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    markTabs();
    fixInputs();
    fixSelects();
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
