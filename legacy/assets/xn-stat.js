/* 小凝工具站 · 统计速算增强 xn-stat v1
 * 能力：6 工具锚点 46h/aria-current/横滑；h1 34/h2 20 + 01 徽章；
 *       数字输入 52/22/800 去 spin、下拉 52/16、复制 46；
 *       结果主值 40/800、次值 16/800、小注 13.5；表格表头 12.5/cells 14.5 斑马；
 *       统计方格纸主题 + 回到顶部。
 * 注入：legacy/x85ipscakb.html（xn-ux 之后）。纯增强，不改业务逻辑。
 */
(function () {
  "use strict";
  if (window.__XN_STAT__) return;
  window.__XN_STAT__ = true;
  function vis(el) { return el && el.getBoundingClientRect().height > 0; }
  function clean(t) { return (t || "").replace(/\s+/g, " ").trim(); }
  function each(l, f) { Array.prototype.forEach.call(l, f); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function setA(el, k, v) { if (el.getAttribute(k) !== v) el.setAttribute(k, v); }

  var TABS = ["样本量计算", "A/B 显著性", "描述统计", "相关性", "四分位距", "比例误差"];

  function markHeads() {
    each(document.querySelectorAll("#root h1"), function (h) { if (vis(h)) add(h, "xn-st-h1"); });
    var SUBS = ["输入参数", "计算结果", "抽样建议", "置信度与 Z 值对照表", "计算口径说明", "变异系数（CV）解读参考表"];
    each(document.querySelectorAll("#root p, #root div, #root h3"), function (e) {
      if (!vis(e) || e.children.length) return;
      if (SUBS.indexOf(clean(e.textContent)) >= 0) add(e, "xn-st-h3");
    });
    each(document.querySelectorAll("#root h2"), function (h) {
      if (!vis(h)) return;
      var raw = clean(h.textContent);
      var stripped = raw.replace(/^工具[A-Z]\s*/, "");
      if (stripped !== raw) {
        var no = h.querySelector("span.xn-st-no");
        h.textContent = stripped;
        if (no) h.insertBefore(no, h.firstChild);
      }
      add(h, "xn-st-h2");
      each(h.querySelectorAll("span"), function (s) {
        if (/^\d{2}$/.test(clean(s.textContent))) add(s, "xn-st-no");
      });
    });
  }

  function markTabs() {
    var tabs = [];
    each(document.querySelectorAll("#root a"), function (a) {
      if (!vis(a)) return;
      var t = clean(a.textContent);
      if (TABS.indexOf(t) < 0) return;
      tabs.push(a);
      add(a, "xn-st-tab");
      var on = /border-indigo-600/.test(String(a.className));
      if (on) setA(a, "aria-current", "page");
      else if (a.hasAttribute("aria-current")) a.removeAttribute("aria-current");
      setA(a, "aria-label", "切换到：" + t + "（第 " + (TABS.indexOf(t) + 1) + "/6 个工具）");
      var href = a.getAttribute("href") || "";
      if (href.charAt(0) === "#") setA(a, "role", "tab");
    });
    if (!tabs.length) return;
    var box = tabs[0].parentElement;
    if (!box) return;
    add(box, "xn-st-tabs");
    box.style.setProperty("overflow-x", "auto", "important");
    box.style.setProperty("flex-wrap", "nowrap", "important");
    box.style.setProperty("-webkit-overflow-scrolling", "touch", "important");
  }

  function markCards() {
    each(document.querySelectorAll("#root section"), function (s) {
      if (vis(s)) add(s, "xn-st-card");
    });
  }

  function labelName(el) {
    var lab = el.closest("label");
    var t = clean(lab && lab.textContent);
    if (!t) return "";
    var head = (t.split(/[，,（(]/)[0] || "").trim();
    var name = (head.split(/\s+/)[0] || "").trim();
    if (!name || name.length > 12) name = t.split(/百分数|填|默认|例如|常用/)[0].trim();
    return name.replace(/(百分数|常用|默认|例如|填\s*0?|样本|总体).*$/, "").trim().slice(0, 12) || name.slice(0, 12);
  }

  function markInputs() {
    each(document.querySelectorAll("#root input[type=number]"), function (x) {
      if (!vis(x)) return;
      add(x, "xn-st-num");
      var name = labelName(x);
      if (name) setA(x, "aria-label", name);
    });
    each(document.querySelectorAll("#root input"), function (x) {
      if (!vis(x)) return;
      if ((x.getAttribute("type") || "text").toLowerCase() !== "text") return;
      add(x, "xn-st-textin");
      if (x.style.getPropertyValue("font-size") !== "16px") x.style.setProperty("font-size", "16px", "important");
      var n = labelName(x);
      if (n) setA(x, "aria-label", n);
    });
    each(document.querySelectorAll("#root textarea"), function (t) {
      if (!vis(t)) return;
      add(t, "xn-st-text");
      if (!t.getAttribute("aria-label")) {
        var n = labelName(t);
        if (n) setA(t, "aria-label", n);
      }
    });
    each(document.querySelectorAll("#root select"), function (s) {
      if (!vis(s)) return;
      add(s, "xn-st-select");
      var name = labelName(s);
      if (name) setA(s, "aria-label", name);
    });
  }

  function markButtons() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      if (clean(b.textContent) === "复制结果") { add(b, "xn-st-copy"); setA(b, "aria-label", "复制当前计算结果"); }
    });
  }

  function markNumbers() {
    each(document.querySelectorAll("#root div, #root span, #root dd, #root p"), function (e) {
      if (!vis(e) || e.children.length) return;
      if (e.closest("table") || e.closest("h1,h2,h3,label,button,select,option")) return;
      var t = clean(e.textContent);
      if (!/^[-+]?[\d.,]+\s*%?$/.test(t)) return;
      if (/^\d{2}$/.test(t) && parseFloat(getComputedStyle(e).fontSize) < 13) return;
      var fs = parseFloat(getComputedStyle(e).fontSize);
      if (fs >= 24) add(e, "xn-st-big");
      else if (fs >= 13.5) add(e, "xn-st-mid");
      else if (fs >= 11.5) add(e, "xn-st-mini");
    });
  }

  function markTables() {
    each(document.querySelectorAll("#root table"), function (t) {
      if (!vis(t)) return;
      add(t, "xn-st-table");
      each(t.querySelectorAll("th"), function (h) { add(h, "xn-st-th"); });
      each(t.querySelectorAll("td"), function (d) { add(d, "xn-st-td"); });
    });
  }

  function markNotes() {
    each(document.querySelectorAll("#root p, #root li"), function (p) {
      if (!vis(p)) return;
      var fs = parseFloat(getComputedStyle(p).fontSize);
      if (fs <= 14 && !p.closest("table")) add(p, "xn-st-note");
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button"; topBtn.className = "xn-st-top";
    topBtn.setAttribute("aria-label", "回到顶部"); topBtn.title = "回到顶部"; topBtn.textContent = "↑";
    topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    document.body.appendChild(topBtn);
  }

  function tick() {
    try { markHeads(); markTabs(); markCards(); markInputs(); markButtons(); markNumbers(); markTables(); markNotes(); ensureTop(); } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", tick, { once: true });
  else tick();
  window.setTimeout(tick, 900);
  window.setTimeout(tick, 2200);
  window.setInterval(tick, 1000);
  document.addEventListener("click", function () { window.setTimeout(tick, 140); }, true);
  document.addEventListener("change", function () { window.setTimeout(tick, 80); }, true);
  document.addEventListener("input", function () { window.setTimeout(tick, 80); }, true);
  var pending = false;
  function schedule() { if (pending) return; pending = true; window.setTimeout(function () { pending = false; tick(); }, 120); }
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
  window.addEventListener("scroll", function () {
    if (!topBtn) return;
    if (window.scrollY > 620) topBtn.classList.add("is-on"); else topBtn.classList.remove("is-on");
  }, { passive: true });
})();
