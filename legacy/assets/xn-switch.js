/* 小凝工具站 · 开关切换与开关组增强 xn-switch v1
 * 能力：2 标签 20→44h/aria-current(hash)/具名；h2 20、h3 16.5 去①-⑤；
 *       颜色/宽度/名称输入 46→52 + aria 语义化 + 宽度常用值胶囊；
 *       2-3 个开关 1.3 倍（≥44px）并具名；重置/复制 24-36→46；
 *       CSS 代码块 12→14.5 深色；预览台；摘要数字 16/800；回到顶部。
 * 注入：legacy/mkpwgxrxwr.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_SWITCH__) return;
  window.__XN_SWITCH__ = true;
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
      add(h, "xn-switch-h2");
    });
  }

  function markTabs() {
    var cur = location.hash.indexOf("togglegroup") >= 0 ? "开关组" : "开关组件";
    each(document.querySelectorAll("#root nav a"), function (a) {
      if (!vis(a)) return;
      var t = clean(a.textContent);
      if (t !== "开关组件" && t !== "开关组") return;
      add(a, "xn-switch-tab");
      setA(a, "切换到：" + t + "（工具 " + (t === "开关组件" ? 1 : 2) + "）");
      if (t === cur) { if (a.getAttribute("aria-current") !== "page") a.setAttribute("aria-current", "page"); }
      else if (a.hasAttribute("aria-current")) a.removeAttribute("aria-current");
    });
  }

  function labelFor(el) {
    var id = el.getAttribute("id");
    if (id) {
      var l = document.querySelector('#root label[for="' + id + '"]');
      if (l) return clean(l.textContent);
    }
    return "";
  }

  function nativeSet(el, v) {
    var d = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    if (d && d.set) d.set.call(el, v); else el.value = v;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function markInputs() {
    each(document.querySelectorAll("#root input"), function (x) {
      if (!vis(x)) return;
      var name = labelFor(x);
      if (x.type === "color") {
        add(x, "xn-switch-color");
        if (name) setA(x, name);
      } else if (x.type === "number") {
        add(x, "xn-switch-num");
        if (name) setA(x, /px|（/.test(name) ? name : name + "（px）");
        var host = x.parentElement;
        var sib = host && host.querySelector(":scope > span");
        if (sib && /px|（/.test(sib.textContent)) add(sib, "xn-switch-unit");
        if (host && !document.querySelector("#root .xn-switch-qrow")) {
          var row = document.createElement("div");
          row.className = "xn-switch-qrow";
          [40, 52, 64, 80].forEach(function (q) {
            var b = document.createElement("button");
            b.type = "button"; b.className = "xn-switch-q"; b.textContent = String(q);
            b.setAttribute("aria-label", "填入 " + q + " 像素（" + (name || "宽度") + "）");
            b.addEventListener("click", function (e) { e.preventDefault(); nativeSet(x, String(q)); x.focus(); });
            row.appendChild(b);
          });
          var rowEl = (host && host.parentElement) || host || x.parentElement;
          if (rowEl && rowEl.parentElement) rowEl.parentElement.insertBefore(row, rowEl.nextSibling);
          else host.appendChild(row);
        }
      } else if (x.type === "text") {
        add(x, "xn-switch-text");
        if (name) setA(x, /名称/.test(name) ? name + "（逗号分隔）" : name);
      }
    });
    each(document.querySelectorAll("#root select"), function (s) {
      if (!vis(s)) return;
      add(s, "xn-switch-select");
      var n = labelFor(s);
      if (n) setA(s, n);
    });
  }

  function markToggles() {
    var colorInp = Array.prototype.slice.call(document.querySelectorAll('#root input[type="color"]')).filter(vis)[0];
    var accent = colorInp && colorInp.value ? colorInp.value : "#2196F3";
    each(document.querySelectorAll("#root button[aria-pressed]"), function (b) {
      if (!vis(b)) return;
      add(b, "xn-switch-toggle");
      var on = b.getAttribute("aria-pressed") === "true";
      // 轨道/圆点尺寸与配色用内联 important 兜底，压过 xn-ux 的 button 规则
      b.style.setProperty("width", "68px", "important");
      b.style.setProperty("height", "44px", "important");
      b.style.setProperty("min-height", "44px", "important");
      b.style.setProperty("padding", "0", "important");
      b.style.setProperty("background-color", on ? accent : "#cbd5e1", "important");
      var knob = b.querySelector(":scope > span");
      if (knob) {
        knob.style.setProperty("width", "32px", "important");
        knob.style.setProperty("height", "32px", "important");
        knob.style.setProperty("top", "6px", "important");
        knob.style.setProperty("left", "6px", "important");
        knob.style.setProperty("transform", on ? "translateX(24px)" : "translateX(0px)", "important");
      }
      var name = "";
      var lab = b.closest("label");
      if (lab) name = clean(lab.textContent);
      if (!name) {
        var p = b.parentElement;
        for (var i = 0; i < 4 && p; i++) {
          var l = p.querySelector(":scope > label");
          if (l) { name = clean(l.textContent); break; }
          p = p.parentElement;
        }
      }
      if (!name) {
        var row = b.parentElement;
        var rt = clean(row && row.textContent);
        if (rt.length <= 20) name = rt.replace(/(不显示|显示|开启|关闭|有|无|开|关)$/, "").trim();
      }
      name = name.replace(/[：:]\s*$/, "");
      setA(b, name ? "切换：" + name : "切换开关");
      if (!b.getAttribute("title") && name) b.setAttribute("title", "点击切换" + name);
    });
  }

  function markButtons() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (t === "重置默认") {
        add(b, "xn-switch-btn"); setA(b, "重置为默认参数");
      } else if (t === "复制 CSS") {
        add(b, "xn-switch-btn"); add(b, "xn-switch-btn-primary"); setA(b, "复制 CSS 代码");
      } else if (t === "复制 HTML") {
        add(b, "xn-switch-btn"); setA(b, "复制 HTML 代码");
      }
    });
  }

  function markBlocks() {
    each(document.querySelectorAll("#root pre"), function (pre) {
      if (vis(pre)) add(pre, "xn-switch-pre");
    });
    each(document.querySelectorAll("#root span"), function (s) {
      if (!vis(s) || s.children.length) return;
      var t = clean(s.textContent);
      if (/^#[0-9a-f]{6}$/i.test(t)) add(s, "xn-switch-hex");
      else if (/^\d+(\.\d+)?(px|s)?$/.test(t) && parseFloat(getComputedStyle(s).fontSize) >= 13 && t.length <= 6) add(s, "xn-switch-num-txt");
    });
    each(document.querySelectorAll("#root div"), function (d) {
      if (!vis(d)) return;
      var cls = String(d.className || "");
      if (cls.indexOf("bg-slate-50") >= 0 && d.getBoundingClientRect().height <= 320) add(d, "xn-switch-stage");
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button"; topBtn.className = "xn-switch-top";
    topBtn.setAttribute("aria-label", "回到顶部"); topBtn.title = "回到顶部"; topBtn.textContent = "↑";
    topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    document.body.appendChild(topBtn);
  }

  function tick() { try { cleanHeads(); markTabs(); markInputs(); markToggles(); markButtons(); markBlocks(); ensureTop(); } catch (e) {} }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", tick, { once: true }); else tick();
  window.setTimeout(tick, 900); window.setTimeout(tick, 2200); window.setInterval(tick, 1000);
  document.addEventListener("click", function () { window.setTimeout(tick, 200); }, true);
  window.addEventListener("hashchange", function () { window.setTimeout(tick, 120); });
  var pending = false;
  function schedule() { if (pending) return; pending = true; window.setTimeout(function () { pending = false; tick(); }, 120); }
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
  window.addEventListener("scroll", function () { if (!topBtn) return; if (window.scrollY > 620) topBtn.classList.add("is-on"); else topBtn.classList.remove("is-on"); }, { passive: true });
})();
