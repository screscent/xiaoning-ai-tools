/* 家居清洗与家电维护合集页增强（仅 3xumgz5af3 引用） */
(function () {
  "use strict";
  if (window.__XN_CLEAN__) return;
  window.__XN_CLEAN__ = true;

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
  function todayISO() {
    var d = new Date();
    function p(n) { return n < 10 ? "0" + n : String(n); }
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
  }

  var CHIPS = {
    "日均用水量（升）": [100, 150, 200, 300],
    "滤芯额定净水量（吨）": [3, 5, 8, 10],
    "每周洗衣次数": [1, 2, 3, 5, 7],
    "使用年限": [1, 3, 5, 8],
    "上次清洁距今天数": [7, 15, 30, 60],
    "空调台数": [1, 2, 3, 4],
    "上次清洗距今月数": [3, 6, 12, 18],
    "购买价格（元）": [1000, 2000, 3000, 5000],
    "已使用年限（年）": [1, 3, 5, 8, 10],
    "功率（瓦）": [100, 500, 1200, 2000],
    "日均使用小时": [2, 4, 8, 12],
    "电价（元/度）": [0.5, 0.6, 0.8, 1.0]
  };

  /* ---------- 1. tab 三列网格 + 当前态 ---------- */
  function markTabs() {
    var tabs = [].slice.call(document.querySelectorAll('#root a[href^="#/"]')).filter(visible);
    if (!tabs.length) return;
    var bar = tabs[0].parentElement;
    if (bar && !bar.classList.contains("xn-tabs")) bar.classList.add("xn-tabs");
    tabs.forEach(function (a) {
      var on = a.getAttribute("href") === location.hash;
      if (on) {
        if (a.getAttribute("aria-current") !== "page") a.setAttribute("aria-current", "page");
      } else if (a.hasAttribute("aria-current")) {
        a.removeAttribute("aria-current");
      }
    });
  }

  /* ---------- 2. 结果卡主次 ---------- */
  function markResult() {
    var cards = [].slice.call(document.querySelectorAll('#root div[class*="bg-blue-50"]'));
    cards.forEach(function (card) {
      if (!hasClass(card, "space-y-2")) return;
      if (!card.classList.contains("xn-result-card")) card.classList.add("xn-result-card");
      var rows = [].slice.call(card.children).filter(function (r) { return r.tagName === "DIV"; });
      rows.forEach(function (row, idx) {
        var label = null;
        var value = null;
        [].slice.call(row.querySelectorAll("span,div")).forEach(function (n) {
          if (n.children.length) return;
          var t = txt(n);
          if (!t) return;
          if (hasClass(n, "font-semibold")) value = n;
          else if (hasClass(n, "text-gray-500") && !label) label = n;
        });
        if (label && !label.classList.contains("xn-label")) label.classList.add("xn-label");
        if (value) {
          var longText = txt(value).length > 20;
          if (!longText && !value.classList.contains("xn-val")) value.classList.add("xn-val");
          value.classList.toggle("xn-val-sub", longText);
          value.classList.toggle("xn-val-primary", idx === 0 && !longText);
        }
      });
    });
  }

  /* ---------- 3. 常用值胶囊 ---------- */
  function markChips() {
    var labels = [].slice.call(document.querySelectorAll("#root label.block"));
    labels.forEach(function (label) {
      var span = label.querySelector("span.text-sm");
      var control = label.querySelector('input[type="number"]');
      if (!span || !control) return;
      var name = txt(span);
      var vals = CHIPS[name];
      if (!vals) return;
      var next = label.nextElementSibling;
      if (next && next.classList && next.classList.contains("xn-chips")) {
        syncChips(next, control);
        return;
      }
      var wrap = document.createElement("div");
      wrap.className = "xn-chips";
      vals.forEach(function (v) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "xn-chip";
        b.textContent = String(v);
        b.setAttribute("aria-label", name + " 设为 " + v);
        b.onclick = function () {
          setVal(control, v);
          [].slice.call(wrap.children).forEach(function (x) { x.classList.toggle("is-on", x === b); });
        };
        if (parseFloat(control.value) === v) b.classList.add("is-on");
        wrap.appendChild(b);
      });
      label.insertAdjacentElement("afterend", wrap);
    });
  }
  function syncChips(wrap, control) {
    var cur = parseFloat(control.value);
    [].slice.call(wrap.children).forEach(function (b) {
      b.classList.toggle("is-on", parseFloat(b.textContent) === cur);
    });
  }

  /* ---------- 4. 日期「今天」 ---------- */
  function markDate() {
    var inputs = [].slice.call(document.querySelectorAll('#root input[type="date"]')).filter(visible);
    inputs.forEach(function (input) {
      var label = input.closest("label");
      if (!label) return;
      var next = label.nextElementSibling;
      if (next && next.classList && next.classList.contains("xn-today")) return;
      var b = document.createElement("button");
      b.type = "button";
      b.className = "xn-today";
      b.textContent = "今天";
      b.setAttribute("aria-label", "填入今天日期");
      b.onclick = function () {
        setVal(input, todayISO());
        b.blur();
      };
      label.insertAdjacentElement("afterend", b);
    });
  }

  /* ---------- 5. 开关语义 ---------- */
  function markSwitch() {
    var btns = [].slice.call(document.querySelectorAll("#root button")).filter(visible);
    btns.forEach(function (b) {
      if (!hasClass(b, "h-7") || !hasClass(b, "w-12")) return;
      if (b.getAttribute("role") !== "switch") b.setAttribute("role", "switch");
      var on = hasClass(b, "bg-blue-500");
      if (b.getAttribute("aria-checked") !== String(on)) b.setAttribute("aria-checked", String(on));
      if (!b.classList.contains("xn-switch")) b.classList.add("xn-switch");
      if (!b.getAttribute("aria-label")) {
        var label = b.closest("label");
        var span = label && label.querySelector("span.text-sm");
        if (span) b.setAttribute("aria-label", txt(span));
      }
    });
  }

  /* ---------- 6. 复制/清空按钮化 ---------- */
  function markActions() {
    var btns = [].slice.call(document.querySelectorAll("#root button")).filter(visible);
    btns.forEach(function (b) {
      var t = txt(b);
      if (t !== "复制结果" && t !== "清空") return;
      if (!b.classList.contains("xn-action")) b.classList.add("xn-action");
      b.classList.toggle("xn-copy", t === "复制结果");
      b.classList.toggle("xn-clear", t === "清空");
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", t);
    });
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    markTabs();
    markResult();
    markChips();
    markDate();
    markSwitch();
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
      childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["class", "aria-current"]
    });
    window.addEventListener("hashchange", schedule);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
