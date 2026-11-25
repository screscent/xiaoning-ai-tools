/* 小凝工具站 · 行李打包清单增强 xn-pack v1
 * 能力：5 个场景卡 92h/aria-current/具名；h2 去「工具E」；
 *       清单项 28→44 + 勾选方块 18 + aria-pressed；全选/清空/复制清单 44 具名；
 *       进度数字 18/800；回到顶部。
 * 注入：legacy/tbnvznmk3t.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_PACK__) return;
  window.__XN_PACK__ = true;

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }
  function clean(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }

  /* ---------- 标题去占位 ---------- */
  function cleanHeads() {
    Array.prototype.forEach.call(document.querySelectorAll("#root h2, #root details h2"), function (h) {
      Array.prototype.forEach.call(h.childNodes, function (n) {
        if (n.nodeType !== 3) return;
        var t = n.nodeValue || "";
        var c = t.replace(/^\s*工具[A-Za-z]\s*/, "").replace(/^\s*[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "");
        if (c !== t) n.nodeValue = c;
      });
      Array.prototype.forEach.call(h.querySelectorAll("*"), function (el) {
        if (el.children.length) return;
        var t = el.textContent || "";
        var c = t.replace(/^\s*工具[A-Za-z]\s*/, "").replace(/^\s*[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "");
        if (c && c !== t) el.textContent = c;
      });
    });
  }

  /* ---------- 场景卡 ---------- */
  function markScenes() {
    var links = Array.prototype.filter.call(document.querySelectorAll("#root nav a"), function (a) {
      return vis(a) && a.getAttribute("href") && a.getAttribute("href").indexOf("#/") === 0;
    });
    if (!links.length) return;
    var hash = location.hash || "";
    var active = null;
    links.forEach(function (a) {
      if (!a.classList.contains("xn-pack-scene")) a.classList.add("xn-pack-scene");
      if (hash && a.getAttribute("href") === hash) active = a;
    });
    if (!active && !hash) active = links[0];
    links.forEach(function (a) {
      if (a === active) {
        if (a.getAttribute("aria-current") !== "page") a.setAttribute("aria-current", "page");
      } else if (a.hasAttribute("aria-current")) {
        a.removeAttribute("aria-current");
      }
      var name = clean(a.textContent);
      if (name && a.getAttribute("aria-label") !== name) a.setAttribute("aria-label", name);
    });
  }

  /* ---------- 清单项 ---------- */
  function isItem(b) {
    if (!vis(b)) return false;
    var cls = String(b.className);
    if (!/w-full/.test(cls) || !/rounded-md/.test(cls)) return false;
    if (b.getBoundingClientRect().height > 44) return false;
    if (b.querySelector("svg") && !b.querySelector("span")) return false;
    return true;
  }

  function markItems() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!isItem(b)) return;
      if (!b.classList.contains("xn-pack-item")) b.classList.add("xn-pack-item");
      var on = !!b.querySelector('svg[class*="check"]') || /line-through/.test(String(b.className)) || /bg-(amber|emerald|green|teal)-\d00/.test(String(b.className));
      var want = on ? "true" : "false";
      if (b.getAttribute("aria-pressed") !== want) b.setAttribute("aria-pressed", want);
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", clean(b.textContent) + (on ? "（已备好）" : "（未备好）"));
    });
  }

  /* ---------- 分组计数 ---------- */
  function markCounts() {
    Array.prototype.forEach.call(document.querySelectorAll("#root *"), function (el) {
      if (el.children.length) return;
      var t = clean(el.textContent);
      if (!/^\d+\s*\/\s*\d+$/.test(t)) return;
      if (!el.classList.contains("xn-pack-count")) el.classList.add("xn-pack-count");
    });
  }

  /* ---------- 进度数字 ---------- */
  function markProgress() {
    Array.prototype.forEach.call(document.querySelectorAll("#root *"), function (el) {
      if (el.children.length) return;
      var t = clean(el.textContent);
      if (!/已备/.test(t) || t.length > 20) return;
      var box = el.parentElement;
      if (!box) return;
      Array.prototype.forEach.call(box.querySelectorAll("span, strong, b"), function (v) {
        if (v.children.length) return;
        if (!/\d/.test(v.textContent)) return;
        if (!v.classList.contains("xn-pack-num")) v.classList.add("xn-pack-num");
      });
    });
  }

  /* ---------- 操作按钮 ---------- */
  var ACTS = { "全选": "全选清单物品", "清空": "清空勾选进度", "复制清单": "复制当前场景清单" };
  function markActions() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (!ACTS[t]) return;
      if (!b.classList.contains("xn-pack-act")) b.classList.add("xn-pack-act");
      if (t === "复制清单") b.classList.add("xn-pack-primary");
      if (b.getAttribute("aria-label") !== ACTS[t]) b.setAttribute("aria-label", ACTS[t]);
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "xn-pack-top";
    topBtn.setAttribute("aria-label", "回到顶部");
    topBtn.title = "回到顶部";
    topBtn.textContent = "↑";
    topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    document.body.appendChild(topBtn);
  }

  function tick() {
    try {
      cleanHeads();
      markScenes();
      markItems();
      markCounts();
      markProgress();
      markActions();
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
  document.addEventListener("click", function () { window.setTimeout(tick, 200); }, true);

  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    window.setTimeout(function () { pending = false; tick(); }, 120);
  }
  var mo = new MutationObserver(schedule);
  mo.observe(document.body, { childList: true, subtree: true, characterData: true });
  window.setInterval(tick, 1000);

  window.addEventListener("scroll", function () {
    if (!topBtn) return;
    if (window.scrollY > 620) topBtn.classList.add("is-on");
    else topBtn.classList.remove("is-on");
  }, { passive: true });
})();
