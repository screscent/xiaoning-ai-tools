/* R1186 图片对比与差异合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnImgcmp) return;
  window.__xnImgcmp = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var ALL = function (sel) { return [].slice.call(document.querySelectorAll("#root " + sel)); };

  /* 1) 去内部代号「工具E/F」 */
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

  /* 2) 路由串隐藏 */
  function routes() {
    ALL("span,code").forEach(function (e) {
      if (e.children.length) return;
      if (/^#\/[\w-]+$/.test(TXT(e))) e.classList.add("xn-imgcmp-route");
    });
  }

  /* 3) 页面底色 */
  function page() {
    var el = document.querySelector("#root .min-h-screen");
    if (el) el.classList.add("xn-imgcmp-page");
  }

  /* 4) 数字 / 文本输入 */
  function fields() {
    ALL("input[type=number], input[type=text]").forEach(function (i) {
      if (!VIS(i)) return;
      i.classList.add("xn-imgcmp-field");
      i.style.setProperty("font-size", "16px", "important");
      i.style.setProperty("min-height", "48px", "important");
    });
  }

  /* 5) 操作按钮 ≥44 */
  function actions() {
    var RE = /^(重置|下载对比图|下载差异图|左右排列|上下排列|红|黄|紫|青|全图|局部|复制结果|一键复制.*)$/;
    ALL("button").forEach(function (b) {
      if (VIS(b) && RE.test(TXT(b))) b.classList.add("xn-imgcmp-action");
    });
  }

  /* 6) 移动端网格恢复 */
  function layout() {
    ALL("div.grid").forEach(function (g) {
      if (/人类作者/.test(TXT(g))) return;
      if (g.querySelector("input[type=file]")) return; /* 上传卡移动端保持单列 */
      var c = g.className || "";
      if (/lg:grid-cols-5/.test(c)) g.classList.add("xn-imgcmp-g5");
      else if (/lg:grid-cols-4/.test(c)) g.classList.add("xn-imgcmp-g4");
      else if (/sm:grid-cols-2/.test(c) && !/md:grid-cols-2/.test(c)) g.classList.add("xn-imgcmp-g2");
    });
  }

  function run() {
    cleanCodeNames();
    routes();
    page();
    fields();
    actions();
    layout();
  }

  var timer = null;
  function schedule() {
    if (timer) return;
    timer = setTimeout(function () { timer = null; run(); }, 90);
  }

  document.addEventListener("click", schedule, true);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule);
  else schedule();
  window.addEventListener("load", schedule);
  var mo = new MutationObserver(schedule);
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  setTimeout(run, 250);
  setTimeout(run, 700);
  setTimeout(run, 1600);
})();
