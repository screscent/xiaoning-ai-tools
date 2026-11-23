/* xn-billing.js · 账单日与免息期合集：标题归一 / tab 语义 / 常用值 / 结果可读（幂等） */
(function () {
  "use strict";
  if (window.__XN_BILLING__) return;
  window.__XN_BILLING__ = 1;

  var CN = ["一", "二", "三", "四", "五", "六"];
  var CIRCLE = ["①", "②", "③", "④", "⑤", "⑥"];
  var NAMES = {
    "tool-billing": "账单日规划",
    "tool-grace": "免息期计算",
    "tool-repay": "还款日提醒",
    "tool-installment": "分期成本",
    "tool-minpay": "最低还款利息",
    "tool-plan50": "还款规划"
  };
  var PRESETS = [
    { key: /^账单日/, items: [1, 5, 10, 15, 20, 25], unit: "日" },
    { key: /^还款日/, items: [5, 10, 15, 20, 25, 28], unit: "日" },
    { key: /分期手续费率/, items: [0.6, 0.7, 0.75], unit: "%" },
    { key: /最低还款比例/, items: [5, 10, 15, 20], unit: "%" },
    { key: /日利率/, items: [0.05, 0.04, 0.035], unit: "%" },
    { key: /延后天数/, items: [0, 3, 7, 15, 30], unit: "天" },
    { key: /账单金额/, items: [3000, 5000, 10000, 20000, 50000], unit: "元", money: true },
    { key: /月收入/, items: [5000, 8000, 12000, 20000], unit: "元", money: true },
    { key: /固定支出/, items: [2000, 3000, 5000, 8000], unit: "元", money: true },
    { key: /待还总额/, items: [5000, 10000, 20000, 50000], unit: "元", money: true },
    { key: /期望还清月数/, items: [3, 6, 12, 24], unit: "月" }
  ];

  function text(el) { return (el && (el.textContent || "").trim()) || ""; }

  function setNative(el, value) {
    var proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    var setter = Object.getOwnPropertyDescriptor(proto, "value").set;
    setter.call(el, String(value));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function fmtDate(d) {
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" + m : m) + "-" + (day < 10 ? "0" + day : day);
  }

  /* 1. 六个区块标题统一为「工具X · 名称」 */
  function normalizeHeadings() {
    var sections = document.querySelectorAll('#root section[id^="tool-"]');
    for (var i = 0; i < sections.length; i++) {
      var sec = sections[i];
      var name = NAMES[sec.id];
      var h = sec.querySelector("h2");
      if (!name || !h) continue;
      var want = "工具" + (CN[i] || (i + 1)) + " · " + name;
      if (text(h) !== want) h.textContent = want;
    }
  }

  /* 2. tab：编号、当前态、可访问名称 */
  function enhanceTabs() {
    var nav = document.querySelector("#root nav.grid");
    if (!nav) return;
    var links = nav.querySelectorAll('a[href^="#/"]');
    var hash = (location.hash || "").replace(/^#\//, "");
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var num = CIRCLE[i] || String(i + 1);
      if (a.getAttribute("data-xn-num") !== num) a.setAttribute("data-xn-num", num);
      var id = (a.getAttribute("href") || "").replace(/^#\//, "");
      var active = hash ? id === hash : /bg-white/.test(a.className);
      if (!hash && i === 0) active = true;
      if (active) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
      if (!a.getAttribute("aria-label")) a.setAttribute("aria-label", "切换到工具" + (CN[i] || (i + 1)) + " " + text(a).replace(/^[①②③④⑤⑥]\s*/, ""));
    }
  }

  /* 3. 常用值 chip */
  function buildPresets(input, list, unit, money, dateMode) {
    var box = input.parentElement;
    if (!box) return;
    if (box.querySelector(":scope > .xn-bill-presets")) return;
    var row = document.createElement("div");
    row.className = "xn-bill-presets";
    row.dataset.xnFor = "1";
    for (var i = 0; i < list.length; i++) {
      (function (v) {
        var b = document.createElement("button");
        b.type = "button";
        if (dateMode) {
          b.textContent = v.label;
          b.dataset.xnVal = v.value;
        } else {
          var label = money ? "¥" + Number(v).toLocaleString("zh-CN")
            : (/%$/.test(unit) ? v + unit : v + " " + unit);
          b.textContent = label;
          b.dataset.xnVal = String(v);
        }
        b.setAttribute("aria-label", "填入 " + b.textContent);
        row.appendChild(b);
      })(list[i]);
    }
    box.appendChild(row);
  }

  function enhancePresets() {
    var inputs = document.querySelectorAll('#root section[id^="tool-"] input');
    for (var i = 0; i < inputs.length; i++) {
      var input = inputs[i];
      var label = input.getAttribute("aria-label") || "";
      if (!label) continue;
      if (input.type === "date") {
        if (!/消费日期|当前日期/.test(label)) continue;
        var today = new Date();
        var next = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
        buildPresets(input, [
          { label: "今天", value: fmtDate(today) },
          { label: "下月同日", value: fmtDate(next) }
        ], "", false, true);
        continue;
      }
      if (input.type !== "number") continue;
      for (var j = 0; j < PRESETS.length; j++) {
        if (PRESETS[j].key.test(label)) {
          buildPresets(input, PRESETS[j].items, PRESETS[j].unit, !!PRESETS[j].money, false);
          break;
        }
      }
    }
  }

  /* 4. 结果提示 / 面板语义 */
  function markNotes() {
    var list = document.querySelectorAll("#root section p");
    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      if (p.children.length) continue;
      var t = text(p);
      if (!t || t.length > 60) continue;
      if (/^请填写|^请选择|^请输入|需在|不能超过|无效/.test(t)) p.classList.add("xn-bill-note");
      else if (/^有效|^通过|^可还款/.test(t)) p.classList.add("xn-bill-note", "xn-bill-ok");
    }
    var panels = document.querySelectorAll("#root section .bg-white.rounded-xl");
    for (var j = 0; j < panels.length; j++) {
      if (panels[j].querySelector("h3") && !panels[j].getAttribute("aria-live")) {
        panels[j].setAttribute("aria-live", "polite");
      }
    }
    var btns = document.querySelectorAll("#root section button.w-full");
    for (var k = 0; k < btns.length; k++) {
      if (!btns[k].getAttribute("aria-label")) btns[k].setAttribute("aria-label", "复制计算结果");
    }
  }

  /* 4b. 主结果：第一个含数字的值放大 */
  function markPrimaryValue() {
    var sections = document.querySelectorAll('#root section[id^="tool-"]');
    for (var i = 0; i < sections.length; i++) {
      var sec = sections[i];
      if (sec.classList.contains("hidden")) continue;
      var vals = sec.querySelectorAll(".font-mono.font-semibold");
      var primary = null;
      for (var j = 0; j < vals.length; j++) {
        vals[j].classList.remove("xn-primary", "xn-textval");
        if (/\d/.test(vals[j].textContent || "")) {
          if (!primary) primary = vals[j];
        } else {
          vals[j].classList.add("xn-textval");
        }
      }
      if (primary) primary.classList.add("xn-primary");
    }
  }

  /* 5. 事件委托：常用值填入 */
  function onClick(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var b = t.closest(".xn-bill-presets button");
    if (!b) return;
    var row = b.parentElement;
    var box = row && row.parentElement;
    var input = box && box.querySelector("input");
    if (!input) return;
    setNative(input, b.dataset.xnVal || "");
    input.focus();
  }

  function enhanceAll() {
    try {
      normalizeHeadings();
      enhanceTabs();
      enhancePresets();
      markNotes();
      markPrimaryValue();
    } catch (e) { /* 增强失败不影响原功能 */ }
  }

  function boot() {
    var root = document.getElementById("root");
    if (!root) { setTimeout(boot, 300); return; }
    enhanceAll();
    document.addEventListener("click", onClick, true);
    window.addEventListener("hashchange", enhanceTabs);
    try {
      new MutationObserver(function () { enhanceAll(); }).observe(root, { childList: true, subtree: true });
    } catch (e) {}
    setInterval(enhanceAll, 900);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
