/* 小凝工具站 · 世界时钟增强 xn-tz v1
 * 能力：标签 01–06 编号 + aria-pressed；标题「工具一 · …」并清除「工具F」残留；
 *      城市 chip aria-pressed；复制/解读按钮可点区与 aria；输入下拉打标；时钟卡深色仪表盘打标。
 * 注入：legacy/r3avkczjyr.html 的 </body> 前追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_TZ__) return;
  window.__XN_TZ__ = true;

  var CN = ["一", "二", "三", "四", "五", "六", "七", "八"];
  var NAMES = ["多城时钟", "时差", "夏令时", "会议", "时间戳与时区互转", "日出日落"];

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  function tabBtns() {
    var wrap = document.querySelector("#root nav.flex.gap-2.overflow-x-auto.pb-1");
    return wrap ? Array.prototype.filter.call(wrap.children, vis) : [];
  }

  function currentIdx(list) {
    for (var i = 0; i < list.length; i++) {
      if (/(^|\s)bg-blue-500(\s|$)/.test(list[i].className)) return i;
    }
    var h2 = document.querySelector("#root h2");
    var t = h2 ? (h2.textContent || "").trim() : "";
    for (var j = 0; j < NAMES.length; j++) {
      if (t.indexOf(NAMES[j]) >= 0) return j;
    }
    return 0;
  }

  function markTabs() {
    var list = tabBtns();
    if (!list.length) return;
    var idx = currentIdx(list);
    list.forEach(function (b, i) {
      var no = String(i + 1).padStart(2, "0");
      if (b.getAttribute("data-no") !== no) b.setAttribute("data-no", no);
      var name = (b.textContent || "").trim() || NAMES[i] || "工具" + CN[i];
      var label = "切换到工具" + CN[i] + "：" + name + (i === idx ? "（当前）" : "");
      if (b.getAttribute("aria-label") !== label) b.setAttribute("aria-label", label);
      var cur = i === idx ? "true" : "false";
      if (b.getAttribute("aria-pressed") !== cur) b.setAttribute("aria-pressed", cur);
    });
  }

  function markH2() {
    var h2 = document.querySelector("#root h2");
    if (!h2 || !vis(h2)) return;
    var raw = (h2.textContent || "").trim();
    var base = raw.replace(/^工具[A-Z]\s*/, "").replace(/^工具[一二三四五六七八]\s*[·:：]?\s*/, "");
    var idx = currentIdx(tabBtns());
    var want = "工具" + CN[idx] + " · " + base;
    if (raw !== want) h2.textContent = want;
  }

  function markCityChips() {
    Array.prototype.forEach.call(document.querySelectorAll("#root div.flex.flex-wrap.gap-2 > button"), function (b) {
      if (!vis(b)) return;
      var on = /(^|\s)bg-blue-50(\s|$)|text-blue-600/.test(b.className);
      var cur = on ? "true" : "false";
      if (b.getAttribute("aria-pressed") !== cur) b.setAttribute("aria-pressed", cur);
      var name = (b.textContent || "").trim();
      if (name) {
        var label = (on ? "取消城市：" : "添加城市：") + name;
        if (b.getAttribute("aria-label") !== label) b.setAttribute("aria-label", label);
      }
    });
  }

  function markButtons() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = (b.textContent || "").replace(/\s+/g, "").trim();
      if (/^复制/.test(t)) {
        b.classList.add("xn-tz-copy");
        if (b.getAttribute("aria-label") !== t) b.setAttribute("aria-label", t);
        return;
      }
      if (/^(自动识别|按秒解读|按毫秒解读)$/.test(t)) {
        b.classList.add("xn-tz-seg");
        var on = /bg-blue-500|text-white/.test(b.className);
        if (b.getAttribute("aria-pressed") !== (on ? "true" : "false")) b.setAttribute("aria-pressed", on ? "true" : "false");
        if (b.getAttribute("aria-label") !== t) b.setAttribute("aria-label", t);
      }
    });
  }

  function markInputs() {
    Array.prototype.forEach.call(document.querySelectorAll("#root input"), function (inp) {
      var type = inp.getAttribute("type");
      if (!type || /^(text|search|url|email|tel|number|date|time|datetime-local)$/.test(type)) inp.classList.add("xn-tz-inp");
    });
    Array.prototype.forEach.call(document.querySelectorAll("#root select"), function (s) {
      s.classList.add("xn-tz-sel");
    });
  }

  function markCards() {
    Array.prototype.forEach.call(document.querySelectorAll("#root p.tabular-nums"), function (p) {
      var card = p.closest("div.rounded-xl, div.rounded-lg");
      if (!card) return;
      card.classList.add("xn-tz-card");
      var head = card.querySelector("div.flex.items-center.justify-between");
      if (head && head.firstElementChild) head.firstElementChild.classList.add("xn-tz-city");
      Array.prototype.forEach.call(card.querySelectorAll("p, span"), function (el) {
        if (el.children.length) return;
        var t = (el.textContent || "").trim();
        if (/^UTC[+-]/.test(t)) el.classList.add("xn-tz-meta");
        else if (/^\d{4}\/\d{1,2}\/\d{1,2}/.test(t) || /^\d{1,2}\/\d{1,2}\/\d{4}/.test(t)) el.classList.add("xn-tz-date");
      });
    });
  }

  function tick() {
    try {
      markTabs();
      markH2();
      markCityChips();
      markButtons();
      markInputs();
      markCards();
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
