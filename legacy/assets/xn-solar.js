/* 小凝工具站 · 家庭光伏与储能增强 xn-solar v1
 * 能力：6 工具分段导航 44h/aria-current；h1 34/h2 20；数字 52/22；
 *       结果 dt 14/dd 24/800、单位 12.5；复制结果 44；表格与说明；回到顶部。
 * 注入：legacy/jacqamkp5e.html（xn-ux 之后）。纯增强，不改业务逻辑。
 */
(function () {
  "use strict";
  if (window.__XN_SOLAR__) return;
  window.__XN_SOLAR__ = true;
  function vis(el) { return el && el.getBoundingClientRect().height > 0; }
  function clean(t) { return (t || "").replace(/\s+/g, " ").trim(); }
  function each(l, f) { Array.prototype.forEach.call(l, f); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function setA(el, k, v) { if (el.getAttribute(k) !== v) el.setAttribute(k, v); }

  function markHeads() {
    each(document.querySelectorAll("#root h1"), function (h) { if (vis(h)) add(h, "xn-so-h1"); });
    each(document.querySelectorAll("#root h2"), function (h) { if (vis(h)) add(h, "xn-so-h2"); });
  }

  function markTabs() {
    each(document.querySelectorAll("#root a"), function (a) {
      var href = a.getAttribute("href") || "";
      if (!/^#\//.test(href) || !vis(a)) return;
      add(a, "xn-so-tab");
      var box = a.parentElement;
      if (box) add(box, "xn-so-nav");
      // 取桌面端长文案（隐藏的 sm:inline span）作为读屏名
      var spans = a.querySelectorAll("span");
      var name = "";
      each(spans, function (s) {
        var t = clean(s.textContent);
        if (t && t.length > name.length) name = t;
      });
      if (!name) name = clean(a.textContent).slice(0, 10);
      setA(a, "aria-label", "切换到：" + name);
    });
  }

  function markCards() {
    each(document.querySelectorAll("#root section, #root div"), function (d) {
      if (!vis(d)) return;
      var c = String(d.className);
      if (/bg-white/.test(c) && /rounded/.test(c) && /shadow|border/.test(c)) add(d, "xn-so-card");
    });
  }

  function markInputs() {
    each(document.querySelectorAll("#root input"), function (x) {
      if (!vis(x)) return;
      var ty = (x.getAttribute("type") || "text").toLowerCase();
      if (ty !== "number") return;
      add(x, "xn-so-num");
      if (x.getAttribute("data-xn-name")) return;
      // 标签结构：label.block > span.relative > input + 单位 span；取 label 文案并剥离尾部单位
      var lab = x.closest("label") || (x.parentElement && x.parentElement.closest("label"));
      var n = lab ? clean(lab.textContent) : "";
      if (!n) n = clean(x.getAttribute("placeholder") || "");
      n = n.replace(/[（(]?\s*(元|%|kW|kWh|W|度)\s*[/／].*$/i, "").replace(/(小时)\1+/g, "小时").replace(/\s*(kW|kWh|W|%|元|度)\s*$/i, "").trim();
      if (n && n.length <= 14) { setA(x, "aria-label", n); setA(x, "data-xn-name", "1"); }
    });
  }

  function markResults() {
    each(document.querySelectorAll("#root dt"), function (d) { if (vis(d)) add(d, "xn-so-dt"); });
    each(document.querySelectorAll("#root dd"), function (d) { if (vis(d)) add(d, "xn-so-dd"); });
    each(document.querySelectorAll("#root span"), function (s) {
      if (!vis(s) || s.children.length) return;
      if (/^(kWh|元|年|%|度|W|kW)$/i.test(clean(s.textContent))) add(s, "xn-so-unit");
    });
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (t === "复制结果") { add(b, "xn-so-copy"); setA(b, "aria-label", "复制当前计算结果"); }
    });
    each(document.querySelectorAll("#root table"), function (t) { if (vis(t)) add(t, "xn-so-table"); });
    each(document.querySelectorAll("#root p, #root li"), function (p) {
      if (vis(p) && parseFloat(getComputedStyle(p).fontSize) <= 12.5) add(p, "xn-so-note");
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button"; topBtn.className = "xn-so-top";
    topBtn.setAttribute("aria-label", "回到顶部"); topBtn.title = "回到顶部"; topBtn.textContent = "↑";
    topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    document.body.appendChild(topBtn);
  }

  function tick() {
    try { markHeads(); markTabs(); markCards(); markInputs(); markResults(); ensureTop(); } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", tick, { once: true });
  else tick();
  window.setTimeout(tick, 900);
  window.setTimeout(tick, 2200);
  window.setInterval(tick, 1000);
  document.addEventListener("click", function () { window.setTimeout(tick, 140); }, true);
  document.addEventListener("input", function () { window.setTimeout(tick, 100); }, true);
  window.addEventListener("hashchange", function () { window.setTimeout(tick, 140); });
  var pending = false;
  function schedule() { if (pending) return; pending = true; window.setTimeout(function () { pending = false; tick(); }, 120); }
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
  window.addEventListener("scroll", function () {
    if (!topBtn) return;
    if (window.scrollY > 620) topBtn.classList.add("is-on"); else topBtn.classList.remove("is-on");
  }, { passive: true });
})();
