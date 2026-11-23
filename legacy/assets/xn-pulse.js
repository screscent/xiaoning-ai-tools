/* xn-pulse.js · 心率与配速合集：标题归一 / 工具切换 / 常用值 / 空态引导（幂等） */
(function () {
  "use strict";
  if (window.__XN_PULSE__) return;
  window.__XN_PULSE__ = 1;

  var CN = ["一", "二"];
  var CIRCLE = ["①", "②"];
  var PRESETS = {
    "年龄（岁）": [20, 30, 40, 50, 60],
    "静息心率（bpm）": [50, 60, 70, 80],
    "运动时长（分钟）": [20, 30, 45, 60],
    "距离（km）": [3, 5, 10, 21.1],
    "步频（spm）": [160, 170, 180, 190]
  };

  function text(el) { return (el && (el.textContent || "").trim()) || ""; }

  function setNative(el, value) {
    var proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    var setter = Object.getOwnPropertyDescriptor(proto, "value").set;
    setter.call(el, String(value));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  /* 1. 标题归一 */
  function normalizeHeadings() {
    var hs = document.querySelectorAll("#root h2");
    for (var i = 0; i < hs.length && i < 2; i++) {
      var t = text(hs[i]);
      var m = /^([①②])\s*(.+)$/.exec(t);
      if (!m) continue;
      var idx = "①②".indexOf(m[1]);
      var want = "工具" + CN[idx] + " · " + m[2].trim();
      if (t !== want) hs[i].textContent = want;
    }
  }

  /* 2. 工具切换 */
  function enhanceTabs() {
    var btns = document.querySelectorAll("#root button");
    var idx = 0;
    for (var i = 0; i < btns.length; i++) {
      var t = text(btns[i]);
      if (t !== "心率区间" && t !== "配速步频") continue;
      btns[i].setAttribute("data-xn-num", CIRCLE[idx] || "");
      btns[i].setAttribute("aria-pressed", /bg-red-500/.test(btns[i].className) ? "true" : "false");
      idx++;
    }
  }

  function syncTabs() {
    var btns = document.querySelectorAll('#root button[data-xn-num]');
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute("aria-pressed", /bg-red-500/.test(btns[i].className) ? "true" : "false");
    }
  }

  /* 3. 服药开关 */
  function enhanceSwitch() {
    var btns = document.querySelectorAll("#root button");
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      var t = text(b);
      if (!/^(开|关)\s*·/.test(t)) continue;
      if (!b.getAttribute("role")) b.setAttribute("role", "switch");
      b.setAttribute("aria-checked", /^开/.test(t) ? "true" : "false");
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "服药影响心率：" + (/^开/.test(t) ? "已服药" : "未服药"));
      if (!b.dataset.xnSw) {
        b.dataset.xnSw = "1";
        b.addEventListener("click", function () {
          var self = this;
          setTimeout(function () {
            var nt = text(self);
            self.setAttribute("aria-checked", /^开/.test(nt) ? "true" : "false");
            self.setAttribute("aria-label", "服药影响心率：" + (/^开/.test(nt) ? "已服药" : "未服药"));
          }, 60);
        });
      }
    }
  }

  /* 4. 常用值 */
  function enhancePresets() {
    var inputs = document.querySelectorAll('#root input[type="number"]');
    for (var i = 0; i < inputs.length; i++) {
      var el = inputs[i];
      var label = el.getAttribute("aria-label") || "";
      var vals = PRESETS[label];
      if (!vals) continue;
      var box = el.parentElement;
      if (!box || box.querySelector(":scope > .xn-pulse-presets")) continue;
      var row = document.createElement("div");
      row.className = "xn-pulse-presets";
      for (var j = 0; j < vals.length; j++) {
        (function (v) {
          var b = document.createElement("button");
          b.type = "button";
          b.textContent = String(v);
          b.dataset.xnVal = String(v);
          b.setAttribute("aria-label", "填入 " + v);
          row.appendChild(b);
        })(vals[j]);
      }
      box.appendChild(row);
    }
  }

  /* 5. 修复 : 输入的语义 */
  function fixColons() {
    var cols = [];
    var inputs = document.querySelectorAll('#root input[type="number"]');
    for (var i = 0; i < inputs.length; i++) {
      if ((inputs[i].getAttribute("aria-label") || "").trim() === ":") cols.push(inputs[i]);
    }
    if (cols.length >= 2) {
      if (!cols[0].getAttribute("data-xn-fixed")) {
        cols[0].setAttribute("aria-label", "时间-分");
        cols[1].setAttribute("aria-label", "时间-秒");
        cols[0].setAttribute("data-xn-fixed", "1");
        cols[1].setAttribute("data-xn-fixed", "1");
      }
    }
    if (cols.length >= 4) {
      if (!cols[2].getAttribute("data-xn-fixed")) {
        cols[2].setAttribute("aria-label", "目标配速-分");
        cols[3].setAttribute("aria-label", "目标配速-秒");
        cols[2].setAttribute("data-xn-fixed", "1");
        cols[3].setAttribute("data-xn-fixed", "1");
      }
    }
  }

  /* 6. 空态引导 */
  function markEmpty() {
    var leaves = document.querySelectorAll("#root p, #root div");
    for (var i = 0; i < leaves.length; i++) {
      var el = leaves[i];
      if (el.children.length) continue;
      if (el.classList.contains("xn-pulse-empty")) continue;
      var t = text(el);
      if (!/^填写上方参数并点击|^填写距离与时间后点击/.test(t)) continue;
      el.classList.add("xn-pulse-empty");
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = "用默认值计算";
      b.dataset.xnCalc = /心率/.test(t) ? "heart" : "pace";
      b.setAttribute("aria-label", "用默认参数计算");
      el.appendChild(b);
    }
  }

  /* 7. 复制/清空语义 */
  function markButtons() {
    var btns = document.querySelectorAll("#root button");
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      if (b.getAttribute("aria-label")) continue;
      var t = text(b);
      if (t === "复制结果") b.setAttribute("aria-label", "复制计算结果");
      else if (t === "清空") b.setAttribute("aria-label", "清空全部参数");
    }
  }

  function onClick(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var chip = t.closest(".xn-pulse-presets button");
    if (chip) {
      var box = chip.parentElement && chip.parentElement.parentElement;
      var input = box && box.querySelector('input[type="number"]');
      if (input) { setNative(input, chip.dataset.xnVal); input.focus(); }
      return;
    }
    var cta = t.closest(".xn-pulse-empty button");
    if (cta) {
      var want = cta.dataset.xnCalc === "heart" ? /计算心率区间/ : /计算配速与步频/;
      var btns = document.querySelectorAll("#root button");
      for (var i = 0; i < btns.length; i++) {
        if (want.test(text(btns[i]))) { btns[i].click(); break; }
      }
      return;
    }
    if (t.closest('#root button[data-xn-num]')) setTimeout(syncTabs, 60);
  }

  function enhanceAll() {
    try {
      normalizeHeadings();
      enhanceTabs();
      enhanceSwitch();
      enhancePresets();
      fixColons();
      markEmpty();
      markButtons();
    } catch (e) { /* 增强失败不影响原功能 */ }
  }

  function boot() {
    var root = document.getElementById("root");
    if (!root) { setTimeout(boot, 300); return; }
    enhanceAll();
    document.addEventListener("click", onClick, true);
    try {
      new MutationObserver(function () { enhanceAll(); }).observe(root, { childList: true, subtree: true });
    } catch (e) {}
    setInterval(enhanceAll, 900);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
