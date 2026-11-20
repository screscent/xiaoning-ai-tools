/* R1112 编码检测与乱码修复合集 — 人用友好增强（幂等）
   1. 工具E/F 归一
   2. 总览卡类
   3. 滚动浮动工具条（按 h2 定位）
   4. 按钮/方向 aria
   不改 React 逻辑。 */
(function () {
  if (window.__xnEnc) return;
  window.__xnEnc = 1;

  function q(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function vis(el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; }
  function txt(el) { return (el.textContent || "").trim().replace(/\s+/g, " "); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function setAttr(el, k, v) { if (el.getAttribute(k) !== v) el.setAttribute(k, v); }

  var SHORT = ["编码检测", "乱码互修", "编码转换", "Unicode", "Base64 体积", "Base64 编解码"];

  function normalize(root) {
    q("h1,h2,h3", root).forEach(function (h) {
      if (h.children.length) return;
      var t = txt(h);
      var n = t.replace(/^工具[EF]\s*/, "");
      if (n !== t && n) h.textContent = n;
    });
  }

  function cards(root) {
    var grid = q("div", root).filter(function (d) {
      return d.children.length >= 4 && q(":scope > a[href^='#/']", d).length >= 4;
    })[0];
    if (!grid) {
      var a = q("a[href^='#/']", root).filter(vis)[0];
      grid = a && a.parentElement;
    }
    if (!grid) return;
    add(grid, "xn-enc-cards");
    q("a[href^='#/']", grid).forEach(function (a) {
      add(a, "xn-enc-card");
      if (!a.getAttribute("aria-label")) a.setAttribute("aria-label", "跳到 " + txt(a).slice(0, 20));
    });
  }

  function buttons(root) {
    q("button", root).forEach(function (b) {
      if (!vis(b)) return;
      var t = txt(b);
      var c = b.className || "";
      if (/^(开始分析|开始修复|开始转换|编码互转)$/.test(t)) {
        add(b, "xn-enc-primary");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", t);
      } else if (t === "清空") {
        add(b, "xn-enc-secondary");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "清空文本");
      } else if (/样例$/.test(t)) {
        add(b, "xn-enc-chip");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "填入" + t);
      } else if (/→|自动尝试/.test(t) && c.indexOf("rounded-full") >= 0) {
        add(b, "xn-enc-chip");
        var on = /bg-indigo-600|border-indigo-500|bg-indigo-50/.test(c);
        setAttr(b, "aria-pressed", on ? "true" : "false");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "转换方向 " + t);
      } else if (t === "复制") {
        add(b, "xn-enc-copy");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "复制结果");
      }
    });
    q("select", root).forEach(function (s) {
      if (!s.getAttribute("aria-label")) s.setAttribute("aria-label", "选择编码");
    });
  }

  function buildBar(root) {
    if (document.getElementById("xn-enc-bar")) return;
    var h2s = q("h2", root).filter(vis);
    if (h2s.length < 4) return;
    var bar = document.createElement("div");
    bar.id = "xn-enc-bar";
    bar.className = "xn-enc-bar";
    bar.setAttribute("role", "navigation");
    bar.setAttribute("aria-label", "工具快捷切换");
    h2s.forEach(function (h, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = SHORT[i] || txt(h).slice(0, 8);
      b.setAttribute("data-idx", String(i));
      b.addEventListener("click", function () {
        var y = h.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top: y, behavior: "smooth" });
      });
      bar.appendChild(b);
    });
    var top = document.createElement("button");
    top.type = "button";
    top.className = "xn-enc-top";
    top.textContent = "↑ 顶部";
    top.setAttribute("aria-label", "回到页面顶部");
    top.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    bar.appendChild(top);
    root.insertBefore(bar, root.firstChild);

    var active = -1;
    function sync() {
      var first = h2s[0];
      if (!first) return;
      var on = window.scrollY > first.getBoundingClientRect().top + window.scrollY - 260;
      bar.classList.toggle("is-on", on);
      if (!on) return;
      var idx = 0;
      h2s.forEach(function (h, i) {
        if (h.getBoundingClientRect().top <= 140) idx = i;
      });
      if (idx !== active) {
        active = idx;
        q("button[data-idx]", bar).forEach(function (b) {
          setAttr(b, "aria-current", Number(b.getAttribute("data-idx")) === idx ? "true" : "false");
        });
      }
    }
    var tick = false;
    window.addEventListener("scroll", function () {
      if (tick) return;
      tick = true;
      requestAnimationFrame(function () { tick = false; sync(); });
    }, { passive: true });
    setTimeout(sync, 700);
    setInterval(sync, 1200);
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
      buttons(root);
      buildBar(root);
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
    setTimeout(enhance, 800);
    setInterval(schedule, 1500);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
})();
