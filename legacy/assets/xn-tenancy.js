/* R1249 租房居住成本计算合集（glgtbzcqng）
 * 只做语义与可用性增强：tabs 选中、是/否 aria、按钮归类、结果数值强调。
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
      nav.classList.add("xn-tenancy-tabs");
      nav.setAttribute("role", "tablist");
      nav.setAttribute("aria-label", "租房工具切换");
      var links = nav.querySelectorAll("a");
      for (var i = 0; i < links.length; i++) {
        var a = links[i];
        var on = /text-white/.test(String(a.className));
        a.setAttribute("role", "tab");
        a.setAttribute("aria-selected", on ? "true" : "false");
      }
    }

    /* 2. 按钮归类：是/否、复制/清空 */
    var btns = root.querySelectorAll("button");
    for (var k = 0; k < btns.length; k++) {
      var b = btns[k];
      b.classList.remove("xn-tenancy-yesno", "xn-tenancy-act");
      var t = txt(b);
      if (t === "是" || t === "否") {
        b.classList.add("xn-tenancy-yesno");
        b.setAttribute("aria-pressed", /bg-emerald-100/.test(String(b.className)) ? "true" : "false");
      } else if (/^(复制结果|清空)$/.test(t)) {
        b.classList.add("xn-tenancy-act");
      }
    }

    /* 3. 结果行 */
    var rows = root.querySelectorAll("div.flex.items-center.justify-between");
    for (var m = 0; m < rows.length; m++) {
      var r = rows[m];
      var spans = r.children;
      if (!spans || spans.length !== 2) continue;
      if (!/rounded-lg/.test(String(r.className))) continue;
      r.classList.add("xn-tenancy-row");
      if (/bg-emerald-50/.test(String(r.className))) r.classList.add("xn-tenancy-hl");
      spans[1].classList.add("xn-tenancy-val");
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
