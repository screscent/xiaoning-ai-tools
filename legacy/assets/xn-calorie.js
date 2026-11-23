/* R1255 食物热量与数据单位合集（atvkckpmpa）
 * 只做语义与呈现增强：tab 选中、主次按钮归类、标题去序号、结果数值分层。
 */
(function () {
  "use strict";

  function txt(el) {
    return (el.textContent || "").replace(/\s+/g, " ").trim();
  }

  function apply() {
    var root = document.getElementById("root");
    if (!root) return;

    /* 1. tabs 与按钮 */
    var btns = root.querySelectorAll("button");
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      b.classList.remove("xn-cal-tab", "xn-cal-primary", "xn-cal-copy");
      var t = txt(b);
      if (t === "热量消耗" || t === "数据单位") {
        b.classList.add("xn-cal-tab");
        b.setAttribute("role", "tab");
        b.setAttribute("aria-selected", /bg-emerald-500/.test(String(b.className)) ? "true" : "false");
      } else if (t === "换算运动时长") {
        b.classList.add("xn-cal-primary");
      } else if (t === "复制结果") {
        b.classList.add("xn-cal-copy");
      }
    }

    /* 2. 标题去 ② 等序号 */
    var h2s = root.querySelectorAll("h2");
    for (var j = 0; j < h2s.length; j++) {
      var raw = txt(h2s[j]);
      var clean = raw.replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "");
      if (clean !== raw && clean) h2s[j].textContent = clean;
    }

    /* 3. 结果数值分层 */
    var leaves = root.querySelectorAll("div,span,strong,b");
    for (var k = 0; k < leaves.length; k++) {
      var el = leaves[k];
      if (el.children.length) continue;
      if (!/^[\d.,]+\s*[a-zA-Z\u4e00-\u9fa5%]*$/.test(txt(el))) continue;
      if (el.closest("h2,h3,label,button,option")) continue;
      var fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs >= 26) el.classList.add("xn-cal-val-lg");
      else if (fs >= 17) el.classList.add("xn-cal-val");
    }
  }

  apply();
  setTimeout(apply, 300);
  setTimeout(apply, 900);
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
