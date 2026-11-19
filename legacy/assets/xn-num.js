/* 数字读法与人民币大写合集页增强（仅 c7rkj6egmi 引用） */
(function () {
  "use strict";
  if (window.__XN_NUM__) return;
  window.__XN_NUM__ = true;

  function txt(el) { return (el.textContent || "").trim().replace(/\s+/g, " "); }
  function visible(el) {
    if (!el) return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }
  function hasClass(el, s) {
    return !!el && (el.className || "").toString().indexOf(s) >= 0;
  }

  var TOOLS = ["英文读法", "人民币大写"];

  /* ---------- 1. 工具切换 ---------- */
  function markPills() {
    var pills = [].slice.call(document.querySelectorAll("#root button")).filter(function (b) {
      return TOOLS.indexOf(txt(b)) >= 0;
    });
    pills.forEach(function (b) {
      var on = String(hasClass(b, "bg-indigo-600"));
      if (b.getAttribute("aria-pressed") !== on) b.setAttribute("aria-pressed", on);
      if (!b.classList.contains("xn-pill")) b.classList.add("xn-pill");
    });
    if (pills[0] && pills[0].parentElement) {
      var g = pills[0].parentElement;
      if (!g.classList.contains("xn-pills")) g.classList.add("xn-pills");
      if (g.getAttribute("role") !== "group") {
        g.setAttribute("role", "group");
        g.setAttribute("aria-label", "工具切换");
      }
    }
  }

  /* ---------- 2. 开关命名 ---------- */
  function markSwitches() {
    var map = { "and-switch": "英式 and", "ordinal-switch": "同时给出序数词" };
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el && !el.getAttribute("aria-label")) el.setAttribute("aria-label", map[id]);
    });
  }

  /* ---------- 3. 示例值千分位 ---------- */
  function markExamples() {
    [].slice.call(document.querySelectorAll("#root button")).filter(visible).forEach(function (b) {
      var t = txt(b);
      if (!/^-?\d+$/.test(t)) return;
      if (!b.classList.contains("xn-ex")) b.classList.add("xn-ex");
      var label = "填入示例 " + Number(t).toLocaleString("zh-CN");
      if (b.getAttribute("aria-label") !== label) b.setAttribute("aria-label", label);
      if (Math.abs(Number(t)) >= 10000) {
        var pretty = Number(t).toLocaleString("zh-CN");
        if (t !== pretty) b.textContent = pretty;
      }
    });
  }

  /* ---------- 4. 结果层级 ---------- */
  function markResult() {
    [].slice.call(document.querySelectorAll("#root pre")).filter(visible).forEach(function (pre) {
      if (!txt(pre)) return;
      if (!pre.classList.contains("xn-result-text")) pre.classList.add("xn-result-text");
      if (pre.parentElement && !hasClass(pre.parentElement, "xn-result-box")) {
        pre.parentElement.classList.add("xn-result-box");
      }
    });
  }

  /* ---------- 5. 分组卡 ---------- */
  function markGroups() {
    [].slice.call(document.querySelectorAll("#root div")).filter(visible).forEach(function (d) {
      if (!hasClass(d, "flex") || !hasClass(d, "justify-between")) return;
      if (!/×[\d,]+/.test(txt(d))) return;
      if (!d.classList.contains("xn-group")) d.classList.add("xn-group");
    });
  }

  /* ---------- 6. 操作与提示 ---------- */
  function markActions() {
    [].slice.call(document.querySelectorAll("#root button")).filter(visible).forEach(function (b) {
      var t = txt(b);
      if (["转换", "复制结果", "清空", "重新转换"].indexOf(t) < 0) return;
      if (!b.classList.contains("xn-action")) b.classList.add("xn-action");
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", t);
    });
  }
  function markNotes() {
    [].slice.call(document.querySelectorAll("#root section")).forEach(function (sec) {
      if (txt(sec).indexOf("支持范围与负数提示") < 0) return;
      var ul = sec.querySelector("ul");
      if (ul && !ul.classList.contains("xn-notes")) ul.classList.add("xn-notes");
    });
  }
  function markSecTitles() {
    [].slice.call(document.querySelectorAll("#root div")).forEach(function (el) {
      if (!hasClass(el, "mb-3") || !hasClass(el, "flex")) return;
      var t = txt(el);
      if (t.length > 18 || !/^[①②③④⑤⑥]/.test(t)) return;
      if (!el.classList.contains("xn-sec-head")) el.classList.add("xn-sec-head");
    });
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    markPills();
    markSwitches();
    markExamples();
    markResult();
    markGroups();
    markActions();
    markNotes();
    markSecTitles();
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
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
