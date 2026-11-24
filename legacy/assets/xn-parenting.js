(function () {
  "use strict";
  var CN = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  function tabs() {
    return Array.prototype.filter.call(
      document.querySelectorAll('#root nav.sticky a[href^="#/"]'),
      vis
    );
  }

  var lastHash = "";

  function markTabs() {
    var list = tabs();
    list.forEach(function (a, i) {
      var no = String(i + 1).padStart(2, "0");
      if (a.getAttribute("data-no") !== no) a.setAttribute("data-no", no);
      var name = (a.textContent || "").replace(/\d+$/, "").trim() || "工具" + CN[i];
      var label = "前往工具" + CN[i] + "：" + name;
      if (a.getAttribute("aria-label") !== label) a.setAttribute("aria-label", label);
      a.classList.add("xn-pg-tab");
    });
    if (!list.length) return;
    var bar = list[0].parentElement;
    if (bar && !bar.dataset.xnHome) {
      bar.dataset.xnHome = "1";
      bar.style.setProperty("justify-content", "flex-start", "important");
      bar.scrollLeft = 0;
    }
    var hash = location.hash;
    if (bar && hash !== lastHash) {
      lastHash = hash;
      var cur = bar.querySelector('a[aria-current="page"]');
      if (cur) {
        var target = cur.offsetLeft - (bar.clientWidth - cur.offsetWidth) / 2;
        bar.scrollTo({ left: Math.max(0, target), behavior: "auto" });
      }
    }
  }

  function markHeadings() {
    var order = tabs().map(function (a) {
      return (a.getAttribute("href") || "").replace(/^#\//, "");
    });
    var hs = Array.prototype.slice.call(document.querySelectorAll("#root h2"));
    hs.forEach(function (h, i) {
      h.classList.add("xn-pg-h2");
      var slug = (h.id || "").replace(/^tool-/, "");
      var idx = order.indexOf(slug);
      if (idx < 0) idx = i;
      var target = null;
      for (var k = h.childNodes.length - 1; k >= 0; k--) {
        var n = h.childNodes[k];
        if (n.nodeType === 3 && n.nodeValue.trim()) { target = n; break; }
        if (n.nodeType === 1 && n.tagName !== "svg" && !n.querySelector("svg")) { target = n; break; }
      }
      if (!target) return;
      var raw = target.nodeType === 3 ? target.nodeValue : target.textContent;
      var base = raw.trim().replace(/^工具[一二三四五六七八九十]\s*[·:：]?\s*/, "");
      var want = "工具" + CN[idx] + " · " + base;
      if ((target.nodeType === 3 ? target.nodeValue : target.textContent) !== want) {
        if (target.nodeType === 3) target.nodeValue = want;
        else target.textContent = want;
      }
    });
  }

  function markCards() {
    var cards = Array.prototype.filter.call(
      document.querySelectorAll('#root div[class*="rounded-2xl"][class*="border"][class*="p-4"]'),
      function (d) {
        return vis(d) && d.querySelector("h3") && /计算结果/.test(d.textContent);
      }
    );
    cards.forEach(function (card) {
      card.classList.add("xn-pg-card");
      var h3 = card.querySelector("h3");
      if (h3) h3.classList.add("xn-pg-cardtitle");

      var rowsBox = card.querySelector('[class*="space-y-2.5"]');
      if (rowsBox) {
        rowsBox.classList.add("xn-pg-rows");
        Array.prototype.forEach.call(rowsBox.children, function (row) {
          var spans = row.children;
          if (spans.length < 2) return;
          var k = spans[0], v = spans[1];
          if (k.tagName === "SPAN") k.classList.add("xn-pg-k");
          if (v.tagName === "SPAN") v.classList.add("xn-pg-v");
          else if (v.tagName === "DIV") v.classList.add("xn-pg-vd");
        });
      }

      var acts = card.querySelectorAll("button");
      Array.prototype.forEach.call(acts, function (b) {
        b.classList.add("xn-pg-act");
        var t = (b.textContent || "").replace(/\s+/g, "").trim();
        var label;
        if (/复制/.test(t)) label = "复制计算结果";
        else if (/重置|清空/.test(t)) label = "清空已填数据";
        else label = t || "操作";
        if (b.getAttribute("aria-label") !== label) b.setAttribute("aria-label", label);
      });
    });
  }

  function markSelects() {
    Array.prototype.forEach.call(document.querySelectorAll("#root select"), function (s) {
      if (s.getAttribute("aria-label")) return;
      var box = s.parentElement, lab = null;
      for (var d = 0; d < 4 && box; d++, box = box.parentElement) {
        lab = box.querySelector("label");
        if (lab) break;
      }
      var name = lab ? lab.textContent.replace(/\s+/g, " ").trim() : "选项";
      s.setAttribute("aria-label", name);
    });
  }

  function tick() {
    try {
      markTabs();
      markHeadings();
      markCards();
      markSelects();
    } catch (e) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tick, { once: true });
  } else {
    tick();
  }
  window.setTimeout(tick, 900);
  window.setTimeout(tick, 2200);

  var mo = new MutationObserver(function () { tick(); });
  mo.observe(document.body, { childList: true, subtree: true });
  window.setInterval(tick, 1200);
})();
