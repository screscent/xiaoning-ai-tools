/* R1268 区间与排期统计合集（ijapvv8zig）· 人用友好层 */
(function () {
  "use strict";
  function txt(el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function setAttr(el, k, v) { if (el && el.getAttribute(k) !== v) el.setAttribute(k, v); }
  var applying = false;

  function apply() {
    if (applying) return;
    var root = document.getElementById("root");
    if (!root) return;
    applying = true;
    try {
      /* 1) 工具 tab */
      var tabs = root.querySelectorAll('a[href^="#/"]');
      for (var i = 0; i < tabs.length; i++) {
        add(tabs[i], "xn-pl-tab");
        setAttr(tabs[i], "aria-pressed", /bg-blue-500/.test(String(tabs[i].className)) ? "true" : "false");
      }

      /* 2) 复制按钮 */
      var btns = root.querySelectorAll("button");
      for (var b = 0; b < btns.length; b++) {
        var s = txt(btns[b]);
        if (s === "复制结果" || s === "复制") add(btns[b], "xn-pl-copy");
      }

      /* 3) 统计卡 / 大数字 / 单位 / 表格 */
      var divs = root.querySelectorAll("div");
      for (var d = 0; d < divs.length; d++) {
        var el = divs[d];
        var cls = String(el.className);
        if (cls.indexOf("rounded-xl") >= 0 && /bg-(amber|blue|emerald|rose|indigo|gray|green)-50/.test(cls)) add(el, "xn-pl-stat");
        if (cls.indexOf("text-2xl") >= 0 && /^\d/.test(txt(el))) add(el, "xn-pl-big");
      }
      var leaves = root.querySelectorAll("span,div,strong,p");
      for (var n = 0; n < leaves.length; n++) {
        var e = leaves[n];
        if (e.children.length) continue;
        var v = txt(e);
        if (!v || v.length > 10) continue;
        var fs = parseFloat(getComputedStyle(e).fontSize);
        if (/^[\d.,]+$/.test(v) && fs >= 22) add(e, "xn-pl-big");
        else if (/^(天|次|个)$/.test(v)) add(e, "xn-pl-unit");
      }
      var tbs = root.querySelectorAll("table");
      for (var t = 0; t < tbs.length; t++) add(tbs[t], "xn-pl-table");

      /* 4) 标题去工具字母 */
      var h2s = root.querySelectorAll("h2");
      for (var z = 0; z < h2s.length; z++) {
        var raw = txt(h2s[z]);
        var clean = raw.replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "").replace(/^工具[A-Z]\s*/, "");
        if (clean !== raw && clean) h2s[z].textContent = clean;
      }

      /* 5) 兜底可访问名 */
      var anon = 0;
      for (var q = 0; q < btns.length; q++) {
        if (btns[q].getAttribute("aria-label") || txt(btns[q])) continue;
        anon += 1;
        setAttr(btns[q], "aria-label", "按钮 " + anon);
      }
      var ins = root.querySelectorAll("input");
      for (var k = 0; k < ins.length; k++) {
        if (!ins[k].getAttribute("aria-label")) {
          var lb = ins[k].parentElement && ins[k].parentElement.querySelector("label");
          setAttr(ins[k], "aria-label", lb ? txt(lb) : (ins[k].getAttribute("placeholder") || "输入"));
        }
      }
    } finally {
      applying = false;
    }
  }

  apply();
  setTimeout(apply, 300);
  setTimeout(apply, 900);
  setTimeout(apply, 1800);
  window.addEventListener("hashchange", function () { setTimeout(apply, 120); });
  document.addEventListener("click", function () { setTimeout(apply, 60); setTimeout(apply, 260); setTimeout(apply, 700); }, true);
  document.addEventListener("input", function () { setTimeout(apply, 100); }, true);
  var rootEl = document.getElementById("root");
  if (rootEl && window.MutationObserver) {
    var timer = null;
    new MutationObserver(function () {
      if (applying) return;
      clearTimeout(timer);
      timer = setTimeout(apply, 140);
    }).observe(rootEl, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  }
})();
