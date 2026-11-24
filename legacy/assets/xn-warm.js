/* R1319 供暖与取暖费用计算合集 · xn-warm.js
   工具编号 / 标题归一 / 标签语义 / 结果数字放大 / 移动端滑动提示 */
(function () {
  if (window.__XN_WARM__) return;
  window.__XN_WARM__ = true;

  var CN = ["一", "二", "三", "四", "五"];
  var NUM = ["①", "②", "③", "④", "⑤"];
  var TABS = [
    ["#/heating", "供暖费核算"],
    ["#/heater", "电暖器电费"],
    ["#/compare", "取暖方式对比"],
    ["#/insulation", "保温损耗"],
    ["#/radiator", "暖气片片数"]
  ];

  function visible(el) {
    return !!el && el.getBoundingClientRect().height > 0;
  }

  /* ---- 标题归一：工具A → 工具一 · xxx ---- */
  function normalizeHeadings() {
    Array.prototype.forEach.call(document.querySelectorAll("#root h2"), function (h) {
      var t = h.textContent.trim();
      var m = t.match(/^工具([A-D])\s*(.+)$/);
      if (m) {
        var idx = "ABCD".indexOf(m[1]);
        var next = "工具" + CN[idx] + " · " + m[2].trim();
        if (t !== next) h.textContent = next;
        h.classList.add("xn-warm-h2");
        return;
      }
      var m2 = t.match(/^[①②③④⑤]\s*(.+)$/);
      if (m2 && /暖气片|估算/.test(t)) {
        var next2 = "工具五 · " + m2[1].trim();
        if (t !== next2) h.textContent = next2;
        h.classList.add("xn-warm-h2");
      }
    });
  }

  /* ---- 使用说明：去掉「深链」等开发者用语 ---- */
  function fixGuide() {
    var h2 = Array.prototype.slice.call(document.querySelectorAll("#root h2")).filter(function (h) {
      return h.textContent.trim() === "使用说明";
    })[0];
    if (h2) {
      var sec = h2.closest("section");
      if (sec) sec.classList.add("xn-warm-guide");
    }
    Array.prototype.forEach.call(document.querySelectorAll("#root li"), function (li) {
      var t = li.textContent;
      if (/深链/.test(t)) {
        li.textContent = "① 点选上方工具标签即可切换工具；";
      } else if (/奶量/.test(t)) {
        li.textContent = "② 填写面积、功率、用量等参数；";
      }
    });
  }

  /* ---- 工具标签 ---- */
  function enhanceTabs() {
    var nav = document.querySelector('#root nav[aria-label="工具切换"]') || document.querySelector("#root nav");
    if (nav) nav.classList.add("xn-warm-tabs");

    var hash = location.hash || "#/heating";
    Array.prototype.forEach.call(document.querySelectorAll('#root a[href^="#/"]'), function (a) {
      var href = a.getAttribute("href");
      var idx = -1;
      for (var k = 0; k < TABS.length; k++) if (TABS[k][0] === href) idx = k;
      if (idx < 0) return;
      a.classList.add("xn-warm-tab");
      if (a.getAttribute("data-no") !== NUM[idx]) a.setAttribute("data-no", NUM[idx]);
      var active = hash === href;
      a.classList.toggle("is-active", active);
      if (active) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
      var al = "工具" + CN[idx] + "：" + TABS[idx][1] + (active ? "（当前）" : "");
      if (a.getAttribute("aria-label") !== al) a.setAttribute("aria-label", al);
      a.style.setProperty("min-height", "44px", "important");
    });

    // 移动端滑动提示
    var hint = document.querySelector(".xn-warm-hint");
    var need = false;
    if (nav && window.innerWidth <= 640) {
      need = nav.scrollWidth > nav.clientWidth + 4;
    }
    if (need && !hint) {
      hint = document.createElement("div");
      hint.className = "xn-warm-hint";
      hint.textContent = "左右滑动查看更多工具 →";
      nav.parentNode.insertBefore(hint, nav.nextSibling);
    } else if (!need && hint) {
      hint.parentNode.removeChild(hint);
    }
  }

  /* ---- 结果数字 ---- */
  function enhanceTiles() {
    Array.prototype.forEach.call(document.querySelectorAll('#root span[class*="font-bold"]'), function (sp) {
      var v = sp.textContent.trim();
      if (!/^[\d.,]+$/.test(v)) return;
      if (!visible(sp)) return;
      var row = sp.parentElement;
      var tile = row && row.parentElement;
      if (!tile || !tile.className || String(tile.className).indexOf("rounded") < 0) return;
      tile.classList.add("xn-warm-stat");
      sp.classList.add("xn-warm-num");
      var lab = tile.firstElementChild;
      if (lab && lab !== row) lab.classList.add("xn-warm-label");
    });
  }

  /* ---- 复制按钮 ---- */
  function enhanceButtons() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (b.textContent.trim() !== "复制结果") return;
      b.classList.add("xn-warm-copy");
      if (b.getAttribute("aria-label") !== "复制当前工具的计算结果") {
        b.setAttribute("aria-label", "复制当前工具的计算结果");
      }
      b.style.setProperty("min-height", "44px", "important");
    });
  }

  /* ---- 下拉与输入 ---- */
  function enhanceInputs() {
    Array.prototype.forEach.call(document.querySelectorAll("#root select"), function (el) {
      el.style.setProperty("min-height", "48px", "important");
      el.style.setProperty("height", "48px", "important");
      el.style.setProperty("font-size", "16px", "important");
    });
  }

  /* ---- 工具卡片标记 ---- */
  function markCards() {
    Array.prototype.forEach.call(document.querySelectorAll("#root h2"), function (h) {
      if (!h.classList.contains("xn-warm-h2")) return;
      var sec = h.closest("section");
      if (sec) sec.classList.add("xn-warm-card");
    });
  }

  function run() {
    try {
      normalizeHeadings();
      fixGuide();
      enhanceTabs();
      markCards();
      enhanceTiles();
      enhanceButtons();
      enhanceInputs();
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

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule);
  else schedule();

  window.addEventListener("hashchange", function () {
    window.setTimeout(schedule, 60);
    window.setTimeout(schedule, 320);
  });
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (t && t.closest && (t.closest("a") || t.closest("button"))) {
      window.setTimeout(schedule, 120);
      window.setTimeout(schedule, 460);
    }
  });
  document.addEventListener("change", function (e) {
    if (e.target && (e.target.tagName === "SELECT" || e.target.type === "number")) {
      window.setTimeout(schedule, 120);
      window.setTimeout(schedule, 460);
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
