/* 小凝工具站 · 隐私与合规文档合集增强 xn-legal v1
 * 能力：6 路由导航 44h/aria-current；h1 34/h2 20；文本输入 52/16；多选 chips 44h；
 *       主按钮 48/次按钮 44；结果文本域 360/14.5+读屏名；章节/字数徽章 16/800；回到顶部。
 * 注入：legacy/wn5xhmj8gw.html（xn-ux 之后）。纯增强，不改业务逻辑。
 */
(function () {
  "use strict";
  if (window.__XN_LEGAL__) return;
  window.__XN_LEGAL__ = true;
  function vis(el) { return el && el.getBoundingClientRect().height > 0; }
  function clean(t) { return (t || "").replace(/\s+/g, " ").trim(); }
  function each(l, f) { Array.prototype.forEach.call(l, f); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function setA(el, k, v) { if (el.getAttribute(k) !== v) el.setAttribute(k, v); }

  function markHeads() {
    each(document.querySelectorAll("#root h1"), function (h) { if (vis(h)) add(h, "xn-lg-h1"); });
    each(document.querySelectorAll("#root h2"), function (h) { if (vis(h)) add(h, "xn-lg-h2"); });
  }

  function markTabs() {
    each(document.querySelectorAll("#root a"), function (a) {
      var href = a.getAttribute("href") || "";
      if (!/^#\/.+/.test(href) || !vis(a)) return;
      add(a, "xn-lg-tab");
      if (a.parentElement) add(a.parentElement, "xn-lg-nav");
      setA(a, "aria-label", "切换到：" + clean(a.textContent));
    });
  }

  function markCards() {
    each(document.querySelectorAll("#root section, #root div"), function (d) {
      if (!vis(d)) return;
      var c = String(d.className);
      if (/bg-white/.test(c) && /rounded/.test(c) && /shadow|border/.test(c)) add(d, "xn-lg-card");
    });
  }

  function markFields() {
    each(document.querySelectorAll("#root input"), function (x) {
      if (!vis(x)) return;
      var ty = (x.getAttribute("type") || "text").toLowerCase();
      if (ty === "text") { add(x, "xn-lg-text"); x.style.setProperty("font-size", "16px", "important"); x.style.setProperty("height", "52px", "important"); }
      else if (ty === "number") add(x, "xn-lg-num");
    });
    each(document.querySelectorAll("#root select"), function (s) { if (vis(s)) add(s, "xn-lg-select"); });
    each(document.querySelectorAll("#root textarea"), function (t) {
      if (!vis(t)) return;
      add(t, "xn-lg-area");
      setA(t, "aria-label", "生成的文档正文");
    });
  }

  function markChips() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b) || !b.hasAttribute("aria-pressed")) return;
      add(b, "xn-lg-chip");
    });
  }

  function markButtons() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (/^生成/.test(t)) add(b, "xn-lg-primary");
      else if (t === "复制正文" || t === "下载 Markdown" || t === "重置") {
        add(b, "xn-lg-btn");
        if (t === "重置") add(b, "xn-lg-danger");
        if (t === "复制正文") setA(b, "aria-label", "复制生成的文档正文");
      }
    });
  }

  function markStats() {
    each(document.querySelectorAll("#root span"), function (s) {
      if (!vis(s)) return;
      if (s.querySelector && s.querySelector("span.tabular-nums") && /^(章节数|字数)/.test(clean(s.textContent))) add(s, "xn-lg-pill");
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button"; topBtn.className = "xn-lg-top";
    topBtn.setAttribute("aria-label", "回到顶部"); topBtn.title = "回到顶部"; topBtn.textContent = "↑";
    topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    document.body.appendChild(topBtn);
  }

  function tick() {
    try { markHeads(); markTabs(); markCards(); markFields(); markChips(); markButtons(); markStats(); ensureTop(); } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", tick, { once: true });
  else tick();
  window.setTimeout(tick, 900);
  window.setTimeout(tick, 2200);
  window.setInterval(tick, 1000);
  document.addEventListener("click", function () { window.setTimeout(tick, 140); }, true);
  document.addEventListener("input", function () { window.setTimeout(tick, 100); }, true);
  document.addEventListener("change", function () { window.setTimeout(tick, 100); }, true);
  window.addEventListener("hashchange", function () { window.setTimeout(tick, 140); });
  var pending = false;
  function schedule() { if (pending) return; pending = true; window.setTimeout(function () { pending = false; tick(); }, 120); }
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
  window.addEventListener("scroll", function () {
    if (!topBtn) return;
    if (window.scrollY > 620) topBtn.classList.add("is-on"); else topBtn.classList.remove("is-on");
  }, { passive: true });
})();
