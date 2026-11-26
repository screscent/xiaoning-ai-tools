/* 小凝工具站 · 标点全半角与空白规范增强 xn-punct v1
 * 能力：2 工具标签 44h/aria-pressed；h1 34/h2 20；
 *       输入/输出文本域 ≥180/15.5；转换方向下拉 52/16；
 *       多选项整行胶囊 40h + 复选框 22px；转换/规范 48 主按钮、复制/清空 46；
 *       结果区小标题 16.5、统计 26/20、表格表头/单元格；回到顶部。
 * 注入：legacy/lyrudrjxel.html（xn-ux 之后）。纯增强，不改业务逻辑。
 */
(function () {
  "use strict";
  if (window.__XN_PUNCT__) return;
  window.__XN_PUNCT__ = true;
  function vis(el) { return el && el.getBoundingClientRect().height > 0; }
  function clean(t) { return (t || "").replace(/\s+/g, " ").trim(); }
  function each(l, f) { Array.prototype.forEach.call(l, f); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function setA(el, k, v) { if (el.getAttribute(k) !== v) el.setAttribute(k, v); }

  function markHeads() {
    each(document.querySelectorAll("#root h1"), function (h) { if (vis(h)) add(h, "xn-pc-h1"); });
    each(document.querySelectorAll("#root h2"), function (h) { if (vis(h)) add(h, "xn-pc-h2"); });
  }

  function markTabs() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (!/^第\s*[12]\s*项\s*·/.test(t)) return;
      add(b, "xn-pc-tab");
      var on = /bg-slate-800/.test(String(b.className));
      setA(b, "aria-pressed", on ? "true" : "false");
      setA(b, "aria-label", "切换到：" + t.replace(/^第\s*([12])\s*项\s*·\s*/, "第$1项 "));
    });
  }

  function markCards() {
    each(document.querySelectorAll("#root section, #root div"), function (d) {
      if (!vis(d)) return;
      var c = String(d.className);
      if (/bg-white/.test(c) && /rounded/.test(c) && /shadow|border/.test(c)) add(d, "xn-pc-card");
    });
  }

  function markText() {
    each(document.querySelectorAll("#root textarea"), function (t) {
      if (!vis(t)) return;
      add(t, "xn-pc-text");
      if (t.readOnly) add(t, "xn-pc-out");
      if (!t.getAttribute("aria-label")) {
        var name = "";
        var box = t.parentElement;
        for (var i = 0; i < 3 && box; i++) {
          var lab = box.querySelector("label");
          if (lab && clean(lab.textContent)) { name = clean(lab.textContent).slice(0, 16); break; }
          box = box.parentElement;
        }
        setA(t, "aria-label", name || (t.readOnly ? "转换结果" : "待处理文本"));
      }
    });
    each(document.querySelectorAll("#root select"), function (s) {
      if (!vis(s)) return;
      add(s, "xn-pc-select");
      if (!s.getAttribute("aria-label")) {
        var lab = s.closest("div") && s.closest("div").querySelector("label");
        var n = clean(lab && lab.textContent).slice(0, 12);
        if (n) setA(s, "aria-label", n);
      }
    });
  }

  function markChecks() {
    each(document.querySelectorAll("#root label[data-chip]"), function (l) {
      if (!vis(l)) return;
      add(l, "xn-pc-chip");
      if (!l.getAttribute("aria-label")) setA(l, "aria-label", clean(l.textContent).slice(0, 12));
    });
    each(document.querySelectorAll("#root input[type=checkbox]"), function (x) {
      if (!vis(x)) return;
      add(x, "xn-pc-box");
      var lab = x.closest("label");
      if (lab) { add(lab, "xn-pc-check"); if (!x.getAttribute("aria-label")) setA(x, "aria-label", clean(lab.textContent).slice(0, 20)); }
      else if (!x.getAttribute("aria-label")) setA(x, "aria-label", "选项");
    });
  }

  function markButtons() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (t === "转换" || t === "规范") {
        add(b, "xn-pc-primary");
        setA(b, "aria-label", t === "转换" ? "按所选方向转换标点" : "按所选选项规范空白");
      } else if (t === "复制结果" || t === "清空") {
        add(b, "xn-pc-btn");
        setA(b, "aria-label", t === "复制结果" ? "复制处理结果" : "清空输入与结果");
      }
    });
    each(document.querySelectorAll("#root pre"), function (p) { if (vis(p)) add(p, "xn-pc-out"); });
    // 结果区小标题 ①~⑤
    each(document.querySelectorAll("#root div, #root p, #root span, #root h3"), function (e) {
      if (!vis(e) || e.children.length) return;
      var t = clean(e.textContent);
      if (/^[①②③④⑤]\s*\S/.test(t) && t.length <= 18) add(e, "xn-pc-sec");
    });
    // 统计数字
    each(document.querySelectorAll("#root div, #root span, #root dd, #root p"), function (e) {
      if (!vis(e) || e.children.length) return;
      if (e.closest("table, button, pre, textarea")) return;
      var t = clean(e.textContent);
      if (!/^\d[\d,]*$/.test(t)) return;
      var fs = parseFloat(getComputedStyle(e).fontSize);
      if (fs >= 21) add(e, "xn-pc-stat");
      else if (fs >= 16) add(e, "xn-pc-stat-s");
    });
    // 表格
    each(document.querySelectorAll("#root table"), function (tb) {
      if (!vis(tb)) return;
      add(tb, "xn-pc-table");
    });
    each(document.querySelectorAll("#root p, #root li"), function (p) {
      if (vis(p) && parseFloat(getComputedStyle(p).fontSize) <= 13) add(p, "xn-pc-note");
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button"; topBtn.className = "xn-pc-top";
    topBtn.setAttribute("aria-label", "回到顶部"); topBtn.title = "回到顶部"; topBtn.textContent = "↑";
    topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    document.body.appendChild(topBtn);
  }

  function tick() {
    try { markHeads(); markTabs(); markCards(); markText(); markChecks(); markButtons(); ensureTop(); } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", tick, { once: true });
  else tick();
  window.setTimeout(tick, 900);
  window.setTimeout(tick, 2200);
  window.setInterval(tick, 1000);
  document.addEventListener("click", function () { window.setTimeout(tick, 140); }, true);
  document.addEventListener("change", function () { window.setTimeout(tick, 90); }, true);
  var pending = false;
  function schedule() { if (pending) return; pending = true; window.setTimeout(function () { pending = false; tick(); }, 120); }
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
  window.addEventListener("scroll", function () {
    if (!topBtn) return;
    if (window.scrollY > 620) topBtn.classList.add("is-on"); else topBtn.classList.remove("is-on");
  }, { passive: true });
})();
