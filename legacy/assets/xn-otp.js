/* R1133 两步验证与恢复码合集 — 人用友好增强（幂等，不碰 React 状态） */
(function () {
  "use strict";
  if (window.__xnOtp) return;
  window.__xnOtp = true;

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
      return (s === "恢复码" || s === "两步验证") && VIS(b);
    });
    if (btns.length < 2) return;
    var box = btns[0].parentElement;
    if (box && box.getAttribute("data-xn-otp-tabs") !== "1") {
      box.setAttribute("data-xn-otp-tabs", "1");
      box.setAttribute("role", "tablist");
      box.setAttribute("aria-label", "两步验证工具");
    }
    btns.forEach(function (b) {
      var active = /(^|\s)(bg-blue-600|bg-indigo-600|bg-slate-900)(\s|$)/.test(b.className);
      b.classList.add("xn-otp-tab");
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", active ? "true" : "false");
      if (active) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    });
  }

  /* 去混淆开关（空文本 + 轨道） */
  function switches() {
    BTNS().forEach(function (b) {
      if (TXT(b)) return;
      if (!/(^|\s)w-11(\s|$)/.test(b.className) || !/(^|\s)h-6(\s|$)/.test(b.className)) return;
      var on = /(^|\s)(bg-indigo-500|bg-indigo-600|bg-blue-500|bg-blue-600|bg-emerald-500)(\s|$)/.test(b.className);
      b.classList.add("xn-otp-switch");
      b.setAttribute("role", "switch");
      b.setAttribute("aria-checked", on ? "true" : "false");
      b.setAttribute("aria-label", "去除易混淆字符");
      b.setAttribute("title", "去除易混淆字符（0/O、1/I）：" + (on ? "开" : "关"));
    });
  }

  /* 按钮层级 */
  function actions() {
    BTNS().forEach(function (b) {
      if (!VIS(b)) return;
      var s = TXT(b);
      if (s === "生成恢复码" || s === "复制验证码" || s === "复制全部") {
        b.classList.add("xn-otp-primary");
        if (s === "生成恢复码") b.setAttribute("aria-label", "生成恢复码");
        else if (s === "复制验证码") b.setAttribute("aria-label", "复制当前验证码到剪贴板");
        else b.setAttribute("aria-label", "复制全部恢复码到剪贴板");
      } else if (s === "清空") {
        b.classList.add("xn-otp-secondary");
        b.setAttribute("aria-label", "清空已生成的恢复码");
      }
    });
  }

  /* 恢复码列表：等宽行卡 */
  function recoveryList() {
    [].slice.call(document.querySelectorAll("#root div.py-0\\.5")).forEach(function (line) {
      if (!/^\d+\.\s*[A-Za-z0-9]/.test(TXT(line))) return;
      line.classList.add("xn-otp-line");
      var box = line.parentElement;
      if (box && box.getAttribute("data-xn-otp-list") !== "1") {
        box.setAttribute("data-xn-otp-list", "1");
        box.classList.add("xn-otp-list");
      }
    });
  }

  /* 标题去 ①–⑩ 序号 */
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
    recoveryList();
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
