/* 小凝工具站 · 血糖负荷与低 GI 替换增强 xn-gl v1
 * 能力：2 工具胶囊标签 44h/aria-current/具名；卡片 ①② → 数字徽标；
 *       食用量 52/22 隐藏 spinner + 5 档胶囊；3 下拉 48；2 开关 44×26 role=switch/aria-checked；
 *       计算 GL 52/17；GI 83 → 34/800；子卡 39/174/83 → 22/800；GL 主结论 42/800 注入；
 *       分级条 12 + 18 标记；表格 14/38；每餐 GL 17/800、全天 26/800；复制 46 具名；回到顶部。
 * 注入：legacy/dvzcccgy5d.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_GL__) return;
  window.__XN_GL__ = true;

  function vis(el) { return el && el.getBoundingClientRect().height > 0; }
  function clean(t) { return (t || "").replace(/\s+/g, " ").trim(); }
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }
  function add(el, cls) { if (el && !el.classList.contains(cls)) el.classList.add(cls); }
  var CIRC = /^[①②③④⑤⑥⑦⑧⑨⑩]$/;

  function cleanHeads() {
    each(document.querySelectorAll("#root h2"), function (h) {
      each(h.childNodes, function (n) {
        if (n.nodeType !== 3) return;
        var t = n.nodeValue || "";
        var c = t.replace(/^\s*[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "");
        if (c !== t) n.nodeValue = c;
      });
    });
    // 卡片标题前的圈号 → 数字徽标
    each(document.querySelectorAll("#root span"), function (s) {
      if (s.children.length) return;
      var t = clean(s.textContent);
      if (!CIRC.test(t)) return;
      var map = { "①": "1", "②": "2", "③": "3", "④": "4", "⑤": "5", "⑥": "6", "⑦": "7", "⑧": "8", "⑨": "9", "⑩": "10" };
      s.textContent = map[t];
      add(s, "xn-gl-no");
    });
  }

  function markTabs() {
    var btns = Array.prototype.filter.call(document.querySelectorAll("#root nav button"), vis);
    btns.forEach(function (b, i) {
      add(b, "xn-gl-tab");
      var on = /bg-blue-600/.test(String(b.className || ""));
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

  function nativeSet(el, v) {
    var desc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    if (desc && desc.set) desc.set.call(el, v);
    else el.value = v;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function markInputs() {
    each(document.querySelectorAll("#root input"), function (input) {
      if (!vis(input) || input.type !== "number") return;
      var aria = "食用量（克）";
      if (input.getAttribute("aria-label") !== aria) input.setAttribute("aria-label", aria);
      var host = input.parentElement;
      if (!host || host.querySelector(":scope > .xn-gl-qrow")) return;
      var row = document.createElement("div");
      row.className = "xn-gl-qrow";
      [50, 100, 150, 200, 250].forEach(function (q) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "xn-gl-q";
        b.textContent = String(q);
        b.setAttribute("aria-label", "填入 " + q + " 克");
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

  function markSwitches() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var track = b.querySelector("span.relative.inline-flex");
      if (!track) return;
      add(b, "xn-gl-switch");
      var on = /bg-blue-600/.test(String(track.className || ""));
      var val = on ? "true" : "false";
      if (b.getAttribute("role") !== "switch") b.setAttribute("role", "switch");
      if (b.getAttribute("aria-checked") !== val) b.setAttribute("aria-checked", val);
      var labelEl = b.querySelector("span:first-child");
      var name = clean(labelEl && labelEl.textContent);
      if (name) {
        var aria = name + "（拨动开关）";
        if (b.getAttribute("aria-label") !== aria) b.setAttribute("aria-label", aria);
        if (!b.title) b.title = aria;
      }
    });
  }

  function markButtons() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (t === "计算 GL" || t === "计算GL") {
        add(b, "xn-gl-go");
        if (b.getAttribute("aria-label") !== "计算血糖负荷 GL") b.setAttribute("aria-label", "计算血糖负荷 GL");
      } else if (t === "复制结果") {
        add(b, "xn-gl-sec");
        if (b.getAttribute("aria-label") !== "复制 GL 计算结果") b.setAttribute("aria-label", "复制 GL 计算结果");
      } else if (t === "清空") {
        add(b, "xn-gl-sec");
        if (b.getAttribute("aria-label") !== "清空输入") b.setAttribute("aria-label", "清空输入");
      } else if (t === "复制替换方案") {
        add(b, "xn-gl-sec");
        if (b.getAttribute("aria-label") !== "复制低 GI 替换方案") b.setAttribute("aria-label", "复制低 GI 替换方案");
      }
    });
  }

  function markCards() {
    each(document.querySelectorAll("#root section.rounded-xl, #root div.rounded-xl"), function (c) {
      if (!vis(c)) return;
      if (!c.querySelector("h2")) return;
      add(c, "xn-gl-card");
    });
    each(document.querySelectorAll("#root h2"), function (h) {
      if (!vis(h)) return;
      if (h.closest("section.rounded-xl")) return;
      add(h, "xn-gl-h2");
    });
    // 预览框
    each(document.querySelectorAll("#root div"), function (d) {
      if (!vis(d)) return;
      var cls = String(d.className || "");
      if (cls.indexOf("border-dashed") < 0) return;
      add(d, "xn-gl-preview");
    });
    // 使用说明
    each(document.querySelectorAll("#root details"), function (d) {
      if (vis(d) && /使用说明/.test(d.textContent)) add(d, "xn-gl-sum");
    });
  }

  function markResult() {
    // 大数字
    each(document.querySelectorAll("#root span.text-2xl"), function (s) {
      if (vis(s)) add(s, "xn-gl-gi");
    });
    each(document.querySelectorAll("#root span.text-lg"), function (s) {
      if (vis(s)) add(s, "xn-gl-sub");
    });
    each(document.querySelectorAll("#root div.rounded-lg"), function (d) {
      var cls = String(d.className || "");
      if (cls.indexOf("bg-slate-50") >= 0 && cls.indexOf("px-3") >= 0 && !d.querySelector("h2")) add(d, "xn-gl-subcard");
    });
    // 徽标
    each(document.querySelectorAll("#root span.inline-flex"), function (s) {
      if (!vis(s)) return;
      var cls = String(s.className || "");
      if (cls.indexOf("rounded-full") < 0) return;
      if (!clean(s.textContent)) return;
      add(s, "xn-gl-badge");
    });
    // 分级条 + 标记 + 刻度文字
    each(document.querySelectorAll("#root div"), function (d) {
      if (!vis(d)) return;
      var cls = String(d.className || "");
      var h = d.getBoundingClientRect().height;
      if (cls.indexOf("rounded-full") >= 0 && h > 2 && h <= 14 && /bg-slate-/.test(cls)) add(d, "xn-gl-scale");
      if (cls.indexOf("rounded-full") >= 0 && h > 2 && h <= 14 && /bg-red-|bg-amber-|bg-emerald-/.test(cls)) {
        add(d, "xn-gl-scale");
        if (d.parentElement) add(d.parentElement, "xn-gl-track");
      }
      if (cls.indexOf("absolute") >= 0 && h >= 8 && h <= 22 && /rounded-full/.test(cls)) add(d, "xn-gl-marker");
    });
    each(document.querySelectorAll("#root span"), function (s) {
      if (!vis(s) || s.children.length) return;
      if (/^(偏低|中|高)$/.test(clean(s.textContent))) add(s, "xn-gl-scaletxt");
    });
    // 表格
    each(document.querySelectorAll("#root table"), function (t) {
      if (vis(t)) add(t, "xn-gl-table");
    });
    // 每餐建议
    each(document.querySelectorAll("#root div"), function (d) {
      if (!vis(d)) return;
      var cls = String(d.className || "");
      if (cls.indexOf("rounded-lg") < 0 || cls.indexOf("border") < 0) return;
      if (!/早餐|午餐|晚餐/.test(d.textContent)) return;
      if (d.getBoundingClientRect().height < 60 || d.getBoundingClientRect().height > 260) return;
      add(d, "xn-gl-meal");
    });
    each(document.querySelectorAll("#root span, #root div, #root p"), function (e) {
      if (!vis(e) || e.children.length) return;
      var t = clean(e.textContent);
      if (/^单餐 GL/.test(t)) add(e, "xn-gl-mealgl");
      if (/^全天总 GL/.test(t)) add(e, "xn-gl-totalgl");
      if (/^GI\/GL 为参考值|仅供参考|个体差异/.test(t)) add(e, "xn-gl-note");
    });
    // 提示框
    each(document.querySelectorAll("#root div"), function (d) {
      var cls = String(d.className || "");
      if (cls.indexOf("bg-blue-50") >= 0 && vis(d)) add(d, "xn-gl-tip");
    });
    // 公式 + GL 主结论
    var formula = null;
    each(document.querySelectorAll("#root .font-mono, #root p, #root span"), function (e) {
      if (!vis(e)) return;
      var t = clean(e.textContent);
      if (t.indexOf("GL =") !== 0) return;
      if (!/≈\s*[\d.]+\s*$|=\s*[\d.]+\s*$/.test(t)) return;
      if (!formula || formula.textContent.length > e.textContent.length) formula = e;
    });
    if (formula) {
      add(formula, "xn-gl-formula");
      var m = clean(formula.textContent).match(/[=≈]\s*([\d.]+)\s*$/);
      if (m) {
        var v = parseFloat(m[1]);
        var level = v < 10 ? "低" : v < 20 ? "中" : "高";
        var anchor = formula;
        while (anchor.parentElement && anchor.parentElement.tagName !== "SECTION" && anchor.parentElement.children.length <= 3) anchor = anchor.parentElement;
        var hero = anchor.previousElementSibling;
        if (!hero || !hero.classList.contains("xn-gl-hero")) {
          hero = document.createElement("div");
          hero.className = "xn-gl-hero";
          hero.innerHTML = '<span class="xn-gl-hero-num"></span><span class="xn-gl-hero-unit">GL / 血糖负荷</span><span class="xn-gl-hero-tag"></span>';
          anchor.parentNode.insertBefore(hero, anchor);
        }
        hero.setAttribute("data-level", level);
        var num = hero.querySelector(".xn-gl-hero-num");
        if (num && num.textContent !== m[1]) num.textContent = m[1];
        var tag = hero.querySelector(".xn-gl-hero-tag");
        var tagTxt = level + " GL 负荷";
        if (tag && tag.textContent !== tagTxt) tag.textContent = tagTxt;
        var aria = "本次血糖负荷 GL " + m[1] + "，属于" + level + " GL";
        if (hero.getAttribute("aria-label") !== aria) hero.setAttribute("aria-label", aria);
      }
    }
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "xn-gl-top";
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
      markCards();
      markResult();
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
