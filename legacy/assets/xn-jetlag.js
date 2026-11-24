(function () {
  "use strict";
  var CN = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  function tabs() {
    return Array.prototype.filter.call(
      document.querySelectorAll("#root nav button"),
      vis
    );
  }

  function markTabs() {
    var list = tabs();
    list.forEach(function (b, i) {
      b.classList.add("xn-jl-tab");
      var numSpan = b.querySelector("span");
      var no = String(i + 1).padStart(2, "0");
      if (numSpan && numSpan.textContent.trim() !== no) numSpan.textContent = no;

      var t = (b.textContent || "").replace(/\s+/g, " ").trim();
      var name = t.replace(/^\d+\s*/, "").replace(/^工具[A-Za-z]\s*/, "").trim() || "工具" + CN[i];
      if (numSpan) {
        var visible = (b.textContent || "").replace(/\s+/g, "");
        var expected = no + name.replace(/\s+/g, "");
        if (visible !== expected) {
          Array.prototype.slice.call(b.childNodes).forEach(function (n) {
            if (n !== numSpan) b.removeChild(n);
          });
          b.appendChild(document.createTextNode(name));
        }
      }
      var active = /(^|\s)bg-indigo-600(\s|$)/.test(b.className);
      var broken = i === 5 && /返程/.test(name);
      var label = "前往工具" + CN[i] + "：" + name + (broken ? "（暂不可用）" : active ? "（当前）" : "");
      if (b.getAttribute("aria-label") !== label) b.setAttribute("aria-label", label);
      var pressed = active ? "true" : "false";
      if (b.getAttribute("aria-pressed") !== pressed) b.setAttribute("aria-pressed", pressed);
      if (broken) {
        if (b.getAttribute("aria-disabled") !== "true") b.setAttribute("aria-disabled", "true");
      } else if (b.hasAttribute("aria-disabled")) {
        b.removeAttribute("aria-disabled");
      }
    });
    if (!list.length) return;
    var bar = list[0].parentElement;
    if (bar && !bar.dataset.xnHome) {
      bar.dataset.xnHome = "1";
      bar.style.setProperty("justify-content", "flex-start", "important");
      bar.scrollLeft = 0;
    }
  }

  function activeIndex() {
    var list = tabs();
    for (var i = 0; i < list.length; i++) {
      if (/(^|\s)bg-indigo-600(\s|$)/.test(list[i].className)) return i;
    }
    return 0;
  }

  function markHeadings() {
    var idx = activeIndex();
    var hs = Array.prototype.slice.call(document.querySelectorAll("#root main h2"));
    hs.forEach(function (h) {
      var text = (h.textContent || "").trim();
      if (text === "使用说明") {
        h.classList.add("xn-jl-sub");
        return;
      }
      if (!h.closest('[data-code-inspect-component="BlockHeader"]')) return;
      h.classList.add("xn-jl-h2");
      var base = text.replace(/^工具[一二三四五六七八九十A-Za-z]\s*[·:：]?\s*/, "");
      var want = "工具" + CN[idx] + " · " + base;
      if (text !== want) h.textContent = want;
    });
  }

  function markResult() {
    Array.prototype.forEach.call(document.querySelectorAll("#root main span"), function (s) {
      if (!/(^|\s)text-3xl(\s|$)/.test(s.className)) return;
      var card = s.closest('div[class*="rounded-lg"]');
      if (card) card.classList.add("xn-jl-sum");
      s.classList.add("xn-jl-big");
      var box = s.parentElement && s.parentElement.parentElement;
      if (box) {
        var ps = box.querySelectorAll("p");
        Array.prototype.forEach.call(ps, function (p, i) {
          p.classList.add(i === 0 ? "xn-jl-note" : "xn-jl-tip");
        });
      }
    });
    Array.prototype.forEach.call(document.querySelectorAll("#root main table"), function (t) {
      t.classList.add("xn-jl-table");
    });
  }

  function markActions() {
    Array.prototype.forEach.call(document.querySelectorAll("#root main button"), function (b) {
      var t = (b.textContent || "").replace(/\s+/g, "").trim();
      if (/生成调整表/.test(t)) {
        b.classList.add("xn-jl-go");
        if (b.getAttribute("aria-label") !== "生成时差调整表") b.setAttribute("aria-label", "生成时差调整表");
      } else if (/复制/.test(t)) {
        b.classList.add("xn-jl-copy");
        if (b.getAttribute("aria-label") !== "复制调整表结果") b.setAttribute("aria-label", "复制调整表结果");
      }
    });
  }

  function showBrokenNotice() {
    if (document.querySelector("#root .xn-jl-notice")) return;
    var main = document.querySelector("#root main");
    if (!main) return;
    var box = document.createElement("div");
    box.className = "xn-jl-notice";
    box.setAttribute("role", "alert");
    var title = document.createElement("strong");
    title.textContent = "工具六「返程倒时差」暂不可用";
    var desc = document.createElement("p");
    desc.textContent = "该工具打开后会导致页面空白，已为你保留其他工具。请先使用工具一~五，问题已记录待修复。";
    var back = document.createElement("button");
    back.type = "button";
    back.textContent = "返回工具一";
    back.addEventListener("click", function () {
      box.remove();
      var first = document.querySelector("#root nav button");
      if (first) first.click();
    });
    box.appendChild(title);
    box.appendChild(desc);
    box.appendChild(back);
    main.insertBefore(box, main.firstChild);
  }

  document.addEventListener("click", function (e) {
    var b = e.target && e.target.closest && e.target.closest("#root nav button");
    if (!b) return;
    if (b.getAttribute("aria-disabled") === "true") {
      e.preventDefault();
      e.stopImmediatePropagation();
      showBrokenNotice();
    }
  }, true);

  function tick() {
    try {
      markTabs();
      markHeadings();
      markResult();
      markActions();
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
