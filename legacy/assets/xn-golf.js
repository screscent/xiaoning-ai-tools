/* 小凝工具站 · 高尔夫入门与打球成本增强 xn-golf v1
 * 能力：6 路由导航 44h/当前态；h1 34/h2 20；数字 52/22+读屏名；下拉 52/16；
 *       主按钮 48/复制 44；结果总额 30/800、分项 22/800、说明 12；费用构成条。
 * 注入：legacy/samava9xrs.html（xn-ux 之后）。纯增强，不改业务逻辑。
 */
(function () {
  "use strict";
  if (window.__XN_GOLF__) return;
  window.__XN_GOLF__ = true;
  function vis(el) { return el && el.getBoundingClientRect().height > 0; }
  function clean(t) { return (t || "").replace(/\s+/g, " ").trim(); }
  function each(l, f) { Array.prototype.forEach.call(l, f); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function setA(el, k, v) { if (el.getAttribute(k) !== v) el.setAttribute(k, v); }

  function markHeads() {
    each(document.querySelectorAll("#root h1"), function (h) { if (vis(h)) add(h, "xn-gf-h1"); });
    each(document.querySelectorAll("#root h2"), function (h) { if (vis(h)) add(h, "xn-gf-h2"); });
  }

  function markNav() {
    each(document.querySelectorAll("#root a"), function (a) {
      var href = a.getAttribute("href") || "";
      if (!/^#\/.+/.test(href) || !vis(a)) return;
      add(a, "xn-gf-tab");
      if (a.parentElement) add(a.parentElement, "xn-gf-nav");
      var on = /bg-\[#f7f3e4\]/.test(String(a.className)) || (/font-semibold/.test(String(a.className)) && !/font-medium/.test(String(a.className)));
      if (on) add(a, "is-on"); else a.classList.remove("is-on");
      setA(a, "aria-current", on ? "page" : "false");
      setA(a, "aria-label", "切换到：" + clean(a.textContent));
    });
  }

  function markCards() {
    each(document.querySelectorAll("#root section, #root div"), function (d) {
      if (!vis(d)) return;
      var c = String(d.className);
      if (/bg-white/.test(c) && /rounded/.test(c) && /shadow|border/.test(c)) add(d, "xn-gf-card");
    });
  }

  function fieldName(x) {
    var box = x.parentElement, n = "";
    for (var k = 0; k < 3 && box; k++) {
      var t = clean(box.textContent);
      t = t.replace(/\s*(元\/颗|元\/洞|元|颗|次)\s*$/, "").trim();
      if (t && t.length >= 2 && t.length <= 14 && !/^[\d.,\s]+$/.test(t)) { n = t; break; }
      box = box.parentElement;
    }
    return n;
  }

  function markFields() {
    each(document.querySelectorAll("#root input"), function (x) {
      if (!vis(x)) return;
      var ty = (x.getAttribute("type") || "text").toLowerCase();
      if (ty !== "number") return;
      add(x, "xn-gf-num");
      if (x.getAttribute("data-xn-name")) return;
      var aria = x.getAttribute("aria-label") || "";
      if (!aria || /^(元|颗|次|元\/颗|元\/洞)$/.test(aria)) {
        var n = fieldName(x);
        if (n) { setA(x, "aria-label", n); setA(x, "data-xn-name", "1"); }
      }
    });
    each(document.querySelectorAll("#root select"), function (s) {
      if (!vis(s)) return;
      add(s, "xn-gf-select");
      if (s.getAttribute("data-xn-name")) return;
      var aria = s.getAttribute("aria-label") || "";
      var n = "";
      if (!aria || aria.length <= 2 || /[\/]/.test(aria)) {
        var box = s.getBoundingClientRect(), best = null, bestGap = 1e9;
        each(document.querySelectorAll("#root label"), function (l) {
          var r = l.getBoundingClientRect();
          if (!r.height) return;
          var gap = box.top - r.bottom;
          if (gap >= -4 && gap < 220 && Math.abs(r.left - box.left) < 80 && gap < bestGap) { bestGap = gap; best = l; }
        });
        if (best) n = clean(best.textContent);
        if (!n) n = fieldName(s);
        if (n && !/[\/]/.test(n)) { setA(s, "aria-label", n); setA(s, "data-xn-name", "1"); }
      }
    });
  }

  function markResults() {
    var totalDone = false;
    each(document.querySelectorAll(".xn-gf-total"), function (e) { e.classList.remove("xn-gf-total"); });
    each(document.querySelectorAll("#root div, #root span"), function (e) {
      if (!vis(e) || e.children.length > 1) return;
      var t = clean(e.textContent);
      if (!t) return;
      var fs = parseFloat(getComputedStyle(e).fontSize);
      if (fs >= 28) return;
      if (!totalDone && e.tagName === "DIV" && /^[\d,.]+\s*元$/.test(t) && fs >= 20) { add(e, "xn-gf-total"); totalDone = true; return; }
      if (e.tagName === "DIV" && /^[\d,.]+\s*(元|元\/洞)$/.test(t) && fs >= 15) { add(e, "xn-gf-val"); return; }
      if ((e.tagName === "DIV" || e.tagName === "P") && fs <= 12 && t.length > 6) add(e, "xn-gf-note");
      if (e.tagName === "SPAN" && fs >= 13 && fs <= 14 && t.length <= 12 && !/^[\d.,]/.test(t)) add(e, "xn-gf-sec");
    });
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (/计\s*算|定位结果/.test(t)) add(b, "xn-gf-btn");
      else if (t === "复制结果") { add(b, "xn-gf-copy"); setA(b, "aria-label", "复制当前计算结果"); }
    });
    each(document.querySelectorAll("#root div[style*='width']"), function (d) {
      if (!vis(d) || parseFloat(getComputedStyle(d).height) > 22) return;
      if (d.parentElement) add(d.parentElement, "xn-gf-bar");
    });
    each(document.querySelectorAll("#root table"), function (t) { if (vis(t)) add(t, "xn-gf-table"); });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button"; topBtn.className = "xn-gf-top";
    topBtn.setAttribute("aria-label", "回到顶部"); topBtn.title = "回到顶部"; topBtn.textContent = "↑";
    topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    document.body.appendChild(topBtn);
  }

  function tick() {
    try { markHeads(); markNav(); markCards(); markFields(); markResults(); ensureTop(); } catch (e) {}
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
