/* 社区团购运营合集页增强（仅 2qxzlvqqxb 引用） */
(function () {
  "use strict";
  if (window.__XN_GROUP__) return;
  window.__XN_GROUP__ = true;

  function txt(el) { return (el.textContent || "").trim(); }
  function visible(el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }
  function setVal(el, v) {
    var proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    proto.set.call(el, String(v));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  /* ---------- tab 当前态 ---------- */
  function markTabs() {
    var hash = (location.hash || "").replace(/^#/, "") || "cost";
    var links = document.querySelectorAll('#root a[href^="#/"]');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var target = (a.getAttribute("href") || "").slice(2);
      if (target === hash) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    }
  }

  /* ---------- 占位标题 ---------- */
  var TOOL_NO = { D: "04", E: "05", F: "06" };
  function fixPlaceholders() {
    var nodes = document.querySelectorAll("#root span, #root p, #root h1, #root h2, #root h3, #root a, #root strong, #root b, #root button");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.children.length) continue;
      var t = txt(el);
      var m = /^工具([DEF])(\s*)(.*)$/.exec(t);
      if (m) {
        el.textContent = "工具 " + TOOL_NO[m[1]] + (m[3] ? " " + m[3] : "");
        continue;
      }
      if (t === "D" || t === "E" || t === "F") {
        var px = el.parentElement;
        if (px && /^H2$/.test(px.tagName) && /^工具[DEF]/.test(txt(px))) {
          el.textContent = TOOL_NO[t];
          continue;
        }
        var nx = el.nextElementSibling;
        if (nx && /^H2$/.test(nx.tagName) && /^工具 0[456]/.test(txt(nx))) el.textContent = TOOL_NO[t];
      }
    }
    /* 标题里的纯文本节点（图标 span 之后跟「工具D 售后结算」） */
    var h2s = document.querySelectorAll("#root h2");
    for (var j = 0; j < h2s.length; j++) {
      var kids = h2s[j].childNodes;
      for (var k = 0; k < kids.length; k++) {
        var n = kids[k];
        if (n.nodeType !== 3) continue;
        var nt = (n.nodeValue || "").trim();
        var nm = /^工具([DEF])(\s*)(.*)$/.exec(nt);
        if (nm) n.nodeValue = "工具 " + TOOL_NO[nm[1]] + (nm[3] ? " " + nm[3] : "");
      }
    }
  }

  /* ---------- 输入语义 ---------- */
  var UNIT = /^(元|份|%|人|单|件|个|课|分钟|周|元\/份|元\/单)$/;
  function labelName(input) {
    var lab = input.closest("label");
    if (!lab) return "";
    var spans = lab.querySelectorAll("span");
    for (var i = 0; i < spans.length; i++) {
      var s = txt(spans[i]);
      if (s && !UNIT.test(s) && s.length < 18) return s;
    }
    return "";
  }

  function fixAria() {
    var inputs = [].slice.call(document.querySelectorAll("#root input")).filter(visible);
    inputs.forEach(function (input) {
      var a = (input.getAttribute("aria-label") || "").trim();
      var name = labelName(input);
      if (!a) {
        if (name) input.setAttribute("aria-label", name);
        return;
      }
      if (!UNIT.test(a) || !name) return;
      var clean = name.replace(/[（(].*?[)）]/g, "").trim();
      input.setAttribute("aria-label", clean + "（" + a + "）");
    });
  }

  /* ---------- 快捷值 ---------- */
  var RULES = [
    { re: /采购总价/, vals: [200, 500, 1000, 2000] },
    { re: /整箱|整篮/, vals: [10, 20, 30, 50] },
    { re: /运输与落地费/, vals: [0, 50, 80, 150] },
    { re: /损耗率/, vals: [0, 3, 5, 8] },
    { re: /团长佣金/, vals: [0, 5, 8, 10] },
    { re: /平台服务费/, vals: [0, 2, 3, 5] },
    { re: /参团人数/, vals: [10, 20, 25, 50] },
    { re: /期望毛利率/, vals: [10, 15, 20, 25, 30] },
    { re: /自提点数量/, vals: [1, 2, 3, 5] },
    { re: /预计团单数/, vals: [50, 100, 120, 200] },
    { re: /每单平均件数/, vals: [2, 3, 4.5, 6] },
    { re: /分拣人员数/, vals: [1, 2, 3, 4] },
    { re: /冷链商品占比/, vals: [0, 10, 15, 25] },
    { re: /单点峰值取货人数/, vals: [10, 20, 30, 50] },
    { re: /本期团购销售额/, vals: [5000, 8000, 12800, 20000] },
    { re: /^订单数/, vals: [30, 50, 86, 120] },
    { re: /佣金比例/, vals: [0, 5, 8, 10] },
    { re: /退货退款金额/, vals: [0, 100, 320, 500] },
    { re: /拉新奖励/, vals: [0, 100, 200, 500] },
    { re: /补贴|罚款/, vals: [-100, 0, 50, 120] },
    { re: /上期结余/, vals: [0, 50, 120, 300] },
    { re: /客单价/, vals: [20, 30, 45, 60] },
    { re: /退款率/, vals: [0, 3, 5, 10] },
    { re: /^售价/, vals: [9.9, 19.9, 29.9, 39.9] },
    { re: /单件成本/, vals: [5, 10, 15, 25] },
    { re: /固定费用/, vals: [0, 100, 300, 500] },
    { re: /目标团长数/, vals: [1, 3, 5, 10] },
    { re: /培训课时/, vals: [1, 2, 3, 4] }
  ];

  function addChips(input) {
    if (!visible(input)) return;
    if (input.type !== "number") return;
    if (input.getBoundingClientRect().width < 120) return;
    var label = input.getAttribute("aria-label") || "";
    var rule = null;
    for (var i = 0; i < RULES.length; i++) if (RULES[i].re.test(label)) { rule = RULES[i]; break; }
    if (!rule || input.__xnChips) return;
    var host = input.closest("label");
    if (!host) return;
    var wrap = document.createElement("div");
    wrap.className = "xn-chips";
    rule.vals.forEach(function (v) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = v;
      b.onclick = function () { setVal(input, v); setTimeout(updateAll, 40); };
      wrap.appendChild(b);
    });
    host.appendChild(wrap);
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

  /* ---------- KPI 分级 ---------- */
  var HERO = /^(建议售价|本期实结金额|实际到手|预计净利)$/;
  var MID = /^(单份实际成本|保本单价|单均毛利|应结佣金|可结总额|建议分拣开工|需触达人数|预计总件数|分拣总耗时|预计营收)$/;

  function markKpi() {
    var ps = document.querySelectorAll("#root p");
    for (var i = 0; i < ps.length; i++) {
      var p = ps[i];
      if (p.className.indexOf("font-black") < 0) continue;
      var parent = p.parentElement;
      if (!parent) continue;
      var lab = parent.querySelector("p");
      if (!lab || lab === p) continue;
      var label = txt(lab);
      p.classList.remove("xn-group-hero", "xn-group-mid");
      if (HERO.test(label)) p.classList.add("xn-group-hero");
      else if (MID.test(label)) p.classList.add("xn-group-mid");
    }
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    markTabs();
    fixPlaceholders();
    fixAria();
    [].slice.call(document.querySelectorAll("#root input")).forEach(addChips);
    markKpi();
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
