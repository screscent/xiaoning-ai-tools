/* AI 应用开发速查合集页增强（仅 z5hmrdaahj 引用） */
(function () {
  "use strict";
  if (window.__XN_AI__) return;
  window.__XN_AI__ = true;

  function txt(el) { return (el.textContent || "").trim(); }
  function visible(el) {
    if (!el) return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }
  function hasCls(el, s) { return (el.className || "").toString().indexOf(s) >= 0; }

  /* ---------- 1. 网格容器标记 ---------- */
  var SCENARIO_RE = /依据 FAQ 回答|只用人给的卖点|先结论再细节|保留数字与限制条件/;
  var PARAM_SET = { temperature: 1, top_p: 1, max_tokens: 1, stop: 1, seed: 1 };

  function markGrids() {
    var nav = document.querySelector("#root nav > div");
    if (nav && !nav.classList.contains("xn-tabs-grid")) nav.classList.add("xn-tabs-grid");
    var btns = [].slice.call(document.querySelectorAll("#root button")).filter(visible);
    btns.forEach(function (b) {
      var t = txt(b);
      if (SCENARIO_RE.test(t)) {
        var p = b.parentElement;
        if (p && !p.classList.contains("xn-scenario-grid")) p.classList.add("xn-scenario-grid");
      }
      if (PARAM_SET[t]) {
        var pp = b.parentElement;
        if (pp && !pp.classList.contains("xn-param-grid")) pp.classList.add("xn-param-grid");
      }
    });
  }

  /* ---------- 2. 当前态与 aria ---------- */
  function markStates() {
    var btns = [].slice.call(document.querySelectorAll("#root button")).filter(visible);
    btns.forEach(function (b) {
      var t = txt(b);
      if (SCENARIO_RE.test(t)) {
        var on = hasCls(b, "border-indigo-500");
        b.classList.toggle("xn-active", on);
        var v = on ? "true" : "false";
        if (b.getAttribute("aria-pressed") !== v) b.setAttribute("aria-pressed", v);
        return;
      }
      if (PARAM_SET[t]) {
        var pon = hasCls(b, "border-indigo-500");
        b.classList.toggle("xn-active", pon);
        var pv = pon ? "true" : "false";
        if (b.getAttribute("aria-pressed") !== pv) b.setAttribute("aria-pressed", pv);
        return;
      }
      if (/百万 Token/.test(t)) {
        var ton = hasCls(b, "bg-indigo-50");
        if (!b.classList.contains("xn-token")) b.classList.add("xn-token");
        var tv = ton ? "true" : "false";
        if (b.getAttribute("aria-pressed") !== tv) b.setAttribute("aria-pressed", tv);
      }
    });
  }

  /* ---------- 3. 复制按钮 ---------- */
  function markCopy() {
    var btns = [].slice.call(document.querySelectorAll("#root button")).filter(visible);
    btns.forEach(function (b) {
      var t = txt(b);
      if (/^(复制|已复制)/.test(t)) {
        if (!b.classList.contains("xn-copy")) b.classList.add("xn-copy");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "复制当前示例");
      }
    });
  }

  /* ---------- 4. 数字层级 ---------- */
  function markMoney() {
    var els = document.querySelectorAll("#root span, #root p, #root div");
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      if (e.children.length) continue;
      if (!/^¥/.test(txt(e))) continue;
      var cls = (e.className || "").toString();
      if (cls.indexOf("text-xl") >= 0 && !e.classList.contains("xn-price")) e.classList.add("xn-price");
      else if (cls.indexOf("text-base") >= 0 && cls.indexOf("tabular-nums") >= 0 && !e.classList.contains("xn-money")) e.classList.add("xn-money");
    }
  }

  /* ---------- 5. Token 计算器：语义 + 快捷值 ---------- */
  var TOKEN_RULES = [
    { re: /日均请求数/, name: "日均请求数（次/天）", vals: [500, 2000, 5000, 10000] },
    { re: /每次\s*Token\s*量/, name: "每次 Token 量（Token/次）", vals: [500, 1200, 4000, 8000] },
    { re: /^单价$/, name: "单价（元/百万 Token）", vals: [1, 10, 60] }
  ];
  function setVal(el, v) {
    var proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    proto.set.call(el, String(v));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }
  function syncChip(input, wrap, rule) {
    var num = parseFloat(input.value);
    [].slice.call(wrap.children).forEach(function (b, i) {
      b.classList.toggle("is-on", !isNaN(num) && num === rule.vals[i]);
    });
  }
  function fixTokenFields() {
    var fields = [].slice.call(document.querySelectorAll('#root [data-code-inspect-component="NumberField"]')).filter(visible);
    fields.forEach(function (field) {
      var lab = field.querySelector("label");
      var name = lab ? txt(lab).replace(/\s+/g, "") : "";
      var rule = null;
      for (var i = 0; i < TOKEN_RULES.length; i++) if (TOKEN_RULES[i].re.test(name)) { rule = TOKEN_RULES[i]; break; }
      if (!rule) return;
      var input = field.querySelector('input[type="number"]');
      if (!input) return;
      var cur = input.getAttribute("aria-label") || "";
      if (cur !== rule.name) input.setAttribute("aria-label", rule.name);
      if (field.__xnChips && field.__xnChips.isConnected) return;
      var wrap = document.createElement("div");
      wrap.className = "xn-chips";
      rule.vals.forEach(function (v) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "xn-chip";
        b.textContent = v;
        b.setAttribute("aria-label", rule.name + "设为 " + v);
        b.onclick = function () { setVal(input, v); syncChip(input, wrap, rule); };
        wrap.appendChild(b);
      });
      field.appendChild(wrap);
      field.__xnChips = wrap;
      input.addEventListener("input", function () { syncChip(input, wrap, rule); });
      syncChip(input, wrap, rule);
    });
  }
  function fixSearchInput() {
    var ins = [].slice.call(document.querySelectorAll("#root input")).filter(visible);
    ins.forEach(function (input) {
      if (input.getAttribute("aria-label")) return;
      if (input.type !== "text" && input.type !== "search") return;
      var box = input.closest("div");
      var lab = box && box.parentElement ? box.parentElement.querySelector("label") : null;
      var t = lab ? txt(lab) : "";
      if (/参数关键词/.test(t)) input.setAttribute("aria-label", "参数关键词（搜索参数说明）");
    });
  }

  /* ---------- 5. 切换工具浮钮 ---------- */
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
    b.classList.toggle("is-show", window.scrollY > 520);
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    markGrids();
    markStates();
    markCopy();
    markMoney();
    fixTokenFields();
    fixSearchInput();
    ensureQuickTop();
  }

  var scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(function () { scheduled = false; try { updateAll(); } catch (e) {} }, 200);
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
