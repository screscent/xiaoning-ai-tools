/* R1325 有氧能力与训练强度合集 · xn-cardio.js
   工具标签语义 / 标题与编号 / 关键数字 / 按钮 aria / 说明字号 */
(function () {
  if (window.__XN_CARDIO__) return;
  window.__XN_CARDIO__ = true;

  var NUM = ["01", "02", "03", "04", "05", "06"];
  var CN = ["一", "二", "三", "四", "五", "六"];
  var NAMES = ["有氧分级（静息心率）", "VO2max 估算", "心率区间与配速", "训练负荷比（ACWR）", "跨项目等效时长", "8 周训练计划"];

  function visible(el) {
    return !!el && el.getBoundingClientRect().height > 0;
  }

  /* ---- 工具标签 ---- */
  function enhanceTabs() {
    var anchors = Array.prototype.slice.call(document.querySelectorAll('#root a[href^="#/"]'));
    if (!anchors.length) return;
    anchors.forEach(function (a, i) {
      a.classList.add("xn-cardio-tab");
      if (a.getAttribute("data-no") !== NUM[i]) a.setAttribute("data-no", NUM[i]);
      var active = !!(a.style && a.style.backgroundColor) || /text-white/.test(String(a.className));
      a.classList.toggle("is-active", active);
      if (active) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
      var al = "工具" + CN[i] + "：" + (NAMES[i] || a.textContent.replace(/\s+/g, " ").trim()) + (active ? "（当前）" : "");
      if (a.getAttribute("aria-label") !== al) a.setAttribute("aria-label", al);
      var box = null;
      Array.prototype.forEach.call(a.querySelectorAll("div"), function (d) {
        if (!box && d.children.length >= 2) box = d;
      });
      if (box && box.lastElementChild) box.lastElementChild.classList.add("xn-cardio-sub");
    });
    var grid = anchors[0].parentElement;
    if (grid) grid.classList.add("xn-cardio-tabgrid");
  }

  /* ---- 标题与编号 ---- */
  function enhanceHeadings() {
    var chips = [];
    Array.prototype.forEach.call(document.querySelectorAll("#root .num"), function (el) {
      if (el.children.length === 0 && /^0[1-6]$/.test(el.textContent.trim())) chips.push(el);
    });
    chips.forEach(function (c) { c.classList.add("xn-cardio-num"); });
    Array.prototype.forEach.call(document.querySelectorAll("#root h2"), function (h) {
      if (h.textContent.trim() === "使用说明") return;
      h.classList.add("xn-cardio-h2");
    });
    var guide = document.getElementById("howto");
    if (guide) {
      guide.classList.add("xn-cardio-guide");
      Array.prototype.forEach.call(guide.querySelectorAll("div, span"), function (sp) {
        if (sp.children.length === 0 && /^0[1-9]$/.test(sp.textContent.trim())) sp.classList.add("xn-cardio-gnum");
      });
    }
  }

  /* ---- 结果数字 ---- */
  function enhanceStats() {
    Array.prototype.forEach.call(document.querySelectorAll('#root [class*="text-[38px]"]'), function (el) {
      el.classList.add("xn-cardio-rating");
    });
    Array.prototype.forEach.call(document.querySelectorAll('#root [class*="text-[23px]"]'), function (el) {
      el.classList.add("xn-cardio-stat");
    });
  }

  /* ---- 按钮 ---- */
  function enhanceButtons() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      var t = b.textContent.replace(/\s+/g, " ").trim();
      if (t === "复制结果") {
        b.classList.add("xn-cardio-copy");
        if (b.getAttribute("aria-label") !== "复制本次结果") b.setAttribute("aria-label", "复制本次结果");
        b.style.setProperty("min-height", "44px", "important");
      } else if (t === "清空重填") {
        b.classList.add("xn-cardio-reset");
        if (b.getAttribute("aria-label") !== "清空已填数据") b.setAttribute("aria-label", "清空已填数据");
        b.style.setProperty("min-height", "44px", "important");
      }
    });
  }

  function run() {
    try {
      enhanceTabs();
      enhanceHeadings();
      enhanceStats();
      enhanceButtons();
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
      window.setTimeout(schedule, 110);
      window.setTimeout(schedule, 460);
    }
  });
  document.addEventListener("change", function (e) {
    if (e.target && e.target.tagName === "INPUT") {
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
