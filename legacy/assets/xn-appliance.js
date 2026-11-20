/* 家用电器选购计算合集页增强（仅 c7zfn5egmi 引用） */
(function () {
  "use strict";
  if (window.__XN_APPLIANCE__) return;
  window.__XN_APPLIANCE__ = true;

  function txt(el) { return (el.textContent || "").trim().replace(/\s+/g, " "); }
  function visible(el) {
    if (!el) return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }
  function hasClass(el, s) {
    return !!el && (el.className || "").toString().indexOf(s) >= 0;
  }
  function setVal(el, v) {
    var proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    proto.set.call(el, String(v));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  var CHIPS = {
    "房间面积": [10, 15, 20, 25, 30],
    "层高": [2.6, 2.8, 3.0, 3.2],
    "常驻人数": [1, 2, 3, 4, 5],
    "家庭人数": [1, 2, 3, 4, 5],
    "观看距离": [2, 2.5, 2.8, 3.2, 4],
    "单人洗浴时长": [10, 15, 20, 30],
    "每日饮水量": [1, 1.5, 2, 3, 4]
  };

  function fieldBox(el) {
    var cur = el.parentElement;
    for (var i = 0; i < 4 && cur; i++) {
      if (cur.querySelector("label")) return cur;
      cur = cur.parentElement;
    }
    return el.parentElement;
  }
  function fieldLabel(el) {
    var box = fieldBox(el);
    var lab = box && box.querySelector("label");
    return lab ? txt(lab) : "";
  }

  /* ---------- 1. tab ---------- */
  function markTabs() {
    var tabs = [].slice.call(document.querySelectorAll('#root a[href^="#/"]')).filter(visible);
    if (!tabs.length) return;
    var hash = location.hash;
    tabs.forEach(function (a, i) {
      var on = hash ? a.getAttribute("href") === hash : i === 0;
      if (on) {
        if (a.getAttribute("aria-current") !== "page") a.setAttribute("aria-current", "page");
      } else if (a.hasAttribute("aria-current")) {
        a.removeAttribute("aria-current");
      }
    });
  }

  /* ---------- 2. 下拉命名 + 常用值 ---------- */
  function markFields() {
    [].slice.call(document.querySelectorAll('#root input[type="number"], #root select')).forEach(function (el) {
      if (!visible(el)) return;
      var name = fieldLabel(el);
      if (name && !el.getAttribute("aria-label")) el.setAttribute("aria-label", name);
      if (el.tagName !== "INPUT") return;
      if (!name || !CHIPS[name]) return;
      var box = fieldBox(el);
      if (!box) return;
      if (box.querySelector(".xn-chips")) {
        var cur = parseFloat(el.value);
        [].slice.call(box.querySelector(".xn-chips").children).forEach(function (c) {
          c.classList.toggle("is-on", parseFloat(c.textContent) === cur);
        });
        return;
      }
      var wrap = document.createElement("div");
      wrap.className = "xn-chips";
      CHIPS[name].forEach(function (v) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "xn-chip" + (parseFloat(el.value) === v ? " is-on" : "");
        b.textContent = String(v);
        b.setAttribute("aria-label", name + " 设为 " + v);
        b.onclick = function () {
          setVal(el, v);
          [].slice.call(wrap.children).forEach(function (x) { x.classList.toggle("is-on", x === b); });
        };
        wrap.appendChild(b);
      });
      box.appendChild(wrap);
    });
  }

  /* ---------- 3. 开关命名 ---------- */
  function markSwitches() {
    [].slice.call(document.querySelectorAll('#root button[role="switch"]')).filter(visible).forEach(function (sw) {
      if (sw.getAttribute("aria-label")) return;
      var lab = sw.previousElementSibling;
      if (lab && txt(lab)) sw.setAttribute("aria-label", txt(lab));
    });
  }

  /* ---------- 4. 结果主次 ---------- */
  function markResults() {
    [].slice.call(document.querySelectorAll('#root div[data-code-inspect-component="ResultItem"]')).filter(visible).forEach(function (tile) {
      var label = tile.querySelector("p");
      var val = tile.querySelector("p.mt-0\\.5") || tile.querySelectorAll("p")[1];
      if (!val || val === label) return;
      if (!val.classList.contains("xn-tile-val")) val.classList.add("xn-tile-val");
      var primary = hasClass(tile, "border-teal-200") || hasClass(tile, "bg-teal-50");
      if (primary && !tile.classList.contains("xn-tile-primary")) tile.classList.add("xn-tile-primary");
    });
  }

  /* ---------- 5. 提示与操作 ---------- */
  function markTips() {
    [].slice.call(document.querySelectorAll("#root section, #root div")).some(function (sec) {
      if (txt(sec).indexOf("选购提示") < 0) return false;
      var list = sec.querySelector("ol") || sec.querySelector("ul");
      if (list && !list.classList.contains("xn-tips")) list.classList.add("xn-tips");
      return !!list;
    });
  }
  function markActions() {
    [].slice.call(document.querySelectorAll("#root button")).filter(visible).forEach(function (b) {
      var t = txt(b);
      if (t !== "一键复制" && t !== "清空") return;
      if (!b.classList.contains("xn-action")) b.classList.add("xn-action");
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", t);
    });
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    markTabs();
    markFields();
    markSwitches();
    markResults();
    markTips();
    markActions();
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
