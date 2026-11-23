/* xn-highway.js · 租车费用合集：标题归一 / 导航语义 / 输入语义 / 示例填充（幂等） */
(function () {
  "use strict";
  if (window.__XN_HIGHWAY__) return;
  window.__XN_HIGHWAY__ = 1;

  var CN = ["一", "二", "三", "四", "五", "六"];
  var CIRCLE = ["①", "②", "③", "④", "⑤", "⑥"];
  var IDS = ["tool-cost", "tool-deposit", "tool-insurance", "tool-compare", "tool-mileage", "tool-total"];
  var NAMES = {
    "tool-cost": "租金与附加费",
    "tool-deposit": "押金与预授权",
    "tool-insurance": "保险与免赔",
    "tool-compare": "车型对比",
    "tool-mileage": "超里程费",
    "tool-total": "租车总成本对照"
  };
  var FILL = [
    { k: /租期|租车天数|天数/, v: 5 },
    { k: /日租金/, v: 300 },
    { k: /异地还车/, v: 0 },
    { k: /附加服务/, v: 0 },
    { k: /包含里程/, v: 1000 },
    { k: /实际里程/, v: 1300 },
    { k: /超里程单价|单价/, v: 1.5 },
    { k: /日保险|保险价/, v: 50 },
    { k: /免赔/, v: 1500 },
    { k: /预计里程/, v: 1000 }
  ];

  function text(el) { return (el && (el.textContent || "").trim()) || ""; }

  function setNative(el, value) {
    var proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    var setter = Object.getOwnPropertyDescriptor(proto, "value").set;
    setter.call(el, String(value));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function visibleIndex() {
    for (var i = 0; i < IDS.length; i++) {
      var s = document.getElementById(IDS[i]);
      if (s && !s.classList.contains("hidden")) return i;
    }
    return 0;
  }

  /* 1. 标题归一 */
  function normalizeHeadings() {
    for (var i = 0; i < IDS.length; i++) {
      var sec = document.getElementById(IDS[i]);
      if (!sec) continue;
      var h = sec.querySelector("h2");
      if (!h) continue;
      var want = "工具" + CN[i] + " · " + NAMES[IDS[i]];
      if (text(h) !== want) h.textContent = want;
    }
  }

  /* 2. 导航编号与当前态 */
  function enhanceTabs() {
    var tabs = document.querySelectorAll('#root button[class*="whitespace-nowrap"]');
    var idx = visibleIndex();
    for (var i = 0; i < tabs.length && i < 6; i++) {
      var b = tabs[i];
      if (b.getAttribute("data-xn-num") !== CIRCLE[i]) b.setAttribute("data-xn-num", CIRCLE[i]);
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "切换到工具" + CN[i] + " " + NAMES[IDS[i]]);
      if (i === idx) b.setAttribute("aria-current", "true");
      else b.removeAttribute("aria-current");
    }
  }

  /* 3. 输入语义 */
  function fixAria() {
    var inputs = document.querySelectorAll('#root input[type="number"]');
    for (var i = 0; i < inputs.length; i++) {
      var el = inputs[i];
      var aria = (el.getAttribute("aria-label") || "").trim();
      if (aria && aria.length > 2 && !/^(天|元|元\/天|km|公里)$/.test(aria)) continue;
      var lab = el.closest("label");
      if (!lab) {
        var box = el.parentElement;
        if (box && box.previousElementSibling) {
          var prev = box.previousElementSibling;
          lab = prev.tagName === "LABEL" ? prev : prev.querySelector("label");
        }
      }
      var name = "";
      if (lab) {
        var first = lab.childNodes && lab.childNodes[0];
        name = first && first.nodeType === 3 ? (first.textContent || "").trim() : "";
        if (!name) name = text(lab).slice(0, 16);
      }
      if (!name) continue;
      var want = aria ? name + "（" + aria + "）" : name;
      if (el.getAttribute("aria-label") !== want) el.setAttribute("aria-label", want);
    }
  }

  /* 4. 空态引导 */
  function markEmpty() {
    var leaves = document.querySelectorAll("#root p, #root div");
    for (var i = 0; i < leaves.length; i++) {
      var el = leaves[i];
      if (el.children.length) continue;
      if (el.classList.contains("xn-rent-empty")) continue;
      if (!/^请填写/.test(text(el))) continue;
      el.classList.add("xn-rent-empty");
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = "填入示例数据";
      b.setAttribute("aria-label", "填入示例数据并查看计算结果");
      el.appendChild(b);
    }
  }

  /* 5. 主结果 */
  function markPrimary() {
    var idx = visibleIndex();
    var sec = document.getElementById(IDS[idx]);
    if (!sec) return;
    var vals = sec.querySelectorAll(".text-lg.font-bold");
    var first = null;
    for (var i = 0; i < vals.length; i++) {
      vals[i].classList.remove("xn-primary");
      if (!first && /\d/.test(vals[i].textContent || "")) first = vals[i];
    }
    if (first) first.classList.add("xn-primary");
  }

  /* 6. 复制按钮语义 */
  function markCopy() {
    var btns = document.querySelectorAll("#root button");
    for (var i = 0; i < btns.length; i++) {
      if (/复制结果/.test(text(btns[i])) && !btns[i].getAttribute("aria-label")) {
        btns[i].setAttribute("aria-label", "复制计算结果");
      }
    }
  }

  function fillSample() {
    var idx = visibleIndex();
    var sec = document.getElementById(IDS[idx]);
    if (!sec) return;
    var nums = sec.querySelectorAll('input[type="number"]');
    for (var i = 0; i < nums.length; i++) {
      var label = nums[i].getAttribute("aria-label") || "";
      for (var j = 0; j < FILL.length; j++) {
        if (FILL[j].k.test(label)) { setNative(nums[i], FILL[j].v); break; }
      }
    }
    var sels = sec.querySelectorAll("select");
    for (var k = 0; k < sels.length; k++) {
      if (sels[k].selectedIndex <= 0 && sels[k].options.length > 1) {
        sels[k].selectedIndex = 1;
        sels[k].dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
  }

  function onClick(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest(".xn-rent-empty button")) { fillSample(); return; }
    if (t.closest('#root button[class*="whitespace-nowrap"]')) {
      setTimeout(function () { enhanceTabs(); markPrimary(); }, 80);
    }
  }

  function enhanceAll() {
    try {
      normalizeHeadings();
      enhanceTabs();
      fixAria();
      markEmpty();
      markPrimary();
      markCopy();
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
