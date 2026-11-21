/* R1198 IP 与子网计算合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnSubnet) return;
  window.__xnSubnet = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var ALL = function (sel) { return [].slice.call(document.querySelectorAll("#root " + sel)); };

  /* 1) 页面底色 */
  function page() {
    var el = document.querySelector("#root .min-h-screen");
    if (el) el.classList.add("xn-subnet-page");
  }

  /* 2) 哈希路由页签 44 + aria-selected */
  function tabs() {
    var n = ALL("nav").filter(VIS)[0];
    if (!n) return;
    n.classList.add("xn-subnet-nav");
    if (!n.getAttribute("aria-label")) n.setAttribute("aria-label", "工具分区导航");
    if (!n.getAttribute("role")) n.setAttribute("role", "tablist");
    var links = [].slice.call(n.querySelectorAll("a")).filter(VIS);
    var hash = location.hash || "";
    var hit = false;
    links.forEach(function (a) {
      a.classList.add("xn-subnet-link");
      var href = a.getAttribute("href") || "";
      var on = href && hash === href;
      if (on) hit = true;
      a.setAttribute("role", "tab");
      a.setAttribute("aria-selected", on ? "true" : "false");
      a.setAttribute("tabindex", on ? "0" : "-1");
    });
    if (!hit && links[0] && !hash) {
      links[0].setAttribute("aria-selected", "true");
      links[0].setAttribute("tabindex", "0");
    }
  }

  /* 3) 输入 / 下拉 */
  function fields() {
    ALL("input[type=text]").forEach(function (i) {
      if (!VIS(i)) return;
      i.classList.add("xn-subnet-field");
      i.style.setProperty("font-size", "16px", "important");
      i.style.setProperty("height", "48px", "important");
    });
    ALL("input[type=number]").forEach(function (i) {
      if (!VIS(i)) return;
      i.classList.add("xn-subnet-field");
      i.style.setProperty("font-size", "16px", "important");
      i.style.setProperty("height", "48px", "important");
    });
    ALL("select").forEach(function (s) {
      if (!VIS(s)) return;
      s.classList.add("xn-subnet-field");
      s.style.setProperty("font-size", "16px", "important");
      s.style.setProperty("height", "48px", "important");
    });
  }

  /* 4) 操作按钮 */
  function actions() {
    ALL("button").forEach(function (b) {
      if (!VIS(b)) return;
      if (/^(计算|反推计算|判断地址类型|无冲突|配置自查|自查|复制结果)$/.test(TXT(b))) b.classList.add("xn-subnet-act");
    });
  }

  /* 5) 二进制对照表 */
  function tables() {
    ALL("table").forEach(function (t) {
      if (VIS(t)) t.classList.add("xn-subnet-table");
    });
  }

  /* 6) 剥掉「工具A–F」代号前缀 */
  function codes() {
    var root = document.querySelector("#root");
    if (!root) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var n;
    while ((n = walker.nextNode())) {
      var tx = n.textContent || "";
      if (!/^\s*工具\s*[A-Z]/.test(tx)) continue;
      var next = tx.replace(/^\s*工具\s*[A-Z]\s*[·:：\-—]?\s*/, "");
      n.textContent = next;
    }
  }

  function run() {
    page();
    tabs();
    fields();
    actions();
    tables();
    codes();
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
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  setTimeout(run, 250);
  setTimeout(run, 700);
  setTimeout(run, 1600);
})();
