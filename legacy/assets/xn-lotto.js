/* xn-lotto.js · 随机分组与抽签合集：标题归一 / tab 语义 / 人数快捷 / 空态引导（幂等） */
(function () {
  "use strict";
  if (window.__XN_LOTTO__) return;
  window.__XN_LOTTO__ = 1;

  var CN = ["一", "二", "三", "四", "五", "六"];
  var CIRCLE = ["①", "②", "③", "④", "⑤", "⑥"];
  var HASH_ORDER = ["group", "rep", "order", "export", "bracket", "seed"];

  function text(el) { return (el && (el.textContent || "").trim()) || ""; }

  function setNative(el, value) {
    var proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    var setter = Object.getOwnPropertyDescriptor(proto, "value").set;
    setter.call(el, String(value));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function activeIndex() {
    var tabs = document.querySelectorAll('#root a[href^="#/"]');
    for (var i = 0; i < tabs.length; i++) {
      if (/border-indigo-500|text-indigo-600/.test(tabs[i].className)) return i;
    }
    var h = (location.hash || "").replace(/^#\//, "");
    var k = HASH_ORDER.indexOf(h);
    return k > -1 ? k : 0;
  }

  /* 1. 标题归一 */
  function normalizeHeading() {
    var h2 = document.querySelector("#root h2");
    if (!h2) return;
    var t = text(h2);
    var name = t.replace(/^工具[一二三四五六]\s*·\s*/, "");
    var idx = activeIndex();
    var want = "工具" + (CN[idx] || "") + " · " + name;
    if (t !== want) h2.textContent = want;
  }

  /* 2. tab 编号与当前态 */
  function enhanceTabs() {
    var tabs = document.querySelectorAll('#root a[href^="#/"]');
    for (var i = 0; i < tabs.length; i++) {
      var a = tabs[i];
      if (a.getAttribute("data-xn-num") !== CIRCLE[i]) a.setAttribute("data-xn-num", CIRCLE[i] || "");
      var id = (a.getAttribute("href") || "").replace(/^#\//, "");
      if (!a.getAttribute("aria-label")) a.setAttribute("aria-label", "切换到工具" + CN[i] + " " + text(a));
      if (/border-indigo-500|text-indigo-600/.test(a.className) || id === (location.hash || "").replace(/^#\//, "")) {
        a.setAttribute("aria-current", "true");
      } else {
        a.removeAttribute("aria-current");
      }
    }
  }

  /* 3. 已识别人数 */
  function markCount() {
    var els = document.querySelectorAll("#root span, #root div, #root p");
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      if (e.children.length) continue;
      if (/^已识别\s*\d+\s*人$/.test(text(e))) e.classList.add("xn-count-chip");
    }
  }

  /* 4. 每组人数快捷值 */
  function enhancePresets() {
    var input = document.querySelector('#root input[aria-label^="每组人数"]');
    if (!input) return;
    var box = input.parentElement;
    if (!box || box.querySelector(":scope > .xn-lotto-presets")) return;
    var row = document.createElement("div");
    row.className = "xn-lotto-presets";
    var vals = [2, 3, 4, 5, 6, 8];
    for (var i = 0; i < vals.length; i++) {
      (function (v) {
        var b = document.createElement("button");
        b.type = "button";
        b.textContent = v + " 人";
        b.dataset.xnVal = String(v);
        b.setAttribute("aria-label", "每组 " + v + " 人");
        row.appendChild(b);
      })(vals[i]);
    }
    box.appendChild(row);
  }

  /* 5. 空态引导：载入示例名单 */
  function markEmpty() {
    var els = document.querySelectorAll("#root div, #root p");
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      if (text(e) !== "请先输入名单") continue;
      if (e.querySelector(".xn-empty-cta")) continue;
      e.classList.add("xn-empty-cta");
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = "载入 20 人示例名单";
      b.setAttribute("aria-label", "载入 20 人示例名单并分组");
      e.appendChild(b);
      break;
    }
  }

  /* 6. 按钮语义 */
  function markButtons() {
    var btns = document.querySelectorAll("#root button");
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      if (b.getAttribute("aria-label")) continue;
      var t = text(b);
      if (t === "示例名单") b.setAttribute("aria-label", "载入 20 人示例名单");
      else if (t === "清空") b.setAttribute("aria-label", "清空名单");
      else if (/^重新/.test(t)) b.setAttribute("aria-label", t);
      else if (/^复制/.test(t)) b.setAttribute("aria-label", t);
    }
  }

  /* 7. 事件委托 */
  function onClick(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var chip = t.closest(".xn-lotto-presets button");
    if (chip) {
      var box = chip.parentElement && chip.parentElement.parentElement;
      var input = box && box.querySelector('input[type="number"]');
      if (input) { setNative(input, chip.dataset.xnVal); input.focus(); }
      return;
    }
    if (t.closest(".xn-empty-cta button")) {
      var sample = null;
      var btns = document.querySelectorAll("#root button");
      for (var i = 0; i < btns.length; i++) {
        if (text(btns[i]) === "示例名单") { sample = btns[i]; break; }
      }
      if (sample) sample.click();
    }
  }

  function enhanceAll() {
    try {
      enhanceTabs();
      normalizeHeading();
      markCount();
      enhancePresets();
      markEmpty();
      markButtons();
    } catch (e) { /* 增强失败不影响原功能 */ }
  }

  function boot() {
    var root = document.getElementById("root");
    if (!root) { setTimeout(boot, 300); return; }
    enhanceAll();
    document.addEventListener("click", onClick, true);
    window.addEventListener("hashchange", function () { setTimeout(enhanceAll, 60); });
    try {
      new MutationObserver(function () { enhanceAll(); }).observe(root, { childList: true, subtree: true });
    } catch (e) {}
    setInterval(enhanceAll, 900);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
