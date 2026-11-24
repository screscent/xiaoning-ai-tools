(function () {
  "use strict";
  var CN = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
  var DEFAULT_HASH = "#/pace";

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  function tabs() {
    return Array.prototype.filter.call(
      document.querySelectorAll('#root nav.flex a[href^="#/"]'),
      vis
    );
  }

  function activeIdx(list) {
    var hash = location.hash.replace(/\?.*$/, "") || DEFAULT_HASH;
    for (var i = 0; i < list.length; i++) {
      if (list[i].getAttribute("href") === hash) return i;
    }
    return 0;
  }

  function markTabs() {
    var list = tabs();
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

  function markSections() {
    var list = tabs();
    var idx = activeIdx(list);
    var h2 = document.querySelector("#root main h2");
    if (!h2 || !vis(h2)) return;
    h2.classList.add("xn-run-h2");
    var base = (h2.textContent || "").trim().replace(/^工具[一二三四五六七八九十A-Za-z]\s*[·:：]?\s*/, "");
    var want = "工具" + CN[idx] + " · " + base;
    if ((h2.textContent || "").trim() !== want) h2.textContent = want;
  }

  function markResults() {
    Array.prototype.forEach.call(document.querySelectorAll("#root .text-2xl"), function (v) {
      if (/^H[1-6]$/.test(v.tagName)) return;
      if (!/font-bold/.test(v.className)) return;
      v.classList.add("xn-run-big");
      var card = v.closest('div[class*="rounded-xl"]');
      if (card) card.classList.add("xn-run-card");
    });
  }

  function markCopy() {
    var h2 = document.querySelector("#root main h2");
    var name = h2 ? (h2.textContent || "").trim().replace(/^工具[一二三四五六七八九十A-Za-z]\s*[·:：]?\s*/, "") : "结果";
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!/复制/.test(b.textContent || "")) return;
      b.classList.add("xn-run-copy");
      var aria = "复制「" + name + "」结果";
      if (b.getAttribute("aria-label") !== aria) b.setAttribute("aria-label", aria);
    });
  }

  function markInputs() {
    Array.prototype.forEach.call(document.querySelectorAll("#root input"), function (inp) {
      var type = inp.getAttribute("type");
      if (!type || /^(text|search|url|email|tel|date)$/.test(type)) inp.classList.add("xn-run-inp");
    });
  }

  function tick() {
    try {
      markTabs();
      markSections();
      markResults();
      markCopy();
      markInputs();
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
