/* R1246 HTML 实体与常用符号合集（dzkfeyslwd）
 * 只做语义与可用性增强：tabs 放大、分段控件 aria、主次按钮归类、实体卡键盘可达。
 */
(function () {
  "use strict";

  function txt(el) {
    return (el.textContent || "").replace(/\s+/g, " ").trim();
  }

  function apply() {
    var root = document.getElementById("root");
    if (!root) return;

    /* 1. 工具导航：24 → 44，补选中语义 */
    var nav = root.querySelector("nav");
    if (nav) {
      nav.classList.add("xn-ent-tabs");
      nav.setAttribute("role", "tablist");
      nav.setAttribute("aria-label", "实体工具切换");
      var links = nav.querySelectorAll("a");
      for (var i = 0; i < links.length; i++) {
        var a = links[i];
        var on = /bg-blue-500/.test(String(a.className));
        a.setAttribute("role", "tab");
        a.setAttribute("aria-selected", on ? "true" : "false");
      }
    }

    /* 2. 标题去掉 ② 序号 */
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
      b.classList.remove("xn-ent-seg", "xn-ent-primary", "xn-ent-secondary");
      b.removeAttribute("aria-pressed");
      var t = txt(b);
      var cls = String(b.className);
      if (t === "编码" || t === "解码" || t === "开" || t === "关") {
        b.classList.add("xn-ent-seg");
        b.setAttribute("aria-pressed", /bg-blue-500/.test(cls) ? "true" : "false");
        var wrap = b.parentElement;
        if (wrap && wrap.querySelectorAll("button").length >= 2) {
          wrap.classList.add("xn-ent-segwrap");
          if (!wrap.getAttribute("role")) wrap.setAttribute("role", "group");
        }
      } else if (/复制结果|复制列表/.test(t)) {
        b.classList.add("xn-ent-primary");
      } else if (/交换输入输出|清空/.test(t)) {
        b.classList.add("xn-ent-secondary");
      }
    }

    /* 4. 实体卡：键盘可达 + 语义 */
    var cards = root.querySelectorAll("div.bg-gray-50\\/60, div[class*='bg-gray-50/60']");
    for (var m = 0; m < cards.length; m++) {
      var c = cards[m];
      c.classList.add("xn-ent-card");
      if (!c.getAttribute("tabindex")) c.setAttribute("tabindex", "0");
      if (!c.getAttribute("role")) c.setAttribute("role", "button");
      var g = c.firstElementChild;
      var code = c.lastElementChild;
      var label = (g ? txt(g) : "") + (code ? " " + txt(code) : "");
      if (!c.getAttribute("aria-label") && label) c.setAttribute("aria-label", "复制 " + label.trim());
      if (!c._xnKey) {
        c._xnKey = true;
        c.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            this.click();
          }
        });
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
