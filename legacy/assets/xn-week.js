/* 小凝工具站 · 周数与周计划增强 xn-week v1
 * 能力：修复工具卡双井号链接（##/iso → #/iso）；卡片 01–06 编号 + aria-current/aria-label；
 *      区块标题「工具一 · …」；日期输入 16px；复制 44h + aria；周号/区间/信息字号分层。
 * 注入：legacy/j2tnfgxyyi.html 的 </body> 前追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_WEEK__) return;
  window.__XN_WEEK__ = true;

  var CN = ["一", "二", "三", "四", "五", "六", "七", "八"];

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  function cards() {
    return Array.prototype.filter.call(document.querySelectorAll('#root a[href*="#/"]'), vis);
  }

  function fixHrefs() {
    cards().forEach(function (a) {
      var h = a.getAttribute("href") || "";
      if (h.indexOf("##/") === 0) a.setAttribute("href", h.slice(1));
    });
  }

  function activeIdx(list) {
    for (var i = 0; i < list.length; i++) {
      if (/(^|\s)border-blue-500(\s|$)/.test(list[i].className)) return i;
    }
    return 0;
  }

  function markCards() {
    var list = cards();
    if (!list.length) return;
    var idx = activeIdx(list);
    list.forEach(function (a, i) {
      var no = String(i + 1).padStart(2, "0");
      var badge = a.querySelector(".xn-wk-no");
      if (!badge) {
        badge = document.createElement("b");
        badge.className = "xn-wk-no";
        a.insertBefore(badge, a.firstChild);
      }
      if (badge.textContent !== no) badge.textContent = no;
      var nameEl = a.querySelector("span");
      var name = nameEl ? (nameEl.textContent || "").trim() : "";
      var label = "切换到工具" + CN[i] + "：" + (name || "工具" + CN[i]) + (i === idx ? "（当前）" : "");
      if (a.getAttribute("aria-label") !== label) a.setAttribute("aria-label", label);
      var cur = i === idx ? "true" : "false";
      if (a.getAttribute("aria-current") !== cur) a.setAttribute("aria-current", cur);
    });
  }

  function markH2() {
    var h2 = document.querySelector("#root h2");
    if (!h2 || !vis(h2)) return;
    var base = (h2.textContent || "").trim()
      .replace(/^工具[A-Z]\s*/, "")
      .replace(/^工具[一二三四五六七八]\s*[·:：]?\s*/, "");
    var want = "工具" + CN[activeIdx(cards())] + " · " + base;
    if ((h2.textContent || "").trim() !== want) h2.textContent = want;
  }

  function markControls() {
    Array.prototype.forEach.call(document.querySelectorAll("#root input"), function (inp) {
      var type = inp.getAttribute("type");
      if (!type || /^(text|search|url|email|tel|number|date|time)$/.test(type)) inp.classList.add("xn-wk-inp");
    });
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = (b.textContent || "").replace(/\s+/g, "").trim();
      if (/^复制/.test(t)) {
        b.classList.add("xn-wk-copy");
        if (b.getAttribute("aria-label") !== t) b.setAttribute("aria-label", t);
      }
    });
  }

  function markNumbers() {
    Array.prototype.forEach.call(document.querySelectorAll("#root p, #root div, #root span"), function (el) {
      if (el.children.length) return;
      var t = (el.textContent || "").trim();
      if (/^\d{4}-W\d{1,2}$/.test(t)) el.classList.add("xn-wk-big");
      else if (/^\d{4}-\d{2}-\d{2}\s*~\s*\d{4}-\d{2}-\d{2}$/.test(t)) el.classList.add("xn-wk-range");
      else if (/^\d{4} 年 第 \d+ 周/.test(t)) el.classList.add("xn-wk-info");
    });
  }

  function tick() {
    try {
      fixHrefs();
      markCards();
      markH2();
      markControls();
      markNumbers();
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
