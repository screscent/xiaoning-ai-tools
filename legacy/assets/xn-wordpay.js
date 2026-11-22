/* R1251 字数稿费与阅读进度合集（5cunqft6g5）
 * 只做语义与呈现增强：tab 选中、主次按钮归类、字数统计从窄文本域改为大数字网格、稿费/阅读区强调。
 */
(function () {
  "use strict";

  function txt(el) {
    return (el.textContent || "").replace(/\s+/g, " ").trim();
  }

  /* 字数统计：readonly textarea → 数字网格 */
  function renderStats() {
    var root = document.getElementById("root");
    if (!root) return;
    var ro = root.querySelector("textarea[readonly]");
    if (!ro || !ro.parentElement) return;
    var grid = ro.parentElement.querySelector(".xn-wordpay-stats");
    if (!grid) {
      grid = document.createElement("div");
      grid.className = "xn-wordpay-stats";
      ro.parentElement.insertBefore(grid, ro);
      ro.style.display = "none";
    }
    var lines = (ro.value || "").split("\n");
    var items = [];
    for (var i = 0; i < lines.length && items.length < 5; i++) {
      var line = lines[i];
      if (!/[:：]/.test(line)) continue;
      var parts = line.split(/[:：]/);
      var label = parts.shift().trim();
      var rest = parts.join("：");
      var m = rest.match(/[\d,]+/);
      if (!label || !m) continue;
      items.push({ k: label, v: m[0] });
    }
    if (!items.length) return;
    var sig = items.map(function (x) { return x.k + x.v; }).join("|");
    if (grid.getAttribute("data-sig") === sig) return;
    grid.setAttribute("data-sig", sig);
    grid.textContent = "";
    items.forEach(function (it) {
      var cell = document.createElement("div");
      cell.className = "xn-wordpay-stat";
      var k = document.createElement("span");
      k.className = "xn-wordpay-stat-k";
      k.textContent = it.k;
      var v = document.createElement("span");
      v.className = "xn-wordpay-stat-v";
      v.textContent = it.v;
      cell.appendChild(k);
      cell.appendChild(v);
      grid.appendChild(cell);
    });
  }

  function apply() {
    var root = document.getElementById("root");
    if (!root) return;

    /* 1. 工具 tabs */
    var btns = root.querySelectorAll("button");
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      b.classList.remove("xn-wordpay-tab", "xn-wordpay-primary", "xn-wordpay-secondary");
      var t = txt(b);
      if (t === "字数稿费" || t === "阅读进度") {
        b.classList.add("xn-wordpay-tab");
        b.setAttribute("role", "tab");
        b.setAttribute("aria-selected", /bg-gray-900/.test(String(b.className)) ? "true" : "false");
      } else if (t === "复制结果") {
        b.classList.add("xn-wordpay-primary");
      } else if (t === "清空") {
        b.classList.add("xn-wordpay-secondary");
      }
    }

    /* 2. 标题去掉 ①②③ 序号 */
    var h2s = root.querySelectorAll("h2");
    for (var j = 0; j < h2s.length; j++) {
      var raw = txt(h2s[j]);
      var clean = raw.replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "");
      if (clean !== raw && clean) h2s[j].textContent = clean;
    }

    /* 3. 稿费 / 阅读区块标记 */
    for (var k = 0; k < h2s.length; k++) {
      var title = txt(h2s[k]);
      var sec = h2s[k].closest("section");
      if (!sec) continue;
      if (/稿费金额/.test(title)) {
        sec.classList.add("xn-wordpay-fee");
        var rows = sec.querySelectorAll("div.flex.justify-between");
        if (rows.length) {
          var frow = rows[rows.length - 1];
          frow.classList.add("xn-wordpay-final");
          var fv = frow.lastElementChild;
          if (fv) {
            fv.style.setProperty("font-size", "24px", "important");
            fv.style.setProperty("font-weight", "800", "important");
            fv.style.setProperty("color", "#1d4ed8", "important");
          }
        }
      } else if (/阅读时长/.test(title)) {
        sec.classList.add("xn-wordpay-read");
        var rrows = sec.querySelectorAll("div.flex.justify-between");
        for (var ri = 0; ri < rrows.length; ri++) {
          var rrow = rrows[ri];
          if (rrow.children.length !== 2) continue;
          var rv = rrow.lastElementChild;
          rv.style.setProperty("font-size", "20px", "important");
          rv.style.setProperty("font-weight", "800", "important");
          rv.style.setProperty("color", "#1e293b", "important");
          rv.style.setProperty("font-variant-numeric", "tabular-nums", "important");
        }
      } else if (/字数统计/.test(title)) {
        renderStats();
      }
    }

    renderStats();
  }

  apply();
  document.addEventListener("input", function (e) {
    var t = e.target;
    if (t && t.tagName === "TEXTAREA") setTimeout(renderStats, 100);
  }, true);
  window.addEventListener("hashchange", function () { setTimeout(apply, 100); });

  var rootEl = document.getElementById("root");
  if (rootEl && window.MutationObserver) {
    var timer = null;
    new MutationObserver(function () {
      clearTimeout(timer);
      timer = setTimeout(apply, 150);
    }).observe(rootEl, { childList: true, subtree: true });
  }
})();
