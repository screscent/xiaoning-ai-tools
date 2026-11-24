(function () {
  "use strict";
  var CN = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
  var DEFAULT_HASH = "#/agenda";

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  function tabs() {
    return Array.prototype.filter.call(
      document.querySelectorAll("#root nav.flex.flex-wrap a[href^='#/']"),
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
    var idx = activeIdx(tabs());
    var h2 = document.querySelector('#root h2[id^="tool-"]');
    if (!h2 || !vis(h2)) return;
    h2.classList.add("xn-ag-h2");
    var base = (h2.textContent || "").trim().replace(/^工具[一二三四五六七八九十A-Za-z]\s*[·:：]?\s*/, "");
    var want = "工具" + CN[idx] + " · " + base;
    if ((h2.textContent || "").trim() !== want) h2.textContent = want;
  }

  function markInputs() {
    Array.prototype.forEach.call(document.querySelectorAll("#root input"), function (inp) {
      var type = inp.getAttribute("type");
      if (!type || /^(text|search|url|email|tel)$/.test(type)) inp.classList.add("xn-ag-inp");
    });
  }

  function markCopy() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = (b.textContent || "").replace(/\s+/g, "").trim();
      if (!/^复制/.test(t)) return;
      b.classList.add("xn-ag-copy");
      if (b.getAttribute("aria-label") !== t) b.setAttribute("aria-label", t);
    });
  }

  function tick() {
    try {
      markTabs();
      markSections();
      markInputs();
      markCopy();
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
