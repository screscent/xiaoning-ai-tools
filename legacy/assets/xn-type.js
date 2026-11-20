/* R1138 打字练习与速度合集 — 人用友好增强（幂等，不碰 React 计时） */
(function () {
  "use strict";
  if (window.__xnType) return;
  window.__xnType = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  /* 顶部工具导航：44 高 + 去「工具F ·」前缀 + aria-current */
  function navTabs() {
    [].slice.call(document.querySelectorAll("#root a")).forEach(function (a) {
      var s = TXT(a);
      if (!/^(速度|错键|练习|趋势|指法|工具[A-Z]\s)/.test(s) || s.length > 22) return;
      if (!VIS(a)) return;
      var box = a.parentElement;
      if (box && box.getAttribute("data-xn-type-tabs") !== "1") {
        box.setAttribute("data-xn-type-tabs", "1");
        box.setAttribute("role", "tablist");
      }
      a.classList.add("xn-type-tab");
      a.setAttribute("role", "tab");

      /* 文本节点去前缀 */
      for (var i = 0; i < a.childNodes.length; i++) {
        var n = a.childNodes[i];
        if (n.nodeType === 3) {
          var v = n.nodeValue.replace(/^\s*工具[A-Z]\s*[·:：\-]?\s*/, "");
          if (v !== n.nodeValue) n.nodeValue = v;
          break;
        }
      }

      var active = /\btext-blue-600\b|\bbg-blue-600\b|\bbg-blue-50\b/.test(a.className);
      a.setAttribute("aria-selected", active ? "true" : "false");
      if (active) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  /* 选项 chip：短文/中文/英文、30/60/120 秒 */
  function chips() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      var s = TXT(b);
      if (!/^(短文|中文|英文|30 秒|60 秒|120 秒)$/.test(s)) return;
      if (!VIS(b)) return;
      b.classList.add("xn-type-chip");
      var on = /\bbg-white\b/.test(b.className) && /\btext-blue-600\b/.test(b.className);
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.setAttribute("title", s + (on ? "（已选中）" : "（点击选择）"));
    });
  }

  /* 主/次按钮 */
  function actions() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      var s = TXT(b);
      if (s === "开始测试") {
        b.classList.add("xn-type-primary");
        b.setAttribute("aria-label", "开始打字测试");
      } else if (s === "重置") {
        b.classList.add("xn-type-secondary");
        b.setAttribute("aria-label", "重置测试");
      }
    });
  }

  /* 源文用 NBSP(U+00A0) 占位，浏览器不会在此断行 → 英文长句单行溢出。
     仅把展示层 NBSP 还原为普通空格（pre-wrap 下仍保留空白），让文本按词换行。 */
  function replaceNb(root) {
    if (!root) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var n;
    while ((n = w.nextNode())) {
      if (n.nodeValue && n.nodeValue.indexOf("\u00a0") !== -1) {
        n.nodeValue = n.nodeValue.replace(/\u00a0/g, " ");
      }
    }
  }

  function flowText() {
    [].slice.call(document.querySelectorAll('#root [class*="whitespace-pre-wrap"]')).forEach(function (box) {
      if (!VIS(box)) return;
      if (box.getAttribute("data-xn-type-wrap") !== "1") {
        box.setAttribute("data-xn-type-wrap", "1");
        var mo2 = new MutationObserver(function () { replaceNb(box); });
        mo2.observe(box, { childList: true, subtree: true, characterData: true });
      }
      replaceNb(box);
    });
  }

  function run() {
    navTabs();
    chips();
    actions();
    flowText();
  }

  var timer = null;
  function schedule() {
    if (timer) return;
    timer = setTimeout(function () { timer = null; run(); }, 90);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule);
  else schedule();
  window.addEventListener("load", schedule);
  var mo = new MutationObserver(schedule);
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  setTimeout(run, 700);
  setTimeout(run, 1600);
})();
