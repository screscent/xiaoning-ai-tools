(function () {
  "use strict";
  var CN = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  function markTabs() {
    var links = Array.prototype.filter.call(
      document.querySelectorAll('#root nav.flex a[href^="#/"]'),
      function (a) { return vis(a) && a.getBoundingClientRect().height < 60; }
    );
    links.forEach(function (a, i) {
      var no = String(i + 1).padStart(2, "0");
      if (a.getAttribute("data-no") !== no) a.setAttribute("data-no", no);
      var name = (a.textContent || "").trim().replace(/^工具[A-Za-z]\s*/, "") || "工具" + CN[i];
      if (a.textContent.trim() !== name) a.textContent = name;
      var label = "前往工具" + CN[i] + "：" + name;
      if (a.getAttribute("aria-label") !== label) a.setAttribute("aria-label", label);
      var hash = location.hash.replace(/\?.*$/, "");
      var cur = (hash ? hash === a.getAttribute("href") : i === 0) ? "true" : "false";
      if (a.getAttribute("aria-current") !== cur) a.setAttribute("aria-current", cur);
    });
  }

  function markCards() {
    var cards = Array.prototype.filter.call(
      document.querySelectorAll('#root a[href^="#/"]'),
      function (a) { return vis(a) && a.getBoundingClientRect().height >= 100; }
    );
    cards.forEach(function (a, i) {
      a.classList.add("xn-bd-card");
      var no = String(i + 1).padStart(2, "0");
      if (a.getAttribute("data-no") !== no) a.setAttribute("data-no", no);
      var h3 = a.querySelector("h3");
      var name = h3 ? h3.textContent.trim().replace(/^工具[A-Za-z]\s*/, "") : "工具" + CN[i];
      if (h3 && h3.textContent.trim() !== name) h3.textContent = name;
      var label = "前往工具" + CN[i] + "：" + name;
      if (a.getAttribute("aria-label") !== label) a.setAttribute("aria-label", label);
      var code = a.querySelector("code");
      if (code) code.setAttribute("aria-hidden", "true");
    });
  }

  function markSections() {
    var secs = Array.prototype.filter.call(document.querySelectorAll("#root section.scroll-mt-36"), vis);
    secs.forEach(function (sec, i) {
      var h2 = sec.querySelector("h2");
      if (!h2) return;
      h2.classList.add("xn-bd-h2");
      var base = (h2.textContent || "").trim().replace(/^工具[一二三四五六七八九十A-Za-z]\s*[·:：]?\s*/, "");
      var want = "工具" + CN[i] + " · " + base;
      if ((h2.textContent || "").trim() !== want) h2.textContent = want;
      var sub = h2.nextElementSibling;
      if (sub && sub.tagName === "P") sub.classList.add("xn-bd-sub");
    });
  }

  function fieldName(el) {
    var box = el.parentElement;
    for (var d = 0; d < 4 && box; d++, box = box.parentElement) {
      var lab = box.querySelector("label");
      if (lab && lab.textContent.trim()) return lab.textContent.replace(/\s+/g, " ").trim();
      var cands = box.querySelectorAll("p,span,div");
      for (var i = 0; i < cands.length; i++) {
        var c = cands[i];
        if (c.children.length) continue;
        var t = (c.textContent || "").replace(/\s+/g, " ").trim();
        if (!t) continue;
        var short = t.split("（")[0].trim();
        if (short && short.length <= 18) return short;
      }
    }
    return "选项";
  }

  function markInputs() {
    Array.prototype.forEach.call(document.querySelectorAll("#root input"), function (inp) {
      var type = inp.getAttribute("type");
      if (!type || /^(text|search|url|email|tel|date)$/.test(type)) inp.classList.add("xn-bd-inp");
    });
    Array.prototype.forEach.call(document.querySelectorAll("#root select"), function (s) {
      if (s.getAttribute("aria-label")) return;
      s.setAttribute("aria-label", fieldName(s));
    });
  }

  function sectionName(el) {
    var sec = el.closest("section.scroll-mt-36");
    var h2 = sec && sec.querySelector("h2");
    return h2 ? h2.textContent.trim().replace(/^工具[一二三四五六七八九十A-Za-z]\s*[·:：]?\s*/, "") : "";
  }

  function markButtons() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = (b.textContent || "").replace(/\s+/g, "").trim();
      var h = b.getBoundingClientRect().height;
      if (/^复制/.test(t)) {
        b.classList.add("xn-bd-copy");
        var name = sectionName(b) || "结果";
        var aria = "复制「" + name + "」结果";
        if (b.getAttribute("aria-label") !== aria) b.setAttribute("aria-label", aria);
        return;
      }
      if (/rounded-full/.test(b.className) && h < 50) {
        b.classList.add("xn-bd-seg");
        var on = /(^|\s)bg-emerald-600(\s|$)/.test(b.className);
        var pressed = on ? "true" : "false";
        if (b.getAttribute("aria-pressed") !== pressed) b.setAttribute("aria-pressed", pressed);
      } else if (h >= 40) {
        b.classList.add("xn-bd-act");
        if (!b.getAttribute("aria-label") && t) b.setAttribute("aria-label", t);
      }
    });
  }

  function ensureTop() {
    var btn = document.querySelector("#root .xn-bd-top");
    if (!btn) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.className = "xn-bd-top";
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
      markCards();
      markSections();
      markInputs();
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
    var btn = document.querySelector("#root .xn-bd-top");
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
