/* 小凝工具站 · Base32 与编码校验增强 xn-b32 v1
 * 能力：导航卡路由串 #/encode 改为 01–06 编号 + aria-label；区块标题「工具一 · …」并清「工具E/F」；
 *      文本域 16px；下拉 48/16；大小写切换 44 + aria-pressed；复制 44 + aria；复选框 20px。
 * 注入：legacy/rdqkfj4t4r.html 的 </body> 前追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_B32__) return;
  window.__XN_B32__ = true;

  var CN = ["一", "二", "三", "四", "五", "六", "七", "八"];

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  function cards() {
    return Array.prototype.filter.call(document.querySelectorAll('#root a[href^="#/"]'), vis);
  }

  function markCards() {
    cards().forEach(function (a, i) {
      var no = String(i + 1).padStart(2, "0");
      var routeEl = null;
      Array.prototype.forEach.call(a.querySelectorAll("span, div, code, small"), function (el) {
        if (!el.children.length && /#\//.test(el.textContent || "")) routeEl = el;
      });
      if (!routeEl) {
        /* 已替换过时，回找形如 01 的编号元素 */
        for (var k = a.children.length - 1; k >= 0; k--) {
          var ch = a.children[k];
          if (!ch.children.length && /^\d{2}$/.test((ch.textContent || "").trim())) { routeEl = ch; break; }
        }
      }
      if (routeEl && (routeEl.textContent || "").trim() !== no) routeEl.textContent = no;
      var nameEl = routeEl ? routeEl.previousElementSibling : null;
      var name = nameEl ? (nameEl.textContent || "").trim() : "";
      if (!name) name = "工具" + CN[i];
      var label = "前往工具" + CN[i] + "：" + name;
      if (a.getAttribute("aria-label") !== label) a.setAttribute("aria-label", label);
    });
  }

  function markSections() {
    var h2s = Array.prototype.filter.call(document.querySelectorAll("#root h2"), vis);
    h2s.forEach(function (h, i) {
      h.classList.add("xn-b32-h2");
      var base = (h.textContent || "").trim()
        .replace(/^工具[A-Z]\s*/, "")
        .replace(/^工具[一二三四五六七八]\s*[·:：]?\s*/, "");
      var want = "工具" + CN[i] + " · " + base;
      if ((h.textContent || "").trim() !== want) h.textContent = want;
    });
  }

  function markControls() {
    Array.prototype.forEach.call(document.querySelectorAll("#root textarea"), function (t) {
      if (vis(t)) t.classList.add("xn-b32-area");
    });
    Array.prototype.forEach.call(document.querySelectorAll("#root select"), function (s) {
      if (vis(s)) s.classList.add("xn-b32-sel");
    });
    Array.prototype.forEach.call(document.querySelectorAll('#root input[type="checkbox"]'), function (c) {
      c.classList.add("xn-b32-check");
    });
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = (b.textContent || "").replace(/\s+/g, "").trim();
      if (/^(大写|小写)/.test(t)) {
        b.classList.add("xn-b32-case");
        var on = /(^|\s)text-blue-600(\s|$)/.test(b.className);
        if (b.getAttribute("aria-pressed") !== (on ? "true" : "false")) b.setAttribute("aria-pressed", on ? "true" : "false");
        if (b.getAttribute("aria-label") !== t) b.setAttribute("aria-label", t);
        return;
      }
      if (/^复制/.test(t)) {
        b.classList.add("xn-b32-copy");
        if (b.getAttribute("aria-label") !== t) b.setAttribute("aria-label", t);
      }
    });
  }

  function markRouteBadges() {
    Array.prototype.forEach.call(document.querySelectorAll("#root span, #root div, #root code"), function (el) {
      if (el.children.length) return;
      if (!/^#\/[a-z]+$/.test((el.textContent || "").trim())) return;
      if (el.closest('a[href^="#/"]')) return;
      el.classList.add("xn-b32-route");
    });
  }

  function tick() {
    try {
      markCards();
      markRouteBadges();
      markSections();
      markControls();
    } catch (e) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tick, { once: true });
  } else {
    tick();
  }
  window.setTimeout(tick, 900);
  window.setTimeout(tick, 2200);

  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    window.setTimeout(function () {
      pending = false;
      tick();
    }, 80);
  }
  var mo = new MutationObserver(schedule);
  mo.observe(document.body, { childList: true, subtree: true });
  window.setInterval(tick, 1200);
})();
