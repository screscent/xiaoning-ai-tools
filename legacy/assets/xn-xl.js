/* R1111 Excel 公式速查合集 — 人用友好增强（幂等）
   1. 页签当前态
   2. 滚动后的紧凑工具条（6 工具 + 回顶部）
   3. 热门筛选/复制 aria
   4. 搜索框命名
   不改 React 逻辑。 */
(function () {
  if (window.__xnXl) return;
  window.__xnXl = 1;

  function q(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function vis(el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; }
  function txt(el) { return (el.textContent || "").trim().replace(/\s+/g, " "); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function setAttr(el, k, v) { if (el.getAttribute(k) !== v) el.setAttribute(k, v); }

  var HOT = ["查找", "求和", "条件", "日期", "文本", "统计"];

  function tabs(root) {
    var anchors = q('a[href^="#/"]', root).filter(vis);
    if (!anchors.length) return;
    var nav = anchors[0].closest("nav") || anchors[0].parentElement;
    if (nav) add(nav, "xn-xl-tabs");
    anchors.forEach(function (a) {
      var on = /bg-emerald-600|bg-emerald-700/.test(a.className || "");
      if (on) setAttr(a, "aria-current", "page");
      else if (a.getAttribute("aria-current")) a.removeAttribute("aria-current");
    });
    return nav;
  }

  function chips(root) {
    q("button", root).forEach(function (b) {
      if (!vis(b)) return;
      var t = txt(b);
      if (HOT.indexOf(t) >= 0) {
        add(b, "xn-xl-chip");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "筛选 " + t);
        var box = b.parentElement;
        if (box && box.getAttribute("role") !== "group") {
          box.setAttribute("role", "group");
          box.setAttribute("aria-label", "热门关键词");
        }
      } else if (t === "复制") {
        add(b, "xn-xl-copy");
        if (!b.getAttribute("aria-label")) {
          var card = b;
          for (var i = 0; i < 5 && card; i++) {
            card = card.parentElement;
            if (card && card.querySelector && card.querySelector("h3")) break;
          }
          var h = card && card.querySelector ? card.querySelector("h3") : null;
          var name = h ? txt(h) : "";
          b.setAttribute("aria-label", name ? "复制 " + name + " 示例" : "复制公式示例");
        }
      }
    });
    var input = q('input[type="text"], input:not([type])', root).filter(vis)[0];
    if (input && !input.getAttribute("aria-label")) input.setAttribute("aria-label", "搜索函数或关键词");
  }

  function buildBar(nav) {
    if (!nav || document.getElementById("xn-xl-bar")) return;
    var anchors = q('a[href^="#/"]', nav);
    if (!anchors.length) return;
    var bar = document.createElement("div");
    bar.id = "xn-xl-bar";
    bar.className = "xn-xl-bar";
    bar.setAttribute("role", "navigation");
    bar.setAttribute("aria-label", "工具快捷切换");
    anchors.forEach(function (a) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = txt(a).replace(/^[^\u4e00-\u9fa5A-Za-z]+/, "");
      b.setAttribute("data-href", a.getAttribute("href"));
      b.addEventListener("click", function () {
        location.hash = a.getAttribute("href");
        setTimeout(function () {
          var h2 = document.querySelector("#root h2");
          if (h2) {
            var y = h2.getBoundingClientRect().top + window.scrollY - 70;
            window.scrollTo({ top: y, behavior: "smooth" });
          }
        }, 120);
      });
      bar.appendChild(b);
    });
    var top = document.createElement("button");
    top.type = "button";
    top.className = "xn-xl-top";
    top.textContent = "↑ 顶部";
    top.setAttribute("aria-label", "回到页面顶部");
    top.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    bar.appendChild(top);
    nav.insertAdjacentElement("afterend", bar);

    var last = -1;
    function sync() {
      var y = window.scrollY;
      var navBottom = nav.getBoundingClientRect().bottom + window.scrollY;
      var on = y > navBottom + 40;
      bar.classList.toggle("is-on", on);
      if (!on) return;
      var cur = nav.querySelector('a[aria-current="page"]');
      var href = cur ? cur.getAttribute("href") : "";
      if (href !== last) {
        last = href;
        q("button[data-href]", bar).forEach(function (b) {
          setAttr(b, "aria-current", b.getAttribute("data-href") === href ? "true" : "false");
        });
      }
    }
    var tick = false;
    window.addEventListener("scroll", function () {
      if (tick) return;
      tick = true;
      requestAnimationFrame(function () { tick = false; sync(); });
    }, { passive: true });
    window.addEventListener("hashchange", function () { setTimeout(sync, 220); });
    setTimeout(sync, 600);
    setInterval(sync, 1200);
  }

  var busy = false;
  function enhance() {
    if (busy) return;
    busy = true;
    try {
      var root = document.getElementById("root");
      if (!root) return;
      var nav = tabs(root);
      chips(root);
      buildBar(nav);
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
