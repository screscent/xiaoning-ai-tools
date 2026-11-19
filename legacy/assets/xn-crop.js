/* 图片裁剪与圆形头像合集页增强（仅 wn363rj8gw 引用） */
(function () {
  "use strict";
  if (window.__XN_CROP__) return;
  window.__XN_CROP__ = true;

  function txt(el) { return (el.textContent || "").trim().replace(/\s+/g, " "); }
  function visible(el) {
    if (!el) return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }
  function hasClass(el, s) {
    return !!el && (el.className || "").toString().indexOf(s) >= 0;
  }
  function setVal(el, v) {
    var proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    proto.set.call(el, String(v));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  var RATIOS = ["1:1", "4:3", "16:9", "3:2", "自由"];
  var ALIGNS = ["居中", "左上", "右下"];

  /* ---------- 1. tab ---------- */
  function markTabs() {
    var tabs = [].slice.call(document.querySelectorAll('#root a[href^="#/"]')).filter(visible);
    if (!tabs.length) return;
    var bar = tabs[0].parentElement;
    if (bar && !bar.classList.contains("xn-tabs")) bar.classList.add("xn-tabs");
  }

  /* ---------- 2. 比例/对齐/宽度 ---------- */
  function markSegments() {
    var ratioBtns = [];
    var alignBtns = [];
    [].slice.call(document.querySelectorAll("#root button")).filter(visible).forEach(function (b) {
      var t = txt(b);
      var isRatio = RATIOS.indexOf(t) >= 0;
      var isAlign = ALIGNS.indexOf(t) >= 0;
      if (!isRatio && !isAlign) return;
      if (!b.classList.contains("xn-seg")) b.classList.add("xn-seg");
      var on = String(hasClass(b, "border-blue-600"));
      if (b.getAttribute("aria-pressed") !== on) b.setAttribute("aria-pressed", on);
      (isRatio ? ratioBtns : alignBtns).push(b);
    });
    if (ratioBtns[0] && ratioBtns[0].parentElement) {
      var g1 = ratioBtns[0].parentElement;
      if (g1.getAttribute("role") !== "group") {
        g1.setAttribute("role", "group");
        g1.setAttribute("aria-label", "裁剪比例");
      }
    }
    if (alignBtns[0] && alignBtns[0].parentElement) {
      var g2 = alignBtns[0].parentElement;
      if (g2.getAttribute("role") !== "group") {
        g2.setAttribute("role", "group");
        g2.setAttribute("aria-label", "对齐位置");
      }
    }
    var input = document.querySelector('#root input[type="number"]');
    var curW = input ? parseFloat(input.value) : NaN;
    [].slice.call(document.querySelectorAll("#root .xn-presets button")).forEach(function (b) {
      var v = parseFloat(txt(b));
      var on = String(!isNaN(v) && v === curW);
      if (b.getAttribute("aria-pressed") !== on) b.setAttribute("aria-pressed", on);
      if (!b.__xnBind) {
        b.__xnBind = true;
        b.addEventListener("click", function () {
          var cur = document.querySelector('#root input[type="number"]');
          if (cur && !isNaN(v)) setVal(cur, v);
        });
      }
    });
  }

  /* ---------- 3. 质量滑杆 ---------- */
  function markRange() {
    var r = document.querySelector('#root input[type="range"]');
    if (!r) return;
    var vt = r.disabled ? "不适用（PNG 输出）" : r.value + "%";
    if (r.getAttribute("aria-valuetext") !== vt) r.setAttribute("aria-valuetext", vt);
    var ad = String(!!r.disabled);
    if (r.getAttribute("aria-disabled") !== ad) r.setAttribute("aria-disabled", ad);
  }

  /* ---------- 4. 上传区 ---------- */
  function markPreview() {
    var drop = document.querySelector('#root input[type="file"]');
    if (!drop) return;
    var box = drop.closest('div[class*="border-dashed"]') || drop;
    if (box && !box.classList.contains("xn-drop")) box.classList.add("xn-drop");
  }

  /* ---------- 5. 输出尺寸层级 ---------- */
  function activeRatio() {
    var on = [].slice.call(document.querySelectorAll('#root button[aria-pressed="true"]')).find(function (b) {
      return RATIOS.indexOf(txt(b)) >= 0;
    });
    return on ? txt(on) : "";
  }
  function markOutput() {
    var ratio = activeRatio();
    // 尺寸换算说明表格
    [].slice.call(document.querySelectorAll("#root tr")).forEach(function (tr) {
      var tds = [].slice.call(tr.children);
      if (tds.length < 2) return;
      var r = txt(tds[0]);
      var d = txt(tds[1]);
      if (!/^\d+:\d+$/.test(r) || !/^\d+\s×\s\d+$/.test(d)) return;
      if (!tds[1].classList.contains("xn-dim")) tds[1].classList.add("xn-dim");
      tr.classList.toggle("xn-dim-row", !!ratio && r === ratio);
    });
    // 输出尺寸信息卡片
    var sec = [].slice.call(document.querySelectorAll("#root section")).find(function (s) {
      return txt(s).indexOf("输出尺寸信息") >= 0;
    });
    if (!sec) return;
    [].slice.call(sec.querySelectorAll("*")).forEach(function (el) {
      if (el.children.length) return;
      if (!/^\d+\s×\s\d+$/.test(txt(el))) return;
      if (!el.classList.contains("xn-dim")) el.classList.add("xn-dim");
      var card = el.parentElement;
      if (!card) return;
      if (!card.classList.contains("xn-dim-card")) card.classList.add("xn-dim-card");
      card.classList.toggle("xn-dim-active", !!ratio && txt(card).indexOf(ratio) >= 0);
    });
  }

  /* ---------- 6. 操作 ---------- */
  function markActions() {
    [].slice.call(document.querySelectorAll("#root button")).filter(visible).forEach(function (b) {
      var t = txt(b);
      if (t.indexOf("下载裁剪图片") >= 0 || t.indexOf("下载圆形头像") >= 0) {
        if (!b.classList.contains("xn-download")) b.classList.add("xn-download");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", t);
      } else if (t === "重置") {
        if (!b.classList.contains("xn-reset")) b.classList.add("xn-reset");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "重置裁剪设置");
      } else if (t.indexOf("使用示例图片") >= 0) {
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", t);
      } else if (t.indexOf("复制结果说明") >= 0) {
        if (!b.classList.contains("xn-note-copy")) b.classList.add("xn-note-copy");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", t);
      }
    });
  }

  /* ---------- 7. 头像输出尺寸 ---------- */
  function markAvatarSizes() {
    var sizeBtns = [].slice.call(document.querySelectorAll("#root button")).filter(function (b) {
      return /^\d+\s*px$/.test(txt(b)) && visible(b);
    });
    sizeBtns.forEach(function (b) {
      if (!b.classList.contains("xn-size")) b.classList.add("xn-size");
      var on = String(hasClass(b, "border-blue-600"));
      if (b.getAttribute("aria-pressed") !== on) b.setAttribute("aria-pressed", on);
    });
    if (sizeBtns[0] && sizeBtns[0].parentElement) {
      var g = sizeBtns[0].parentElement;
      if (g.getAttribute("role") !== "group") {
        g.setAttribute("role", "group");
        g.setAttribute("aria-label", "输出尺寸（px）");
      }
    }
  }

  /* ---------- 8. 输出信息 KPI ---------- */
  function markKpi() {
    var sec = [].slice.call(document.querySelectorAll("#root section")).find(function (s) {
      var h = s.querySelector("h3");
      return h && txt(h) === "输出信息";
    });
    if (!sec) return;
    var grid = sec.querySelector("div.grid");
    if (!grid) return;
    [].slice.call(grid.children).forEach(function (card) {
      if (!card.classList.contains("xn-kpi-card")) card.classList.add("xn-kpi-card");
    });
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    markTabs();
    markSegments();
    markRange();
    markPreview();
    markOutput();
    markActions();
    markAvatarSizes();
    markKpi();
  }

  var scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(function () { scheduled = false; try { updateAll(); } catch (e) {} }, 180);
  }

  function boot() {
    var root = document.getElementById("root");
    if (!root) { setTimeout(boot, 300); return; }
    updateAll();
    new MutationObserver(schedule).observe(root, {
      childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["class"]
    });
    window.addEventListener("hashchange", schedule);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
