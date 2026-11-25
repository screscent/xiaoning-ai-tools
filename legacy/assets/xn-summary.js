/* 小凝工具站 · 文本摘要与增删统计增强 xn-summary v1
 * 能力：2 个工具标签 44 + aria-pressed/去圈号；保留标点开关 role/switch + aria-checked + 44 热区；
 *       生成/统计 50；复制清空 44 具名；数字放大；结果 aria-live；使用说明按页改写；回到顶部。
 * 注入：legacy/ja4gvvkp5e.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_SUMMARY__) return;
  window.__XN_SUMMARY__ = true;

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  var TOOLS = {
    summary: "摘要压缩",
    diffstat: "增删统计"
  };

  var GUIDE = {
    summary: [
      "① 粘贴原文，设置目标字数与抽取方式（取首尾句 / 按句均分 / 按段落首句）。",
      "② 可调「每句最短字数」过滤碎句；「保留标点」开关决定摘要里是否带标点。",
      "③ 点「生成摘要」查看摘要与压缩率，再按需复制摘要或清空。"
    ],
    diffstat: [
      "① 在「旧文本」「新文本」分别粘贴两版内容。",
      "② 点「统计增删」查看新增 / 删除 / 未变行数、字符变化量与相似度。",
      "③ 下方列出前 10 条变更摘要，可复制统计结果。"
    ]
  };

  function seg() {
    var h = String(location.hash || "").replace(/^#\/?/, "").split(/[?/]/)[0];
    return h === "diffstat" ? "diffstat" : "summary";
  }

  function cleanPrefix(t) {
    return (t || "").replace(/^[①②③④⑤⑥⑦⑧⑨]\s*/, "").trim();
  }

  function markTabs() {
    var key = seg();
    var tabs = Array.prototype.filter.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return false;
      var t = (b.textContent || "").replace(/\s+/g, "");
      return t === "①摘要压缩" || t === "②增删统计" || t === "摘要压缩" || t === "增删统计";
    });
    var active = null;
    tabs.forEach(function (b) {
      var clean = cleanPrefix(b.textContent);
      if (clean && clean !== b.textContent.trim()) b.textContent = clean;
      if (!b.classList.contains("xn-sm-tab")) b.classList.add("xn-sm-tab");
      var isOn = /(^|\s)bg-indigo-600(\s|$)/.test(b.className || "");
      if (isOn) active = clean;
      var p = String(isOn);
      if (b.getAttribute("aria-pressed") !== p) b.setAttribute("aria-pressed", p);
      var label = clean === "摘要压缩" ? "摘要压缩" : clean === "增删统计" ? "增删统计" : clean;
      if (label && b.getAttribute("aria-label") !== label) b.setAttribute("aria-label", label);
    });
    var bar = tabs[0] && tabs[0].parentElement;
    if (bar && bar.classList && !bar.classList.contains("xn-sm-tabbar")) bar.classList.add("xn-sm-tabbar");
    return { key: key, active: active };
  }

  function stripSectionH2() {
    Array.prototype.forEach.call(document.querySelectorAll("#root h2"), function (h) {
      if (h.classList.contains("text-xs")) return;
      if (h.children.length) return;
      var t = (h.textContent || "").trim();
      var c = cleanPrefix(t);
      if (c && c !== t) h.textContent = c;
    });
  }

  function markSwitch() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      if ((b.textContent || "").trim()) return;
      var cls = String(b.className || "");
      if (cls.indexOf("rounded-full") < 0) return;
      if (b.getAttribute("role") !== "switch") b.setAttribute("role", "switch");
      var on = /99,\s*102,\s*241/.test(b.getAttribute("style") || "") || /(^|\s)bg-indigo-600(\s|$)/.test(cls);
      var ck = String(on);
      if (b.getAttribute("aria-checked") !== ck) b.setAttribute("aria-checked", ck);
      var labelEl = b.parentElement && b.parentElement.querySelector("label");
      var name = labelEl ? (labelEl.textContent || "").trim() : "保留标点";
      if (name && b.getAttribute("aria-label") !== name) b.setAttribute("aria-label", name);
      if (!b.title) b.title = name + (on ? "：已开启" : "：已关闭");
      else if (on && b.title.indexOf("已开启") < 0) b.title = name + "：已开启";
      else if (!on && b.title.indexOf("已关闭") < 0) b.title = name + "：已关闭";
    });
  }

  function markButtons() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var text = (b.textContent || "").replace(/\s+/g, "").trim();
      var aria = "";
      if (text === "生成摘要") aria = "生成摘要";
      else if (text === "统计增删") aria = "统计两版本增删";
      else if (text === "复制摘要") aria = "复制摘要文本";
      else if (text === "复制统计结果") aria = "复制增删统计结果";
      else if (text === "清空") aria = "清空输入和结果";
      if (aria && b.getAttribute("aria-label") !== aria) {
        b.setAttribute("aria-label", aria);
        if (!b.title) b.title = aria;
      }
    });
  }

  function markLive() {
    Array.prototype.forEach.call(document.querySelectorAll("#root .rounded-xl"), function (c) {
      if (!vis(c)) return;
      var t = c.textContent || "";
      if (t.indexOf("摘要结果") < 0 && t.indexOf("统计结果") < 0) return;
      if (c.getAttribute("aria-live") !== "polite") c.setAttribute("aria-live", "polite");
    });
  }

  function rewriteGuide() {
    var d = document.querySelector("#root details");
    if (!d) return;
    var summary = d.querySelector("summary");
    if (summary && (summary.textContent || "").indexOf("使用说明") < 0) return;
    var key = seg();
    if (d.getAttribute("data-xn-guide") === key) return;
    var host = null;
    Array.prototype.forEach.call(d.children, function (c) {
      if (c.tagName.toLowerCase() !== "summary" && !host) host = c;
    });
    if (!host) return;
    var steps = GUIDE[key] || GUIDE.summary;
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
    topBtn.className = "xn-sm-top";
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
      stripSectionH2();
      markSwitch();
      markButtons();
      markLive();
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
  window.addEventListener("hashchange", function () { window.setTimeout(tick, 160); });
  document.addEventListener("click", function () { window.setTimeout(tick, 120); }, true);

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
  mo.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["style"] });
  window.setInterval(tick, 900);

  window.addEventListener("scroll", function () {
    if (!topBtn) return;
    if (window.scrollY > 620) topBtn.classList.add("is-on");
    else topBtn.classList.remove("is-on");
  }, { passive: true });
})();
