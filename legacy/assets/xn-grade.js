/* xn-grade.js · 成绩与 GPA 换算合集 人用友好增强（幂等） */
(function () {
  if (window.__XN_GRADE__) return;
  window.__XN_GRADE__ = 1;

  var root = function () { return document.querySelector("#root"); };

  var VERDICT = {
    bad: ["不可达", "较差", "不合格", "偏低"],
    warn: ["接近", "临界", "一般", "勉强"],
    good: ["可达", "优秀", "良好", "充裕", "达标"]
  };
  function verdictKind(txt) {
    txt = (txt || "").trim();
    for (var k in VERDICT) {
      var arr = VERDICT[k];
      for (var i = 0; i < arr.length; i++) if (txt.indexOf(arr[i]) >= 0) return k;
    }
    return "";
  }

  /* 标题归一：工具X → 工具 0N */
  function normalizeH2() {
    var r = root(); if (!r) return;
    r.querySelectorAll("section h2").forEach(function (h) {
      if (h.dataset.xnNorm) return;
      var txt = (h.textContent || "").trim();
      var m = txt.match(/^工具\s*([A-Z])\s*[·:：]?\s*(.*)$/);
      if (m) {
        var n = m[1].charCodeAt(0) - 64; // A=1
        var num = String(n).padStart(2, "0");
        h.textContent = "工具 " + num + " · " + m[2];
      }
      h.dataset.xnNorm = "1";
    });
  }

  /* 导航高亮：按 hash 定位，默认首个 */
  function markActive() {
    var r = root(); if (!r) return;
    var links = r.querySelectorAll("nav a[href^='#/']");
    if (!links.length) return;
    var h = (location.hash || "").replace(/\/+$/, "");
    var match = null;
    links.forEach(function (a) {
      if (a.getAttribute("href") === h) match = a;
    });
    if (!match) match = links[0];
    links.forEach(function (a) {
      var on = a === match;
      a.classList.toggle("xn-active", on);
      if (on) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  /* 结果区装饰：结果面板 / 指标卡 / 判定徽标 / 次级按钮 */
  function decorate() {
    var r = root(); if (!r) return;

    /* 复制类按钮 → 次级样式 */
    r.querySelectorAll("section button").forEach(function (b) {
      if ((b.textContent || "").indexOf("复制") >= 0) b.classList.add("gx-copy");
    });

    r.querySelectorAll("section").forEach(function (sec) {
      var btn = sec.querySelector("button");
      var panel = btn ? btn.nextElementSibling : null;
      if (!panel || !panel.querySelector) return;
      /* 结果面板通常包含一个指标 grid 或其值用 text-2xl/3xl */
      if (!panel.querySelector(".grid, p.text-2xl, p.text-3xl, strong")) return;
      if (!panel.classList.contains("gx-result")) panel.classList.add("gx-result");
    });

    r.querySelectorAll(".gx-result").forEach(function (p) {
      /* 指标卡：仅 grid 的直接子卡片，避免误伤说明卡 */
      p.querySelectorAll(".grid > div").forEach(function (card) {
        if (!card.querySelectorAll("p").length) return;
        var ps = card.querySelectorAll("p");
        if (ps.length < 2) return;
        if (!card.classList.contains("gx-metric")) card.classList.add("gx-metric");
        if (!ps[0].classList.contains("gx-metric-label")) ps[0].classList.add("gx-metric-label");
        var val = ps[ps.length - 1];
        var kind = verdictKind(val.textContent);
        if (kind) {
          val.classList.remove("gx-metric-val", "gx-v-good", "gx-v-warn", "gx-v-bad");
          val.classList.add("gx-verdict", "gx-v-" + kind);
        } else if (!val.classList.contains("gx-metric-val")) {
          val.classList.add("gx-metric-val");
        }
      });
      /* 正文其它位置的判定词徽标 */
      p.querySelectorAll("strong, b, .font-bold").forEach(function (el) {
        if (el.closest(".gx-metric")) return;
        if (el.classList.contains("gx-verdict")) return;
        var kind = verdictKind(el.textContent);
        if (!kind) return;
        el.classList.add("gx-verdict", "gx-v-" + kind);
      });
    });
  }

  function run() { normalizeH2(); markActive(); decorate(); }

  function start() {
    run();
    window.addEventListener("hashchange", markActive);
    var r = root();
    if (r && !window.__XN_GRADE_OBS__) {
      window.__XN_GRADE_OBS__ = 1;
      var t = null;
      var obs = new MutationObserver(function () {
        if (t) return;
        t = setTimeout(function () { t = null; run(); }, 120);
      });
      obs.observe(r, { childList: true, subtree: true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
