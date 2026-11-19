/* 月度预算与配额分配合集页增强（仅 2qethzqqxb 引用）
 * - 数字框只有「元/%」aria：从可见标签补全字段语义
 * - 按语义补常用值胶囊（收入/房租/固定/比例…）
 * - 两个计算按钮上方当前设置摘要
 * - 结果金额分级 + 结余状态标签
 */
(function () {
  "use strict";
  if (window.__XN_BUDGET__) return;
  window.__XN_BUDGET__ = true;

  function txt(el) { return (el.textContent || "").trim(); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function setInput(el, v) {
    var proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    proto.set.call(el, String(v));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  /* ---------- 字段语义 ---------- */
  function fieldLabel(input) {
    var n = input.parentElement;
    for (var i = 0; i < 3 && n; i++, n = n.parentElement) {
      var t = (n.innerText || "").replace(/\s+/g, " ").trim();
      if (t && t.length <= 24 && /[\u4e00-\u9fa5]{2}/.test(t)) return t;
    }
    return "";
  }

  function unitOf(label) {
    if (/元/.test(label)) return "元";
    if (/%/.test(label)) return "%";
    return "";
  }

  function fixLabels() {
    [].slice.call(document.querySelectorAll("#root input[type=number]")).forEach(function (inp) {
      var cur = inp.getAttribute("aria-label") || "";
      if (cur && cur !== "元" && cur !== "%") return;
      var label = fieldLabel(inp).replace(/[元%]\s*$/, "").trim();
      if (!label) return;
      var unit = unitOf(fieldLabel(inp));
      inp.setAttribute("aria-label", label + (unit ? "（" + unit + "）" : ""));
    });
  }

  /* ---------- 常用值 ---------- */
  var RULES = [
    { re: /收入/, vals: [5000, 8000, 10000, 15000, 20000], unit: "元", money: true },
    { re: /储蓄目标比例|储蓄率/, vals: [10, 20, 30], unit: "%" },
    { re: /房租/, vals: [2000, 3000, 4000, 5000], unit: "元", money: true },
    { re: /固定支出/, vals: [500, 800, 1200, 1500], unit: "元", money: true },
    { re: /餐饮/, vals: [10, 15, 20], unit: "%" },
    { re: /弹性/, vals: [10, 15, 20], unit: "%" },
    { re: /可支配额度/, vals: [5000, 10000, 15000], unit: "元", money: true }
  ];

  function ruleFor(label) {
    for (var i = 0; i < RULES.length; i++) if (RULES[i].re.test(label)) return RULES[i];
    return null;
  }

  function addChips(input) {
    var label = input.getAttribute("aria-label") || "";
    var rule = ruleFor(label);
    if (!rule) return;
    var field = input.parentElement;
    var host = field && field.parentElement;
    if (!field || !host || host.querySelector(".xn-chips")) return;
    var wrap = document.createElement("div");
    wrap.className = "xn-chips";
    rule.vals.forEach(function (v) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = (v >= 10000 ? (v / 10000) + " 万" : v + rule.unit);
      b.onclick = function () { setInput(input, v); setTimeout(updateAll, 40); };
      wrap.appendChild(b);
    });
    host.appendChild(wrap);
    input.addEventListener("input", function () { syncChips(input, wrap, rule); });
    input.addEventListener("change", function () { syncChips(input, wrap, rule); });
    syncChips(input, wrap, rule);
  }

  function syncChips(input, wrap, rule) {
    var cur = parseFloat(input.value);
    [].slice.call(wrap.children).forEach(function (b, i) {
      b.classList.toggle("is-on", !isNaN(cur) && Math.abs(cur - rule.vals[i]) < 1e-9);
    });
  }

  /* ---------- 当前设置摘要 ---------- */
  function shortLabel(l) {
    return l.replace(/（.*?）/g, "").replace(/\(.*?\)/g, "").trim();
  }

  function blockOf(btn) {
    var n = btn.parentElement;
    for (var i = 0; i < 5 && n; i++, n = n.parentElement) {
      if (n.querySelector && n.querySelectorAll("input").length >= 2) return n;
    }
    return null;
  }

  function updateBars() {
    var btns = [].slice.call(document.querySelectorAll("#root button")).filter(function (b) {
      return /^(分配月度预算|计算配额)$/.test(txt(b));
    });
    btns.forEach(function (btn) {
      var block = blockOf(btn);
      if (!block) return;
      var bar = block.querySelector(".xn-setbar");
      if (!bar) {
        bar = document.createElement("div");
        bar.className = "xn-setbar";
        btn.parentElement.insertBefore(bar, btn);
      }
      var parts = [];
      [].slice.call(block.querySelectorAll("input[type=number]")).forEach(function (inp) {
        if (parts.length >= 4) return;
        var l = (inp.getAttribute("aria-label") || "").replace(/（.*?）/g, "");
        if (!l) return;
        var u = /%/.test(inp.getAttribute("aria-label")) ? "%" : " 元";
        parts.push(shortLabel(l) + " " + inp.value + u);
      });
      var html = '<span class="xn-setlabel">当前设置</span>';
      if (!parts.length) html += '<span class="xn-setnote">填写收入与比例后点击下方按钮</span>';
      else html += parts.map(function (p) { return "<b>" + esc(p) + "</b>"; }).join("<span>·</span>");
      if (bar.innerHTML !== html) bar.innerHTML = html;
    });
  }

  /* ---------- 结果强化 ---------- */
  function rowText(el) {
    var row = el.parentElement;
    var best = "", cjk = "";
    for (var i = 0; i < 4 && row; i++, row = row.parentElement) {
      var t = (row.innerText || "").replace(/\s+/g, " ").trim();
      if (!t) continue;
      if (/[\u4e00-\u9fa5]{2}/.test(t)) {
        if (t.length <= 80) return t;
        if (!cjk || t.length < cjk.length) cjk = t;
      }
      if (!best || t.length < best.length) best = t;
    }
    return cjk || best;
  }

  function markResults() {
    var leaves = [].slice.call(document.querySelectorAll("#root span, #root strong, #root p, #root div"));
    leaves.forEach(function (el) {
      if (el.children.length) return;
      var t = txt(el);
      if (!t) return;
      if (/^¥[\d,]+(\.\d+)?$/.test(t)) {
        var ctx = rowText(el);
        el.classList.remove("xn-hero-num", "xn-num-lg", "xn-money");
        if (/可支配/.test(ctx)) el.classList.add("xn-hero-num");
        else if (/储蓄金额/.test(ctx)) el.classList.add("xn-num-lg");
        else if (/房租|固定支出|餐饮|弹性|必要支出|可选消费|配额|储蓄/.test(ctx)) el.classList.add("xn-money");
      } else if (/^\d+(\.\d+)?%$/.test(t) && /占比合计/.test(rowText(el))) {
        el.classList.remove("xn-ok-text", "xn-warn-text", "xn-bad-text");
        el.classList.add(Math.abs(parseFloat(t) - 100) > 0.01 ? "xn-warn-text" : "xn-ok-text");
      }
    });
    // 结余状态：不改写 React 文本，只在段落旁追加状态徽标
    [].slice.call(document.querySelectorAll("#root p, #root div")).forEach(function (el) {
      if (el.children.length) return;
      var t = txt(el);
      var hit = t.match(/(未分配|超支|不足)/);
      if (!hit) return;
      var badge = el.nextElementSibling;
      if (!badge || !badge.classList || !badge.classList.contains("xn-state")) {
        badge = document.createElement("span");
        badge.className = "xn-state";
        el.parentElement.insertBefore(badge, el.nextSibling);
      }
      var bad = /超支|不足/.test(t);
      badge.classList.toggle("xn-state-bad", bad);
      badge.classList.toggle("xn-state-warn", !bad);
      badge.textContent = bad ? "超支" : "未分配";
    });
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    fixLabels();
    [].slice.call(document.querySelectorAll("#root input[type=number]")).forEach(addChips);
    updateBars();
    markResults();
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
