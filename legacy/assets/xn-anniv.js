/* 小凝工具站 · 纪念日与提醒清单增强 xn-anniv v1
 * 能力：6 个标签 44h + 01–06 + aria-pressed/aria-label；标题「工具一 · …」并清「工具E/F」；
 *      文本域 16px；日期/文本 48/16；主操作与复制 44h + aria；复选框 20px。
 * 注入：legacy/nyi2whpkdd.html 的 </body> 前追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_ANNIV__) return;
  window.__XN_ANNIV__ = true;

  var CN = ["一", "二", "三", "四", "五", "六", "七", "八"];
  var NAMES = ["倒计时", "提醒", "周年", "礼物", "周期提醒", "年度日历"];

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  function tabs() {
    return Array.prototype.filter.call(document.querySelectorAll("#root button"), function (b) {
      return vis(b) && /^(倒计时|提醒|周年|礼物|周期提醒|年度日历)$/.test((b.textContent || "").trim());
    });
  }

  function activeIdx(list) {
    for (var i = 0; i < list.length; i++) {
      if (/(^|\s)bg-blue-600(\s|$)/.test(list[i].className)) return i;
    }
    return 0;
  }

  function markTabs() {
    var list = tabs();
    if (!list.length) return;
    var idx = activeIdx(list);
    list.forEach(function (b, i) {
      b.classList.add("xn-an-tab");
      var no = String(i + 1).padStart(2, "0");
      if (b.getAttribute("data-no") !== no) b.setAttribute("data-no", no);
      var cur = i === idx ? "true" : "false";
      if (b.getAttribute("aria-pressed") !== cur) b.setAttribute("aria-pressed", cur);
      var label = "切换到工具" + CN[i] + "：" + NAMES[i] + (i === idx ? "（当前）" : "");
      if (b.getAttribute("aria-label") !== label) b.setAttribute("aria-label", label);
    });
  }

  function markH2() {
    var h2 = document.querySelector("#root h2");
    if (!h2 || !vis(h2)) return;
    var raw = (h2.textContent || "").trim();
    var base = raw.replace(/^工具[A-Z]\s*/, "").replace(/^工具[一二三四五六七八]\s*[·:：]?\s*/, "");
    var want = "工具" + CN[activeIdx(tabs())] + " · " + base;
    if (raw !== want) h2.textContent = want;
  }

  function markInputs() {
    Array.prototype.forEach.call(document.querySelectorAll("#root input"), function (inp) {
      var type = inp.getAttribute("type");
      if (!type || /^(text|search|url|email|tel|date|time)$/.test(type)) inp.classList.add("xn-an-inp");
    });
  }

  function markButtons() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      if (b.classList.contains("xn-an-tab")) return;
      var t = (b.textContent || "").replace(/\s+/g, "").trim();
      if (!t) return;
      if (/^复制/.test(t)) {
        b.classList.add("xn-an-copy");
        if (b.getAttribute("aria-label") !== t) b.setAttribute("aria-label", t);
        return;
      }
      if (/^(添加|新增|生成|计算|开始|保存)/.test(t)) {
        b.classList.add("xn-an-run");
        if (b.getAttribute("aria-label") !== t) b.setAttribute("aria-label", t);
      }
    });
  }

  function tick() {
    try {
      markTabs();
      markH2();
      markInputs();
      markButtons();
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

  /* 点击标签后立即重算标题，避免滞后 */
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (t && t.closest && t.closest("#root button")) window.setTimeout(tick, 30);
  }, true);

  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    window.setTimeout(function () {
      pending = false;
      tick();
    }, 60);
  }
  var mo = new MutationObserver(schedule);
  mo.observe(document.body, { childList: true, subtree: true });
  window.setInterval(tick, 800);
})();
