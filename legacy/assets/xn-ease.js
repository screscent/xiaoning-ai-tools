/* 小凝工具站 · 缓动曲线与关键帧增强 xn-ease v1
 * 能力：2 标签 38→44h/aria-current/具名；h2 去② 20；5 输入 48→52/22 + aria 语义化 + 时长胶囊；
 *       下拉 50；生成 44→52/17、复制CSS/重置/清空 42→46、重播/复制 24/26→44 具名；
 *       CSS 代码块深色 14.5、预览卡/网格底、bezier 数值 22/800；回到顶部。
 * 注入：legacy/m9jfu6ue9a.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_EASE__) return;
  window.__XN_EASE__ = true;
  function vis(el) { return el && el.getBoundingClientRect().height > 0; }
  function clean(t) { return (t || "").replace(/\s+/g, " ").trim(); }
  function each(l, f) { Array.prototype.forEach.call(l, f); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }

  function isKF() {
    var hasEase = Array.prototype.some.call(document.querySelectorAll("#root input"), function (i) {
      return /动画时长/.test(i.getAttribute("aria-label") || "");
    });
    return !hasEase;
  }

  function cleanHeads() {
    each(document.querySelectorAll("#root h2, #root h3"), function (h) {
      var t = clean(h.textContent);
      var c = t.replace(/^\s*[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "").replace(/^工具\s*[A-Za-z]\s+/, "");
      if (c !== t) h.textContent = c;
      if (/^关键帧动画生成$|^缓动曲线/.test(c)) add(h, "xn-ease-h2");
    });
  }

  function markTabs() {
    var kf = isKF();
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (t !== "缓动曲线" && t !== "关键帧") return;
      add(b, "xn-ease-tab");
      var on = (t === "关键帧") === kf;
      if (on) { if (b.getAttribute("aria-current") !== "page") b.setAttribute("aria-current", "page"); }
      else if (b.hasAttribute("aria-current")) b.removeAttribute("aria-current");
      var aria = "切换到：" + t + "（工具 " + (t === "缓动曲线" ? 1 : 2) + "）";
      if (b.getAttribute("aria-label") !== aria) b.setAttribute("aria-label", aria);
    });
  }

  function nativeSet(el, v) {
    var d = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    if (d && d.set) d.set.call(el, v); else el.value = v;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  var MAP = [
    ["动画时长", "动画时长（ms）"], ["时长", "时长（ms）"],
    ["x₁", "控制点 1 X"], ["y₁", "控制点 1 Y"], ["x₂", "控制点 2 X"], ["y₂", "控制点 2 Y"]
  ];

  function markInputs() {
    each(document.querySelectorAll("#root input"), function (input) {
      if (!vis(input) || input.type !== "number") return;
      var raw = clean(input.getAttribute("aria-label"));
      var aria = raw;
      MAP.forEach(function (m) { if (aria === m[0]) aria = m[1]; });
      if (aria && input.getAttribute("aria-label") !== aria) input.setAttribute("aria-label", aria);
      if (!/时长/.test(aria)) return;
      var host = input.parentElement;
      if (!host || host.querySelector(":scope > .xn-ease-qrow")) return;
      var row = document.createElement("div");
      row.className = "xn-ease-qrow";
      [150, 300, 600, 1000].forEach(function (q) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "xn-ease-q"; b.textContent = String(q);
        b.setAttribute("aria-label", "填入 " + q + " 毫秒（" + aria + "）");
        b.addEventListener("click", function (e) { e.preventDefault(); nativeSet(input, String(q)); input.focus(); });
        row.appendChild(b);
      });
      host.appendChild(row);
    });
    each(document.querySelectorAll("#root select"), function (s) {
      if (!vis(s)) return;
      var a = clean(s.getAttribute("aria-label"));
      if (a === "预设") a = "缓动预设";
      if (a && s.getAttribute("aria-label") !== a) s.setAttribute("aria-label", a);
    });
  }

  function markButtons() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (t === "生成") {
        add(b, "xn-ease-go");
        if (b.getAttribute("aria-label") !== "生成缓动曲线") b.setAttribute("aria-label", "生成缓动曲线");
      } else if (t === "复制 CSS" || t === "重置" || t === "清空") {
        add(b, "xn-ease-sec");
        var a = t === "复制 CSS" ? "复制 CSS 代码" : (t === "重置" ? "重置参数" : "清空输入");
        if (b.getAttribute("aria-label") !== a) b.setAttribute("aria-label", a);
      } else if (t === "重播" || t === "复制") {
        add(b, "xn-ease-mini");
        var a2 = t === "重播" ? "重播动画" : "复制 CSS 代码";
        if (b.getAttribute("aria-label") !== a2) b.setAttribute("aria-label", a2);
      }
    });
  }

  function markBlocks() {
    each(document.querySelectorAll("#root pre"), function (pre) {
      if (vis(pre)) add(pre, "xn-ease-code");
    });
    each(document.querySelectorAll("#root div"), function (d) {
      if (!vis(d)) return;
      var h = d.querySelector(":scope > h3, :scope > h4");
      if (h && /实时预览|生成的 CSS|曲线预览/.test(clean(h.textContent))) add(d, "xn-ease-preview");
      var cls = String(d.className || "");
      if (cls.indexOf("rounded-xl") >= 0 && cls.indexOf("border") >= 0 && d.getBoundingClientRect().height >= 120 && d.getBoundingClientRect().height <= 420 && !d.querySelector("input,select,pre")) add(d, "xn-ease-stage");
    });
    each(document.querySelectorAll("#root span, #root div"), function (e) {
      if (!vis(e) || e.children.length) return;
      var t = clean(e.textContent);
      if (/^\d+(\.\d+)?$/.test(t) && parseFloat(getComputedStyle(e).fontSize) >= 17 && t.length <= 6) add(e, "xn-ease-num");
      if (/^\d+ms\s·/.test(t) || /当前曲线|单位：毫秒/.test(t)) add(e, "xn-ease-cap");
      if (/人类作者：/.test(t) && e.getBoundingClientRect().height < 100) add(e, "xn-ease-foot");
      if (/全部在浏览器本地|不联网|仅供参考/.test(t) && t.length > 8) add(e, "xn-ease-note");
    });
    each(document.querySelectorAll("#root p"), function (p) {
      if (vis(p) && clean(p.textContent).length > 10) add(p, "xn-ease-note");
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button"; topBtn.className = "xn-ease-top";
    topBtn.setAttribute("aria-label", "回到顶部"); topBtn.title = "回到顶部"; topBtn.textContent = "↑";
    topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    document.body.appendChild(topBtn);
  }
  function tick() { try { cleanHeads(); markTabs(); markInputs(); markButtons(); markBlocks(); ensureTop(); } catch (e) {} }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", tick, { once: true }); else tick();
  window.setTimeout(tick, 900); window.setTimeout(tick, 2200); window.setInterval(tick, 1000);
  document.addEventListener("click", function () { window.setTimeout(tick, 200); }, true);
  var pending = false;
  function schedule() { if (pending) return; pending = true; window.setTimeout(function () { pending = false; tick(); }, 120); }
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
  window.addEventListener("scroll", function () { if (!topBtn) return; if (window.scrollY > 620) topBtn.classList.add("is-on"); else topBtn.classList.remove("is-on"); }, { passive: true });
})();
