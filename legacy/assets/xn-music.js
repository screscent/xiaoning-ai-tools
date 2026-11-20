/* R1109 乐理与音准速查合集 — 人用友好增强（幂等）
   1. 工具E/F 文案归一
   2. 总览卡与容器类
   3. 常用主音/生成/复制语义
   不改 React 逻辑。 */
(function () {
  if (window.__xnMusic) return;
  window.__xnMusic = 1;

  function q(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function vis(el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; }
  function txt(el) { return (el.textContent || "").trim().replace(/\s+/g, " "); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }

  function normalize(root) {
    q("h1,h2,h3,div,span", root).forEach(function (el) {
      if (el.children.length) return;
      var t = txt(el);
      var n = t.replace(/^工具[EF]\s*/, "");
      if (n !== t && n) el.textContent = n;
    });
  }

  function cards(root) {
    var nav = q("nav", root).filter(function (n) {
      return q("a[href^='#/']", n).length >= 4 && vis(n);
    })[0];
    if (!nav) return;
    add(nav, "xn-music-tools");
    q("a[href^='#/']", nav).forEach(function (a) {
      add(a, "xn-music-card");
      if (!a.getAttribute("aria-label")) {
        var title = a.querySelector("div.mt-3");
        if (title) a.setAttribute("aria-label", "打开 " + txt(title));
      }
    });
  }

  function actions(root) {
    q("button", root).forEach(function (b) {
      if (!vis(b)) return;
      var t = txt(b);
      if (/^[A-G][♯♭]?$/.test(t)) {
        add(b, "xn-music-note");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "主音 " + t);
        var box = b.parentElement;
        if (box && !box.getAttribute("role")) {
          box.setAttribute("role", "group");
          box.setAttribute("aria-label", "常用主音");
        }
      } else if (t === "生成音阶") {
        add(b, "xn-music-run");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "生成音阶结果");
      } else if (t === "复制") {
        add(b, "xn-music-copy");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "复制音阶结果");
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
      normalize(root);
      cards(root);
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
