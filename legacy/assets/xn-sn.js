/* R1200 批量序列号与恢复码合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnSn) return;
  window.__xnSn = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var HAS = function (el, cls) { return new RegExp("(^|\\s)" + cls + "(\\s|$)").test(el.className || ""); };
  var ALL = function (sel) { return [].slice.call(document.querySelectorAll("#root " + sel)); };

  /* 1) 页面底色 */
  function page() {
    var el = document.querySelector("#root .min-h-screen");
    if (el) el.classList.add("xn-sn-page");
  }

  /* 2) 序列号/恢复码 分段 → tab（容器已是 tablist）或 radio + 44 */
  function segments() {
    ALL("button").forEach(function (b) {
      if (!VIS(b) || !/^(序列号|恢复码)$/.test(TXT(b))) return;
      b.classList.add("xn-sn-seg");
      var box = b.parentElement;
      var isTablist = box && box.getAttribute("role") === "tablist";
      var on = HAS(b, "bg-blue-600") && HAS(b, "text-white");
      if (isTablist) {
        b.setAttribute("role", "tab");
        b.removeAttribute("aria-checked");
        b.setAttribute("aria-selected", on ? "true" : "false");
      } else {
        if (box && !box.getAttribute("role")) {
          box.setAttribute("role", "radiogroup");
          box.setAttribute("aria-label", "工具类型");
        }
        b.setAttribute("role", "radio");
        b.setAttribute("aria-checked", on ? "true" : "false");
      }
      b.setAttribute("tabindex", on ? "0" : "-1");
    });
  }

  /* 3) 输入 / 下拉 / 文本域 */
  function fields() {
    ALL("input[type=text]").forEach(function (i) {
      if (!VIS(i)) return;
      i.classList.add("xn-sn-field");
      i.style.setProperty("font-size", "16px", "important");
      i.style.setProperty("height", "48px", "important");
    });
    ALL("input[type=number]").forEach(function (i) {
      if (!VIS(i)) return;
      i.classList.add("xn-sn-field");
      i.style.setProperty("font-size", "16px", "important");
      i.style.setProperty("height", "48px", "important");
    });
    ALL("select").forEach(function (s) {
      if (!VIS(s)) return;
      s.classList.add("xn-sn-field");
      s.style.setProperty("font-size", "16px", "important");
      s.style.setProperty("height", "48px", "important");
    });
    ALL("textarea").forEach(function (a) {
      if (VIS(a)) a.classList.add("xn-sn-area");
    });
  }

  /* 4) 校验位开关：补名称与热区（保留 React 的 aria-checked） */
  function switches() {
    ALL("button").forEach(function (b) {
      if (!VIS(b) || !HAS(b, "h-6") || !HAS(b, "w-11")) return;
      b.classList.add("xn-sn-switch");
      if (!b.getAttribute("role")) b.setAttribute("role", "switch");
      if (!b.getAttribute("aria-checked")) b.setAttribute("aria-checked", "false");
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "是否加校验位");
    });
  }

  /* 5) 生成 / 复制 / 下载 / 重新生成 / 清空 */
  function actions() {
    ALL("button").forEach(function (b) {
      if (!VIS(b)) return;
      if (/^(生成序列号|复制全部|下载 txt|重新生成|清空)$/.test(TXT(b))) b.classList.add("xn-sn-act");
    });
  }

  function run() {
    page();
    segments();
    fields();
    switches();
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
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "aria-checked"] });
  setTimeout(run, 250);
  setTimeout(run, 700);
  setTimeout(run, 1600);
})();
