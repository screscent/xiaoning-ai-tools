/* R1258 配色方案与变体合集（bcsb5nk6f9） */
(function () {
  "use strict";
  function txt(el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); }
  function apply() {
    var root = document.getElementById("root");
    if (!root) return;
    var btns = root.querySelectorAll("button");
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      b.classList.remove("xn-pal-tab", "xn-pal-copy", "xn-pal-swatch", "xn-pal-primary");
      var t = txt(b);
      if (t === "配色方案" || t === "明暗变体") {
        b.classList.add("xn-pal-tab");
        b.setAttribute("role", "tab");
        var on = /text-white/.test(String(b.className)) || b.getAttribute("aria-current") === "page";
        b.setAttribute("aria-selected", on ? "true" : "false");
      } else if (t === "随机基色") {
        b.classList.add("xn-pal-primary");
      } else if (/^复制/.test(t)) {
        b.classList.add("xn-pal-copy");
      } else if (/^#[0-9A-Fa-f]{3,8}$/.test(t)) {
        b.classList.add("xn-pal-swatch");
      }
    }
    /* 色卡在数据渲染前可能暂无文本，补可访问名称 */
    var anon = 0;
    var bs2 = root.querySelectorAll("button");
    for (var q = 0; q < bs2.length; q++) {
      var bb = bs2[q];
      if (bb.getAttribute("aria-label") || txt(bb)) continue;
      anon += 1;
      bb.setAttribute("aria-label", "色卡 " + anon);
    }

    var h2s = root.querySelectorAll("h2");
    for (var j = 0; j < h2s.length; j++) {
      var raw = txt(h2s[j]);
      var clean = raw.replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "").replace(/^工具[A-Z]\s*/, "");
      if (clean !== raw && clean) h2s[j].textContent = clean;
    }
  }
  apply();
  setTimeout(apply, 300);
  setTimeout(apply, 900);
  window.addEventListener("hashchange", function () { setTimeout(apply, 100); });
  var rootEl = document.getElementById("root");
  if (rootEl && window.MutationObserver) {
    var timer = null;
    new MutationObserver(function () { clearTimeout(timer); timer = setTimeout(apply, 150); })
      .observe(rootEl, { childList: true, subtree: true });
  }
})();
