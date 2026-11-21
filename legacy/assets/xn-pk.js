/* R1156 乒乓球入门与器材合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnPk) return;
  window.__xnPk = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  var H = function (el) { return Math.round(el.getBoundingClientRect().height); };

  var TAB = /^(器材搭配|旋转术语|赛制计分|训练计划|回合|发球接发)$/;
  var CHIP = /^(弧圈|快攻|削球|软|中|硬)$/;
  var LABEL = /^(推荐底板类型|胶皮类型与厚度|海绵硬度建议|预算分配（底板 \/ 正手 \/ 反手）)$/;

  function tabs() {
    var list = [].slice.call(document.querySelectorAll("#root a")).filter(function (a) {
      return VIS(a) && TAB.test(TXT(a)) && H(a) >= 32 && H(a) <= 60;
    });
    if (list.length < 6) return;
    var bar = list[0].parentElement;
    if (bar && bar.children.length === 6) bar.classList.add("xn-pk-tabbar");
    list.forEach(function (a) {
      a.classList.add("xn-pk-tab");
      var on = /bg-slate-900|bg-blue-600/.test(a.className) && /text-white/.test(a.className);
      if (on) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  function chips() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      if (!CHIP.test(TXT(b))) return;
      b.classList.add("xn-pk-chip");
      b.setAttribute("type", "button");
    });
  }

  function copyBtn() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      if (!/一键复制结果/.test(TXT(b))) return;
      b.classList.add("xn-pk-copy");
      b.setAttribute("type", "button");
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "复制计算结果");
    });
  }

  function inputs() {
    [].slice.call(document.querySelectorAll("#root input")).forEach(function (i) {
      var ty = (i.getAttribute("type") || "text").toLowerCase();
      if (ty === "checkbox" || ty === "radio" || ty === "range" || ty === "color" || ty === "file") return;
      i.classList.add("xn-pk-input");
      if (getComputedStyle(i).fontSize !== "16px") i.style.setProperty("font-size", "16px", "important");
      if (H(i) < 48) i.style.setProperty("min-height", "48px", "important");
    });
  }

  function labels() {
    [].slice.call(document.querySelectorAll("#root p, #root span, #root div")).forEach(function (e) {
      if (e.children.length) return;
      if (!LABEL.test(TXT(e))) return;
      e.classList.add("xn-pk-label");
      if (getComputedStyle(e).fontSize !== "13px") e.style.setProperty("font-size", "13px", "important");
    });
  }

  function codes() {
    [].slice.call(document.querySelectorAll("#root h1, #root h2, #root h3")).forEach(function (h) {
      for (var i = 0; i < h.childNodes.length; i++) {
        var n = h.childNodes[i];
        if (n.nodeType === 3) {
          var v = n.nodeValue.replace(/^\s*工具\s*([A-Z]|\d+)\s*[·:：\-]?\s*/, "");
          if (v !== n.nodeValue) n.nodeValue = v;
          break;
        }
      }
    });
  }

  function run() {
    tabs();
    chips();
    copyBtn();
    inputs();
    labels();
    codes();
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
