/* 小凝工具站 · 停车费用与可停时长增强 xn-park v1
 * 能力：2 个工具标签 44h/aria-pressed/具名；h2 去 ①② 圈号；
 *       时间与数字输入 52 + 语义 aria + 常用值胶囊（含「现在 / +1h / +2h / +3h」）；
 *       开关 44 热区；计算/反算 50 具名；合计金额 26/800；回到顶部。
 * 注入：legacy/npcsur2aq6.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_PARK__) return;
  window.__XN_PARK__ = true;

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  function clean(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }

  /* ---------- 标题：去圈号 ---------- */
  function stripCircle() {
    Array.prototype.forEach.call(document.querySelectorAll("#root h2"), function (h) {
      Array.prototype.forEach.call(h.childNodes, function (n) {
        if (n.nodeType !== 3) return;
        var t = n.nodeValue || "";
        var c = t.replace(/^\s*[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "").replace(/^\s*工具[A-Za-z]\s*/, "");
        if (c !== t) n.nodeValue = c;
      });
      Array.prototype.forEach.call(h.querySelectorAll("*"), function (el) {
        if (el.children.length) return;
        var t = el.textContent || "";
        var c = t.replace(/^\s*[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "").replace(/^\s*工具[A-Za-z]\s*/, "");
        if (c && c !== t) el.textContent = c;
      });
    });
  }

  /* ---------- 标签 ---------- */
  var TABS = ["停车费用", "可停时长"];
  function markTabs() {
    var btns = Array.prototype.filter.call(document.querySelectorAll("#root button"), function (b) {
      return vis(b) && TABS.indexOf(clean(b.textContent)) >= 0;
    });
    btns.forEach(function (b) {
      if (!b.classList.contains("xn-pk-tab")) b.classList.add("xn-pk-tab");
      if (!b.hasAttribute("aria-pressed")) {
        var on = /text-white|bg-(blue|indigo|sky|gradient)/.test(String(b.className)) || /gradient/.test(getComputedStyle(b).backgroundImage);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      }
      var name = clean(b.textContent);
      if (b.getAttribute("aria-label") !== "切换到" + name) b.setAttribute("aria-label", "切换到" + name);
    });
  }

  function currentTitle() {
    var h2 = Array.prototype.find.call(document.querySelectorAll("#root h2"), function (h) {
      return vis(h) && !/使用说明/.test(h.textContent);
    });
    return h2 ? clean(h2.textContent) : "";
  }

  /* ---------- 输入语义与常用值 ---------- */
  var FIELDS = [
    { key: "停车费用", items: [
      { aria: "入场时间", time: true, quick: ["now"] },
      { aria: "出场时间", time: true, from: 0, quick: [1, 2, 3] },
      { aria: "首小时费用（元）", quick: [5, 10, 15, 20] },
      { aria: "后续每小时（元）", quick: [2, 3, 5, 8] },
      { aria: "免费停车分钟", quick: [0, 15, 30, 60] }
    ] },
    { key: "可停时长", items: [
      { aria: "停车预算（元）", quick: [10, 20, 30, 50] },
      { aria: "免费停车分钟", quick: [0, 15, 30] },
      { aria: "首小时单价（元）", quick: [5, 10, 15] },
      { aria: "之后每小时单价（元）", quick: [2, 3, 5, 8] }
    ] }
  ];

  function fieldsFor(title) {
    var out = null;
    FIELDS.forEach(function (m) {
      if (!out && title.indexOf(m.key) >= 0) out = m.items;
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

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function readTime(inp) {
    var m = /^(\d{1,2}):(\d{2})$/.exec(inp.value || "");
    if (!m) return null;
    return { h: parseInt(m[1], 10), m: parseInt(m[2], 10) };
  }

  function buildQuick(input, item, allInputs) {
    var row = document.createElement("div");
    row.className = "xn-pk-qrow";
    (item.quick || []).forEach(function (q) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "xn-pk-q";
      var label, val;
      if (q === "now") {
        var d = new Date();
        label = "现在（" + pad(d.getHours()) + ":" + pad(d.getMinutes()) + "）";
        val = pad(d.getHours()) + ":" + pad(d.getMinutes());
      } else if (item.time && typeof item.from === "number") {
        label = "+" + q + " 小时";
        val = "pending";
      } else {
        label = String(q);
        val = String(q);
      }
      if (!val) return;
      b.textContent = label;
      b.setAttribute("aria-label", "填入" + label + "（" + item.aria + "）");
      b.addEventListener("click", function (e) {
        e.preventDefault();
        var v = val;
        if (v === "pending") {
          // 点击时重新取入场时间（React 重渲染会替换节点，闭包里的旧节点值不可信）
          var live = Array.prototype.filter.call(document.querySelectorAll("#root input"), vis)[item.from];
          var base = live ? readTime(live) : null;
          if (!base) return;
          v = pad((base.h + q) % 24) + ":" + pad(base.m);
        }
        nativeSet(input, v);
        input.focus();
      });
      row.appendChild(b);
    });
    return row;
  }

  function markInputs() {
    var title = currentTitle();
    var items = fieldsFor(title);
    if (!items) return;
    var inputs = Array.prototype.filter.call(document.querySelectorAll("#root input"), vis);
    inputs.forEach(function (input, idx) {
      var item = items[idx];
      if (!item) return;
      if (input.getAttribute("aria-label") !== item.aria) input.setAttribute("aria-label", item.aria);
      if (!input.classList.contains("xn-pk-input")) input.classList.add("xn-pk-input");
      var host = input.parentElement;
      if (!host) return;
      var mark = "xn-pk-q-" + idx;
      if (host.querySelector(':scope > .xn-pk-qrow[data-for="' + mark + '"]')) return;
      var old = host.querySelector(":scope > .xn-pk-qrow");
      if (old) old.parentElement.removeChild(old);
      var row = buildQuick(input, item, inputs);
      row.setAttribute("data-for", mark);
      if (input.nextSibling) host.insertBefore(row, input.nextSibling);
      else host.appendChild(row);
    });
  }

  /* ---------- 开关热区保留 aria-checked ---------- */
  function markSwitch() {
    Array.prototype.forEach.call(document.querySelectorAll('#root [role="switch"], #root button[aria-checked], #root input[type="checkbox"]'), function (el) {
      if (!vis(el)) return;
      if (el.tagName === "INPUT") return;
      if (!el.hasAttribute("aria-checked")) return;
      if (!el.classList.contains("xn-pk-switch")) el.classList.add("xn-pk-switch");
    });
  }

  /* ---------- 主操作 ---------- */
  var PRIMARY = { "计算": "计算停车费用", "反算": "反算可停时长" };
  function markPrimary() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (!PRIMARY[t]) return;
      if (!b.classList.contains("xn-pk-primary")) b.classList.add("xn-pk-primary");
      var aria = PRIMARY[t];
      if (b.getAttribute("aria-label") !== aria) b.setAttribute("aria-label", aria);
      if (!b.title) b.title = aria;
    });
  }

  /* ---------- 合计金额 ---------- */
  function markTotal() {
    Array.prototype.forEach.call(document.querySelectorAll("#root .border-blue-500"), function (box) {
      var walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT, null);
      var n;
      while ((n = walker.nextNode())) {
        if (!/\d/.test(n.nodeValue || "")) continue;
        var el = n.parentElement;
        if (el && !el.classList.contains("xn-pk-total")) el.classList.add("xn-pk-total");
      }
    });
  }

  /* ---------- 结果主值（①② 时长段） ---------- */
  function markMetrics() {
    Array.prototype.forEach.call(document.querySelectorAll("#root .rounded-xl"), function (box) {
      var t = clean(box.textContent);
      if (!/时长/.test(t)) return;
      var walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT, null);
      var n;
      while ((n = walker.nextNode())) {
        var v = n.nodeValue || "";
        if (!/\d/.test(v) || !/小时|分钟/.test(v)) continue;
        var el = n.parentElement;
        if (el && !el.classList.contains("xn-pk-metric")) el.classList.add("xn-pk-metric");
      }
    });
  }

  /* ---------- 次要操作：复制结果 / 清空 ---------- */
  function markSecondary() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (t !== "复制结果" && t !== "清空") return;
      if (!b.classList.contains("xn-pk-secondary")) b.classList.add("xn-pk-secondary");
      var aria = t === "清空" ? "清空全部输入" : "复制结果";
      if (b.getAttribute("aria-label") !== aria) b.setAttribute("aria-label", aria);
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "xn-pk-top";
    topBtn.setAttribute("aria-label", "回到顶部");
    topBtn.title = "回到顶部";
    topBtn.textContent = "↑";
    topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    document.body.appendChild(topBtn);
  }

  function tick() {
    try {
      stripCircle();
      markTabs();
      markInputs();
      markSwitch();
      markPrimary();
      markTotal();
      markMetrics();
      markSecondary();
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
