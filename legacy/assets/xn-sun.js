/* 防晒用量与紫外线建议合集页增强（仅 3xmlz85af3 引用） */
(function () {
  "use strict";
  if (window.__XN_SUN__) return;
  window.__XN_SUN__ = true;

  function txt(el) { return (el.textContent || "").trim(); }
  function visible(el) {
    if (!el) return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  /* ---------- 1. 入口卡当前态 ---------- */
  function markTabs() {
    var root = document.getElementById("root");
    if (!root) return;
    var links = [].slice.call(root.querySelectorAll('a[href^="#/"]'));
    links.forEach(function (a) {
      var on = (a.className || "").toString().indexOf("border-blue-400") >= 0;
      if (on && a.getAttribute("aria-current") !== "page") a.setAttribute("aria-current", "page");
      if (!on && a.getAttribute("aria-current")) a.removeAttribute("aria-current");
    });
  }

  /* ---------- 2. 输入语义 ---------- */
  function fixInputs() {
    var ins = [].slice.call(document.querySelectorAll('#root input[type="number"]')).filter(visible);
    ins.forEach(function (input) {
      var field = input.closest('[data-code-inspect-component="Field"]');
      var lab = field ? field.querySelector("label") : null;
      var name = lab ? txt(lab).replace(/\s+/g, "") : "";
      if (!name) return;
      var wrap = input.parentElement;
      var unitEl = wrap ? wrap.querySelector("span") : null;
      var unit = unitEl ? txt(unitEl).replace(/\s+/g, "") : "";
      var aria = name;
      if (unit && !/[（(]/.test(name)) aria = name + "（" + unit + "）";
      if (input.getAttribute("aria-label") !== aria) input.setAttribute("aria-label", aria);
    });
  }

  /* ---------- 3. 结果层级 ---------- */
  function markMetrics() {
    var cards = [].slice.call(document.querySelectorAll('#root [data-code-inspect-component="ResultCard"]')).filter(visible);
    cards.forEach(function (c) {
      var vals = c.querySelectorAll("div.text-lg");
      for (var i = 0; i < vals.length; i++) {
        if (!vals[i].classList.contains("xn-met")) vals[i].classList.add("xn-met");
        vals[i].classList.remove("xn-met-primary");
      }
      if (vals[0]) vals[0].classList.add("xn-met-primary");
    });
  }

  /* ---------- 4. 复制 ---------- */
  function markCopy() {
    var btns = [].slice.call(document.querySelectorAll("#root button"));
    btns.forEach(function (b) {
      var t = txt(b);
      if (!/^复制结果|^复制建议/.test(t)) return;
      if (!b.classList.contains("xn-copy")) b.classList.add("xn-copy");
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", t);
    });
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    markTabs();
    fixInputs();
    markMetrics();
    markCopy();
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
