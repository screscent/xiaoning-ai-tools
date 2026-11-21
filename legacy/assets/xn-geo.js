/* R1184 面积体积与几何计算合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnGeo) return;
  window.__xnGeo = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var HAS = function (el, cls) { return new RegExp("(^|\\s)" + cls + "(\\s|$)").test(el.className || ""); };
  var ALL = function (sel) { return [].slice.call(document.querySelectorAll("#root " + sel)); };

  var NAV = /^(平面图形面积|立体表面积与体积|圆与角度|土方与混凝土|刷漆用量估算|坡度排水)$/;

  /* 1) 去内部代号「工具F」 */
  function cleanCodeNames() {
    var walker = document.createTreeWalker(document.querySelector("#root"), NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (n) {
      var v = n.nodeValue;
      if (!v || !/工具\s*[A-Z]/.test(v)) return;
      var next = v.replace(/^\s*工具\s*[A-Z]\s*[·:：\-—]?\s*/, "");
      if (next !== v) n.nodeValue = next;
    });
  }

  /* 2) 页面底色 */
  function page() {
    var el = document.querySelector("#root .min-h-screen");
    if (el) el.classList.add("xn-geo-page");
  }

  /* 3) 顶部跳转链接 32 → 44；移动端 2 列 */
  function nav() {
    var list = ALL("a").filter(function (a) { return VIS(a) && NAV.test(TXT(a)); });
    if (!list.length) return;
    var wrap = list[0].parentElement;
    if (wrap && /overflow-x-auto|flex/.test(wrap.className || "")) {
      wrap.classList.add("xn-geo-nav");
      wrap.setAttribute("aria-label", "几何工具快速跳转");
    }
    list.forEach(function (a) {
      a.classList.add("xn-geo-navlink");
      a.setAttribute("role", "tab");
    });
  }

  /* 4) 下拉 / 数字 */
  function fields() {
    ALL("select").forEach(function (s) {
      s.classList.add("xn-geo-field");
      s.style.setProperty("font-size", "16px", "important");
      s.style.setProperty("min-height", "48px", "important");
    });
    ALL("input[type=number]").forEach(function (i) {
      i.classList.add("xn-geo-field");
      i.style.setProperty("font-size", "16px", "important");
      i.style.setProperty("min-height", "48px", "important");
    });
  }

  /* 5) 单位 / 方式分段：38/37 → 44 + radio 语义 */
  function segments() {
    var units = ALL("button").filter(function (b) { return VIS(b) && /^(毫米|厘米|米)$/.test(TXT(b)); });
    units.forEach(function (b) {
      b.classList.add("xn-geo-seg");
      b.removeAttribute("aria-pressed");
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", HAS(b, "bg-blue-600") && HAS(b, "text-white") ? "true" : "false");
      b.setAttribute("tabindex", HAS(b, "bg-blue-600") ? "0" : "-1");
    });
    if (units.length) {
      var g = units[0].parentElement;
      if (g) {
        g.setAttribute("role", "radiogroup");
        g.setAttribute("aria-label", "长度单位");
      }
    }
    var modes = ALL("button").filter(function (b) { return VIS(b) && /^(房间尺寸|直接填面积)$/.test(TXT(b)); });
    modes.forEach(function (b) {
      b.classList.add("xn-geo-seg");
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", HAS(b, "text-blue-600") || HAS(b, "bg-white") ? "true" : "false");
    });
    if (modes.length) {
      var mg = modes[0].parentElement;
      if (mg) {
        mg.setAttribute("role", "radiogroup");
        mg.setAttribute("aria-label", "刷漆输入方式");
      }
    }
  }

  /* 6) 计算 / 清空 / 复制结果 38 → 44 */
  function actions() {
    ALL("button").forEach(function (b) {
      if (VIS(b) && /^(计算|清空|复制结果)$/.test(TXT(b))) b.classList.add("xn-geo-action");
    });
  }

  /* 7) 移动端字段网格 */
  function layout() {
    ALL("div.grid").forEach(function (g) {
      if (g.children.length < 2) return;
      var c = g.className || "";
      if (/人类作者/.test(TXT(g))) return;
      if (/sm:grid-cols-3/.test(c)) { g.classList.add("xn-geo-g3"); return; }
      if (/sm:grid-cols-4/.test(c)) { g.classList.add("xn-geo-g2"); return; }
      if (/sm:grid-cols-2/.test(c)) { g.classList.add("xn-geo-g2"); return; }
    });
  }

  function run() {
    cleanCodeNames();
    page();
    nav();
    fields();
    segments();
    actions();
    layout();
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
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "aria-checked"] });
  setTimeout(run, 250);
  setTimeout(run, 700);
  setTimeout(run, 1600);
})();
