/* 任务优先级与四象限合集页增强（仅 4gs8yrbtnf 引用）
 * - 阈值/权重/可排分钟/任务间隔/目标完成率/跟进间隔 快捷值
 * - 象限任务数、占比、评分算式放大
 */
(function () {
  "use strict";
  if (window.__XN_QUAD__) return;
  window.__XN_QUAD__ = true;

  function txt(el) { return (el.textContent || "").trim(); }
  function setVal(el, v) {
    var proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    proto.set.call(el, String(v));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }
  function visible(el) { return el.getBoundingClientRect().height > 0; }

  var RULES = [
    { re: /^象限阈值/, vals: [2, 3, 4] },
    { re: /权重/, vals: [1, 1.5, 2, 2.5] },
    { re: /^可排分钟/, vals: [240, 480, 600] },
    { re: /任务间隔/, vals: [0, 5, 10, 15] },
    { re: /目标完成率/, vals: [50, 70, 85, 100] },
    { re: /跟进间隔/, vals: [1, 2, 3, 5] }
  ];

  function addChips(input) {
    if (!visible(input)) return;
    var label = input.getAttribute("aria-label") || "";
    var rule = null;
    for (var i = 0; i < RULES.length; i++) if (RULES[i].re.test(label)) { rule = RULES[i]; break; }
    if (!rule || input.__xnChips) return;
    var host = input.parentElement;
    if (!host) return;
    var cs = window.getComputedStyle(host);
    var flexRow = cs.display.indexOf("flex") === 0 && cs.flexDirection.indexOf("row") === 0;
    var wrap = document.createElement("div");
    wrap.className = "xn-chips";
    rule.vals.forEach(function (v) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = v;
      b.onclick = function () { setVal(input, v); setTimeout(updateAll, 40); };
      wrap.appendChild(b);
    });
    if (flexRow && host.parentElement) host.parentElement.insertBefore(wrap, host.nextSibling);
    else host.appendChild(wrap);
    input.__xnChips = true;
    input.addEventListener("input", function () { sync(input, wrap, rule); });
    sync(input, wrap, rule);
  }

  function sync(input, wrap, rule) {
    var cur = parseFloat(input.value);
    [].slice.call(wrap.children).forEach(function (b, i) {
      b.classList.toggle("is-on", !isNaN(cur) && cur === rule.vals[i]);
    });
  }

  function markNumbers() {
    var nodes = document.querySelectorAll("#root span, #root div, #root p, #root b, #root td");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.children.length) continue;
      var t = txt(el);
      if (/^\d+\s?项$/.test(t)) el.classList.add("xn-cnt");
      else if (/^\d+%$/.test(t)) el.classList.add("xn-pct");
      else if (/^\d+\+\d+=\d+$/.test(t)) el.classList.add("xn-score");
    }
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    [].slice.call(document.querySelectorAll("#root input")).forEach(addChips);
    markNumbers();
  }

  var scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(function () { scheduled = false; try { updateAll(); } catch (e) {} }, 240);
  }

  function boot() {
    var root = document.getElementById("root");
    if (!root) { setTimeout(boot, 300); return; }
    updateAll();
    new MutationObserver(schedule).observe(root, {
      childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["class"]
    });
    window.addEventListener("hashchange", schedule);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
