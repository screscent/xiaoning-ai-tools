/* 小凝工具站 · 合同签署与条款自查增强 xn-contract v1
 * 能力：2 个工具卡片 132h/aria-label/隐藏 #/ 路由泄漏/选中墨蓝渐变；
 *       下拉 48 + aria；金额 52/22；开关 44 热区 + 具名；条款胶囊 44；
 *       生成 50、复制 40 具名；结果 h3 17/li 14.5；说明 44；回到顶部。
 * 注入：legacy/keyyhvdudk.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_CONTRACT__) return;
  window.__XN_CONTRACT__ = true;

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  function clean(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }

  function markTabs() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      if (b.getBoundingClientRect().height < 90) return;
      var spans = Array.prototype.filter.call(b.querySelectorAll("span"), function (s) {
        if (s.querySelector("svg") && !clean(s.textContent)) return false;
        return clean(s.textContent).length > 0;
      });
      if (spans.length < 2) return;
      var name = "";
      var sub = "";
      var hash = null;
      spans.forEach(function (s) {
        var t = clean(s.textContent);
        if (/^#\//.test(t)) { hash = s; return; }
        if (!name) name = t;
        else if (!sub) sub = t;
      });
      if (!name) return;
      if (!b.classList.contains("xn-ct-tab")) b.classList.add("xn-ct-tab");
      spans.forEach(function (s) {
        var t = clean(s.textContent);
        if (/^#\//.test(t)) { s.classList.add("xn-ct-hash"); return; }
        if (t === name && !s.classList.contains("xn-ct-name")) s.classList.add("xn-ct-name");
        else if (t === sub && !s.classList.contains("xn-ct-sub")) s.classList.add("xn-ct-sub");
      });
      if (hash) hash.classList.add("xn-ct-hash");
      var aria = name + (sub ? "：" + sub : "");
      if (b.getAttribute("aria-label") !== aria) b.setAttribute("aria-label", aria);
    });
  }

  function markSelects() {
    var list = Array.prototype.filter.call(document.querySelectorAll("#root select"), vis);
    list.forEach(function (s, i) {
      var aria = i === 0 ? "合同类型" : i === 1 ? "我方身份" : "";
      if (!aria) return;
      if (s.getAttribute("aria-label") !== aria) s.setAttribute("aria-label", aria);
    });
  }

  function markAmount() {
    Array.prototype.forEach.call(document.querySelectorAll('#root input[type="number"]'), function (i) {
      if (!vis(i)) return;
      if (i.getAttribute("aria-label") !== "合同金额（元）") i.setAttribute("aria-label", "合同金额（元）");
      if (!i.placeholder) i.placeholder = "请输入金额";
    });
  }

  function rowName(b) {
    var prev = b.previousElementSibling;
    while (prev) {
      var t = clean(prev.textContent);
      if (t) return t.slice(0, 16);
      prev = prev.previousElementSibling;
    }
    var p = b.parentElement;
    for (var i = 0; i < 3 && p; i++) {
      var pt = clean(p.textContent);
      if (pt && pt.length <= 20) return pt;
      p = p.parentElement;
    }
    return "";
  }

  function markSwitches() {
    Array.prototype.forEach.call(document.querySelectorAll('#root button[role="switch"]'), function (b) {
      if (!vis(b)) return;
      if (!b.classList.contains("xn-ct-switch")) b.classList.add("xn-ct-switch");
      var name = rowName(b) || "选项";
      if (b.getAttribute("aria-label") !== name) b.setAttribute("aria-label", name);
      if (!b.title) b.title = name;
    });
  }

  function markChips() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button[aria-pressed]"), function (b) {
      if (!vis(b)) return;
      if (!b.classList.contains("xn-ct-chip")) b.classList.add("xn-ct-chip");
    });
  }

  function markBlocks() {
    Array.prototype.forEach.call(document.querySelectorAll("#root section h3"), function (h) {
      if (!vis(h)) return;
      var box = h.parentElement && h.parentElement.parentElement;
      if (!box) return;
      if (!box.querySelector("button") || !/复制/.test(box.textContent)) return;
      if (!box.classList.contains("xn-ct-block")) box.classList.add("xn-ct-block");
    });
  }

  function markButtons() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      if (b.getAttribute("role") === "switch" || b.hasAttribute("aria-pressed")) return;
      var t = clean(b.textContent);
      var aria = "";
      var primary = false;
      if (t === "生成必查清单") { aria = "生成合同必查清单"; primary = true; }
      else if (t === "复制清单") { aria = "复制完整必查清单"; primary = true; }
      else if (t === "复制自查结果") { aria = "复制条款自查结果"; primary = true; }
      else if (t === "复制") {
        var h = b.closest("div") && b.closest("div").querySelector("h3");
        var ht = h ? clean(h.textContent).slice(0, 20) : "当前区块";
        aria = "复制" + ht;
      }
      if (!aria) return;
      if (b.getAttribute("aria-label") !== aria) b.setAttribute("aria-label", aria);
      if (!b.title) b.title = aria;
      if (t === "复制" && !b.classList.contains("xn-ct-copy")) b.classList.add("xn-ct-copy");
      if (primary && !b.classList.contains("xn-ct-primary")) b.classList.add("xn-ct-primary");
    });
  }

  // 无深链时回到页首，避免应用自动滚到工具区而错过标题与工具卡
  var userScrolled = false;
  function markUserScroll() { userScrolled = true; }
  if (!location.hash) {
    ["wheel", "touchstart", "keydown"].forEach(function (ev) {
      window.addEventListener(ev, markUserScroll, { passive: true, once: true });
    });
    [600, 1400, 2400].forEach(function (ms) {
      window.setTimeout(function () {
        if (!userScrolled) window.scrollTo({ top: 0 });
      }, ms);
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "xn-ct-top";
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
      markSelects();
      markAmount();
      markSwitches();
      markChips();
      markBlocks();
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
