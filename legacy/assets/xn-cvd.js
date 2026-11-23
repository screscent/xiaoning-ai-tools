/* R1260 色盲配色与图标尺寸合集（9pavh8r8kd）· 人用友好层
 * 所有 class / aria 操作幂等；attributes 观察与 React 重渲染共存。
 */
(function () {
  "use strict";
  function txt(el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function del(el, c) { if (el && el.classList.contains(c)) el.classList.remove(c); }
  function setAttr(el, k, v) { if (el && el.getAttribute(k) !== v) el.setAttribute(k, v); }
  function vis(el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; }
  var applying = false;

  function apply() {
    if (applying) return;
    var root = document.getElementById("root");
    if (!root) return;
    applying = true;
    try {
      /* 1) 视图 tab */
      var btns = root.querySelectorAll("button");
      for (var i = 0; i < btns.length; i++) {
        var b = btns[i];
        var s = txt(b);
        if (s === "色盲配色" || s === "图标尺寸") {
          var wrap = b.parentElement;
          if (wrap) { add(wrap, "xn-cvd-tabs"); setAttr(wrap, "role", "tablist"); }
          add(b, "xn-cvd-tab");
          setAttr(b, "role", "tab");
          setAttr(b, "aria-pressed", /bg-blue-600/.test(String(b.className)) ? "true" : "false");
          continue;
        }
        /* 2) 主/次按钮 */
        if (s === "检查配色") { add(b, "xn-cvd-primary"); del(b, "xn-cvd-ghost"); }
        else if (s === "复制结果" || s === "清空" || s === "复制检查结果") { add(b, "xn-cvd-ghost"); del(b, "xn-cvd-primary"); }
        else { del(b, "xn-cvd-primary"); del(b, "xn-cvd-ghost"); }

        /* 3) 开关（三色预览） */
        if (b.getAttribute("role") === "switch") {
          add(b, "xn-cvd-switch");
          var row = b.parentElement;
          if (row) add(row, "xn-cvd-switchrow");
          if (!b.getAttribute("aria-label")) setAttr(b, "aria-label", "三色预览");
        }
      }

      /* 4) 结果卡 / 状态 / 大数字 */
      var divs = root.querySelectorAll("div");
      for (var d = 0; d < divs.length; d++) {
        var el = divs[d];
        var et = txt(el);
        if (et.length > 160) continue;
        if (/对比度|缺失尺寸清单|已提供的尺寸/.test(et) && /rounded-xl/.test(String(el.className))) {
          add(el, "xn-cvd-card");
          var head = el.querySelector("div.flex.items-center.justify-between");
          if (head) add(head, "xn-cvd-cardhead");
        }
        var st = String(el.style && el.style.background ? el.style.background : "");
        if (!st && el.style && el.style.backgroundColor) st = el.style.backgroundColor;
        if (st && el.getBoundingClientRect().height >= 24 && el.getBoundingClientRect().width >= 80) {
          add(el, "xn-cvd-bar");
        }
      }

      /* 4.1) 结果状态胶囊（含图标子节点，按 class 识别） */
      var pills = root.querySelectorAll("span[class*='rounded-full']");
      for (var pi = 0; pi < pills.length; pi++) {
        var pl = pills[pi];
        var pcls = String(pl.className);
        if (pcls.indexOf("bg-green-100") >= 0) add(pl, "xn-cvd-pass");
        else if (pcls.indexOf("bg-red-100") >= 0) add(pl, "xn-cvd-fail");
      }

      var spans = root.querySelectorAll("span,div,td,p,strong");
      for (var n = 0; n < spans.length; n++) {
        var e = spans[n];
        if (e.children.length) continue;
        var v = txt(e);
        if (!v) continue;
        var fs = parseFloat(getComputedStyle(e).fontSize);
        if (v.length <= 12 && fs >= 23 && /^[\d.,]+$/.test(v)) add(e, "xn-cvd-big");
        else if (/^\/\s*\d/.test(v) && v.length <= 8) add(e, "xn-cvd-standard");
        else if (v === "通过") add(e, "xn-cvd-pass");
        else if (v === "不通过") add(e, "xn-cvd-fail");
        else if (/^#[0-9A-Fa-f]{6}$/.test(v)) add(e, "xn-cvd-hex");
        else if (/^\d{2,4}px$/.test(v)) add(e, "xn-cvd-size");
        else if (/缺（/.test(v)) add(e, "xn-cvd-miss");
      }

      /* 5) 图标尺寸 chip */
      var labels = root.querySelectorAll("label");
      for (var l = 0; l < labels.length; l++) {
        var lb = labels[l];
        if (!lb.querySelector('input[type="checkbox"]')) continue;
        add(lb, "xn-cvd-chip");
        if (/bg-blue-50/.test(String(lb.className))) add(lb, "xn-cvd-on"); else del(lb, "xn-cvd-on");
      }

      /* 6) 标题去序号 */
      var h2s = root.querySelectorAll("h2");
      for (var z = 0; z < h2s.length; z++) {
        var raw = txt(h2s[z]);
        var clean = raw.replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "").replace(/^工具[A-Z]\s*/, "");
        if (clean !== raw && clean) h2s[z].textContent = clean;
      }

      /* 7) 兜底可访问名 */
      var anon = 0;
      var bs2 = root.querySelectorAll("button");
      for (var y = 0; y < bs2.length; y++) {
        var bb = bs2[y];
        if (bb.getAttribute("aria-label") || txt(bb) || bb.getAttribute("aria-checked") !== null) continue;
        anon += 1;
        setAttr(bb, "aria-label", "按钮 " + anon);
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
    }).observe(rootEl, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "aria-pressed", "aria-checked"] });
  }
})();
