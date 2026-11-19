/* 预产期孕周与滤芯周期合集页增强（仅 4gsndabtnf 引用） */
(function () {
  "use strict";
  if (window.__XN_PREG__) return;
  window.__XN_PREG__ = true;

  function txt(el) { return (el.textContent || "").trim(); }
  function visible(el) {
    if (!el) return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }
  function setVal(el, v) {
    var proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    proto.set.call(el, v);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }
  function todayStr() {
    var d = new Date();
    var m = ("0" + (d.getMonth() + 1)).slice(-2);
    var day = ("0" + d.getDate()).slice(-2);
    return d.getFullYear() + "-" + m + "-" + day;
  }

  /* ---------- 1. 两个工具切换 ---------- */
  function markTabs() {
    var btns = [].slice.call(document.querySelectorAll("#root button")).filter(function (b) {
      return /预产孕周|滤芯周期/.test(txt(b)) && visible(b);
    });
    if (!btns.length) return;
    var wrap = btns[0].parentElement;
    if (wrap && !wrap.classList.contains("xn-tabs")) wrap.classList.add("xn-tabs");
    if (wrap && wrap.getAttribute("role") !== "tablist") {
      wrap.setAttribute("role", "tablist");
      wrap.setAttribute("aria-label", "工具切换");
    }
    btns.forEach(function (b) {
      if (b.getAttribute("role") !== "tab") b.setAttribute("role", "tab");
      var on = (b.className || "").toString().indexOf("bg-rose-500") >= 0;
      var v = on ? "true" : "false";
      if (b.getAttribute("aria-selected") !== v) b.setAttribute("aria-selected", v);
    });
  }

  /* ---------- 2. 开关名称 ---------- */
  function markSwitches() {
    var btns = [].slice.call(document.querySelectorAll('#root button[role="switch"]'));
    btns.forEach(function (b) {
      if (b.getAttribute("aria-label")) return;
      var p = b.parentElement;
      var lab = p ? p.querySelector("label") : null;
      var name = lab ? txt(lab).replace(/\s+/g, "") : "";
      if (name) b.setAttribute("aria-label", name);
    });
  }

  /* ---------- 3. 日期「今天」 ---------- */
  function markToday() {
    var ins = [].slice.call(document.querySelectorAll('#root input[type="date"]')).filter(visible);
    ins.forEach(function (input) {
      var box = input.parentElement;
      if (!box) return;
      var lab = box.querySelector("label");
      var name = lab ? txt(lab).replace(/\s+/g, "") : "";
      if (!/参考日期|安装日期/.test(name)) return;
      if (box.__xnToday && box.__xnToday.isConnected) return;
      var b = document.createElement("button");
      b.type = "button";
      b.className = "xn-today";
      b.textContent = "今天";
      b.setAttribute("aria-label", name + "设为今天");
      b.onclick = function () { setVal(input, todayStr()); };
      box.appendChild(b);
      box.__xnToday = b;
    });
  }

  /* ---------- 4. 月经周期快捷值 ---------- */
  function markPresets() {
    var ins = [].slice.call(document.querySelectorAll('#root input[type="number"]')).filter(visible);
    ins.forEach(function (input) {
      if ((input.getAttribute("aria-label") || "").indexOf("月经周期") < 0) return;
      var box = input.parentElement;
      if (!box) return;
      if (box.__xnChips && box.__xnChips.isConnected) return;
      var wrap = document.createElement("div");
      wrap.className = "xn-chips";
      [26, 28, 30, 35].forEach(function (v) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "xn-chip" + (parseFloat(input.value) === v ? " is-on" : "");
        b.textContent = v;
        b.setAttribute("aria-label", "月经周期设为 " + v + " 天");
        b.onclick = function () { setVal(input, v); };
        wrap.appendChild(b);
      });
      box.appendChild(wrap);
      box.__xnChips = wrap;
    });
  }

  /* ---------- 5. 复制/清空命名 ---------- */
  function markCopy() {
    var btns = [].slice.call(document.querySelectorAll("#root button"));
    btns.forEach(function (b) {
      var t = txt(b);
      if (/^复制结果/.test(t)) {
        if (!b.classList.contains("xn-copy")) b.classList.add("xn-copy");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "复制结果");
      } else if (/^复制/.test(t)) {
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", t);
      } else if (/^清空$/.test(t)) {
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "清空全部输入");
      } else if (/^计算预产期/.test(t)) {
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "计算预产期与孕周");
      }
    });
  }

  /* ---------- 6. 孕周数字 ---------- */
  function markBig() {
    var els = document.querySelectorAll("#root span, #root div, #root strong, #root b, #root p");
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      if (e.children.length) continue;
      var t = txt(e);
      if (/^\d+\s*周\s*\+\s*\d+\s*天$/.test(t) && !e.classList.contains("xn-big")) e.classList.add("xn-big");
    }
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    markTabs();
    markSwitches();
    markToday();
    markPresets();
    markCopy();
    markBig();
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
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
