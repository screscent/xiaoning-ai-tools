/* 小凝工具站 · 玻璃拟态与卡片增强 xn-glass v1
 * 能力：2 工具胶囊 44h/aria-current；h1 34/h2 20；
 *       4 个参数滑块 44h 大圆点 + 读屏名，数值 15/800；
 *       背景样式下拉 52/16、主色 52、顶部高光开关 54×32 role=switch；
 *       复制/下载/重置 46；代码块深靛 13.5；预览区本体不动。回到顶部。
 * 注入：legacy/jarc8vkp5e.html（xn-ux 之后）。纯增强，不改业务逻辑。
 */
(function () {
  "use strict";
  if (window.__XN_GLASS__) return;
  window.__XN_GLASS__ = true;
  function vis(el) { return el && el.getBoundingClientRect().height > 0; }
  function clean(t) { return (t || "").replace(/\s+/g, " ").trim(); }
  function each(l, f) { Array.prototype.forEach.call(l, f); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function setA(el, k, v) { if (el.getAttribute(k) !== v) el.setAttribute(k, v); }

  var TABS = ["玻璃拟态", "毛玻璃卡片"];
  var RANGE_NAMES = ["背景模糊", "透明度", "圆角", "边框亮度", "卡片模糊", "背景不透明度"];

  function markHeads() {
    each(document.querySelectorAll("#root h1"), function (h) { if (vis(h)) add(h, "xn-gl-h1"); });
    each(document.querySelectorAll("#root h2"), function (h) { if (vis(h)) add(h, "xn-gl-h2"); });
  }

  function markTabs() {
    each(document.querySelectorAll("#root a"), function (a) {
      if (!vis(a)) return;
      var t = clean(a.textContent);
      if (TABS.indexOf(t) < 0) return;
      add(a, "xn-gl-tab");
      var on = /bg-indigo-600/.test(String(a.className));
      if (on) setA(a, "aria-current", "page");
      else if (a.hasAttribute("aria-current")) a.removeAttribute("aria-current");
      setA(a, "aria-label", "切换到：" + t + "（第 " + (TABS.indexOf(t) + 1) + "/2 个工具）");
    });
  }

  function markCards() {
    each(document.querySelectorAll("#root div"), function (d) {
      if (!vis(d)) return;
      var c = String(d.className);
      if (/bg-white/.test(c) && /rounded/.test(c) && /shadow|border/.test(c)) add(d, "xn-gl-card");
    });
  }

  function rangeName(el) {
    var box = el.closest("div");
    var lab = box && box.querySelector("label, span");
    var t = clean(lab && lab.textContent);
    if (!t) {
      var all = el.closest("div") && el.closest("div").parentElement;
      t = clean(all && all.textContent).slice(0, 12);
    }
    return t.replace(/[：:].*$/, "").replace(/[\d.]+\s*(px|%)/g, "").trim().slice(0, 10);
  }

  function markInputs() {
    each(document.querySelectorAll("#root input[type=range]"), function (x) {
      if (!vis(x)) return;
      add(x, "xn-gl-range");
      var n = rangeName(x);
      if (!n || n.length > 8) n = RANGE_NAMES.shift() || "参数";
      setA(x, "aria-label", n);
      x.title = n;
    });
    each(document.querySelectorAll("#root select"), function (s) {
      if (!vis(s)) return;
      add(s, "xn-gl-select");
      if (!s.getAttribute("aria-label") || s.getAttribute("aria-label") === "") {
        var n = "";
        var box = s.closest("div");
        if (box) {
          var prev = box.previousElementSibling;
          if (prev && /label|span|div/.test(prev.tagName)) n = clean(prev.textContent).slice(0, 10);
          if (!n) { var lab = box.querySelector("label"); n = clean(lab && lab.textContent).slice(0, 10); }
        }
        setA(s, "aria-label", n || "背景样式");
      }
    });
    each(document.querySelectorAll("#root input[type=color]"), function (c) {
      if (!vis(c)) return;
      add(c, "xn-gl-color");
      setA(c, "aria-label", "背景主色");
    });
    each(document.querySelectorAll("#root span, #root div"), function (e) {
      if (!vis(e) || e.children.length || e.closest("pre")) return;
      var t = clean(e.textContent);
      if (!/^\d+(\.\d+)?\s*(px|%)$/.test(t)) return;
      if (parseFloat(getComputedStyle(e).fontSize) > 14) return;
      add(e, "xn-gl-val");
    });
    each(document.querySelectorAll("#root span"), function (e) {
      if (!vis(e) || e.children.length) return;
      if (/^#[0-9A-F]{6}$/i.test(clean(e.textContent))) add(e, "xn-gl-hex");
    });
  }

  function markSwitch() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var c = String(b.className);
      if (clean(b.textContent)) return;
      var h = b.getBoundingClientRect().height;
      if (h > 34 || !/rounded-full/.test(c)) return;
      add(b, "xn-gl-switch");
      var on = /bg-(indigo|blue|violet|pink)-600|bg-emerald-500/.test(c);
      setA(b, "role", "switch");
      setA(b, "aria-checked", on ? "true" : "false");
      var box = b.closest("div");
      var lab = box && box.querySelector("span, label, p");
      var name = clean(lab && lab.textContent).slice(0, 12);
      if (name) setA(b, "aria-label", name + "（开关）");
    });
  }

  function markButtons() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (t === "复制 CSS") { add(b, "xn-gl-btn"); setA(b, "aria-label", "复制生成的 CSS"); }
      else if (t === "下载 CSS") { add(b, "xn-gl-btn"); setA(b, "aria-label", "下载 CSS 文件"); }
      else if (t === "重置默认") { add(b, "xn-gl-btn"); setA(b, "aria-label", "重置为默认参数"); }
    });
    each(document.querySelectorAll("#root pre"), function (p) { if (vis(p)) add(p, "xn-gl-pre"); });
    each(document.querySelectorAll("#root p, #root li"), function (p) {
      if (vis(p) && parseFloat(getComputedStyle(p).fontSize) <= 13.5) add(p, "xn-gl-note");
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button"; topBtn.className = "xn-gl-top";
    topBtn.setAttribute("aria-label", "回到顶部"); topBtn.title = "回到顶部"; topBtn.textContent = "↑";
    topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    document.body.appendChild(topBtn);
  }

  function tick() {
    try { markHeads(); markTabs(); markCards(); markInputs(); markSwitch(); markButtons(); ensureTop(); } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", tick, { once: true });
  else tick();
  window.setTimeout(tick, 900);
  window.setTimeout(tick, 2200);
  window.setInterval(tick, 1000);
  document.addEventListener("click", function () { window.setTimeout(tick, 120); }, true);
  document.addEventListener("input", function () { window.setTimeout(tick, 80); }, true);
  var pending = false;
  function schedule() { if (pending) return; pending = true; window.setTimeout(function () { pending = false; tick(); }, 120); }
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
  window.addEventListener("scroll", function () {
    if (!topBtn) return;
    if (window.scrollY > 620) topBtn.classList.add("is-on"); else topBtn.classList.remove("is-on");
  }, { passive: true });
})();
