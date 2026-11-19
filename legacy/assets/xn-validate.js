/* 证件与卡号校验合集页增强（仅 3xmx6e5af3 引用） */
(function () {
  "use strict";
  if (window.__XN_VALIDATE__) return;
  window.__XN_VALIDATE__ = true;

  var TOOL_NO = { E: "05", F: "06" };

  function txt(el) { return (el.textContent || "").trim(); }
  function visible(el) {
    if (!el) return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }
  function route() {
    var h = (location.hash || "").replace(/^#/, "");
    return h || "/";
  }
  function setVal(el, v) {
    var proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    proto.set.call(el, v);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  /* ---------- 1. 占位标题 ---------- */
  function fixPlaceholders() {
    var nodes = document.querySelectorAll("#root span, #root p, #root h1, #root h2, #root h3, #root a, #root strong, #root b, #root button");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.children.length) continue;
      var t = txt(el);
      var m = /^工具([EF])(\s*)(.*)$/.exec(t);
      if (!m) continue;
      el.textContent = "工具 " + TOOL_NO[m[1]] + (m[3] ? " " + m[3] : "");
      if (!m[3]) {
        var sib = el.nextSibling;
        if (sib && sib.nodeType === 3 && /^\S/.test(sib.nodeValue)) el.textContent += " ";
      }
    }
  }

  /* ---------- 2. 顶部 tab ---------- */
  function markTabs() {
    var root = document.getElementById("root");
    if (!root) return;
    var links = [].slice.call(root.querySelectorAll("a")).filter(function (a) { return /^#\//.test(a.getAttribute("href") || ""); });
    if (!links.length) return;
    var wrap = links[0].parentElement;
    if (wrap && !wrap.classList.contains("xn-tabs-wrap")) wrap.classList.add("xn-tabs-wrap");
    links.forEach(function (a) {
      var on = a.getAttribute("href") === "#" + route();
      if (on && a.getAttribute("aria-current") !== "page") a.setAttribute("aria-current", "page");
      if (!on && a.getAttribute("aria-current")) a.removeAttribute("aria-current");
    });
  }

  /* ---------- 3. 输入卡：示例/清空 ---------- */
  function markInputCards() {
    var cards = [].slice.call(document.querySelectorAll('#root [data-code-inspect-component="InputCard"]')).filter(visible);
    cards.forEach(function (card) {
      if (!card.classList.contains("xn-input-card")) card.classList.add("xn-input-card");
      var input = card.querySelector("input");
      if (!input) return;
      if (card.__xnActions && card.__xnActions.isConnected) return;
      var row = document.createElement("div");
      row.className = "xn-input-actions";
      var fill = document.createElement("button");
      fill.type = "button";
      fill.className = "xn-fill";
      fill.textContent = "填入示例";
      fill.setAttribute("aria-label", "填入示例号码");
      fill.onclick = function () {
        var v = input.getAttribute("placeholder") || "";
        if (v) setVal(input, v);
      };
      var clear = document.createElement("button");
      clear.type = "button";
      clear.className = "xn-clear";
      clear.textContent = "清空";
      clear.setAttribute("aria-label", "清空输入");
      clear.onclick = function () { setVal(input, ""); };
      row.appendChild(fill);
      row.appendChild(clear);
      card.appendChild(row);
      card.__xnActions = row;
    });
  }

  /* ---------- 4. 校验状态 ---------- */
  function markStatus() {
    var cards = [].slice.call(document.querySelectorAll('#root [data-code-inspect-component="StatusCard"]')).filter(visible);
    cards.forEach(function (c) {
      var cls = (c.className || "").toString();
      var pass = cls.indexOf("border-green-200") >= 0;
      var fail = cls.indexOf("border-red-200") >= 0;
      if (!pass && !fail) return;
      c.classList.add("xn-status");
      c.classList.toggle("xn-pass", pass);
      c.classList.toggle("xn-fail", fail);
      var icon = c.querySelector("div > span");
      if (icon && !icon.classList.contains("xn-status-icon")) icon.classList.add("xn-status-icon");
      var head = c.querySelector("div > span:last-child");
      if (head && !head.classList.contains("xn-status-title")) head.classList.add("xn-status-title");
      var desc = c.querySelector("p");
      if (desc && !desc.classList.contains("xn-status-desc")) desc.classList.add("xn-status-desc");
    });
  }

  /* ---------- 5. 信息网格 ---------- */
  function markInfoGrids() {
    var grids = [].slice.call(document.querySelectorAll('#root [data-code-inspect-component="InfoGrid"]')).filter(visible);
    grids.forEach(function (g) {
      if (!g.classList.contains("xn-info-grid")) g.classList.add("xn-info-grid");
      var items = g.querySelectorAll(":scope > div");
      for (var i = 0; i < items.length; i++) {
        var ps = items[i].querySelectorAll("p");
        if (ps[0] && !ps[0].classList.contains("xn-info-lab")) ps[0].classList.add("xn-info-lab");
        if (ps[1] && !ps[1].classList.contains("xn-info-val")) ps[1].classList.add("xn-info-val");
      }
    });
  }

  /* ---------- 6. 下拉语义（护照国家/地区） ---------- */
  function markSelects() {
    var sels = [].slice.call(document.querySelectorAll("#root select")).filter(visible);
    sels.forEach(function (sel) {
      if (!sel.classList.contains("xn-select")) sel.classList.add("xn-select");
      if (sel.getAttribute("aria-label")) return;
      var card = sel.closest('[data-code-inspect-component="InputCard"]');
      var lab = card ? card.querySelector(":scope > span") : null;
      var name = lab ? txt(lab).replace(/\s+/g, "") : "";
      if (name) sel.setAttribute("aria-label", name);
    });
  }

  /* ---------- 7. 复制按钮 ---------- */
  function markCopy() {
    var btns = [].slice.call(document.querySelectorAll("#root button")).filter(visible);
    btns.forEach(function (b) {
      if (!/^复制结果/.test(txt(b))) return;
      if (!b.classList.contains("xn-copy")) b.classList.add("xn-copy");
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "复制校验结果");
    });
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    fixPlaceholders();
    markTabs();
    markInputCards();
    markStatus();
    markInfoGrids();
    markSelects();
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
