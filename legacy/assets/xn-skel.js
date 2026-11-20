/* R1136 骨架屏与阴影生成合集 — 人用友好增强（幂等，不碰 React 状态） */
(function () {
  "use strict";
  if (window.__xnSkel) return;
  window.__xnSkel = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  var BTNS = function () { return [].slice.call(document.querySelectorAll("#root button")); };

  /* 页签 */
  function tabs() {
    var btns = BTNS().filter(function (b) {
      var s = TXT(b);
      return (s === "骨架屏" || s === "阴影生成") && VIS(b);
    });
    if (btns.length < 2) return;
    var box = btns[0].parentElement;
    if (box && box.getAttribute("data-xn-skel-tabs") !== "1") {
      box.setAttribute("data-xn-skel-tabs", "1");
      box.setAttribute("role", "tablist");
      box.setAttribute("aria-label", "骨架屏与阴影工具");
    }
    btns.forEach(function (b) {
      var bg = getComputedStyle(b).backgroundColor;
      var active = bg !== "rgb(255, 255, 255)" && bg !== "rgba(0, 0, 0, 0)";
      b.classList.add("xn-skel-tab");
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", active ? "true" : "false");
      if (active) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    });
  }

  /* 两个开关：闪耀动画 / 是否内阴影 */
  function switches() {
    BTNS().forEach(function (b) {
      if (b.getAttribute("role") !== "switch") return;
      var ctx = TXT(b.parentElement || b);
      var label = /闪耀/.test(ctx) ? "闪耀动画" : /内阴影/.test(ctx) ? "内阴影" : "开关";
      b.classList.add("xn-skel-switch");
      b.setAttribute("aria-label", label);
      b.setAttribute("title", label + "：" + (b.getAttribute("aria-checked") === "true" ? "开" : "关") + "（点击切换）");
    });
  }

  /* 按钮与预设 chip */
  function actions() {
    BTNS().forEach(function (b) {
      if (!VIS(b)) return;
      var s = TXT(b);
      if (s === "复制 CSS") {
        b.classList.add("xn-skel-primary");
        var card = b.closest("section") || b.closest("div");
        var name = card ? TXT(card).slice(0, 8) : "";
        b.setAttribute("aria-label", /阴影/.test(name) ? "复制阴影 CSS" : "复制骨架屏 CSS");
      } else if (s === "复制 HTML") {
        b.classList.add("xn-skel-secondary");
        b.setAttribute("aria-label", "复制 HTML 结构到剪贴板");
      } else if (s === "清空（重置）") {
        b.classList.add("xn-skel-ghost");
        b.setAttribute("aria-label", "清空并恢复默认参数");
      } else if (/^(轻浮起|卡片|悬浮|内凹)$/.test(s)) {
        b.classList.add("xn-skel-chip");
        b.setAttribute("aria-pressed", "false");
        b.setAttribute("aria-label", "阴影预设：" + s);
      }
    });
  }

  /* 快照的预设 chip 没有选中态：点击后自行标记，保证「当前预设」可见 */
  function chipStates() {
    [].slice.call(document.querySelectorAll("#root button.xn-skel-chip")).forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-xn-sel") === "1" ? "true" : "false");
    });
  }

  function bindChips() {
    if (document.documentElement.getAttribute("data-xn-chip") === "1") return;
    document.documentElement.setAttribute("data-xn-chip", "1");
    document.addEventListener("click", function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      var chip = t.closest("#root button.xn-skel-chip");
      if (!chip) return;
      [].slice.call(document.querySelectorAll("#root button.xn-skel-chip")).forEach(function (x) {
        if (x === chip) x.setAttribute("data-xn-sel", "1");
        else x.removeAttribute("data-xn-sel");
      });
      chipStates();
    }, true);
  }

  /* H2/H3 去 ①–⑩ */
  function headings() {
    [].slice.call(document.querySelectorAll("#root h2, #root h3")).forEach(function (h) {
      for (var i = 0; i < h.childNodes.length; i++) {
        var n = h.childNodes[i];
        if (n.nodeType === 3) {
          var v = n.nodeValue.replace(/^[\s\u2460-\u2469]+/, "");
          if (v !== n.nodeValue) n.nodeValue = v;
          break;
        }
      }
    });
  }

  function run() {
    tabs();
    switches();
    actions();
    bindChips();
    chipStates();
    headings();
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
