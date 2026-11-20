/* CSS 背景与纹理生成合集页增强（仅 k6bmafftrk 引用） */
(function () {
  "use strict";
  if (window.__XN_CSSBG__) return;
  window.__XN_CSSBG__ = true;

  function txt(el) { return (el.textContent || "").trim().replace(/\s+/g, " "); }
  function visible(el) {
    if (!el) return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }
  function sectionOf(el) {
    var cur = el;
    for (var i = 0; i < 6 && cur; i++) {
      if (cur.tagName === "SECTION") return cur;
      cur = cur.parentElement;
    }
    return el.parentElement;
  }

  /* ---------- 1. 编号归一 ---------- */
  function markTitles() {
    [].slice.call(document.querySelectorAll("#root h2")).forEach(function (h) {
      var t = txt(h);
      var m = /^工具([A-Z])\s*/.exec(t);
      if (!m) return;
      var n = m[1].charCodeAt(0) - 64;
      var want = "工具 " + n + " " + t.replace(/^工具[A-Z]\s*/, "");
      if (t !== want) h.textContent = want;
    });
  }

  /* ---------- 2. 吸顶跳转 ---------- */
  var jumpNav = null;
  function heads() {
    return [].slice.call(document.querySelectorAll("#root h2")).filter(visible);
  }
  function markJump() {
    var hs = heads();
    if (!hs.length) return;
    if (jumpNav && jumpNav.isConnected) { updateJump(); return; }
    var names = ["分隔线", "点阵背景", "网格条纹", "噪点纹理", "平铺次数", "渐变背景"];
    var nav = document.createElement("nav");
    nav.className = "xn-jump";
    nav.setAttribute("aria-label", "工具快速跳转");
    hs.forEach(function (h, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = names[i] || txt(h).replace(/生成器$/, "");
      b.setAttribute("aria-label", "跳转到" + b.textContent);
      b.onclick = function () {
        sectionOf(h).scrollIntoView({ behavior: "smooth", block: "start" });
      };
      nav.appendChild(b);
    });
    var firstSec = sectionOf(hs[0]);
    if (firstSec && firstSec.parentElement) firstSec.parentElement.insertBefore(nav, firstSec);
    jumpNav = nav;
    updateJump();
  }
  function updateJump() {
    if (!jumpNav || !jumpNav.isConnected) return;
    var hs = heads();
    var y = window.scrollY + 110;
    var idx = -1;
    hs.forEach(function (h, i) {
      if (h.getBoundingClientRect().top + window.scrollY <= y) idx = i;
    });
    [].slice.call(jumpNav.children).forEach(function (b, i) {
      if (i === idx) {
        if (b.getAttribute("aria-current") !== "page") b.setAttribute("aria-current", "page");
      } else if (b.hasAttribute("aria-current")) {
        b.removeAttribute("aria-current");
      }
    });
  }

  /* ---------- 3. 入口卡 ---------- */
  function markEntries() {
    [].slice.call(document.querySelectorAll("#root a")).filter(visible).forEach(function (a) {
      if (txt(a).indexOf("进入工具") < 0) return;
      if (!a.classList.contains("xn-entry")) a.classList.add("xn-entry");
      if (a.getAttribute("aria-label")) return;
      var title = "";
      [].slice.call(a.querySelectorAll("div,span,p,h3,strong")).some(function (n) {
        if (n.children.length) return false;
        var t = txt(n);
        if (!t || t === "进入工具" || t.length > 14) return false;
        title = t;
        return true;
      });
      if (title) a.setAttribute("aria-label", "进入" + title);
    });
  }

  /* ---------- 4. 代码块 ---------- */
  function markCode() {
    [].slice.call(document.querySelectorAll("#root pre")).forEach(function (pre) {
      if (!pre.classList.contains("xn-code")) pre.classList.add("xn-code");
    });
  }

  /* ---------- 5. 颜色与操作 ---------- */
  function markColors() {
    var gradSec = [].slice.call(document.querySelectorAll("#root section")).find(function (s) {
      var h = s.querySelector("h2");
      return h && txt(h).indexOf("渐变背景") >= 0;
    });
    var grads = [];
    if (gradSec) grads = [].slice.call(gradSec.querySelectorAll('input[type="color"]')).filter(visible);
    [].slice.call(document.querySelectorAll('#root input[type="color"], #root input[type="text"]')).forEach(function (el) {
      if (!visible(el)) return;
      var aria = el.getAttribute("aria-label");
      if (aria && !/^#[0-9a-f]{3,8}$/i.test(aria)) return;
      var gi = grads.indexOf(el);
      if (gi >= 0) {
        el.setAttribute("aria-label", gi === 0 ? "起始颜色" : "结束颜色");
        return;
      }
      if (el.type === "text" && /^#/.test(el.value)) {
        var box = el.parentElement;
        var lab = box && box.previousElementSibling;
        if (lab && /HEX/i.test(txt(lab))) el.setAttribute("aria-label", txt(lab));
        return;
      }
      var field = el.parentElement;
      for (var i = 0; i < 3 && field; i++) {
        var lab2 = field.querySelector("label");
        if (lab2 && txt(lab2)) break;
        field = field.parentElement;
      }
      var near = field && field.querySelector("label");
      el.setAttribute("aria-label", near && txt(near) ? txt(near) : "颜色");
    });
    if (gradSec) {
      var texts = [].slice.call(gradSec.querySelectorAll('input[type="text"]')).filter(visible);
      texts.forEach(function (el, i) {
        if (!el.getAttribute("aria-label")) el.setAttribute("aria-label", i === 0 ? "起始颜色 HEX" : "结束颜色 HEX");
      });
    }
  }
  function markActions() {
    [].slice.call(document.querySelectorAll("#root button")).filter(visible).forEach(function (b) {
      var t = txt(b);
      if (t === "生成样式" || t === "复制 CSS" || t === "复制 HTML" || t === "清空" || t === "计算平铺次数" || t === "复制结果") {
        if (!b.classList.contains("xn-action")) b.classList.add("xn-action");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", t === "清空" ? "清空参数" : t);
      } else if (b.getAttribute("aria-pressed") && !t && !b.getAttribute("aria-label")) {
        b.setAttribute("aria-label", "点型切换");
      }
    });
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    markTitles();
    markJump();
    markEntries();
    markCode();
    markColors();
    markActions();
  }

  var scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(function () { scheduled = false; try { updateAll(); } catch (e) {} }, 180);
  }

  var timer = null;
  function onScroll() {
    if (timer) return;
    timer = setTimeout(function () { timer = null; try { updateJump(); } catch (e) {} }, 120);
  }

  function boot() {
    var root = document.getElementById("root");
    if (!root) { setTimeout(boot, 300); return; }
    updateAll();
    new MutationObserver(schedule).observe(root, {
      childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["class"]
    });
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
