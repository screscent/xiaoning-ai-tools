/* 小凝工具站 · 嘌呤尿酸与饮水目标增强 xn-purine v1
 * 能力：2 个工具标签 37→44h/aria-current/具名；h2 去①②；输入 52/21 + 体重/饮水常用值；
 *       人群下拉 48；多选/单选胶囊 40→44 + aria-pressed；2 开关 50×28 + 具名；
 *       生成建议 52/17、重置/复制 46 具名；结果 h2 18、复制 44 具名、列表 13.5、表 12.5/13.5；
 *       饮水目标大数字 30/800；回到顶部。
 * 注入：legacy/keygufdudk.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_PURINE__) return;
  window.__XN_PURINE__ = true;

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
      if (!b.classList.contains("xn-pu-tab")) b.classList.add("xn-pu-tab");
      var on = /border-slate-900/.test(String(b.className || ""));
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
    { key: "体重", aria: "体重（kg）", quick: [50, 60, 65, 70, 80] },
    { key: "饮水", aria: "每日饮水（ml）", quick: [1200, 1500, 1800, 2000] }
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
      if (host.querySelector(":scope > .xn-pu-qrow")) return;
      var row = document.createElement("div");
      row.className = "xn-pu-qrow";
      rule.quick.forEach(function (q) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "xn-pu-q";
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

  /* ---------- 胶囊 / 开关 ---------- */
  function markChips() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var cls = String(b.className || "");
      if (b.getAttribute("role") === "switch") return;
      if (b.closest("nav")) return;
      if (!/rounded-full/.test(cls) || !/text-\[13px\]/.test(cls)) return;
      if (!b.classList.contains("xn-pu-chip")) b.classList.add("xn-pu-chip");
      var on = /border-slate-900/.test(cls) || b.getAttribute("aria-pressed") === "true";
      var val = on ? "true" : "false";
      if (b.getAttribute("aria-pressed") !== val) b.setAttribute("aria-pressed", val);
    });
  }

  function markSwitches() {
    each(document.querySelectorAll("#root button[role=switch]"), function (b) {
      if (!vis(b)) return;
      if (!b.classList.contains("xn-pu-switch")) b.classList.add("xn-pu-switch");
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
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (t === "生成建议") {
        if (!b.classList.contains("xn-pu-go")) b.classList.add("xn-pu-go");
        var a1 = "生成嘌呤与饮水建议";
        if (b.getAttribute("aria-label") !== a1) b.setAttribute("aria-label", a1);
        if (!b.title) b.title = a1;
      } else if (t === "重置") {
        if (!b.classList.contains("xn-pu-secondary")) b.classList.add("xn-pu-secondary");
        if (b.getAttribute("aria-label") !== "重置嘌呤速查") b.setAttribute("aria-label", "重置嘌呤速查");
      } else if (t === "复制饮水计划") {
        if (!b.classList.contains("xn-pu-secondary")) b.classList.add("xn-pu-secondary");
        if (b.getAttribute("aria-label") !== "复制饮水计划") b.setAttribute("aria-label", "复制饮水计划");
      }
    });
    // 结果卡右上角复制按钮
    each(document.querySelectorAll("#root article"), function (art) {
      var h2 = art.querySelector("h2");
      var name = clean(h2 && h2.textContent);
      each(art.querySelectorAll("button"), function (b) {
        if (!vis(b)) return;
        var t = clean(b.textContent);
        if (!/^复制/.test(t)) return;
        if (!b.classList.contains("xn-pu-copy")) b.classList.add("xn-pu-copy");
        var aria = "复制" + (name ? "「" + name + "」" : "") + "内容";
        if (b.getAttribute("aria-label") !== aria) b.setAttribute("aria-label", aria);
      });
    });
  }

  /* ---------- 饮水目标大数字 ---------- */
  function markBig() {
    each(document.querySelectorAll("#root p.text-\\[15px\\].font-semibold"), function (p) {
      if (!vis(p)) return;
      if (!/ml\s*\/\s*日/.test(p.textContent)) return;
      if (!p.classList.contains("xn-pu-big")) p.classList.add("xn-pu-big");
      var row = p.closest("div.rounded-lg");
      if (row && !row.classList.contains("xn-pu-bigline")) row.classList.add("xn-pu-bigline");
    });
    each(document.querySelectorAll("#root p.text-\\[12px\\].leading-5"), function (p) {
      if (!/参考值|遵医嘱/.test(p.textContent)) return;
      if (!p.classList.contains("xn-pu-note")) p.classList.add("xn-pu-note");
    });
    each(document.querySelectorAll("#root p.bg-amber-50\\/60"), function (p) {
      if (!p.classList.contains("xn-pu-note")) p.classList.add("xn-pu-note");
    });
    each(document.querySelectorAll("#root p.bg-slate-50"), function (p) {
      if (!/依据你选择的常吃食物/.test(p.textContent)) return;
      if (!p.classList.contains("xn-pu-summary")) p.classList.add("xn-pu-summary");
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "xn-pu-top";
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
      markChips();
      markSwitches();
      markButtons();
      markBig();
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
