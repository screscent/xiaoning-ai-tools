/* R1205 送礼与礼俗合集 — 语义与尺寸增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnPresent) return;
  window.__xnPresent = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  var HAS = function (el, cls) { return new RegExp("(^|\\s)" + cls + "(\\s|$)").test(el.className || ""); };
  var ALL = function (sel) { return [].slice.call(document.querySelectorAll("#root " + sel)); };

  var TABS = /^(推荐|预算|贺卡|禁忌|回礼与答谢|送礼日历)$/;
  var GROUPS = [
    ["长辈", "领导", "同事", "朋友", "伴侣", "孩子"],
    ["亲密", "一般", "正式"],
    ["100元以内", "100-300元", "300-500元", "500-1000元", "1000元以上"]
  ];

  /* 1) 页面底色 */
  function page() {
    var el = document.querySelector("#root .min-h-screen");
    if (el) el.classList.add("xn-present-page");
  }

  /* 2) 页签 44 + aria */
  function tabs() {
    var n = ALL("nav").filter(VIS)[0];
    if (n && !n.getAttribute("role")) n.setAttribute("role", "tablist");
    ALL("button").forEach(function (b) {
      if (!VIS(b) || !TABS.test(TXT(b))) return;
      b.classList.add("xn-present-tab");
      var on = HAS(b, "bg-orange-500") && HAS(b, "text-white");
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", on ? "true" : "false");
      b.setAttribute("tabindex", on ? "0" : "-1");
    });
  }

  /* 3) 三组预设 → radio + 44 */
  function chips() {
    ALL("button").forEach(function (b) {
      if (!VIS(b)) return;
      var tx = TXT(b);
      var gi = -1;
      GROUPS.forEach(function (g, i) { if (g.indexOf(tx) >= 0) gi = i; });
      if (gi < 0) return;
      var on = HAS(b, "bg-orange-500") && HAS(b, "text-white");
      b.classList.add("xn-present-chip");
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", on ? "true" : "false");
      b.setAttribute("tabindex", on ? "0" : "-1");
      var box = b.parentElement;
      if (box && !box.getAttribute("role")) {
        box.setAttribute("role", "radiogroup");
        box.setAttribute("aria-label", ["收礼对象", "关系", "预算区间"][gi]);
      }
    });
  }

  /* 4) 复制 */
  function actions() {
    ALL("button").forEach(function (b) {
      if (VIS(b) && TXT(b) === "复制") b.classList.add("xn-present-copy");
    });
  }

  function run() {
    page();
    tabs();
    chips();
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
