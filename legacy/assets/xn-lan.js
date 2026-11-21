/* R1148 家庭组网与网线速查合集 — 人用友好增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnLan) return;
  window.__xnLan = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  var H = function (el) { return Math.round(el.getBoundingClientRect().height); };

  /* 工具页签（6 个 button） */
  function tabs() {
    var box = null;
    [].slice.call(document.querySelectorAll("#root div, #root nav, #root ul")).forEach(function (d) {
      if (box) return;
      if (d.children.length !== 6) return;
      var cuts = [].slice.call(d.children);
      var ok = cuts.every(function (c) {
        var it = c.tagName === "LI" ? c.querySelector("a, button") : (c.tagName === "A" || c.tagName === "BUTTON" ? c : null);
        return !!it && H(c) >= 26 && H(c) <= 90 && TXT(c).length <= 10;
      });
      if (ok) box = d;
    });
    if (!box) return;
    box.setAttribute("role", "tablist");
    [].slice.call(box.children).forEach(function (c) {
      var it = c.tagName === "LI" ? c.querySelector("a, button") : c;
      if (!it) return;
      it.classList.add("xn-lan-tab");
      it.setAttribute("role", "tab");
      var on = (/\bbg-white\b/.test(it.className) && !/\bbg-slate-200\b/.test(it.className)) ||
        /\bbg-blue-600\b|\btext-white\b/.test(it.className);
      it.setAttribute("aria-selected", on ? "true" : "false");
      if (on) it.setAttribute("aria-current", "page");
      else it.removeAttribute("aria-current");
      if (!it.getAttribute("aria-label")) it.setAttribute("aria-label", TXT(it));
    });
  }

  /* 复制结果 / 返回 */
  function actions() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      if (TXT(b) !== "复制结果") return;
      b.classList.add("xn-lan-copy");
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "复制查询结果");
    });
    [].slice.call(document.querySelectorAll("#root a")).forEach(function (a) {
      if (!VIS(a)) return;
      if (!/返回工具集/.test(TXT(a))) return;
      a.classList.add("xn-lan-back");
      a.setAttribute("aria-label", "返回工具集列表");
    });
  }

  /* 结果键值行：以「最大传输速率/单段最大长度/…」等开头 */
  function kv() {
    [].slice.call(document.querySelectorAll("#root div, #root p")).forEach(function (e) {
      if (!VIS(e)) return;
      if (e.children.length > 2) return;
      var s = TXT(e);
      if (!/^(最大传输速率|单段最大长度|可支持的常见带宽|两端接法|特性速评|整段线序)/.test(s)) return;
      if (s.length > 120) return;
      e.classList.add("xn-lan-kv");
    });
  }

  /* 剥离「工具 1」「工具A」前缀；隐藏独立代号徽标 */
  function codes() {
    [].slice.call(document.querySelectorAll("#root h1, #root h2, #root h3, #root h4")).forEach(function (h) {
      for (var i = 0; i < h.childNodes.length; i++) {
        var n = h.childNodes[i];
        if (n.nodeType === 3) {
          var v = n.nodeValue.replace(/^\s*工具\s*([A-Z]|\d+)\s*[·:：\-]?\s*/, "");
          if (v !== n.nodeValue) n.nodeValue = v;
          break;
        }
      }
    });
    [].slice.call(document.querySelectorAll("#root span, #root div")).forEach(function (e) {
      if (e.children.length) return;
      if (!/^工具\s*([A-Z]|\d+)$/.test(TXT(e))) return;
      if (H(e) > 40) return;
      e.classList.add("xn-lan-code");
    });
  }

  function run() {
    tabs();
    actions();
    kv();
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
