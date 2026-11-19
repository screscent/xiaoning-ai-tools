/* 发票与税额计算合集页增强（仅 x89bsucakb 引用） */
(function () {
  "use strict";
  if (window.__XN_INVOICE__) return;
  window.__XN_INVOICE__ = true;

  function txt(el) { return (el.textContent || "").trim().replace(/\s+/g, " "); }
  function visible(el) {
    if (!el) return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }
  function hasClass(el, s) {
    return !!el && (el.className || "").toString().indexOf(s) >= 0;
  }
  function setVal(el, v) {
    var proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    proto.set.call(el, String(v));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  var CHIPS = {
    "金额（元）": [1000, 5000, 10000, 50000],
    "税额（元）": [100, 500, 1000, 5000],
    "价税合计（元）": [1130, 5650, 11300],
    "销项税额（元）": [130, 1000, 5000],
    "不含税销售收入（元）": [1000, 5000, 10000],
    "销项税额合计（元）": [13000, 50000, 100000],
    "进项税额合计（元）": [8000, 30000, 60000],
    "已缴税额（元）": [0, 4500, 10000],
    "期初留抵（元）": [0, 1000, 5000],
    "数量": [1, 2, 5, 10]
  };

  function toolSections() {
    return [].slice.call(document.querySelectorAll("#root section")).filter(function (s) {
      return !!s.querySelector("h2") && visible(s);
    });
  }

  /* ---------- 1. 工具编号归一 ---------- */
  function markBadges() {
    toolSections().forEach(function (sec, i) {
      var head = sec.querySelector("h2").parentElement;
      if (!head) return;
      var spans = [].slice.call(head.querySelectorAll("span"));
      for (var k = 0; k < spans.length; k++) {
        if (/^工具\s*[A-Z0-9]+$/.test(txt(spans[k]))) {
          var want = "工具 " + (i + 1);
          if (txt(spans[k]) !== want) spans[k].textContent = want;
          return;
        }
      }
    });
  }

  /* ---------- 2. 吸顶快捷跳转 ---------- */
  var jumpNav = null;
  function markJump() {
    var secs = toolSections();
    if (!secs.length) return;
    if (jumpNav && jumpNav.isConnected) {
      updateJumpActive();
      return;
    }
    var root = document.getElementById("root");
    var nav = document.createElement("nav");
    nav.className = "xn-jump";
    nav.setAttribute("aria-label", "工具快速跳转");
    secs.forEach(function (sec) {
      var name = txt(sec.querySelector("h2")).replace(/计算器$/, "");
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = name;
      b.setAttribute("aria-label", "跳转到" + name);
      b.onclick = function () {
        sec.scrollIntoView({ behavior: "smooth", block: "start" });
      };
      nav.appendChild(b);
    });
    var instr = null;
    [].slice.call(root.querySelectorAll("div")).some(function (d) {
      var h2 = d.querySelector("h2");
      if (h2 && txt(h2) === "使用说明" && hasClass(d, "bg-white")) { instr = d; return true; }
      return false;
    });
    var anchor = instr || secs[0];
    anchor.insertAdjacentElement("afterend", nav);
    jumpNav = nav;
    updateJumpActive();
  }

  function updateJumpActive() {
    if (!jumpNav || !jumpNav.isConnected) return;
    var secs = toolSections();
    var y = window.scrollY + 96;
    var idx = -1;
    secs.forEach(function (s, i) {
      if (s.getBoundingClientRect().top + window.scrollY <= y) idx = i;
    });
    [].slice.call(jumpNav.children).forEach(function (b, i) {
      if (i === idx) {
        if (b.getAttribute("aria-current") !== "page") b.setAttribute("aria-current", "page");
      } else if (b.hasAttribute("aria-current")) {
        b.removeAttribute("aria-current");
      }
    });
    var cards = [].slice.call(document.querySelectorAll('#root button[aria-label^="跳转到："]'));
    cards.forEach(function (c, i) {
      if (i === idx) {
        if (c.getAttribute("aria-current") !== "true") c.setAttribute("aria-current", "true");
      } else if (c.hasAttribute("aria-current")) {
        c.removeAttribute("aria-current");
      }
    });
  }

  /* ---------- 3. 常用值胶囊 ---------- */
  function markChips() {
    [].slice.call(document.querySelectorAll("#root input[type=number]")).forEach(function (input) {
      var name = input.getAttribute("aria-label");
      var vals = CHIPS[name];
      if (!vals) return;
      var field = input.closest('[data-code-inspect-component="Field"]') || input.parentElement;
      if (!field) return;
      var next = field.nextElementSibling;
      if (next && next.classList && next.classList.contains("xn-chips")) {
        var cur = parseFloat(input.value);
        [].slice.call(next.children).forEach(function (c) {
          c.classList.toggle("is-on", parseFloat(c.textContent) === cur);
        });
        return;
      }
      var wrap = document.createElement("div");
      wrap.className = "xn-chips";
      vals.forEach(function (v) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "xn-chip" + (parseFloat(input.value) === v ? " is-on" : "");
        b.textContent = String(v);
        b.setAttribute("aria-label", name + " 设为 " + v);
        b.onclick = function () {
          setVal(input, v);
          [].slice.call(wrap.children).forEach(function (x) { x.classList.toggle("is-on", x === b); });
        };
        wrap.appendChild(b);
      });
      field.insertAdjacentElement("afterend", wrap);
    });
  }

  /* ---------- 4. 结果层级 ---------- */
  function isMoneyRow(row) {
    var val = row.querySelector("span.font-mono");
    return !!val && /^[¥￥]/.test(txt(val));
  }
  function markResults() {
    [].slice.call(document.querySelectorAll('#root div[class*="bg-blue-50"]')).forEach(function (card) {
      if (!hasClass(card, "space-y-3")) return;
      var rows = [].slice.call(card.children).filter(isMoneyRow);
      if (rows.length < 2) return;
      if (!card.classList.contains("xn-result-card")) card.classList.add("xn-result-card");
      rows.forEach(function (row, idx) {
        var val = row.querySelector("span.font-mono");
        if (!val) return;
        if (!val.classList.contains("xn-val")) val.classList.add("xn-val");
        val.classList.toggle("xn-val-primary", idx === 0);
      });
    });
  }

  /* ---------- 5. 操作用语 ---------- */
  function markActions() {
    [].slice.call(document.querySelectorAll("#root button")).filter(visible).forEach(function (b) {
      var t = txt(b);
      if (t === "复制结果" || t === "清空" || t.indexOf("添加一条进项发票") >= 0) {
        if (!b.classList.contains("xn-btn")) b.classList.add("xn-btn");
        if (!b.getAttribute("aria-label")) {
          b.setAttribute("aria-label", t.indexOf("添加一条") >= 0 ? "添加一条进项发票" : t);
        }
      }
    });
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    markBadges();
    markJump();
    markChips();
    markResults();
    markActions();
  }

  var scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(function () { scheduled = false; try { updateAll(); } catch (e) {} }, 180);
  }

  var scrollTimer = null;
  function onScroll() {
    if (scrollTimer) return;
    scrollTimer = setTimeout(function () { scrollTimer = null; try { updateJumpActive(); } catch (e) {} }, 120);
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
