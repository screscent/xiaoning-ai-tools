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

  function q(sel, ctx) { return [].slice.call((ctx || document).querySelectorAll(sel)); }
  function visible(el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; }

  function tabs() {
    var anchors = q("#root a").filter(function (a) { return /^[①②③④⑤]/.test(txt(a)) && visible(a); });
    if (!anchors.length) return;
    var nav = anchors[0].parentElement;
    if (nav) nav.classList.add("xn-fmt-tabs");
    anchors.forEach(function (a) {
      var span = a.querySelector("span") || a;
      var on = /bg-indigo-600|bg-blue-600/.test(span.className || "");
      if (on) a.setAttribute("aria-current", "page");
      else if (a.getAttribute("aria-current")) a.removeAttribute("aria-current");
    });
  }

  function actions() {
    q("#root button").forEach(function (b) {
      if (!visible(b)) return;
      var t = txt(b);
      if (/开始转换/.test(t)) {
        b.classList.add("xn-fmt-run");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", t + "（本地处理，不上传）");
        return;
      }
      if (t === "复制全文") {
        b.classList.add("xn-fmt-run");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "复制转换结果全文");
        return;
      }
      if (t === "复制") {
        b.classList.add("xn-mini");
        if (!b.getAttribute("aria-label")) {
          var sec = b.closest("section");
          var h = sec && sec.querySelector("h3");
          b.setAttribute("aria-label", "复制" + (h ? txt(h).replace(/^\d+\s*/, "") : "结果"));
        }
        return;
      }
      if (t === "下载") {
        b.classList.add("xn-mini");
        if (!b.getAttribute("aria-label")) {
          var row = b.closest("div");
          var name = row && row.querySelector("p");
          b.setAttribute("aria-label", "下载 " + (name ? txt(name) : "转换后图片"));
        }
        return;
      }
      if (t === "清空全部") {
        b.classList.add("xn-mini");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "清空已选图片");
      }
    });
  }

  function usage() {
    var h = q("#root h2").filter(function (x) { return txt(x) === "使用说明"; })[0];
    if (!h) return;
    var sec = h.closest("section");
    if (!sec) return;
    sec.classList.add("xn-fmt-usage");
    var body = sec.querySelector(".space-y-2");
    if (!body) return;
    var btn = sec.querySelector("button.xn-usage-toggle");
    if (!btn) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.className = "xn-usage-toggle";
      btn.addEventListener("click", function () {
        var open = sec.getAttribute("data-open") === "1";
        sec.setAttribute("data-open", open ? "0" : "1");
        btn.setAttribute("aria-expanded", open ? "false" : "true");
        btn.textContent = open ? "展开使用说明" : "收起使用说明";
      });
      sec.insertBefore(btn, body);
    }
    var open = sec.getAttribute("data-open") === "1";
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    var label = open ? "收起使用说明" : "展开使用说明";
    if (txt(btn) !== label) btn.textContent = label;
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    tabs();
    var btns = [].slice.call(document.querySelectorAll("#root button"));
    var rows = {};
    btns.forEach(function (b) {
      var g = groupOf(b);
      if (!g) return;
      b.classList.add("xn-opt");
      if (!rows[g]) rows[g] = b.parentElement;
      var on = active(b) ? "true" : "false";
      if (b.getAttribute("aria-pressed") !== on) b.setAttribute("aria-pressed", on);
      var aria = { fmt: "目标格式选项", q: "输出质量选项", size: "输出尺寸选项" }[g];
      var box = b.parentElement;
      if (box && box.getAttribute("role") !== "group") {
        box.setAttribute("role", "group");
        box.setAttribute("aria-label", aria);
      }
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
    actions();
    usage();
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
