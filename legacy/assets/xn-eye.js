/* 眼镜与视力保护速查合集页增强（仅 2q767tqqxb 引用）
 * - 工具E/工具F 占位清理
 * - 屏幕距离与折射率：输入补单位 aria + 常用值胶囊
 * - 推荐折射率数字 24px
 */
(function () {
  "use strict";
  if (window.__XN_EYE__) return;
  window.__XN_EYE__ = true;

  function txt(el) { return (el.textContent || "").trim(); }
  function setVal(el, v) {
    var proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    proto.set.call(el, String(v));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }
  function visible(el) { return el.getBoundingClientRect().height > 0; }

  function fixPlaceholders() {
    [].slice.call(document.querySelectorAll("#root span, #root div, #root p, #root h1, #root h2, #root h3")).forEach(function (el) {
      if (el.children.length) return;
      var t = txt(el);
      if (/^工具[A-Z]\s*[·:：]?\s*/.test(t)) {
        var next = t.replace(/^工具[A-Z]\s*[·:：]?\s*/, "");
        if (next) el.textContent = next;
      }
    });
  }

  function markIndex() {
    [].slice.call(document.querySelectorAll("#root span, #root div, #root p")).forEach(function (el) {
      if (el.children.length) return;
      if (/^1\.\d{2}\s*\/\s*1\.\d{2}$/.test(txt(el))) el.classList.add("xn-idx");
    });
  }

  var RULES = [
    { re: /^屏幕尺寸/, unit: "英寸", vals: [13, 15, 24, 27] },
    { re: /^当前使用距离/, unit: "cm", vals: [40, 50, 60, 70] },
    { re: /^每日屏幕时长/, unit: "小时", vals: [2, 4, 6, 8] },
    { re: /^年龄/, unit: "岁", vals: [12, 18, 30, 45] },
    { re: /^度数（球镜）/, unit: "", vals: [-200, -400, -600, -800] }
  ];

  function addChips(input) {
    if (!visible(input)) return;
    var label = input.getAttribute("aria-label") || "";
    var rule = null;
    for (var i = 0; i < RULES.length; i++) if (RULES[i].re.test(label)) { rule = RULES[i]; break; }
    if (!rule) return;
    if (label.indexOf("（") < 0 && rule.unit) input.setAttribute("aria-label", label + "（" + rule.unit + "）");
    var host = input.parentElement;
    if (!host || input.__xnChips) return;
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

  function updateAll() {
    if (!document.getElementById("root")) return;
    fixPlaceholders();
    markIndex();
    [].slice.call(document.querySelectorAll("#root input")).forEach(addChips);
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
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
