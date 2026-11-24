(function () {
  "use strict";
  var CN = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  function baseName(h2) {
    return (h2.textContent || "").trim().replace(/^工具[一二三四五六七八九十A-Za-z]\s*[·:：]?\s*/, "");
  }

  function markCards() {
    var cards = Array.prototype.filter.call(
      document.querySelectorAll('#root section[aria-label="工具入口"] a[href^="#/"]'),
      vis
    );
    cards.forEach(function (a, i) {
      var no = String(i + 1).padStart(2, "0");
      if (a.getAttribute("data-no") !== no) a.setAttribute("data-no", no);
      var h3 = a.querySelector("h3");
      var name = h3 ? h3.textContent.trim().replace(/^工具[A-Za-z]\s*/, "") : "工具" + CN[i];
      if (h3 && h3.textContent.trim() !== name) h3.textContent = name;
      var label = "前往工具" + CN[i] + "：" + name;
      if (a.getAttribute("aria-label") !== label) a.setAttribute("aria-label", label);
    });
  }

  function markSections() {
    var secs = Array.prototype.filter.call(document.querySelectorAll("#root section.mt-10"), vis);
    var n = 0;
    secs.forEach(function (sec) {
      var h2 = sec.querySelector("h2");
      if (!h2) return;
      var base = baseName(h2);
      if (base === "使用说明") {
        h2.classList.add("xn-mt-h2sub");
        return;
      }
      h2.classList.add("xn-mt-h2");
      var want = "工具" + CN[n] + " · " + base;
      n++;
      if ((h2.textContent || "").trim() !== want) h2.textContent = want;
      var sub = h2.nextElementSibling;
      if (sub && sub.tagName === "P") sub.classList.add("xn-mt-sub");
    });
  }

  function sectionName(el) {
    var sec = el.closest("section.mt-10");
    var h2 = sec && sec.querySelector("h2");
    return h2 ? baseName(h2) : "";
  }

  function markCode() {
    Array.prototype.forEach.call(document.querySelectorAll("#root pre"), function (pre) {
      var box = pre.closest('div[class*="rounded-xl"]');
      if (!box) return;
      box.classList.add("xn-mt-code");
      var label = box.querySelector("span");
      if (label) label.classList.add("xn-mt-codelabel");
      var copy = box.querySelector("button");
      if (!copy) return;
      copy.classList.add("xn-mt-copy");
      var name = sectionName(box) || "代码";
      var aria = "复制「" + name + "」结果";
      if (copy.getAttribute("aria-label") !== aria) copy.setAttribute("aria-label", aria);
    });
  }

  function markInputs() {
    Array.prototype.forEach.call(document.querySelectorAll("#root input"), function (inp) {
      var type = inp.getAttribute("type");
      if (!type || /^(text|search|url|email|tel|date)$/.test(type)) inp.classList.add("xn-mt-inp");
    });
  }

  function markSegs() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      var t = (b.textContent || "").trim();
      if (!/^(Article|Product)/.test(t)) return;
      b.classList.add("xn-mt-seg");
      var on = /(^|\s)bg-white(\s|$)/.test(b.className);
      var pressed = on ? "true" : "false";
      if (b.getAttribute("aria-pressed") !== pressed) b.setAttribute("aria-pressed", pressed);
    });
  }

  function hideStray() {
    Array.prototype.forEach.call(document.querySelectorAll('#root a[href^="#/"]'), function (a) {
      var t = (a.textContent || "").trim();
      if (/^#\//.test(t)) {
        a.style.display = "none";
        a.setAttribute("aria-hidden", "true");
      }
    });
  }

  function ensureTop() {
    var btn = document.querySelector("#root .xn-mt-top");
    if (!btn) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.className = "xn-mt-top";
      btn.setAttribute("aria-label", "回到顶部");
      btn.textContent = "↑";
      btn.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      var root = document.querySelector("#root") || document.body;
      root.appendChild(btn);
    }
    if (window.scrollY > 600) btn.classList.add("on");
    else btn.classList.remove("on");
  }

  function tick() {
    try {
      markCards();
      markSections();
      markInputs();
      markCode();
      markSegs();
      hideStray();
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
  window.addEventListener("scroll", function () {
    var btn = document.querySelector("#root .xn-mt-top");
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
