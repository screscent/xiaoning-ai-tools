/* xn-calendar.js · 日期计算合集：标题归一 / tab 语义 / 日期快捷 / 主结果放大（幂等） */
(function () {
  "use strict";
  if (window.__XN_CALENDAR__) return;
  window.__XN_CALENDAR__ = 1;

  var CN = ["一", "二", "三", "四", "五", "六"];
  var CIRCLE = ["①", "②", "③", "④", "⑤", "⑥"];
  var NAMES = ["间隔天数", "日期推算", "星期信息", "日期比较", "工作日计算", "工期换算"];
  var OFFSETS = [
    { t: "今天", d: 0 },
    { t: "+7 天", d: 7 },
    { t: "+30 天", d: 30 },
    { t: "+100 天", d: 100 }
  ];

  function text(el) { return (el && (el.textContent || "").trim()) || ""; }

  function setNative(el, value) {
    var proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    var setter = Object.getOwnPropertyDescriptor(proto, "value").set;
    setter.call(el, String(value));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function dateStr(offset) {
    var d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + offset);
    var m = String(d.getMonth() + 1);
    var day = String(d.getDate());
    return d.getFullYear() + "-" + (m.length < 2 ? "0" + m : m) + "-" + (day.length < 2 ? "0" + day : day);
  }

  function activeIndex() {
    var tabs = document.querySelectorAll('#root button[class*="whitespace-nowrap"]');
    for (var i = 0; i < tabs.length && i < 6; i++) {
      if (/bg-blue-600/.test(tabs[i].className)) return i;
    }
    return 0;
  }

  /* 1. 标题归一 */
  function normalizeHeading() {
    var h = document.querySelector("#root h2");
    if (!h) return;
    var idx = activeIndex();
    var t = text(h).replace(/^工具[一二三四五六]\s*·\s*/, "");
    var want = "工具" + CN[idx] + " · " + t;
    if (text(h) !== want) h.textContent = want;
  }

  /* 2. tab 编号与当前态 */
  function enhanceTabs() {
    var tabs = document.querySelectorAll('#root button[class*="whitespace-nowrap"]');
    for (var i = 0; i < tabs.length && i < 6; i++) {
      var b = tabs[i];
      if (b.getAttribute("data-xn-num") !== CIRCLE[i]) b.setAttribute("data-xn-num", CIRCLE[i]);
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "切换到工具" + CN[i] + " " + NAMES[i]);
      b.setAttribute("aria-pressed", /bg-blue-600/.test(b.className) ? "true" : "false");
    }
  }

  /* 3. 日期快捷 */
  function enhanceDates() {
    var inputs = document.querySelectorAll('#root input[type="date"]');
    for (var i = 0; i < inputs.length; i++) {
      var el = inputs[i];
      var box = el.parentElement;
      if (!box || box.querySelector(":scope > .xn-date-presets")) continue;
      var row = document.createElement("div");
      row.className = "xn-date-presets";
      for (var j = 0; j < OFFSETS.length; j++) {
        (function (o) {
          var b = document.createElement("button");
          b.type = "button";
          b.textContent = o.t;
          b.dataset.xnOffset = String(o.d);
          b.setAttribute("aria-label", "设为" + o.t);
          row.appendChild(b);
        })(OFFSETS[j]);
      }
      box.appendChild(row);
    }
  }

  /* 4. 主结果行：不再放大单行，统一由结果横幅承担主视觉 */
  function markPrimary() {
    var rows = document.querySelectorAll("#root .xn-primary");
    for (var i = 0; i < rows.length; i++) rows[i].classList.remove("xn-primary");
  }

  /* 5. 按钮语义 */
  function markButtons() {
    var btns = document.querySelectorAll("#root button");
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      if (b.getAttribute("aria-label")) continue;
      var t = text(b);
      if (/复制结果/.test(t)) b.setAttribute("aria-label", "复制计算结果");
      else if (/使用说明/.test(t)) b.setAttribute("aria-label", "展开或收起使用说明");
    }
  }

  /* 6. 使用说明可访问化 */
  function enhanceGuide() {
    var divs = document.querySelectorAll("#root div");
    for (var i = 0; i < divs.length; i++) {
      var d = divs[i];
      if (d.dataset && d.dataset.xnGuide) continue;
      var t = text(d);
      if (!/^使用说明/.test(t)) continue;
      var h = d.getBoundingClientRect().height;
      if (h < 24 || h > 70) continue;
      d.dataset.xnGuide = "1";
      d.setAttribute("role", "button");
      d.setAttribute("tabindex", "0");
      d.setAttribute("aria-label", "展开或收起使用说明");
      var sib = d.nextElementSibling;
      d.setAttribute("aria-expanded", sib && sib.getBoundingClientRect().height > 4 ? "true" : "false");
      (function (el) {
        el.addEventListener("keydown", function (ev) {
          if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); el.click(); }
          setTimeout(function () {
            var s = el.nextElementSibling;
            el.setAttribute("aria-expanded", s && s.getBoundingClientRect().height > 4 ? "true" : "false");
          }, 80);
        });
        el.addEventListener("click", function () {
          setTimeout(function () {
            var s = el.nextElementSibling;
            el.setAttribute("aria-expanded", s && s.getBoundingClientRect().height > 4 ? "true" : "false");
          }, 120);
        });
      })(d);
    }
  }

  function onClick(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var chip = t.closest(".xn-date-presets button");
    if (chip) {
      var box = chip.parentElement && chip.parentElement.parentElement;
      var input = box && box.querySelector('input[type="date"]');
      if (input) { setNative(input, dateStr(Number(chip.dataset.xnOffset))); }
      return;
    }
    if (t.closest('#root button[class*="whitespace-nowrap"]')) {
      setTimeout(function () { enhanceTabs(); normalizeHeading(); markPrimary(); }, 80);
    }
  }

  function enhanceAll() {
    try {
      enhanceTabs();
      normalizeHeading();
      enhanceDates();
      markPrimary();
      markButtons();
      enhanceGuide();
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
