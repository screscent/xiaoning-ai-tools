/* 小凝工具站 · 咖啡因代谢与残留曲线增强 xn-cof v1
 * 能力：2 个工具标签 44h/aria-pressed；输入 52/20 + 隐藏步进 + 常用值胶囊；
 *       下拉 48；+/- 44；计算 50 具名；复制/清空 44 具名；结果三档放大；回到顶部。
 * 注入：legacy/vfmbddlsqf.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_COF__) return;
  window.__XN_COF__ = true;

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }
  function clean(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }

  /* ---------- 标签 ---------- */
  var TABS = ["摄入计算", "残留曲线"];
  function markTabs() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (TABS.indexOf(t) < 0) return;
      if (b.getBoundingClientRect().height > 48) return;
      if (!b.classList.contains("xn-cof-tab")) b.classList.add("xn-cof-tab");
      var cls = String(b.className);
      var on = /text-\[#8E562F\]|border-\[#A2643A\]|text-\[#7C3A0D\]/.test(cls);
      var want = on ? "true" : "false";
      if (b.getAttribute("aria-pressed") !== want) b.setAttribute("aria-pressed", want);
      var aria = "切换到" + t;
      if (b.getAttribute("aria-label") !== aria) b.setAttribute("aria-label", aria);
    });
  }

  /* ---------- 当前工具 ---------- */
  function currentTool() {
    var tab = Array.prototype.find.call(document.querySelectorAll(".xn-cof-tab"), function (b) {
      return b.getAttribute("aria-pressed") === "true";
    });
    if (tab) return clean(tab.textContent);
    var h2 = Array.prototype.find.call(document.querySelectorAll("#root h2"), vis);
    return h2 ? clean(h2.textContent) : "";
  }

  /* ---------- 输入 ---------- */
  var FIELDS = [
    { key: "摄入计算", items: [
      { aria: "摄入量（毫克）", quick: [80, 100, 150, 200, 300] },
      { aria: "杯数", quick: [] }
    ] },
    { key: "残留曲线", items: [
      { aria: "摄入毫克", quick: [100, 200, 300] },
      { aria: "经过小时数", quick: [1, 2, 4, 6, 8] }
    ] }
  ];

  function fieldsFor(tool) {
    var out = null;
    FIELDS.forEach(function (m) {
      if (!out && tool.indexOf(m.key) >= 0) out = m.items;
    });
    return out;
  }

  function nativeSet(el, v) {
    var desc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    if (desc && desc.set) desc.set.call(el, v);
    else el.value = v;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function buildQuick(input, item) {
    if (!item.quick || !item.quick.length) return null;
    var row = document.createElement("div");
    row.className = "xn-cof-qrow";
    (item.quick || []).forEach(function (q) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "xn-cof-q";
      b.textContent = String(q);
      b.setAttribute("aria-label", "填入 " + q + "（" + item.aria + "）");
      b.addEventListener("click", function (e) {
        e.preventDefault();
        nativeSet(input, String(q));
        input.focus();
      });
      row.appendChild(b);
    });
    return row;
  }

  function markInputs() {
    var items = fieldsFor(currentTool());
    if (!items) return;
    var inputs = Array.prototype.filter.call(document.querySelectorAll("#root input"), vis);
    inputs.forEach(function (input, idx) {
      var item = items[idx];
      if (!item) return;
      if (input.getAttribute("aria-label") !== item.aria) input.setAttribute("aria-label", item.aria);
      var host = input.parentElement;
      if (!host) return;
      var mark = "xn-cof-q-" + idx;
      if (host.querySelector(':scope > .xn-cof-qrow[data-for="' + mark + '"]')) return;
      var old = host.querySelector(":scope > .xn-cof-qrow");
      if (old) old.parentElement.removeChild(old);
      var row = buildQuick(input, item);
      if (!row) return;
      row.setAttribute("data-for", mark);
      if (input.nextSibling) host.insertBefore(row, input.nextSibling);
      else host.appendChild(row);
    });
  }

  /* ---------- 按钮 ---------- */
  function markButtons() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      var al = b.getAttribute("aria-label") || "";
      if (t === "计算代谢结果") {
        if (!b.classList.contains("xn-cof-primary")) b.classList.add("xn-cof-primary");
        if (b.getAttribute("aria-label") !== "计算咖啡因代谢结果") b.setAttribute("aria-label", "计算咖啡因代谢结果");
        return;
      }
      if (t === "复制结果" || t === "清空") {
        if (!b.classList.contains("xn-cof-secondary")) b.classList.add("xn-cof-secondary");
        var aria = t === "清空" ? "清空全部输入" : "复制咖啡因计算结果";
        if (b.getAttribute("aria-label") !== aria) b.setAttribute("aria-label", aria);
        return;
      }
      if (/减少杯数|增加杯数/.test(al)) {
        if (!b.classList.contains("xn-cof-step")) b.classList.add("xn-cof-step");
      }
    });
  }

  /* ---------- 结果数字分级 ---------- */
  function markVals() {
    var all = Array.prototype.slice.call(document.querySelectorAll("#root *"));
    all.forEach(function (el) {
      var txt = el.textContent || "";
      if (!/\d/.test(txt)) return;
      if (txt.replace(/\s+/g, "").length > 14) return;
      if (el.children.length > 2) return;
      if (el.closest(".xn-cof-qrow") || el.closest("button") || el.closest("select") || el.closest("label")) return;
      var fs = parseFloat(getComputedStyle(el).fontSize) || 0;
      var cls = fs >= 24 && fs < 34 ? "xn-cof-hero" : (fs >= 20 && fs < 24 ? "xn-cof-mid" : (fs >= 17 && fs < 20 ? "xn-cof-val" : ""));
      if (!cls) return;
      if (el.classList.contains(cls)) return;
      if (el.querySelector("." + cls)) return;
      el.classList.add(cls);
    });
  }

  /* ---------- 就寝时间卡 ---------- */
  function markSleep() {
    Array.prototype.forEach.call(document.querySelectorAll("#root .rounded-xl.border, #root .rounded-2xl.border"), function (box) {
      if (!vis(box)) return;
      if (!/建议就寝/.test(box.textContent)) return;
      if (!box.classList.contains("xn-cof-sleep")) box.classList.add("xn-cof-sleep");
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "xn-cof-top";
    topBtn.setAttribute("aria-label", "回到顶部");
    topBtn.title = "回到顶部";
    topBtn.textContent = "↑";
    topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    document.body.appendChild(topBtn);
  }

  function tick() {
    try {
      markTabs();
      markInputs();
      markButtons();
      markVals();
      markSleep();
      ensureTop();
    } catch (e) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tick, { once: true });
  } else {
    tick();
  }
  window.setTimeout(tick, 900);
  window.setTimeout(tick, 2200);
  window.addEventListener("hashchange", tick);
  document.addEventListener("click", function () { window.setTimeout(tick, 200); }, true);

  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    window.setTimeout(function () { pending = false; tick(); }, 120);
  }
  var mo = new MutationObserver(schedule);
  mo.observe(document.body, { childList: true, subtree: true, characterData: true });
  window.setInterval(tick, 1000);

  window.addEventListener("scroll", function () {
    if (!topBtn) return;
    if (window.scrollY > 620) topBtn.classList.add("is-on");
    else topBtn.classList.remove("is-on");
  }, { passive: true });
})();
