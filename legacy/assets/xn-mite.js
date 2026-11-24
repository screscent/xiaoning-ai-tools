(function () {
  "use strict";
  var CN = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  function tabs() {
    return Array.prototype.filter.call(document.querySelectorAll("#root nav.mt-6 a[href^='#/']"), vis);
  }

  function activeIdx(list) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].getAttribute("aria-current") === "page") return i;
    }
    return 0;
  }

  function cleanText(t) {
    return (t || "")
      .replace(/工具[A-Za-z]\s*/g, "")
      .replace(/湿度湿度/g, "湿度")
      .replace(/风险风险/g, "风险")
      .replace(/\s+/g, " ")
      .trim();
  }

  function markTabs() {
    var list = tabs();
    var idx = activeIdx(list);
    list.forEach(function (a, i) {
      var no = String(i + 1).padStart(2, "0");
      if (a.getAttribute("data-no") !== no) a.setAttribute("data-no", no);
      var raw = a.dataset.xnRaw;
      if (!raw) {
        raw = cleanText(a.textContent);
        if (raw) a.dataset.xnRaw = raw;
      }
      var name = raw.split(" / ")[0].trim() || "工具" + CN[i];
      var short = name.replace(/^湿度与/, "").replace(/周期$/, "");
      if (short.length > 6) short = short.slice(0, 6);
      if (raw) a.setAttribute("title", raw);
      var label = a.querySelector(".xn-mg-tablabel");
      if (!label) {
        Array.prototype.forEach.call(a.querySelectorAll("span"), function (s) { s.remove(); });
        label = document.createElement("span");
        label.className = "xn-mg-tablabel";
        a.appendChild(label);
      }
      if (label.textContent !== short) label.textContent = short;
      var aria = "前往工具" + CN[i] + "：" + short + (i === idx ? "（当前）" : "");
      if (a.getAttribute("aria-label") !== aria) a.setAttribute("aria-label", aria);
    });
  }

  function markSections() {
    var idx = activeIdx(tabs());
    var h2 = document.querySelector('#root h2[id^="tool-"]');
    if (!h2 || !vis(h2)) return;
    h2.classList.add("xn-mg-h2");
    var base = (h2.textContent || "").trim().replace(/^工具[一二三四五六七八九十A-Za-z]\s*[·:：]?\s*/, "");
    var want = "工具" + CN[idx] + " · " + base;
    if ((h2.textContent || "").trim() !== want) h2.textContent = want;
  }

  function markButtons() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = (b.textContent || "").replace(/\s+/g, " ").trim();
      if (/^复制/.test(t)) {
        b.classList.add("xn-mg-copy");
        if (b.getAttribute("aria-label") !== "复制结果") b.setAttribute("aria-label", "复制结果");
        return;
      }
      if (b.hasAttribute("aria-pressed")) b.classList.add("xn-mg-chip");
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
