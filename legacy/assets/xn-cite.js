/* R1153 引用格式与文献速查 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnCite) return;
  window.__xnCite = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  var H = function (el) { return Math.round(el.getBoundingClientRect().height); };

  var FORMATS = /^(GB\/T 7714|APA 7|MLA 9|BibTeX)$/;

  /* 页签：36 高 → 44，补 role/aria，剥离「工具E」 */
  function tabs() {
    var bar = null;
    var all = [].slice.call(document.querySelectorAll("#root button")).filter(VIS);
    for (var i = 0; i < all.length; i++) {
      var b = all[i];
      var txt = TXT(b);
      if (!FORMATS.test(txt) && !/^(工具\s*[A-Z]?\s*)?(参考文献去重统计|一致性检查)$/.test(txt)) continue;
      var p = b.parentElement;
      if (!p || p.children.length < 6) continue;
      bar = p;
      break;
    }
    if (!bar) return;
    bar.classList.add("xn-cite-tabbar");
    bar.setAttribute("role", "tablist");
    [].slice.call(bar.children).forEach(function (b) {
      if (b.tagName !== "BUTTON") return;
      b.classList.add("xn-cite-tab");
      b.setAttribute("role", "tab");
      var on = /bg-indigo-600/.test(b.className);
      b.setAttribute("aria-selected", on ? "true" : "false");
      if (on) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
      /* 剥离「工具E」前缀 */
      for (var j = 0; j < b.childNodes.length; j++) {
        var n = b.childNodes[j];
        if (n.nodeType === 3) {
          var v = n.nodeValue.replace(/^\s*工具\s*([A-Z]|\d+)\s*[·:：\-]?\s*/, "");
          if (v !== n.nodeValue) n.nodeValue = v;
        }
      }
    });
  }

  /* 清空输入：16px 文本链接 → 40px 次按钮 */
  function clearBtn() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      if (TXT(b) !== "清空输入") return;
      b.classList.add("xn-cite-clear");
      b.setAttribute("type", "button");
    });
  }

  /* 输入：15→16、46→48；数字输入 20→16 */
  function inputs() {
    [].slice.call(document.querySelectorAll("#root input")).forEach(function (i) {
      var ty = (i.getAttribute("type") || "text").toLowerCase();
      if (ty === "checkbox" || ty === "radio" || ty === "range" || ty === "color" || ty === "file") return;
      i.classList.add("xn-cite-input");
      if (ty === "number") i.classList.add("xn-cite-num");
      if (getComputedStyle(i).fontSize !== "16px") i.style.setProperty("font-size", "16px", "important");
      if (H(i) < 48) i.style.setProperty("min-height", "48px", "important");
    });
  }

  /* 复制按钮：37 → 40 */
  function copyBtn() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      if (!b.querySelector("svg.lucide-copy")) return;
      b.classList.add("xn-cite-copy");
      b.setAttribute("type", "button");
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "复制引用结果");
    });
  }

  function run() {
    tabs();
    clearBtn();
    inputs();
    copyBtn();
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
