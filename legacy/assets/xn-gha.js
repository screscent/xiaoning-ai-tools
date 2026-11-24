/* 小凝工具站 · GitHub 协作合集增强 xn-gha v1
 * 能力：标签 01–06 编号 + aria-label（保留页面已有 aria-current="page"）；
 *      标题「工具一 · …」；搜索输入 16px + aria；快捷词/选项 chip 44h + aria-pressed；
 *      结果卡与复制按钮可点区与 aria。
 * 注入：legacy/puudfv3a4t.html 的 </body> 前追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_GHA__) return;
  window.__XN_GHA__ = true;

  var CN = ["一", "二", "三", "四", "五", "六", "七", "八"];

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  function tabs() {
    var nav = document.querySelector('#root nav[class*="overflow-x-auto"]');
    return nav ? Array.prototype.filter.call(nav.querySelectorAll('a[href^="#/"]'), vis) : [];
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
      var no = String(i + 1).padStart(2, "0");
      if (a.getAttribute("data-no") !== no) a.setAttribute("data-no", no);
      var name = (a.textContent || "").trim() || "工具" + CN[i];
      var label = "前往工具" + CN[i] + "：" + name + (i === idx ? "（当前）" : "");
      if (a.getAttribute("aria-label") !== label) a.setAttribute("aria-label", label);
    });
  }

  function markH2() {
    var h2 = document.querySelector("#root h2");
    if (!h2 || !vis(h2)) return;
    h2.classList.add("xn-gha-h2");
    var base = (h2.textContent || "").trim().replace(/^工具[一二三四五六七八]\s*[·:：]?\s*/, "");
    var want = "工具" + CN[activeIdx(tabs())] + " · " + base;
    if ((h2.textContent || "").trim() !== want) h2.textContent = want;
  }

  function markInputs() {
    Array.prototype.forEach.call(document.querySelectorAll("#root input"), function (inp) {
      var type = inp.getAttribute("type");
      if (!type || /^(text|search|url|email|tel)$/.test(type)) {
        inp.classList.add("xn-gha-inp");
        if (!inp.getAttribute("aria-label")) inp.setAttribute("aria-label", "搜索 GitHub 协作主题");
      }
    });
  }

  function markQuick() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      if (/(^|\s)rounded-full(\s|$)/.test(b.className)) {
        b.classList.add("xn-gha-quick");
        var t = (b.textContent || "").trim();
        if (t) {
          var label = "查看：" + t;
          if (b.getAttribute("aria-label") !== label) b.setAttribute("aria-label", label);
        }
      }
    });
  }

  function markChips() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      if (!/(^|\s)rounded-lg(\s|$)/.test(b.className) || !/(^|\s)border(\s|$)/.test(b.className)) return;
      if (b.classList.contains("xn-gha-quick") || b.classList.contains("xn-gha-copy")) return;
      b.classList.add("xn-gha-chip");
      var on = /(^|\s)bg-slate-900(\s|$)/.test(b.className);
      var cur = on ? "true" : "false";
      if (b.getAttribute("aria-pressed") !== cur) b.setAttribute("aria-pressed", cur);
      var name = (b.textContent || "").trim();
      if (name) {
        var label = (on ? "已选：" : "选择：") + name;
        if (b.getAttribute("aria-label") !== label) b.setAttribute("aria-label", label);
      }
    });
  }

  function markCopy() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = (b.textContent || "").replace(/\s+/g, "").trim();
      if (!/^复制/.test(t)) return;
      b.classList.add("xn-gha-copy");
      var aria = t === "复制" ? "复制代码片段" : t;
      if (b.getAttribute("aria-label") !== aria) b.setAttribute("aria-label", aria);
    });
  }

  function markCards() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      if (b.classList.contains("xn-gha-chip") || b.classList.contains("xn-gha-quick") || b.classList.contains("xn-gha-copy")) return;
      var h = b.getBoundingClientRect().height;
      if (h >= 52 && h <= 96) b.classList.add("xn-gha-card");
    });
  }

  function tick() {
    try {
      markTabs();
      markH2();
      markInputs();
      markQuick();
      markChips();
      markCopy();
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
