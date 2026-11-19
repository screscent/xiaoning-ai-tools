/* 数据可视化与图表选型合集页增强（仅 4gzfddbtnf 引用） */
(function () {
  "use strict";
  if (window.__XN_VIZ__) return;
  window.__XN_VIZ__ = true;

  function txt(el) { return (el.textContent || "").trim(); }
  function visible(el) {
    if (!el) return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  /* ---------- 1. tab ---------- */
  function markTabs() {
    var root = document.getElementById("root");
    if (!root) return;
    var links = [].slice.call(root.querySelectorAll("a")).filter(function (a) { return /^#\//.test(a.getAttribute("href") || ""); });
    if (!links.length) return;
    var wrap = links[0].parentElement;
    if (wrap && !wrap.classList.contains("xn-tabs")) wrap.classList.add("xn-tabs");
    var r = (location.hash || "").replace(/^#/, "");
    links.forEach(function (a) {
      var on = a.getAttribute("href") === "#" + r;
      if (on && a.getAttribute("aria-current") !== "page") a.setAttribute("aria-current", "page");
      if (!on && a.getAttribute("aria-current")) a.removeAttribute("aria-current");
    });
  }

  /* ---------- 2. 复制 ---------- */
  function markCopy() {
    var btns = [].slice.call(document.querySelectorAll("#root button"));
    btns.forEach(function (b) {
      if (!/^复制结果/.test(txt(b))) return;
      if (!b.classList.contains("xn-copy")) b.classList.add("xn-copy");
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "复制结果");
    });
  }

  /* ---------- 3. HEX 输入语义 ---------- */
  function markHex() {
    var ins = [].slice.call(document.querySelectorAll('#root input[type="text"]')).filter(visible);
    var hexes = ins.filter(function (i) { return /^#[0-9a-fA-F]{3,8}$/.test(i.value || ""); });
    if (hexes[0] && !hexes[0].getAttribute("aria-label")) hexes[0].setAttribute("aria-label", "背景色 HEX 值");
    if (hexes[1] && !hexes[1].getAttribute("aria-label")) hexes[1].setAttribute("aria-label", "主色 HEX 值");
  }

  /* ---------- 4. 推荐结论与对比度 ---------- */
  function markRec() {
    var ps = document.querySelectorAll("#root p, #root div");
    for (var i = 0; i < ps.length; i++) {
      var el = ps[i];
      if (el.children.length) continue;
      var t = txt(el);
      if (/^推荐使用：/.test(t)) {
        if (!el.classList.contains("xn-rec-title")) el.classList.add("xn-rec-title");
        var card = el.parentElement ? el.parentElement.parentElement : null;
        if (card && !card.classList.contains("xn-rec-card")) card.classList.add("xn-rec-card");
      } else if (/^\d+(\.\d+)?\s*:\s*1$/.test(t)) {
        if (!el.classList.contains("xn-ratio")) el.classList.add("xn-ratio");
      }
    }
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    markTabs();
    markCopy();
    markHex();
    markRec();
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
