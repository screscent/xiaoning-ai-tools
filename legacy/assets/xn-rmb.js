/* 人民币大写金额转换器页增强（仅 3xhvxh5af3 引用） */
(function () {
  "use strict";
  if (window.__XN_RMB__) return;
  window.__XN_RMB__ = true;

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
  function fmtMoney(v) {
    var n = parseFloat(String(v).replace(/,/g, ""));
    if (!isFinite(n)) return String(v);
    return n.toLocaleString("zh-CN", { maximumFractionDigits: 2 });
  }
  function allButtons() {
    return [].slice.call(document.querySelectorAll("#root button")).filter(visible);
  }

  var QUICK_LABEL = { "100": "¥100", "1000": "¥1,000", "10000": "¥1万", "100000": "¥10万" };
  var FORMATS = ["标准大写", "带人民币前缀", "银行汇款式"];
  var ROUNDS = ["保留", "四舍五入到元", "截断到元"];
  var SAMPLES = [12345.67, 1000000, 888888.88];

  /* ---------- 1. 快捷金额可读化 ---------- */
  function markQuick() {
    allButtons().forEach(function (b) {
      var t = txt(b);
      if (!QUICK_LABEL[t]) return;
      if (!b.classList.contains("xn-quick")) b.classList.add("xn-quick");
      if (b.textContent !== QUICK_LABEL[t]) b.textContent = QUICK_LABEL[t];
    });
  }

  /* ---------- 2. 示例按钮修复 ---------- */
  function fixExample() {
    allButtons().forEach(function (b) {
      if (txt(b) !== "示例" || b.__xnFix) return;
      b.__xnFix = true;
      b.setAttribute("aria-label", "填入示例金额");
      b.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var input = document.querySelector('#root input[type="text"]');
        if (!input) return;
        var v = SAMPLES[(window.__xnRmbIdx = (window.__xnRmbIdx || 0) + 1) % SAMPLES.length];
        setVal(input, v);
      }, true);
    });
  }

  /* ---------- 3. 分段按钮状态 ---------- */
  function markSegments() {
    var formats = [];
    var rounds = [];
    allButtons().forEach(function (b) {
      var t = txt(b);
      if (FORMATS.indexOf(t) < 0 && ROUNDS.indexOf(t) < 0) return;
      if (!b.classList.contains("xn-seg")) b.classList.add("xn-seg");
      var on = String(hasClass(b, "bg-emerald-600"));
      if (b.getAttribute("aria-pressed") !== on) b.setAttribute("aria-pressed", on);
      (FORMATS.indexOf(t) >= 0 ? formats : rounds).push(b);
    });
    if (formats[0] && formats[0].parentElement) {
      var g1 = formats[0].parentElement;
      if (g1.getAttribute("role") !== "group") {
        g1.setAttribute("role", "group");
        g1.setAttribute("aria-label", "输出格式");
      }
    }
    if (rounds[0] && rounds[0].parentElement) {
      var g2 = rounds[0].parentElement;
      if (g2.getAttribute("role") !== "group") {
        g2.setAttribute("role", "group");
        g2.setAttribute("aria-label", "角分处理");
      }
    }
  }

  /* ---------- 4. 输入/开关/复制语义 ---------- */
  function markInput() {
    var input = document.querySelector('#root input[type="text"]');
    if (!input) return;
    if (!input.classList.contains("xn-amount")) input.classList.add("xn-amount");
    if (input.getAttribute("inputmode") !== "decimal") input.setAttribute("inputmode", "decimal");
    if (!input.getAttribute("aria-label")) input.setAttribute("aria-label", "金额数字");
    if (!input.getAttribute("enterkeyhint")) input.setAttribute("enterkeyhint", "done");
  }
  function markToggle() {
    var cb = document.querySelector('#root input[type="checkbox"]');
    if (!cb) return;
    if (!cb.getAttribute("aria-label")) cb.setAttribute("aria-label", "补「整」");
  }
  function markCopy() {
    allButtons().forEach(function (b) {
      if (txt(b).indexOf("复制结果") < 0) return;
      if (!b.classList.contains("xn-copy")) b.classList.add("xn-copy");
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "复制大写金额结果");
    });
  }

  /* ---------- 5. 小节标题与提示 ---------- */
  function markSections() {
    [].slice.call(document.querySelectorAll("#root span, #root div")).forEach(function (el) {
      if (el.children.length) return;
      var t = txt(el);
      if (t.length < 4) return;
      if (!/^[①②③④⑤⑥]/.test(t)) return;
      if (!el.classList.contains("xn-sec-title")) el.classList.add("xn-sec-title");
    });
    var secs = [].slice.call(document.querySelectorAll("#root section"));
    secs.forEach(function (sec) {
      if (txt(sec).indexOf("校验提示") >= 0) {
        var ul = sec.querySelector("ul");
        if (ul && !ul.classList.contains("xn-notes")) ul.classList.add("xn-notes");
      }
      if (txt(sec).indexOf("数字分组说明") >= 0) {
        var bd = sec.querySelector('[data-code-inspect-component="BreakdownTable"]');
        if (bd && !bd.classList.contains("xn-breakdown")) bd.classList.add("xn-breakdown");
      }
    });
  }

  /* ---------- 6. 结果摘要与空态示例 ---------- */
  function markResult() {
    var secs = [].slice.call(document.querySelectorAll("#root section"));
    var sec = null;
    for (var i = 0; i < secs.length; i++) {
      if (txt(secs[i]).indexOf("大写金额结果") >= 0) { sec = secs[i]; break; }
    }
    if (!sec) return;
    if (!sec.classList.contains("xn-result-sec")) sec.classList.add("xn-result-sec");
    var body = sec.querySelector('div[class*="min-h-"]');
    if (!body) return;
    if (!body.classList.contains("xn-result-body")) body.classList.add("xn-result-body");
    var p = body.querySelector("p");
    if (!p) return;
    var input = document.querySelector('#root input[type="text"]');
    var empty = /请在上方输入/.test(txt(p));
    var src = body.querySelector(".xn-src");
    var tries = body.querySelector(".xn-empty-try");

    if (empty) {
      if (src) src.remove();
      if (tries) return;
      var wrap = document.createElement("div");
      wrap.className = "xn-empty-try";
      [12345.67, 1000000].forEach(function (v) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "xn-try";
        b.textContent = "试试 ¥" + fmtMoney(v);
        b.setAttribute("aria-label", "填入示例金额 " + fmtMoney(v));
        b.onclick = function () { if (input) setVal(input, v); };
        wrap.appendChild(b);
      });
      body.appendChild(wrap);
      return;
    }

    if (tries) tries.remove();
    var activeFmt = "标准大写";
    allButtons().forEach(function (b) {
      if (FORMATS.indexOf(txt(b)) >= 0 && b.getAttribute("aria-pressed") === "true") activeFmt = txt(b);
    });
    var cb = document.querySelector('#root input[type="checkbox"]');
    var text = "输入 ¥" + fmtMoney(input ? input.value : "") + " · " + activeFmt + (cb && cb.checked ? " · 补「整」" : "");
    if (!src) {
      src = document.createElement("div");
      src.className = "xn-src";
      body.appendChild(src);
    }
    if (txt(src) !== text) src.textContent = text;
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    markInput();
    markQuick();
    fixExample();
    markSegments();
    markToggle();
    markCopy();
    markSections();
    markResult();
  }

  var scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(function () { scheduled = false; try { updateAll(); } catch (e) {} }, 180);
  }

  function boot() {
    var root = document.getElementById("root");
    if (!root) { setTimeout(boot, 300); return; }
    updateAll();
    new MutationObserver(schedule).observe(root, {
      childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["class"]
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
