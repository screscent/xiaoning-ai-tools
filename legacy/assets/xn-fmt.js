/* 图片格式转换页增强（仅 dvz878gy5d 引用）
 * 1) 目标格式/输出质量/输出尺寸 三个选项组补释义
 * 2) 转换按钮上方显示「当前设置」摘要
 * 3) 结果区体积数字放大，节省比例做成绿色徽标
 * 4) 不侵入业务逻辑：只加 class / 提示节点，跟随 React 重渲染
 */
(function () {
  "use strict";
  if (window.__XN_FMT__) return;
  window.__XN_FMT__ = true;

  var FMT_TIP = {
    PNG: "PNG：无损、支持透明，体积通常最大；适合图标、截图、UI 素材。",
    JPG: "JPG：有损压缩、体积小；适合照片，不支持透明背景。",
    JPEG: "JPG：有损压缩、体积小；适合照片，不支持透明背景。",
    WebP: "WebP：体积最小、兼容现代浏览器；网页用图优先。"
  };
  var Q_TIP = "质量越低体积越小；照片建议 80%，图标/截图建议 100%（接近无损）。";
  var S_TIP = "保持原尺寸不缩放；选 1920/1280/800 会按长边等比缩小。";

  function txt(el) { return (el.textContent || "").trim(); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function active(b) {
    var c = (b.className || "").toString();
    return /bg-blue-600|bg-blue-500|bg-indigo-\d00/.test(c) || b.getAttribute("aria-pressed") === "true";
  }
  function groupOf(b) {
    var t = txt(b);
    if (/^(PNG|JPG|JPEG|WebP)$/i.test(t)) return "fmt";
    if (/^\d+%$/.test(t)) return "q";
    if (t === "保持原尺寸" || /^\d+px$/.test(t)) return "size";
    return "";
  }
  function selectedIn(btns, g) {
    var hit = btns.filter(function (b) { return groupOf(b) === g && active(b); })[0];
    return hit ? txt(hit) : "";
  }
  function ensureTip(row, text) {
    if (!row || !row.parentElement) return null;
    var tip = row.nextElementSibling;
    if (!tip || !tip.classList || !tip.classList.contains("xn-tip")) {
      tip = document.createElement("div");
      tip.className = "xn-tip";
      row.parentElement.insertBefore(tip, row.nextSibling);
    }
    if (tip.textContent !== text) tip.textContent = text;
    return tip;
  }

  function markNumbers() {
    var nodes = document.querySelectorAll("#root span, #root div, #root p, #root strong");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.children.length) continue;
      var t = (el.textContent || "").trim();
      if (!t || t.length > 16) continue;
      if (/^\d+(\.\d+)?\s?(B|KB|MB)$/.test(t)) {
        var ctx = "";
        var p = el;
        for (var k = 0; k < 8 && p; k++, p = p.parentElement) ctx += txt(p).slice(0, 120);
        var big = /转换结果/.test(ctx) && /下载/.test(ctx);
        el.classList.add(big ? "xn-num" : "xn-num-sm");
      } else if (/^节省\s?\d/.test(t) && !el.classList.contains("xn-save")) {
        el.classList.add("xn-save");
      }
    }
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    var btns = [].slice.call(document.querySelectorAll("#root button"));
    var rows = {};
    btns.forEach(function (b) {
      var g = groupOf(b);
      if (!g) return;
      b.classList.add("xn-opt");
      if (!rows[g]) rows[g] = b.parentElement;
    });

    var selFmt = selectedIn(btns, "fmt");
    var selQ = selectedIn(btns, "q");
    var selSize = selectedIn(btns, "size");

    if (rows.fmt) ensureTip(rows.fmt, FMT_TIP[selFmt] || "选择目标格式；不确定时优先 WebP。");
    if (rows.q) ensureTip(rows.q, Q_TIP);
    if (rows.size) ensureTip(rows.size, S_TIP);

    var run = btns.filter(function (b) { return /开始转换/.test(txt(b)); })[0];
    if (run) {
      var bar = document.getElementById("xn-setbar");
      if (!bar) {
        bar = document.createElement("div");
        bar.id = "xn-setbar";
        bar.className = "xn-setbar";
        var host = run.parentElement;
        host.insertBefore(bar, run);
      }
      var html = '<span class="xn-setlabel">当前设置</span><b>' + esc(selFmt || "未选格式") + "</b><span>·</span><b>" +
        esc(selQ || "未选质量") + "</b><span>·</span><b>" + esc(selSize || "未选尺寸") + "</b>";
      if (bar.innerHTML !== html) bar.innerHTML = html;
    }

    markNumbers();
  }

  var scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(function () { scheduled = false; try { updateAll(); } catch (e) {} }, 250);
  }

  function boot() {
    var root = document.getElementById("root");
    if (!root) { setTimeout(boot, 300); return; }
    updateAll();
    new MutationObserver(schedule).observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "aria-pressed"] });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
