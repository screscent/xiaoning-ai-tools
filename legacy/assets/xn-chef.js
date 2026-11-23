/* R1308 厨房锅具与刀具选购合集 · xn-chef.js
   仅做语义与易用增强，不改动业务逻辑：编号导航 / 标题归一 / 输入可读名 / 默认值自动出结果 / 复制可读名 */
(function () {
  if (window.__XN_CHEF__) return;
  window.__XN_CHEF__ = true;

  var CN = ["一", "二", "三", "四", "五", "六"];
  var NUMS = ["①", "②", "③", "④", "⑤", "⑥"];
  var LETTER = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5 };
  var ARIA_UNIT = {
    "家庭人数": "家庭人数（人）",
    "台面深度": "台面深度（厘米）",
    "锅口直径": "锅口直径（厘米）",
    "锅深": "锅深（厘米）"
  };

  function visible(el) {
    return !!el && el.getBoundingClientRect().height > 0;
  }

  function sections() {
    return Array.prototype.slice.call(document.querySelectorAll('#root section[id^="sec-"]'));
  }

  function visibleSection() {
    var list = sections().filter(visible);
    return list[0] || null;
  }

  /* ---- 标题归一：工具A → 工具一 · ---- */
  function normalizeHeadings() {
    sections().forEach(function (sec) {
      var h2 = sec.querySelector("h2");
      if (!h2) return;
      var t = h2.textContent.trim();
      var m = t.match(/^工具([A-F])\s*[·:：-]?\s*(.*)$/);
      var mm = t.match(/^[①-⑥]\s*(.*)$/);
      if (m) {
        var i = LETTER[m[1]];
        var next = "工具" + CN[i] + " · " + m[2].trim();
        if (h2.textContent !== next) h2.textContent = next;
      } else if (mm) {
        var idx = NUMS.indexOf(t.trim().charAt(0));
        if (idx < 0) idx = 4;
        var next2 = "工具" + CN[idx] + " · " + mm[1].trim();
        if (h2.textContent !== next2) h2.textContent = next2;
      }
    });
    // 使用说明正文中的「工具A —— …」一并归一
    Array.prototype.forEach.call(document.querySelectorAll("#root section:not([id]) *"), function (el) {
      if (el.children.length) return;
      var s = el.textContent;
      if (!/工具[A-F]/.test(s)) return;
      var n = s.replace(/工具([A-F])/g, function (_, ch) {
        return "工具" + CN[LETTER[ch]];
      });
      if (n !== s) el.textContent = n;
    });
  }

  /* ---- 导航：①–⑤ + aria-current ---- */
  function enhanceNav() {
    var links = Array.prototype.slice.call(document.querySelectorAll('#root a[href^="#/"]'));
    var hash = (location.hash || "#/pan").replace("#", "");
    links.forEach(function (a, i) {
      var src = a.getAttribute("data-xn-label");
      if (!src) {
        var leaf = null;
        Array.prototype.forEach.call(a.querySelectorAll("*"), function (el) {
          if (!leaf && el.children.length === 0 && el.textContent.trim()) leaf = el;
        });
        src = (leaf ? leaf.textContent : a.textContent).trim();
        a.setAttribute("data-xn-label", src);
      }
      var want = NUMS[i] + " " + src;
      var leaf2 = null;
      Array.prototype.forEach.call(a.querySelectorAll("*"), function (el) {
        if (!leaf2 && el.children.length === 0 && /[\u4e00-\u9fa5]/.test(el.textContent)) leaf2 = el;
      });
      if (leaf2) {
        if (leaf2.textContent !== want) leaf2.textContent = want;
      } else if (a.textContent.trim() !== want) {
        a.textContent = want;
      }
      var href = (a.getAttribute("href") || "").replace("#", "");
      var active = href === hash || (!location.hash && i === 0);
      if (active) {
        if (a.getAttribute("aria-current") !== "page") a.setAttribute("aria-current", "page");
      } else if (a.hasAttribute("aria-current")) {
        a.removeAttribute("aria-current");
      }
      var al = "工具" + CN[i] + " " + src;
      if (a.getAttribute("aria-label") !== al) a.setAttribute("aria-label", al);
    });
  }

  /* ---- 数字输入：aria 可读名 ---- */
  function enhanceInputs() {
    var sec = visibleSection();
    if (!sec) return;
    Array.prototype.forEach.call(sec.querySelectorAll('input[type="number"]'), function (inp) {
      var label = inp.closest("label");
      var nameEl = label && label.querySelector("span > span:first-child");
      var name = nameEl ? nameEl.textContent.trim() : "";
      var aria = ARIA_UNIT[name] || (name ? name : null);
      if (aria && inp.getAttribute("aria-label") !== aria) inp.setAttribute("aria-label", aria);
    });
  }

  /* ---- 复制按钮可读名 ---- */
  function enhanceCopy() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (/复制结果/.test(b.textContent) && b.getAttribute("aria-label") !== "复制计算结果") {
        b.setAttribute("aria-label", "复制计算结果");
      }
    });
  }

  /* ---- 默认值自动出结果（每区块一次） ---- */
  function autoCalc() {
    var sec = visibleSection();
    if (!sec) return;
    if (sec.getAttribute("data-xn-auto") === "1") return;
    if (sec.querySelector("dl")) { sec.setAttribute("data-xn-auto", "1"); return; }
    var btn = Array.prototype.slice.call(sec.querySelectorAll("button")).filter(visible).filter(function (b) {
      return /^计算/.test(b.textContent.trim());
    })[0];
    if (!btn) return;
    sec.setAttribute("data-xn-auto", "1");
    window.setTimeout(function () {
      try { btn.click(); } catch (e) {}
    }, 420);
  }

  function run() {
    try {
      normalizeHeadings();
      enhanceNav();
      enhanceInputs();
      enhanceCopy();
      autoCalc();
    } catch (e) {}
  }

  var timer = null;
  function schedule() {
    if (timer) return;
    timer = window.setTimeout(function () {
      timer = null;
      run();
    }, 90);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", schedule);
  } else {
    schedule();
  }
  window.addEventListener("hashchange", function () {
    window.setTimeout(schedule, 120);
    window.setTimeout(schedule, 420);
  });
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (t && t.closest && (t.closest('a[href^="#/"]') || t.closest("button"))) {
      window.setTimeout(schedule, 120);
      window.setTimeout(schedule, 420);
    }
  });

  var mo = new MutationObserver(function (muts) {
    for (var i = 0; i < muts.length; i++) {
      if (muts[i].type === "childList" && muts[i].addedNodes.length) { schedule(); return; }
    }
  });
  try {
    mo.observe(document.getElementById("root") || document.body, { childList: true, subtree: true });
  } catch (e) {}
  window.setInterval(run, 1200);
})();
