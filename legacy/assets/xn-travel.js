/* 旅行装备与打包速查合集页增强（仅 4ghafrbtnf 引用） */
(function () {
  "use strict";
  if (window.__XN_TRAVEL__) return;
  window.__XN_TRAVEL__ = true;

  function txt(el) { return (el.textContent || "").trim(); }
  function visible(el) {
    if (!el) return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }
  function setVal(el, v) {
    var proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    proto.set.call(el, String(v));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  /* ---------- 1. 工具E → 工具 05 ---------- */
  function fixPlaceholders() {
    var nodes = document.querySelectorAll("#root span, #root p, #root h1, #root h2, #root h3, #root a, #root strong, #root b, #root button");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.children.length) continue;
      var t = txt(el);
      if (!/工具E/.test(t)) continue;
      var sib05 = false;
      if (el.parentElement) {
        var sibs = el.parentElement.querySelectorAll("span");
        for (var s = 0; s < sibs.length; s++) {
          if (sibs[s] !== el && txt(sibs[s]) === "05") { sib05 = true; break; }
        }
      }
      if (t === "工具E") {
        el.textContent = sib05 ? "工具" : "工具 05 ";
      } else {
        el.textContent = t.replace(/工具E\s*05?/g, "工具 05 ").replace(/\s+/g, " ").trim();
      }
    }
  }

  /* ---------- 2. 打包条目 checkbox ---------- */
  function markItems() {
    var btns = [].slice.call(document.querySelectorAll("#root button")).filter(visible);
    btns.forEach(function (b) {
      var cb = b.querySelector("span");
      if (!cb) return;
      var cls = (cb.className || "").toString();
      if (cls.indexOf("h-[17px]") < 0 || cls.indexOf("w-[17px]") < 0) return;
      var on = cls.indexOf("bg-[#0f6b5c]") >= 0;
      var v = on ? "true" : "false";
      if (b.getAttribute("role") !== "checkbox") b.setAttribute("role", "checkbox");
      if (b.getAttribute("aria-checked") !== v) b.setAttribute("aria-checked", v);
      if (!b.classList.contains("xn-pack-item")) b.classList.add("xn-pack-item");
      if (!b.getAttribute("aria-label")) {
        var name = txt(b).split("×")[0].trim();
        if (name) b.setAttribute("aria-label", name);
      }
    });
  }

  /* ---------- 3. 出行天数快捷值 ---------- */
  function markSlider() {
    var input = document.querySelector('#root input[type="range"]');
    if (!input) return;
    if (input.getAttribute("aria-valuetext") !== input.value + "天") {
      input.setAttribute("aria-valuetext", input.value + "天");
    }
    var box = input.parentElement;
    if (!box) return;
    if (box.__xnChips && box.__xnChips.isConnected) return;
    var wrap = document.createElement("div");
    wrap.className = "xn-chips";
    [3, 5, 7, 10].forEach(function (v) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "xn-chip" + (parseFloat(input.value) === v ? " is-on" : "");
      b.textContent = v + " 天";
      b.setAttribute("aria-label", "出行天数设为 " + v + " 天");
      b.onclick = function () {
        setVal(input, v);
        input.setAttribute("aria-valuetext", v + "天");
        [].slice.call(wrap.children).forEach(function (x) { x.classList.toggle("is-on", x === b); });
      };
      wrap.appendChild(b);
    });
    box.appendChild(wrap);
    box.__xnChips = wrap;
  }

  /* ---------- 4. 汇总数字 ---------- */
  function markStats() {
    var tiles = [].slice.call(document.querySelectorAll('#root [data-code-inspect-component="StatTile"]')).filter(visible);
    tiles.forEach(function (t, idx) {
      var val = t.children[1];
      if (!val) return;
      var leaves = val.querySelectorAll("span,div");
      var target = null;
      for (var i = 0; i < leaves.length; i++) {
        if (!leaves[i].children.length && /^[\d.,]/.test(txt(leaves[i]))) { target = leaves[i]; break; }
      }
      if (!target && /^[\d.,]/.test(txt(val))) target = val;
      if (!target) return;
      if (!target.classList.contains("xn-stat")) target.classList.add("xn-stat");
      target.classList.toggle("xn-stat-primary", idx === 0);
    });
  }

  /* ---------- 5. 复制 ---------- */
  function markCopy() {
    var btns = [].slice.call(document.querySelectorAll("#root button"));
    btns.forEach(function (b) {
      if (!/^复制清单/.test(txt(b))) return;
      if (!b.classList.contains("xn-copy")) b.classList.add("xn-copy");
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "复制打包清单");
    });
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    fixPlaceholders();
    markItems();
    markSlider();
    markStats();
    markCopy();
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
    window.addEventListener("hashchange", schedule);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
