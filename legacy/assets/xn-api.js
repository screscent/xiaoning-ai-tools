/* R1169 API 设计与 OpenAPI 速查合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnApi) return;
  window.__xnApi = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  var H = function (el) { return Math.round(el.getBoundingClientRect().height); };
  var W = function (el) { return Math.round(el.getBoundingClientRect().width); };

  var TAB = /^(工具\s*[A-Z]\s*)?(REST 命名|OpenAPI 片段|错误码与分页|版本与兼容|限流与重试估算|幂等设计)$/;
  var CHIP = /^(订单|用户|文章|商品|评论|user-profile|article|product|comment|order)$/;

  var CODE = /^\s*工具\s*([A-Z]|\d+)\s*[·:：\-]?\s*/;

  function cleanText(el) {
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    var n;
    while ((n = w.nextNode())) {
      var v = n.nodeValue.replace(CODE, "");
      if (v !== n.nodeValue) n.nodeValue = v;
    }
  }

  function tabs() {
    var list = [].slice.call(document.querySelectorAll("#root a")).filter(function (a) {
      return VIS(a) && TAB.test(TXT(a)) && H(a) >= 30 && H(a) <= 60;
    });
    if (list.length < 6) return;
    var bar = list[0].parentElement;
    if (bar && bar.children.length === 6) bar.setAttribute("role", "tablist");
    list.forEach(function (a) {
      a.classList.add("xn-api-tab");
      a.setAttribute("role", "tab");
      cleanText(a);
      var on = /(^|\s)bg-white(\s|$)/.test(a.className) && /text-indigo/.test(a.className);
      if (on) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
      a.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  function controls() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      var v = TXT(b);
      if (CHIP.test(v)) {
        b.classList.add("xn-api-chip");
        b.setAttribute("type", "button");
        var on = /bg-indigo-600/.test(b.className) || /bg-indigo-500/.test(b.className);
        b.setAttribute("aria-pressed", on ? "true" : "false");
        return;
      }
      /* 快速选择胶囊（错误码设计 / 分页 / 限流 / 幂等等） */
      var rounded = /rounded-full/.test(b.className) && !/^复制/.test(v) && v.length > 0 && v.length <= 10;
      if (rounded && H(b) <= 42) {
        b.classList.add("xn-api-chip");
        b.setAttribute("type", "button");
        var sel = /(^|\s)border-indigo-(500|600)(\s|$)/.test(b.className) || /(^|\s)bg-indigo-(500|600)(\s|$)/.test(b.className);
        b.setAttribute("aria-pressed", sel ? "true" : "false");
        return;
      }
      var hasCopyIcon = !!b.querySelector("svg.lucide-copy, svg.lucide-clipboard");
      if (/^复制/.test(v) || hasCopyIcon) {
        b.classList.add("xn-api-copy");
        b.setAttribute("type", "button");
        if (W(b) < 34) b.classList.add("xn-api-icononly");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", v || "复制");
      }
    });
    [].slice.call(document.querySelectorAll("#root input")).forEach(function (i) {
      var ty = (i.getAttribute("type") || "text").toLowerCase();
      if (ty === "checkbox" || ty === "radio" || ty === "range" || ty === "color" || ty === "file") return;
      i.classList.add("xn-api-input");
      if (getComputedStyle(i).fontSize !== "16px") i.style.setProperty("font-size", "16px", "important");
      if (H(i) < 48) i.style.setProperty("min-height", "48px", "important");
    });
    /* 指标数字：0.67% / ×1.01 / 1,007 req/s → 22px，便于一眼读数 */
    [].slice.call(document.querySelectorAll("#root p.font-mono.font-bold, #root span.font-mono.font-bold")).forEach(function (e) {
      if (VIS(e)) e.classList.add("xn-api-stat");
    });
  }

  function headings() {
    [].slice.call(document.querySelectorAll("#root h1, #root h2, #root h3")).forEach(cleanText);
  }

  /* 合集说明过长（>200 字）→ 折叠为 details，避免整屏文字墙 */
  function notes() {
    [].slice.call(document.querySelectorAll("#root p")).forEach(function (p) {
      var txt = TXT(p);
      if (txt.indexOf("本合集为纯前端工具") !== 0 || txt.length < 200) return;
      if (p.classList.contains("xn-api-hide")) return;
      var d = document.createElement("details");
      d.className = "xn-api-notes";
      var s = document.createElement("summary");
      s.textContent = "本合集说明：6 个工具分别做什么（点击展开）";
      var body = document.createElement("div");
      body.className = "xn-api-notes-body";
      body.textContent = txt.replace(/（工具\s*[A-Z]）/g, "");
      d.appendChild(s);
      d.appendChild(body);
      p.parentNode.insertBefore(d, p.nextSibling);
      p.classList.add("xn-api-hide");
    });
  }

  function run() {
    tabs();
    controls();
    headings();
    notes();
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
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "aria-pressed"] });
  setTimeout(run, 700);
  setTimeout(run, 1600);
})();
