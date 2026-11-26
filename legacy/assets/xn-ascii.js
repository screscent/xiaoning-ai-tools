/* 小凝工具站 · ASCII 艺术与字符画增强 xn-ascii v1
 * 能力：2 标签 34/37→44h/aria-current/具名；h2 20、h3 16.5 去①/②；
 *       上传按钮 44 具名；滑块 44h、下拉 50；反色开关 60×34+28 圆点具名；
 *       按钮 36-38→46 具名；textarea 98h/16；ASCII pre 13.5 深色终端；
 *       空态虚线终端卡；统计数字 18/800；回到顶部。
 * 注入：legacy/bnxqa6nsmb.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_ASCII__) return;
  window.__XN_ASCII__ = true;
  function vis(el) { return el && el.getBoundingClientRect().height > 0; }
  function clean(t) { return (t || "").replace(/\s+/g, " ").trim(); }
  function each(l, f) { Array.prototype.forEach.call(l, f); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function setA(el, v) { if (el.getAttribute("aria-label") !== v) el.setAttribute("aria-label", v); }

  function cleanHeads() {
    each(document.querySelectorAll("#root h2, #root h3"), function (h) {
      var t = clean(h.textContent);
      var c = t.replace(/^\s*[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "");
      if (c !== t) h.textContent = c;
      add(h, "xn-ascii-h2");
    });
  }

  function markTabs() {
    var cur = location.hash.indexOf("asciiart") >= 0 ? "字符画参数" : "图片转字符";
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (t !== "图片转字符" && t !== "字符画参数") return;
      add(b, "xn-ascii-tab");
      setA(b, "切换到：" + t + "（工具 " + (t === "图片转字符" ? 1 : 2) + "）");
      if (t === cur) { if (b.getAttribute("aria-current") !== "page") b.setAttribute("aria-current", "page"); }
      else if (b.hasAttribute("aria-current")) b.removeAttribute("aria-current");
    });
  }

  function markUpload() {
    each(document.querySelectorAll("#root label"), function (l) {
      if (!vis(l)) return;
      var t = clean(l.textContent);
      if (t !== "选择图片") return;
      add(l, "xn-ascii-upload");
      setA(l, "选择图片文件（PNG / JPG）");
    });
  }

  function markInputs() {
    each(document.querySelectorAll("#root input"), function (x) {
      if (!vis(x)) return;
      if (x.type === "range") add(x, "xn-ascii-range");
    });
    each(document.querySelectorAll("#root select"), function (s) {
      if (!vis(s)) return;
      add(s, "xn-ascii-select");
      var n = clean(s.getAttribute("aria-label"));
      if (n) setA(s, n);
    });
    each(document.querySelectorAll("#root textarea"), function (t) {
      if (!vis(t)) return;
      add(t, "xn-ascii-text");
      setA(t, "字符画文字（每行一段）");
    });
  }

  function markSwitch() {
    var inp = document.querySelector('#root input[aria-label="是否反色"]');
    if (!inp) return;
    var lab = inp.closest("label");
    var track = inp.parentElement;
    var knob = track && track.querySelector("span");
    if (lab) add(lab, "xn-ascii-checklabel");
    if (track) add(track, "xn-ascii-track");
    if (knob) add(knob, "xn-ascii-knob");
    add(inp, "xn-ascii-check");
    inp.style.setProperty("width", "60px", "important");
    inp.style.setProperty("height", "34px", "important");
    inp.style.setProperty("background-color", inp.checked ? "#059669" : "#cbd5e1", "important");
    if (knob) {
      knob.style.setProperty("width", "28px", "important");
      knob.style.setProperty("height", "28px", "important");
      knob.style.setProperty("top", "3px", "important");
      knob.style.setProperty("left", "3px", "important");
      knob.style.setProperty("translate", "none", "important");
      knob.style.setProperty("transform", inp.checked ? "translateX(26px)" : "translateX(0px)", "important");
    }
  }

  function markButtons() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (t === "复制 ASCII") {
        add(b, "xn-ascii-btn"); add(b, "xn-ascii-btn-primary"); setA(b, "复制 ASCII 文本");
      } else if (t === "下载 TXT") {
        add(b, "xn-ascii-btn"); setA(b, "下载 TXT 文件");
      } else if (t === "重置") {
        add(b, "xn-ascii-btn"); setA(b, "清空图片与结果");
      } else if (t === "复制字符画文本") {
        add(b, "xn-ascii-btn"); add(b, "xn-ascii-btn-primary"); setA(b, "复制字符画文本");
      }
    });
  }

  function markBlocks() {
    each(document.querySelectorAll("#root pre"), function (pre) {
      if (vis(pre)) add(pre, "xn-ascii-pre");
    });
    var stage = null;
    each(document.querySelectorAll("#root div"), function (d) {
      if (!vis(d)) return;
      var h = d.getBoundingClientRect().height;
      if (h >= 100 && h <= 420 && /等待图片/.test(d.textContent) && d.textContent.length < 60) {
        if (!stage || h > stage.getBoundingClientRect().height) stage = d;
      }
    });
    if (stage) add(stage, "xn-ascii-stage");
    each(document.querySelectorAll("#root div"), function (d) {
      if (!vis(d) || d.children.length) return;
      var t = clean(d.textContent);
      if (d.className.indexOf("mt-0.5") >= 0 && d.className.indexOf("font-semibold") >= 0 && t.length <= 8) add(d, "xn-ascii-num");
    });
    each(document.querySelectorAll("#root span"), function (s) {
      if (!vis(s) || s.children.length) return;
      var t = clean(s.textContent);
      if (/^\d{1,3}$/.test(t) && parseFloat(getComputedStyle(s).fontSize) >= 13) add(s, "xn-ascii-num");
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button"; topBtn.className = "xn-ascii-top";
    topBtn.setAttribute("aria-label", "回到顶部"); topBtn.title = "回到顶部"; topBtn.textContent = "↑";
    topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    document.body.appendChild(topBtn);
  }

  function tick() { try { cleanHeads(); markTabs(); markUpload(); markInputs(); markSwitch(); markButtons(); markBlocks(); ensureTop(); } catch (e) {} }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", tick, { once: true }); else tick();
  window.setTimeout(tick, 900); window.setTimeout(tick, 2200); window.setInterval(tick, 1000);
  document.addEventListener("click", function () { window.setTimeout(tick, 200); }, true);
  window.addEventListener("hashchange", function () { window.setTimeout(tick, 120); });
  var pending = false;
  function schedule() { if (pending) return; pending = true; window.setTimeout(function () { pending = false; tick(); }, 120); }
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
  window.addEventListener("scroll", function () { if (!topBtn) return; if (window.scrollY > 620) topBtn.classList.add("is-on"); else topBtn.classList.remove("is-on"); }, { passive: true });
})();
