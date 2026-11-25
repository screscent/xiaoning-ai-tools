/* 小凝工具站 · 卫浴五金与浴室用品增强 xn-water v1
 * 能力：6 标签 44→46h + aria-current/具名；清「工具A~F」占位；h2 20；
 *       输入 46→52/22 + inputmode + aria 单位清洗 + 常用值胶囊；下拉 50 + aria 去「默认」；
 *       开始计算 52/17、复制结果 37→46 具名；结果卡 dd 19/800、dt 13、说明 13.5；回到顶部。
 * 注入：legacy/mkgezyrxwr.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_WATER__) return;
  window.__XN_WATER__ = true;
  function vis(el) { return el && el.getBoundingClientRect().height > 0; }
  function clean(t) { return (t || "").replace(/\s+/g, " ").trim(); }
  function each(l, f) { Array.prototype.forEach.call(l, f); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  var TABS = ["花洒水压", "龙头角阀", "地漏防臭", "浴室收纳", "除垢滤芯", "防滑扶手"];

  function cleanHeads() {
    each(document.querySelectorAll("#root h2"), function (h) {
      var t = clean(h.textContent);
      var c = t.replace(/^工具\s*[A-Za-z]\s+/, "").replace(/^\s*[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "");
      if (c !== t) h.textContent = c;
      if (!/^使用说明$/.test(c)) add(h, "xn-water-h2");
    });
    each(document.querySelectorAll("#root h2.xn-water-h2"), function (h) {
      var card = h.closest("article") || h.closest("section") || h.closest("div.rounded-2xl") || h.closest("div.rounded-xl") || (h.parentElement && h.parentElement.parentElement);
      if (card) add(card, "xn-water-card");
      each(card ? card.querySelectorAll("p") : [], function (p) {
        if (vis(p) && clean(p.textContent).length > 10 && parseFloat(getComputedStyle(p).fontSize) < 14) add(p, "xn-water-desc");
      });
    });
  }

  function markTabs() {
    var wrap = null;
    var h = document.querySelector("#root h2.xn-water-h2");
    var cur = clean(h && h.textContent);
    var KEYS = { "花洒": "花洒水压", "龙头": "龙头角阀", "地漏": "地漏防臭", "浴室收纳": "浴室收纳", "除垢": "除垢滤芯", "防滑": "防滑扶手" };
    var active = "";
    Object.keys(KEYS).forEach(function (k) { if (cur.indexOf(k) >= 0) active = KEYS[k]; });
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (TABS.indexOf(t) < 0) return;
      add(b, "xn-water-tab");
      var on = t === active;
      if (on) {
        if (b.getAttribute("aria-current") !== "page") b.setAttribute("aria-current", "page");
      } else if (b.hasAttribute("aria-current")) b.removeAttribute("aria-current");
      var aria = "切换到：" + t + "（工具 " + (TABS.indexOf(t) + 1) + "）";
      if (b.getAttribute("aria-label") !== aria) b.setAttribute("aria-label", aria);
      if (!wrap) wrap = b.parentElement;
    });
    if (wrap) add(wrap, "xn-water-tabwrap");
  }

  function nativeSet(el, v) {
    var d = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    if (d && d.set) d.set.call(el, v); else el.value = v;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  var ARIA_MAP = [
    ["楼层层", "楼层（层）"], ["入户水压bar", "入户水压（bar）"], ["台盆孔距cm", "台盆孔距（cm）"],
    ["浴室宽度cm", "浴室宽度（cm）"], ["已使用月数个月", "已使用月数（个月）"], ["浴室面积㎡", "浴室面积（㎡）"]
  ];
  var RULES = [
    { key: "楼层", quick: [3, 6, 11, 18] }, { key: "水压", quick: [1.5, 2.5, 3.5] },
    { key: "孔距", quick: [10, 15, 20] }, { key: "浴室宽度", quick: [120, 150, 180] },
    { key: "月数", quick: [1, 6, 12, 24] }, { key: "浴室面积", quick: [3, 5, 8] }
  ];

  function markInputs() {
    each(document.querySelectorAll("#root input"), function (input) {
      if (!vis(input)) return;
      if (input.type !== "text" && input.type !== "number") return;
      var raw = input.getAttribute("aria-label") || "";
      var aria = raw;
      ARIA_MAP.forEach(function (m) { if (aria === m[0]) aria = m[1]; });
      if (aria && input.getAttribute("aria-label") !== aria) input.setAttribute("aria-label", aria);
      if (!input.getAttribute("inputmode")) input.setAttribute("inputmode", "decimal");
      input.style.setProperty("font-size", "22px", "important");
      var rule = null;
      RULES.forEach(function (r) { if (!rule && aria.indexOf(r.key) >= 0) rule = r; });
      if (!rule) return;
      var host = input.parentElement;
      if (!host || host.querySelector(":scope > .xn-water-qrow")) return;
      var row = document.createElement("div");
      row.className = "xn-water-qrow";
      rule.quick.forEach(function (q) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "xn-water-q"; b.textContent = String(q);
        b.setAttribute("aria-label", "填入 " + q + "（" + aria + "）");
        b.addEventListener("click", function (e) { e.preventDefault(); nativeSet(input, String(q)); input.focus(); });
        row.appendChild(b);
      });
      host.appendChild(row);
    });
    each(document.querySelectorAll("#root select"), function (s) {
      if (!vis(s)) return;
      var a = clean(s.getAttribute("aria-label")).replace(/默认.*$/, "").trim();
      if (a && s.getAttribute("aria-label") !== a) s.setAttribute("aria-label", a);
    });
  }

  function markButtons() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (t === "开始计算") {
        add(b, "xn-water-go");
        if (b.getAttribute("aria-label") !== "开始计算") b.setAttribute("aria-label", "开始计算");
      } else if (t === "复制结果") {
        add(b, "xn-water-copy");
        if (b.getAttribute("aria-label") !== "复制计算结果") b.setAttribute("aria-label", "复制计算结果");
      }
    });
  }

  function markResult() {
    each(document.querySelectorAll("#root div"), function (d) {
      if (!vis(d)) return;
      var cls = String(d.className || "");
      if (cls.indexOf("border-teal-200") < 0) return;
      if (!d.querySelector("dl")) return;
      add(d, "xn-water-result");
      each(d.querySelectorAll("dl > div"), function (m) {
        if (vis(m)) add(m, "xn-water-metric");
      });
    });
    each(document.querySelectorAll("#root p, #root div"), function (e) {
      if (!vis(e) || e.children.length > 0) return;
      var t = clean(e.textContent);
      if (/以上为参考|本地计算|不联网/.test(t) && t.length > 8) add(e, "xn-water-note");
      if (/人类作者：/.test(t)) add(e, "xn-water-foot");
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button"; topBtn.className = "xn-water-top";
    topBtn.setAttribute("aria-label", "回到顶部"); topBtn.title = "回到顶部"; topBtn.textContent = "↑";
    topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    document.body.appendChild(topBtn);
  }

  function tick() {
    try { cleanHeads(); markTabs(); markInputs(); markButtons(); markResult(); ensureTop(); } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", tick, { once: true }); else tick();
  window.setTimeout(tick, 900); window.setTimeout(tick, 2200); window.setInterval(tick, 1000);
  document.addEventListener("click", function () { window.setTimeout(tick, 200); }, true);
  var pending = false;
  function schedule() { if (pending) return; pending = true; window.setTimeout(function () { pending = false; tick(); }, 120); }
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
  window.addEventListener("scroll", function () {
    if (!topBtn) return;
    if (window.scrollY > 620) topBtn.classList.add("is-on"); else topBtn.classList.remove("is-on");
  }, { passive: true });
})();
