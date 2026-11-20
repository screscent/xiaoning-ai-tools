/* R1103 游泳配速与训练合集 — 人用友好增强（幂等）
   1. 工具E/F → 工具 05/06
   2. 总览「查看工具」链接修正为真实锚点
   3. 吸顶工具跳转条 + 当前小节高亮
   4. 常用值胶囊、复制/使用说明语义
   不改 React 逻辑。 */
(function () {
  if (window.__xnSwim) return;
  window.__xnSwim = 1;

  var LINK_MAP = {
    "#/pace": "#tool-pace",
    "#/turns": "#tool-turns",
    "#/plan": "#tool-plan",
    "#/stroke": "#tool-stroke",
    "#/rest": "#tool-rest",
    "#/turn": "#tool-turn"
  };
  var SHORT = ["配速", "趟数", "计划", "泳姿", "休息", "转身"];

  function q(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }
  function vis(el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }
  function txt(el) {
    return (el.textContent || "").trim().replace(/\s+/g, " ");
  }
  function add(el, cls) {
    if (el && !el.classList.contains(cls)) el.classList.add(cls);
  }
  function setAttr(el, k, v) {
    if (el.getAttribute(k) !== v) el.setAttribute(k, v);
  }

  function normalize(root) {
    q("h1,h2,h3", root).forEach(function (h) {
      if (h.children.length) return;
      var t = txt(h);
      var n = t.replace(/^工具E\s*/, "工具 05 ").replace(/^工具F\s*/, "工具 06 ");
      if (n !== t) h.textContent = n;
    });
  }

  function overview(root) {
    var grid = q("div.grid", root).filter(function (g) {
      return g.children.length === 6 && g.querySelector('a[href^="#/"]');
    })[0];
    if (!grid) return;
    add(grid, "xn-swim-overview");
    if (window.innerWidth <= 640) {
      grid.style.setProperty("grid-template-columns", "repeat(2, minmax(0, 1fr))", "important");
    } else {
      grid.style.removeProperty("grid-template-columns");
    }
    Array.prototype.slice.call(grid.children).forEach(function (card, i) {
      add(card, "xn-swim-card");
      var a = card.tagName === "A" ? card : card.querySelector('a[href^="#/"]');
      if (!a) return;
      var target = LINK_MAP[a.getAttribute("href")];
      if (target) {
        a.setAttribute("href", target);
        var h = document.getElementById(target.slice(1));
        var name = h ? txt(h.querySelector("h2")) : "";
        a.setAttribute("aria-label", "跳到工具 " + (i + 1 < 10 ? "0" : "") + (i + 1) + (name ? " " + name : ""));
      }
      var go = card.querySelector("span");
      if (go && /查看工具/.test(txt(go))) add(go, "xn-swim-go");
    });
  }

  function subnav(root) {
    if (root.querySelector(".xn-swim-sub")) return;
    var grid = root.querySelector(".xn-swim-overview");
    var secs = q("section[id^='tool-']", root);
    if (!grid || !secs.length) return;
    var nav = document.createElement("nav");
    nav.className = "xn-swim-sub";
    nav.setAttribute("aria-label", "工具快速跳转");
    secs.forEach(function (s, i) {
      var a = document.createElement("a");
      a.href = "#" + s.id;
      a.textContent = (i + 1 < 10 ? "0" : "") + (i + 1) + " " + (SHORT[i] || "");
      a.setAttribute("data-xn-target", s.id);
      a.addEventListener("click", function (e) {
        e.preventDefault();
        s.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", "#" + s.id);
      });
      nav.appendChild(a);
    });
    var host = secs[0].parentElement;
    host.insertBefore(nav, secs[0]);
  }

  function spy() {
    var secs = q("section[id^='tool-']");
    if (!secs.length) return;
    var y = 140;
    var active = null;
    secs.forEach(function (s) {
      var top = s.getBoundingClientRect().top;
      if (top <= y) active = s.id;
    });
    if (!active) active = secs[0].id;
    var nav = document.querySelector(".xn-swim-sub");
    if (nav) {
      if (window.innerWidth <= 640) {
        var firstTop = secs[0].getBoundingClientRect().top;
        setAttr(nav, "data-xn-visible", firstTop < 140 ? "1" : "0");
      } else if (nav.getAttribute("data-xn-visible")) {
        nav.removeAttribute("data-xn-visible");
      }
    }
    q(".xn-swim-sub a").forEach(function (a) {
      if (a.getAttribute("data-xn-target") === active) setAttr(a, "aria-current", "true");
      else if (a.getAttribute("aria-current")) a.removeAttribute("aria-current");
    });
  }

  function chips(root) {
    q("div", root).forEach(function (g) {
      var c = g.className || "";
      if (c.indexOf("mt-1.5 flex flex-wrap gap-1.5") < 0) return;
      add(g, "xn-swim-chips");
      if (!g.getAttribute("role")) g.setAttribute("role", "group");
      if (!g.getAttribute("aria-label")) g.setAttribute("aria-label", "常用值");
      q("button", g).forEach(function (b) {
        if (!vis(b)) return;
        add(b, "xn-swim-chip");
        var t = txt(b);
        if (t && !b.getAttribute("aria-label")) b.setAttribute("aria-label", "设为 " + t);
      });
    });
  }

  function buttons(root) {
    q("button", root).forEach(function (b) {
      if (!vis(b)) return;
      var t = txt(b);
      if (t === "复制结果") {
        add(b, "xn-swim-copy");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "复制计算结果");
        if (!b.getAttribute("title")) b.setAttribute("title", "复制计算结果到剪贴板");
      }
    });
    q("summary,button", root).forEach(function (s) {
      if (txt(s) !== "使用说明") return;
      add(s, "xn-swim-usage");
      if (!s.getAttribute("aria-label")) s.setAttribute("aria-label", "展开使用说明");
    });
  }

  var busy = false;
  function enhance() {
    if (busy) return;
    busy = true;
    try {
      var root = document.getElementById("root");
      if (!root) return;
      root.setAttribute("data-xn-swim", "1");
      normalize(root);
      overview(root);
      subnav(root);
      chips(root);
      buttons(root);
      spy();
    } catch (e) {
      /* 静默 */
    } finally {
      busy = false;
    }
  }

  var timer = 0;
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(enhance, 90);
  }

  function bind() {
    var root = document.getElementById("root");
    if (!root) { setTimeout(bind, 300); return; }
    enhance();
    if (window.MutationObserver) new MutationObserver(schedule).observe(root, { childList: true, subtree: true });
    var raf = 0;
    window.addEventListener("scroll", function () {
      if (raf) return;
      raf = requestAnimationFrame(function () { raf = 0; spy(); });
    }, { passive: true });
    window.addEventListener("resize", function () { schedule(); });
    window.addEventListener("hashchange", function () {
      setTimeout(enhance, 150);
      setTimeout(spy, 350);
    });
    setInterval(schedule, 2000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
