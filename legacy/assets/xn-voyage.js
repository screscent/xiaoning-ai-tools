(function () {
  "use strict";
  var CN = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
  var DEFAULT_HASH = "#/budget";

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  function tabs() {
    return Array.prototype.filter.call(
      document.querySelectorAll('#root nav.sticky a[href^="#/"]'),
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
      var name = (a.textContent || "").trim().replace(/^工具[A-Za-z]\s*/, "") || "工具" + CN[i];
      if ((a.textContent || "").trim() !== name) a.textContent = name;
      var label = "前往工具" + CN[i] + "：" + name + (i === idx ? "（当前）" : "");
      if (a.getAttribute("aria-label") !== label) a.setAttribute("aria-label", label);
      var cur = i === idx ? "true" : "false";
      if (a.getAttribute("aria-current") !== cur) a.setAttribute("aria-current", cur);
    });
  }

  function markSections() {
    var cards = Array.prototype.filter.call(
      document.querySelectorAll('#root div[class*="rounded-2xl"][class*="bg-white"]'),
      function (d) { return vis(d) && d.querySelector('h2[id^="tool-"]'); }
    );
    cards.forEach(function (card, i) {
      card.classList.add("xn-vg-card");
      var h2 = card.querySelector('h2[id^="tool-"]');
      h2.classList.add("xn-vg-h2");
      var base = (h2.textContent || "").trim().replace(/^工具[一二三四五六七八九十A-Za-z]\s*[·:：]?\s*/, "");
      var want = "工具" + CN[i] + " · " + base;
      if ((h2.textContent || "").trim() !== want) h2.textContent = want;
    });
  }

  function markValues() {
    Array.prototype.forEach.call(document.querySelectorAll("#root .text-xl"), function (v) {
      if (/^H[1-6]$/.test(v.tagName)) return;
      if (!/font-bold/.test(v.className)) return;
      v.classList.add("xn-vg-big");
      var card = v.closest('div[class*="rounded-2xl"]');
      if (card) card.classList.add("xn-vg-card");
    });
  }

  function sectionName(el) {
    var card = el.closest('div[class*="rounded-2xl"]');
    var h2 = card && card.querySelector('h2[id^="tool-"]');
    return h2 ? h2.textContent.trim().replace(/^工具[一二三四五六七八九十A-Za-z]\s*[·:：]?\s*/, "") : "";
  }

  function markButtons() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = (b.textContent || "").replace(/\s+/g, "").trim();
      var h = b.getBoundingClientRect().height;
      if (/^计算/.test(t)) {
        b.classList.add("xn-vg-go");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", t);
        return;
      }
      if (/^复制/.test(t)) {
        b.classList.add("xn-vg-copy");
        var name = sectionName(b) || "结果";
        var aria = "复制「" + name + "」结果";
        if (b.getAttribute("aria-label") !== aria) b.setAttribute("aria-label", aria);
        return;
      }
      if (/^(经济|标准|全面)/.test(t)) {
        b.classList.add("xn-vg-tier");
        var on = /(^|\s)(bg-teal-50|bg-teal-600)(\s|$)/.test(b.className);
        var pressed = on ? "true" : "false";
        if (b.getAttribute("aria-pressed") !== pressed) b.setAttribute("aria-pressed", pressed);
        return;
      }
      if (h < 50 && /rounded/.test(b.className)) {
        b.classList.add("xn-vg-seg");
        var on2 = /(^|\s)(bg-teal-50|bg-teal-600)(\s|$)/.test(b.className);
        var p2 = on2 ? "true" : "false";
        if (b.getAttribute("aria-pressed") !== p2) b.setAttribute("aria-pressed", p2);
      }
    });
  }

  function ensureTop() {
    var btn = document.querySelector("#root .xn-vg-top");
    if (!btn) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.className = "xn-vg-top";
      btn.setAttribute("aria-label", "回到顶部");
      btn.textContent = "↑";
      btn.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      (document.querySelector("#root") || document.body).appendChild(btn);
    }
    if (window.scrollY > 600) btn.classList.add("on");
    else btn.classList.remove("on");
  }

  function tick() {
    try {
      markTabs();
      markSections();
      markValues();
      markButtons();
      ensureTop();
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
  window.addEventListener("scroll", function () {
    var btn = document.querySelector("#root .xn-vg-top");
    if (!btn) return;
    if (window.scrollY > 600) btn.classList.add("on");
    else btn.classList.remove("on");
  }, { passive: true });

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
