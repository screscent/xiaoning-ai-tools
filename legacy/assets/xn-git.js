/* R1266 Git 分支与冲突处理合集（ij3fk58zig）· 人用友好层 */
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
      /* 1) 工具导航卡 */
      var tabs = root.querySelectorAll('a[href^="#/"]');
      for (var i = 0; i < tabs.length; i++) add(tabs[i], "xn-git-tab");

      /* 2) chip / 复制 / 作者 */
      var btns = root.querySelectorAll("button");
      for (var b = 0; b < btns.length; b++) {
        var bt = btns[b];
        var cls = String(bt.className);
        if (cls.indexOf("rounded-full") >= 0) add(bt, "xn-git-chip");
        if (bt.getAttribute("aria-label") === "复制" || txt(bt) === "复制") add(bt, "xn-git-copy");
      }
      var h3s = root.querySelectorAll("h3");
      for (var h = 0; h < h3s.length; h++) {
        if (/作者信息/.test(txt(h3s[h]))) add(h3s[h], "xn-git-author");
      }

      /* 3) 兜底可访问名 */
      var anon = 0;
      for (var q = 0; q < btns.length; q++) {
        if (btns[q].getAttribute("aria-label") || txt(btns[q])) continue;
        anon += 1;
        setAttr(btns[q], "aria-label", "按钮 " + anon);
      }
      var ins = root.querySelectorAll('input[type="text"]');
      for (var n = 0; n < ins.length; n++) {
        if (!ins[n].getAttribute("aria-label")) {
          setAttr(ins[n], "aria-label", ins[n].getAttribute("placeholder") || "搜索命令");
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
