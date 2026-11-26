/* 小凝工具站 · 繁简转换与用词对照增强 xn-zhconv v1
 * 能力：2 工具标签 44h/aria-pressed；h1 34；文本域 220/15.5；下拉 52/16；
 *       3 个开关 54×32 role=switch/aria-checked；转换 48、复制/清空 46；
 *       结果稿纸块 15.5；统计 22/800；对照片语胶囊；回到顶部。
 * 注入：legacy/rdqya64t4r.html（xn-ux 之后）。纯增强，不改业务逻辑。
 */
(function () {
  "use strict";
  if (window.__XN_ZHCONV__) return;
  window.__XN_ZHCONV__ = true;
  function vis(el) { return el && el.getBoundingClientRect().height > 0; }
  function clean(t) { return (t || "").replace(/\s+/g, " ").trim(); }
  function each(l, f) { Array.prototype.forEach.call(l, f); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function setA(el, k, v) { if (el.getAttribute(k) !== v) el.setAttribute(k, v); }

  function markHeads() { each(document.querySelectorAll("#root h1"), function (h) { if (vis(h)) add(h, "xn-zc-h1"); }); }

  function markTabs() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (t !== "繁简转换" && t !== "用词对照") return;
      add(b, "xn-zc-tab");
      var on = /bg-(blue|indigo|slate)-600|bg-slate-800/.test(String(b.className));
      setA(b, "aria-pressed", on ? "true" : "false");
      setA(b, "aria-label", "切换到：" + t);
    });
  }

  function markCards() {
    each(document.querySelectorAll("#root section, #root div"), function (d) {
      if (!vis(d)) return;
      var c = String(d.className);
      if (/bg-white/.test(c) && /rounded/.test(c) && /shadow|border/.test(c)) add(d, "xn-zc-card");
    });
  }

  function markInputs() {
    each(document.querySelectorAll("#root textarea"), function (t) {
      if (!vis(t)) return;
      add(t, "xn-zc-text");
      if (!t.getAttribute("aria-label")) setA(t, "aria-label", "输入文本");
    });
    each(document.querySelectorAll("#root select"), function (s) {
      if (!vis(s)) return;
      add(s, "xn-zc-select");
      if (!s.getAttribute("aria-label")) {
        var lab = s.closest("div") && s.closest("div").querySelector("label");
        var n = clean(lab && lab.textContent).slice(0, 10);
        if (n) setA(s, "aria-label", n);
      }
    });
  }

  function markSwitches() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var c = String(b.className);
      if (clean(b.textContent)) return;
      if (!/relative.*w-11.*h-6/.test(c)) return;
      add(b, "xn-zc-switch");
      var on = /bg-blue-600|bg-indigo-600/.test(c);
      setA(b, "role", "switch");
      setA(b, "aria-checked", on ? "true" : "false");
      var lab = b.closest("label") || b.closest("div");
      var name = "";
      if (lab) {
        var txt = clean(lab.textContent).replace(/\s*(开|关)\s*$/, "");
        name = txt.split(/[（(]/)[0].slice(0, 12);
      }
      if (name) setA(b, "aria-label", name);
    });
  }

  function markButtons() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (t === "转换") { add(b, "xn-zc-primary"); setA(b, "aria-label", "按所选方向转换繁简"); }
      else if (t === "复制结果" || t === "清空") { add(b, "xn-zc-btn"); setA(b, "aria-label", t === "复制结果" ? "复制转换结果" : "清空输入与结果"); }
      else if (t === "复制对照") { add(b, "xn-zc-btn"); setA(b, "aria-label", "复制两岸用词对照表"); }
    });
    each(document.querySelectorAll("#root pre"), function (p) { if (vis(p)) add(p, "xn-zc-out"); });
    // 统计数字
    each(document.querySelectorAll("#root div, #root span, #root dd, #root p"), function (e) {
      if (!vis(e) || e.children.length) return;
      if (e.closest("button, pre, textarea, table")) return;
      var t = clean(e.textContent);
      if (!/^\d[\d,]*$/.test(t)) return;
      if (parseFloat(getComputedStyle(e).fontSize) >= 15) add(e, "xn-zc-stat");
    });
    // 对照片语：行容器（24~96h、含箭头、非纯箭头）
    each(document.querySelectorAll("#root div, #root li"), function (e) {
      if (!vis(e)) return;
      var t = clean(e.textContent);
      if (t.length < 3 || t.length > 40) return;
      if (!/→|↔/.test(t)) return;
      var h = e.getBoundingClientRect().height;
      if (h < 24 || h > 96) return;
      if (e.closest("button, pre, table, textarea")) return;
      // 仅工具 1 的对照表用胶囊；工具 2 两岸词条保持原始卡片布局
      var box = e.parentElement, inTable = false;
      for (var k = 0; k < 4 && box; k++) {
        var bt = clean(box.textContent);
        if (/两岸用词对照/.test(bt)) return;
        if (/用词对照表|单字对照/.test(bt)) { inTable = true; break; }
        box = box.parentElement;
      }
      if (!inTable) return;
      add(e, "xn-zc-pair");
    });
    // 小节标题 ①~④
    each(document.querySelectorAll("#root div, #root p, #root span, #root h3"), function (e) {
      if (!vis(e) || e.children.length) return;
      var t = clean(e.textContent);
      if (/^[①②③④⑤]\s*\S/.test(t) && t.length <= 20) add(e, "xn-zc-sec");
    });
    each(document.querySelectorAll("#root p, #root li"), function (p) {
      if (vis(p) && parseFloat(getComputedStyle(p).fontSize) <= 13) add(p, "xn-zc-note");
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button"; topBtn.className = "xn-zc-top";
    topBtn.setAttribute("aria-label", "回到顶部"); topBtn.title = "回到顶部"; topBtn.textContent = "↑";
    topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    document.body.appendChild(topBtn);
  }

  function tick() {
    try { markHeads(); markTabs(); markCards(); markInputs(); markSwitches(); markButtons(); ensureTop(); } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", tick, { once: true });
  else tick();
  window.setTimeout(tick, 900);
  window.setTimeout(tick, 2200);
  window.setInterval(tick, 1000);
  document.addEventListener("click", function () { window.setTimeout(tick, 140); }, true);
  document.addEventListener("input", function () { window.setTimeout(tick, 90); }, true);
  var pending = false;
  function schedule() { if (pending) return; pending = true; window.setTimeout(function () { pending = false; tick(); }, 120); }
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
  window.addEventListener("scroll", function () {
    if (!topBtn) return;
    if (window.scrollY > 620) topBtn.classList.add("is-on"); else topBtn.classList.remove("is-on");
  }, { passive: true });
})();
