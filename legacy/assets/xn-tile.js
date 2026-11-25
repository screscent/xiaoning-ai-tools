/* 小凝工具站 · 瓷砖美缝与辅材用量增强 xn-tile v1
 * 能力：5 个工具标签 44→46h + aria-current 归一为 page + 具名；清「工具A~D」「⑤」占位；
 *       h2 21 + 字母徽标 36；输入 aria 由光秃单位改为「字段（单位）」+ 54/23/800 + 常用值胶囊；
 *       下拉 52 补 aria；计算 44→52/17、复制 44→46 具名；
 *       结果行 40h、所需块数 30/800、箱数 24/800、其余 17/800；提醒 13.5/14.5；回到顶部。
 * 注入：legacy/qhn3thstfq.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_TILE__) return;
  window.__XN_TILE__ = true;

  function vis(el) { return el && el.getBoundingClientRect().height > 0; }
  function clean(t) { return (t || "").replace(/\s+/g, " ").trim(); }
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }
  function add(el, cls) { if (el && !el.classList.contains(cls)) el.classList.add(cls); }

  function cleanHeads() {
    each(document.querySelectorAll("#root h2"), function (h) {
      var t = clean(h.textContent);
      var c = t.replace(/^工具\s*[A-Za-z]\s+/, "").replace(/^\s*[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "");
      if (c !== t) h.textContent = c;
      if (!/^使用说明$/.test(c)) add(h, "xn-tile-h2");
    });
  }

  function labelOf(el) {
    var id = el && el.id;
    if (!id) return "";
    var lab = document.querySelector('label[for="' + id + '"]');
    if (!lab) return "";
    var span = lab.querySelector("span");
    return clean(span && span.textContent) || clean(lab.textContent).split("1")[0];
  }

  function markTabs() {
    var nav = document.querySelector("#root nav");
    if (nav && nav.firstElementChild) add(nav.firstElementChild, "xn-tile-navwrap");
    var links = Array.prototype.filter.call(document.querySelectorAll("#root nav a"), vis);
    links.forEach(function (a, i) {
      add(a, "xn-tile-tab");
      var on = /bg-stone-900/.test(String(a.className || "")) || a.getAttribute("aria-current") === "true";
      if (on) {
        if (a.getAttribute("aria-current") !== "page") a.setAttribute("aria-current", "page");
      } else if (a.hasAttribute("aria-current")) {
        a.removeAttribute("aria-current");
      }
      var name = clean(a.textContent).replace(/^\s*[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "");
      var aria = "切换到：" + name + "（工具 " + (i + 1) + "）";
      if (name && a.getAttribute("aria-label") !== aria) a.setAttribute("aria-label", aria);
    });
  }

  function nativeSet(el, v) {
    var desc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    if (desc && desc.set) desc.set.call(el, v);
    else el.value = v;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  var RULES = [
    { key: "铺贴面积", quick: [10, 20, 30, 50] },
    { key: "损耗率", quick: [5, 8, 10] },
    { key: "砖缝宽度", quick: [1.5, 2, 3] },
    { key: "防水面积", quick: [10, 20, 30] },
    { key: "涂刷遍数", quick: [1, 2, 3] },
    { key: "房间周长", quick: [20, 30, 40] },
    { key: "踢脚线高度", quick: [8, 10, 12] },
    { key: "门洞总宽", quick: [2, 3, 5] },
    { key: "门槛石数量", quick: [1, 2, 3] },
    { key: "缝宽", quick: [1.5, 2, 3] }
  ];


  function markInputs() {
    each(document.querySelectorAll("#root input"), function (input) {
      if (!vis(input) || input.type !== "number") return;
      var name = labelOf(input);
      var raw = clean(input.getAttribute("aria-label"));
      if (raw && /^[%㎡m²m³cmmm遍块项次天元]+$/.test(raw) && !input.dataset.xnUnit) input.dataset.xnUnit = raw;
      var unit = input.dataset.xnUnit || "";
      var aria = name ? (unit ? name + "（" + unit + "）" : name) : raw;
      if (aria && input.getAttribute("aria-label") !== aria) input.setAttribute("aria-label", aria);
      var rule = null;
      RULES.forEach(function (r) { if (!rule && (name.indexOf(r.key) >= 0 || aria.indexOf(r.key) >= 0)) rule = r; });
      if (!rule) return;
      var host = input.parentElement;
      if (!host || host.querySelector(":scope > .xn-tile-qrow")) return;
      var row = document.createElement("div");
      row.className = "xn-tile-qrow";
      rule.quick.forEach(function (q) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "xn-tile-q";
        b.textContent = String(q);
        b.setAttribute("aria-label", "填入 " + q + "（" + aria + "）");
        b.addEventListener("click", function (e) {
          e.preventDefault();
          nativeSet(input, String(q));
          input.focus();
        });
        row.appendChild(b);
      });
      host.appendChild(row);
    });
    each(document.querySelectorAll("#root select"), function (s) {
      if (!vis(s)) return;
      var name = labelOf(s);
      if (name && s.getAttribute("aria-label") !== name) s.setAttribute("aria-label", name);
    });
  }

  function markButtons() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (/^计算/.test(t)) {
        add(b, "xn-tile-go");
        if (b.getAttribute("aria-label") !== t) b.setAttribute("aria-label", t);
      } else if (t === "复制结果") {
        add(b, "xn-tile-copy");
        if (b.getAttribute("aria-label") !== "复制计算结果") b.setAttribute("aria-label", "复制计算结果");
      }
    });
  }

  function markCards() {
    each(document.querySelectorAll("#root h2.xn-tile-h2"), function (h) {
      var card = h.closest("article") || h.closest("div.rounded-2xl") || h.closest("section") || (h.parentElement && h.parentElement.parentElement) || h.parentElement;
      if (!card) return;
      add(card, "xn-tile-card");
      each(card.querySelectorAll("span"), function (s) {
        var cls = String(s.className || "");
        if (/h-9/.test(cls) && /w-9/.test(cls)) add(s, "xn-tile-letter");
      });
      each(card.querySelectorAll("p"), function (p) {
        if (!vis(p)) return;
        if (clean(p.textContent).length < 10) return;
        var fs = parseFloat(getComputedStyle(p).fontSize) || 14;
        if (fs < 15) add(p, "xn-tile-desc");
      });
    });
    // 使用说明
    each(document.querySelectorAll("#root h2"), function (h) {
      if (clean(h.textContent) !== "使用说明") return;
      var card = h.closest("section") || h.parentElement;
      if (card) add(card, "xn-tile-help");
    });
    // 页脚
    each(document.querySelectorAll("#root div, #root p"), function (e) {
      if (!vis(e)) return;
      if (e.getBoundingClientRect().height > 110) return;
      var t = clean(e.textContent);
      if (/人类作者：|本合集 5 个工具/.test(t)) add(e, "xn-tile-foot");
    });
  }

  function markResult() {
    each(document.querySelectorAll("#root div.rounded-2xl"), function (c) {
      if (!vis(c)) return;
      if (!c.querySelector("dl")) return;
      if (c.textContent.indexOf("复制结果") < 0) return;
      add(c, "xn-tile-result");
      each(c.querySelectorAll("dl > div"), function (row) {
        var dt = row.querySelector("dt");
        var dd = row.querySelector("dd");
        if (!dt || !dd) return;
        var label = clean(dt.textContent);
        if (/所需块数/.test(label)) add(dd, "xn-tile-key");
        else if (/箱数/.test(label)) add(dd, "xn-tile-box");
      });
      each(c.querySelectorAll("div"), function (d) {
        if (!vis(d)) return;
        if (d.querySelector("ol") && /提醒/.test(d.textContent)) add(d, "xn-tile-notes");
      });
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "xn-tile-top";
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
