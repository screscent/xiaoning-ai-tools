/* R1247 证件照尺寸与排版合集（9pag3yr8kd）
 * 只做语义与可用性增强：工具卡选中语义、标题去占位、表格/数值可读性。
 */
(function () {
  "use strict";

  function txt(el) {
    return (el.textContent || "").replace(/\s+/g, " ").trim();
  }

  function apply() {
    var root = document.getElementById("root");
    if (!root) return;

    /* 1. 工具导航：选中语义 + 去「工具E」前缀 */
    var nav = root.querySelector("nav");
    if (nav) {
      nav.classList.add("xn-idphoto-tabs");
      nav.setAttribute("role", "tablist");
      nav.setAttribute("aria-label", "证件照工具切换");
      var btns = nav.querySelectorAll("button");
      for (var i = 0; i < btns.length; i++) {
        var b = btns[i];
        var on = b.getAttribute("aria-current") === "page";
        b.setAttribute("role", "tab");
        b.setAttribute("aria-selected", on ? "true" : "false");
        var raw = txt(b);
        var clean = raw.replace(/^工具[A-Z]\s*/, "");
        if (clean !== raw && clean) {
          var svg = b.querySelector("svg");
          while (b.firstChild) b.removeChild(b.firstChild);
          if (svg) b.appendChild(svg);
          b.appendChild(document.createTextNode(clean));
        }
      }
    }

    /* 2. 标题去掉 ①/工具X 前缀 */
    var h2s = root.querySelectorAll("h2");
    for (var j = 0; j < h2s.length; j++) {
      var raw2 = txt(h2s[j]);
      var clean2 = raw2.replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "").replace(/^工具[A-Z]\s*/, "");
      if (clean2 !== raw2 && clean2) h2s[j].textContent = clean2;
    }

    /* 3. 表格容器允许横向滚动 */
    var tables = root.querySelectorAll("table");
    for (var k = 0; k < tables.length; k++) {
      var wrap = tables[k].parentElement;
      if (wrap && wrap.scrollWidth > wrap.clientWidth) {
        wrap.style.overflowX = "auto";
        wrap.style.webkitOverflowScrolling = "touch";
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
