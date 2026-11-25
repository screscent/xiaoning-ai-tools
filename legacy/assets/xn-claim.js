/* 小凝工具站 · 车险与理赔自查增强 xn-claim v1
 * 能力：5 个工具导航 46h/aria-current/警示橙；输入 52/22 + 语义 aria；
 *       选项胶囊 44；计算/生成 50；结果强调数字 18/800 暖沙块；复制结果 40 具名；回到顶部。
 * 注入：legacy/rdt8374t4r.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_CLAIM__) return;
  window.__XN_CLAIM__ = true;

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  function clean(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }

  function markTabs() {
    var links = Array.prototype.filter.call(document.querySelectorAll("#root nav a"), vis);
    if (!links.length) return;
    var hash = location.hash || "";
    var active = null;
    links.forEach(function (a) {
      if (!a.classList.contains("xn-cl-tab")) a.classList.add("xn-cl-tab");
      if (hash && a.getAttribute("href") === hash) active = a;
    });
    if (!active && !hash) active = links[0];
    links.forEach(function (a) {
      var cur = a === active ? "page" : null;
      if (cur) {
        if (a.getAttribute("aria-current") !== cur) a.setAttribute("aria-current", cur);
      } else if (a.hasAttribute("aria-current")) {
        a.removeAttribute("aria-current");
      }
      var name = clean(a.textContent);
      if (name && a.getAttribute("aria-label") !== name) a.setAttribute("aria-label", name);
    });
  }

  var INPUT_MAP = {
    "工具A": ["车辆价格（万元）", "使用年限（年）", "上年出险次数（次）"],
    "工具C": ["本次维修自费金额（元）", "商业险基准保费（元）", "上年出险次数（次）"],
    "⑤": ["维修总费用（元）", "免赔额（元）"]
  };

  function markInputs() {
    Array.prototype.forEach.call(document.querySelectorAll("#root section"), function (sec) {
      var h = sec.querySelector("h2");
      if (!h) return;
      var title = clean(h.textContent);
      var list = null;
      Object.keys(INPUT_MAP).forEach(function (k) {
        if (!list && title.indexOf(k) === 0) list = INPUT_MAP[k];
      });
      if (!list) return;
      var inputs = Array.prototype.filter.call(sec.querySelectorAll('input[type="number"]'), function () { return true; });
      inputs.forEach(function (i, idx) {
        var aria = list[idx];
        if (!aria) return;
        if (i.getAttribute("aria-label") !== aria) i.setAttribute("aria-label", aria);
      });
    });
  }

  function markChips() {
    Array.prototype.forEach.call(document.querySelectorAll("#root section button[aria-pressed]"), function (b) {
      if (!vis(b)) return;
      if (!b.classList.contains("xn-cl-chip")) b.classList.add("xn-cl-chip");
    });
  }

  var PRIMARY = {
    "计算保费组合": "计算车险保费组合",
    "生成理赔清单": "生成理赔流程与材料清单",
    "计算出险决策": "计算走保险与自费对比",
    "生成快处清单": "生成事故快处清单",
    "计算自付与赔付": "计算自付与保险赔付"
  };

  function markButtons() {
    Array.prototype.forEach.call(document.querySelectorAll("#root section button"), function (b) {
      if (!vis(b)) return;
      if (b.hasAttribute("aria-pressed")) return;
      var t = clean(b.textContent);
      if (PRIMARY[t]) {
        if (!b.classList.contains("xn-cl-primary")) b.classList.add("xn-cl-primary");
        var aria = PRIMARY[t];
        if (b.getAttribute("aria-label") !== aria) b.setAttribute("aria-label", aria);
        if (!b.title) b.title = aria;
      } else if (t === "复制结果") {
        if (!b.classList.contains("xn-cl-copy")) b.classList.add("xn-cl-copy");
        if (b.getAttribute("aria-label") !== "复制当前自查结果") b.setAttribute("aria-label", "复制当前自查结果");
        if (!b.title) b.title = "复制当前自查结果";
      }
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "xn-cl-top";
    topBtn.setAttribute("aria-label", "回到顶部");
    topBtn.title = "回到顶部";
    topBtn.textContent = "↑";
    topBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    document.body.appendChild(topBtn);
  }

  function tick() {
    try {
      markTabs();
      markInputs();
      markChips();
      markButtons();
      ensureTop();
    } catch (e) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tick, { once: true });
  } else {
    tick();
  }
  window.setTimeout(tick, 900);
  window.setTimeout(tick, 2200);
  window.addEventListener("hashchange", tick);
  document.addEventListener("click", function () { window.setTimeout(tick, 160); }, true);

  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    window.setTimeout(function () {
      pending = false;
      tick();
    }, 100);
  }
  var mo = new MutationObserver(schedule);
  mo.observe(document.body, { childList: true, subtree: true, characterData: true });
  window.setInterval(tick, 900);

  window.addEventListener("scroll", function () {
    if (!topBtn) return;
    if (window.scrollY > 620) topBtn.classList.add("is-on");
    else topBtn.classList.remove("is-on");
  }, { passive: true });
})();
