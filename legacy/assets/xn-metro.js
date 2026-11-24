/* 小凝工具站 · 地铁与公交换乘速查增强 xn-metro v1
 * 能力：6 个标签 44h + aria-label（保留 aria-current="page"）；
 *      工具标题「A · 名称」并清「工具A–F」；「使用说明」降级；时间 48/16；
 *      是/否 44h + aria-pressed；复制 44h + aria；结果数值 17px。
 * 注入：legacy/j272vmxyyi.html 的 </body> 前追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_METRO__) return;
  window.__XN_METRO__ = true;

  var LETTERS = ["A", "B", "C", "D", "E", "F"];

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  function tabs() {
    return Array.prototype.filter.call(document.querySelectorAll('#root a[href^="#/"]'), vis);
  }

  function activeIdx(list) {
    for (var i = 0; i < list.length; i++) {
      var c = list[i].getAttribute("aria-current");
      if (c && c !== "false") return i;
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
      var raw = (a.textContent || "").trim();
      var name = raw.replace(/^[A-F]\s*[·:：]?\s*/, "");
      var label = "前往工具" + LETTERS[i] + "：" + name + (i === idx ? "（当前）" : "");
      if (a.getAttribute("aria-label") !== label) a.setAttribute("aria-label", label);
    });
  }

  function markHeads() {
    var idx = activeIdx(tabs());
    Array.prototype.forEach.call(document.querySelectorAll("#root h2"), function (h2) {
      if (!vis(h2)) return;
      var t = (h2.textContent || "").trim();
      if (t === "使用说明") {
        h2.classList.add("xn-mt-label");
        return;
      }
      h2.classList.add("xn-mt-h2");
      var base = t
        .replace(/^工具[A-F]\s*/, "")
        .replace(/^[①②③④⑤⑥⑦⑧⑨]\s*/, "")
        .replace(/^[A-F]\s*·\s*/, "");
      var want = LETTERS[idx] + " · " + base;
      if (t !== want) h2.textContent = want;
    });
  }

  function markInputs() {
    Array.prototype.forEach.call(document.querySelectorAll("#root input"), function (inp) {
      var type = inp.getAttribute("type");
      if (!type || /^(text|search|url|email|tel|date|time|datetime-local)$/.test(type)) inp.classList.add("xn-mt-inp");
    });
  }

  function markButtons() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = (b.textContent || "").replace(/\s+/g, "").trim();
      if (/^(是|否)$/.test(t)) {
        b.classList.add("xn-mt-yn");
        var on = /(^|\s)bg-blue-600(\s|$)/.test(b.className);
        if (b.getAttribute("aria-pressed") !== (on ? "true" : "false")) b.setAttribute("aria-pressed", on ? "true" : "false");
        var lab = t === "是" ? "是（无障碍/需要）" : "否（不需要）";
        if (b.getAttribute("aria-label") !== lab) b.setAttribute("aria-label", lab);
        return;
      }
      if (/^复制/.test(t)) {
        b.classList.add("xn-mt-copy");
        if (b.getAttribute("aria-label") !== t) b.setAttribute("aria-label", t);
      }
    });
  }

  function markNums() {
    Array.prototype.forEach.call(document.querySelectorAll("#root p, #root div, #root span"), function (el) {
      if (el.children.length) return;
      var t = (el.textContent || "").trim();
      if (/^约 \d+ 分( \d+ 秒)?$/.test(t) && !el.classList.contains("xn-mt-num")) el.classList.add("xn-mt-num");
    });
  }

  function fixGuide() {
    var MAP = {
      "①选择要用的工具标签或直接访问深链": "① 选择上方的通勤工具（A–F）",
      "②填写数值、编码、税额等参数": "② 填写换乘距离、等候时间等数值",
      "③查看计算结果与建议": "③ 查看耗时、票价与缓冲建议",
      "① 选择要用的工具标签或直接访问深链": "① 选择上方的通勤工具（A–F）"
    };
    Array.prototype.forEach.call(document.querySelectorAll("#root p, #root li, #root div"), function (el) {
      if (el.children.length) return;
      var t = (el.textContent || "").trim();
      if (MAP[t] && MAP[t] !== t) el.textContent = MAP[t];
    });
  }

  function tick() {
    try {
      fixGuide();
      markTabs();
      markHeads();
      markInputs();
      markButtons();
      markNums();
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

  document.addEventListener("click", function (e) {
    var t = e.target;
    if (t && t.closest && t.closest("#root a[href^='#/'], #root button")) window.setTimeout(tick, 30);
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
