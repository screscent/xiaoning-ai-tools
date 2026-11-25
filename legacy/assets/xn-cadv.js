/* 小凝工具站 · 钙与维生素 D 合集增强 xn-cadv v1
 * 能力：2 工具标签 46h/aria-current/具名；h2 去②；年龄/奶豆/日照 52/22 + 常用值预设；
 *       性别/肤色 48；晒太阳/绝经/防晒开关 48 + role=switch/aria-checked/具名；
 *       计算 52/17、复制/清空 46 具名；合计 648 34/800、达标率 81% 26/800、进度条 12；
 *       表格 14/38 行、缺口/建议框 14、注释 13.5；回到顶部。
 * 注入：legacy/dzfvf2slwd.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_CADV__) return;
  window.__XN_CADV__ = true;

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }
  function clean(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }
  function each(list, fn) {
    Array.prototype.forEach.call(list, fn);
  }
  function add(el, cls) {
    if (el && !el.classList.contains(cls)) el.classList.add(cls);
  }

  function cleanHeads() {
    each(document.querySelectorAll("#root h2"), function (h) {
      each(h.childNodes, function (n) {
        if (n.nodeType !== 3) return;
        var t = n.nodeValue || "";
        var c = t.replace(/^\s*[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "");
        if (c !== t) n.nodeValue = c;
      });
    });
  }

  function markTabs() {
    var btns = Array.prototype.filter.call(document.querySelectorAll("#root nav button"), vis);
    btns.forEach(function (b, i) {
      add(b, "xn-cal-tab");
      var on = /bg-teal-600/.test(String(b.className || ""));
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

  /* ---------- 输入 ---------- */
  function nativeSet(el, v) {
    var desc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    if (desc && desc.set) desc.set.call(el, v);
    else el.value = v;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  var RULES = [
    { key: "年龄", aria: "年龄（岁）", quick: [18, 30, 45, 60, 70] },
    { key: "奶制品", aria: "每日奶制品份数（1 份 = 250ml 牛奶）", quick: [0, 1, 2, 3] },
    { key: "豆制品", aria: "每日豆制品份数（1 份 = 100g 北豆腐）", quick: [0, 1, 2] },
    { key: "日照", aria: "每日日照时长（分钟）", quick: [10, 20, 30, 45] }
  ];

  function markInputs() {
    each(document.querySelectorAll("#root input"), function (input) {
      if (!vis(input)) return;
      if (input.type !== "number") return;
      var ariaNow = input.getAttribute("aria-label") || "";
      var rule = null;
      RULES.forEach(function (r) {
        if (!rule && ariaNow.indexOf(r.key) >= 0) rule = r;
      });
      if (!rule) return;
      if (input.getAttribute("aria-label") !== rule.aria) input.setAttribute("aria-label", rule.aria);
      var host = input.parentElement;
      if (!host) return;
      if (host.querySelector(":scope > .xn-cal-qrow")) return;
      var row = document.createElement("div");
      row.className = "xn-cal-qrow";
      rule.quick.forEach(function (q) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "xn-cal-q";
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

  /* ---------- 开关行 ---------- */
  function markSwitches() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var cls = String(b.className || "");
      if (cls.indexOf("justify-between") < 0) return;
      var t = clean(b.textContent);
      if (!/^[✓×]/.test(t)) return;
      if (b.getBoundingClientRect().height > 70) return;
      add(b, "xn-cal-switch");
      var on = /^✓/.test(t) || /bg-teal-50/.test(cls);
      var val = on ? "true" : "false";
      if (b.getAttribute("role") !== "switch") b.setAttribute("role", "switch");
      if (b.getAttribute("aria-checked") !== val) b.setAttribute("aria-checked", val);
      var labelEl = b.parentElement && b.parentElement.querySelector("span");
      var name = clean(labelEl && labelEl.textContent);
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
      if (t === "计算摄入") {
        add(b, "xn-cal-go");
        if (b.getAttribute("aria-label") !== "计算每日钙摄入与缺口建议") b.setAttribute("aria-label", "计算每日钙摄入与缺口建议");
      } else if (t === "计算建议") {
        add(b, "xn-cal-go");
        if (b.getAttribute("aria-label") !== "计算维生素 D 补充建议") b.setAttribute("aria-label", "计算维生素 D 补充建议");
      } else if (t === "复制结果") {
        add(b, "xn-cal-sec");
        if (b.getAttribute("aria-label") !== "复制钙摄入结果") b.setAttribute("aria-label", "复制钙摄入结果");
      } else if (t === "清空") {
        add(b, "xn-cal-sec");
        if (b.getAttribute("aria-label") !== "清空全部输入") b.setAttribute("aria-label", "清空全部输入");
      } else if (t === "复制建议") {
        add(b, "xn-cal-sec");
        if (b.getAttribute("aria-label") !== "复制维生素 D 补充建议") b.setAttribute("aria-label", "复制维生素 D 补充建议");
      }
    });
  }

  /* ---------- 结果区 ---------- */
  function markBlocks() {
    // 使用说明
    each(document.querySelectorAll("#root details"), function (d) {
      if (!vis(d)) return;
      if (!/使用说明/.test(d.textContent)) return;
      add(d, "xn-cal-sum");
    });
    // 卡片标题 + 数字徽标
    each(document.querySelectorAll("#root div"), function (d) {
      if (!vis(d)) return;
      var cls = String(d.className || "");
      if (cls.indexOf("gap-1.5") < 0 || cls.indexOf("font-semibold") < 0) return;
      if (d.getBoundingClientRect().height > 40) return;
      add(d, "xn-cal-ch");
      each(d.querySelectorAll("span"), function (s) {
        var sc = String(s.className || "");
        if (sc.indexOf("rounded-full") >= 0 && sc.indexOf("h-5") >= 0) add(s, "xn-cal-badge");
      });
    });
    // h2
    each(document.querySelectorAll("#root h2"), function (h) {
      if (vis(h)) add(h, "xn-cal-h2");
    });
    // 明细行
    each(document.querySelectorAll("#root div"), function (d) {
      if (!vis(d)) return;
      var cls = String(d.className || "");
      if (cls.indexOf("flex-row") >= 0 && cls.indexOf("py-1.5") >= 0) add(d, "xn-cal-row");
    });
    // 合计
    each(document.querySelectorAll("#root div"), function (d) {
      if (!vis(d)) return;
      var cls = String(d.className || "");
      if (cls.indexOf("items-baseline") < 0) return;
      if (!/^合计/.test(clean(d.textContent))) return;
      add(d, "xn-cal-totalrow");
      var kids = d.children;
      var last = kids[kids.length - 1];
      if (last) add(last, "xn-cal-totalnum");
    });
    // 达标率
    each(document.querySelectorAll("#root span"), function (s) {
      if (!vis(s)) return;
      if (!/^\d+%$/.test(clean(s.textContent))) return;
      if (String(s.className || "").indexOf("text-amber-600") < 0) return;
      add(s, "xn-cal-rate");
      if (s.parentElement) add(s.parentElement, "xn-cal-raterow");
    });
    // 进度条
    each(document.querySelectorAll("#root div"), function (d) {
      if (!vis(d)) return;
      var cls = String(d.className || "");
      if (cls.indexOf("bg-amber-400") < 0) return;
      add(d, "xn-cal-fill");
      if (d.parentElement) add(d.parentElement, "xn-cal-prog");
    });
    // 缺口 / 建议框
    each(document.querySelectorAll("#root div"), function (d) {
      if (!vis(d)) return;
      var cls = String(d.className || "");
      if (cls.indexOf("rounded-lg") < 0) return;
      if (cls.indexOf("bg-amber-50") >= 0) add(d, "xn-cal-warn");
      else if (cls.indexOf("bg-teal-50") >= 0) add(d, "xn-cal-ok");
    });
    // 正文
    each(document.querySelectorAll("#root div"), function (d) {
      var cls = String(d.className || "");
      if (cls.indexOf("text-[13px]") < 0) return;
      add(d, "xn-cal-body");
    });
    // 表格
    each(document.querySelectorAll("#root table"), function (t) {
      if (vis(t)) add(t, "xn-cal-table");
    });
    // 注释
    each(document.querySelectorAll("#root p, #root div"), function (e) {
      if (!vis(e) || e.children.length > 0) return;
      var t = clean(e.textContent);
      if (t.length < 12 || t.length > 160) return;
      if (!/一般人群参考值|仅供参考|如有特殊|医疗建议|数据基于/.test(t)) return;
      add(e, "xn-cal-note");
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "xn-cal-top";
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
