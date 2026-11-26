/* 小凝工具站 · 转义与码点工具增强 xn-codepoint v1
 * 能力：6 标签 48h/aria-current/具名；h2 20；textarea 140/16；
 *       结果 pre 14.5 终端深底；统计数字 18/800；动作 chip 44、复制/清空 46、迷你复制 44；
 *       面板卡/使用说明/回到顶部。
 * 注入：legacy/qse8urnhme.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_CODEPOINT__) return;
  window.__XN_CODEPOINT__ = true;
  function vis(el) { return el && el.getBoundingClientRect().height > 0; }
  function clean(t) { return (t || "").replace(/\s+/g, " ").trim(); }
  function each(l, f) { Array.prototype.forEach.call(l, f); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function setA(el, v) { if (el.getAttribute("aria-label") !== v) el.setAttribute("aria-label", v); }

  var TABS = ["Unicode 转义", "反转义", "HTML 实体", "码点统计", "安全转义", "正则转义与常用式"];

  function currentTab() {
    var h = location.hash;
    if (h.indexOf("unescape") >= 0) return "反转义";
    if (h.indexOf("entity") >= 0) return "HTML 实体";
    if (h.indexOf("codepoint") >= 0) return "码点统计";
    if (h.indexOf("xss") >= 0) return "安全转义";
    if (h.indexOf("regex") >= 0) return "正则转义与常用式";
    return "Unicode 转义";
  }

  function markTabs() {
    var cur = currentTab();
    var grids = document.querySelectorAll('#root div[class*="grid-cols-3"]');
    each(grids, function (g) {
      var leaves = [].slice.call(g.querySelectorAll("a,button,span,div")).filter(function (e) {
        var t = clean(e.textContent);
        return e.children.length === 0 && (TABS.indexOf(t) >= 0 || t === "Unicode");
      });
      if (leaves.length < 4) return;
      add(g, "xn-cp-tabs");
      var cols = window.matchMedia("(max-width: 420px)").matches ? "repeat(2, minmax(0,1fr))"
        : (window.matchMedia("(min-width: 640px)").matches ? "repeat(6, minmax(0,1fr))" : "repeat(3, minmax(0,1fr))");
      g.style.setProperty("grid-template-columns", cols, "important");
      leaves.forEach(function (e) {
        var t = clean(e.textContent);
        if (t === "Unicode") { t = "Unicode 转义"; if (clean(e.textContent) !== t) e.textContent = t; }
        add(e, "xn-cp-tab");
        setA(e, "切换到：" + t + "（工具 " + (TABS.indexOf(t) + 1) + "）");
        if (t === cur) { if (e.getAttribute("aria-current") !== "page") e.setAttribute("aria-current", "page"); }
        else if (e.hasAttribute("aria-current")) e.removeAttribute("aria-current");
      });
    });
  }

  function markHeads() {
    each(document.querySelectorAll("#root h2"), function (h) {
      if (!vis(h)) return;
      add(h, "xn-cp-h2");
      var card = h.closest('div[class*="bg-white"]');
      if (card) add(card, "xn-cp-card");
    });
  }

  function markInputs() {
    each(document.querySelectorAll("#root textarea"), function (t) {
      if (!vis(t)) return;
      add(t, "xn-cp-text");
      var a = clean(t.getAttribute("aria-label")) || "输入文本";
      setA(t, a);
    });
  }

  function markOutputs() {
    each(document.querySelectorAll("#root pre"), function (p) {
      if (vis(p)) add(p, "xn-cp-pre");
    });
    each(document.querySelectorAll("#root span, #root div"), function (e) {
      if (!vis(e) || e.children.length) return;
      var t = clean(e.textContent);
      if (/^\d{1,6}$/.test(t) && parseFloat(getComputedStyle(e).fontSize) >= 13) add(e, "xn-cp-num");
    });
  }

  var CHIP = ["全部转义", "保留中文", "编码", "解码", "正则字面量", "替换串", "URL 参数", "SQL 片段",
    "邮箱", "手机号（大陆）", "身份证（18 位）", "金额", "日期（YYYY-MM-DD）"];

  function markButtons() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (t === "复制结果") {
        add(b, "xn-cp-btn"); add(b, "xn-cp-btn-primary"); setA(b, "复制结果");
      } else if (t === "清空") {
        add(b, "xn-cp-btn"); setA(b, "清空输入与结果");
      } else if (t === "复制") {
        add(b, "xn-cp-mini"); setA(b, "复制该结果");
      } else if (CHIP.indexOf(t) >= 0) {
        add(b, "xn-cp-chip"); setA(b, "执行：" + t);
      }
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button"; topBtn.className = "xn-cp-top";
    topBtn.setAttribute("aria-label", "回到顶部"); topBtn.title = "回到顶部"; topBtn.textContent = "↑";
    topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    document.body.appendChild(topBtn);
  }

  function tick() { try { markTabs(); markHeads(); markInputs(); markOutputs(); markButtons(); ensureTop(); } catch (e) {} }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", tick, { once: true }); else tick();
  window.setTimeout(tick, 900); window.setTimeout(tick, 2200); window.setInterval(tick, 1000);
  document.addEventListener("click", function () { window.setTimeout(tick, 200); }, true);
  window.addEventListener("hashchange", function () { window.setTimeout(tick, 120); });
  var pending = false;
  function schedule() { if (pending) return; pending = true; window.setTimeout(function () { pending = false; tick(); }, 120); }
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
  window.addEventListener("scroll", function () { if (!topBtn) return; if (window.scrollY > 620) topBtn.classList.add("is-on"); else topBtn.classList.remove("is-on"); }, { passive: true });
})();
