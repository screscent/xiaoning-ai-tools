/* R1108 攀岩与抱石入门合集 — 人用友好增强（幂等）
   1. 页签容器与当前态
   2. 常用数值胶囊 aria/分组
   3. 复制结果/结果卡语义
   不改 React 逻辑。 */
(function () {
  if (window.__xnClimb) return;
  window.__xnClimb = 1;

  function q(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function vis(el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; }
  function txt(el) { return (el.textContent || "").trim().replace(/\s+/g, " "); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function setAttr(el, k, v) { if (el.getAttribute(k) !== v) el.setAttribute(k, v); }

  function tabs(root) {
    var anchors = q('a[href^="#/"]', root).filter(vis);
    if (!anchors.length) return;
    var box = anchors[0].parentElement;
    if (box) add(box, "xn-climb-tabs");
    anchors.forEach(function (a) {
      if ((a.className || "").indexOf("bg-stone-900") >= 0) setAttr(a, "aria-current", "page");
      else if (a.getAttribute("aria-current")) a.removeAttribute("aria-current");
    });
  }

  function chips(root) {
    q("button", root).forEach(function (b) {
      if (!vis(b)) return;
      var t = txt(b);
      if (/^\d+\.\d+[a-d]?$/.test(t)) {
        add(b, "xn-climb-chip");
        setAttr(b, "aria-label", "设为 " + t);
        var box = b.parentElement;
        if (box && box.getAttribute("role") !== "group") {
          box.setAttribute("role", "group");
          box.setAttribute("aria-label", "常用难度数值");
        }
      } else if (t === "复制结果") {
        add(b, "xn-climb-copy");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "复制换算结果");
        if (!b.getAttribute("title")) b.setAttribute("title", "复制换算结果");
      }
    });
  }

  function kpis(root) {
    q("div", root).forEach(function (d) {
      if (!vis(d)) return;
      var h = d.getBoundingClientRect().height;
      if (h < 70 || h > 200) return;
      var t = txt(d);
      if (/换算结果/.test(t) && t.length < 16) add(d, "xn-climb-kpi");
      else if (/你的输入/.test(t) && t.length < 16) add(d, "xn-climb-kpi");
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
      chips(root);
      kpis(root);
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
