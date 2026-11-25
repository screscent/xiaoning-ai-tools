/* 小凝工具站 · 敏感词检测与脱敏增强 xn-mask v1
 * 能力：2 个工具标签 44 + aria-pressed；开始检测/替换脱敏 50；复制清空 44 具名；
 *       区分大小写开关扩 44 热区 + aria-label；输入/下拉 48；命中词胶囊与计数放大；说明分工具；回到顶部。
 * 注入：legacy/uisqu2xjku.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_MASK__) return;
  window.__XN_MASK__ = true;

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  var GUIDE = {
    detect: [
      "① 粘贴待检测文本，可选填自定义敏感词（逗号分隔）。",
      "② 选择匹配方式（包含 / 全词 / 正则）与替换字符，需要时打开「区分大小写」。",
      "③ 点「开始检测」，下方会给出过滤后文本与命中词次数，可复制结果。"
    ],
    mask: [
      "① 粘贴需要脱敏的文本，可自定义替换符（默认 *）。",
      "② 点「替换脱敏」，下方即时给出脱敏后的文本。",
      "③ 复制脱敏结果再对外分享。"
    ]
  };

  function tabButtons() {
    return Array.prototype.filter.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return false;
      var t = (b.textContent || "").replace(/\s+/g, "");
      if (t !== "敏感词检测" && t !== "替换脱敏") return false;
      var cls = String(b.className || "");
      return cls.indexOf("px-4") >= 0 && cls.indexOf("py-1.5") >= 0;
    });
  }

  function tabKey() {
    var key = "detect";
    tabButtons().forEach(function (b) {
      if (/(^|\s)bg-blue-600(\s|$)/.test(b.className || "")) {
        key = /替换脱敏/.test(b.textContent) ? "mask" : "detect";
      }
    });
    return key;
  }

  function markTabs() {
    var tabs = tabButtons();
    tabs.forEach(function (b) {
      var isMask = /替换脱敏/.test(b.textContent);
      var on = /(^|\s)bg-blue-600(\s|$)/.test(b.className || "");
      if (!b.classList.contains("xn-mk-tab")) b.classList.add("xn-mk-tab");
      var p = String(on);
      if (b.getAttribute("aria-pressed") !== p) b.setAttribute("aria-pressed", p);
      var label = isMask ? "替换脱敏" : "敏感词检测";
      if (b.getAttribute("aria-label") !== label) b.setAttribute("aria-label", label);
    });
    var bar = tabs[0] && tabs[0].parentElement;
    if (bar && bar.classList && !bar.classList.contains("xn-mk-tabbar")) bar.classList.add("xn-mk-tabbar");
  }

  function markFields() {
    Array.prototype.filter.call(document.querySelectorAll('#root textarea'), vis).forEach(function (t) {
      if (t.getAttribute("readonly") !== null) return;
      if (!t.getAttribute("aria-label")) t.setAttribute("aria-label", "输入文本（" + (tabKey() === "mask" ? "替换脱敏" : "敏感词检测") + "）");
    });
    Array.prototype.filter.call(document.querySelectorAll('#root div[role="switch"]'), vis).forEach(function (s) {
      if (s.getAttribute("aria-label") !== "区分大小写") s.setAttribute("aria-label", "区分大小写");
    });
  }

  function markButtons() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      if (b.classList.contains("xn-mk-tab")) return;
      var text = (b.textContent || "").replace(/\s+/g, "").trim();
      var key = tabKey();
      var aria = "";
      if (text === "开始检测") aria = "开始检测敏感词";
      else if (text === "替换脱敏") aria = "开始替换脱敏";
      else if (text === "清空") aria = "清空输入和结果";
      else if (text === "复制结果" || text === "复制") aria = key === "mask" ? "复制脱敏结果" : "复制检测结果";
      if (aria && b.getAttribute("aria-label") !== aria) {
        b.setAttribute("aria-label", aria);
        if (!b.title) b.title = aria;
      }
    });
  }

  function stripH2() {
    Array.prototype.forEach.call(document.querySelectorAll("#root h2"), function (h) {
      if (h.children.length) return;
      var t = (h.textContent || "").trim();
      var c = t.replace(/^[①②③④⑤⑥⑦⑧⑨]\s*/, "");
      if (c && c !== t) h.textContent = c;
    });
  }

  function rewriteGuide() {
    var d = document.querySelector("#root details");
    if (!d) return;
    var summary = d.querySelector("summary");
    if (summary && (summary.textContent || "").indexOf("使用说明") < 0) return;
    var key = tabKey();
    if (d.getAttribute("data-xn-guide") === key) return;
    var host = null;
    Array.prototype.forEach.call(d.children, function (c) {
      if (c.tagName.toLowerCase() !== "summary" && !host) host = c;
    });
    if (!host) return;
    var steps = GUIDE[key] || GUIDE.detect;
    host.innerHTML = "";
    steps.forEach(function (t) {
      var p = document.createElement("p");
      p.textContent = t;
      host.appendChild(p);
    });
    d.setAttribute("data-xn-guide", key);
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "xn-mk-top";
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
      stripH2();
      markFields();
      markButtons();
      rewriteGuide();
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
    }, 80);
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
