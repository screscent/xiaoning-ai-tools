/* R1110 番茄专注与计时合集 — 人用友好增强（幂等）
   1. 去掉重复「返回合集」
   2. 页签当前态
   3. 分段/时长/开关 aria、状态芯片
   不改 React 逻辑。 */
(function () {
  if (window.__xnTomato) return;
  window.__xnTomato = 1;

  function q(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function vis(el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; }
  function txt(el) { return (el.textContent || "").trim().replace(/\s+/g, " "); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function setAttr(el, k, v) { if (el.getAttribute(k) !== v) el.setAttribute(k, v); }

  function cleanBack(root) {
    var links = q("a", root).filter(function (a) { return /^←?\s*返回/.test(txt(a)) && vis(a); });
    links.forEach(function (a) {
      if (txt(a).indexOf("返回合集") >= 0 && a.getAttribute("href") === "#/") a.style.display = "none";
    });
  }

  function tabs(root) {
    var anchors = q('a[href^="#/"]', root).filter(function (a) { return vis(a) && !/返回/.test(txt(a)); });
    if (!anchors.length) return;
    var nav = anchors[0].closest("nav") || anchors[0].parentElement;
    if (nav) add(nav, "xn-tomato-tabs");
    anchors.forEach(function (a) {
      if ((a.className || "").indexOf("bg-white") >= 0) setAttr(a, "aria-current", "page");
      else if (a.getAttribute("aria-current")) a.removeAttribute("aria-current");
    });
  }

  function clock(root) {
    q("div,span", root).forEach(function (el) {
      if (el.children.length) return;
      if (/^\d{1,3}:\d{2}$/.test(txt(el)) && el.getBoundingClientRect().height > 40) add(el, "xn-tomato-clock");
    });
  }

  function controls(root) {
    q("button", root).forEach(function (b) {
      if (!vis(b)) return;
      var t = txt(b);
      var c = b.className || "";
      if (/^(开始|暂停|继续)$/.test(t)) {
        add(b, "xn-tomato-primary");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", t + "计时");
      } else if (t === "重置") {
        add(b, "xn-tomato-ghost");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "重置计时");
      } else if (/^(番茄钟|自定义倒计时)$/.test(t) && c.indexOf("flex-1") >= 0) {
        add(b, "xn-tomato-seg");
        var on = c.indexOf("bg-slate-800") >= 0 || c.indexOf("bg-white") >= 0;
        setAttr(b, "aria-pressed", on ? "true" : "false");
      } else if (/^\d+\s*分钟$/.test(t)) {
        add(b, "xn-tomato-chip");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "设为 " + t);
      } else if (/提示音|自动开始下一轮/.test(t)) {
        add(b, "xn-tomato-toggle");
        var off = /关$/.test(t);
        setAttr(b, "aria-pressed", off ? "false" : "true");
        if (!b.getAttribute("aria-label")) {
          b.setAttribute("aria-label", t.replace(/\s*(开|关)$/, "") + (off ? "（当前关闭）" : "（当前开启）"));
        }
      }
    });
    q("div", root).forEach(function (d) {
      if (!vis(d)) return;
      var t = txt(d);
      if (t.length > 12) return;
      if (/今日完成/.test(t) && /待开始/.test(t)) return;
      if (/^(今日完成|待开始)/.test(t) && d.children.length <= 2) add(d, "xn-tomato-stat");
    });
  }

  var busy = false;
  function enhance() {
    if (busy) return;
    busy = true;
    try {
      var root = document.getElementById("root");
      if (!root) return;
      cleanBack(root);
      tabs(root);
      clock(root);
      controls(root);
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
