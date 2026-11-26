/* 小凝工具站 · XML 格式化与压缩转义增强 xn-xml v1
 * 能力：2 工具标签 46h/aria-pressed；h1 34/h2 20；
 *       XML 文本域 ≥250/15 等宽；缩进下拉 52/16；
 *       属性换行/保留注释开关 54×32 role=switch/aria-checked；
 *       格式化 48 主按钮、压缩成一行/压缩/实体转义/还原 46 具名；回到顶部。
 * 注入：legacy/tbndpgmk3t.html（xn-ux 之后）。纯增强，不改业务逻辑。
 */
(function () {
  "use strict";
  if (window.__XN_XML__) return;
  window.__XN_XML__ = true;
  function vis(el) { return el && el.getBoundingClientRect().height > 0; }
  function clean(t) { return (t || "").replace(/\s+/g, " ").trim(); }
  function each(l, f) { Array.prototype.forEach.call(l, f); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function setA(el, k, v) { if (el.getAttribute(k) !== v) el.setAttribute(k, v); }

  var TABS = ["XML 格式化", "压缩转义"];

  function markHeads() {
    each(document.querySelectorAll("#root h1"), function (h) { if (vis(h)) add(h, "xn-xm-h1"); });
    each(document.querySelectorAll("#root h2"), function (h) { if (vis(h)) add(h, "xn-xm-h2"); });
  }

  function markTabs() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (TABS.indexOf(t) < 0) return;
      add(b, "xn-xm-tab");
      var on = /bg-blue-600/.test(String(b.className));
      setA(b, "aria-pressed", on ? "true" : "false");
      setA(b, "aria-label", "切换到：" + t + "（第 " + (TABS.indexOf(t) + 1) + "/2 个工具）");
    });
  }

  function markCards() {
    each(document.querySelectorAll("#root div"), function (d) {
      if (!vis(d)) return;
      var c = String(d.className);
      if (/bg-white/.test(c) && /rounded-xl/.test(c) && /shadow/.test(c)) add(d, "xn-xm-card");
    });
  }

  function markInputs() {
    each(document.querySelectorAll("#root textarea"), function (t) {
      if (!vis(t)) return;
      add(t, "xn-xm-text");
      if (!t.getAttribute("aria-label")) setA(t, "aria-label", "XML 文本");
    });
    each(document.querySelectorAll("#root select"), function (s) {
      if (!vis(s)) return;
      add(s, "xn-xm-select");
      if (!s.getAttribute("aria-label")) {
        var lab = s.closest("div");
        var n = clean(lab && lab.textContent).split(/[:：]/)[0].replace(/缩进方式.*/, "缩进方式").slice(0, 10);
        setA(s, "aria-label", n || "缩进方式");
      }
    });
  }

  function markSwitches() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var c = String(b.className);
      if (!/relative inline-flex/.test(c) || /xn-xm-/.test(c)) return;
      if (clean(b.textContent)) return;
      add(b, "xn-xm-switch");
      var knob = b.querySelector("span");
      var on = /bg-blue-600|bg-green-500|bg-emerald-500/.test(c) || (knob && /translate-x-[4-9]/.test(String(knob.className)));
      setA(b, "role", "switch");
      setA(b, "aria-checked", on ? "true" : "false");
      var box = b.closest("div");
      var lab = box ? clean(box.textContent).replace(/\s+/g, "") : "";
      if (lab) setA(b, "aria-label", lab.slice(0, 10));
    });
  }

  function markButtons() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (t === "格式化") {
        add(b, "xn-xm-primary"); setA(b, "aria-label", "按当前缩进方式格式化 XML");
      } else if (t === "压缩成一行") {
        add(b, "xn-xm-btn"); setA(b, "aria-label", "把 XML 压缩成一行");
      } else if (t === "压缩") {
        add(b, "xn-xm-btn"); setA(b, "aria-label", "压缩 XML 空白");
      } else if (t === "实体转义") {
        add(b, "xn-xm-btn"); setA(b, "aria-label", "把 XML 特殊字符转义为实体");
      } else if (t === "还原") {
        add(b, "xn-xm-btn"); setA(b, "aria-label", "把实体还原为原始字符");
      }
    });
    each(document.querySelectorAll("#root pre"), function (p) {
      if (vis(p)) add(p, "xn-xm-pre");
    });
    each(document.querySelectorAll("#root h3"), function (h) {
      if (vis(h)) add(h, "xn-xm-h3");
    });
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (t === "复制" || t === "复制结果") {
        add(b, "xn-xm-mini");
        setA(b, "aria-label", "复制结果 XML");
      } else if (t === "复制格式化结果") {
        add(b, "xn-xm-btn"); setA(b, "aria-label", "复制格式化后的 XML");
      } else if (t === "清空") {
        add(b, "xn-xm-btn"); setA(b, "aria-label", "清空输入与结果");
      }
    });
    each(document.querySelectorAll("#root div, #root span, #root dd"), function (e) {
      if (!vis(e) || e.children.length) return;
      if (e.closest("pre, table")) return;
      var t = clean(e.textContent);
      var fs = parseFloat(getComputedStyle(e).fontSize);
      if (/^\d+$/.test(t) && fs >= 18) add(e, "xn-xm-stat");
      else if (/^\d+(\.\d+)?\s*(B|KB|%|个)$/i.test(t) && fs <= 16) add(e, "xn-xm-stat-s");
    });
    each(document.querySelectorAll("#root p, #root li"), function (p) {
      if (vis(p) && parseFloat(getComputedStyle(p).fontSize) <= 14) add(p, "xn-xm-note");
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button"; topBtn.className = "xn-xm-top";
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
  document.addEventListener("click", function () { window.setTimeout(tick, 120); }, true);
  document.addEventListener("change", function () { window.setTimeout(tick, 80); }, true);
  var pending = false;
  function schedule() { if (pending) return; pending = true; window.setTimeout(function () { pending = false; tick(); }, 120); }
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
  window.addEventListener("scroll", function () {
    if (!topBtn) return;
    if (window.scrollY > 620) topBtn.classList.add("is-on"); else topBtn.classList.remove("is-on");
  }, { passive: true });
})();
