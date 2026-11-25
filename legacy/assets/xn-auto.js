/* 小凝工具站 · 汽车过户与上牌增强 xn-auto v1
 * 能力：6 个工具标签 44h/aria-current/具名；h2 去「工具A~F」；输入 52/20 +
 *       语义 aria + 常用值胶囊；交易对象等分段 44 + aria-pressed；开始计算 50 具名；
 *       结果值 17/700、合计 22/800；回到顶部。
 * 注入：legacy/npbgbd2aq6.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_AUTO__) return;
  window.__XN_AUTO__ = true;

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  function clean(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }

  /* ---------- 标题去占位 ---------- */
  function cleanHeads() {
    Array.prototype.forEach.call(document.querySelectorAll("#root h2"), function (h) {
      Array.prototype.forEach.call(h.childNodes, function (n) {
        if (n.nodeType !== 3) return;
        var t = n.nodeValue || "";
        var c = t.replace(/^\s*工具[A-Za-z]\s*/, "").replace(/^\s*[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "");
        if (c !== t) n.nodeValue = c;
      });
      Array.prototype.forEach.call(h.querySelectorAll("*"), function (el) {
        if (el.children.length) return;
        var t = el.textContent || "";
        var c = t.replace(/^\s*工具[A-Za-z]\s*/, "").replace(/^\s*[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "");
        if (c && c !== t) el.textContent = c;
      });
    });
  }

  /* ---------- 标签 ---------- */
  function markTabs() {
    var links = Array.prototype.filter.call(document.querySelectorAll("#root nav a"), function (a) {
      return vis(a) && a.getAttribute("href") && a.getAttribute("href").indexOf("#/") === 0;
    });
    if (!links.length) return;
    var hash = location.hash || "";
    var active = null;
    links.forEach(function (a) {
      if (!a.classList.contains("xn-auto-tab")) a.classList.add("xn-auto-tab");
      if (hash && a.getAttribute("href") === hash) active = a;
    });
    if (!active && !hash) active = links[0];
    links.forEach(function (a) {
      if (a === active) {
        if (a.getAttribute("aria-current") !== "page") a.setAttribute("aria-current", "page");
      } else if (a.hasAttribute("aria-current")) {
        a.removeAttribute("aria-current");
      }
      var name = clean(a.textContent);
      if (name && a.getAttribute("aria-label") !== name) a.setAttribute("aria-label", name);
    });
  }

  function currentTitle() {
    var h2 = Array.prototype.find.call(document.querySelectorAll("#root h2"), function (h) {
      return vis(h) && !/使用说明/.test(h.textContent);
    });
    return h2 ? clean(h2.textContent) : "";
  }

  /* ---------- 输入 ---------- */
  var FIELDS = [
    { key: "过户税费", items: [
      { aria: "车辆成交价（万元）", quick: [5, 10, 15, 20, 30] },
      { aria: "排量（升）", quick: [1.0, 1.6, 2.0, 2.5] },
      { aria: "车龄（年）", quick: [1, 3, 5, 8, 10] }
    ] },
    { key: "上牌与保险", items: [
      { aria: "新车价（万元）", quick: [10, 15, 20, 30] },
      { aria: "排量（升）", quick: [1.6, 2.0] }
    ] },
    { key: "保险过户退保", items: [
      { aria: "车辆现价（万元）", quick: [10, 15, 20] },
      { aria: "保险剩余月数（月）", quick: [3, 6, 9, 12] }
    ] },
    { key: "车贷与月供", items: [
      { aria: "车辆价格（万元）", quick: [10, 15, 20, 30] },
      { aria: "首付比例（%）", quick: [20, 30, 40] },
      { aria: "贷款期限（年）", quick: [3, 5] },
      { aria: "年利率（%）", quick: [3.5, 4.5, 5.5] }
    ] },
    { key: "二手车验车", items: [
      { aria: "行驶里程（万公里）", quick: [1, 3, 5, 8, 10] }
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

  function buildQuick(input, item) {
    var row = document.createElement("div");
    row.className = "xn-auto-qrow";
    (item.quick || []).forEach(function (q) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "xn-auto-q";
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
    var items = fieldsFor(currentTitle());
    if (!items) return;
    var inputs = Array.prototype.filter.call(document.querySelectorAll("#root input"), vis);
    inputs.forEach(function (input, idx) {
      var item = items[idx];
      if (!item) return;
      if (input.getAttribute("aria-label") !== item.aria) input.setAttribute("aria-label", item.aria);
      var host = input.parentElement;
      if (!host) return;
      var mark = "xn-auto-q-" + idx;
      if (host.querySelector(':scope > .xn-auto-qrow[data-for="' + mark + '"]')) return;
      var old = host.querySelector(":scope > .xn-auto-qrow");
      if (old) old.parentElement.removeChild(old);
      var row = buildQuick(input, item);
      row.setAttribute("data-for", mark);
      if (input.nextSibling) host.insertBefore(row, input.nextSibling);
      else host.appendChild(row);
    });
  }

  /* ---------- 分段按钮 ---------- */
  function markModes() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      if (b.getBoundingClientRect().height > 46) return;
      var txt = clean(b.textContent);
      if (/开始计算|复制|清空|重置|返回|示例/.test(txt)) return;
      var cls = String(b.className);
      if (!/rounded/.test(cls)) return;
      if (!b.classList.contains("xn-auto-mode")) b.classList.add("xn-auto-mode");
      if (!b.hasAttribute("aria-pressed")) {
        var on = /bg-white/.test(cls) && /(text-blue|font-semibold|shadow)/.test(cls);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      }
    });
  }

  /* ---------- 次要操作：复制结果 ---------- */
  function markSecondary() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (t !== "复制结果") return;
      if (!b.classList.contains("xn-auto-secondary")) b.classList.add("xn-auto-secondary");
      if (b.getAttribute("aria-label") !== "复制估算结果") b.setAttribute("aria-label", "复制估算结果");
    });
  }

  /* ---------- 主操作 ---------- */
  function markPrimary() {
    var title = currentTitle();
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      if (clean(b.textContent) !== "开始计算") return;
      if (!b.classList.contains("xn-auto-primary")) b.classList.add("xn-auto-primary");
      var aria = "开始计算" + (title || "");
      if (b.getAttribute("aria-label") !== aria) b.setAttribute("aria-label", aria);
      if (!b.title) b.title = aria;
    });
  }

  /* ---------- 结果数字 ---------- */
  function markResults() {
    Array.prototype.forEach.call(document.querySelectorAll("#root p"), function (p) {
      if (p.children.length) return;
      var t = clean(p.textContent);
      if (!t || t.length > 26) return;
      if (!/[\d,.]+\s*(元|万元|%|公里|年|个月|大类|项)/.test(t)) return;
      if (!p.classList.contains("xn-auto-val")) p.classList.add("xn-auto-val");
    });
    Array.prototype.forEach.call(document.querySelectorAll("#root *"), function (el) {
      if (el.children.length) return;
      var t = clean(el.textContent);
      if (!/合计|总计|总费用|总价/.test(t) || t.length > 12) return;
      var box = el.parentElement;
      for (var k = 0; k < 3 && box; k++) {
        if (/\d/.test(box.textContent || "")) break;
        box = box.parentElement;
      }
      if (!box) return;
      Array.prototype.forEach.call(box.querySelectorAll("p, span, strong"), function (v) {
        if (v.children.length) return;
        if (!/\d/.test(v.textContent)) return;
        if (v === el) return;
        if (!v.classList.contains("xn-auto-total")) v.classList.add("xn-auto-total");
      });
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "xn-auto-top";
    topBtn.setAttribute("aria-label", "回到顶部");
    topBtn.title = "回到顶部";
    topBtn.textContent = "↑";
    topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    document.body.appendChild(topBtn);
  }

  function tick() {
    try {
      cleanHeads();
      markTabs();
      markInputs();
      markModes();
      markPrimary();
      markSecondary();
      markResults();
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
