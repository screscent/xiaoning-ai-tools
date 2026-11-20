/* R1113 观星入门与望远镜合集 — 人用友好增强（幂等）
   1. 页签 aria-current / aria-label 去重
   2. 结果面板标签与数值分级
   3. 复制结果命名
   不改 React 逻辑。 */
(function () {
  if (window.__xnStar) return;
  window.__xnStar = 1;

  function q(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function vis(el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; }
  function txt(el) { return (el.textContent || "").trim().replace(/\s+/g, " "); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function setAttr(el, k, v) { if (el.getAttribute(k) !== v) el.setAttribute(k, v); }

  var LABELS = ["月相名称", "月龄", "亮面百分比", "月光影响评级", "距下个满月", "距下个新月"];

  function tabs(root) {
    var anchors = q('a[href^="#/"]', root).filter(vis);
    if (anchors[0] && anchors[0].parentElement) add(anchors[0].parentElement, "xn-star-tabs");
    anchors.forEach(function (a) {
      var spans = q("span", a).filter(function (s) { return txt(s); });
      var title = spans.length > 1 ? txt(spans[spans.length - 1]) : txt(a);
      if (!a.getAttribute("aria-label")) a.setAttribute("aria-label", title);
      var on = /bg-indigo-500|bg-indigo-600|bg-violet-500/.test(a.className || "");
      if (on) setAttr(a, "aria-current", "page");
      else if (a.getAttribute("aria-current")) a.removeAttribute("aria-current");
    });
  }

  function panel(root) {
    var h = q("div,h3", root).filter(function (x) { return txt(x) === "结果输出" && vis(x); })[0];
    if (!h) return;
    var box = h;
    for (var i = 0; i < 3 && box; i++) {
      box = box.parentElement;
      if (box && box.getBoundingClientRect().height > 180) break;
    }
    if (box) add(box, "xn-star-panel");
    if (!box) return;
    q("*", box).forEach(function (el) {
      if (el.children.length) return;
      var t = txt(el);
      if (LABELS.indexOf(t) >= 0) add(el, "xn-star-label");
      else if (/^\d+(\.\d+)?\s*(天|%|°|倍|km)?$/.test(t) && t.length < 12) add(el, "xn-star-value");
    });
  }

  function actions(root) {
    q("button", root).forEach(function (b) {
      if (!vis(b)) return;
      if (txt(b) === "复制结果") {
        add(b, "xn-star-copy");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "复制月相与观星结果");
      }
    });
  }

  var busy = false;
  function enhance() {
    if (busy) return;
    busy = true;
    try {
      var root = document.getElementById("root");
      if (!root) return;
      tabs(root);
      panel(root);
      actions(root);
    } catch (e) {
      /* 静默 */
    } finally {
      busy = false;
    }
  }

  var timer = 0;
  function schedule() { clearTimeout(timer); timer = setTimeout(enhance, 90); }

  function bind() {
    var root = document.getElementById("root");
    if (!root) { setTimeout(bind, 300); return; }
    enhance();
    if (window.MutationObserver) new MutationObserver(schedule).observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
    window.addEventListener("hashchange", function () { setTimeout(enhance, 180); });
    setTimeout(enhance, 800);
    setInterval(schedule, 1500);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
})();
