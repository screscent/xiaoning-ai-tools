/* 习惯养成与打卡合集页增强（仅 uidaynxjku 引用） */
(function () {
  "use strict";
  if (window.__XN_HABIT__) return;
  window.__XN_HABIT__ = true;

  function txt(el) { return (el.textContent || "").trim(); }
  function visible(el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }
  function setVal(el, v) {
    var proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    proto.set.call(el, String(v));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  /* ---------- tab 当前态 ---------- */
  function markTabs() {
    var hash = (location.hash || "").replace(/^#/, "") || "habit";
    var links = document.querySelectorAll('#root a[href^="#/"]');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var target = (a.getAttribute("href") || "").slice(2);
      if (target === hash) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    }
  }

  /* ---------- 占位标题 ---------- */
  var TOOL_NO = { E: "05", F: "06" };
  function fixPlaceholders() {
    var nodes = document.querySelectorAll("#root span, #root p, #root h1, #root h2, #root h3, #root a, #root strong, #root b, #root button");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.children.length) continue;
      var t = txt(el);
      var m = /^工具([EF])(\s*)(.*)$/.exec(t);
      if (m) {
        el.textContent = "工具 " + TOOL_NO[m[1]] + (m[3] ? " " + m[3] : "");
        continue;
      }
      if (t === "E" || t === "F") {
        var nx = el.nextElementSibling;
        if (nx && /^H2$/.test(nx.tagName) && /^工具 0[56]/.test(txt(nx))) el.textContent = TOOL_NO[t];
      }
    }
    var h2s = document.querySelectorAll("#root h2");
    for (var j = 0; j < h2s.length; j++) {
      var kids = h2s[j].childNodes;
      for (var k = 0; k < kids.length; k++) {
        var n = kids[k];
        if (n.nodeType !== 3) continue;
        var nt = (n.nodeValue || "").trim();
        var nm = /^工具([EF])(\s*)(.*)$/.exec(nt);
        if (nm) n.nodeValue = "工具 " + TOOL_NO[nm[1]] + (nm[3] ? " " + nm[3] : "");
      }
    }
  }

  /* ---------- 语义回填 ---------- */
  var NAME_RULES = [
    { re: /^天$/, ctx: /补签/, name: "每月补签上限（天）" },
    { re: /^单位$/, name: "目标总量" },
    { re: /^天$/, ctx: /周期/, name: "周期天数（天）" },
    { re: /^天$/, ctx: /每周/, name: "每周可投入天数（天）" }
  ];

  function ctxOf(el) {
    var lab = el.closest("label");
    if (lab) return txt(lab).replace(/\s+/g, "");
    var p = el.parentElement;
    for (var i = 0; i < 2 && p; i++) {
      var t = txt(p).replace(/\s+/g, "");
      if (t.length > 2) return t.slice(0, 60);
      p = p.parentElement;
    }
    return "";
  }

  function fixAria() {
    var inputs = [].slice.call(document.querySelectorAll("#root input")).filter(visible);
    inputs.forEach(function (input) {
      var a = (input.getAttribute("aria-label") || "").trim();
      var ctx = ctxOf(input);
      for (var i = 0; i < NAME_RULES.length; i++) {
        var r = NAME_RULES[i];
        if (!r.re.test(a)) continue;
        if (r.ctx && !r.ctx.test(ctx)) continue;
        input.setAttribute("aria-label", r.name);
        return;
      }
      if (!a) {
        var lab = input.closest("label");
        if (lab) input.setAttribute("aria-label", txt(lab).replace(/\s+/g, " ").slice(0, 20));
      }
    });

    /* 阶段目标文本域 */
    var tas = [].slice.call(document.querySelectorAll("#root textarea")).filter(visible);
    var idx = 0;
    tas.forEach(function (ta) {
      if (ta.getAttribute("aria-label") || ta.readOnly) return;
      idx++;
      ta.setAttribute("aria-label", "阶段目标 " + idx);
    });

    /* 阶段目标输入：按占位符成对命名 */
    var stage = 0;
    [].slice.call(document.querySelectorAll("#root input")).filter(visible).forEach(function (input) {
      if (input.getAttribute("aria-label")) return;
      var ph = input.getAttribute("placeholder") || "";
      if (ph === "阶段名") {
        stage++;
        input.setAttribute("aria-label", "阶段 " + stage + " 名称");
      } else if (ph === "阶段目标") {
        input.setAttribute("aria-label", "阶段 " + Math.max(stage, 1) + " 目标");
      }
    });

    /* 空文本图标按钮：仅处理习惯行里的删除按钮 */
    var btns = [].slice.call(document.querySelectorAll("#root button")).filter(visible);
    btns.forEach(function (b) {
      if (txt(b) || b.getAttribute("aria-label")) return;
      var row = b.parentElement;
      for (var i = 0; i < 3 && row; i++) {
        var t = txt(row).replace(/\s+/g, " ");
        if (/今日打卡/.test(t)) { b.setAttribute("aria-label", "删除习惯"); return; }
        row = row.parentElement;
      }
    });

    /* 开关 / 分段按钮 */
    var sws = document.querySelectorAll("#root [role=switch]");
    for (var s = 0; s < sws.length; s++) {
      if (!sws[s].getAttribute("aria-label")) sws[s].setAttribute("aria-label", "显示连续天数");
    }
    var segs = ["拖延", "疲劳", "忘记", "计划过满", "情绪低落", "受干扰", "其他", "运动", "阅读", "早起", "喝水", "背单词", "温和", "坚定", "幽默"];
    btns.forEach(function (b) {
      var t = txt(b);
      if (segs.indexOf(t) < 0) return;
      if (b.getAttribute("aria-pressed") === null && b.getAttribute("role") !== "switch") {
        var on = /border-green|bg-green|border-emerald|bg-emerald/.test(b.className);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      }
    });
  }

  /* ---------- 常用习惯快填 ---------- */
  var PRESETS = ["喝水", "早睡", "运动", "阅读", "冥想"];
  function addPresets() {
    var input = document.querySelector("#root input[aria-label='习惯名称']");
    if (!input) return;
    if (input.__xnPresets && input.__xnPresets.isConnected) return;
    var addBtn = null;
    var btns = document.querySelectorAll("#root button");
    for (var i = 0; i < btns.length; i++) if (/添加习惯/.test(txt(btns[i]))) { addBtn = btns[i]; break; }
    if (!addBtn) return;
    var host = addBtn.parentElement;
    if (!host) return;
    var wrap = document.createElement("div");
    wrap.className = "xn-chips";
    PRESETS.forEach(function (name) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = name;
      b.onclick = function () {
        setVal(input, name);
        setTimeout(function () {
          addBtn.click();
          setTimeout(updateAll, 120);
        }, 40);
      };
      wrap.appendChild(b);
    });
    /* 放在「开关 + 添加」整行的上方，避免挤成窄列 */
    var row = addBtn.parentElement;
    if (row && row.parentElement) row.parentElement.insertBefore(wrap, row);
    else host.appendChild(wrap);
    input.__xnPresets = wrap;
  }

  /* ---------- 数字分级与按钮着色 ---------- */
  function markNumbers() {
    var nodes = document.querySelectorAll("#root span, #root p, #root strong, #root b");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.children.length) continue;
      var t = txt(el);
      el.classList.remove("xn-habit-pct", "xn-habit-day", "xn-habit-today", "xn-habit-meta");
      if (/^\d+(\.\d+)?%$/.test(t)) el.classList.add("xn-habit-pct");
      else if (/^\d+\s*天$/.test(t)) el.classList.add("xn-habit-day");
      else if (/^共 \d+ 个 · 今日 \d+\/\d+$/.test(t)) el.classList.add("xn-habit-today");
      else if (/^累计打卡 \d+ 次$|^连续 \d+ 天$/.test(t)) el.classList.add("xn-habit-meta");
    }
    /* 日历格 hover/触控 */
    var cells = document.querySelectorAll("#root button");
    for (var j = 0; j < cells.length; j++) {
      var b = cells[j];
      if (/^\d{1,2}$/.test(txt(b)) && b.className.indexOf("h-") >= 0) b.classList.add("xn-habit-cell");
    }
    /* 清空按钮红调 */
    var all = document.querySelectorAll("#root button");
    for (var k = 0; k < all.length; k++) {
      if (/清空全部数据|删除/.test(txt(all[k]))) all[k].classList.add("xn-danger");
    }
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    markTabs();
    fixPlaceholders();
    fixAria();
    addPresets();
    markNumbers();
  }

  var scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(function () { scheduled = false; try { updateAll(); } catch (e) {} }, 200);
  }

  function boot() {
    var root = document.getElementById("root");
    if (!root) { setTimeout(boot, 300); return; }
    updateAll();
    new MutationObserver(schedule).observe(root, {
      childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["class", "aria-pressed"]
    });
    window.addEventListener("hashchange", schedule);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
