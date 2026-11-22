/* R1244 二手交易交接合集（dzkttqslwd）
 * 只做语义与可用性增强：tabs 角色/短标题、按钮归类、输入字号、勾选状态，不改业务逻辑。
 */
(function () {
  "use strict";

  var SHORT = { "#/price": "定价底线", "#/warranty": "保修交接" };

  function txt(el) {
    return (el.textContent || "").replace(/\s+/g, " ").trim();
  }

  function apply() {
    var root = document.getElementById("root");
    if (!root) return;

    /* 1. 工具 tabs */
    var nav = root.querySelector("nav");
    if (nav) {
      nav.classList.add("xn-trade-tabs");
      nav.setAttribute("role", "tablist");
      nav.setAttribute("aria-label", "二手工具切换");
      var links = nav.querySelectorAll("a");
      for (var i = 0; i < links.length; i++) {
        var a = links[i];
        var href = a.getAttribute("href");
        var on = a.getAttribute("aria-current") === "page";
        a.setAttribute("role", "tab");
        a.setAttribute("aria-selected", on ? "true" : "false");
        var short = SHORT[href];
        if (short && txt(a) !== short) {
          var svg = a.querySelector("svg");
          while (a.firstChild) a.removeChild(a.firstChild);
          if (svg) a.appendChild(svg);
          var span = document.createElement("span");
          span.textContent = short;
          a.appendChild(span);
        }
      }
    }

    /* 2. 标题去掉「工具E / 工具F」占位 */
    var h2s = root.querySelectorAll("h2");
    for (var j = 0; j < h2s.length; j++) {
      var raw = txt(h2s[j]);
      var clean = raw.replace(/^工具[A-Z]\s*/, "");
      if (clean !== raw && clean) h2s[j].textContent = clean;
    }

    /* 3. 按钮归类 */
    var btns = root.querySelectorAll("button");
    for (var k = 0; k < btns.length; k++) {
      var b = btns[k];
      b.classList.remove("xn-trade-act", "xn-trade-chip", "xn-trade-check");
      if (b.getAttribute("role") === "switch") continue;
      var aria = b.getAttribute("aria-label") || "";
      var t = txt(b);
      if (/^(争议类型|交易方式|品类)[:：]/.test(aria)) {
        b.classList.add("xn-trade-chip");
        var onChip = /bg-indigo-50|border-indigo-500/.test(String(b.className));
        b.setAttribute("aria-pressed", onChip ? "true" : "false");
      } else if (t.length <= 12 && /复制|生成/.test(t)) {
        b.classList.add("xn-trade-act");
      } else if (t.length > 12) {
        b.classList.add("xn-trade-check");
        var box = b.querySelector("span.rounded");
        b.setAttribute("aria-pressed", box && /bg-indigo-600/.test(String(box.className)) ? "true" : "false");
      }
    }

    /* 4. 勾选框放大到 20×20 */
    var boxes = root.querySelectorAll("button.xn-trade-check > span.rounded");
    for (var m = 0; m < boxes.length; m++) {
      boxes[m].style.width = "20px";
      boxes[m].style.height = "20px";
      boxes[m].style.borderRadius = "6px";
    }

    /* 5. 输入字号统一 16 */
    var fields = root.querySelectorAll("input, select, textarea");
    for (var n = 0; n < fields.length; n++) fields[n].style.fontSize = "16px";
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
