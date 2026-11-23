/* xn-tread.js · 轮胎规格合集：标题归一 / 直达卡编号 / 输入语义 / 常用规格（幂等） */
(function () {
  "use strict";
  if (window.__XN_TREAD__) return;
  window.__XN_TREAD__ = 1;

  var CN = ["一", "二", "三", "四", "五", "六"];
  var NAMES = {
    "tool-size": "轮胎规格解读",
    "tool-upgrade": "轮毂升级与适配",
    "tool-pressure": "胎压与载重",
    "tool-wear": "轮胎磨损与更换周期",
    "tool-circumference": "轮胎周长与转数",
    "speedo": "速度表误差换算"
  };
  var SPECS = ["195/65 R15", "205/55 R16", "215/55 R17", "225/45 R18", "235/45 R18", "245/40 R19"];

  function text(el) { return (el && (el.textContent || "").trim()) || ""; }

  function setNative(el, value) {
    var proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    var setter = Object.getOwnPropertyDescriptor(proto, "value").set;
    setter.call(el, String(value));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  /* 1. 区块标题归一（只改 section 内，不动顶部卡片 h2） */
  function normalizeHeadings() {
    var ids = ["tool-size", "tool-upgrade", "tool-pressure", "tool-wear", "tool-circumference", "speedo"];
    for (var i = 0; i < ids.length; i++) {
      var sec = document.getElementById(ids[i]);
      if (!sec) continue;
      var h = sec.querySelector("h2");
      if (!h) continue;
      var want = "工具" + CN[i] + " · " + NAMES[ids[i]];
      if (text(h) !== want) h.textContent = want;
    }
  }

  /* 2. 顶部直达卡编号 */
  function markCards() {
    var cards = document.querySelectorAll('#root a[href^="#/"]');
    for (var i = 0; i < cards.length; i++) {
      var a = cards[i];
      var num = i + 1 < 10 ? "0" + (i + 1) : String(i + 1);
      if (a.getAttribute("data-xn-num") !== num) a.setAttribute("data-xn-num", num);
      if (!a.getAttribute("aria-label")) {
        var title = a.querySelector("h2, .text-lg, .text-xl");
        a.setAttribute("aria-label", "跳转到工具" + (CN[i] || "") + " " + (text(title) || text(a).slice(0, 12)));
      }
    }
  }

  /* 3. 输入语义补全 */
  function fixAria() {
    var inputs = document.querySelectorAll('#root input');
    for (var i = 0; i < inputs.length; i++) {
      var el = inputs[i];
      var aria = (el.getAttribute("aria-label") || "").trim();
      if (aria && aria !== "mm" && aria !== "J") continue;
      var lab = el.closest("label");
      var box = el.parentElement;
      if (!lab && box && box.previousElementSibling) {
        var prev = box.previousElementSibling;
        lab = prev.tagName === "LABEL" ? prev : prev.querySelector("label");
      }
      var name = "";
      if (lab) {
        var first = lab.childNodes && lab.childNodes[0];
        name = first && first.nodeType === 3 ? (first.textContent || "").trim() : "";
        if (!name) name = text(lab).replace(/(轮毂背面刻印|侧壁末尾.*|选填.*|单位)$/g, "").trim().slice(0, 18);
      }
      if (!name) continue;
      var suffix = aria === "mm" ? "（mm）" : aria === "J" ? "（J）" : "";
      var want = name + suffix;
      if (el.getAttribute("aria-label") !== want) el.setAttribute("aria-label", want);
    }
  }

  /* 4. 常用规格 */
  function enhanceSpecs() {
    var inputs = document.querySelectorAll('#root input[type="text"]');
    for (var i = 0; i < inputs.length; i++) {
      var el = inputs[i];
      var aria = el.getAttribute("aria-label") || "";
      if (!/轮胎规格|原配|原车轮胎规格|升级后/.test(aria)) continue;
      var box = el.parentElement;
      if (!box || box.querySelector(":scope > .xn-tread-presets")) continue;
      var row = document.createElement("div");
      row.className = "xn-tread-presets";
      for (var j = 0; j < SPECS.length; j++) {
        (function (v) {
          var b = document.createElement("button");
          b.type = "button";
          b.textContent = v;
          b.dataset.xnVal = v;
          b.setAttribute("aria-label", "填入规格 " + v);
          row.appendChild(b);
        })(SPECS[j]);
      }
      box.appendChild(row);
    }
  }

  /* 5. 按钮语义 */
  function markButtons() {
    var btns = document.querySelectorAll("#root button");
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      if (b.getAttribute("aria-label")) continue;
      var t = text(b);
      if (t === "复制") b.setAttribute("aria-label", "复制计算结果");
      else if (t === "使用说明") b.setAttribute("aria-label", "展开或收起使用说明");
    }
  }

  function onClick(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var chip = t.closest(".xn-tread-presets button");
    if (!chip) return;
    var box = chip.parentElement && chip.parentElement.parentElement;
    var input = box && box.querySelector('input[type="text"]');
    if (input) { setNative(input, chip.dataset.xnVal); input.focus(); }
  }

  function enhanceAll() {
    try {
      normalizeHeadings();
      markCards();
      fixAria();
      enhanceSpecs();
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
