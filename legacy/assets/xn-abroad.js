/* R1248 留学申请费用与时间线合集（c7xp2xegmi）
 * 只做语义与可用性增强：工具 tabs 选中、芯片 aria、按钮归类、结果行数值强调。
 */
(function () {
  "use strict";

  function txt(el) {
    return (el.textContent || "").replace(/\s+/g, " ").trim();
  }

  function apply() {
    var root = document.getElementById("root");
    if (!root) return;

    /* 1. 工具 tabs */
    var nav = root.querySelector("nav");
    if (nav) {
      nav.classList.add("xn-abroad-tabs");
      nav.setAttribute("role", "tablist");
      nav.setAttribute("aria-label", "留学工具切换");
      var btns = nav.querySelectorAll("button");
      for (var i = 0; i < btns.length; i++) {
        var b = btns[i];
        var on = /bg-sky-600/.test(String(b.className));
        b.setAttribute("role", "tab");
        b.setAttribute("aria-selected", on ? "true" : "false");
      }
    }

    /* 2. 标题去掉「工具一/工具二…」与序号 */
    var h2s = root.querySelectorAll("h2");
    for (var j = 0; j < h2s.length; j++) {
      var raw = txt(h2s[j]);
      var clean = raw
        .replace(/^工具[一二三四五六七八九十]+\s*/, "")
        .replace(/^工具[A-Z]\s*/, "")
        .replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "");
      if (clean !== raw && clean) h2s[j].textContent = clean;
    }

    /* 2b. 清掉只含「工具一/工具F」的装饰徽标 */
    var leaves = root.querySelectorAll("span,div");
    for (var n = 0; n < leaves.length; n++) {
      var el = leaves[n];
      if (el.children.length) continue;
      if (/^工具[一二三四五六七八九十A-Z]$/.test(txt(el))) el.style.display = "none";
    }

    /* 3. 按钮归类 */
    var all = root.querySelectorAll("button");
    for (var k = 0; k < all.length; k++) {
      var x = all[k];
      x.classList.remove("xn-abroad-chip", "xn-abroad-primary", "xn-abroad-copy");
      var aria = x.getAttribute("aria-label") || "";
      var t = txt(x);
      if (/^(目标国家|学位|专业类型)[^:：]*[:：]/.test(aria)) {
        x.classList.add("xn-abroad-chip");
      } else if (t === "开始计算") {
        x.classList.add("xn-abroad-primary");
      } else if (/复制结果/.test(t)) {
        x.classList.add("xn-abroad-copy");
      }
    }

    /* 3b. 芯片组与带单位输入 */
    var chips = root.querySelectorAll("button.xn-abroad-chip");
    for (var c = 0; c < chips.length; c++) {
      var wrap = chips[c].parentElement;
      if (wrap && wrap.querySelectorAll("button.xn-abroad-chip").length >= 2) wrap.classList.add("xn-abroad-chipwrap");
    }
    var nums = root.querySelectorAll("input[type=number]");
    for (var u = 0; u < nums.length; u++) {
      var inp = nums[u];
      var box = inp.parentElement;
      if (box && box.querySelector("span.absolute")) inp.classList.add("xn-abroad-unit");
    }

    /* 4. 结果行：标签 + 数值分层 */
    var rows = root.querySelectorAll("div.flex.items-start.justify-between");
    for (var m = 0; m < rows.length; m++) {
      var r = rows[m];
      if (!r.querySelector("div.min-w-0")) continue;
      r.classList.add("xn-abroad-row");
      var val = r.lastElementChild;
      if (val && val !== r.firstElementChild) val.classList.add("xn-abroad-val");
    }
  }

  apply();
  window.addEventListener("hashchange", function () { setTimeout(apply, 80); });

  var rootEl = document.getElementById("root");
  if (rootEl && window.MutationObserver) {
    var timer = null;
    new MutationObserver(function () {
      clearTimeout(timer);
      timer = setTimeout(apply, 120);
    }).observe(rootEl, { childList: true, subtree: true });
  }
})();
