/* 家庭应急与防灾合集页增强（仅 ekgaqhvhte 引用） */
(function () {
  "use strict";
  if (window.__XN_EMERGENCY__) return;
  window.__XN_EMERGENCY__ = true;

  var TOOLS = [
    { href: "#/", label: "全部" },
    { href: "#/kit", key: "kit", label: "应急物品清单" },
    { href: "#/plan", key: "plan", label: "应急预案" },
    { href: "#/firstaid", key: "firstaid", label: "急救包" },
    { href: "#/outage", key: "outage", label: "停电停水" },
    { href: "#/stock", key: "stock", label: "饮水与食物储备" },
    { href: "#/drill", key: "drill", label: "演练计划" }
  ];
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
    proto.set.call(el, String(v));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  /* ---------- 1. 占位标题 ---------- */
  function fixPlaceholders() {
    var nodes = document.querySelectorAll("#root span, #root p, #root h1, #root h2, #root h3, #root a, #root strong, #root b, #root button, #root div");
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

  /* ---------- 2. 主题与工具切换 ---------- */
  function applyTheme() {
    var root = document.getElementById("root");
    if (!root) return;
    var r = route();
    var hit = null;
    for (var i = 0; i < TOOLS.length; i++) {
      if (TOOLS[i].key && ("/" + TOOLS[i].key) === r) { hit = TOOLS[i]; break; }
    }
    if (hit) root.setAttribute("data-xn-tool", hit.key);
    else root.removeAttribute("data-xn-tool");
    return hit;
  }
  function ensureToolNav() {
    var root = document.getElementById("root");
    var main = root && root.querySelector("main");
    if (!root || !main) return;
    var hit = applyTheme();
    var nav = root.querySelector(".xn-tool-nav");
    if (!hit) {
      if (nav) nav.remove();
      return;
    }
    if (!nav) {
      nav = document.createElement("nav");
      nav.className = "xn-tool-nav";
      nav.setAttribute("aria-label", "应急工具切换");
      TOOLS.forEach(function (t) {
        var a = document.createElement("a");
        a.href = t.href;
        a.textContent = t.label;
        nav.appendChild(a);
      });
      var anchor = main.firstElementChild;
      if (anchor && anchor.nextSibling) main.insertBefore(nav, anchor.nextSibling);
      else main.insertBefore(nav, main.firstChild);
    }
    var links = nav.querySelectorAll("a");
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute("href");
      var cur = href === "#" + (location.hash || "#").replace(/^##/, "#");
      var isCur = (href === "#/" && route() === "/") || (href !== "#/" && href === "#" + route());
      if (isCur && links[i].getAttribute("aria-current") !== "page") links[i].setAttribute("aria-current", "page");
      if (!isCur && links[i].getAttribute("aria-current")) links[i].removeAttribute("aria-current");
    }
  }

  /* ---------- 3. 首页 tab 当前态 ---------- */
  function markHomeTabs() {
    if (route() !== "/") return;
    var links = document.querySelectorAll("#root a");
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var href = a.getAttribute("href") || "";
      if (href.indexOf("#/") !== 0) continue;
      var on = (a.className || "").toString().indexOf("bg-slate-900") >= 0;
      if (on && a.getAttribute("aria-current") !== "page") a.setAttribute("aria-current", "page");
      if (!on && a.getAttribute("aria-current")) a.removeAttribute("aria-current");
    }
  }

  /* ---------- 4. 开关 ---------- */
  function fixSwitches() {
    var btns = [].slice.call(document.querySelectorAll("#root button")).filter(visible);
    btns.forEach(function (b) {
      var cls = (b.className || "").toString();
      if (cls.indexOf("w-11") < 0 || cls.indexOf("h-6") < 0) return;
      var p = b.parentElement;
      var lab = p ? p.querySelector("span") : null;
      var name = lab ? txt(lab).replace(/\s+/g, "") : "";
      var on = cls.indexOf("bg-slate-900") >= 0 || cls.indexOf("bg-emerald-500") >= 0;
      if (b.getAttribute("role") !== "switch") b.setAttribute("role", "switch");
      var v = on ? "true" : "false";
      if (b.getAttribute("aria-checked") !== v) b.setAttribute("aria-checked", v);
      if (name && b.getAttribute("aria-label") !== name) b.setAttribute("aria-label", name);
    });
  }

  /* ---------- 5. 选项胶囊 ---------- */
  function fixChips() {
    var btns = [].slice.call(document.querySelectorAll("#root button")).filter(visible);
    btns.forEach(function (b) {
      var cls = (b.className || "").toString();
      if (cls.indexOf("px-3.5") < 0 || cls.indexOf("select-none") < 0) return;
      if (!b.classList.contains("xn-chipbtn")) b.classList.add("xn-chipbtn");
      var on = cls.indexOf("bg-slate-900") >= 0;
      var v = on ? "true" : "false";
      if (b.getAttribute("aria-pressed") !== v) b.setAttribute("aria-pressed", v);
    });
  }

  /* ---------- 6. 数字框语义 + 快捷值 ---------- */
  var RULES = [
    { re: /^家庭人数$/, vals: [1, 3, 5] },
    { re: /^预算上限$/, vals: [300, 500, 1000, 2000] },
    { re: /^储备天数$/, vals: [3, 7, 14] },
    { re: /^每人每天饮水$/, vals: [2, 3, 4] },
    { re: /^每人每天热量$/, vals: [1800, 2000, 2500] }
  ];
  function syncChip(input, wrap, rule) {
    var num = parseFloat(input.value);
    [].slice.call(wrap.children).forEach(function (b, i) {
      b.classList.toggle("is-on", !isNaN(num) && num === rule.vals[i]);
    });
  }
  function fixNumbers() {
    var fields = [].slice.call(document.querySelectorAll('#root [data-code-inspect-component="NumberInput"]')).filter(visible);
    fields.forEach(function (field) {
      var input = field.querySelector('input[type="number"]');
      if (!input) return;
      var labDiv = field.firstElementChild;
      var name = labDiv ? txt(labDiv).replace(/\s+/g, "") : "";
      if (!name) return;
      var flex = input.parentElement;
      var unitEl = flex ? flex.querySelector("span") : null;
      var unit = unitEl ? txt(unitEl).replace(/\s+/g, "") : "";
      var aria = unit ? name + "（" + unit + "）" : name;
      if (input.getAttribute("aria-label") !== aria) input.setAttribute("aria-label", aria);
      var rule = null;
      for (var i = 0; i < RULES.length; i++) if (RULES[i].re.test(name)) { rule = RULES[i]; break; }
      if (!rule) return;
      if (field.__xnChips && field.__xnChips.isConnected) return;
      var wrap = document.createElement("div");
      wrap.className = "xn-chips";
      rule.vals.forEach(function (v) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "xn-chip";
        b.textContent = v;
        b.setAttribute("aria-label", name + "设为 " + v);
        b.onclick = function () { setVal(input, v); syncChip(input, wrap, rule); };
        wrap.appendChild(b);
      });
      field.appendChild(wrap);
      field.__xnChips = wrap;
      input.addEventListener("input", function () { syncChip(input, wrap, rule); });
      syncChip(input, wrap, rule);
    });
  }

  /* ---------- 7. 复制按钮 ---------- */
  function fixCopy() {
    var btns = [].slice.call(document.querySelectorAll("#root button")).filter(visible);
    btns.forEach(function (b) {
      var t = txt(b);
      if (!/^复制/.test(t)) return;
      if (!b.classList.contains("xn-copy")) b.classList.add("xn-copy");
      if (b.getAttribute("aria-label")) return;
      if (/完整/.test(t)) {
        b.setAttribute("aria-label", "复制完整内容");
        return;
      }
      var p = b, h3 = null;
      for (var i = 0; i < 4 && p; i++) {
        if (p.querySelector && p.querySelector("h3")) { h3 = p.querySelector("h3"); break; }
        p = p.parentElement;
      }
      b.setAttribute("aria-label", h3 ? "复制「" + txt(h3) + "」清单" : "复制本节清单");
    });
  }

  /* ---------- 8. 金额与超预算 ---------- */
  function fixMoney() {
    var els = document.querySelectorAll("#root span, #root p, #root div, #root strong, #root b");
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      var t = txt(e);
      if (!e.children.length && /^¥[\d,]+$/.test(t)) {
        if (!e.classList.contains("xn-money")) e.classList.add("xn-money");
      }
      if (/^超出预算/.test(t) && t.length < 60 && !e.classList.contains("xn-warn")) e.classList.add("xn-warn");
    }
  }

  /* ---------- 9. 库存 KPI ---------- */
  function fixStockKpi() {
    if (route() !== "/stock") return;
    var boxes = document.querySelectorAll("#root .space-y-1\\.5");
    var host = null;
    for (var i = 0; i < boxes.length; i++) {
      if (/总饮水量/.test(txt(boxes[i]))) { host = boxes[i]; break; }
    }
    if (!host) return;
    var all = txt(host);
    var mW = /总饮水量：([\d.,]+)\s*L/.exec(all);
    var mC = /总热量需求：([\d.,]+)\s*kcal/.exec(all);
    var mF = /主粮储备量：([\d.,]+)\s*kg/.exec(all);
    if (!mW || !mC || !mF) return;
    var sig = mW[1] + "|" + mC[1] + "|" + mF[1];
    var row = host.parentElement ? host.parentElement.querySelector(".xn-kpi-row") : null;
    if (!row || !row.isConnected) {
      row = document.createElement("div");
      row.className = "xn-kpi-row";
      row.innerHTML = '<div class="xn-kpi-card"><div class="xn-kpi-label">总饮水量</div><div class="xn-kpi-value" data-k="w"></div></div>' +
        '<div class="xn-kpi-card"><div class="xn-kpi-label">总热量需求</div><div class="xn-kpi-value" data-k="c"></div></div>' +
        '<div class="xn-kpi-card"><div class="xn-kpi-label">主粮储备</div><div class="xn-kpi-value" data-k="f"></div></div>';
      host.parentElement.insertBefore(row, host);
    }
    if (row.__xnSig === sig) return;
    row.__xnSig = sig;
    row.querySelector('[data-k="w"]').innerHTML = mW[1] + "<small>L</small>";
    row.querySelector('[data-k="c"]').innerHTML = mC[1] + "<small>kcal</small>";
    row.querySelector('[data-k="f"]').innerHTML = mF[1] + "<small>kg</small>";
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    fixPlaceholders();
    ensureToolNav();
    markHomeTabs();
    fixSwitches();
    fixChips();
    fixNumbers();
    fixCopy();
    fixMoney();
    fixStockKpi();
  }

  var scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(function () { scheduled = false; try { updateAll(); } catch (e) {} }, 200);
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
