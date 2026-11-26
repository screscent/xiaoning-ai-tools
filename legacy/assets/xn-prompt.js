/* 小凝工具站 · 提示词与上下文计算增强 xn-prompt v1
 * 能力：6 标签 46h/aria-current/具名；h2 修「工具A-F」占位并按路由给正确标题；
 *       textarea 180/16、数字 52/22/800、下拉 50；计算 50/16、复制 46；
 *       结果数字 34/16/13.5 分档；卡片/说明/回到顶部。
 * 注入：legacy/c7xbcvegmi.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_PROMPT__) return;
  window.__XN_PROMPT__ = true;
  function vis(el) { return el && el.getBoundingClientRect().height > 0; }
  function clean(t) { return (t || "").replace(/\s+/g, " ").trim(); }
  function each(l, f) { Array.prototype.forEach.call(l, f); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function setA(el, v) { if (el.getAttribute("aria-label") !== v) el.setAttribute("aria-label", v); }

  var TITLES = {
    "token": "Token 字数估算",
    "context": "上下文窗口规划",
    "sampling": "采样参数与成本",
    "cache": "提示词缓存",
    "eval": "提示词评测",
    "guard": "提示词安全防护"
  };
  var TABS = ["Token 估算", "上下文规划", "采样成本", "提示词缓存", "提示词评测", "提示词安全"];

  function key() {
    var h = location.hash.replace(/^#\//, "").replace(/\/.*$/, "");
    return TITLES[h] ? h : "token";
  }

  function markHeads() {
    var k = key();
    each(document.querySelectorAll("#root h2"), function (h) {
      if (!vis(h)) return;
      var t = clean(h.textContent);
      var want = TITLES[k];
      if (want && /^工具[A-F]\b/.test(t)) {
        if (clean(h.textContent) !== want) h.textContent = want;
      } else if (/^工具[A-F]\s+/.test(t)) {
        h.textContent = t.replace(/^工具[A-F]\s+/, "");
      }
      add(h, "xn-pm-h2");
      var card = h.closest('section, div[class*="bg-white"]');
      if (card) add(card, "xn-pm-card");
    });
    each(document.querySelectorAll("#root h3"), function (h) {
      if (vis(h)) add(h, "xn-pm-h2");
    });
  }

  function markTabs() {
    var k = key();
    each(document.querySelectorAll("#root a"), function (a) {
      if (!vis(a)) return;
      var t = clean(a.textContent);
      if (TABS.indexOf(t) < 0) return;
      add(a, "xn-pm-tab");
      var box = a.parentElement;
      if (box) {
        add(box, "xn-pm-tabs");
        var cols = window.matchMedia("(max-width: 639px)").matches ? "repeat(2, minmax(0,1fr))" : "repeat(6, minmax(0,1fr))";
        box.style.setProperty("display", "grid", "important");
        box.style.setProperty("grid-template-columns", cols, "important");
      }
      setA(a, "切换到：" + t + "（工具 " + (TABS.indexOf(t) + 1) + "）");
      var href = a.getAttribute("href") || "";
      var hk = href.replace(/^#\//, "");
      if (hk === k) { if (a.getAttribute("aria-current") !== "page") a.setAttribute("aria-current", "page"); }
      else if (a.hasAttribute("aria-current")) a.removeAttribute("aria-current");
    });
  }

  function markInputs() {
    each(document.querySelectorAll("#root textarea"), function (t) {
      if (vis(t)) add(t, "xn-pm-text");
    });
    each(document.querySelectorAll("#root input"), function (x) {
      if (!vis(x) || x.type !== "number") return;
      add(x, "xn-pm-num");
      var a = clean(x.getAttribute("aria-label"));
      if (a) setA(x, a);
    });
    each(document.querySelectorAll("#root select"), function (s) {
      if (!vis(s)) return;
      add(s, "xn-pm-select");
      var n = clean(s.getAttribute("aria-label"));
      if (n) setA(s, n);
    });
  }

  function markButtons() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (t === "计算") {
        add(b, "xn-pm-go"); setA(b, "开始计算");
      } else if (t === "复制结果") {
        add(b, "xn-pm-btn"); setA(b, "复制计算结果");
      }
    });
  }

  function markNumbers() {
    each(document.querySelectorAll("#root div, #root span"), function (e) {
      if (!vis(e) || e.children.length) return;
      var t = clean(e.textContent);
      if (!/^[\d.,]+%?$/.test(t)) return;
      var fs = parseFloat(getComputedStyle(e).fontSize);
      if (fs >= 24) add(e, "xn-pm-big");
      else if (fs >= 15) add(e, "xn-pm-mid");
      else if (fs >= 11) add(e, "xn-pm-mini");
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button"; topBtn.className = "xn-pm-top";
    topBtn.setAttribute("aria-label", "回到顶部"); topBtn.title = "回到顶部"; topBtn.textContent = "↑";
    topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    document.body.appendChild(topBtn);
  }

  function tick() { try { markHeads(); markTabs(); markInputs(); markButtons(); markNumbers(); ensureTop(); } catch (e) {} }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", tick, { once: true }); else tick();
  window.setTimeout(tick, 900); window.setTimeout(tick, 2200); window.setInterval(tick, 1000);
  document.addEventListener("click", function () { window.setTimeout(tick, 200); }, true);
  window.addEventListener("hashchange", function () { window.setTimeout(tick, 120); });
  var pending = false;
  function schedule() { if (pending) return; pending = true; window.setTimeout(function () { pending = false; tick(); }, 120); }
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
  window.addEventListener("scroll", function () { if (!topBtn) return; if (window.scrollY > 620) topBtn.classList.add("is-on"); else topBtn.classList.remove("is-on"); }, { passive: true });
})();
