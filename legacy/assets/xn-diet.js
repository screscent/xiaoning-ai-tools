/* 饮食营养速查合集页增强（仅 2q82y7qqxb 引用）
 * 1) 数字框 aria 从「g / kJ / mg / kg」改为「份量（g）」等字段名
 * 2) 类别/食物/份量/运动量等选择按钮补 aria-pressed
 * 3) 6 个工具 tab 补 aria-current
 */
(function () {
  "use strict";
  if (window.__XN_DIET__) return;
  window.__XN_DIET__ = true;

  function txt(el) { return (el.textContent || "").trim(); }
  var UNITS = /^(g|kg|kJ|kcal|mg|ml)$/i;
  var LABEL_RE = /^[\u4e00-\u9fa5][\u4e00-\u9fa5（）()·\-]{1,13}$/;

  function visible(el) { return el.getBoundingClientRect().height > 0; }

  function labelOf(input) {
    var n = input;
    for (var i = 0; i < 4 && n; i++, n = n.parentElement) {
      if (!n.innerText) continue;
      var lines = n.innerText.split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
      if (!lines.length) continue;
      var first = lines[0];
      if (LABEL_RE.test(first) && first !== input.value) return first;
    }
    return "";
  }

  function fixInputs() {
    [].slice.call(document.querySelectorAll("#root input")).forEach(function (input) {
      if (!visible(input)) return;
      var cur = (input.getAttribute("aria-label") || "").trim();
      var unit = UNITS.test(cur) ? cur : "";
      if (cur && !UNITS.test(cur) && cur.length > 2) return;
      var label = labelOf(input);
      if (!label && unit === "kJ") label = "每份能量";
      if (!label && unit === "kcal") label = "能量";
      if (!label && unit === "ml") label = "容量";
      if (!label) return;
      var next = unit ? label + "（" + unit + "）" : label;
      if (cur !== next) input.setAttribute("aria-label", next);
    });
  }

  function fixPressed() {
    var groups = {};
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      var cls = (b.className || "").toString();
      if (!/rounded-(full|xl) border/.test(cls)) return;
      var t = txt(b);
      if (!t || t.length > 40) return;
      if (/复制|下载|清空|重置|生成|开始|查看|展开|收起/.test(t)) return;
      if (/w-full/.test(cls)) return;
      var parent = b.parentElement;
      if (!parent) return;
      if (!groups[parent.__xnId]) {
        parent.__xnId = "g" + Object.keys(groups).length;
        groups[parent.__xnId] = [];
      }
      groups[parent.__xnId].push(b);
    });
    Object.keys(groups).forEach(function (k) {
      groups[k].forEach(function (b) {
        var on = /bg-\[#2f6b52\]/.test((b.className || "").toString());
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
    });
  }

  function fixNav() {
    [].slice.call(document.querySelectorAll('#root a[href^="#/"]')).forEach(function (a) {
      var cls = (a.className || "").toString();
      var active = /bg-white/.test(cls) && /shadow-sm/.test(cls);
      if (active) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    fixInputs();
    fixPressed();
    fixNav();
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
