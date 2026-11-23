/* R1256 航班值机与转机衔接合集（atvsvxpmpa）
 * 只做语义与呈现增强：tab 选中、主按钮/开关归类、时间表时间点强调。
 */
(function () {
  "use strict";

  function txt(el) {
    return (el.textContent || "").replace(/\s+/g, " ").trim();
  }

  function apply() {
    var root = document.getElementById("root");
    if (!root) return;

    /* 1. tabs 与主按钮 */
    var btns = root.querySelectorAll("button");
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      b.classList.remove("xn-flight-tab", "xn-flight-primary");
      var t = txt(b);
      if (t === "值机倒推" || t === "转机衔接") {
        b.classList.add("xn-flight-tab");
        b.setAttribute("role", "tab");
        var on = /text-white/.test(String(b.className)) && /bg-/.test(String(b.className));
        b.setAttribute("aria-selected", on ? "true" : "false");
      } else if (t === "倒推时间表" || t === "计算衔接") {
        b.classList.add("xn-flight-primary");
      }
    }

    /* 2. 标题去 ① 序号 */
    var h2s = root.querySelectorAll("h2");
    for (var j = 0; j < h2s.length; j++) {
      var raw = txt(h2s[j]);
      var clean = raw.replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "");
      if (clean !== raw && clean) h2s[j].textContent = clean;
    }

    /* 3. 时间点强调 */
    var leaves = root.querySelectorAll("span,div,strong");
    for (var k = 0; k < leaves.length; k++) {
      var el = leaves[k];
      if (el.children.length) continue;
      if (/^\d{1,2}:\d{2}$/.test(txt(el))) el.classList.add("xn-flight-time");
    }

    /* 4. 时间表行卡片化 */
    var rows = root.querySelectorAll("div.flex.items-center.justify-between");
    for (var m = 0; m < rows.length; m++) {
      var r = rows[m];
      if (r.children.length !== 2) continue;
      if (!r.querySelector(".xn-flight-time")) continue;
      r.classList.add("xn-flight-row");
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
