/* 小凝工具站 · 适老家合集增强 xn-elder v1
 * 能力：6 个工具标签 44→48h + aria-current/具名；清「工具D/E/F」占位；h2 22；
 *       10 个 number 54/24 隐藏 spinner + 常用值胶囊；6 个下拉 50；复制结果 36→48 具名；
 *       结果条目 15/1.85；表格 th13.5/td14.5/行 40；折叠说明 46h；页脚 12.5；回到顶部。
 * 注入：legacy/r3damkzjyr.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_ELDER__) return;
  window.__XN_ELDER__ = true;

  function vis(el) { return el && el.getBoundingClientRect().height > 0; }
  function clean(t) { return (t || "").replace(/\s+/g, " ").trim(); }
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }
  function add(el, cls) { if (el && !el.classList.contains(cls)) el.classList.add(cls); }

  function cleanHeads() {
    each(document.querySelectorAll("#root h2"), function (h) {
      var t = clean(h.textContent);
      var c = t.replace(/^工具\s*[A-Za-z]\s+/, "").replace(/^\s*[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "");
      if (c !== t) h.textContent = c;
      if (!/^使用说明$/.test(c)) add(h, "xn-elder-h2");
    });
    // 描述
    each(document.querySelectorAll("#root h2.xn-elder-h2"), function (h) {
      var p = h.nextElementSibling;
      if (p && p.tagName === "P") add(p, "xn-elder-desc");
    });
  }

  function markTabs() {
    var links = Array.prototype.filter.call(document.querySelectorAll("#root nav a"), vis);
    links.forEach(function (a, i) {
      add(a, "xn-elder-tab");
      var on = /bg-teal-700/.test(String(a.className || ""));
      if (on) {
        if (a.getAttribute("aria-current") !== "page") a.setAttribute("aria-current", "page");
      } else if (a.hasAttribute("aria-current")) {
        a.removeAttribute("aria-current");
      }
      var name = clean(a.textContent);
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
    { key: "身高", quick: [150, 160, 170, 180] },
    { key: "面积", quick: [3, 4, 5, 6] },
    { key: "起夜", quick: [1, 2, 3] },
    { key: "扶手数量", quick: [4, 6, 8, 10] },
    { key: "改造项数", quick: [1, 2, 3] },
    { key: "夜灯数量", quick: [2, 4, 6] },
    { key: "人工费", quick: [20, 30, 40] },
    { key: "门槛", quick: [10, 20, 30, 50] },
    { key: "预算", quick: [8000, 15000, 30000] },
    { key: "工期", quick: [7, 10, 15, 30] }
  ];

  function niceAria(a) {
    var m = clean(a).match(/^(.+?)单位：(.+)$/);
    return m ? m[1] + "（" + m[2] + "）" : clean(a);
  }

  function markInputs() {
    each(document.querySelectorAll("#root input"), function (input) {
      if (!vis(input) || input.type !== "number") return;
      var raw = input.getAttribute("aria-label") || "";
      var ariaNow = niceAria(raw);
      if (ariaNow && input.getAttribute("aria-label") !== ariaNow) input.setAttribute("aria-label", ariaNow);
      var rule = null;
      RULES.forEach(function (r) { if (!rule && ariaNow.indexOf(r.key) >= 0) rule = r; });
      if (!rule) return;
      var host = input.parentElement;
      if (!host || host.querySelector(":scope > .xn-elder-qrow")) return;
      var row = document.createElement("div");
      row.className = "xn-elder-qrow";
      rule.quick.forEach(function (q) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "xn-elder-q";
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
      if (clean(b.textContent) !== "复制结果") return;
      add(b, "xn-elder-copy");
      if (b.getAttribute("aria-label") !== "复制计算结果") b.setAttribute("aria-label", "复制计算结果");
    });
  }

  function markCards() {
    each(document.querySelectorAll("#root h2.xn-elder-h2"), function (h) {
      var card = h.closest("section") || h.parentElement;
      if (!card) return;
      add(card, "xn-elder-card");
      each(card.querySelectorAll("p"), function (p) {
        if (!vis(p)) return;
        if (p.closest(".xn-elder-result")) return;
        if (clean(p.textContent).length < 10) return;
        var fs = parseFloat(getComputedStyle(p).fontSize) || 14;
        if (fs < 15) add(p, "xn-elder-desc");
      });
    });
    // 结果卡
    each(document.querySelectorAll("#root button.xn-elder-copy"), function (b) {
      var row = b.parentElement;
      var box = row && row.parentElement;
      if (!box) return;
      if (box.textContent.indexOf("计算结果") < 0) return;
      add(box, "xn-elder-result");
    });
    // 表格
    each(document.querySelectorAll("#root table"), function (t) {
      if (vis(t)) add(t, "xn-elder-table");
    });
    // 折叠说明
    each(document.querySelectorAll("#root details"), function (d) {
      if (!vis(d)) return;
      if (!/计算口径|使用说明/.test(d.textContent)) return;
      add(d, "xn-elder-details");
      var s = d.querySelector("summary");
      if (s) add(s, "xn-elder-sum");
    });
    // 页脚
    each(document.querySelectorAll("#root div, #root p"), function (e) {
      if (!vis(e)) return;
      if (e.getBoundingClientRect().height > 110) return;
      var t = clean(e.textContent);
      if (/人类作者：|免责声明：/.test(t)) add(e, "xn-elder-foot");
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "xn-elder-top";
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
