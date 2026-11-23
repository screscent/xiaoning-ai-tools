/* R1264 浏览器调试速查合集（dzazvvslwd）· 人用友好层 */
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
      var tabs = root.querySelectorAll('nav a[href^="#/"]');
      for (var i = 0; i < tabs.length; i++) {
        add(tabs[i], "xn-dev-tab");
        setAttr(tabs[i], "aria-pressed", /border-transparent/.test(String(tabs[i].className)) ? "false" : "true");
      }
      if (tabs[0] && tabs[0].parentElement) add(tabs[0].parentElement, "xn-dev-tabs");

      /* 2) 知识卡 */
      var arts = root.querySelectorAll("article");
      for (var a = 0; a < arts.length; a++) {
        if (arts[a].querySelector("h3")) add(arts[a], "xn-dev-card");
      }

      /* 3) 小标签 p.text-xs */
      var ps = root.querySelectorAll("article p");
      for (var p = 0; p < ps.length; p++) {
        var el = ps[p];
        var cls = String(el.className);
        if (cls.indexOf("text-xs") >= 0) add(el, "xn-dev-label");
      }

      /* 4) 标题（无序号，仅保证层级） */
      var h2s = root.querySelectorAll("h2");
      for (var z = 0; z < h2s.length; z++) {
        var raw = txt(h2s[z]);
        var clean = raw.replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "").replace(/^工具[A-Z]\s*/, "");
        if (clean !== raw && clean) h2s[z].textContent = clean;
      }

      /* 5) 兜底可访问名 */
      var bs = root.querySelectorAll("button");
      for (var b = 0; b < bs.length; b++) {
        if (bs[b].getAttribute("aria-label") || txt(bs[b])) continue;
        setAttr(bs[b], "aria-label", "按钮 " + (b + 1));
      }
      var ins = root.querySelectorAll('input[type="text"]');
      for (var n = 0; n < ins.length; n++) {
        if (!ins[n].getAttribute("aria-label")) {
          setAttr(ins[n], "aria-label", ins[n].getAttribute("placeholder") || "搜索");
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
