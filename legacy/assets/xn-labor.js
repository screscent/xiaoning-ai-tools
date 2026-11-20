/* 职场权益与离职计算合集页增强（仅 qs8lbinhme 引用） */
(function () {
  "use strict";
  if (window.__XN_LABOR__) return;
  window.__XN_LABOR__ = true;

  function txt(el) { return (el.textContent || "").trim().replace(/\s+/g, " "); }
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

  var CHIPS = {
    "离职前12个月平均月薪": [5000, 8000, 10000, 20000, 30000],
    "工作年限（年）": [1, 3, 5, 8, 10],
    "工作年限（月）": [0, 3, 6],
    "社平3倍封顶金额（可修改）": [20000, 30000, 35000, 40000]
  };

  /* ---------- 1. tab ---------- */
  function markTabs() {
    var tabs = [].slice.call(document.querySelectorAll('#root a[href^="#/"]')).filter(visible);
    if (!tabs.length) return;
    var bar = tabs[0].parentElement;
    if (bar && !bar.classList.contains("xn-tabs")) bar.classList.add("xn-tabs");
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

  /* ---------- 2. 字段语义与常用值 ---------- */
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
    if (!box) return "";
    var lab = box.querySelector("label");
    return lab ? txt(lab) : "";
  }
  function markFields() {
    [].slice.call(document.querySelectorAll('#root input[type="number"], #root select')).forEach(function (el) {
      if (!visible(el)) return;
      var name = fieldLabel(el);
      var aria = el.getAttribute("aria-label");
      if (name && (!aria || /^(元|天|小时|%|年|月|元\/月)$/.test(aria))) el.setAttribute("aria-label", name);
      if (el.tagName !== "INPUT") return;
      if (!name || !CHIPS[name]) return;
      var box = fieldBox(el);
      if (!box) return;
      if (box.querySelector(".xn-chips")) {
        var existing = box.querySelector(".xn-chips");
        var cur = parseFloat(el.value);
        [].slice.call(existing.children).forEach(function (c) {
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

  /* ---------- 4. 结果层级 ---------- */
  function markResults() {
    var rows = [].slice.call(document.querySelectorAll('#root div[data-code-inspect-component="ResultRow"]')).filter(visible);
    var parents = [];
    rows.forEach(function (row) {
      var label = row.querySelector("span.text-gray-600") || row.querySelector("span");
      var val = row.querySelector("span.font-semibold") || row.querySelectorAll("span")[1];
      if (!label || !val) return;
      if (!label.classList.contains("xn-label")) label.classList.add("xn-label");
      if (!val.classList.contains("xn-val")) val.classList.add("xn-val");
      if (!row.classList.contains("xn-row")) row.classList.add("xn-row");
      if (parents.indexOf(row.parentElement) < 0) parents.push(row.parentElement);
    });
    parents.forEach(function (parent) {
      var groupRows = [].slice.call(parent.children).filter(function (c) { return c.classList.contains("xn-row"); });
      var hasPrimary = false;
      groupRows.forEach(function (r) {
        var label = r.querySelector("span.text-gray-600");
        if (!label) return;
        if (/合计|总计|到手|应得/.test(txt(label))) {
          r.classList.add("xn-row-primary");
          hasPrimary = true;
        }
      });
      if (!hasPrimary && groupRows.length) groupRows[groupRows.length - 1].classList.add("xn-row-primary");
    });
  }

  /* ---------- 5. 年月两列 ---------- */
  function markGrid() {
    [].slice.call(document.querySelectorAll("#root div.grid")).forEach(function (g) {
      var t = txt(g);
      if (t.indexOf("工作年限（年）") >= 0 && t.indexOf("月") >= 0) {
        if (!g.classList.contains("xn-two")) g.classList.add("xn-two");
      }
    });
  }

  /* ---------- 6. 操作 ---------- */
  function markActions() {
    [].slice.call(document.querySelectorAll("#root button")).filter(visible).forEach(function (b) {
      var t = txt(b);
      if (t !== "复制结果" && t !== "清空输入") return;
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
    markGrid();
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
