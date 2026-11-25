/* 小凝工具站 · 蛋白质摄入与食物换算增强 xn-protein v1
 * 能力：2 个工具标签 44h/aria-current/具名；h2 去②；输入 52/21（体重/餐次/目标蛋白）；
 *       体重 50-80、餐次 2-5、目标蛋白 20-60 常用值；2 开关 50×28 role=switch/aria-checked/具名；
 *       计算并分配 52/17、复制/清空 46 具名；结果数字 32/800、公式 14.5、系数 chip 13、餐次卡 16/800、
 *       对照表 th13/td14.5、素食建议 14/13；食物换算 125 g 32/800、鸡蛋/牛奶 15；回到顶部。
 * 注入：legacy/ewz3cuixkx.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_PROTEIN__) return;
  window.__XN_PROTEIN__ = true;

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }
  function clean(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }
  function each(list, fn) {
    Array.prototype.forEach.call(list, fn);
  }

  /* ---------- 标题 ---------- */
  function cleanHeads() {
    each(document.querySelectorAll("#root h2"), function (h) {
      each(h.childNodes, function (n) {
        if (n.nodeType !== 3) return;
        var t = n.nodeValue || "";
        var c = t.replace(/^\s*[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "").replace(/^\s*工具\s*[A-Za-z0-9一二三四五六七八九十]+\s*/, "");
        if (c !== t) n.nodeValue = c;
      });
    });
  }

  /* ---------- 工具标签 ---------- */
  function markTabs() {
    var btns = Array.prototype.filter.call(document.querySelectorAll("#root nav button"), vis);
    if (!btns.length) return;
    btns.forEach(function (b, i) {
      if (!b.classList.contains("xn-pro-tab")) b.classList.add("xn-pro-tab");
      var on = /bg-emerald-500/.test(String(b.className || ""));
      if (on) {
        if (b.getAttribute("aria-current") !== "page") b.setAttribute("aria-current", "page");
      } else if (b.hasAttribute("aria-current")) {
        b.removeAttribute("aria-current");
      }
      var name = clean(b.textContent);
      var aria = "切换到：" + name + "（工具 " + (i + 1) + "）";
      if (name && b.getAttribute("aria-label") !== aria) b.setAttribute("aria-label", aria);
    });
  }

  /* ---------- 输入 + 常用值 ---------- */
  function nativeSet(el, v) {
    var desc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    if (desc && desc.set) desc.set.call(el, v);
    else el.value = v;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  var RULES = [
    { key: "体重", aria: "体重（kg）", quick: [50, 60, 70, 80] },
    { key: "每日餐次", aria: "每日餐次（餐）", quick: [2, 3, 4, 5] },
    { key: "目标蛋白质", aria: "目标蛋白质（g）", quick: [20, 30, 40, 60] }
  ];

  function markInputs() {
    each(document.querySelectorAll("#root input[type=number]"), function (input) {
      if (!vis(input)) return;
      var ariaNow = input.getAttribute("aria-label") || "";
      var rule = null;
      RULES.forEach(function (r) {
        if (!rule && ariaNow.indexOf(r.key) >= 0) rule = r;
      });
      if (!rule) return;
      if (input.getAttribute("aria-label") !== rule.aria) input.setAttribute("aria-label", rule.aria);
      var host = input.parentElement;
      if (!host) return;
      if (host.querySelector(":scope > .xn-pro-qrow")) return;
      var row = document.createElement("div");
      row.className = "xn-pro-qrow";
      rule.quick.forEach(function (q) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "xn-pro-q";
        b.textContent = String(q);
        b.setAttribute("aria-label", "填入 " + q + "（" + rule.aria + "）");
        b.addEventListener("click", function (e) {
          e.preventDefault();
          nativeSet(input, String(q));
          input.focus();
        });
        row.appendChild(b);
      });
      host.appendChild(row);
    });
  }

  /* ---------- 开关 ---------- */
  function markSwitches() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var cls = String(b.className || "");
      if (!/h-6/.test(cls) || !/w-11/.test(cls)) return;
      if (!b.classList.contains("xn-pro-switch")) b.classList.add("xn-pro-switch");
      var on = /bg-emerald-500/.test(cls);
      var val = on ? "true" : "false";
      if (b.getAttribute("role") !== "switch") b.setAttribute("role", "switch");
      if (b.getAttribute("aria-checked") !== val) b.setAttribute("aria-checked", val);
      var prev = b.previousElementSibling;
      var name = clean(prev && prev.textContent);
      if (name) {
        var aria = name + "（拨动开关）";
        if (b.getAttribute("aria-label") !== aria) b.setAttribute("aria-label", aria);
        if (!b.title) b.title = aria;
      }
    });
  }

  /* ---------- 按钮 ---------- */
  function markButtons() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (t === "计算并分配") {
        if (!b.classList.contains("xn-pro-go")) b.classList.add("xn-pro-go");
        var a1 = "计算并分配每日蛋白质";
        if (b.getAttribute("aria-label") !== a1) b.setAttribute("aria-label", a1);
        if (!b.title) b.title = a1;
      } else if (t === "复制分配方案") {
        if (!b.classList.contains("xn-pro-secondary")) b.classList.add("xn-pro-secondary");
        if (b.getAttribute("aria-label") !== "复制蛋白质分配方案") b.setAttribute("aria-label", "复制蛋白质分配方案");
      } else if (t === "清空") {
        if (!b.classList.contains("xn-pro-secondary")) b.classList.add("xn-pro-secondary");
        if (b.getAttribute("aria-label") !== "清空蛋白质计算结果") b.setAttribute("aria-label", "清空蛋白质计算结果");
      } else if (t === "复制换算结果") {
        if (!b.classList.contains("xn-pro-secondary")) b.classList.add("xn-pro-secondary");
        if (b.getAttribute("aria-label") !== "复制食物换算结果") b.setAttribute("aria-label", "复制食物换算结果");
      }
    });
  }

  /* ---------- 结果区 ---------- */
  function markResults() {
    // 大数字
    each(document.querySelectorAll("#root .text-3xl"), function (e) {
      if (!vis(e)) return;
      if (!e.classList.contains("xn-pro-big")) e.classList.add("xn-pro-big");
    });
    // 工具一：结果卡片组
    each(document.querySelectorAll("#root .mt-4.space-y-3 > div"), function (card) {
      if (!vis(card)) return;
      if (/复制|清空/.test(card.textContent)) return;
      if (!card.classList.contains("xn-pro-card")) card.classList.add("xn-pro-card");
      if (/素食/.test(card.textContent)) {
        if (!card.classList.contains("xn-pro-vegan")) card.classList.add("xn-pro-vegan");
      }
      if (card.querySelector("table")) {
        if (!card.classList.contains("xn-pro-result")) card.classList.add("xn-pro-result");
        var tb = card.querySelector("table");
        if (!tb.classList.contains("xn-pro-table")) tb.classList.add("xn-pro-table");
      }
      // 公式块
      each(card.querySelectorAll(".bg-gray-50"), function (box) {
        if (!/×|=/.test(box.textContent)) return;
        if (!box.classList.contains("xn-pro-formula")) box.classList.add("xn-pro-formula");
      });
      // 系数胶囊
      each(card.querySelectorAll(".flex.flex-wrap.gap-2"), function (row) {
        if (!/系数/.test(row.textContent)) return;
        if (!row.classList.contains("xn-pro-chips")) row.classList.add("xn-pro-chips");
      });
      // 每餐卡片
      each(card.querySelectorAll(".flex-1.rounded-md.bg-emerald-50"), function (m) {
        if (!m.classList.contains("xn-pro-meal")) m.classList.add("xn-pro-meal");
      });
    });
    // 工具二：输出卡
    each(document.querySelectorAll("#root .mt-3.rounded-xl"), function (box) {
      if (!vis(box)) return;
      if (!box.querySelector(".xn-pro-big")) return;
      if (!box.classList.contains("xn-pro-out")) box.classList.add("xn-pro-out");
    });
    // 免责
    each(document.querySelectorAll("#root p.mt-4.text-center.text-xs"), function (p) {
      if (!/参考值|遵医嘱/.test(p.textContent)) return;
      if (!p.classList.contains("xn-pro-note")) p.classList.add("xn-pro-note");
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "xn-pro-top";
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
      markSwitches();
      markButtons();
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
  window.setInterval(tick, 1000);
  document.addEventListener("click", function () { window.setTimeout(tick, 200); }, true);

  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    window.setTimeout(function () { pending = false; tick(); }, 120);
  }
  var mo = new MutationObserver(schedule);
  mo.observe(document.body, { childList: true, subtree: true, characterData: true });

  window.addEventListener("scroll", function () {
    if (!topBtn) return;
    if (window.scrollY > 620) topBtn.classList.add("is-on");
    else topBtn.classList.remove("is-on");
  }, { passive: true });
})();
