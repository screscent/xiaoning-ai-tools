/* 小凝工具站 · 门票与通行预算增强 xn-ticket v1
 * 能力：6 个工具标签 42→46h + aria-current/具名；清「工具E/F」占位；h2 20；
 *       15 个 number 48→52/22 隐藏 spinner + 常用值胶囊；下拉 50；
 *       清空/复制 37→46 具名（含无名图标按钮）；结果行 34h、值 16/700、合计 28/800、人均 22/800；回到顶部。
 * 注入：legacy/npcteh2aq6.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_TICKET__) return;
  window.__XN_TICKET__ = true;

  function vis(el) { return el && el.getBoundingClientRect().height > 0; }
  function clean(t) { return (t || "").replace(/\s+/g, " ").trim(); }
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }
  function add(el, cls) { if (el && !el.classList.contains(cls)) el.classList.add(cls); }

  function cleanHeads() {
    each(document.querySelectorAll("#root h2"), function (h) {
      var t = clean(h.textContent);
      var c = t.replace(/^工具\s*[A-Za-z]\s+/, "").replace(/^\s*[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "");
      if (c !== t) h.textContent = c;
      if (!/^使用说明$/.test(c)) add(h, "xn-ticket-h2");
    });
  }

  function markTabs() {
    var nav = document.querySelector("#root nav");
    if (nav) add(nav, "xn-ticket-nav");
    var links = Array.prototype.filter.call(document.querySelectorAll("#root nav a"), vis);
    links.forEach(function (a, i) {
      add(a, "xn-ticket-tab");
      var on = /bg-blue-50/.test(String(a.className || ""));
      if (on) {
        if (a.getAttribute("aria-current") !== "page") a.setAttribute("aria-current", "page");
      } else if (a.hasAttribute("aria-current")) {
        a.removeAttribute("aria-current");
      }
      var name = clean(a.textContent).replace(/^\d+\.\s*/, "");
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
    { key: "成人数", quick: [1, 2, 3, 4] },
    { key: "儿童数", quick: [0, 1, 2] },
    { key: "老人数", quick: [0, 1, 2] },
    { key: "成人票价", quick: [60, 120, 180, 240] },
    { key: "景点数", quick: [2, 3, 5] },
    { key: "每景点票价", quick: [60, 120, 180] },
    { key: "总预算", quick: [500, 1000, 1500, 3000] },
    { key: "通票价格", quick: [199, 299, 399] },
    { key: "计划访问景点数", quick: [3, 5, 8] },
    { key: "单买总价", quick: [300, 480, 800] },
    { key: "讲解费", quick: [0, 20, 30, 50] },
    { key: "观光车费", quick: [0, 15, 20, 30] },
    { key: "门票预算", quick: [100, 200, 360, 500] },
    { key: "年龄", quick: [3, 6, 8, 12] },
    { key: "身高", quick: [100, 120, 130, 150] },
    { key: "门票全价", quick: [40, 80, 120] },
    { key: "提前天数", quick: [0, 1, 3, 7] },
    { key: "票价", quick: [60, 120, 200] },
    { key: "人数", quick: [1, 2, 3, 4] }
  ];

  function markInputs() {
    each(document.querySelectorAll("#root input"), function (input) {
      if (!vis(input) || input.type !== "number") return;
      var ariaNow = input.getAttribute("aria-label") || "";
      var rule = null;
      RULES.forEach(function (r) { if (!rule && ariaNow.indexOf(r.key) >= 0) rule = r; });
      if (!rule) return;
      var host = input.parentElement;
      if (!host || host.querySelector(":scope > .xn-ticket-qrow")) return;
      var row = document.createElement("div");
      row.className = "xn-ticket-qrow";
      rule.quick.forEach(function (q) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "xn-ticket-q";
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
  }

  function markButtons() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (t === "清空") {
        add(b, "xn-ticket-sec");
        if (b.getAttribute("aria-label") !== "清空全部输入") b.setAttribute("aria-label", "清空全部输入");
      } else if (t === "复制结果") {
        add(b, "xn-ticket-sec");
        if (b.getAttribute("aria-label") !== "复制计算结果") b.setAttribute("aria-label", "复制计算结果");
      } else if (!t && !b.getAttribute("aria-label")) {
        add(b, "xn-ticket-sec");
        b.setAttribute("aria-label", "复制计算结果（快捷）");
      }
    });
  }

  function markCards() {
    each(document.querySelectorAll("#root h2.xn-ticket-h2"), function (h) {
      var card = h.closest("article") || h.closest("section") || h.closest("div.rounded-xl") || (h.parentElement && h.parentElement.parentElement);
      if (card) add(card, "xn-ticket-card");
      each(card ? card.querySelectorAll("p") : [], function (p) {
        if (!vis(p)) return;
        if (clean(p.textContent).length < 10) return;
        if (parseFloat(getComputedStyle(p).fontSize) < 13.5) add(p, "xn-ticket-desc");
      });
    });
    // 结果卡
    each(document.querySelectorAll("#root div"), function (d) {
      if (!vis(d)) return;
      var p0 = d.querySelector(":scope > p");
      if (!p0 || clean(p0.textContent) !== "计算结果") return;
      add(d, "xn-ticket-result");
      each(d.querySelectorAll(":scope > div"), function (row) {
        if (String(row.className || "").indexOf("justify-between") < 0) return;
        add(row, "xn-ticket-row");
        var spans = row.querySelectorAll(":scope > span");
        if (spans.length < 2) return;
        var val = spans[spans.length - 1];
        var cls = String(val.className || "");
        if (/text-blue-600/.test(cls)) add(val, /人/.test(clean(val.textContent)) ? "xn-ticket-per" : "xn-ticket-total");
      });
    });
    // 注释与页脚
    each(document.querySelectorAll("#root p, #root div"), function (e) {
      if (!vis(e) || e.children.length > 0) return;
      var t = clean(e.textContent);
      if (/仅作预算参考|退改规则|以景区/.test(t) && t.length > 8) add(e, "xn-ticket-note");
      if (/人类作者：/.test(t) || /本地计算/.test(t)) add(e, "xn-ticket-foot");
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "xn-ticket-top";
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
