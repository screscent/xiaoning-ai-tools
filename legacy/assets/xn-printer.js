/* 家用打印机与耗材合集页增强（仅 glrfuqcqng 引用） */
(function () {
  "use strict";
  if (window.__XN_PRN__) return;
  window.__XN_PRN__ = true;

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

  /* ---------- 选择卡语义 ---------- */
  function markChoices() {
    var btns = document.querySelectorAll("#root button");
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      var cls = b.className || "";
      if (!/group rounded-xl border|rounded-full border/.test(cls)) continue;
      var t = txt(b);
      if (!t || /复制|计算|进入|下载/.test(t)) continue;
      var on = /border-teal-600|bg-teal-600/.test(cls);
      if (b.getAttribute("aria-pressed") === null) b.setAttribute("aria-pressed", on ? "true" : "false");
    }
  }

  /* ---------- 输入语义 ---------- */
  function fixAria() {
    var ins = [].slice.call(document.querySelectorAll("#root input")).filter(visible);
    ins.forEach(function (input) {
      var a = (input.getAttribute("aria-label") || "").trim();
      if (a === "g/㎡") input.setAttribute("aria-label", "纸张克重（g/㎡）");
      else if (a === "张") input.setAttribute("aria-label", "打印张数（张）");
    });
  }

  /* ---------- 数值与参考价 ---------- */
  function markNumbers() {
    var nodes = document.querySelectorAll("#root span, #root strong, #root b, #root p");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.children.length) continue;
      var t = txt(el);
      el.classList.remove("xn-prn-val", "xn-prn-price");
      var ptext = el.parentElement ? txt(el.parentElement) : "";
      if (/^\d+ 页 \/ 月/.test(t) || /^\d+(\.\d+)?%$/.test(t) || /^¥\d+(\.\d+)? \/ 页$/.test(t) || /^\d+ 张$/.test(t)) {
        if (/月打印量|彩色页占比|纸张单价|打印数量|纸张克重/.test(ptext)) el.classList.add("xn-prn-val");
      }
      if (/^参考价\s*¥/.test(t)) el.classList.add("xn-prn-price");
    }
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    cleanupHints();
    fixPlaceholders();
    markChoices();
    fixAria();
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
      childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["class"]
    });
    window.addEventListener("hashchange", schedule);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
