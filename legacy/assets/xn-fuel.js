/* R1269 加油与充电成本对比合集（ijcbb28zig）· 人用友好层
 * - 工具 tab / 标题编号归一（工具A–F → 工具 01–06）
 * - 数字字段补语义 aria、常用值胶囊
 * - 结果面板加「当前设置」摘要，次要指标卡片化
 */
(function () {
  "use strict";
  if (window.__XN_FUEL__) return;
  window.__XN_FUEL__ = true;

  function txt(el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function setAttr(el, k, v) { if (el && el.getAttribute(k) !== v) el.setAttribute(k, v); }
  function visible(el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; }
  function setInput(el, v) {
    var proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    proto.set.call(el, String(v));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }
  var applying = false;

  var LETTER = { A: "01", B: "02", C: "03", D: "04", E: "05", F: "06" };
  var CIRCLED = { "⑤": "05", "⑥": "06", "①": "01", "②": "02", "③": "03", "④": "04" };

  function tidyTitle(s) {
    var m = s.match(/^工具\s*([A-F])\s*(.*)$/);
    if (m) {
      var rest = (m[2] || "").replace(/^[·:：\s]+/, "");
      return "工具 " + LETTER[m[1]] + (rest ? " · " + rest : "");
    }
    m = s.match(/^([①②③④⑤⑥⑦⑧⑨⑩])\s*(.*)$/);
    if (m) return "工具 " + (CIRCLED[m[1]] || m[1]) + (m[2] ? " · " + m[2] : "");
    return null;
  }

  function fieldLabel(inp) {
    var id = inp.id;
    var l = id ? document.querySelector('label[for="' + id + '"]') : null;
    if (l) return txt(l);
    var box = inp.parentElement && inp.parentElement.parentElement;
    if (box) {
      var lb = box.querySelector("label");
      if (lb) return txt(lb);
    }
    return inp.getAttribute("aria-label") || "输入";
  }

  function unitOf(inp) {
    var w = inp.parentElement;
    var s = w && w.querySelector("span:last-child");
    var u = s ? txt(s) : "";
    if (!u) u = inp.getAttribute("aria-label") || "";
    return u.replace(/^单位[:：]?/, "").trim();
  }

  function fmtValue(v, unit) {
    if (v === "" || v == null) return "";
    var n = parseFloat(v);
    if (isNaN(n)) return String(v);
    if (/^km$/i.test(unit)) return n.toLocaleString("en-US") + " km";
    if (n >= 10000) {
      var w = n / 10000;
      return (w % 1 === 0 ? w : w.toFixed(1)).toString().replace(/\.0$/, "") + " 万";
    }
    if (/^元\/km$/i.test(unit)) return "¥" + n;
    if (unit === "%") return n + "%";
    if (unit && unit.length <= 6) return n + " " + unit;
    return String(n);
  }

  /* ---------- 常用值 ---------- */
  var RULES = [
    { re: /百公里油耗/, vals: [5, 6, 7, 8, 10] },
    { re: /^油价$/, vals: [7, 7.5, 8, 8.5, 9] },
    { re: /年行驶里程|年均里程/, vals: [10000, 15000, 20000, 30000] },
    { re: /油车每公里成本/, vals: [0.4, 0.5, 0.56, 0.7] },
    { re: /百公里电耗/, vals: [12, 15, 18] },
    { re: /^电价$/, vals: [0.6, 0.8, 1.2, 1.5] },
    { re: /充电桩与安装费/, vals: [2000, 4000, 8000] },
    { re: /公共充电单价/, vals: [1.2, 1.5, 1.8] },
    { re: /家用充电单价/, vals: [0.5, 0.8, 1.0] },
    { re: /每次充电量/, vals: [30, 40, 60] },
    { re: /每月充电次数/, vals: [4, 8, 12] },
    { re: /电池容量/, vals: [40, 60, 80, 100] },
    { re: /当前电量/, vals: [20, 30, 50, 80] },
    { re: /充电功率/, vals: [3.5, 7, 11, 60] },
    { re: /满能续航/, vals: [400, 500, 600, 700] },
    { re: /总里程/, vals: [300, 600, 800, 1000] },
    { re: /出发时剩余/, vals: [50, 80, 100] },
    { re: /购车价/, vals: [10, 15, 20, 30] },
    { re: /使用年限/, vals: [5, 8, 10] },
    { re: /年保养费/, vals: [1000, 2000, 3000] },
    { re: /常规电费\/油费|常规电费/, vals: [0.4, 0.56, 0.7] }
  ];

  function ruleFor(label) {
    for (var i = 0; i < RULES.length; i++) if (RULES[i].re.test(label)) return RULES[i];
    return null;
  }

  function syncChips(inp, wrap, rule, unit) {
    var cur = parseFloat(inp.value);
    [].slice.call(wrap.children).forEach(function (b, i) {
      b.classList.toggle("is-on", !isNaN(cur) && Math.abs(cur - rule.vals[i]) < 1e-9);
    });
  }

  function addChips(inp) {
    var label = fieldLabel(inp);
    var rule = ruleFor(label);
    if (!rule) return;
    var field = inp.parentElement;
    var host = field && field.parentElement;
    if (!field || !host || host.querySelector(".xn-fl-chips")) return;
    var unit = unitOf(inp);
    var wrap = document.createElement("div");
    wrap.className = "xn-fl-chips";
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", label + " 常用值");
    rule.vals.forEach(function (v) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = fmtValue(v, unit);
      setAttr(b, "aria-label", "设为 " + fmtValue(v, unit));
      b.onclick = function () {
        setInput(inp, v);
        syncChips(inp, wrap, rule, unit);
        setTimeout(updateSummary, 40);
      };
      wrap.appendChild(b);
    });
    host.appendChild(wrap);
    inp.addEventListener("input", function () { syncChips(inp, wrap, rule, unit); });
    inp.addEventListener("change", function () { syncChips(inp, wrap, rule, unit); });
    syncChips(inp, wrap, rule, unit);
  }

  /* ---------- 当前设置摘要 ---------- */
  function fields() {
    return [].slice.call(document.querySelectorAll("#root input")).filter(function (i) {
      return visible(i) && i.type !== "checkbox" && i.type !== "radio";
    });
  }

  function updateSummary() {
    var sec = document.querySelector('#root section[aria-label="计算结果"]');
    if (!sec) return;
    var bar = sec.querySelector(".xn-fl-sum");
    if (!bar) {
      bar = document.createElement("div");
      bar.className = "xn-fl-sum";
      var head = sec.firstElementChild;
      if (head && head.nextSibling) sec.insertBefore(bar, head.nextSibling);
      else sec.insertBefore(bar, sec.firstChild);
    }
    var parts = [];
    fields().forEach(function (inp) {
      var v = (inp.value || "").trim();
      if (!v) return;
      var unit = unitOf(inp);
      parts.push('<span class="xn-fl-p">' + txt(fieldLabel(inp).replace(/（.*?）/g, "").trim()) + " <b>" + fmtValue(v, unit) + "</b></span>");
    });
    var html = '<i>当前设置</i>' + (parts.length ? parts.join(' <u>·</u> ') : "填入数值后自动计算");
    if (bar.innerHTML !== html) bar.innerHTML = html;
    wrapApprox();
  }

  /* 「约 17.9」这类前缀缩小，避免 40px 大字抢读数 */
  function wrapApprox() {
    var bigs = document.querySelectorAll('#root section[aria-label="计算结果"] .text-3xl');
    for (var i = 0; i < bigs.length; i++) {
      var el = bigs[i];
      var raw = txt(el);
      var m = raw.match(/^(约|≈)\s*(.+)$/);
      if (!m || el.querySelector(".xn-fl-ap")) continue;
      el.innerHTML = '<span class="xn-fl-ap">' + m[1] + "</span>" + m[2];
    }
  }

  function apply() {
    if (applying) return;
    var root = document.getElementById("root");
    if (!root) return;
    applying = true;
    try {
      /* 1) 工具 tab */
      var nav = root.querySelector('nav[aria-label="工具切换"]');
      var tabs = root.querySelectorAll('a[href^="#/"]');
      for (var i = 0; i < tabs.length; i++) {
        add(tabs[i], "xn-fl-tab");
        var sp = tabs[i].querySelector("span");
        if (sp) {
          var clean = tidyTitle(txt(sp));
          if (clean && clean !== txt(sp)) sp.textContent = clean;
        }
      }

      /* 2) 标题编号 */
      var h2s = root.querySelectorAll("h2");
      for (var z = 0; z < h2s.length; z++) {
        var raw = txt(h2s[z]);
        if (raw === "使用说明") continue;
        var t = tidyTitle(raw);
        if (t && t !== raw) h2s[z].textContent = t;
      }

      /* 3) 卡片 / 说明卡 / 结果面板 */
      var secs = root.querySelectorAll("section");
      for (var s = 0; s < secs.length; s++) {
        var sec = secs[s];
        if (sec.getAttribute("aria-label") === "计算结果") continue;
        if (sec.querySelector("input")) add(sec, "xn-fl-card");
        var hh = sec.querySelector("h2");
        if (hh && txt(hh) === "使用说明") add(sec, "xn-fl-guide");
      }
      var guideH = [].slice.call(root.querySelectorAll("h2")).filter(function (h) { return txt(h) === "使用说明"; })[0];
      if (guideH) {
        var g = guideH.closest("section") || guideH.parentElement.parentElement;
        if (g) add(g, "xn-fl-guide");
      }

      /* 4) 输入字段 */
      var ins = root.querySelectorAll("input");
      for (var k = 0; k < ins.length; k++) {
        var inp = ins[k];
        if (inp.type === "checkbox" || inp.type === "radio") continue;
        var field = inp.parentElement;
        if (field) add(field, "xn-fl-field");
        var lb = fieldLabel(inp);
        var un = unitOf(inp);
        var want = lb + (un ? "（" + un + "）" : "");
        if (!inp.getAttribute("aria-label") || inp.getAttribute("aria-label") !== want) setAttr(inp, "aria-label", want);
        addChips(inp);
      }
      /* 能源类型切换 */
      var pbtns = root.querySelectorAll("button[aria-pressed]");
      for (var q = 0; q < pbtns.length; q++) add(pbtns[q], "xn-fl-seg");

      /* 5) 复制按钮 / 结果语义 */
      var btns = root.querySelectorAll("button");
      for (var b = 0; b < btns.length; b++) {
        var bt = btns[b];
        if (/复制/.test(txt(bt))) {
          add(bt, "xn-fl-copy");
          setAttr(bt, "aria-label", "复制计算结果");
        }
      }
      var res = root.querySelector('section[aria-label="计算结果"]');
      if (res) {
        var body = res.querySelector(".mt-3");
        if (body && !body.getAttribute("aria-live")) body.setAttribute("aria-live", "polite");
      }

      /* 6) 页脚提示胶囊 */
      var ps = root.querySelectorAll("p");
      for (var p = 0; p < ps.length; p++) {
        if (/正在查看/.test(txt(ps[p])) && txt(ps[p]).length < 60) {
          add(ps[p], "xn-fl-where");
          var raw = txt(ps[p]);
          var fixed = raw.replace(/工具\s*([A-F])/g, function (_, l) { return "工具 " + (LETTER[l] || l); });
          if (fixed !== raw) ps[p].textContent = fixed;
        }
      }

      updateSummary();
    } finally {
      applying = false;
    }
  }

  apply();
  setTimeout(apply, 300);
  setTimeout(apply, 900);
  setTimeout(apply, 1800);
  window.addEventListener("hashchange", function () { setTimeout(apply, 120); setTimeout(apply, 500); });
  document.addEventListener("click", function () { setTimeout(apply, 60); setTimeout(apply, 300); }, true);
  document.addEventListener("input", function () { setTimeout(function () { updateSummary(); }, 120); }, true);
  document.addEventListener("change", function () { setTimeout(function () { updateSummary(); }, 120); }, true);
  var rootEl = document.getElementById("root");
  if (rootEl && window.MutationObserver) {
    var timer = null;
    new MutationObserver(function () {
      if (applying) return;
      clearTimeout(timer);
      timer = setTimeout(apply, 160);
    }).observe(rootEl, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  }
})();
