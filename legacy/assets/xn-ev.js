/* 小凝工具站 · 新能源车续航与车险增强 xn-ev v1
 * 能力：2 工具标签 37→44h 去①②/aria-current/具名；h2 去① 19；
 *       5+4 个 number 52/22 隐藏 spinner + 分字段胶囊；气温 48；
 *       开/关、是/否 分段 44h + role=group/aria-pressed/具名；
 *       开始估算 52/17、估算保费 52/17、复制/清空 46 具名；
 *       460.00 38/800、电价三档 22/800、明细 15/700、够用/补能徽标、总保费 30/800；
 *       结果卡 16px 圆角 + 数字徽标；回到顶部。
 * 注入：legacy/fr2qywgsra.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_EV__) return;
  window.__XN_EV__ = true;

  function vis(el) { return el && el.getBoundingClientRect().height > 0; }
  function clean(t) { return (t || "").replace(/\s+/g, " ").trim(); }
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }
  function add(el, cls) { if (el && !el.classList.contains(cls)) el.classList.add(cls); }
  var CIRC = /^[①②③④⑤⑥⑦⑧⑨⑩]\s*/;

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
    var tabs = [];
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (!/续航费用|车险保费/.test(t)) return;
      if (b.closest(".xn-ev-seg")) return;
      if (b.getBoundingClientRect().height > 70) return;
      tabs.push(b);
    });
    tabs.forEach(function (b, i) {
      add(b, "xn-ev-tab");
      // 去掉 ①② 前缀
      each(b.childNodes, function (n) {
        if (n.nodeType !== 3) return;
        var c = (n.nodeValue || "").replace(CIRC, "");
        if (c !== n.nodeValue) n.nodeValue = c;
      });
      each(b.querySelectorAll("span"), function (s) {
        if (!s.children.length) {
          var c = clean(s.textContent).replace(CIRC, "");
          if (c !== clean(s.textContent)) s.textContent = c;
        }
      });
      var on = /bg-blue-500/.test(String(b.className || ""));
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

  var RULES = [
    { key: "电池容量", aria: "电池容量（kWh）", quick: [40, 60, 80, 100] },
    { key: "官方续航", aria: "官方续航（km）", quick: [400, 500, 600, 700] },
    { key: "电价", aria: "电价（元/kWh）", quick: [0.3, 0.6, 1.2] },
    { key: "充电损耗", aria: "充电损耗（%）", quick: [5, 10, 15] },
    { key: "计划里程", aria: "本次计划里程（km）", quick: [100, 200, 300, 500] },
    { key: "车辆价格", aria: "车辆价格（万元）", quick: [10, 15, 20, 30] },
    { key: "车龄", aria: "车龄（年）", quick: [1, 3, 5] },
    { key: "座位数", aria: "座位数（个）", quick: [5, 6, 7] },
    { key: "出险", aria: "上年出险次数（次）", quick: [0, 1, 2] }
  ];

  function markInputs() {
    each(document.querySelectorAll("#root input"), function (input) {
      if (!vis(input) || input.type !== "number") return;
      var ariaNow = input.getAttribute("aria-label") || "";
      var rule = null;
      RULES.forEach(function (r) { if (!rule && ariaNow.indexOf(r.key) >= 0) rule = r; });
      if (!rule) return;
      if (input.getAttribute("aria-label") !== rule.aria) input.setAttribute("aria-label", rule.aria);
      var host = input.parentElement;
      if (!host || host.querySelector(":scope > .xn-ev-qrow")) return;
      var row = document.createElement("div");
      row.className = "xn-ev-qrow";
      rule.quick.forEach(function (q) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "xn-ev-q";
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
    each(document.querySelectorAll("#root select"), function (s) {
      if (!vis(s)) return;
      if (!s.getAttribute("aria-label")) s.setAttribute("aria-label", "气温场景");
    });
  }

  function markSegments() {
    each(document.querySelectorAll("#root div"), function (d) {
      var cls = String(d.className || "");
      if (cls.indexOf("rounded-lg") < 0 || cls.indexOf("overflow-hidden") < 0) return;
      if (!/^flex/.test(cls)) return;
      var btns = d.querySelectorAll(":scope > button");
      if (btns.length !== 2) return;
      add(d, "xn-ev-seg");
      var label = d.parentElement && d.parentElement.querySelector("label");
      var name = clean(label && label.textContent) || "选项";
      if (d.getAttribute("role") !== "group") d.setAttribute("role", "group");
      if (d.getAttribute("aria-label") !== name) d.setAttribute("aria-label", name);
      each(btns, function (b) {
        var on = /bg-blue-500/.test(String(b.className || ""));
        b.setAttribute("aria-pressed", on ? "true" : "false");
        var t = clean(b.textContent);
        var aria = name + "：" + t;
        if (b.getAttribute("aria-label") !== aria) b.setAttribute("aria-label", aria);
        if (!b.title) b.title = aria;
      });
    });
  }

  function markButtons() {
    var onInsurance = /车险保费/.test(clean((document.querySelector("#root h2") || {}).textContent || "")) ||
      !!document.querySelector("#root h2#tool-insurance") ||
      /#\/insurance/.test(location.hash);
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (t === "开始估算") {
        add(b, "xn-ev-go");
        if (b.getAttribute("aria-label") !== "开始估算续航与费用") b.setAttribute("aria-label", "开始估算续航与费用");
      } else if (t === "估算保费") {
        add(b, "xn-ev-go");
        if (b.getAttribute("aria-label") !== "估算车险保费") b.setAttribute("aria-label", "估算车险保费");
      } else if (t === "复制估算结果") {
        add(b, "xn-ev-sec");
        var aria = onInsurance ? "复制车险保费结果" : "复制续航费用估算结果";
        if (b.getAttribute("aria-label") !== aria) b.setAttribute("aria-label", aria);
      } else if (t === "清空") {
        add(b, "xn-ev-sec");
        add(b, "xn-ev-sec-ghost");
        if (b.getAttribute("aria-label") !== "清空全部输入") b.setAttribute("aria-label", "清空全部输入");
      }
    });
  }

  function markCards() {
    each(document.querySelectorAll("#root div.bg-white.rounded-xl"), function (c) {
      if (!vis(c)) return;
      if (!c.querySelector("h2,h3")) return;
      add(c, "xn-ev-card");
    });
    each(document.querySelectorAll("#root h3"), function (h) {
      if (!vis(h)) return;
      each(h.querySelectorAll("span"), function (s) {
        var cls = String(s.className || "");
        if (/w-5/.test(cls) && /h-5/.test(cls) && /rounded/.test(cls)) add(s, "xn-ev-no");
      });
    });
    // 使用说明
    each(document.querySelectorAll("#root details"), function (d) {
      if (vis(d) && /使用说明/.test(d.textContent)) add(d, "xn-ev-sum");
    });
  }

  function markResult() {
    each(document.querySelectorAll("#root span.text-2xl"), function (s) {
      if (vis(s)) add(s, "xn-ev-big");
    });
    each(document.querySelectorAll("#root div.text-center"), function (d) {
      var cls = String(d.className || "");
      if (cls.indexOf("rounded-lg") < 0 || cls.indexOf("border") < 0) return;
      if (!vis(d)) return;
      add(d, "xn-ev-pricecard");
      if (cls.indexOf("border-blue-400") >= 0) add(d, "is-on");
      each(d.querySelectorAll("div"), function (v) {
        if (String(v.className || "").indexOf("text-base") >= 0) add(v, "xn-ev-price");
      });
    });
    each(document.querySelectorAll("#root div"), function (d) {
      var cls = String(d.className || "");
      if (cls.indexOf("justify-between") < 0 || cls.indexOf("items-baseline") < 0) return;
      if (!vis(d)) return;
      add(d, "xn-ev-row");
      var first = d.querySelector(":scope > span:first-child");
      var label = clean(first && first.textContent);
      if (/总保费|合计/.test(label)) add(d, "xn-ev-total");
    });
    each(document.querySelectorAll("#root p, #root div, #root span"), function (e) {
      if (!vis(e) || e.children.length > 0) return;
      var t = clean(e.textContent);
      var fs = parseFloat(getComputedStyle(e).fontSize) || 14;
      if (fs <= 13.5 && t.indexOf("×") >= 0 && t.indexOf("=") >= 0 && t.length < 80) add(e, "xn-ev-formula");
      if (t === "够用") { add(e, "xn-ev-chip"); e.setAttribute("data-tone", "ok"); }
      if (t === "需要补能") { add(e, "xn-ev-chip"); e.setAttribute("data-tone", "warn"); }
      if (/相对官方续航|说明：按|仅供参考|实际受/.test(t) && t.length > 12) add(e, "xn-ev-note");
    });
    each(document.querySelectorAll("#root div"), function (d) {
      var cls = String(d.className || "");
      if (cls.indexOf("bg-amber-50") >= 0 && vis(d)) add(d, "xn-ev-warn");
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "xn-ev-top";
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
      markSegments();
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
