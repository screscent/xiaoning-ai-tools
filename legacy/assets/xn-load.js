/* 小凝工具站 · 加载动画与骨架屏增强 xn-load v1
 * 能力：2 标签 38→44h/aria-current/去圈号/具名；h2 20、h3 16.5 去①-⑩；
 *       主色 52/48、尺寸/速度滑块 44h、样式下拉 50；开关 68×44+32 圆点具名；
 *       骨架屏数字 52/22/86 去 spin、复选 24、按钮 16-38→44/46 具名；
 *       代码块 12→14.5 深色；数值 16/800；回到顶部。
 * 注入：legacy/5cuungt6g5.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_LOAD__) return;
  window.__XN_LOAD__ = true;
  function vis(el) { return el && el.getBoundingClientRect().height > 0; }
  function clean(t) { return (t || "").replace(/\s+/g, " ").trim(); }
  function each(l, f) { Array.prototype.forEach.call(l, f); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function setA(el, v) { if (el.getAttribute("aria-label") !== v) el.setAttribute("aria-label", v); }

  function cleanHeads() {
    each(document.querySelectorAll("#root h2, #root h3"), function (h) {
      var t = clean(h.textContent);
      var c = t.replace(/^\s*[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "");
      if (c !== t) h.textContent = c;
      add(h, "xn-load-h2");
    });
  }

  function markTabs() {
    var cur = location.hash.indexOf("skeleton") >= 0 ? "骨架屏" : "加载动画";
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var raw = clean(b.textContent);
      if (!/加载动画|骨架屏/.test(raw) || raw.length > 10) return;
      var t = raw.replace(/^\s*[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "");
      if (clean(b.textContent) !== t) b.textContent = t;
      add(b, "xn-load-tab");
      setA(b, "切换到：" + t + "（工具 " + (t === "加载动画" ? 1 : 2) + "）");
      if (t === cur) { if (b.getAttribute("aria-current") !== "page") b.setAttribute("aria-current", "page"); }
      else if (b.hasAttribute("aria-current")) b.removeAttribute("aria-current");
    });
  }

  var NUM_MAP = [
    ["1 - 8", "行数（1–8）"],
    ["0 - 16", "圆角（0–16）"]
  ];

  function markInputs() {
    each(document.querySelectorAll("#root input"), function (x) {
      if (!vis(x)) return;
      if (x.type === "color") {
        add(x, "xn-load-color"); setA(x, "主色");
      } else if (x.type === "range") {
        add(x, "xn-load-range");
        var a = clean(x.getAttribute("aria-label"));
        if (a === "尺寸") setA(x, "尺寸（px）");
        else if (a === "动画速度") setA(x, "动画速度（秒）");
      } else if (x.type === "number") {
        add(x, "xn-load-num");
        var raw = clean(x.getAttribute("aria-label"));
        var aria = raw;
        NUM_MAP.forEach(function (m) { if (aria === m[0]) aria = m[1]; });
        setA(x, aria);
      } else if (x.type === "checkbox") {
        add(x, "xn-load-check"); setA(x, "动画开关");
        x.style.setProperty("width", "24px", "important");
        x.style.setProperty("height", "24px", "important");
      }
    });
    each(document.querySelectorAll("#root select"), function (s) {
      if (!vis(s)) return;
      add(s, "xn-load-select");
      var n = clean(s.getAttribute("aria-label"));
      if (n) setA(s, n);
    });
  }

  function markSwitches() {
    each(document.querySelectorAll('#root button[role="switch"]'), function (b) {
      if (!vis(b)) return;
      add(b, "xn-load-switch");
      var on = b.getAttribute("aria-checked") === "true";
      b.style.setProperty("width", "68px", "important");
      b.style.setProperty("height", "44px", "important");
      b.style.setProperty("min-height", "44px", "important");
      b.style.setProperty("padding", "0", "important");
      b.style.setProperty("background-color", on ? "#3b82f6" : "#cbd5e1", "important");
      var knob = b.querySelector(":scope > span");
      if (knob) {
        knob.style.setProperty("width", "32px", "important");
        knob.style.setProperty("height", "32px", "important");
        knob.style.setProperty("margin", "0", "important");
        knob.style.setProperty("translate", "none", "important");
        knob.style.setProperty("transform", on ? "translateX(24px)" : "translateX(0px)", "important");
      }
      var name = "";
      var p = b.parentElement;
      if (p) {
        var s = p.querySelector(":scope > span");
        if (s) name = clean(s.textContent);
      }
      name = name.replace(/[：:]\s*$/, "");
      setA(b, name ? "切换：" + name : "显示文字提示");
    });
  }

  function markButtons() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (t === "复制代码") {
        add(b, "xn-load-btn"); add(b, "xn-load-btn-primary"); setA(b, "复制代码");
      } else if (t === "下载 .html") {
        add(b, "xn-load-btn"); setA(b, "下载 HTML 文件");
      } else if (t === "重置默认") {
        add(b, "xn-load-btn"); setA(b, "重置为默认参数");
      } else if (t === "复制") {
        add(b, "xn-load-mini"); setA(b, "复制生成的代码");
      }
    });
  }

  function markBlocks() {
    each(document.querySelectorAll("#root pre"), function (pre) {
      if (vis(pre)) add(pre, "xn-load-pre");
    });
    each(document.querySelectorAll("#root span"), function (s) {
      if (!vis(s) || s.children.length) return;
      var t = clean(s.textContent);
      if (/^\d+(\.\d+)?(px|s)$/.test(t)) add(s, "xn-load-numtxt");
      else if (/^\d+\s*-\s*\d+$/.test(t)) add(s, "xn-load-unit");
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button"; topBtn.className = "xn-load-top";
    topBtn.setAttribute("aria-label", "回到顶部"); topBtn.title = "回到顶部"; topBtn.textContent = "↑";
    topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    document.body.appendChild(topBtn);
  }

  function tick() { try { cleanHeads(); markTabs(); markInputs(); markSwitches(); markButtons(); markBlocks(); ensureTop(); } catch (e) {} }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", tick, { once: true }); else tick();
  window.setTimeout(tick, 900); window.setTimeout(tick, 2200); window.setInterval(tick, 1000);
  document.addEventListener("click", function () { window.setTimeout(tick, 200); }, true);
  window.addEventListener("hashchange", function () { window.setTimeout(tick, 120); });
  var pending = false;
  function schedule() { if (pending) return; pending = true; window.setTimeout(function () { pending = false; tick(); }, 120); }
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
  window.addEventListener("scroll", function () { if (!topBtn) return; if (window.scrollY > 620) topBtn.classList.add("is-on"); else topBtn.classList.remove("is-on"); }, { passive: true });
})();
