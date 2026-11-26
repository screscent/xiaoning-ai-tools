/* 小凝工具站 · 中英混排与引用一致性增强 xn-typeset v1
 * 能力：2 工具标签 46h/aria-pressed；h1 34/h2 20、小节 16；
 *       输入/输出文本域 ≥250/15.5（只读虚线稿纸底）；
 *       4 个规则开关 54×32 role=switch/aria-checked + 具名；
 *       检查 48 主按钮、其余 46；统计 24/800；回到顶部。
 * 注入：legacy/j258a6xyyi.html（xn-ux 之后）。纯增强，不改业务逻辑。
 */
(function () {
  "use strict";
  if (window.__XN_TYPESET__) return;
  window.__XN_TYPESET__ = true;
  function vis(el) { return el && el.getBoundingClientRect().height > 0; }
  function clean(t) { return (t || "").replace(/\s+/g, " ").trim(); }
  function each(l, f) { Array.prototype.forEach.call(l, f); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function setA(el, k, v) { if (el.getAttribute(k) !== v) el.setAttribute(k, v); }

  function markHeads() {
    each(document.querySelectorAll("#root h1"), function (h) { if (vis(h)) add(h, "xn-ts-h1"); });
    each(document.querySelectorAll("#root h2"), function (h) {
      if (!vis(h)) return;
      add(h, "xn-ts-h2");
      if (parseFloat(getComputedStyle(h).fontSize) <= 17) add(h, "xn-ts-h3");
    });
  }

  function markTabs() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (!/^[①②]\s*(中英混排|引用一致性)$/.test(t)) return;
      add(b, "xn-ts-tab");
      var on = /bg-blue-50|bg-indigo-50/.test(String(b.className));
      setA(b, "aria-pressed", on ? "true" : "false");
      setA(b, "aria-label", "切换到：" + t.replace(/^[①②]\s*/, ""));
    });
  }

  function markCards() {
    each(document.querySelectorAll("#root div, #root section"), function (d) {
      if (!vis(d)) return;
      var c = String(d.className);
      if (/bg-white/.test(c) && /rounded/.test(c) && /shadow|border/.test(c)) add(d, "xn-ts-card");
    });
  }

  function markText() {
    each(document.querySelectorAll("#root textarea"), function (t) {
      if (!vis(t)) return;
      add(t, "xn-ts-text");
      if (t.readOnly) add(t, "xn-ts-out");
      var name = "";
      var box = t.parentElement;
      for (var i = 0; i < 3 && box; i++) {
        var h = box.querySelector("h2, h3");
        if (h && clean(h.textContent)) { name = clean(h.textContent).slice(0, 20); break; }
        box = box.parentElement;
      }
      if (!name) {
        var lab = t.closest("div") && t.closest("div").querySelector("label");
        name = clean(lab && lab.textContent).slice(0, 16);
      }
      setA(t, "aria-label", name || (t.readOnly ? "格式化结果（只读）" : "排版文本输入"));
    });
  }

  function rowName(b) {
    var box = b.closest("div");
    var t = clean(box && box.textContent).replace(/\s*(已开启|已关闭)\s*$/, "");
    t = t.split(/例如[:：]?/)[0];
    t = t.split(/\s+/)[0];
    return t.trim().slice(0, 16);
  }

  var SWITCH_NAMES = ["中文与英文之间加空格", "中文与数字之间加空格", "全角标点转半角", "连续空格压缩"];

  function markSwitches() {
    var idx = 0;
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (t !== "已开启" && t !== "已关闭") return;
      add(b, "xn-ts-switch");
      setA(b, "role", "switch");
      setA(b, "aria-checked", t === "已开启" ? "true" : "false");
      var n = SWITCH_NAMES[idx] || rowName(b);
      idx++;
      if (n) setA(b, "aria-label", n);
    });
  }

  function markButtons() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (t === "检查") { add(b, "xn-ts-primary"); setA(b, "aria-label", "检查引用编号一致性"); }
      else if (["载入示例", "清空输入", "复制结果", "还原原文", "清空"].indexOf(t) >= 0) {
        add(b, "xn-ts-btn");
        setA(b, "aria-label", t + "（当前工具）");
      }
    });
    each(document.querySelectorAll("#root div, #root span, #root dd, #root p"), function (e) {
      if (!vis(e) || e.children.length) return;
      if (e.closest("button, pre, textarea")) return;
      var t = clean(e.textContent);
      if (!/^\d[\d,]*$/.test(t)) return;
      if (parseFloat(getComputedStyle(e).fontSize) >= 18) add(e, "xn-ts-stat");
    });
    each(document.querySelectorAll("#root p, #root li, #root span"), function (p) {
      if (!vis(p) || p.children.length) return;
      var t = clean(p.textContent);
      if (/^\d+\s*字符\s*·\s*\d+\s*行$/.test(t)) add(p, "xn-ts-note");
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button"; topBtn.className = "xn-ts-top";
    topBtn.setAttribute("aria-label", "回到顶部"); topBtn.title = "回到顶部"; topBtn.textContent = "↑";
    topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    document.body.appendChild(topBtn);
  }

  function tick() {
    try { markHeads(); markTabs(); markCards(); markText(); markSwitches(); markButtons(); ensureTop(); } catch (e) {}
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
