/* 小凝工具站 · 理发与发型打理增强 xn-hair v1
 * 能力：5 个工具标签 <a> 40→44h + aria-current/具名 + 字母徽标；「工具A」「⑤」占位清理；
 *       12 个 number 48→52/22 隐藏 spinner + 分字段胶囊；工具 E 的 3 个下拉补 aria（发长/产品类型/造型强度）；
 *       实时结果行 38h、值 18/800、主值 25/800、一键复制 28→44h 具名；使用说明 13.5；回到顶部。
 * 注入：legacy/qhnfrustfq.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_HAIR__) return;
  window.__XN_HAIR__ = true;

  function vis(el) { return el && el.getBoundingClientRect().height > 0; }
  function clean(t) { return (t || "").replace(/\s+/g, " ").trim(); }
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }
  function add(el, cls) { if (el && !el.classList.contains(cls)) el.classList.add(cls); }

  function cleanHeads() {
    each(document.querySelectorAll("#root h2"), function (h) {
      var t = clean(h.textContent);
      var c = t
        .replace(/^\s*[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "")
        .replace(/^工具\s*[A-Za-z]\s+/, "");
      if (c !== t) h.textContent = c;
      if (h.textContent !== "使用说明") add(h, "xn-hair-h2");
    });
  }

  function markTabs() {
    var nav = document.querySelector("#root nav");
    if (nav) add(nav, "xn-hair-nav");
    var links = Array.prototype.filter.call(document.querySelectorAll("#root nav a"), vis);
    links.forEach(function (a, i) {
      add(a, "xn-hair-tab");
      var on = /bg-slate-900/.test(String(a.className || ""));
      if (on) {
        if (a.getAttribute("aria-current") !== "page") a.setAttribute("aria-current", "page");
      } else if (a.hasAttribute("aria-current")) {
        a.removeAttribute("aria-current");
      }
      var letterEl = null;
      each(a.querySelectorAll("span"), function (sp) {
        if (!letterEl && /^[A-E]$/.test(clean(sp.textContent))) letterEl = sp;
      });
      if (letterEl) add(letterEl, "xn-hair-letter");
      var letter = clean(letterEl && letterEl.textContent);
      var name = clean(a.textContent).replace(new RegExp("^" + (letter || "")), "");
      var aria = "切换到：" + name + "（工具 " + letter + "）";
      if (a.getAttribute("aria-label") !== aria) a.setAttribute("aria-label", aria);
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
    { key: "剪发价格", quick: [30, 45, 68, 98] },
    { key: "剪发次数", quick: [6, 8, 12] },
    { key: "洗吹附加", quick: [0, 10, 20] },
    { key: "染发单价", quick: [200, 300, 500] },
    { key: "染发次数", quick: [1, 2, 4] },
    { key: "护理与补色", quick: [0, 50, 100] },
    { key: "瓶装容量", quick: [250, 500, 750] },
    { key: "每次用量", quick: [5, 8, 12] },
    { key: "每周洗头", quick: [3, 5, 7] },
    { key: "烫发价位", quick: [300, 600, 1000] },
    { key: "护理周期", quick: [3, 4, 6] },
    { key: "单次护理", quick: [50, 80, 150] }
  ];

  function markInputs() {
    each(document.querySelectorAll("#root input"), function (input) {
      if (!vis(input) || input.type !== "number") return;
      var ariaNow = input.getAttribute("aria-label") || "";
      var rule = null;
      RULES.forEach(function (r) { if (!rule && ariaNow.indexOf(r.key) >= 0) rule = r; });
      if (!rule) return;
      var host = input.parentElement;
      if (!host || host.querySelector(":scope > .xn-hair-qrow")) return;
      var row = document.createElement("div");
      row.className = "xn-hair-qrow";
      rule.quick.forEach(function (q) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "xn-hair-q";
        b.textContent = String(q);
        b.setAttribute("aria-label", "填入 " + q + "（" + ariaNow + "）");
        b.addEventListener("click", function (e) {
          e.preventDefault();
          nativeSet(input, String(q));
          input.focus();
        });
        row.appendChild(b);
      });
      host.appendChild(row);
    });
    // 工具 E 的三个下拉补 aria
    var sels = Array.prototype.filter.call(document.querySelectorAll("#root select"), vis).filter(function (s) {
      return !s.getAttribute("aria-label");
    });
    var names = ["发长", "产品类型", "造型强度"];
    sels.forEach(function (s, i) {
      var n = names[i] || "选项";
      s.setAttribute("aria-label", n);
      if (i === 0) { /* 决定用量基数 */ }
    });
    // 范围提示
    each(document.querySelectorAll("#root span, #root div, #root p"), function (s) {
      if (!vis(s) || s.children.length) return;
      if (/^可选/.test(clean(s.textContent))) add(s, "xn-hair-range");
    });
  }

  function markCards() {
    // 使用说明卡
    each(document.querySelectorAll("#root h2"), function (h) {
      if (clean(h.textContent) !== "使用说明") return;
      var card = h.parentElement;
      if (card) add(card, "xn-hair-help");
    });
    // 工具卡
    each(document.querySelectorAll("#root h2.xn-hair-h2"), function (h) {
      var card = h.parentElement;
      if (card) add(card, "xn-hair-card");
      // 描述
      var p = h.nextElementSibling;
      if (p && p.tagName === "P") add(p, "xn-hair-desc");
    });
    ensureDesc();
  }

  function ensureDesc() {
    each(document.querySelectorAll("#root h2.xn-hair-h2"), function (h) {
      var card = h.parentElement;
      if (!card) return;
      each(card.querySelectorAll("p"), function (p) {
        if (p.getBoundingClientRect().height > 0 && clean(p.textContent).length > 12) add(p, "xn-hair-desc");
      });
    });
  }

  function markButtons() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      if (clean(b.textContent) !== "一键复制") return;
      add(b, "xn-hair-copy");
      if (b.getAttribute("aria-label") !== "复制当前工具结果") b.setAttribute("aria-label", "复制当前工具结果");
    });
  }

  function markResult() {
    each(document.querySelectorAll("#root div"), function (d) {
      if (!vis(d)) return;
      if (d.getBoundingClientRect().height > 520) return;
      if (!d.querySelector("h3")) return;
      if (d.textContent.indexOf("实时结果") < 0) return;
      add(d, "xn-hair-result");
      each(d.querySelectorAll("h3"), function (h) {
        if (clean(h.textContent) === "实时结果") h.classList.add("xn-hair-result-title");
      });
      each(d.querySelectorAll("ul"), function (ul) { add(ul, "xn-hair-rows"); });
      each(d.querySelectorAll("li"), function (li) {
        var spans = li.querySelectorAll(":scope > span");
        if (spans.length < 2) return;
        var val = spans[spans.length - 1];
        var fs = parseFloat(getComputedStyle(val).fontSize) || 16;
        add(val, fs >= 19 ? "xn-hair-big" : "xn-hair-val");
        var lab = spans[0];
        if (!lab.classList.contains("xn-hair-lab")) lab.classList.add("xn-hair-lab");
      });
      each(d.querySelectorAll("p, div"), function (e) {
        if (!vis(e) || e.children.length) return;
        var t = clean(e.textContent);
        if (/少量多次|先发根后发梢|直观参照|上手方式|小建议/.test(t) && t.length > 4) add(e, "xn-hair-note");
      });
    });
    // 工具 E 结果卡外层的 3 段说明也按正文处理
    each(document.querySelectorAll("#root p"), function (p) {
      if (!vis(p)) return;
      var t = clean(p.textContent);
      if (/按发长基数|决定用量基数|按 ml 计/.test(t)) add(p, "xn-hair-note");
    });
    // 页脚
    each(document.querySelectorAll("#root div, #root p"), function (e) {
      if (!vis(e)) return;
      if (e.getBoundingClientRect().height > 90) return;
      var t = clean(e.textContent);
      if (/人类作者：|免费纯前端/.test(t)) add(e, "xn-hair-foot");
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "xn-hair-top";
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
      markCards();
      markButtons();
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
