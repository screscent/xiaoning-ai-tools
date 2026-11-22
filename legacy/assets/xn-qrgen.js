/* R1245 二维码生成与尺寸合集（g42fhctuhw）
 * 只做语义与可用性增强：tabs 角色、按钮归类、标题清理；不改二维码生成与尺寸计算。
 */
(function () {
  "use strict";

  function txt(el) {
    return (el.textContent || "").replace(/\s+/g, " ").trim();
  }

  function apply() {
    var root = document.getElementById("root");
    if (!root) return;

    /* 1. tabs */
    var nav = root.querySelector("nav");
    if (nav) {
      nav.classList.add("xn-qrgen-tabs");
      nav.setAttribute("role", "tablist");
      nav.setAttribute("aria-label", "二维码工具切换");
      var links = nav.querySelectorAll("a");
      for (var i = 0; i < links.length; i++) {
        var a = links[i];
        a.setAttribute("role", "tab");
        a.setAttribute("aria-selected", a.getAttribute("aria-current") === "page" ? "true" : "false");
      }
    }

    /* 2. 标题去掉 ①② 序号 */
    var h2s = root.querySelectorAll("h2");
    for (var j = 0; j < h2s.length; j++) {
      var raw = txt(h2s[j]);
      var clean = raw.replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "");
      if (clean !== raw && clean) h2s[j].textContent = clean;
    }

    /* 3. 按钮归类 */
    var btns = root.querySelectorAll("button");
    for (var k = 0; k < btns.length; k++) {
      var b = btns[k];
      b.classList.remove("xn-qrchip", "xn-qract");
      var aria = b.getAttribute("aria-label") || "";
      var t = txt(b);
      if (/^(内容类型|尺寸（px）|容错级别|容错等级|前景色)[:：]/.test(aria)) {
        b.classList.add("xn-qrchip");
      } else if (/^(复制|下载)/.test(t)) {
        b.classList.add("xn-qract");
      }
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
