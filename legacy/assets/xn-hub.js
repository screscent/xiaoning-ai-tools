/* R1137 工具集落地页 — 人用友好增强（幂等，不碰 React 路由状态）
   核心：整卡可点（原卡片只有 12px「开始使用」可点） */
(function () {
  "use strict";
  if (window.__xnHub) return;
  window.__xnHub = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };

  function cards() {
    var links = [].slice.call(document.querySelectorAll('#root a[href^="#/"]'));
    var cta = links.filter(function (a) { return TXT(a).indexOf("开始使用") === 0; });
    cta.forEach(function (a, i) {
      var card = a.parentElement;
      if (!card || card.getAttribute("data-xn-hub") === "1") return;
      card.setAttribute("data-xn-hub", "1");
      card.classList.add("xn-hub-card");
      card.setAttribute("data-xn-idx", String(i + 1 < 10 ? "0" + (i + 1) : i + 1));
      a.classList.add("xn-hub-cta");
      var h = card.querySelector("h2, h3");
      a.setAttribute("aria-label", "开始使用：" + (h ? TXT(h) : "工具"));
    });
  }

  /* 「6 个工具，全部本地运行」做成计数徽标 */
  function countBadge() {
    [].slice.call(document.querySelectorAll("#root p")).forEach(function (el) {
      if (el.getAttribute("data-xn-count") === "1") return;
      if (/^\d+\s*个工具/.test(TXT(el)) && TXT(el).length < 30) {
        el.setAttribute("data-xn-count", "1");
        el.classList.add("xn-hub-count");
      }
    });
  }

  function backLink() {
    [].slice.call(document.querySelectorAll('#root a[href]')).forEach(function (a) {
      if (/返回工具集/.test(TXT(a))) a.classList.add("xn-hub-back");
    });
  }

  /* 整卡点击：点卡片非链接区域 → 进入对应工具 */
  function bindCardClick() {
    if (document.documentElement.getAttribute("data-xn-hub-click") === "1") return;
    document.documentElement.setAttribute("data-xn-hub-click", "1");
    document.addEventListener("click", function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      if (t.closest("a")) return;
      var card = t.closest("#root .xn-hub-card");
      if (!card) return;
      var a = card.querySelector('a[href^="#/"]');
      if (a) {
        e.preventDefault();
        location.hash = a.getAttribute("href");
      }
    }, true);
  }

  function run() {
    cards();
    countBadge();
    backLink();
    bindCardClick();
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
  mo.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(run, 700);
  setTimeout(run, 1600);
})();
