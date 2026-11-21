/* R1194 文件批量重命名合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnRename) return;
  window.__xnRename = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var HAS = function (el, cls) { return new RegExp("(^|\\s)" + cls + "(\\s|$)").test(el.className || ""); };
  var ALL = function (sel) { return [].slice.call(document.querySelectorAll("#root " + sel)); };

  var TAB = /^(规则|序号|替换|预览|目录树|冲突检查)$/;

  /* 1) 页面底色 */
  function page() {
    var el = document.querySelector("#root .min-h-screen");
    if (el) el.classList.add("xn-rename-page");
  }

  /* 2) 页签 44 + aria */
  function tabs() {
    ALL("button").forEach(function (b) {
      if (!VIS(b) || !TAB.test(TXT(b))) return;
      b.classList.add("xn-rename-tab");
      var box = b.parentElement;
      if (box) {
        box.classList.add("xn-rename-tabs");
        if (!box.getAttribute("role")) box.setAttribute("role", "tablist");
      }
      var on = HAS(b, "bg-blue-600") && HAS(b, "text-white");
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", on ? "true" : "false");
      b.setAttribute("tabindex", on ? "0" : "-1");
    });
  }

  /* 3) 输入框 / 下拉（内联覆盖通用皮肤的高特异性字号锁） */
  function fields() {
    ALL("input").forEach(function (i) {
      if (!VIS(i) || i.type === "checkbox") return;
      i.classList.add("xn-rename-field");
      i.style.setProperty("font-size", "16px", "important");
      i.style.setProperty("height", "48px", "important");
    });
    ALL("select").forEach(function (s) {
      if (!VIS(s)) return;
      s.classList.add("xn-rename-field");
      s.style.setProperty("font-size", "16px", "important");
      s.style.setProperty("height", "48px", "important");
    });
  }

  /* 4) 复选框与标签行 */
  function checks() {
    ALL("input[type=checkbox]").forEach(function (i) {
      if (!VIS(i)) return;
      i.classList.add("xn-rename-check");
      var lab = i.closest("label");
      if (lab) lab.classList.add("xn-rename-checklabel");
    });
  }

  /* 5) 复制 / 重置 / 下载 */
  function actions() {
    ALL("button").forEach(function (b) {
      if (!VIS(b)) return;
      if (/^(复制模板|复制结果|复制|重置.*|下载.*)$/.test(TXT(b))) b.classList.add("xn-rename-act");
    });
  }

  function run() {
    page();
    tabs();
    fields();
    checks();
    actions();
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
