/* 满减与优惠叠加合集页增强（仅 tbnh7qmk3t 引用） */
(function () {
  "use strict";
  if (window.__XN_DISC__) return;
  window.__XN_DISC__ = true;

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
  function setText(el, v) {
    var proto = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value");
    proto.set.call(el, v);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  /* ---------- tab 当前态 ---------- */
  function markTabs() {
    var hash = (location.hash || "").replace(/^#/, "");
    var links = document.querySelectorAll('#root a[href^="#/"]');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var target = a.getAttribute("href").slice(2);
      a.classList.add("xn-disc-tab");
      var on = target === hash || (hash === "" && target === "full");
      a.classList.toggle("is-on", on);
      if (on) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    }
  }

  /* ---------- 占位标题 ---------- */
  var TOOL_NO = { E: "05", F: "06" };
  function fixPlaceholders() {
    var nodes = document.querySelectorAll("#root span, #root p, #root h1, #root h2, #root h3, #root a, #root strong, #root b, #root button");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.children.length) continue;
      var t = txt(el);
      var m = /^工具([EF])(\s*)(.*)$/.exec(t);
      if (m) {
        el.textContent = "工具 " + TOOL_NO[m[1]] + (m[3] ? " " + m[3] : "");
        continue;
      }
      if (t === "E" || t === "F") {
        var nx = el.nextElementSibling;
        if (nx && /^H2$/.test(nx.tagName) && /^工具 0[56]/.test(txt(nx))) el.textContent = TOOL_NO[t];
      }
    }
  }

  /* ---------- 金额输入语义 ---------- */
  var RENAME = [
    { a: /^满多少元$/, grp: true, to: "门槛（元）" },
    { a: /^减多少元$/, grp: true, to: "减额（元）" },
    { a: /^满多少元可用$/, to: "会员门槛（元）" },
    { a: /^%（95 表示 9\.5 折）$/, to: "会员折扣（%，95=9.5折）" },
    { a: /^%（92 相当于 9\.2 折）$/, to: "折扣券折扣（%，92=9.2折）" },
    { a: /^元（充多少钱拿卡）$/, to: "充值金额（元）" },
    { a: /^元（活动赠送的余额）$/, to: "赠送金额（元）" },
    { a: /^元，0 表示赠送随时可用$/, to: "使用金额（元，0=不限）" }
  ];

  function groupOf(input) {
    var anc = input;
    for (var k = 0; k < 6; k++) {
      anc = anc.parentElement;
      if (!anc) break;
      var t = txt(anc).replace(/\s+/g, "");
      var m = /^(店铺券|平台券|满减|会员折扣|折扣券|积分|储值)/.exec(t);
      if (m) return m[1];
    }
    return "";
  }

  function fixAria() {
    var inputs = [].slice.call(document.querySelectorAll("#root input:not([type=checkbox])")).filter(visible);
    inputs.forEach(function (input, idx) {
      var a = input.getAttribute("aria-label") || "";
      /* 工具 05 的四个输入只有单位，按位置补语义 */
      if (a === "元" || a === "折（9.5 表示 9.5 折）") {
        var names = ["商品原价（元）", "优惠券面额（元）", "会员折扣（折，9.5=9.5折）", "积分抵扣（元）"];
        if (names[idx] && /^(元|折)/.test(a)) {
          input.setAttribute("aria-label", names[idx]);
          return;
        }
      }
      for (var i = 0; i < RENAME.length; i++) {
        var r = RENAME[i];
        if (!r.a.test(a)) continue;
        var g = r.grp ? groupOf(input) : "";
        if (!g && r.grp) g = /^减多少元$/.test(a) ? "满减" : "折扣券";
        input.setAttribute("aria-label", (g ? g : "") + r.to);
        return;
      }
    });
  }

  /* ---------- 快捷值 ---------- */
  var RULES = [
    { re: /原价|整单|商品总价|订单原价/, vals: [100, 300, 500, 1000, 2000] },
    { re: /^门店|门槛|满多少元/, vals: [99, 199, 299, 499] },
    { re: /折，9\.5/, vals: [9.5, 9, 8.5, 8] },
    { re: /会员折扣/, vals: [95, 90, 88, 85] },
    { re: /折扣券/, vals: [95, 92, 90, 85] },
    { re: /每多少积分/, vals: [100, 200, 500] },
    { re: /最多可抵/, vals: [0, 50, 100, 500] },
    { re: /可用积分/, vals: [1000, 5000, 10000, 50000] },
    { re: /充值金额/, vals: [200, 500, 1000, 2000] },
    { re: /赠送金额/, vals: [0, 50, 100, 200] },
    { re: /使用金额/, vals: [0, 100, 500, 1000] },
    { re: /减额|减多少元|立减/, vals: [10, 20, 30, 50, 100] },
    { re: /优惠券面额/, vals: [10, 20, 30, 50] },
    { re: /积分抵扣/, vals: [0, 10, 20, 50] }
  ];

  function addChips(input) {
    if (!visible(input)) return;
    if (input.getBoundingClientRect().width < 180) return;
    var label = input.getAttribute("aria-label") || "";
    var rule = null;
    for (var i = 0; i < RULES.length; i++) if (RULES[i].re.test(label)) { rule = RULES[i]; break; }
    if (!rule || input.__xnChips) return;
    var host = input.parentElement;
    if (!host) return;
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

  /* ---------- 列表输入示例 ---------- */
  var DEMOS = [
    { re: /^商品价格/, text: "99\n129\n158\n210", tip: "填入示例（4 件）" },
    { re: /^满减规则/, text: "满200减30\n满300减40\n满500减60", tip: "填入示例（3 档）" }
  ];

  function addDemos() {
    var tas = [].slice.call(document.querySelectorAll("#root textarea")).filter(visible);
    tas.forEach(function (ta) {
      var label = ta.getAttribute("aria-label") || "";
      var demo = null;
      for (var i = 0; i < DEMOS.length; i++) if (DEMOS[i].re.test(label)) { demo = DEMOS[i]; break; }
      if (!demo || ta.__xnDemo) return;
      var host = ta.parentElement;
      if (!host) return;
      var b = document.createElement("button");
      b.type = "button";
      b.className = "xn-disc-demo";
      b.textContent = demo.tip;
      b.onclick = function () { setText(ta, demo.text); setTimeout(updateAll, 60); };
      host.appendChild(b);
      ta.__xnDemo = true;
    });
  }

  /* ---------- 结果分级 ---------- */
  var MONEY = /^[−-]?¥/;
  function rowLabel(el) {
    var row = el;
    for (var i = 0; i < 3; i++) {
      row = row.parentElement;
      if (!row) break;
      var t = txt(row).replace(el.textContent, "").replace(/\s+/g, "");
      if (t.length > 1) return t;
    }
    return "";
  }

  function markResults() {
    var nodes = document.querySelectorAll("#root span, #root div, #root strong, #root b, #root p");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.children.length) continue;
      var t = txt(el);
      if (MONEY.test(t)) {
        var label = rowLabel(el);
        el.classList.remove("xn-disc-hero", "xn-disc-card", "xn-disc-mid", "xn-disc-save", "xn-disc-detail");
        if (/实付金额|到手价|最终实付/.test(label)) el.classList.add("xn-disc-hero");
        else if (/储值总额/.test(label)) el.classList.add("xn-disc-card");
        else if (/合计凑单金额/.test(label)) el.classList.add("xn-disc-mid");
        else if (/优惠金额|总优惠|可抵金额/.test(label)) el.classList.add("xn-disc-save");
        else if (/^实付¥|获得/.test(label)) el.classList.add("xn-disc-detail");
        continue;
      }
      if (/^\d+(\.\d+)?%$/.test(t) && /折扣率|返现|抵扣率/.test(rowLabel(el))) {
        el.classList.add("xn-disc-pct");
      } else if (/^相当于/.test(t)) {
        el.classList.add("xn-disc-fold");
      }
    }
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    markTabs();
    fixPlaceholders();
    fixAria();
    [].slice.call(document.querySelectorAll("#root input:not([type=checkbox])")).forEach(addChips);
    addDemos();
    markResults();
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
