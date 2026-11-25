/* 小凝工具站 · 膳食纤维与蔬果份量增强 xn-fiber v1
 * 能力：2 个工具标签 37→44h/aria-current/具名；h2 去①② 18；输入 52/21 + 年龄/份数胶囊；
 *       2 开关 52×28 + role=switch/aria-checked/具名；计算份量 52/17、复制/清空 46 具名；
 *       目标 28/800、蔬果 22/800、明细 14.5、表 13/14、替换卡 14.5/15；计划页 12.3g 17/800；
 *       复制计划 46 具名；回到顶部。
 * 注入：legacy/pz7bebqyzx.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_FIBER__) return;
  window.__XN_FIBER__ = true;

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
      if (!b.classList.contains("xn-fb-tab")) b.classList.add("xn-fb-tab");
      var on = /bg-green-600/.test(String(b.className || ""));
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

  var FIELDS = [
    { key: "年龄", aria: "年龄（岁）", quick: [18, 30, 45, 60] },
    { key: "蔬果", aria: "每日蔬果份数（1份≈100g）", quick: [3, 5, 7] }
  ];

  function markInputs() {
    each(document.querySelectorAll("#root input[type=number]"), function (input) {
      if (!vis(input)) return;
      var ariaNow = input.getAttribute("aria-label") || "";
      var rule = null;
      FIELDS.forEach(function (r) {
        if (!rule && ariaNow.indexOf(r.key) >= 0) rule = r;
      });
      if (!rule) return;
      if (input.getAttribute("aria-label") !== rule.aria) input.setAttribute("aria-label", rule.aria);
      var host = input.parentElement;
      if (!host) return;
      if (host.querySelector(":scope > .xn-fb-qrow")) return;
      var row = document.createElement("div");
      row.className = "xn-fb-qrow";
      rule.quick.forEach(function (q) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "xn-fb-q";
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
      if (!/h-6/.test(cls) || !/w-12/.test(cls)) return;
      if (!b.classList.contains("xn-fb-switch")) b.classList.add("xn-fb-switch");
      var on = /bg-green-600/.test(cls);
      var val = on ? "true" : "false";
      if (b.getAttribute("role") !== "switch") b.setAttribute("role", "switch");
      if (b.getAttribute("aria-checked") !== val) b.setAttribute("aria-checked", val);
      var prev = b.previousElementSibling;
      var name = clean(prev && prev.textContent).replace(/（目标\+10%）$/, "");
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
      if (t === "计算份量") {
        if (!b.classList.contains("xn-fb-go")) b.classList.add("xn-fb-go");
        var a1 = "计算膳食纤维与蔬果份量";
        if (b.getAttribute("aria-label") !== a1) b.setAttribute("aria-label", a1);
        if (!b.title) b.title = a1;
      } else if (t === "复制份量清单") {
        if (!b.classList.contains("xn-fb-secondary")) b.classList.add("xn-fb-secondary");
        if (b.getAttribute("aria-label") !== "复制膳食纤维份量清单") b.setAttribute("aria-label", "复制膳食纤维份量清单");
      } else if (t === "清空") {
        if (!b.classList.contains("xn-fb-secondary")) b.classList.add("xn-fb-secondary");
        if (b.getAttribute("aria-label") !== "清空份量结果") b.setAttribute("aria-label", "清空份量结果");
      } else if (t === "复制计划") {
        if (!b.classList.contains("xn-fb-secondary")) b.classList.add("xn-fb-secondary");
        if (b.getAttribute("aria-label") !== "复制蔬果分配计划") b.setAttribute("aria-label", "复制蔬果分配计划");
      }
    });
  }

  /* ---------- 结果 / 计划 ---------- */
  function markBlocks() {
    // 纤维目标大数字
    each(document.querySelectorAll("#root .text-xl.font-bold.text-green-600"), function (e) {
      if (!vis(e)) return;
      if (!e.classList.contains("xn-fb-total")) e.classList.add("xn-fb-total");
      e.style.setProperty("font-weight", "800", "important");
    });
    // 目标明细行
    each(document.querySelectorAll("#root .space-y-1\\.5.text-sm"), function (box) {
      if (!vis(box)) return;
      if (!/基础值|每日膳食纤维目标/.test(box.textContent)) return;
      if (!box.classList.contains("xn-fb-rows")) box.classList.add("xn-fb-rows");
    });
    // 蔬菜 / 水果卡
    each(document.querySelectorAll("#root .bg-green-50.rounded-lg"), function (c) {
      if (!vis(c)) return;
      if (/蔬菜/.test(c.textContent) && !c.classList.contains("xn-fb-fiber")) {
        if (!c.classList.contains("xn-fb-veg")) c.classList.add("xn-fb-veg");
      }
      if (/12\.3g|膳食纤维/.test(c.textContent) && c.querySelector(".font-bold")) {
        if (!c.classList.contains("xn-fb-fiber")) c.classList.add("xn-fb-fiber");
      }
    });
    each(document.querySelectorAll("#root .bg-orange-50.rounded-lg"), function (c) {
      if (!vis(c)) return;
      if (!/水果/.test(c.textContent)) return;
      if (!c.classList.contains("xn-fb-fruit")) c.classList.add("xn-fb-fruit");
    });
    each(document.querySelectorAll(".xn-fb-veg .text-lg, .xn-fb-fruit .text-lg, .xn-fb-fiber .font-bold"), function (e) {
      if (!vis(e)) return;
      e.style.setProperty("font-weight", "800", "important");
    });
    // 提示类
    each(document.querySelectorAll("#root .bg-amber-50"), function (c) {
      if (!vis(c)) return;
      if (!c.classList.contains("xn-fb-note")) c.classList.add("xn-fb-note");
    });
    each(document.querySelectorAll("#root .text-xs.text-gray-400"), function (p) {
      if (!vis(p)) return;
      if (/1份|300g\/日主食估算/.test(p.textContent)) {
        if (!p.classList.contains("xn-fb-cap")) p.classList.add("xn-fb-cap");
      }
    });
    // 表格
    each(document.querySelectorAll("#root table"), function (tb) {
      if (!vis(tb)) return;
      if (!tb.classList.contains("xn-fb-table")) tb.classList.add("xn-fb-table");
    });
    // 替换卡
    each(document.querySelectorAll("#root .bg-gray-50.rounded-lg"), function (c) {
      if (!vis(c)) return;
      if (!/→|纤维\/天/.test(c.textContent)) return;
      if (!c.classList.contains("xn-fb-swap")) c.classList.add("xn-fb-swap");
    });
    // 蔬果计划汇总
    each(document.querySelectorAll("#root .text-sm.text-gray-600"), function (p) {
      if (!vis(p)) return;
      if (!/份/.test(p.textContent) || !/蔬菜/.test(p.textContent)) return;
      if (!p.classList.contains("xn-fb-plan-sum")) p.classList.add("xn-fb-plan-sum");
    });
    // 计划页提示
    each(document.querySelectorAll("#root .space-y-1.text-xs.text-gray-500"), function (box) {
      if (!vis(box)) return;
      if (!/提示/.test(box.textContent)) return;
      if (!box.classList.contains("xn-fb-tips")) box.classList.add("xn-fb-tips");
    });
    // 免责
    each(document.querySelectorAll("#root p.mt-4.text-center.text-xs"), function (p) {
      if (!/参考值|遵医嘱/.test(p.textContent)) return;
      if (!p.classList.contains("xn-fb-note")) p.classList.add("xn-fb-note");
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "xn-fb-top";
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
      markBlocks();
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
