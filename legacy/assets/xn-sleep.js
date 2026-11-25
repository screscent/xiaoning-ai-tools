/* 小凝工具站 · 睡眠债务与补觉计划增强 xn-sleep v1
 * 能力：2 个工具标签 44h/aria-pressed/具名；h2 去「①②」；
 *       数字输入 52/20 + 隐藏步进 + 常用值胶囊；下拉 48；开关 44 热区；
 *       计算/复制 50/44 具名；结果 34/26/20；风险卡琥珀；回到顶部。
 * 注入：legacy/qsixiqnhme.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_SLEEP__) return;
  window.__XN_SLEEP__ = true;

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }
  function clean(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }

  /* ---------- 标题去圈号 ---------- */
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
  var TABS = ["睡眠债务", "补觉安排"];
  function markTabs() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (TABS.indexOf(t) < 0) return;
      if (b.getBoundingClientRect().height > 48) return;
      if (!b.classList.contains("xn-sleep-tab")) b.classList.add("xn-sleep-tab");
      if (!b.hasAttribute("aria-pressed")) {
        var on = /text-white|bg-(indigo|violet|purple)/.test(String(b.className)) || /gradient/.test(getComputedStyle(b).backgroundImage);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      }
      var aria = "切换到" + t;
      if (b.getAttribute("aria-label") !== aria) b.setAttribute("aria-label", aria);
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
    { key: "睡眠债务", items: [
      { aria: "工作日睡眠时长（小时）", quick: [4, 5, 6, 7] },
      { aria: "周末睡眠时长（小时）", quick: [7, 8, 9] },
      { aria: "统计周数（周）", quick: [1, 2, 4] }
    ] },
    { key: "补觉", items: [
      { aria: "目标睡眠时长（小时）", quick: [7, 7.5, 8] },
      { aria: "已积累睡眠债务（小时）", quick: [3, 5, 8, 10] },
      { aria: "可补觉天数（天）", quick: [3, 7, 14] }
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
    row.className = "xn-sleep-qrow";
    (item.quick || []).forEach(function (q) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "xn-sleep-q";
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
      var mark = "xn-sleep-q-" + idx;
      if (host.querySelector(':scope > .xn-sleep-qrow[data-for="' + mark + '"]')) return;
      var old = host.querySelector(":scope > .xn-sleep-qrow");
      if (old) old.parentElement.removeChild(old);
      var row = buildQuick(input, item);
      row.setAttribute("data-for", mark);
      if (input.nextSibling) host.insertBefore(row, input.nextSibling);
      else host.appendChild(row);
    });
  }

  /* ---------- 主操作 / 次要 ---------- */
  function markButtons() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (t === "计算睡眠债务") {
        if (!b.classList.contains("xn-sleep-primary")) b.classList.add("xn-sleep-primary");
        if (b.getAttribute("aria-label") !== "计算睡眠债务") b.setAttribute("aria-label", "计算睡眠债务");
      } else if (t === "复制安排") {
        if (!b.classList.contains("xn-sleep-secondary")) b.classList.add("xn-sleep-secondary");
        if (b.getAttribute("aria-label") !== "复制补觉安排") b.setAttribute("aria-label", "复制补觉安排");
      }
    });
  }

  /* ---------- 风险卡 ---------- */
  function markRisk() {
    Array.prototype.forEach.call(document.querySelectorAll("#root .rounded-xl.border"), function (box) {
      if (!vis(box)) return;
      if (/风险提示/.test(box.textContent) && !box.classList.contains("xn-sleep-risk")) {
        box.classList.add("xn-sleep-risk");
      }
    });
  }

  /* ---------- 开关语义 ---------- */
  function markSwitch() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var al = b.getAttribute("aria-label") || "";
      if (!/允许|开启|关闭|午睡/.test(al)) return;
      if (b.getBoundingClientRect().height > 42) return;
      if (!b.hasAttribute("role")) b.setAttribute("role", "switch");
      if (!b.hasAttribute("aria-checked")) {
        var on = /translate-x-/.test(b.innerHTML) || /bg-(indigo|blue|green|emerald)-/.test(String(b.className));
        b.setAttribute("aria-checked", on ? "true" : "false");
      }
      if (!b.classList.contains("xn-sleep-switch")) b.classList.add("xn-sleep-switch");
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "xn-sleep-top";
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
      markButtons();
      markSwitch();
      markRisk();
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
