/* 窗帘尺寸与窗饰计算合集页增强（仅 4grk69btnf 引用） */
(function () {
  "use strict";
  if (window.__XN_CURTAIN__) return;
  window.__XN_CURTAIN__ = true;

  var TOOL_NO = { A: "01", B: "02", C: "03", D: "04", E: "05", F: "06" };
  var RULES = [
    { re: /^窗宽（cm）/, vals: [120, 180, 240, 300] },
    { re: /^窗高（cm）/, vals: [150, 200, 260, 300] },
    { re: /^成品布宽/, vals: [2, 3, 4, 6] },
    { re: /^窗高（m）/, vals: [1.5, 2.2, 2.8] },
    { re: /^面料单价/, vals: [40, 60, 100, 150] },
    { re: /^窗帘总宽度/, vals: [3, 4, 6] },
    { re: /^整套预算/, vals: [1500, 2000, 3000, 5000] }
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
  function clickCalc() {
    var b = [].slice.call(document.querySelectorAll("#root button")).filter(visible).filter(function (x) { return /^计算/.test(txt(x)); })[0];
    if (b) b.click();
  }

  /* ---------- 1. 工具A–F ---------- */
  function fixPlaceholders() {
    var nodes = document.querySelectorAll("#root span, #root p, #root h1, #root h2, #root h3, #root a, #root strong, #root b, #root button");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.children.length) continue;
      var t = txt(el);
      var m = /^工具([A-F])(\s*)(.*)$/.exec(t);
      if (!m) continue;
      el.textContent = "工具 " + TOOL_NO[m[1]] + (m[3] ? " " + m[3] : "");
      if (!m[3]) {
        var sib = el.nextSibling;
        if (sib && sib.nodeType === 3 && /^\S/.test(sib.nodeValue)) el.textContent += " ";
      }
    }
  }

  /* ---------- 2. tab 吸顶 ---------- */
  function markTabs() {
    var root = document.getElementById("root");
    if (!root) return;
    var links = [].slice.call(root.querySelectorAll("a")).filter(function (a) { return /^#\//.test(a.getAttribute("href") || ""); });
    if (!links.length) return;
    var wrap = links[0].parentElement;
    if (wrap && !wrap.classList.contains("xn-tabs")) wrap.classList.add("xn-tabs");
  }

  /* ---------- 3. 数字框快捷值 ---------- */
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
      if (!input.getAttribute("aria-label")) input.setAttribute("aria-label", name);
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
        b.onclick = function () {
          setVal(input, v);
          syncChip(input, wrap, rule);
          setTimeout(clickCalc, 120);
        };
        wrap.appendChild(b);
      });
      field.appendChild(wrap);
      field.__xnChips = wrap;
      input.addEventListener("input", function () { syncChip(input, wrap, rule); });
      syncChip(input, wrap, rule);
    });
  }

  /* ---------- 4. 结果层级 ---------- */
  function markResult() {
    var cards = [].slice.call(document.querySelectorAll('#root [data-code-inspect-component="ResultCard"]')).filter(visible);
    cards.forEach(function (c) {
      var dl = c.querySelector("dl");
      if (!dl) return;
      if (!c.classList.contains("xn-res-card")) c.classList.add("xn-res-card");
      var dds = dl.querySelectorAll("dd");
      for (var i = 0; i < dds.length; i++) {
        if (!dds[i].classList.contains("xn-res-val")) dds[i].classList.add("xn-res-val");
      }
      if (dds[0] && !dds[0].classList.contains("xn-res-primary")) dds[0].classList.add("xn-res-primary");
    });
  }

  /* ---------- 5. 计算后结果进入视野 ---------- */
  function scrollToResult() {
    setTimeout(function () {
      var cards = [].slice.call(document.querySelectorAll('#root [data-code-inspect-component="ResultCard"]')).filter(visible);
      var c = cards[cards.length - 1];
      if (c) c.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 260);
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    fixPlaceholders();
    markTabs();
    fixNumbers();
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
    document.addEventListener("click", function (e) {
      var b = e.target && e.target.closest ? e.target.closest("button") : null;
      if (b && /^计算/.test(txt(b))) scrollToResult();
    }, true);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
