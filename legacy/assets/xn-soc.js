/* R1263 社交图片切图与比例合集（bnu92knsmb）· 人用友好层 */
(function () {
  "use strict";
  function txt(el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function del(el, c) { if (el && el.classList.contains(c)) el.classList.remove(c); }
  function setAttr(el, k, v) { if (el && el.getAttribute(k) !== v) el.setAttribute(k, v); }
  var applying = false;

  function apply() {
    if (applying) return;
    var root = document.getElementById("root");
    if (!root) return;
    applying = true;
    try {
      /* 1) 工具导航 */
      var tabs = root.querySelectorAll('nav a[href^="#/"]');
      for (var i = 0; i < tabs.length; i++) {
        add(tabs[i], "xn-soc-tab");
        setAttr(tabs[i], "aria-pressed", /bg-blue-600/.test(String(tabs[i].className)) ? "true" : "false");
      }
      if (tabs[0] && tabs[0].parentElement) add(tabs[0].parentElement, "xn-soc-tabs");

      /* 2) 按钮分级：上传 / 复制 / chip */
      var btns = root.querySelectorAll("button");
      for (var b = 0; b < btns.length; b++) {
        var bt = btns[b];
        var s = txt(bt);
        var cls = String(bt.className);
        if (s === "上传图片") { add(bt, "xn-soc-primary"); del(bt, "xn-soc-ghost"); del(bt, "xn-soc-chip"); continue; }
        if (/一键复制/.test(s)) { add(bt, "xn-soc-ghost"); del(bt, "xn-soc-primary"); del(bt, "xn-soc-chip"); continue; }
        if (cls.indexOf("rounded-lg") >= 0 && cls.indexOf("text-xs") >= 0 && cls.indexOf("border") >= 0) {
          add(bt, "xn-soc-chip");
          del(bt, "xn-soc-primary"); del(bt, "xn-soc-ghost");
          setAttr(bt, "aria-pressed", /bg-blue-50/.test(cls) ? "true" : "false");
        }
      }

      /* 3) 空态 / 预览区 */
      var divs = root.querySelectorAll("div");
      for (var d = 0; d < divs.length; d++) {
        var el = divs[d];
        var et = txt(el);
        if (el.children.length === 0 && /请先上传图片|上传图片后/.test(et)) add(el, "xn-soc-empty");
      }
      var svgs = root.querySelectorAll("svg");
      for (var v = 0; v < svgs.length; v++) {
        var sr = svgs[v].getBoundingClientRect();
        if (sr.width >= 120 && sr.height >= 120 && svgs[v].parentElement) add(svgs[v].parentElement, "xn-soc-preview");
      }

      /* 4) 标题去序号 / 工具字母前缀 */
      var h2s = root.querySelectorAll("h2");
      for (var z = 0; z < h2s.length; z++) {
        var raw = txt(h2s[z]);
        var clean = raw.replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "").replace(/^工具[A-Z]\s*/, "");
        if (clean !== raw && clean) h2s[z].textContent = clean;
      }

      /* 5) 兜底可访问名 */
      var anon = 0;
      var bs = root.querySelectorAll("button");
      for (var q = 0; q < bs.length; q++) {
        if (bs[q].getAttribute("aria-label") || txt(bs[q])) continue;
        anon += 1;
        setAttr(bs[q], "aria-label", "按钮 " + anon);
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
  document.addEventListener("input", function () { setTimeout(apply, 90); }, true);
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
