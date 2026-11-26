/* 小凝工具站 · 家庭用水与水垢增强 xn-water v1
 * 能力：6 路由导航 44h/aria-current；h1 34/h2 20 并清「工具A-F」；数字 52/22；
 *       下拉 52/16+读屏名；结果标签 12.5/值 24/单位 13；复制/清空 44；回到顶部。
 * 注入：legacy/nynr4epkdd.html（xn-ux 之后）。纯增强，不改业务逻辑。
 */
(function () {
  "use strict";
  if (window.__XN_WATER__) return;
  window.__XN_WATER__ = true;
  function vis(el) { return el && el.getBoundingClientRect().height > 0; }
  function clean(t) { return (t || "").replace(/\s+/g, " ").trim(); }
  function each(l, f) { Array.prototype.forEach.call(l, f); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function setA(el, k, v) { if (el.getAttribute(k) !== v) el.setAttribute(k, v); }

  function markHeads() {
    each(document.querySelectorAll("#root h1"), function (h) { if (vis(h)) add(h, "xn-wt-h1"); });
    each(document.querySelectorAll("#root h2"), function (h) { if (vis(h)) add(h, "xn-wt-h2"); });
  }

  function stripToolPrefix() {
    var walker = document.createTreeWalker(document.querySelector("#root") || document.body, NodeFilter.SHOW_TEXT, null);
    var nodes = [], n;
    while ((n = walker.nextNode())) {
      if (n.parentElement && /^(SCRIPT|STYLE|TEXTAREA|PRE)$/.test(n.parentElement.tagName)) continue;
      if (/工具[A-F]\s*/.test(n.nodeValue)) nodes.push(n);
    }
    each(nodes, function (t) { t.nodeValue = t.nodeValue.replace(/工具[A-F]\s*/g, ""); });
  }

  function markTabs() {
    each(document.querySelectorAll("#root a"), function (a) {
      var href = a.getAttribute("href") || "";
      if (!/^#\//.test(href) || !vis(a)) return;
      add(a, "xn-wt-tab");
      if (a.parentElement) add(a.parentElement, "xn-wt-nav");
      var name = clean(a.textContent).replace(/#\/[\w-]+/g, "").trim();
      if (name) setA(a, "aria-label", "切换到：" + name);
    });
  }

  function markCards() {
    each(document.querySelectorAll("#root section, #root div"), function (d) {
      if (!vis(d)) return;
      var c = String(d.className);
      if (/bg-white/.test(c) && /rounded/.test(c) && /shadow|border/.test(c)) add(d, "xn-wt-card");
    });
  }

  function markInputs() {
    each(document.querySelectorAll("#root input"), function (x) {
      if (!vis(x)) return;
      var ty = (x.getAttribute("type") || "text").toLowerCase();
      if (ty !== "number") return;
      add(x, "xn-wt-num");
      if (x.getAttribute("aria-label") || x.getAttribute("data-xn-name")) return;
      var lab = x.closest("label") || (x.parentElement && x.parentElement.closest("label"));
      var n = lab ? clean(lab.textContent) : "";
      if (!n) {
        var prev = x.previousElementSibling;
        if (prev && prev.tagName === "LABEL") n = clean(prev.textContent);
      }
      n = n.replace(/\s*(mg\/L|L|升|度|元|吨|%)\s*$/i, "").trim();
      if (n && n.length <= 14) { setA(x, "aria-label", n); setA(x, "data-xn-name", "1"); }
    });
  }

  function markSelects() {
    each(document.querySelectorAll("#root select"), function (s) {
      if (!vis(s)) return;
      add(s, "xn-wt-select");
      if (s.getAttribute("data-xn-name")) return;
      var n = "", box = s;
      for (var k = 0; k < 3 && box; k++) {
        var lab = box.querySelector ? box.querySelector("label") : null;
        if (lab && clean(lab.textContent)) { n = clean(lab.textContent); break; }
        var prev = box.previousElementSibling;
        while (prev && !n) {
          if (prev.tagName === "LABEL") n = clean(prev.textContent);
          else if (prev.querySelector) { var l2 = prev.querySelector("label"); if (l2) n = clean(l2.textContent); }
          prev = prev.previousElementSibling;
        }
        if (n) break;
        box = box.parentElement;
      }
      n = n.replace(/\s*(下拉选择|请选择)\s*$/, "").trim();
      if (n && n.length <= 14) { setA(s, "aria-label", n); setA(s, "data-xn-name", "1"); }
    });
  }

  function markResults() {
    each(document.querySelectorAll("#root span"), function (s) {
      if (!vis(s) || s.children.length) return;
      var t = clean(s.textContent);
      if (t === "计算结果") add(s, "xn-wt-sec");
      else if (/^(个月\s*\/\s*次|个月|次|元|吨|升|度|%)$/.test(t)) add(s, "xn-wt-u");
    });
    each(document.querySelectorAll("#root p, #root span, #root div"), function (p) {
      if (!vis(p) || p.children.length > 1) return;
      var fs = parseFloat(getComputedStyle(p).fontSize);
      var tx = clean(p.textContent);
      if (fs <= 12 && parseFloat(getComputedStyle(p).fontWeight) >= 600 && tx.length <= 12 && !/^[\d.,]/.test(tx)) add(p, "xn-wt-k");
      else if (p.tagName !== "SPAN" && fs <= 12.5 && tx.length > 12) add(p, "xn-wt-note");
    });
    each(document.querySelectorAll("#root span"), function (s) {
      if (!vis(s) || s.children.length) return;
      var fs = parseFloat(getComputedStyle(s).fontSize);
      if (fs >= 18 && fs <= 22 && clean(s.textContent).length <= 16) add(s, "xn-wt-v");
    });
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (t === "一键复制") { add(b, "xn-wt-copy"); setA(b, "aria-label", "复制当前计算结果"); }
      else if (t === "清空") { add(b, "xn-wt-clear"); setA(b, "aria-label", "清空当前输入"); }
    });
    each(document.querySelectorAll("#root table"), function (t) { if (vis(t)) add(t, "xn-wt-table"); });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button"; topBtn.className = "xn-wt-top";
    topBtn.setAttribute("aria-label", "回到顶部"); topBtn.title = "回到顶部"; topBtn.textContent = "↑";
    topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    document.body.appendChild(topBtn);
  }

  function tick() {
    try { stripToolPrefix(); markHeads(); markTabs(); markCards(); markInputs(); markSelects(); markResults(); ensureTop(); } catch (e) {}
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
