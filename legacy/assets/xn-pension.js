/* 小凝工具站 · 养老与退休金计算增强 xn-pension v1
 * 能力：6 路由导航 44h/aria-current；h1 34/h2 20/h3 14 去「工具A-F」；数字 52/22+读屏名去单位；
 *       结果卡 标签 12.5/值 24/说明 12.5；复制与清空 44；回到顶部。
 * 注入：legacy/samrka9xrs.html（xn-ux 之后）。纯增强，不改业务逻辑。
 */
(function () {
  "use strict";
  if (window.__XN_PENSION__) return;
  window.__XN_PENSION__ = true;
  function vis(el) { return el && el.getBoundingClientRect().height > 0; }
  function clean(t) { return (t || "").replace(/\s+/g, " ").trim(); }
  function each(l, f) { Array.prototype.forEach.call(l, f); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function setA(el, k, v) { if (el.getAttribute(k) !== v) el.setAttribute(k, v); }

  function stripToolPrefix() {
    var walker = document.createTreeWalker(document.querySelector("#root") || document.body, NodeFilter.SHOW_TEXT, null);
    var nodes = [], n;
    while ((n = walker.nextNode())) {
      if (n.parentElement && /^(SCRIPT|STYLE|TEXTAREA|PRE)$/.test(n.parentElement.tagName)) continue;
      if (/工具[A-F]\s*/.test(n.nodeValue)) nodes.push(n);
    }
    each(nodes, function (t) { t.nodeValue = t.nodeValue.replace(/工具[A-F]\s*/g, ""); });
  }

  function markHeads() {
    each(document.querySelectorAll("#root h1"), function (h) { if (vis(h)) add(h, "xn-ry-h1"); });
    each(document.querySelectorAll("#root h2"), function (h) { if (vis(h)) add(h, "xn-ry-h2"); });
    each(document.querySelectorAll("#root h3"), function (h) { if (vis(h)) add(h, "xn-ry-h3"); });
  }

  function markTabs() {
    each(document.querySelectorAll("#root a"), function (a) {
      if (!vis(a)) return;
      var cur = a.getAttribute("aria-current");
      if (cur !== "page" && a.getAttribute("href") && !/^#\//.test(a.getAttribute("href") || "")) return;
      if (!/养老金|退休|护理|医疗|支出/.test(clean(a.textContent))) return;
      add(a, "xn-ry-tab");
      if (a.parentElement) add(a.parentElement, "xn-ry-nav");
      setA(a, "aria-label", "切换到：" + clean(a.textContent));
    });
  }

  function markCards() {
    each(document.querySelectorAll("#root section, #root div"), function (d) {
      if (!vis(d)) return;
      var c = String(d.className);
      if (/bg-white/.test(c) && /rounded/.test(c) && /shadow|border/.test(c)) add(d, "xn-ry-card");
    });
  }

  function markFields() {
    each(document.querySelectorAll("#root input"), function (x) {
      if (!vis(x)) return;
      var ty = (x.getAttribute("type") || "text").toLowerCase();
      if (ty !== "number") return;
      add(x, "xn-ry-num");
      if (x.getAttribute("data-xn-name")) return;
      var aria = x.getAttribute("aria-label") || "";
      if (!aria) return;
      var n = aria.replace(/(万元|元|岁|%)\s*$/, "").trim();
      if (n) { setA(x, "aria-label", n); setA(x, "data-xn-name", "1"); }
    });
    each(document.querySelectorAll("#root select"), function (s) { if (vis(s)) add(s, "xn-ry-select"); });
  }

  function markResults() {
    // 结果项：rounded 卡 > P 标签(12) + P 值(20) + P 说明(12)
    each(document.querySelectorAll("#root div"), function (d) {
      if (!vis(d) || d.children.length !== 3) return;
      var ps = d.children;
      if (ps[0].tagName !== "P" || ps[1].tagName !== "P" || ps[2].tagName !== "P") return;
      var f0 = parseFloat(getComputedStyle(ps[0]).fontSize);
      var f1 = parseFloat(getComputedStyle(ps[1]).fontSize);
      var f2 = parseFloat(getComputedStyle(ps[2]).fontSize);
      if (f0 <= 13 && f1 >= 18 && f2 <= 13) {
        add(d, "xn-ry-item");
        add(ps[0], "xn-ry-k");
        add(ps[1], "xn-ry-v");
        add(ps[2], "xn-ry-note");
      }
    });
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (t === "一键复制") { add(b, "xn-ry-copy"); setA(b, "aria-label", "复制当前计算结果"); }
      else if (t === "清空") { add(b, "xn-ry-clear"); setA(b, "aria-label", "清空当前输入"); }
    });
    each(document.querySelectorAll("#root table"), function (t) { if (vis(t)) add(t, "xn-ry-table"); });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button"; topBtn.className = "xn-ry-top";
    topBtn.setAttribute("aria-label", "回到顶部"); topBtn.title = "回到顶部"; topBtn.textContent = "↑";
    topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    document.body.appendChild(topBtn);
  }

  function tick() {
    try { stripToolPrefix(); markHeads(); markTabs(); markCards(); markFields(); markResults(); ensureTop(); } catch (e) {}
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
