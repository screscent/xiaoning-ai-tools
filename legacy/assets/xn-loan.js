/* 房贷与购房成本合集页增强（仅 3xh2yr5af3 引用）
 * - 顶部导航卡：修复 hash 路由死链，改为页内跳转 + 当前区块高亮
 * - 数字输入：按字段语义补「快捷值」胶囊（金额/利率/年限/比例…）
 * - 每个计算器主按钮上方：当前设置摘要
 * - 计算结果：月供/总利息放大，节省类数值做绿色徽标
 * 不侵入业务逻辑：只加 class / 兄弟节点，随 React 重渲染自动重建。
 */
(function () {
  "use strict";
  if (window.__XN_LOAN__) return;
  window.__XN_LOAN__ = true;

  /* ---------- 小工具 ---------- */
  function txt(el) { return (el.textContent || "").trim(); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function setInput(el, v) {
    var proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    proto.set.call(el, String(v));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.dispatchEvent(new Event("blur", { bubbles: true }));
  }

  function isActiveBtn(b) {
    var c = (b.className || "").toString();
    return /bg-blue-600|bg-blue-500|bg-indigo-\d00/.test(c) || b.getAttribute("aria-pressed") === "true";
  }

  /* ---------- 快捷值规则 ---------- */
  var RULES = [
    { re: /提前还款|可用首付/, vals: null },
    { re: /贷款金额|贷款总额|房屋总价|购房总价/, vals: [100, 200, 300, 500], unit: "万" },
    { re: /年利率|贷款利率/, vals: [3.1, 3.5, 4.2], unit: "%" },
    { re: /首付比例/, vals: [20, 30, 40], unit: "%" },
    { re: /月供收入比/, vals: [30, 40, 50], unit: "%" },
    { re: /家庭月收入/, vals: [10000, 20000, 30000], unit: "元", money: true },
    { re: /已还款年数/, vals: [0, 3, 5], unit: "年" },
    { re: /计划持有年限/, vals: [5, 10, 20], unit: "年" },
    { re: /建筑面积/, vals: [60, 89, 120], unit: "㎡" },
    { re: /月租金/, vals: [2000, 4000, 6000], unit: "元", money: true },
    { re: /租金年涨幅/, vals: [0, 2, 5], unit: "%" },
    { re: /中介费率/, vals: [1, 2, 3], unit: "%" }
  ];

  function ruleFor(label) {
    for (var i = 0; i < RULES.length; i++) if (RULES[i].re.test(label)) return RULES[i];
    return null;
  }

  function chipText(v, rule) {
    if (rule.money) return v >= 10000 ? (v / 10000) + " 万" : v + " 元";
    return v + (rule.unit || "");
  }

  /* ---------- 快捷值注入 ---------- */
  function addChips(input) {
    var label = input.getAttribute("aria-label") || "";
    var rule = ruleFor(label);
    if (!rule || !rule.vals) return;
    var field = input.parentElement;
    if (!field) return;
    var wrap = field.querySelector(".xn-chips");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "xn-chips";
      rule.vals.forEach(function (v) {
        var b = document.createElement("button");
        b.type = "button";
        b.textContent = chipText(v, rule);
        b.onclick = function () {
          setInput(input, v);
          setTimeout(updateAll, 40);
        };
        wrap.appendChild(b);
      });
      field.appendChild(wrap);
      input.addEventListener("input", function () { syncChips(input, wrap, rule); });
      input.addEventListener("change", function () { syncChips(input, wrap, rule); });
    }
    syncChips(input, wrap, rule);
  }

  function syncChips(input, wrap, rule) {
    var cur = parseFloat(input.value);
    var btns = [].slice.call(wrap.children);
    btns.forEach(function (b, i) {
      var v = rule.vals[i];
      b.classList.toggle("is-on", !isNaN(cur) && Math.abs(cur - v) < 1e-9);
    });
  }

  /* ---------- 当前设置摘要 ---------- */
  function shortLabel(l) {
    var s = l.replace(/（.*?）/g, "").replace(/\(.*?\)/g, "");
    s = s.split(/\s+|建议|常见|可为|选填/)[0];
    return s.trim();
  }
  function unitOf(label) {
    if (/万元/.test(label)) return " 万";
    if (/%/.test(label)) return "%";
    if (/元\/月/.test(label)) return " 元/月";
    if (/元/.test(label)) return " 元";
    if (/㎡/.test(label)) return " ㎡";
    if (/年/.test(label)) return " 年";
    return "";
  }

  function sectionSummary(section) {
    var parts = [];
    var inputs = [].slice.call(section.querySelectorAll("input"));
    inputs.forEach(function (inp) {
      if (!inp.value || inp.type === "range") return;
      var l = inp.getAttribute("aria-label") || "";
      if (!l || parts.length >= 4) return;
      parts.push(shortLabel(l) + " " + inp.value + unitOf(l));
    });
    var yearBtns = [].slice.call(section.querySelectorAll("button")).filter(function (b) {
      return /^\d+\s*年$/.test(txt(b)) && isActiveBtn(b);
    })[0];
    if (yearBtns && parts.length < 4) parts.push("年限 " + txt(yearBtns));
    var method = [].slice.call(section.querySelectorAll("button")).filter(function (b) {
      return /^等额(本息|本金)$/.test(txt(b)) && isActiveBtn(b);
    })[0];
    if (method) {
      if (parts.length) parts.push(txt(method));
      else return { parts: [], method: txt(method) };
    }
    return { parts: parts, method: "" };
  }

  function updateBars() {
    var btns = [].slice.call(document.querySelectorAll("#root button")).filter(function (b) {
      var c = (b.className || "").toString();
      return /w-full/.test(c) && /bg-blue-6|bg-indigo-\d00/.test(c);
    });
    btns.forEach(function (btn) {
      var section = btn.closest("section");
      if (!section) return;
      var bar = section.querySelector(".xn-setbar");
      if (!bar) {
        bar = document.createElement("div");
        bar.className = "xn-setbar";
        btn.parentElement.insertBefore(bar, btn);
      }
      var sum = sectionSummary(section);
      var parts = sum.parts;
      var html = '<span class="xn-setlabel">当前设置</span>';
      if (!parts.length) {
        html += '<span class="xn-setnote">' + (sum.method
          ? "已选" + esc(sum.method) + "，填写金额与利率后点击下方按钮"
          : "填写关键数值后点击下方按钮") + "</span>";
      } else {
        html += parts.map(function (p) { return "<b>" + esc(p) + "</b>"; }).join("<span>·</span>");
      }
      if (bar.innerHTML !== html) bar.innerHTML = html;
    });
  }

  /* ---------- 顶部导航修复 ---------- */
  function fixNav() {
    var links = [].slice.call(document.querySelectorAll("#root a[href^='#/']"));
    links.forEach(function (a) {
      var route = a.getAttribute("href").replace(/^#\//, "");
      var id = "tool-" + route;
      if (!document.getElementById(id)) return;
      a.setAttribute("href", "#" + id);
      a.setAttribute("title", "跳到「" + txt(a).slice(0, 12) + "」");
      if (!a.dataset.xnNav) {
        a.dataset.xnNav = "1";
        a.addEventListener("click", function (e) {
          var sec = document.getElementById(id);
          if (!sec) return;
          e.preventDefault();
          sec.scrollIntoView({ behavior: "smooth", block: "start" });
          history.replaceState(null, "", "#" + id);
        });
      }
    });
    spy();
  }

  var spyIO = null;
  function spy() {
    if (spyIO || !window.IntersectionObserver) return;
    var sections = [].slice.call(document.querySelectorAll("#root section[id^='tool-']"));
    if (!sections.length) return;
    spyIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id;
        [].slice.call(document.querySelectorAll("#root a.group")).forEach(function (a) {
          a.classList.toggle("xn-nav-active", a.getAttribute("href") === "#" + id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (s) { spyIO.observe(s); });
  }

  /* ---------- 占位标题修正 ---------- */
  function fixHeadings() {
    [].slice.call(document.querySelectorAll("#root h2")).forEach(function (h) {
      var t = txt(h);
      if (/^工具[A-Z]\s*/.test(t)) {
        var real = t.replace(/^工具[A-Z]\s*/, "");
        if (real) h.textContent = real;
      }
    });
  }

  /* ---------- 结果数字 ---------- */
  var VALUE_RE = /^[\d,]+(\.\d+)?\s*(元\/月|元|万元|%|期|年)$/;

  function markNumbers() {
    var nodes = [].slice.call(document.querySelectorAll("#root span, #root strong, #root b"));
    nodes.forEach(function (el) {
      if (el.children.length) return;
      var t = txt(el);
      if (!t || t.length > 18 || !VALUE_RE.test(t)) return;
      var row = el.parentElement;
      if (!row) return;
      if (/input|label/i.test(row.tagName)) return;
      var rowTxt = txt(row).replace(t, "");
      if (!/月供|利息|总额|总还款|首付|税费|契税|个税|增值税|中介费|节省|多省|少付|差额|成本|余额|合计|净支出/.test(rowTxt)) return;
      el.classList.remove("xn-hero", "xn-num", "xn-save");
      if (/月供/.test(rowTxt) && /元\/月/.test(t)) el.classList.add("xn-hero");
      else if (/节省|多省|少付|差额/.test(rowTxt)) el.classList.add("xn-save");
      else if (/总利息|总还款|首付|税费|总支出|合计/.test(rowTxt)) el.classList.add("xn-num");
    });
  }

  /* ---------- 汇总 ---------- */
  function updateAll() {
    if (!document.getElementById("root")) return;
    fixHeadings();
    fixNav();
    [].slice.call(document.querySelectorAll("#root input[aria-label]")).forEach(addChips);
    updateBars();
    markNumbers();
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
