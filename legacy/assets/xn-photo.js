/* 摄影与构图速查合集页增强（仅 2q8ndyqqxb 引用）
 * - 浮动「打印 / 存 PDF」按钮（速查页可打印带走）
 * - 6 个导航卡补 aria-current，EV 徽标加强
 */
(function () {
  "use strict";
  if (window.__XN_PHOTO__) return;
  window.__XN_PHOTO__ = true;

  function txt(el) { return (el.textContent || "").trim(); }

  function addPrintBtn() {
    if (document.getElementById("xn-print")) return;
    var b = document.createElement("button");
    b.type = "button";
    b.id = "xn-print";
    b.className = "xn-print-btn";
    b.textContent = "打印 / 存 PDF";
    b.title = "打印当前速查内容或另存为 PDF";
    b.onclick = function () { window.print(); };
    var host = document.getElementById("root") || document.body;
    host.appendChild(b);
  }

  function fixNav() {
    var links = [].slice.call(document.querySelectorAll('#root a[href^="#/"]'));
    var navGrid = document.querySelector("#root .xn-nav-grid");
    if (!navGrid && links.length) {
      var grid = links[0].parentElement;
      if (grid && grid.querySelectorAll('a[href^="#/"]').length >= 3) grid.classList.add("xn-nav-grid");
    }
    links.forEach(function (a) {
      if (/bg-stone-900/.test((a.className || "").toString())) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  function markObjects() {
    [].slice.call(document.querySelectorAll("#root span, #root div, #root p")).forEach(function (el) {
      if (el.children.length) return;
      if (/^[−+\-]?\d+(\.\d+)?\sEV$/.test(txt(el))) el.classList.add("xn-ev");
    });
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (/^⧉?\s*复制/.test(txt(b))) b.classList.add("xn-copy");
    });
  }

  /* ---------- 移动端常驻参数条 ---------- */
  function mobileBar() {
    var bar = document.getElementById("xn-mbar");
    var mobile = window.innerWidth <= 640;
    var onExposure = /exposure/.test(location.hash || "#/exposure");
    if (!mobile || !onExposure) {
      if (bar) bar.style.display = "none";
      return;
    }
    var leaves = [].slice.call(document.querySelectorAll("#root p, #root span, #root b")).filter(function (e) {
      return e.children.length === 0;
    });
    var ap = "", sh = "", iso = "", ev = "";
    leaves.forEach(function (e) {
      var t = txt(e);
      if (!ap && /^f\/\d+(\.\d+)?$/.test(t)) ap = t;
      else if (!sh && /^\d+\/\d+s?$/.test(t)) sh = t;
      else if (!ev && /^[−+\-]?\d+(\.\d+)?\sEV$/.test(t)) ev = t;
    });
    var isoLab = leaves.filter(function (e) { return txt(e) === "ISO"; })[0];
    if (isoLab && isoLab.parentElement) {
      var m = (isoLab.parentElement.innerText || "").match(/\d{2,6}/);
      if (m) iso = m[0];
    }
    if (!ap && !sh) return;
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "xn-mbar";
      bar.className = "xn-mbar";
      var host = document.getElementById("root") || document.body;
      host.appendChild(bar);
    }
    bar.style.display = "flex";
    var html = "";
    if (ap) html += '<span class="k">光圈</span><b>' + ap + "</b>";
    if (sh) html += '<span class="k">快门</span><b>' + sh + "</b>";
    if (iso) html += '<span class="k">ISO</span><b>' + iso + "</b>";
    if (ev) html += '<span class="xn-mbar-ev">' + ev + "</span>";
    if (bar.innerHTML !== html) bar.innerHTML = html;
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    addPrintBtn();
    fixNav();
    markObjects();
    mobileBar();
  }

  var scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(function () { scheduled = false; try { updateAll(); } catch (e) {} }, 240);
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
  window.addEventListener("resize", schedule);
})();
