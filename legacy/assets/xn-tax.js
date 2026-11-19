/* 个税与到手工资合集页增强（仅 qsikgrnhme 引用） */
(function () {
  "use strict";
  if (window.__XN_TAX__) return;
  window.__XN_TAX__ = true;

  function txt(el) { return (el.textContent || "").trim(); }
  function visible(el) { return el.getBoundingClientRect().height > 0; }
  function setVal(el, v) {
    var proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    proto.set.call(el, String(v));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  /* ---------- 占位标题归一 ---------- */
  var TOOL_NO = { E: "05", F: "06" };
  function fixPlaceholders() {
    var nodes = document.querySelectorAll("#root span, #root p, #root h1, #root h2, #root h3, #root a, #root strong, #root b, #root button");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.children.length) continue;
      var t = txt(el);
      var m = /^工具([EF])(\s*)(.*)$/.exec(t);
      if (m) {
        var rest = m[3] ? " " + m[3] : "";
        el.textContent = "工具 " + TOOL_NO[m[1]] + rest;
        continue;
      }
      /* 区块标题前的序号徽标：E → 05，F → 06（徽标是 h2 的前一个兄弟） */
      if (t === "E" || t === "F") {
        var nx = el.nextElementSibling;
        if (nx && /^H2$/.test(nx.tagName) && /^工具 0[56]/.test(txt(nx))) el.textContent = TOOL_NO[t];
      }
    }
  }

  /* ---------- 结果数字 ---------- */
  var RESULTS = [
    { sel: "#s-out-net", cls: "xn-tax-hero" },
    { sel: "#s-out-tax", cls: "xn-tax-mid" },
    { sel: "#s-out-taxable", cls: "xn-tax-mid" },
    { sel: "#s-out-gap", cls: "xn-tax-sub" },
    { sel: "#s-out-refund", cls: "xn-tax-sub xn-tax-green" },
    { sel: "#s-out-pay", cls: "xn-tax-sub xn-tax-red" },
    { sel: "#f-out-net", cls: "xn-tax-mid" },
    { sel: "#f-out-tax", cls: "xn-tax-sub" },
    { sel: "#f-out-extra", cls: "xn-tax-mid" }
  ];

  function markResults() {
    RESULTS.forEach(function (r) {
      var el = document.querySelector(r.sel);
      if (!el) return;
      r.cls.split(" ").forEach(function (c) { el.classList.add(c); });
    });
    /* 年终奖对比：dd 里的到手/税后数字 */
    var dds = document.querySelectorAll("#tool-bonus dd");
    for (var i = 0; i < dds.length; i++) {
      var dd = dds[i];
      if (!/^¥/.test(txt(dd))) continue;
      var dt = dd.parentElement ? dd.parentElement.querySelector("dt") : null;
      var label = dt ? txt(dt) : "";
      dd.classList.remove("xn-tax-mid", "xn-tax-sub");
      if (/到手年终奖|全年税后合计/.test(label)) dd.classList.add("xn-tax-mid");
      else dd.classList.add("xn-tax-sub");
    }
    /* 五险一金合计行 */
    var rows = document.querySelectorAll("#tool-insurance tr");
    for (var j = 0; j < rows.length; j++) {
      var row = rows[j];
      if (/个人缴纳合计/.test(txt(row))) {
        row.classList.add("xn-tax-total");
        var cells = row.querySelectorAll("td,th");
        for (var k = 0; k < cells.length; k++) {
          if (/^¥/.test(txt(cells[k]))) cells[k].classList.add("xn-tax-mid");
        }
      }
    }
  }

  /* ---------- 快捷值 ---------- */
  var RULES = [
    { re: /^月工资/, vals: [6000, 8000, 10000, 15000, 20000, 30000] },
    { re: /^社保公积金个人缴纳/, vals: [0, 500, 1000, 1500, 2000, 3000] },
    { re: /^专项附加扣除/, vals: [0, 1000, 2000, 3000] },
    { re: /^年终奖金额/, vals: [10000, 30000, 50000, 100000] },
    { re: /^缴费基数/, vals: [5000, 8000, 10000, 15000, 20000] },
    { re: /^年度已预缴税额/, vals: [0, 3000, 8000, 20000] },
    { re: /^年度应纳税额/, vals: [0, 3000, 6200, 20000] },
    { re: /^主业月薪/, vals: [8000, 10000, 15000, 20000, 30000] },
    { re: /^副业月收入/, vals: [0, 3000, 5000, 10000, 20000] },
    { re: /^副业成本占比/, vals: [0, 10, 20, 30] }
  ];

  function addChips(input) {
    if (!visible(input)) return;
    if (input.getBoundingClientRect().width < 180) return;
    var label = input.getAttribute("aria-label") || "";
    var rule = null;
    for (var i = 0; i < RULES.length; i++) if (RULES[i].re.test(label)) { rule = RULES[i]; break; }
    if (!rule || input.__xnChips) return;
    var host = input.parentElement;
    if (!host) return;
    var cs = window.getComputedStyle(host);
    var flexRow = cs.display.indexOf("flex") === 0 && cs.flexDirection.indexOf("row") === 0;
    var wrap = document.createElement("div");
    wrap.className = "xn-chips";
    rule.vals.forEach(function (v) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = v;
      b.onclick = function () { setVal(input, v); setTimeout(updateAll, 40); };
      wrap.appendChild(b);
    });
    if (flexRow && host.parentElement) host.parentElement.insertBefore(wrap, host.nextSibling);
    else host.appendChild(wrap);
    input.__xnChips = true;
    input.addEventListener("input", function () { sync(input, wrap, rule); });
    sync(input, wrap, rule);
  }

  function sync(input, wrap, rule) {
    var cur = parseFloat(input.value);
    [].slice.call(wrap.children).forEach(function (b, i) {
      b.classList.toggle("is-on", !isNaN(cur) && cur === rule.vals[i]);
    });
  }

  /* ---------- 开关可读性 ---------- */
  function labelSwitches() {
    var sws = document.querySelectorAll("#root [role=switch]");
    for (var i = 0; i < sws.length; i++) {
      var sw = sws[i];
      if (sw.getAttribute("aria-checked") === null) {
        sw.setAttribute("aria-checked", /bg-blue-600/.test(sw.className) ? "true" : "false");
      }
      if (sw.getAttribute("aria-label")) continue;
      var row = sw.parentElement;
      var t = row ? row.querySelector("p") : null;
      if (t && txt(t)) sw.setAttribute("aria-label", txt(t));
    }
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    fixPlaceholders();
    markResults();
    [].slice.call(document.querySelectorAll("#root input[type=number]")).forEach(addChips);
    labelSwitches();
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
