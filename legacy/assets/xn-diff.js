/* 小凝工具站 · 文本差异与合并增强 xn-diff v1
 * 能力：标签 01–06 编号 + aria-current；标题「工具一 · …」并清除「工具F」；
 *      textarea 16px；逐行/逐词 aria-pressed；交换/清空/开始/复制可点区与 aria；
 *      字符计数徽标；红绿结果行打标；复选框 20px。
 * 注入：legacy/wn3a9fj8gw.html 的 </body> 前追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_DIFF__) return;
  window.__XN_DIFF__ = true;

  var CN = ["一", "二", "三", "四", "五", "六", "七", "八"];

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  function tabs() {
    var nav = document.querySelector('#root nav[class*="grid-cols-2"]');
    return nav ? Array.prototype.filter.call(nav.querySelectorAll('a[href^="#/"]'), vis) : [];
  }

  function activeIdx(list) {
    for (var i = 0; i < list.length; i++) {
      if (/(^|\s)bg-blue-600(\s|$)/.test(list[i].className)) return i;
    }
    var hash = location.hash.replace(/\?.*$/, "");
    for (var j = 0; j < list.length; j++) {
      if (list[j].getAttribute("href") === hash) return j;
    }
    return 0;
  }

  function markTabs() {
    var list = tabs();
    if (!list.length) return;
    var idx = activeIdx(list);
    list.forEach(function (a, i) {
      var no = String(i + 1).padStart(2, "0");
      if (a.getAttribute("data-no") !== no) a.setAttribute("data-no", no);
      var name = (a.textContent || "").trim() || "工具" + CN[i];
      var label = "前往工具" + CN[i] + "：" + name + (i === idx ? "（当前）" : "");
      if (a.getAttribute("aria-label") !== label) a.setAttribute("aria-label", label);
      var cur = i === idx ? "true" : "false";
      if (a.getAttribute("aria-current") !== cur) a.setAttribute("aria-current", cur);
    });
  }

  function markH2() {
    var h2 = document.querySelector("#root h2");
    if (!h2 || !vis(h2)) return;
    h2.classList.add("xn-df-h2");
    var raw = (h2.textContent || "").trim();
    var base = raw.replace(/^工具[A-Z]\s*/, "").replace(/^工具[一二三四五六七八]\s*[·:：]?\s*/, "");
    var want = "工具" + CN[activeIdx(tabs())] + " · " + base;
    if (raw !== want) h2.textContent = want;
  }

  function markAreas() {
    Array.prototype.forEach.call(document.querySelectorAll("#root textarea"), function (t) {
      if (vis(t)) t.classList.add("xn-df-area");
    });
    Array.prototype.forEach.call(document.querySelectorAll('#root input[type="checkbox"]'), function (c) {
      c.classList.add("xn-df-check");
    });
  }

  function markButtons() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = (b.textContent || "").replace(/\s+/g, "").trim();
      if (/^(逐行|逐词|按行|按词)$/.test(t)) {
        b.classList.add("xn-df-mode");
        var on = /(^|\s)text-blue-600(\s|$)/.test(b.className) || /(^|\s)bg-blue-600(\s|$)/.test(b.className);
        if (b.getAttribute("aria-pressed") !== (on ? "true" : "false")) b.setAttribute("aria-pressed", on ? "true" : "false");
        if (b.getAttribute("aria-label") !== t + "对比") b.setAttribute("aria-label", t + "对比");
        return;
      }
      if (/^(开始|生成|比对)/.test(t)) {
        b.classList.add("xn-df-run");
        if (b.getAttribute("aria-label") !== t) b.setAttribute("aria-label", t);
        return;
      }
      if (/^复制/.test(t)) {
        b.classList.add("xn-df-copy");
        if (b.getAttribute("aria-label") !== t) b.setAttribute("aria-label", t);
        return;
      }
      if (/^(交换|清空)$/.test(t)) {
        b.classList.add("xn-df-act");
        if (b.getAttribute("aria-label") !== t) b.setAttribute("aria-label", t);
      }
    });
  }

  function markCounts() {
    Array.prototype.forEach.call(document.querySelectorAll("#root span, #root div"), function (el) {
      if (el.children.length) return;
      var t = (el.textContent || "").trim();
      if (/^\d[\d,]*\s*字符$/.test(t) && !el.classList.contains("xn-df-count")) el.classList.add("xn-df-count");
    });
  }

  function markRows() {
    Array.prototype.forEach.call(document.querySelectorAll('#root div[class*="bg-red-50"], #root div[class*="bg-green-50"]'), function (d) {
      if (vis(d)) d.classList.add("xn-df-row");
    });
  }

  function tick() {
    try {
      markTabs();
      markH2();
      markAreas();
      markButtons();
      markCounts();
      markRows();
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
