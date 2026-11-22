/* R1250 发票校验与开票信息合集（r3vc8lzjyr）
 * 只做语义与可用性增强：工具按钮归类与选中语义、复制/清空触达、缺失项徽标、结果等宽排版。
 */
(function () {
  "use strict";

  function txt(el) {
    return (el.textContent || "").replace(/\s+/g, " ").trim();
  }

  function apply() {
    var root = document.getElementById("root");
    if (!root) return;

    /* 1. 工具导航：tab / 示例 / 清空 / 复制 */
    var nav = root.querySelector("nav");
    var btns = root.querySelectorAll("button");
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      b.classList.remove("xn-taxinv-tab", "xn-taxinv-chip", "xn-taxinv-clear", "xn-taxinv-copy");
      var t = txt(b);
      var cls = String(b.className);
      if (t === "抬头校验" || t === "开票信息") {
        b.classList.add("xn-taxinv-tab");
        b.setAttribute("role", "tab");
        b.setAttribute("aria-selected", /bg-slate-900/.test(cls) ? "true" : "false");
      } else if (t === "清空") {
        b.classList.add("xn-taxinv-clear");
      } else if (/^复制/.test(t)) {
        b.classList.add("xn-taxinv-copy");
      } else if (/^(合规示例|税号含空格|校验位有误|位数不足)$/.test(t) || /^杭州某某/.test(t)) {
        b.classList.add("xn-taxinv-chip");
      } else if (nav && nav.contains(b) && t.length <= 12) {
        b.classList.add("xn-taxinv-chip");
      }
    }
    if (nav) {
      nav.setAttribute("role", "tablist");
      nav.setAttribute("aria-label", "开票工具切换");
    }

    /* 1b. 标题去掉 ② 等序号 */
    var h2s = root.querySelectorAll("h2");
    for (var n = 0; n < h2s.length; n++) {
      var raw = txt(h2s[n]);
      var clean = raw.replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "");
      if (clean !== raw && clean) h2s[n].textContent = clean;
    }

    /* 2. 缺失项徽标 */
    var leaves = root.querySelectorAll("span,div");
    for (var j = 0; j < leaves.length; j++) {
      var el = leaves[j];
      if (el.children.length) continue;
      if (/^缺\s*\d+\s*项$/.test(txt(el))) el.classList.add("xn-taxinv-gap");
    }

    /* 3. 等宽结果块 */
    var monos = root.querySelectorAll("div[class*='font-mono'], pre");
    for (var k = 0; k < monos.length; k++) monos[k].classList.add("xn-taxinv-mono");
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
