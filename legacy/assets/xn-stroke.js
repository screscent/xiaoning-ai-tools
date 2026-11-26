/* 小凝工具站 · 文字描边与多层描边增强 xn-stroke v1
 * 能力：2 标签锚点 30→44h/aria-current/具名；h2 去② 20；9+6 输入 46→52/22 + aria 语义化；
 *       滑块 28→44 触控 + 26 圆点；下拉 50；复制CSS/HTML/清空 38→46、复制代码 36→46 具名；
 *       CSS 代码块 13→14.5 深色；描边预览卡；回到顶部。
 * 注入：legacy/qhwm67stfq.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_STROKE__) return;
  window.__XN_STROKE__ = true;
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
      add(h, "xn-stroke-h2");
    });
  }

  function markTabs() {
    var cur = location.hash.indexOf("multistroke") >= 0 ? "多层描边" : "文字描边";
    each(document.querySelectorAll("#root a"), function (a) {
      if (!vis(a)) return;
      var t = clean(a.textContent);
      if (t !== "文字描边" && t !== "多层描边") return;
      var href = a.getAttribute("href") || "";
      if (href.indexOf("#/") !== 0) return;
      add(a, "xn-stroke-tab");
      setA(a, "切换到：" + t + "（工具 " + (t === "文字描边" ? 1 : 2) + "）");
      if (t === cur) { if (a.getAttribute("aria-current") !== "page") a.setAttribute("aria-current", "page"); }
      else if (a.hasAttribute("aria-current")) a.removeAttribute("aria-current");
    });
  }

  function markInputs() {
    each(document.querySelectorAll("#root label"), function (lab) {
      var name = clean(lab.textContent);
      if (!name) return;
      var box = lab.parentElement;
      if (!box) return;
      var ctrls = Array.prototype.slice.call(box.querySelectorAll("input, select"));
      if (!ctrls.length) return;
      if (ctrls.length === 1) {
        var el = ctrls[0];
        if (el.tagName === "SELECT") { add(el, "xn-stroke-select"); setA(el, name); }
        else if (el.type === "range") { add(el, "xn-stroke-range"); setA(el, name + "（滑块）"); }
        else if (el.type === "number") { add(el, "xn-stroke-num"); setA(el, name); }
        else if (el.type === "color") { add(el, "xn-stroke-color"); setA(el, name); }
        else { add(el, "xn-stroke-text"); setA(el, name); }
        return;
      }
      ctrls.forEach(function (el) {
        if (el.type === "color") { add(el, "xn-stroke-color"); setA(el, name); }
        else if (el.type === "text") { add(el, "xn-stroke-hex"); setA(el, name + "（十六进制）"); }
        else if (el.type === "range") { add(el, "xn-stroke-range"); setA(el, name + "（滑块）"); }
        else if (el.type === "number") { add(el, "xn-stroke-num"); setA(el, name); }
      });
    });
    each(document.querySelectorAll("#root input, #root select"), function (el) {
      if (!vis(el)) return;
      if (el.type === "range" && !el.classList.contains("xn-stroke-range")) add(el, "xn-stroke-range");
      if (el.type === "number" && !el.classList.contains("xn-stroke-num")) add(el, "xn-stroke-num");
    });
  }

  function markButtons() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (t === "复制 CSS") {
        add(b, "xn-stroke-btn"); add(b, "xn-stroke-btn-primary"); setA(b, "复制 CSS 代码");
      } else if (t === "复制 HTML") {
        add(b, "xn-stroke-btn"); setA(b, "复制 HTML 片段");
      } else if (t === "清空") {
        add(b, "xn-stroke-btn"); setA(b, "清空全部参数");
      } else if (t === "复制代码") {
        add(b, "xn-stroke-btn"); add(b, "xn-stroke-btn-primary"); setA(b, "复制多层描边 CSS 代码");
      }
    });
  }

  function markBlocks() {
    each(document.querySelectorAll("#root pre"), function (pre) {
      if (vis(pre)) add(pre, "xn-stroke-pre");
    });
    each(document.querySelectorAll("#root span"), function (s) {
      if (!vis(s) || s.children.length) return;
      var st = s.getAttribute("style") || "";
      if (/text-shadow|text-stroke/.test(st) && /font-size/.test(st)) add(s, "xn-stroke-preview");
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button"; topBtn.className = "xn-stroke-top";
    topBtn.setAttribute("aria-label", "回到顶部"); topBtn.title = "回到顶部"; topBtn.textContent = "↑";
    topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    document.body.appendChild(topBtn);
  }

  function tick() { try { cleanHeads(); markTabs(); markInputs(); markButtons(); markBlocks(); ensureTop(); } catch (e) {} }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", tick, { once: true }); else tick();
  window.setTimeout(tick, 900); window.setTimeout(tick, 2200); window.setInterval(tick, 1000);
  document.addEventListener("click", function () { window.setTimeout(tick, 200); }, true);
  window.addEventListener("hashchange", function () { window.setTimeout(tick, 120); });
  var pending = false;
  function schedule() { if (pending) return; pending = true; window.setTimeout(function () { pending = false; tick(); }, 120); }
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
  window.addEventListener("scroll", function () { if (!topBtn) return; if (window.scrollY > 620) topBtn.classList.add("is-on"); else topBtn.classList.remove("is-on"); }, { passive: true });
})();
