/* R1323 星座生肖与干支合集 · xn-zodiac.js
   工具编号 / 标题归一 / 标签语义 / 评分与结果增强 */
(function () {
  if (window.__XN_ZODIAC__) return;
  window.__XN_ZODIAC__ = true;

  var CN = ["一", "二", "三", "四", "五", "六"];
  var NUM = ["①", "②", "③", "④", "⑤", "⑥"];
  var TABS = ["#/zodiac", "#/shengxiao", "#/ganzhi", "#/pair", "#/benming", "#/shichen"];
  var NAMES = ["星座速查", "生肖速查", "干支纪年", "星座配对", "本命年", "时辰与吉时"];

  function visible(el) {
    return !!el && el.getBoundingClientRect().height > 0;
  }

  function toolSections() {
    return Array.prototype.slice.call(document.querySelectorAll("#root section")).filter(function (s) {
      var h = s.querySelector("h2");
      return !!h && h.textContent.trim() !== "使用说明";
    });
  }

  /* ---- 标题归一：工具一 ~ 工具六 ---- */
  function normalizeHeadings() {
    toolSections().forEach(function (s, i) {
      var h = s.querySelector("h2");
      var t = h.textContent.trim();
      var name = t.replace(/^工具[一二三四五六A-F]\s*[·:：]?\s*/, "").trim() || NAMES[i] || t;
      var next = "工具" + CN[i] + " · " + name;
      if (t !== next) h.textContent = next;
      h.classList.add("xn-zod-h2");
      s.classList.add("xn-zod-card");
    });
  }

  /* ---- 工具标签 ---- */
  function enhanceTabs() {
    var hash = location.hash || "";
    Array.prototype.forEach.call(document.querySelectorAll('#root a[href^="#/"]'), function (a) {
      var href = a.getAttribute("href");
      var idx = TABS.indexOf(href);
      if (idx < 0) return;
      a.classList.add("xn-zod-tab");
      if (a.getAttribute("data-no") !== NUM[idx]) a.setAttribute("data-no", NUM[idx]);
      var active = String(a.className).indexOf("bg-indigo-50") >= 0 || String(a.className).indexOf("bg-indigo-500") >= 0 || (hash && hash.indexOf(href) === 0);
      a.classList.toggle("is-active", active);
      if (active) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
      var al = "工具" + CN[idx] + "：" + NAMES[idx] + (active ? "（当前）" : "");
      if (a.getAttribute("aria-label") !== al) a.setAttribute("aria-label", al);
      a.style.setProperty("min-height", "44px", "important");
    });
    var first = document.querySelector("#root .xn-zod-tab");
    if (first && first.parentElement) first.parentElement.classList.add("xn-zod-tabrow");
  }

  /* ---- 配对评分 ---- */
  function enhanceScore() {
    Array.prototype.forEach.call(document.querySelectorAll("#root span"), function (sp) {
      var c = String(sp.className);
      if (/text-2xl/.test(c) && /font-bold/.test(c) && /^\d+$/.test(sp.textContent.trim())) {
        sp.classList.add("xn-zod-score");
      }
    });
  }

  /* ---- 本命年信息块 ---- */
  function enhanceKeyRows() {
    var sec = toolSections()[4];
    if (!sec) return;
    ["生肖", "出生年干支", "是否本命年", "下一次本命年", "距离年数", "本命年干支"].forEach(function (name) {
      var lab = null;
      Array.prototype.forEach.call(sec.querySelectorAll("span"), function (sp) {
        if (!lab && sp.children.length === 0 && sp.textContent.trim() === name) lab = sp;
      });
      if (!lab) return;
      var row = lab.parentElement;
      if (!row) return;
      row.classList.add("xn-zod-row");
      lab.classList.add("xn-zod-kvlabel");
      Array.prototype.forEach.call(row.children, function (c) {
        if (c !== lab) c.classList.add("xn-zod-kvval");
      });
    });
  }

  /* ---- 十二时辰单元格 ---- */
  function enhanceCells() {
    toolSections().forEach(function (s, i) {
      if (i !== 5) return;
      Array.prototype.forEach.call(s.querySelectorAll("div[class*='rounded-lg'][class*='border']"), function (d) {
        d.classList.add("xn-zod-cell");
        var c = String(d.className);
        if (/indigo/.test(c)) d.classList.add("xn-zod-cell-active");
      });
    });
  }

  /* ---- 复制按钮 ---- */
  function enhanceCopy() {
    var sections = toolSections();
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (b.textContent.trim() !== "复制结果") return;
      b.classList.add("xn-zod-copy");
      var sec = b.closest("section");
      var i = sections.indexOf(sec);
      var key = i === 4 ? "复制本命年结果" : i === 5 ? "复制时辰吉时结果" : "复制当前结果";
      if (b.getAttribute("aria-label") !== key) b.setAttribute("aria-label", key);
      b.style.setProperty("min-height", "44px", "important");
    });
  }

  /* ---- 控件 ---- */
  function enhanceControls() {
    Array.prototype.forEach.call(document.querySelectorAll("#root select"), function (el) {
      el.style.setProperty("height", "48px", "important");
      el.style.setProperty("min-height", "48px", "important");
      el.style.setProperty("font-size", "16px", "important");
    });
    Array.prototype.forEach.call(document.querySelectorAll("#root input"), function (el) {
      el.style.setProperty("min-height", "48px", "important");
    });
  }

  function run() {
    try {
      normalizeHeadings();
      enhanceTabs();
      enhanceScore();
      enhanceKeyRows();
      enhanceCells();
      enhanceCopy();
      enhanceControls();
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

  document.addEventListener("click", function (e) {
    var t = e.target;
    if (t && t.closest && (t.closest("a") || t.closest("button"))) {
      window.setTimeout(schedule, 120);
      window.setTimeout(schedule, 480);
    }
  });
  document.addEventListener("change", function (e) {
    if (e.target && (e.target.tagName === "SELECT" || e.target.type === "number" || e.target.type === "date" || e.target.type === "time")) {
      window.setTimeout(schedule, 150);
      window.setTimeout(schedule, 520);
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
