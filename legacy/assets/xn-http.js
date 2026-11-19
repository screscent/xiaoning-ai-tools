/* HTTP 接口调试合集页增强（仅 puusba3a4t 引用） */
(function () {
  "use strict";
  if (window.__XN_HTTP__) return;
  window.__XN_HTTP__ = true;

  function txt(el) { return (el.textContent || "").trim(); }
  function visible(el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  /* ---------- 路由串清理 ---------- */
  function cleanupHints() {
    var nodes = document.querySelectorAll("#root span, #root p, #root div");
    for (var i = nodes.length - 1; i >= 0; i--) {
      var el = nodes[i];
      if (el.children.length) continue;
      if (!/^#\/[\w-]+$/.test(txt(el))) continue;
      var p = el.parentElement;
      if (p && /^LI$/.test(p.tagName)) continue;
      if (p) p.removeChild(el);
    }
  }

  /* ---------- tab 当前态 ---------- */
  function markTabs() {
    var hash = (location.hash || "").replace(/^#/, "") || "status";
    var links = document.querySelectorAll('#root a[href^="#/"]');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var target = (a.getAttribute("href") || "").slice(2);
      if (target === hash) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    }
  }

  /* ---------- 输入语义 ---------- */
  function fixAria() {
    var ins = [].slice.call(document.querySelectorAll("#root input")).filter(visible);
    ins.forEach(function (input) {
      if (input.getAttribute("aria-label")) return;
      var ph = input.getAttribute("placeholder") || "";
      var lab = input.closest("label");
      var ctx = lab ? txt(lab) : (input.parentElement ? txt(input.parentElement) : "");
      var name = "";
      var hash = (location.hash || "").replace(/^#/, "") || "status";
      if (input.type === "number") {
        if (hash === "mock") name = "生成条数";
        else if (hash === "retry") name = "总超时预算（秒）";
        else if (/条数|生成/.test(ctx + ph)) name = "生成条数";
        else if (/超时/.test(ctx + ph)) name = "总超时预算（秒）";
      } else {
        if (/如 404/.test(ph)) name = "输入状态码（100–599）";
        else if (/状态码/.test(ctx + ph)) name = "输入状态码（100–599）";
        else if (/协商缓存|ETag/.test(ph)) name = "输入关键词（如 协商缓存 / ETag）";
        else if (/Cookie|预检/.test(ph)) name = "输入场景（如 带 Cookie / 预检）";
      }
      if (name) input.setAttribute("aria-label", name);
    });
  }

  /* ---------- 状态码胶囊 ---------- */
  function markStatusChips() {
    var btns = document.querySelectorAll("#root button");
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      if (!/^\d{3}$/.test(txt(b))) continue;
      b.classList.add("xn-http-chip");
    }
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    cleanupHints();
    markTabs();
    fixAria();
    markStatusChips();
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
