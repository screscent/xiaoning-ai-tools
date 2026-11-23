/* xn-cwv.js · 前端性能 CWV 速查 人用友好增强（幂等） */
(function () {
  if (window.__XN_CWV__) return;
  window.__XN_CWV__ = 1;

  var root = function () { return document.querySelector("#root"); };
  var norm = function (s) { return (s || "").replace(/\s+/g, " ").trim(); };

  function decorateChips() {
    var r = root(); if (!r) return;
    r.querySelectorAll("section button").forEach(function (b) {
      var txt = norm(b.textContent);
      if (!txt || txt.length > 8) return;
      if (txt.indexOf("复制") >= 0) return;
      if (b.classList.contains("cwv-copy")) return;
      b.classList.add("cwv-chip");
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "筛选指标：" + txt);
      if (!b.hasAttribute("aria-pressed")) b.setAttribute("aria-pressed", "false");
    });
    syncPressed();
  }

  function decorateCopy() {
    var r = root(); if (!r) return;
    r.querySelectorAll("section button").forEach(function (b) {
      if (norm(b.textContent).indexOf("复制") < 0) return;
      b.classList.add("cwv-copy");
      if (!b.getAttribute("aria-label")) {
        var art = b.closest("article");
        var h3 = art ? art.querySelector("h3") : null;
        b.setAttribute("aria-label", "复制" + (h3 ? "：" + norm(h3.textContent) : "本段"));
      }
    });
  }

  function decorateThresholds() {
    var r = root(); if (!r) return;
    r.querySelectorAll("section article div").forEach(function (d) {
      if (d.classList.contains("cwv-th")) return;
      var cls = d.className || "";
      if (!/ring-1|ring-inset/.test(cls)) return;
      var ps = d.querySelectorAll("p");
      if (ps.length < 2) return;
      d.classList.add("cwv-th");
    });
  }

  function syncPressed() {
    var r = root(); if (!r) return;
    var input = r.querySelector("input[type=text]");
    var val = input ? norm(input.value).toLowerCase() : "";
    r.querySelectorAll("button.cwv-chip").forEach(function (b) {
      var on = val && val === norm(b.textContent).toLowerCase();
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  /* 搜索计数提示 */
  function ensureHint() {
    var r = root(); if (!r) return;
    var input = r.querySelector("input[type=text]");
    if (!input) return;
    var wrap = input.closest("div.relative") || input.parentElement;
    if (!wrap || !wrap.parentElement) return;
    var hint = wrap.parentElement.querySelector(".cwv-hint");
    if (!hint) {
      hint = document.createElement("div");
      hint.className = "cwv-hint";
      wrap.parentElement.insertBefore(hint, wrap.nextSibling);
    }
    var arts = [...r.querySelectorAll("section article")].filter(function (a) { return a.getBoundingClientRect().height > 0; });
    var n = arts.length;
    var kw = norm(input.value);
    if (kw) hint.innerHTML = "匹配 <b>" + n + "</b> 个指标（关键词：" + kw + "）<button type=\"button\" class=\"cwv-clear\">清空</button>";
    else hint.innerHTML = "共 <b>" + n + "</b> 个指标 · 输入关键词即时筛选";
    var clear = hint.querySelector(".cwv-clear");
    if (clear) clear.onclick = function () {
      var s = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
      s.set.call(input, "");
      input.dispatchEvent(new Event("input", { bubbles: true }));
      setTimeout(run, 60);
    };
  }

  function run() {
    decorateChips();
    decorateCopy();
    decorateThresholds();
    ensureHint();
  }

  function start() {
    run();
    var r = root();
    if (r) {
      r.addEventListener("input", function () { syncPressed(); ensureHint(); }, true);
      r.addEventListener("click", function () { setTimeout(function () { syncPressed(); ensureHint(); }, 80); }, true);
    }
    if (r && !window.__XN_CWV_OBS__) {
      window.__XN_CWV_OBS__ = 1;
      var t = null;
      new MutationObserver(function () {
        if (t) return;
        t = setTimeout(function () { t = null; run(); }, 140);
      }).observe(r, { childList: true, subtree: true });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
