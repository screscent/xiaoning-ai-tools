/* 小凝工具站 · 图片旋转翻转与水印增强 xn-imgedit v1
 * 能力：2 工具标签 46h/aria-pressed；h1 34/h2 20；上传区虚线+44h 选择按钮；
 *       旋转/缩放下拉 52/16、水印文字 52/16；翻转开关 role=switch/aria-checked/54×32；
 *       九宫格 44h/aria-pressed；透明度与字号滑块 44h 大圆点 + 数值 15/800；
 *       下载 48、复制 46、重置 46；空预览虚线画框；回到顶部。
 * 注入：legacy/ygj23az2jf.html（xn-ux 之后）。纯增强，不改业务逻辑。
 */
(function () {
  "use strict";
  if (window.__XN_IMGEDIT__) return;
  window.__XN_IMGEDIT__ = true;
  function vis(el) { return el && el.getBoundingClientRect().height > 0; }
  function clean(t) { return (t || "").replace(/\s+/g, " ").trim(); }
  function each(l, f) { Array.prototype.forEach.call(l, f); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function setA(el, k, v) { if (el.getAttribute(k) !== v) el.setAttribute(k, v); }

  var TABS = ["旋转翻转", "图片水印"];
  var POS = ["左上", "上", "右上", "左", "中", "右", "左下", "下", "右下"];

  function markHeads() {
    each(document.querySelectorAll("#root h1"), function (h) { if (vis(h)) add(h, "xn-ie-h1"); });
    each(document.querySelectorAll("#root h2"), function (h) { if (vis(h)) add(h, "xn-ie-h2"); });
  }

  function markTabs() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (TABS.indexOf(t) < 0) return;
      add(b, "xn-ie-tab");
      var on = /bg-blue-600/.test(String(b.className));
      setA(b, "aria-pressed", on ? "true" : "false");
      setA(b, "aria-label", "切换到：" + t + "（第 " + (TABS.indexOf(t) + 1) + "/2 个工具）");
    });
  }

  function markCards() {
    each(document.querySelectorAll("#root div"), function (d) {
      if (!vis(d)) return;
      var c = String(d.className);
      if (/bg-white/.test(c) && /rounded/.test(c)) add(d, "xn-ie-card");
    });
    // 空预览（"请上传图片" 多为 <p>，其容器是虚线画框目标）
    each(document.querySelectorAll("#root p, #root span, #root div"), function (d) {
      if (!vis(d) || d.children.length) return;
      if (clean(d.textContent) !== "请上传图片") return;
      var box = d.parentElement;
      if (box && /text-center|p-8/.test(String(box.className))) add(box, "xn-ie-empty");
      else add(d, "xn-ie-empty");
    });
  }

  function fieldLabelOf(el) {
    var box = el.closest("div.mb-4") || el.closest("div") || el.parentElement;
    if (!box) return "";
    var sp = box.querySelector("label, span");
    return clean(sp && sp.textContent).replace(/[：:].*$/, "").slice(0, 16);
  }

  function markInputs() {
    each(document.querySelectorAll("#root input[type=file]"), function (x) {
      if (!vis(x)) return;
      add(x, "xn-ie-file");
      setA(x, "aria-label", "上传图片（JPG / PNG / WebP）");
    });
    each(document.querySelectorAll("#root select"), function (s) {
      if (!vis(s)) return;
      add(s, "xn-ie-select");
      var n = clean(s.getAttribute("aria-label"));
      if (!n) { var t = fieldLabelOf(s); if (t) setA(s, "aria-label", t); }
    });
    each(document.querySelectorAll("#root input"), function (x) {
      if (!vis(x)) return;
      var ty = (x.getAttribute("type") || "text").toLowerCase();
      if (ty === "text") {
        add(x, "xn-ie-text");
        // 通用层 input:not(...) 链特异性更高，字号用内联 important 兜底
        if (x.style.getPropertyValue("font-size") !== "16px") x.style.setProperty("font-size", "16px", "important");
        var t = fieldLabelOf(x);
        if (t) setA(x, "aria-label", t.replace(/\s*\d+\s*(%|px)?$/i, ""));
      } else if (ty === "range") {
        add(x, "xn-ie-range");
        var lab = fieldLabelOf(x).replace(/\s*\d+\s*(%|px)?$/i, "");
        if (lab) { setA(x, "aria-label", lab); x.title = lab; }
      }
    });
  }

  function markSwitches() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var c = String(b.className);
      if (!/relative inline-flex/.test(c) || /xn-ie-/.test(c)) return;
      if (clean(b.textContent)) return;
      add(b, "xn-ie-switch");
      var knob = b.querySelector("span");
      var on = /bg-blue-600|bg-green-500/.test(c) || (knob && /translate-x-[4-9]/.test(String(knob.className)));
      setA(b, "role", "switch");
      setA(b, "aria-checked", on ? "true" : "false");
      var lab = b.closest("label");
      var name = "";
      if (lab) {
        var sp = lab.querySelector("span");
        name = clean(sp && sp.textContent);
        if (!name) name = clean(lab.textContent);
      }
      if (name) setA(b, "aria-label", name + "（开关）");
    });
  }

  function markPos() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      var i = POS.indexOf(t);
      if (i < 0) return;
      add(b, "xn-ie-pos");
      var on = /bg-blue-600/.test(String(b.className));
      setA(b, "aria-pressed", on ? "true" : "false");
      setA(b, "aria-label", "水印位置：" + t + "（九宫格第 " + (i + 1) + " 格）");
    });
  }

  function markButtons() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (t === "下载图片") { add(b, "xn-ie-primary"); setA(b, "aria-label", "下载处理后的图片"); }
      else if (t === "复制水印配置") { add(b, "xn-ie-btn"); setA(b, "aria-label", "复制当前水印参数配置"); }
      else if (t === "重置") { add(b, "xn-ie-reset"); setA(b, "aria-label", "重置当前工具参数"); }
    });
    // 透明度 / 字号数值
    each(document.querySelectorAll("#root span"), function (s) {
      if (!vis(s) || s.children.length) return;
      if (/^\d{1,3}\s*%$|^\d{1,3}\s*px$/i.test(clean(s.textContent))) add(s, "xn-ie-val");
    });
    each(document.querySelectorAll("#root p, #root li"), function (p) {
      if (vis(p) && parseFloat(getComputedStyle(p).fontSize) <= 13) add(p, "xn-ie-note");
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button"; topBtn.className = "xn-ie-top";
    topBtn.setAttribute("aria-label", "回到顶部"); topBtn.title = "回到顶部"; topBtn.textContent = "↑";
    topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    document.body.appendChild(topBtn);
  }

  function tick() {
    try { markHeads(); markTabs(); markCards(); markInputs(); markSwitches(); markPos(); markButtons(); ensureTop(); } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", tick, { once: true });
  else tick();
  window.setTimeout(tick, 900);
  window.setTimeout(tick, 2200);
  window.setInterval(tick, 1000);
  document.addEventListener("click", function () { window.setTimeout(tick, 120); }, true);
  document.addEventListener("input", function () { window.setTimeout(tick, 60); }, true);
  var pending = false;
  function schedule() { if (pending) return; pending = true; window.setTimeout(function () { pending = false; tick(); }, 120); }
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
  window.addEventListener("scroll", function () {
    if (!topBtn) return;
    if (window.scrollY > 620) topBtn.classList.add("is-on"); else topBtn.classList.remove("is-on");
  }, { passive: true });
})();
