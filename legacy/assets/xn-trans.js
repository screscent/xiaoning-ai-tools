/* 小凝工具站 · 转机时间与衔接增强 xn-trans v1
 * 能力：5 个工具标签 44h/aria-current/具名；隐藏「工具 N」徽标；h2 去⑤；
 *       开关补 role/aria-checked/语义名 + 44 热区；输入 52 + 常用值胶囊；
 *       复制结果 46 具名；结果明细 15/700、最短转机 22/800；回到顶部。
 * 注入：legacy/tbn7hlmk3t.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_TRANS__) return;
  window.__XN_TRANS__ = true;

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }
  function clean(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }

  /* ---------- 标题：去圈号 + 徽标 ---------- */
  function cleanHeads() {
    Array.prototype.forEach.call(document.querySelectorAll("#root h2"), function (h) {
      Array.prototype.forEach.call(h.childNodes, function (n) {
        if (n.nodeType !== 3) return;
        var t = n.nodeValue || "";
        var c = t.replace(/^\s*[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "").replace(/^\s*工具\s*\d+\s*/, "");
        if (c !== t) n.nodeValue = c;
      });
      Array.prototype.forEach.call(h.querySelectorAll("*"), function (el) {
        if (el.children.length) return;
        var t = el.textContent || "";
        var c = t.replace(/^\s*[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "").replace(/^\s*工具\s*\d+\s*/, "");
        if (c && c !== t) el.textContent = c;
      });
    });
    Array.prototype.forEach.call(document.querySelectorAll("#root span, #root div"), function (el) {
      if (el.children.length > 1) return;
      if (/^工具\s*\d+$/.test(clean(el.textContent))) {
        if (!el.classList.contains("xn-trans-badge")) el.classList.add("xn-trans-badge");
      }
    });
  }

  /* ---------- 标签 ---------- */
  function markTabs() {
    var links = Array.prototype.filter.call(document.querySelectorAll("#root nav a"), function (a) {
      return vis(a) && a.getAttribute("href") && a.getAttribute("href").indexOf("#/") === 0;
    });
    if (!links.length) return;
    var hash = location.hash || "";
    var active = null;
    links.forEach(function (a) {
      if (!a.classList.contains("xn-trans-tab")) a.classList.add("xn-trans-tab");
      if (hash && a.getAttribute("href") === hash) active = a;
    });
    if (!active && !hash) active = links[0];
    links.forEach(function (a) {
      if (a === active) {
        if (a.getAttribute("aria-current") !== "page") a.setAttribute("aria-current", "page");
      } else if (a.hasAttribute("aria-current")) {
        a.removeAttribute("aria-current");
      }
      var name = clean(a.textContent);
      if (name && a.getAttribute("aria-label") !== name) a.setAttribute("aria-label", name);
    });
  }

  function currentTitle() {
    var h2 = Array.prototype.find.call(document.querySelectorAll("#root h2"), function (h) {
      return vis(h) && !/使用说明/.test(h.textContent);
    });
    return h2 ? clean(h2.textContent) : "";
  }

  /* ---------- 开关：语义名取本行标题 ---------- */
  function rowTitle(btn) {
    var prev = btn.previousElementSibling;
    if (prev) {
      var walker = document.createTreeWalker(prev, NodeFilter.SHOW_TEXT, null);
      var n;
      while ((n = walker.nextNode())) {
        var v = clean(n.nodeValue);
        if (v) return v;
      }
    }
    var row = btn.parentElement;
    for (var k = 0; k < 2 && row; k++) {
      var first = row.querySelector("p, h3, h4, span");
      if (first && clean(first.textContent) && !first.contains(btn) && !first.querySelector("button")) return clean(first.textContent);
      row = row.parentElement;
    }
    return "";
  }

  function markSwitches() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      if (b.getBoundingClientRect().height > 40) return;
      if (clean(b.textContent)) return;
      if (!b.querySelector("span") && !/rounded-full/.test(String(b.className))) return;
      if (!b.classList.contains("xn-trans-switch")) b.classList.add("xn-trans-switch");
      var name = rowTitle(b);
      if (name && b.getAttribute("aria-label") !== name) b.setAttribute("aria-label", name + "（拨动开关）");
      if (!b.hasAttribute("role")) b.setAttribute("role", "switch");
      if (!b.hasAttribute("aria-checked")) {
        var on = /bg-(indigo|blue|sky|teal|violet)-\d00/.test(String(b.className)) || /#(4f46e5|2563eb|0ea5e9|14b8a6)/i.test(String(b.className));
        if (!on) {
          var bg = getComputedStyle(b).backgroundColor;
          on = /rgb\((79, 70, 229|37, 99, 235|14, 165, 233|20, 184, 166)\)/.test(bg);
        }
        b.setAttribute("aria-checked", on ? "true" : "false");
      }
      var rowEl = b.closest("div");
      if (rowEl && !rowEl.classList.contains("xn-trans-row")) rowEl.classList.add("xn-trans-row");
    });
  }

  /* ---------- 输入 ---------- */
  var FIELDS = [
    { key: "行李直挂", items: [{ aria: "转机时长（分钟）", quick: [60, 90, 120, 180] }] },
    { key: "安全余量", items: [
      { aria: "摆渡时间（分钟）", quick: [0, 10, 20, 30] },
      { aria: "计划衔接时间（分钟）", quick: [60, 90, 120, 150] }
    ] }
  ];

  function fieldsFor(title) {
    var out = null;
    FIELDS.forEach(function (m) {
      if (!out && title.indexOf(m.key) >= 0) out = m.items;
    });
    return out;
  }

  function nativeSet(el, v) {
    var desc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    if (desc && desc.set) desc.set.call(el, v);
    else el.value = v;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function markInputs() {
    var items = fieldsFor(currentTitle());
    if (!items) return;
    var inputs = Array.prototype.filter.call(document.querySelectorAll("#root input"), vis);
    inputs.forEach(function (input, idx) {
      var item = items[idx];
      if (!item) return;
      if (input.getAttribute("aria-label") !== item.aria) input.setAttribute("aria-label", item.aria);
      var host = input.parentElement;
      if (!host) return;
      var mark = "xn-trans-q-" + idx;
      if (host.querySelector(':scope > .xn-trans-qrow[data-for="' + mark + '"]')) return;
      var old = host.querySelector(":scope > .xn-trans-qrow");
      if (old) old.parentElement.removeChild(old);
      var row = document.createElement("div");
      row.className = "xn-trans-qrow";
      (item.quick || []).forEach(function (q) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "xn-trans-q";
        b.textContent = String(q);
        b.setAttribute("aria-label", "填入 " + q + "（" + item.aria + "）");
        b.addEventListener("click", function (e) {
          e.preventDefault();
          nativeSet(input, String(q));
          input.focus();
        });
        row.appendChild(b);
      });
      row.setAttribute("data-for", mark);
      if (input.nextSibling) host.insertBefore(row, input.nextSibling);
      else host.appendChild(row);
    });
  }

  /* ---------- 按钮 ---------- */
  function markButtons() {
    var title = currentTitle();
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      if (clean(b.textContent) !== "一键复制结果") return;
      if (!b.classList.contains("xn-trans-primary")) b.classList.add("xn-trans-primary");
      var aria = "复制" + (title || "当前") + "结果";
      if (b.getAttribute("aria-label") !== aria) b.setAttribute("aria-label", aria);
      if (!b.title) b.title = aria;
    });
  }

  /* ---------- 结果 ---------- */
  function markResults() {
    Array.prototype.forEach.call(document.querySelectorAll("#root *"), function (el) {
      if (el.children.length > 2) return;
      var t = clean(el.textContent).replace(/\s+/g, "");
      if (!/^\d+分钟$/.test(t)) return;
      if (el.closest("button") || el.closest("label")) return;
      var fs = parseFloat(getComputedStyle(el).fontSize) || 0;
      var cls = fs >= 17 ? "xn-trans-total" : "xn-trans-val";
      if (!el.classList.contains(cls)) el.classList.add(cls);
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "xn-trans-top";
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
      markSwitches();
      markInputs();
      markButtons();
      markResults();
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
  window.addEventListener("hashchange", tick);
  document.addEventListener("click", function () { window.setTimeout(tick, 200); }, true);

  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    window.setTimeout(function () { pending = false; tick(); }, 120);
  }
  var mo = new MutationObserver(schedule);
  mo.observe(document.body, { childList: true, subtree: true, characterData: true });
  window.setInterval(tick, 1000);

  window.addEventListener("scroll", function () {
    if (!topBtn) return;
    if (window.scrollY > 620) topBtn.classList.add("is-on");
    else topBtn.classList.remove("is-on");
  }, { passive: true });
})();
