/* 文本改写与降重合集页增强（仅 4gswjgbtnf 引用） */
(function () {
  "use strict";
  if (window.__XN_RW__) return;
  window.__XN_RW__ = true;

  function txt(el) { return (el.textContent || "").trim(); }

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
        var sib = el.nextSibling;
        if (!m[3] && sib && sib.nodeType === 3 && /^\S/.test(sib.nodeValue)) el.textContent += " ";
        continue;
      }
      if (t === "E" || t === "F") {
        var nx = el.nextElementSibling;
        if (nx && /^H2$/.test(nx.tagName) && /^工具 0[56]/.test(txt(nx))) el.textContent = TOOL_NO[t] + " ";
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

  /* ---------- hash 当前态 ---------- */
  function markHashLinks() {
    var hash = (location.hash || "").replace(/^#/, "");
    var links = document.querySelectorAll('#root a[href^="#/"]');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var target = (a.getAttribute("href") || "").slice(2);
      var on = !!hash && target === hash;
      a.classList.toggle("xn-rw-cur", on);
      if (on) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    }
  }

  /* ---------- 数字 ---------- */
  function markNumbers() {
    var nodes = document.querySelectorAll("#root span, #root strong, #root b, #root p");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.children.length) continue;
      var t = txt(el);
      el.classList.remove("xn-rw-count", "xn-rw-rate");
      if (/^\d+\s*字$/.test(t)) el.classList.add("xn-rw-count");
      else if (/^\d+(\.\d+)?%$/.test(t)) {
        var p = el.parentElement ? txt(el.parentElement) : "";
        if (/重合率|相似度|降重|重复率/.test(p)) el.classList.add("xn-rw-rate");
      }
    }
  }

  /* ---------- 回到顶部 ---------- */
  function addBackTop() {
    if (document.getElementById("xn-rw-top")) return;
    var b = document.createElement("button");
    b.type = "button";
    b.id = "xn-rw-top";
    b.setAttribute("aria-label", "回到顶部切换工具");
    b.textContent = "↑ 切换工具";
    b.onclick = function () { window.scrollTo({ top: 0, behavior: "smooth" }); };
    document.body.appendChild(b);
    function sync() { b.classList.toggle("is-show", window.scrollY > 600); }
    window.addEventListener("scroll", sync, { passive: true });
    sync();
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    fixPlaceholders();
    markHashLinks();
    markNumbers();
    addBackTop();
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
