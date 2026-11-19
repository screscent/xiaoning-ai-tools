/* 网络与域名速查合集页增强（仅 rdyh2c4t4r 引用） */
(function () {
  "use strict";
  if (window.__XN_NET__) return;
  window.__XN_NET__ = true;

  function txt(el) { return (el.textContent || "").trim(); }

  /* ---------- tab 当前态 ---------- */
  function markTabs() {
    var hash = (location.hash || "").replace(/^#/, "") || "dns";
    var links = document.querySelectorAll('#root a[href^="#/"]');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var target = (a.getAttribute("href") || "").slice(2);
      a.classList.add("xn-net-tab");
      var on = target === hash;
      a.classList.toggle("is-on", on);
      if (on) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    }
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    markTabs();
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
      childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["class"]
    });
    window.addEventListener("hashchange", schedule);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
