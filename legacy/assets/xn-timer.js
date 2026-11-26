/* 小凝工具站 · 文字朗读与倒计时增强 xn-timer v1
 * 能力：2 页签 44h/当前态；h1 34/h2 20；文本域 220/16；下拉 52/16+读屏名修正；
 *       滑块 44h+刻度 12.5；主按钮 48/次按钮 44；倒计时清单值 16.5/800。
 * 注入：legacy/wn3agsj8gw.html（xn-ux 之后）。纯增强，不改业务逻辑。
 */
(function () {
  "use strict";
  if (window.__XN_TIMER__) return;
  window.__XN_TIMER__ = true;
  function vis(el) { return el && el.getBoundingClientRect().height > 0; }
  function clean(t) { return (t || "").replace(/\s+/g, " ").trim(); }
  function each(l, f) { Array.prototype.forEach.call(l, f); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function setA(el, k, v) { if (el.getAttribute(k) !== v) el.setAttribute(k, v); }

  function markHeads() {
    each(document.querySelectorAll("#root h1"), function (h) { if (vis(h)) add(h, "xn-tt-h1"); });
    each(document.querySelectorAll("#root h2"), function (h) { if (vis(h)) add(h, "xn-tt-h2"); });
  }

  function markTabs() {
    var names = { "文字朗读": 1, "倒计时": 1 };
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (!names[t]) return;
      add(b, "xn-tt-tab");
      var cls = String(b.className);
      var on = /border-blue-600/.test(cls) && /text-blue-600/.test(cls);
      if (on) add(b, "is-on"); else b.classList.remove("is-on");
      setA(b, "aria-selected", on ? "true" : "false");
      setA(b, "role", "tab");
      if (b.parentElement) add(b.parentElement, "xn-tt-tabs");
      setA(b, "aria-label", "切换到：" + t);
    });
  }

  function markCards() {
    each(document.querySelectorAll("#root section, #root div"), function (d) {
      if (!vis(d)) return;
      var c = String(d.className);
      if (/bg-white/.test(c) && /rounded/.test(c) && /shadow|border/.test(c)) add(d, "xn-tt-card");
    });
  }

  function markFields() {
    each(document.querySelectorAll("#root textarea"), function (t) {
      if (!vis(t)) return;
      add(t, "xn-tt-area");
      if (!t.getAttribute("aria-label")) setA(t, "aria-label", "朗读文本");
      else setA(t, "aria-label", "朗读文本");
    });
    each(document.querySelectorAll("#root select"), function (s) {
      if (!vis(s)) return;
      add(s, "xn-tt-select");
      var aria = s.getAttribute("aria-label") || "";
      if (!aria || aria === "朗读文本" || s.options.length > 50) setA(s, "aria-label", "音色选择");
    });
    each(document.querySelectorAll("#root input"), function (x) {
      if (!vis(x)) return;
      var ty = (x.getAttribute("type") || "text").toLowerCase();
      if (ty === "range") { add(x, "xn-tt-range"); return; }
      if (ty === "text") { add(x, "xn-tt-text"); if (!x.getAttribute("aria-label")) setA(x, "aria-label", "事项名称"); }
      else if (ty === "datetime-local") { add(x, "xn-tt-dt"); if (!x.getAttribute("aria-label")) setA(x, "aria-label", "截止日期时间"); }
    });
    each(document.querySelectorAll("#root span"), function (s) {
      if (!vis(s) || s.children.length) return;
      var t = clean(s.textContent);
      if (/^[\d.]+x$/.test(t)) {
        add(s, "xn-tt-scale");
        if (parseFloat(getComputedStyle(s).fontWeight) >= 600) add(s, "is-on");
      }
    });
  }

  function markButtons() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (t === "开始朗读" || t === "添加") { add(b, "xn-tt-primary"); return; }
      if (["继续", "停止", "复制文本", "清空", "复制清单"].indexOf(t) >= 0) {
        add(b, "xn-tt-btn");
        if (t === "清空") add(b, "xn-tt-danger");
        if (t === "复制文本") setA(b, "aria-label", "复制当前朗读文本");
        if (t === "复制清单") setA(b, "aria-label", "复制倒计时清单");
      }
    });
  }

  function markList() {
    each(document.querySelectorAll("#root span"), function (s) {
      if (!vis(s) || s.children.length) return;
      var t = clean(s.textContent);
      if (/^\d+\s*天/.test(t) || /^\d+\s*(小时|分)/.test(t)) {
        add(s, "xn-tt-time");
        var box = s.parentElement;
        for (var i = 0; i < 3 && box; i++) {
          if (/border|bg-/.test(String(box.className))) { add(box, "xn-tt-item"); break; }
          box = box.parentElement;
        }
      }
      if (/^已添加\s*\d+\s*项$/.test(t)) add(s, "xn-tt-count");
      if (t === "最近") add(s, "xn-tt-badge");
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button"; topBtn.className = "xn-tt-top";
    topBtn.setAttribute("aria-label", "回到顶部"); topBtn.title = "回到顶部"; topBtn.textContent = "↑";
    topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    document.body.appendChild(topBtn);
  }

  function tick() {
    try { markHeads(); markTabs(); markCards(); markFields(); markButtons(); markList(); ensureTop(); } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", tick, { once: true });
  else tick();
  window.setTimeout(tick, 900);
  window.setTimeout(tick, 2200);
  window.setInterval(tick, 1000);
  document.addEventListener("click", function () { window.setTimeout(tick, 140); }, true);
  document.addEventListener("input", function () { window.setTimeout(tick, 100); }, true);
  document.addEventListener("change", function () { window.setTimeout(tick, 100); }, true);
  var pending = false;
  function schedule() { if (pending) return; pending = true; window.setTimeout(function () { pending = false; tick(); }, 120); }
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
  window.addEventListener("scroll", function () {
    if (!topBtn) return;
    if (window.scrollY > 620) topBtn.classList.add("is-on"); else topBtn.classList.remove("is-on");
  }, { passive: true });
})();
