/* R1139 书签整理与导出合集 — 人用友好增强（幂等，不改 React 状态） */
(function () {
  "use strict";
  if (window.__xnBookmarks) return;
  window.__xnBookmarks = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  var H = function (el) { return Math.round(el.getBoundingClientRect().height); };

  /* 工具选择器：6 列截断 → 自适应换行 + 44px + 完整标签 */
  function tools() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      if (b.getAttribute("aria-pressed") === null) return;
      if (H(b) > 60) return;
      var s = TXT(b);
      if (!s || s.length > 14) return;
      b.classList.add("xn-bm-tool");
      b.setAttribute("title", s + (b.getAttribute("aria-pressed") === "true" ? "（当前工具）" : "（点击切换）"));
      var box = b.parentElement;
      if (box && box.getAttribute("data-xn-bm-tools") !== "1") {
        box.setAttribute("data-xn-bm-tools", "1");
        box.setAttribute("role", "tablist");
      }
    });
  }

  /* 主/次按钮 */
  function actions() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (!VIS(b)) return;
      var s = TXT(b);
      if (s === "一键去重并复制结果") {
        b.classList.add("xn-bm-primary");
        b.setAttribute("aria-label", "一键去重并复制结果（复制到剪贴板）");
      } else if (s === "试试示例") {
        b.classList.add("xn-bm-primary");
        b.setAttribute("aria-label", "载入示例书签并解析");
      } else if (s === "载入示例" || s === "清空输入") {
        b.classList.add("xn-bm-secondary");
      }
    });
  }

  /* 统计卡：数字 + 标签 两行结构 */
  function stats() {
    [].slice.call(document.querySelectorAll("#root div")).forEach(function (d) {
      if (d.classList.contains("xn-bm-stat")) return;
      if (d.children.length !== 2) return;
      var a = TXT(d.children[0]);
      if (!/^\d+$/.test(a)) return;
      if (!/rounded|border/.test(d.className)) return;
      d.classList.add("xn-bm-stat");
    });
  }

  /* 返回工具集 → 40px 按钮 */
  function back() {
    [].slice.call(document.querySelectorAll("#root a")).forEach(function (a) {
      if (!VIS(a)) return;
      if (!/返回工具集/.test(TXT(a))) return;
      a.classList.add("xn-bm-back");
      a.setAttribute("aria-label", "返回工具集列表");
    });
  }

  /* 「下一步：按域名分组 / 导出浏览器书签」小按钮 → 36px 胶囊 */
  function next() {
    [].slice.call(document.querySelectorAll("#root a, #root button")).forEach(function (a) {
      if (!VIS(a)) return;
      if (H(a) > 30) return;
      var s = TXT(a);
      if (!/^(按域名分组|导出浏览器书签)$/.test(s)) return;
      a.classList.add("xn-bm-next");
    });
  }

  function run() {
    tools();
    actions();
    stats();
    back();
    next();
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
