/* 睡眠周期与起床时间合集页增强（仅 2qelpaqqxb 引用）
 * - 顶部「睡眠周期 / 起床反推」hash 死链改页内跳转 + 当前区块高亮
 * - 起床时间 / 入睡耗时快捷值胶囊（时间输入不再只能靠 spinner）
 * - ① 计算按钮上方当前设置摘要
 * - 结果时间 24px 等宽、当前选择 27px、「前一日/次日」标签
 */
(function () {
  "use strict";
  if (window.__XN_SLEEP__) return;
  window.__XN_SLEEP__ = true;

  function txt(el) { return (el.textContent || "").trim(); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function setInput(el, v) {
    var proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    proto.set.call(el, String(v));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  var RULES = [
    { re: /^起床时间/, vals: ["06:30", "07:00", "07:30", "08:00"] },
    { re: /入睡耗时/, vals: [0, 15, 30, 45], unit: " 分钟" }
  ];

  function addChips(input) {
    var label = input.getAttribute("aria-label") || "";
    var rule = null;
    for (var i = 0; i < RULES.length; i++) if (RULES[i].re.test(label)) { rule = RULES[i]; break; }
    if (!rule) return;
    var host = input.parentElement;
    if (!host || host.querySelector(".xn-chips")) return;
    var wrap = document.createElement("div");
    wrap.className = "xn-chips";
    rule.vals.forEach(function (v) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = v + (rule.unit || "");
      b.addEventListener("mousedown", function (e) { e.preventDefault(); });
      b.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        setInput(input, v);
        setTimeout(updateAll, 40);
      };
      wrap.appendChild(b);
    });
    host.appendChild(wrap);
    input.addEventListener("input", function () { syncChips(input, wrap, rule); });
    input.addEventListener("change", function () { syncChips(input, wrap, rule); });
    syncChips(input, wrap, rule);
  }

  function syncChips(input, wrap, rule) {
    var cur = input.value;
    [].slice.call(wrap.children).forEach(function (b, i) {
      var v = String(rule.vals[i]);
      var hit = rule.unit ? parseFloat(cur) === rule.vals[i] : cur === v;
      b.classList.toggle("is-on", hit);
    });
  }

  /* ---------- 当前设置摘要 ---------- */
  function shortOpt(sel) {
    if (!sel) return "";
    var t = sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].text : sel.value;
    return t.replace(/（.*?）/g, "").replace(/\(.*?\)/g, "").trim();
  }

  function toolBlockOf(btn) {
    var n = btn.parentElement;
    for (var i = 0; i < 6 && n; i++, n = n.parentElement) {
      if (n.querySelector && n.querySelector('input[aria-label="起床时间"]') && n.querySelector("select")) return n;
    }
    return null;
  }

  function updateBar() {
    var btn = [].slice.call(document.querySelectorAll("#root button")).filter(function (b) {
      return txt(b) === "计算" && /w-full/.test((b.className || "").toString());
    })[0];
    if (!btn) return;
    var block = toolBlockOf(btn);
    if (!block) return;
    var bar = document.querySelector("#root .xn-setbar");
    if (!bar) {
      bar = document.createElement("div");
      bar.className = "xn-setbar";
      var row = btn.parentElement;
      row.parentElement.insertBefore(bar, row);
    }
    var time = block.querySelector('input[aria-label="起床时间"]');
    var latency = block.querySelector('input[aria-label="入睡耗时（分钟）"]');
    var selects = [].slice.call(block.querySelectorAll("select"));
    var period = selects[0];
    var dir = selects[1];
    var parts = [];
    if (time && time.value) parts.push("起床 " + time.value);
    if (latency && latency.value !== "") parts.push("入睡 " + latency.value + " 分钟");
    if (period) parts.push(shortOpt(period));
    if (dir) parts.push(shortOpt(dir).replace(/就寝$/, ""));
    var html = '<span class="xn-setlabel">当前设置</span>';
    if (!parts.length) html += '<span class="xn-setnote">选择起床时间与周期数后点击计算</span>';
    else html += parts.map(function (p) { return "<b>" + esc(p) + "</b>"; }).join("<span>·</span>");
    if (bar.innerHTML !== html) bar.innerHTML = html;
  }

  /* ---------- 顶部导航 ---------- */
  var spyIO = null;
  function fixNav() {
    var tabs = [].slice.call(document.querySelectorAll("#root a[href^='#/']"));
    if (!tabs.length) return;
    var headings = [].slice.call(document.querySelectorAll("#root h2"));
    var blocks = [];
    tabs.forEach(function (a) {
      var route = a.getAttribute("href").replace(/^#\//, "");
      var key = route === "wake" ? "②" : "①";
      var h = headings.filter(function (x) { return txt(x).indexOf(key) === 0; })[0];
      if (!h) return;
      var block = h.parentElement;
      if (!block.id) block.id = "xn-tool-" + route;
      a.setAttribute("href", "#" + block.id);
      a.classList.add("xn-tab");
      if (!a.dataset.xnNav) {
        a.dataset.xnNav = "1";
        a.addEventListener("click", function (e) {
          e.preventDefault();
          block.scrollIntoView({ behavior: "smooth", block: "start" });
          history.replaceState(null, "", "#" + block.id);
        });
      }
      blocks.push({ id: block.id, el: block });
    });
    if (spyIO || !window.IntersectionObserver) return;
    spyIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        tabs.forEach(function (a) {
          a.classList.toggle("xn-nav-active", a.getAttribute("href") === "#" + en.target.id);
        });
      });
    }, { rootMargin: "-15% 0px -70% 0px", threshold: 0 });
    blocks.forEach(function (b) { spyIO.observe(b.el); });
  }

  /* ---------- 结果强化 ---------- */
  function markResults() {
    var leaves = [].slice.call(document.querySelectorAll("#root span, #root strong"));
    leaves.forEach(function (el) {
      if (el.children.length) return;
      var t = txt(el);
      if (/^\d{2}:\d{2}$/.test(t)) {
        el.classList.add("xn-time");
        var row = el.closest("li");
        if (row && /当前选择/.test(txt(row))) el.classList.add("xn-time-hero");
      } else if (/^(前一日|次日)$/.test(t)) {
        el.classList.add("xn-tag");
      } else if (/^\d+\s?小时(\s\d+\s?分钟)?$/.test(t)) {
        el.classList.add("xn-num-sm");
      }
    });
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    fixNav();
    [].slice.call(document.querySelectorAll("#root input[aria-label]")).forEach(addChips);
    updateBar();
    markResults();
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
