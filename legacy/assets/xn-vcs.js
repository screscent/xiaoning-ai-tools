/* xn-vcs.js · Git 场景命令合集 人用友好增强（幂等） */
(function () {
  if (window.__XN_VCS__) return;
  window.__XN_VCS__ = 1;

  var root = function () { return document.querySelector("#root"); };
  var norm = function (s) { return (s || "").replace(/\s+/g, " ").trim(); };

  function normalizeNavText() {
    var r = root(); if (!r) return;
    r.querySelectorAll("nav a").forEach(function (a) {
      if (a.dataset.vcsNav) return;
      var txt = norm(a.textContent);
      var m = txt.match(/^工具\s*([A-Z])\s*[·:：]?\s*(.*)$/);
      if (m) a.textContent = m[2];
      a.dataset.vcsNav = "1";
    });
  }

  function normalizeH2() {
    var r = root(); if (!r) return;
    r.querySelectorAll("section h2").forEach(function (h) {
      if (h.dataset.vcsNorm) return;
      var txt = norm(h.textContent);
      var m = txt.match(/^工具\s*([A-Z])\s*[·:：]?\s*(.*)$/);
      if (m) {
        var n = m[1].charCodeAt(0) - 64;
        h.textContent = "工具 " + String(n).padStart(2, "0") + " · " + m[2];
      }
      h.dataset.vcsNorm = "1";
    });
  }

  function markNav() {
    var r = root(); if (!r) return;
    var links = [].slice.call(r.querySelectorAll("nav a"));
    if (!links.length) return;
    var hash = (location.hash || "").replace(/\/+$/, "");
    var match = null;
    links.forEach(function (a) { if (a.getAttribute("href") === hash) match = a; });
    if (!match) { links.forEach(function (a) { if (/bg-white\/1|text-white/.test(a.className || "")) match = a; }); }
    if (!match) match = links[0];
    links.forEach(function (a) {
      var on = a === match;
      a.classList.toggle("px-active", on);
      if (on) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  function decorate() {
    var r = root(); if (!r) return;
    /* 菜单卡 */
    r.querySelectorAll('a[href^="#/"]').forEach(function (a) {
      if (a.closest("nav")) return;
      a.classList.add("px-card");
    });
    /* 进入 文案高亮 */
    r.querySelectorAll("span, div").forEach(function (e) {
      if (e.children.length) return;
      if (norm(e.textContent) === "进入") e.classList.add("px-enter");
    });
    /* 场景列表按钮：以 0X 开头 */
    r.querySelectorAll("section button").forEach(function (b) {
      var txt = norm(b.textContent);
      var aria = b.getAttribute("aria-label");
      if (/^0\d/.test(txt) && !aria) {
        b.classList.add("px-scen");
        b.setAttribute("aria-label", txt.slice(0, 40));
        var on = /amber|bg-white\/1|text-white/.test(b.className || "");
        if (on) b.classList.add("px-scen-on");
        b.setAttribute("aria-pressed", on ? "true" : "false");
        return;
      }
      if (aria === "复制命令" || /^复制/.test(txt)) {
        b.classList.add("px-copy");
        if (!aria) b.setAttribute("aria-label", "复制命令");
      }
    });
  }

  function run() { normalizeNavText(); normalizeH2(); markNav(); decorate(); }

  function start() {
    run();
    window.addEventListener("hashchange", function () { setTimeout(run, 120); });
    var r = root();
    if (r && !window.__XN_VCS_OBS__) {
      window.__XN_VCS_OBS__ = 1;
      var t = null;
      new MutationObserver(function () {
        if (t) return;
        t = setTimeout(function () { t = null; run(); }, 130);
      }).observe(r, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
