(function () {
  "use strict";
  var CN = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  function tabs() {
    return Array.prototype.filter.call(
      document.querySelectorAll('#root nav[aria-label="工具切换"] button'),
      vis
    );
  }

  function activeIdx(list) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].getAttribute("aria-current") === "page") return i;
    }
    return 0;
  }

  function markTabs() {
    var list = tabs();
    var idx = activeIdx(list);
    list.forEach(function (b, i) {
      var no = String(i + 1).padStart(2, "0");
      if (b.getAttribute("data-no") !== no) b.setAttribute("data-no", no);
      var name = (b.textContent || "").trim() || "工具" + CN[i];
      var label = "前往工具" + CN[i] + "：" + name + (i === idx ? "（当前）" : "");
      if (b.getAttribute("aria-label") !== label) b.setAttribute("aria-label", label);
    });
  }

  function markSections() {
    var idx = activeIdx(tabs());
    var h2 = document.querySelector('#root main h2[id^="tool-"], #root h2[id^="tool-"]');
    if (!h2 || !vis(h2)) return;
    h2.classList.add("xn-mo-h2");
    var base = (h2.textContent || "").trim().replace(/^工具[一二三四五六七八九十A-Za-z]\s*[·:：]?\s*/, "");
    var want = "工具" + CN[idx] + " · " + base;
    if ((h2.textContent || "").trim() !== want) h2.textContent = want;
  }

  function markButtons() {
    var inNav = function (el) { return !!el.closest('nav[aria-label="工具切换"]'); };
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b) || inNav(b)) return;
      var t = (b.textContent || "").replace(/\s+/g, " ").trim();
      if (/^复制/.test(t)) {
        b.classList.add("xn-mo-copy");
        if (b.getAttribute("aria-label") !== "复制转换结果") b.setAttribute("aria-label", "复制转换结果");
        return;
      }
      var h = b.getBoundingClientRect().height;
      if (/^[.\-·−\s]+$/.test(t)) {
        b.classList.add("xn-mo-seg");
        var on = /(^|\s)(bg-blue-600|border-blue-600|bg-blue-50)(\s|\/|$)/.test(b.className);
        var pressed = on ? "true" : "false";
        if (b.getAttribute("aria-pressed") !== pressed) b.setAttribute("aria-pressed", pressed);
        return;
      }
      if (h >= 36) {
        b.classList.add("xn-mo-act");
        if (!b.getAttribute("aria-label") && t) b.setAttribute("aria-label", t);
      }
    });
  }

  function tick() {
    try {
      markTabs();
      markSections();
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
