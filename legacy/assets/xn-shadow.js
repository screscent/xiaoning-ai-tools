/* R1130 CSS 阴影生成与预设对比 — 人用友好增强（幂等，不碰 React 状态） */
(function () {
  "use strict";
  if (window.__xnShadow) return;
  window.__xnShadow = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  var BTNS = function () { return [].slice.call(document.querySelectorAll("#root button")); };

  /* 页签 */
  function tabs() {
    var els = [].slice.call(document.querySelectorAll("#root .top-nav .nav-item"));
    if (!els.length) return;
    var box = els[0].parentElement;
    if (box && box.getAttribute("data-xn-shadow-tabs") !== "1") {
      box.setAttribute("data-xn-shadow-tabs", "1");
      box.setAttribute("role", "tablist");
      box.setAttribute("aria-label", "阴影工具");
    }
    els.forEach(function (b) {
      var active = /(^|\s)active(\s|$)/.test(b.className);
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", active ? "true" : "false");
      if (active) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    });
  }

  /* 内阴影开关：.toggle-bar.off / .on */
  function toggles() {
    [].slice.call(document.querySelectorAll("#root .toggle-bar")).forEach(function (b) {
      var on = /(^|\s)on(\s|$)/.test(b.className);
      b.setAttribute("role", "switch");
      b.setAttribute("aria-checked", on ? "true" : "false");
      b.setAttribute("aria-label", "内阴影");
      b.setAttribute("title", "内阴影：" + (on ? "开" : "关") + "（点击切换）");
    });
  }

  /* 滑杆：补 aria-valuetext（透明度不带 px） */
  function ranges() {
    [].slice.call(document.querySelectorAll("#root input[type=range]")).forEach(function (r) {
      var label = r.getAttribute("aria-label") || "";
      var unit = /透明度/.test(label) ? "" : "px";
      r.setAttribute("aria-valuetext", r.value + unit);
    });
  }

  /* 按钮层级 */
  function actions() {
    BTNS().forEach(function (b) {
      if (!VIS(b)) return;
      var s = TXT(b);
      if (s === "复制 CSS") {
        b.classList.add("xn-shadow-primary");
        b.setAttribute("aria-label", "复制生成的 CSS 到剪贴板");
      } else if (s === "随机" || s === "重置") {
        b.classList.add("xn-shadow-secondary");
        b.setAttribute("aria-label", s === "随机" ? "随机生成一组阴影参数" : "恢复默认阴影参数");
      } else if (s === "复制") {
        b.classList.add("xn-shadow-copy");
        var card = b.closest(".preset-card");
        var name = card ? TXT(card.querySelector(".preset-name") || card).slice(0, 20) : "";
        b.setAttribute("aria-label", name ? "复制「" + name + "」的阴影代码" : "复制阴影代码");
      }
    });
  }

  /* 标题去 ①–⑩ 序号 */
  function headings() {
    [].slice.call(document.querySelectorAll("#root h2")).forEach(function (h) {
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
    toggles();
    ranges();
    actions();
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
