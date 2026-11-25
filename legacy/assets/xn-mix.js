/* 小凝工具站 · 颜色混合与叠加增强 xn-mix v1
 * 能力：2 标签 37→44h/aria-current/具名；h2 去①② 20；颜色块/HEX 52、占比 52/22、−/+ 44 具名；
 *       计算 40→52/17、复制/清空 38→46 具名；结果 HEX 30/800、对比度 26/800、色块 96；说明 13.5；回到顶部。
 * 注入：legacy/qhwvgdstfq.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_MIX__) return;
  window.__XN_MIX__ = true;
  function vis(el) { return el && el.getBoundingClientRect().height > 0; }
  function clean(t) { return (t || "").replace(/\s+/g, " ").trim(); }
  function each(l, f) { Array.prototype.forEach.call(l, f); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }

  function activeName() {
    var h = document.querySelector("#root h2");
    var t = clean(h && h.textContent);
    return /透明/.test(t) ? "透明度叠加" : "颜色混合";
  }

  function cleanHeads() {
    each(document.querySelectorAll("#root h2"), function (h) {
      var t = clean(h.textContent);
      var c = t.replace(/^\s*[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "");
      if (c !== t) h.textContent = c;
      add(h, "xn-mix-h2");
    });
    each(document.querySelectorAll("#root h2.xn-mix-h2"), function (h) {
      var card = h.closest("article") || h.closest("section") || h.closest("div.rounded-xl") || (h.parentElement && h.parentElement.parentElement);
      if (card) add(card, "xn-mix-card");
    });
  }

  function markTabs() {
    var cur = activeName();
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (t !== "颜色混合" && t !== "透明度叠加") return;
      add(b, "xn-mix-tab");
      var on = t === cur;
      if (on) { if (b.getAttribute("aria-current") !== "page") b.setAttribute("aria-current", "page"); }
      else if (b.hasAttribute("aria-current")) b.removeAttribute("aria-current");
      var aria = "切换到：" + t + "（工具 " + (t === "颜色混合" ? 1 : 2) + "）";
      if (b.getAttribute("aria-label") !== aria) b.setAttribute("aria-label", aria);
    });
  }

  function markInputs() {
    var cur = activeName();
    var colors = Array.prototype.filter.call(document.querySelectorAll('#root input[type="color"]'), vis);
    var texts = Array.prototype.filter.call(document.querySelectorAll('#root input[type="text"]'), vis);
    var nums = Array.prototype.filter.call(document.querySelectorAll('#root input[type="number"]'), vis);
    var mapColor, mapText, mapNum;
    if (cur === "透明度叠加") {
      mapColor = ["前景色", "背景色"]; mapText = ["前景色十六进制", "背景色十六进制"]; mapNum = ["叠加透明度（%）"];
    } else {
      mapColor = ["颜色 A", "颜色 B", "混合结果色"]; mapText = ["颜色 A 十六进制", "颜色 B 十六进制", "混合结果十六进制"]; mapNum = ["颜色 A 占比（%）", "颜色 B 占比（%）"];
    }
    colors.forEach(function (el, i) { var a = mapColor[i]; if (a && el.getAttribute("aria-label") !== a) el.setAttribute("aria-label", a); });
    texts.forEach(function (el, i) { var a = mapText[i]; if (a && el.getAttribute("aria-label") !== a) el.setAttribute("aria-label", a); el.style.setProperty("font-size", "16px", "important"); });
    nums.forEach(function (el, i) {
      var a = mapNum[i] || "数值";
      if (el.getAttribute("aria-label") !== a) el.setAttribute("aria-label", a);
    });
  }

  function markSteps() {
    var nums = Array.prototype.filter.call(document.querySelectorAll('#root input[type="number"]'), vis);
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (t !== "−" && t !== "+") return;
      add(b, "xn-mix-step");
      var box = b.parentElement;
      if (box) add(box, "xn-mix-steprow");
      var n = box && [...box.querySelectorAll('input[type="number"]')][0];
      var name = clean(n && n.getAttribute("aria-label")) || "数值";
      var aria = (t === "+" ? "增加 5" : "减少 5") + "（" + name + "）";
      if (b.getAttribute("aria-label") !== aria) b.setAttribute("aria-label", aria);
      if (!b.title) b.title = aria;
    });
  }

  function markButtons() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (t === "计算") {
        add(b, "xn-mix-go");
        if (b.getAttribute("aria-label") !== "计算颜色结果") b.setAttribute("aria-label", "计算颜色结果");
      } else if (t === "复制结果") {
        add(b, "xn-mix-sec");
        if (b.getAttribute("aria-label") !== "复制计算结果") b.setAttribute("aria-label", "复制计算结果");
      } else if (t === "清空") {
        add(b, "xn-mix-sec");
        if (b.getAttribute("aria-label") !== "清空输入") b.setAttribute("aria-label", "清空输入");
      }
    });
  }

  function markResult() {
    each(document.querySelectorAll("#root span, #root div"), function (e) {
      if (!vis(e) || e.children.length) return;
      var t = clean(e.textContent);
      if (/^#[0-9A-Fa-f]{3,8}$/.test(t)) add(e, "xn-mix-hex");
      if (/^\d+(\.\d+)?:1$/.test(t)) add(e, "xn-mix-contrast");
      if (/^RGB\(/.test(t) || /^R \d+/.test(t)) add(e, "xn-mix-sub");
      if (/叠加效果|叠加后实际颜色|混合结果|色块预览/.test(t) && t.length < 30) add(e, "xn-mix-cap");
    });
    each(document.querySelectorAll("#root div"), function (d) {
      if (!vis(d)) return;
      var st = d.getAttribute("style") || "";
      var h = d.getBoundingClientRect().height;
      if (/background/.test(st) && h >= 60 && h <= 140) add(d, "xn-mix-swatch");
    });
    // 技术说明
    each(document.querySelectorAll("#root p, #root div"), function (e) {
      if (!vis(e)) return;
      var t = clean(e.textContent);
      if (/技术说明/.test(t) && t.length < 400) add(e.closest("div.rounded-lg") || e, "xn-mix-note");
      if (/人类作者：/.test(t) && e.getBoundingClientRect().height < 100) add(e, "xn-mix-foot");
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button"; topBtn.className = "xn-mix-top";
    topBtn.setAttribute("aria-label", "回到顶部"); topBtn.title = "回到顶部"; topBtn.textContent = "↑";
    topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    document.body.appendChild(topBtn);
  }
  function tick() { try { cleanHeads(); markTabs(); markInputs(); markSteps(); markButtons(); markResult(); ensureTop(); } catch (e) {} }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", tick, { once: true }); else tick();
  window.setTimeout(tick, 900); window.setTimeout(tick, 2200); window.setInterval(tick, 1000);
  document.addEventListener("click", function () { window.setTimeout(tick, 200); }, true);
  var pending = false;
  function schedule() { if (pending) return; pending = true; window.setTimeout(function () { pending = false; tick(); }, 120); }
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
  window.addEventListener("scroll", function () { if (!topBtn) return; if (window.scrollY > 620) topBtn.classList.add("is-on"); else topBtn.classList.remove("is-on"); }, { passive: true });
})();
