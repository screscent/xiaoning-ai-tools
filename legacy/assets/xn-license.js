/* R1181 开源素材与授权速查合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnLicense) return;
  window.__xnLicense = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var HAS = function (el, cls) { return new RegExp("(^|\\s)" + cls + "(\\s|$)").test(el.className || ""); };
  var ALL = function (sel) { return [].slice.call(document.querySelectorAll("#root " + sel)); };

  /* 1) 内部代号清理：工具E / 工具F 不外泄 */
  function cleanCodeNames() {
    var walker = document.createTreeWalker(document.querySelector("#root"), NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (n) {
      var v = n.nodeValue;
      if (!v || !/工具\s*[A-Z]/.test(v)) return;
      var next = v.replace(/^\s*工具\s*[A-Z]\s*[·:：\-—]?\s*/, "").replace(/^工具\s*[A-Z]$/, "");
      if (next !== v) n.nodeValue = next;
    });
    ALL("span").forEach(function (s) {
      if (!TXT(s) && /font-mono/.test(s.className || "")) s.style.setProperty("display", "none", "important");
    });
  }

  /* 2) 页签：48 高 + aria-selected + 桌面吸顶 */
  function tabs() {
    var list = ALL("nav a[role=tab]").filter(VIS);
    if (!list.length) return;
    var nav = list[0].closest("nav");
    if (nav) {
      nav.classList.add("xn-license-nav");
      nav.setAttribute("role", "tablist");
      nav.setAttribute("aria-label", "素材工具页签");
    }
    list.forEach(function (a) {
      a.classList.add("xn-license-tab");
      var on = HAS(a, "text-white") && /(bg-stone-9|bg-stone-8|bg-emerald-6|bg-indigo-6)/.test(a.className || "");
      a.setAttribute("aria-selected", on ? "true" : "false");
      a.setAttribute("tabindex", on ? "0" : "-1");
      if (on) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  /* 3) 资源外链：16px 灰字 → 可点胶囊 */
  function links() {
    ALL("section a[href]").forEach(function (a) {
      var href = a.getAttribute("href") || "";
      if (!/^https?:/i.test(href)) return;
      if (TXT(a).length > 40) return;
      a.classList.add("xn-license-link");
      if (!a.getAttribute("rel")) a.setAttribute("rel", "noopener noreferrer");
      a.setAttribute("target", "_blank");
    });
  }

  /* 4) 授权徽章 / 图例 */
  function badges() {
    ALL("section li span.rounded-full").forEach(function (s) {
      s.classList.add("xn-license-badge");
    });
    ALL("div.flex.flex-wrap span.rounded-full").forEach(function (s) {
      if (s.closest("section")) return;
      s.classList.add("xn-license-legend");
    });
  }

  /* 5) 许可协议表格：可键盘横滚 + 表头吸顶 */
  function table() {
    var tb = document.querySelector("#root table");
    if (!tb) return;
    tb.classList.add("xn-license-table");
    tb.setAttribute("aria-label", "许可协议对照表");
    var wrap = tb.parentElement;
    if (wrap) {
      wrap.setAttribute("tabindex", "0");
      wrap.setAttribute("role", "region");
      wrap.setAttribute("aria-label", "许可协议对照表，可横向滚动");
    }
  }

  /* 6) 表单：数字 20px → 16px，高度对齐 */
  function fields() {
    ALL("input[type=date], input[type=number]").forEach(function (i) {
      i.classList.add("xn-license-field");
      if (i.type === "number") i.style.setProperty("font-size", "16px", "important");
      i.style.setProperty("min-height", "48px", "important");
    });
  }

  /* 7) 分段按钮 / 开关 / 复制按钮 */
  function buttons() {
    ALL("button[aria-pressed]").forEach(function (b) {
      if (!VIS(b)) return;
      b.classList.add("xn-license-seg");
    });
    ALL("button[role=switch]").forEach(function (b) {
      b.classList.add("xn-license-switch");
    });
    ALL("button").forEach(function (b) {
      if (!VIS(b)) return;
      var v = TXT(b);
      if (/^一键复制/.test(v)) {
        b.classList.add("xn-license-primary");
        return;
      }
      if (!v && /复制/.test(b.getAttribute("aria-label") || "")) {
        b.classList.add("xn-license-iconbtn");
      }
    });
  }

  /* 8) 结果数字 16 → 18 */
  function metrics() {
    var grid = ALL("div.grid").filter(function (g) { return /lg:grid-cols-4/.test(g.className || ""); })[0];
    if (!grid) return;
    [].slice.call(grid.children).forEach(function (card) {
      var ps = card.querySelectorAll("p");
      if (ps[0]) ps[0].classList.add("xn-license-metric-label");
      if (ps[1]) ps[1].classList.add("xn-license-metric");
    });
  }

  function run() {
    cleanCodeNames();
    tabs();
    links();
    badges();
    table();
    fields();
    buttons();
    metrics();
  }

  var timer = null;
  function schedule() {
    if (timer) return;
    timer = setTimeout(function () { timer = null; run(); }, 90);
  }

  document.addEventListener("click", schedule, true);
  window.addEventListener("hashchange", schedule);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule);
  else schedule();
  window.addEventListener("load", schedule);
  var mo = new MutationObserver(schedule);
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "aria-selected", "aria-checked"] });
  setTimeout(run, 250);
  setTimeout(run, 700);
  setTimeout(run, 1600);
})();
