/* 小凝工具站 · 吉他和弦与调试增强 xn-guitar v1
 * 能力：6 路由工具导航 44h/aria-current + 隐藏 #/route 串；h1 34/h2 20 去「工具E」；
 *       文本 52/16、数字 52/22、下拉 52/16；查询 48 主按钮；结果谱纸 pre 15；回到顶部。
 * 注入：legacy/mksvlrrxwr.html（xn-ux 之后）。纯增强，不改业务逻辑。
 */
(function () {
  "use strict";
  if (window.__XN_GUITAR__) return;
  window.__XN_GUITAR__ = true;
  function vis(el) { return el && el.getBoundingClientRect().height > 0; }
  function clean(t) { return (t || "").replace(/\s+/g, " ").trim(); }
  function each(l, f) { Array.prototype.forEach.call(l, f); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function setA(el, k, v) { if (el.getAttribute(k) !== v) el.setAttribute(k, v); }

  function markHeads() {
    each(document.querySelectorAll("#root h1"), function (h) { if (vis(h)) add(h, "xn-gt-h1"); });
    each(document.querySelectorAll("#root h2"), function (h) {
      if (!vis(h)) return;
      var t = clean(h.textContent);
      var s = t.replace(/^工具[A-Z]\s*/, "");
      if (s !== t) h.textContent = s;
      add(h, "xn-gt-h2");
    });
  }

  function stripRoutes(node) {
    each(node.childNodes, function (n) {
      if (n.nodeType === 3) {
        var s = n.textContent.replace(/#\/[\w-]+\s*/g, "").replace(/^工具[A-F]\s*/, "");
        if (s !== n.textContent) n.textContent = s;
      } else if (n.nodeType === 1 && !(n.classList && n.classList.contains("xn-gt-route"))) {
        stripRoutes(n);
      }
    });
  }

  function markTabs() {
    each(document.querySelectorAll("#root a"), function (a) {
      var href = a.getAttribute("href") || "";
      if (!/^#\//.test(href) || !vis(a)) return;
      add(a, "xn-gt-tab");
      stripRoutes(a);
      var label = clean(a.textContent).replace(/#\/[\w-]+/g, "").replace(/^工具[A-F]\s*/, "").trim();
      if (/#\//.test(a.textContent) || /^工具[A-F]/.test(clean(a.textContent))) a.textContent = label;
      if (!a.getAttribute("aria-current")) a.removeAttribute("aria-current");
      setA(a, "aria-label", "切换到：" + label);
      // 隐藏路由串（#/chord 等），避免整页回读出现路由泄漏
      each(a.querySelectorAll("span, code, small"), function (s) {
        if (!s.children.length && /^#\/[\w-]+$/.test(clean(s.textContent))) {
          add(s, "xn-gt-route");
          setA(s, "aria-hidden", "true");
        }
      });
    });
  }

  function markCards() {
    each(document.querySelectorAll("#root section, #root div"), function (d) {
      if (!vis(d)) return;
      var c = String(d.className);
      if (/bg-white/.test(c) && /rounded/.test(c) && /shadow|border/.test(c)) add(d, "xn-gt-card");
    });
  }

  function markInputs() {
    each(document.querySelectorAll("#root input"), function (x) {
      if (!vis(x)) return;
      var ty = (x.getAttribute("type") || "text").toLowerCase();
      if (ty === "number") add(x, "xn-gt-num");
      else if (ty === "text") {
        add(x, "xn-gt-text");
        if (x.style.getPropertyValue("font-size") !== "16px") x.style.setProperty("font-size", "16px", "important");
      }
      if (!x.getAttribute("aria-label")) {
        var lab = x.closest("div") && x.closest("div").querySelector("label");
        var n = clean(lab && lab.textContent).replace(/[（(].*$/, "").trim().slice(0, 16);
        if (n) setA(x, "aria-label", n);
      }
    });
    each(document.querySelectorAll("#root select"), function (s) {
      if (!vis(s)) return;
      add(s, "xn-gt-select");
      if (!s.getAttribute("aria-label")) {
        var lab = s.closest("div") && s.closest("div").querySelector("label");
        var n = clean(lab && lab.textContent).replace(/[（(].*$/, "").trim().slice(0, 12);
        if (n) setA(s, "aria-label", n);
      }
    });
  }

  function markButtons() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (t === "查询") { add(b, "xn-gt-primary"); setA(b, "aria-label", "查询和弦指法"); }
      else if (/复制|清空/.test(t)) { add(b, "xn-gt-btn"); setA(b, "aria-label", t); }
    });
    each(document.querySelectorAll("#root pre"), function (p) { if (vis(p)) add(p, "xn-gt-out"); });
    each(document.querySelectorAll("#root p, #root li"), function (p) {
      if (vis(p) && parseFloat(getComputedStyle(p).fontSize) <= 13) add(p, "xn-gt-note");
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button"; topBtn.className = "xn-gt-top";
    topBtn.setAttribute("aria-label", "回到顶部"); topBtn.title = "回到顶部"; topBtn.textContent = "↑";
    topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    document.body.appendChild(topBtn);
  }

  function tick() {
    try { markHeads(); markTabs(); markCards(); markInputs(); markButtons(); ensureTop(); } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", tick, { once: true });
  else tick();
  window.setTimeout(tick, 900);
  window.setTimeout(tick, 2200);
  window.setInterval(tick, 1000);
  document.addEventListener("click", function () { window.setTimeout(tick, 120); }, true);
  document.addEventListener("input", function () { window.setTimeout(tick, 100); }, true);
  window.addEventListener("hashchange", function () { window.setTimeout(tick, 120); });
  var pending = false;
  function schedule() { if (pending) return; pending = true; window.setTimeout(function () { pending = false; tick(); }, 120); }
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
  window.addEventListener("scroll", function () {
    if (!topBtn) return;
    if (window.scrollY > 620) topBtn.classList.add("is-on"); else topBtn.classList.remove("is-on");
  }, { passive: true });
})();
