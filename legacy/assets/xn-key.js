/* R1261 办公软件快捷键速查合集（c7axmregmi）· 人用友好层
 * 幂等写 class / aria；attributes 观察与 React 重渲染共存。
 */
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
      /* 1) 工具区 + 副标题 */
      var secs = root.querySelectorAll("section");
      for (var i = 0; i < secs.length; i++) {
        var s = secs[i];
        if (!s.querySelector("h2")) continue;
        add(s, "xn-key-sec");
        var ps = s.querySelectorAll("p");
        for (var j = 0; j < ps.length; j++) {
          if (/共\s*\d+\s*条/.test(txt(ps[j]))) add(ps[j], "xn-key-sub");
        }
      }

      /* 2) 分类标题 + 快捷键行 */
      var h3s = root.querySelectorAll("h3");
      for (var k = 0; k < h3s.length; k++) add(h3s[k], "xn-key-cat");

      var lis = root.querySelectorAll("li");
      for (var l = 0; l < lis.length; l++) {
        if (lis[l].querySelector("kbd")) add(lis[l], "xn-key-row");
      }

      /* 3) 按钮分级 */
      var btns = root.querySelectorAll("button");
      for (var b = 0; b < btns.length; b++) {
        var bt = btns[b];
        var t = txt(bt);
        var aria = bt.getAttribute("aria-label") || "";
        if (t === "复制全部结果") add(bt, "xn-key-primary");
        else if (/^复制/.test(aria) || /^复制/.test(t)) add(bt, "xn-key-copy");
        if (!aria && !t) setAttr(bt, "aria-label", "复制快捷键");
      }

      /* 4) 搜索框兜底名称 */
      var ins = root.querySelectorAll('input[type="text"]');
      for (var n = 0; n < ins.length; n++) {
        if (!ins[n].getAttribute("aria-label")) {
          setAttr(ins[n], "aria-label", ins[n].getAttribute("placeholder") || "筛选快捷键");
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
