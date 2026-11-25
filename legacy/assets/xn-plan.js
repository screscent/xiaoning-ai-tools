/* 小凝工具站 · 饮水作息与周计划增强 xn-plan v1
 * 能力：2 个工具标签 37→44h/aria-current/具名；h2 去② 19；体重 52/21 + 50-80 预设；
 *       起床/睡觉时间 48/16.5 + 3 档预设；活动量 48；三餐提醒开关 50×28 + 具名；
 *       生成计划 52/17、复制/清空/导出 46 具名；1800ml 34/800、7.2 杯 26/800、列表 14.5/40h；
 *       周计划改 4 列、日输入 44、+ 按钮 44、任务 13；回到顶部。
 * 注入：legacy/vfmdv3lsqf.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_PLAN__) return;
  window.__XN_PLAN__ = true;

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }
  function clean(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }
  function each(list, fn) {
    Array.prototype.forEach.call(list, fn);
  }

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

  function markTabs() {
    var btns = Array.prototype.filter.call(document.querySelectorAll("#root nav button"), vis);
    if (!btns.length) return;
    btns.forEach(function (b, i) {
      if (!b.classList.contains("xn-pl-tab")) b.classList.add("xn-pl-tab");
      var on = /bg-sky-500/.test(String(b.className || ""));
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
    { key: "体重", aria: "体重（公斤）", quick: [50, 60, 70, 80] },
    { key: "起床", aria: "起床时间", quick: ["06:30", "07:00", "07:30"] },
    { key: "睡觉", aria: "睡觉时间", quick: ["22:30", "23:00", "23:30"] }
  ];

  function markInputs() {
    each(document.querySelectorAll("#root input"), function (input) {
      if (!vis(input)) return;
      if (input.type !== "number" && input.type !== "time") return;
      if (input.closest(".xn-pl-day")) return;
      var ariaNow = input.getAttribute("aria-label") || "";
      var rule = null;
      RULES.forEach(function (r) {
        if (!rule && ariaNow.indexOf(r.key) >= 0) rule = r;
      });
      if (!rule) return;
      if (input.getAttribute("aria-label") !== rule.aria) input.setAttribute("aria-label", rule.aria);
      if (input.type === "time") input.style.setProperty("font-size", "16.5px", "important");
      var host = input.parentElement;
      if (!host) return;
      if (host.querySelector(":scope > .xn-pl-qrow")) return;
      var row = document.createElement("div");
      row.className = "xn-pl-qrow";
      rule.quick.forEach(function (q) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "xn-pl-q";
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
      if (!b.classList.contains("xn-pl-switch")) b.classList.add("xn-pl-switch");
      var on = /bg-sky-500/.test(cls);
      var val = on ? "true" : "false";
      if (b.getAttribute("role") !== "switch") b.setAttribute("role", "switch");
      if (b.getAttribute("aria-checked") !== val) b.setAttribute("aria-checked", val);
      var row = b.parentElement;
      var label = row && row.querySelector("span");
      var name = clean(label && label.textContent);
      if (name) {
        var aria = name + "（拨动开关）";
        if (b.getAttribute("aria-label") !== aria) b.setAttribute("aria-label", aria);
        if (!b.title) b.title = aria;
      }
    });
  }

  /* ---------- 按钮 ---------- */
  function markButtons() {
    var hasExport = Array.prototype.some.call(document.querySelectorAll("#root button"), function (b) {
      return vis(b) && clean(b.textContent) === "导出文本";
    });
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (t === "生成计划") {
        if (!b.classList.contains("xn-pl-go")) b.classList.add("xn-pl-go");
        var a1 = "生成饮水作息计划";
        if (b.getAttribute("aria-label") !== a1) b.setAttribute("aria-label", a1);
        if (!b.title) b.title = a1;
      } else if (t === "复制计划") {
        if (!b.classList.contains("xn-pl-secondary")) b.classList.add("xn-pl-secondary");
        var a2 = hasExport ? "复制一周计划" : "复制饮水作息计划";
        if (b.getAttribute("aria-label") !== a2) b.setAttribute("aria-label", a2);
      } else if (t === "清空") {
        if (!b.classList.contains("xn-pl-secondary")) b.classList.add("xn-pl-secondary");
        if (b.getAttribute("aria-label") !== "清空饮水作息计划") b.setAttribute("aria-label", "清空饮水作息计划");
      } else if (t === "导出文本") {
        if (!b.classList.contains("xn-pl-secondary")) b.classList.add("xn-pl-secondary");
        if (b.getAttribute("aria-label") !== "导出周计划文本") b.setAttribute("aria-label", "导出周计划文本");
      }
    });
  }

  /* ---------- 结果 / 周计划 ---------- */
  function markBlocks() {
    each(document.querySelectorAll("#root .text-3xl"), function (e) {
      if (!vis(e)) return;
      if (!e.classList.contains("xn-pl-big")) e.classList.add("xn-pl-big");
    });
    each(document.querySelectorAll("#root .text-2xl"), function (e) {
      if (!vis(e)) return;
      if (!e.classList.contains("xn-pl-cups")) e.classList.add("xn-pl-cups");
    });
    each(document.querySelectorAll("#root p.text-xs.text-slate-400"), function (p) {
      if (!vis(p)) return;
      if (!/体重|ml\/kg|杯/.test(p.textContent)) return;
      if (!p.classList.contains("xn-pl-cap")) p.classList.add("xn-pl-cap");
    });
    each(document.querySelectorAll("#root ul.space-y-1\\.5"), function (ul) {
      if (!vis(ul)) return;
      if (!ul.classList.contains("xn-pl-list")) ul.classList.add("xn-pl-list");
    });
    each(document.querySelectorAll("#root p.text-xs"), function (p) {
      if (!vis(p)) return;
      if (!/仅供参考|医疗建议|如有特殊/.test(p.textContent)) return;
      if (!p.classList.contains("xn-pl-note")) p.classList.add("xn-pl-note");
    });
    // 周计划
    each(document.querySelectorAll("#root [class*='lg:grid-cols-7']"), function (g) {
      if (!vis(g)) return;
      if (!g.classList.contains("xn-pl-week")) g.classList.add("xn-pl-week");
    });
    each(document.querySelectorAll("#root .xn-pl-week > div"), function (card) {
      if (!vis(card)) return;
      if (!card.classList.contains("xn-pl-day")) card.classList.add("xn-pl-day");
      var nameEl = card.querySelector("span.font-semibold");
      var day = clean(nameEl && nameEl.textContent);
      var input = card.querySelector("input");
      if (input && day) {
        var ia = day + "任务（回车或点 + 添加）";
        if (input.getAttribute("aria-label") !== ia) input.setAttribute("aria-label", ia);
        if (!input.placeholder) input.placeholder = "加任务";
      }
      each(card.querySelectorAll("button"), function (b) {
        if (!vis(b)) return;
        if (!b.classList.contains("xn-pl-add")) b.classList.add("xn-pl-add");
        var ba = "添加任务到" + (day || "当天");
        if (b.getAttribute("aria-label") !== ba) b.setAttribute("aria-label", ba);
        if (!b.title) b.title = ba;
      });
    });
    each(document.querySelectorAll("#root span.text-xs.text-slate-500"), function (s) {
      if (!/总完成率/.test(s.textContent)) return;
      if (!s.classList.contains("xn-pl-rate")) s.classList.add("xn-pl-rate");
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "xn-pl-top";
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
