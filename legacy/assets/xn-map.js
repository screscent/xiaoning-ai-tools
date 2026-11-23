/* R1276 思维导图与大纲合集（key2pcdudk）· 人用友好层
 * - 6 个工具导航 44px + aria-current；主按钮 48px
 * - 导图预览可横向滚动（修复三级节点被裁切）、节点统计放大
 * - 模板/导出代码块 13px；工具 06 标题归一
 */
(function () {
  "use strict";
  if (window.__XN_MAP__) return;
  window.__XN_MAP__ = true;

  function txt(el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function setAttr(el, k, v) { if (el && el.getAttribute(k) !== v) el.setAttribute(k, v); }
  var applying = false;

  function apply() {
    if (applying) return;
    var root = document.getElementById("root");
    if (!root) return;
    applying = true;
    try {
      /* 1) 导航 */
      var first = root.querySelector('a[href="#/map"]');
      var tabs = first && first.parentElement;
      if (tabs) {
        add(tabs, "sv-tabs");
        var links = tabs.querySelectorAll("a");
        for (var i = 0; i < links.length; i++) {
          if (/bg-(blue|indigo|violet|purple)-600/.test(String(links[i].className))) setAttr(links[i], "aria-current", "page");
          else links[i].removeAttribute("aria-current");
        }
      }

      /* 2) 标题归一 */
      var h2s = root.querySelectorAll("h2");
      for (var h = 0; h < h2s.length; h++) {
        var raw = txt(h2s[h]);
        var m = raw.match(/^工具\s*([A-F])\s*(.*)$/);
        if (!m) continue;
        var t = "工具 0" + (m[1].charCodeAt(0) - 64) + " · " + (m[2] || "").replace(/^[·:：\s]+/, "");
        if (t !== raw) h2s[h].textContent = t;
      }

      /* 3) 导图 SVG：大尺寸才处理，容器可滚动 */
      var svgs = root.querySelectorAll("svg");
      for (var s = 0; s < svgs.length; s++) {
        var sv = svgs[s];
        var w = sv.getBoundingClientRect().width || parseFloat(sv.getAttribute("width") || "0");
        if (w < 300) continue;
        add(sv, "sv-map-svg");
        var box = sv.parentElement;
        if (box) {
          add(box, "sv-map-box");
          var host = box.parentElement;
          if (host && box.scrollWidth > box.clientWidth + 8 && !host.querySelector(".sv-map-hint")) {
            var hint = document.createElement("div");
            hint.className = "sv-map-hint";
            hint.textContent = "↔ 左右滑动查看完整导图（" + Math.round(box.scrollWidth) + " × " + Math.round(box.scrollHeight) + "）";
            host.insertBefore(hint, box);
          }
        }
      }

      /* 4) 节点统计 */
      var h3s = root.querySelectorAll("h3");
      for (var k = 0; k < h3s.length; k++) {
        if (txt(h3s[k]) !== "节点统计") continue;
        var wrap = h3s[k].parentElement;
        if (!wrap) continue;
        var cells = wrap.querySelectorAll("div.grid > div");
        for (var c = 0; c < cells.length; c++) {
          add(cells[c], "sv-stat");
          var leaves = cells[c].querySelectorAll("*");
          for (var l = 0; l < leaves.length; l++) {
            if (leaves[l].children.length) continue;
            if (/^\d+$/.test(txt(leaves[l]))) add(leaves[l], "sv-num");
            else if (txt(leaves[l]).length && txt(leaves[l]).length < 10) add(leaves[l], "sv-label");
          }
        }
      }

      /* 5) 按钮 */
      var btns = root.querySelectorAll("section button");
      for (var b = 0; b < btns.length; b++) {
        var bt = btns[b];
        var label = txt(bt);
        if (/生成思维导图|转换为思维导图/.test(label)) add(bt, "sv-primary");
        if (/^(填入示例|清空)$/.test(label)) add(bt, "sv-mini");
        if (/使用此模板/.test(label)) add(bt, "sv-tpl");
        if (/^复制/.test(label)) setAttr(bt, "aria-label", label);
      }
    } finally {
      applying = false;
    }
  }

  apply();
  setTimeout(apply, 300);
  setTimeout(apply, 900);
  setTimeout(apply, 1800);
  window.addEventListener("hashchange", function () { setTimeout(apply, 120); setTimeout(apply, 500); });
  document.addEventListener("click", function () { setTimeout(apply, 60); setTimeout(apply, 300); }, true);
  var rootEl = document.getElementById("root");
  if (rootEl && window.MutationObserver) {
    var timer = null;
    new MutationObserver(function () {
      if (applying) return;
      clearTimeout(timer);
      timer = setTimeout(apply, 160);
    }).observe(rootEl, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  }
})();
