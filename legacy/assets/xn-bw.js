/* R1252 文件传输与带宽估算合集（5culhkt6g5）
 * 只做语义与呈现增强：吸顶导航选中同步、计算/复制归类、结果数值放大。
 */
(function () {
  "use strict";

  function txt(el) {
    return (el.textContent || "").replace(/\s+/g, " ").trim();
  }

  function syncTabs(nav) {
    var links = nav.querySelectorAll("a");
    var hash = location.hash;
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var href = a.getAttribute("href") || "";
      a.setAttribute("role", "tab");
      a.setAttribute("aria-selected", hash && href === hash ? "true" : (!hash && i === 0 ? "true" : "false"));
    }
  }

  function apply() {
    var root = document.getElementById("root");
    if (!root) return;

    /* 1. 吸顶导航 */
    var nav = root.querySelector("nav");
    if (nav) {
      nav.classList.add("xn-bw-tabs");
      nav.setAttribute("role", "tablist");
      nav.setAttribute("aria-label", "带宽工具跳转");
      var inner = nav.querySelector("a") ? nav.querySelector("a").parentElement : null;
      if (inner && inner !== nav) inner.classList.add("xn-bw-tabs-inner");
      syncTabs(nav);
    }

    /* 2. 按钮归类 */
    var btns = root.querySelectorAll("button");
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      b.classList.remove("xn-bw-calc", "xn-bw-copy");
      var t = txt(b);
      if (t === "计算") b.classList.add("xn-bw-calc");
      else if (t === "复制") b.classList.add("xn-bw-copy");
    }

    /* 3. 结果数值放大 */
    var vals = root.querySelectorAll("div.text-lg.font-bold, span.text-lg.font-bold");
    for (var j = 0; j < vals.length; j++) {
      var v = vals[j];
      v.classList.add("xn-bw-val");
      if (v.children.length === 0 && txt(v).length > 8) v.classList.add("xn-bw-val-sm");
    }

    /* 4. 标题去「工具F」 */
    var h2s = root.querySelectorAll("h2");
    for (var k = 0; k < h2s.length; k++) {
      var raw = txt(h2s[k]);
      var clean = raw.replace(/^工具[A-Z]\s*/, "").replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "");
      if (clean !== raw && clean) h2s[k].textContent = clean;
    }
  }

  apply();
  window.addEventListener("hashchange", function () {
    var nav = document.querySelector("#root nav.xn-bw-tabs");
    if (nav) syncTabs(nav);
    setTimeout(apply, 80);
  });

  var rootEl = document.getElementById("root");
  if (rootEl && window.MutationObserver) {
    var timer = null;
    new MutationObserver(function () {
      clearTimeout(timer);
      timer = setTimeout(apply, 150);
    }).observe(rootEl, { childList: true, subtree: true });
  }
})();
