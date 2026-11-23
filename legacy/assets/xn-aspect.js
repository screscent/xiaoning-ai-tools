/* R1259 图片宽高比与裁剪合集（ewzrj3ixkx）· 人用友好层
 * 说明：所有 class / aria 操作均幂等，配合 attributes 观察避免与 React 重渲染抖动。
 */
(function () {
  "use strict";
  function txt(el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function del(el, c) { if (el && el.classList.contains(c)) el.classList.remove(c); }
  function setAttr(el, k, v) { if (el && el.getAttribute(k) !== v) el.setAttribute(k, v); }
  var applying = false;

  function apply() {
    if (applying) return;
    var root = document.getElementById("root");
    if (!root) return;
    applying = true;
    try {
      /* 1) 区域标记 */
      var secs = root.querySelectorAll("section");
      for (var i = 0; i < secs.length; i++) {
        var h = secs[i].querySelector("h2");
        var ht = h ? txt(h) : "";
        if (/宽高比例/.test(ht)) add(secs[i], "xn-asp-ratio"); else del(secs[i], "xn-asp-ratio");
        if (/裁剪/.test(ht)) add(secs[i], "xn-asp-crop"); else del(secs[i], "xn-asp-crop");
      }

      /* 2) 视图切换 tab（激活态只认 React 的 bg-blue-50，避免双选中） */
      var divs = root.querySelectorAll("div");
      for (var k = 0; k < divs.length; k++) {
        var d = divs[k];
        var bs = d.querySelectorAll("button");
        if (bs.length !== 2) continue;
        if (!/^宽高比例\s*图片裁剪$/.test(txt(d))) continue;
        add(d, "xn-asp-tabs");
        setAttr(d, "role", "tablist");
        for (var j = 0; j < bs.length; j++) {
          var b = bs[j];
          add(b, "xn-asp-tab");
          setAttr(b, "role", "tab");
          setAttr(b, "aria-pressed", /bg-blue-50/.test(String(b.className)) ? "true" : "false");
        }
        break;
      }

      /* 3) 按钮分级 + 开关识别 */
      var btns = root.querySelectorAll("button");
      for (var m = 0; m < btns.length; m++) {
        var bt = btns[m];
        if (bt.classList.contains("xn-asp-tab")) {
          del(bt, "xn-asp-primary"); del(bt, "xn-asp-ghost"); del(bt, "xn-asp-switch");
          continue;
        }
        var s = txt(bt);
        var isPrimary = s === "计算尺寸" || s === "下载裁剪图" || s === "选择图片";
        var isGhost = s === "清空" || /^复制/.test(s);
        if (isPrimary) { add(bt, "xn-asp-primary"); del(bt, "xn-asp-ghost"); }
        else if (isGhost) { add(bt, "xn-asp-ghost"); del(bt, "xn-asp-primary"); }
        else { del(bt, "xn-asp-primary"); del(bt, "xn-asp-ghost"); }

        if (!isPrimary && !isGhost && bt.getAttribute("aria-pressed") !== null && !s) {
          var r = bt.getBoundingClientRect();
          if (r.width > 0 && r.width < 64) {
            add(bt, "xn-asp-switch");
            var row = bt.parentElement;
            if (row) {
              add(row, "xn-asp-toggle");
              var lab = txt(row).replace(/[：:]\s*$/, "");
              if (lab && lab.length >= 2 && lab.length <= 14 && lab.indexOf("px") < 0) setAttr(bt, "aria-label", lab);
            }
          }
        } else {
          del(bt, "xn-asp-switch");
        }
      }

      /* 4) 滑块行 */
      var rgs = root.querySelectorAll('input[type="range"]');
      for (var q = 0; q < rgs.length; q++) add(rgs[q].parentElement, "xn-asp-range");

      /* 5) 结果卡 / 表格 / 大数字 */
      var sec = root.querySelector("section.xn-asp-ratio");
      if (sec) {
        var res = sec.querySelectorAll("div.mt-4");
        for (var r2 = 0; r2 < res.length; r2++) {
          if (res[r2].className.indexOf("rounded") >= 0) add(res[r2], "xn-asp-result");
        }
      }
      var tb = root.querySelectorAll("table");
      for (var t2 = 0; t2 < tb.length; t2++) add(tb[t2], "xn-asp-table");

      var nodes = root.querySelectorAll("div,span,p,strong,b,td");
      for (var n = 0; n < nodes.length; n++) {
        var e = nodes[n];
        if (e.children.length) continue;
        var v = txt(e);
        if (!v || v.length > 16) continue;
        var fs = parseFloat(getComputedStyle(e).fontSize);
        if (fs >= 23 && /^[\d.,\s]+$/.test(v)) add(e, "xn-asp-big");
        else if (fs >= 17 && /^\d{1,3}\s*:\s*\d{1,3}$/.test(v)) add(e, "xn-asp-ratio-val");
      }

      /* 6) 裁剪预览框 + 输出尺寸读数 */
      var all = root.querySelectorAll("div,p,span");
      for (var a = 0; a < all.length; a++) {
        var el = all[a];
        var at = txt(el);
        if (!at) continue;
        if (el.children.length === 0 && at.indexOf("Canvas 实时预览") >= 0) {
          var box = el.closest('[class*="border-dashed"]') || el.parentElement;
          add(box, "xn-asp-preview");
        }
        if (/^输出尺寸/.test(at) && at.length < 22) add(el, "xn-asp-outsize");
      }

      /* 7) 标题去序号 */
      var h2s = root.querySelectorAll("h2");
      for (var z = 0; z < h2s.length; z++) {
        var raw = txt(h2s[z]);
        var clean = raw.replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "").replace(/^工具[A-Z]\s*/, "");
        if (clean !== raw && clean) h2s[z].textContent = clean;
      }

      /* 8) 兜底：无文本按钮补可访问名称 */
      var anon = 0;
      var bs3 = root.querySelectorAll("button");
      for (var y = 0; y < bs3.length; y++) {
        var bb = bs3[y];
        if (bb.getAttribute("aria-label") || txt(bb)) continue;
        anon += 1;
        setAttr(bb, "aria-label", bb.classList.contains("xn-asp-switch") ? "开关 " + anon : "按钮 " + anon);
      }
    } finally {
      applying = false;
    }
  }

  apply();
  setTimeout(apply, 300);
  setTimeout(apply, 900);
  setTimeout(apply, 1800);
  window.addEventListener("hashchange", function () { setTimeout(apply, 120); });
  document.addEventListener("click", function () { setTimeout(apply, 60); setTimeout(apply, 260); setTimeout(apply, 700); }, true);
  document.addEventListener("input", function () { setTimeout(apply, 80); }, true);
  var rootEl = document.getElementById("root");
  if (rootEl && window.MutationObserver) {
    var timer = null;
    new MutationObserver(function () {
      if (applying) return;
      clearTimeout(timer);
      timer = setTimeout(apply, 140);
    }).observe(rootEl, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "aria-pressed"] });
  }
})();
