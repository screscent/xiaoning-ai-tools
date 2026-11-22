/* R1254 YAML JSON 转换与结构统计合集（9pahqsr8kd）
 * 只做语义与呈现增强：tab 选中、主次按钮归类、标题去序号、注释开关触达。
 */
(function () {
  "use strict";

  function txt(el) {
    return (el.textContent || "").replace(/\s+/g, " ").trim();
  }

  function apply() {
    var root = document.getElementById("root");
    if (!root) return;

    /* 1. 工具 tabs + 主次按钮 */
    var btns = root.querySelectorAll("button");
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      b.classList.remove("xn-yaml-tab", "xn-yaml-primary", "xn-yaml-secondary");
      var t = txt(b);
      if (t === "YAML↔JSON" || t === "结构统计") {
        b.classList.add("xn-yaml-tab");
        b.setAttribute("role", "tab");
        b.setAttribute("aria-selected", /bg-blue-500/.test(String(b.className)) ? "true" : "false");
      } else if (t === "转换" || t === "统计") {
        b.classList.add("xn-yaml-primary");
      } else if (/^(复制结果|交换方向|清空)$/.test(t)) {
        b.classList.add("xn-yaml-secondary");
      }
    }

    /* 2. 标题去 ② 等序号 */
    var h2s = root.querySelectorAll("h2");
    for (var j = 0; j < h2s.length; j++) {
      var raw = txt(h2s[j]);
      var clean = raw.replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "");
      if (clean !== raw && clean) h2s[j].textContent = clean;
    }

    /* 3. 代码块等宽字号 */
    var pres = root.querySelectorAll("pre");
    for (var k = 0; k < pres.length; k++) pres[k].classList.add("xn-yaml-pre");
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
