/* 小凝工具站 · 编号与缩进合集增强 xn-indent v1
 * 能力：工具卡去掉裸露路由串、改 01–06 编号 + aria-label；区块标题「工具一 · …」并清「工具E/F」；
 *      下拉 16px；主按钮/复制/清空 44h；开关整行可点。
 * 注入：legacy/kezy8adudk.html 的 </body> 前追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_INDENT__) return;
  window.__XN_INDENT__ = true;

  var CN = ["一", "二", "三", "四", "五", "六", "七", "八"];

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  function cards() {
    var nav = document.querySelector('#root nav[class*="grid-cols-2"]');
    return nav ? Array.prototype.filter.call(nav.querySelectorAll('a[href^="#/"]'), vis) : [];
  }

  function markCards() {
    var list = cards();
    var hash = location.hash.replace(/\?.*$/, "");
    list.forEach(function (a, i) {
      var no = String(i + 1).padStart(2, "0");
      var first = a.firstElementChild;
      if (first && first.tagName === "SPAN") {
        var t = (first.textContent || "").replace(/\u00a0/g, " ").trim();
        /* 原文本形如「1. #/number」，替换为纯编号 */
        if (/^[\d.、]+\s*#\//.test(t) || /#\//.test(t)) {
          if (first.textContent.trim() !== no) first.textContent = no;
        }
      }
      var nameEl = a.querySelector("span:nth-child(2)") || a.children[1];
      var name = nameEl ? (nameEl.textContent || "").trim() : "";
      var label = "前往工具" + CN[i] + "：" + (name || "工具" + CN[i]);
      if (a.getAttribute("aria-label") !== label) a.setAttribute("aria-label", label);
      var cur = a.getAttribute("href") === hash ? "true" : "false";
      if (a.getAttribute("aria-current") !== cur) a.setAttribute("aria-current", cur);
    });
  }

  function markSections() {
    /* 区域标签 */
    Array.prototype.forEach.call(document.querySelectorAll("#root h2"), function (h) {
      var t = (h.textContent || "").trim();
      if (t === "选择要用的工具") {
        h.classList.add("xn-id-picker");
        return;
      }
      if (!vis(h)) return;
      /* 工具区块标题：text-base + font-semibold */
      if (!/(^|\s)text-base(\s|$)/.test(h.className) || !/(^|\s)font-semibold(\s|$)/.test(h.className)) return;
      h.classList.add("xn-id-h2");
      var base = t.replace(/^工具[A-Z]\s*/, "").replace(/^工具[一二三四五六七八]\s*[·:：]?\s*/, "");
      var idx = Array.prototype.indexOf.call(document.querySelectorAll("#root h2.xn-id-h2"), h);
      if (idx < 0) idx = 0;
      var want = "工具" + CN[idx] + " · " + base;
      if (t !== want) h.textContent = want;
    });
  }

  function markControls() {
    Array.prototype.forEach.call(document.querySelectorAll("#root select"), function (s) {
      if (vis(s)) s.classList.add("xn-id-sel");
    });
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      if (b.getAttribute("role") === "switch") return;
      var t = (b.textContent || "").replace(/\s+/g, "").trim();
      if (t === "重新编号" || /^(重新编号|规范缩进|生成大纲|一键清理|换算|检查)$/.test(t)) {
        b.classList.add("xn-id-run");
        if (b.getAttribute("aria-label") !== t) b.setAttribute("aria-label", t);
        return;
      }
      if (/^复制/.test(t)) {
        b.classList.add("xn-id-copy");
        if (b.getAttribute("aria-label") !== t) b.setAttribute("aria-label", t);
        return;
      }
      if (t === "清空") {
        b.classList.add("xn-id-act");
        if (b.getAttribute("aria-label") !== t) b.setAttribute("aria-label", t);
      }
    });
    Array.prototype.forEach.call(document.querySelectorAll("#root label"), function (l) {
      if (!vis(l)) return;
      if (l.querySelector('button[role="switch"]')) l.classList.add("xn-id-toggle");
    });
  }

  function tick() {
    try {
      markCards();
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
  window.addEventListener("hashchange", tick);

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
