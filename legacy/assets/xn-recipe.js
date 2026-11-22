/* R1253 菜谱份量与备餐换算合集（7b3nvgweb7）
 * 只做语义与呈现增强：tab 选中、去占位、开关/复制归类、换算清单数值强调。
 */
(function () {
  "use strict";

  function txt(el) {
    return (el.textContent || "").replace(/\s+/g, " ").trim();
  }

  var SHORT = { "#/leftover": "剩菜复热" };

  function apply() {
    var root = document.getElementById("root");
    if (!root) return;

    /* 1. 工具 tabs */
    var nav = root.querySelector("nav");
    if (nav) {
      nav.classList.add("xn-recipe-tabs");
      nav.setAttribute("role", "tablist");
      nav.setAttribute("aria-label", "菜谱工具切换");
      var links = nav.querySelectorAll("a");
      for (var i = 0; i < links.length; i++) {
        var a = links[i];
        var href = a.getAttribute("href");
        var on = a.getAttribute("aria-current") === "page";
        a.setAttribute("role", "tab");
        a.setAttribute("aria-selected", on ? "true" : "false");
        var short = SHORT[href];
        if (short && txt(a) !== short) a.textContent = short;
      }
    }

    /* 2. 标题去 ① / 工具E/F */
    var h2s = root.querySelectorAll("h2");
    for (var j = 0; j < h2s.length; j++) {
      var raw = txt(h2s[j]);
      var clean = raw.replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "").replace(/^工具[A-Z]\s*/, "");
      if (clean !== raw && clean) h2s[j].textContent = clean;
    }

    /* 3. 按钮归类 */
    var btns = root.querySelectorAll("button");
    for (var k = 0; k < btns.length; k++) {
      var b = btns[k];
      b.classList.remove("xn-recipe-switch", "xn-recipe-copy");
      if (b.getAttribute("role") === "switch") {
        b.classList.add("xn-recipe-switch");
      } else if (/^(复制清单|复制结果)$/.test(txt(b))) {
        b.classList.add("xn-recipe-copy");
      }
    }

    /* 4. 换算清单行 */
    var rows = root.querySelectorAll("div.flex.justify-between");
    for (var m = 0; m < rows.length; m++) {
      var r = rows[m];
      if (r.children.length !== 2) continue;
      if (/xn-recipe-row/.test(String(r.className))) continue;
      var first = txt(r.children[0]);
      var last = txt(r.children[1]);
      if (!first || !last) continue;
      if (!/^[\d.,]+\s*[a-zA-Z\u4e00-\u9fa5%]*$/.test(last)) continue;
      r.classList.add("xn-recipe-row");
      r.children[1].classList.add("xn-recipe-amt");
    }
  }

  apply();
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
