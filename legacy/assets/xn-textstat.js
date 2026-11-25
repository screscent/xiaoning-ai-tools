/* 小凝工具站 · 文本统计与阅读时长增强 xn-textstat v1
 * 能力：6 个工具标签 44 + aria-current；文本域 15.5 + 语义名；复制/清空 40（热区 44）具名；
 *       数字放大（统计 19/时长 22/行段 26）；纯文字开关 role/switch + aria-checked + 44 热区；
 *       阈值下拉语义名；使用说明按工具改写；回到顶部。
 * 注入：legacy/urjgjtdyk8.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_TEXTSTAT__) return;
  window.__XN_TEXTSTAT__ = true;

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  var TOOLS = {
    count: "字符统计",
    time: "阅读时长",
    progress: "阅读进度",
    freq: "词频",
    para: "行与段落",
    dup: "重复行与相似句"
  };

  var GUIDE = {
    count: [
      "① 在文本框粘贴或输入内容，右侧统计会实时更新。",
      "② 依次查看总字符（含空格）、不含空格字符、单词数、行数与段落数。",
      "③ 点「复制」可把当前统计结果整段带走。"
    ],
    time: [
      "① 粘贴要朗读或演讲的文本。",
      "② 页面按 300 字/分估算阅读时长、按 150 字/分估算演讲时长。",
      "③ 需要的话点「复制」保存结果。"
    ],
    progress: [
      "① 填写已读字数、总字数与阅读速度（字/分）。",
      "② 进度条与百分比会实时更新，并给出剩余字数、剩余时长与预计读完时间。",
      "③ 点「复制」可保存当前进度摘要。"
    ],
    freq: [
      "① 粘贴文本，页面自动统计词频前 10。",
      "② 条形越长表示出现次数越多，右侧数字为次数。",
      "③ 底部另给出不同词总数与总词数；可复制结果。"
    ],
    para: [
      "① 粘贴文本，自动统计行数与段落数。",
      "② 查看最长行、平均行长与空行数量。",
      "③ 点「复制」保存统计结果。"
    ],
    dup: [
      "① 粘贴文本，页面自动找出完全重复行与相似句。",
      "② 可切换「忽略大小写与首尾空格」，或调整相似句阈值（70% / 85% / 95%）。",
      "③ 「去重后文本」可单独复制，底部还有处理建议。"
    ]
  };

  function seg() {
    var h = String(location.hash || "").replace(/^#\/?/, "").split(/[?/]/)[0];
    return TOOLS[h] ? h : "count";
  }

  function markTabs() {
    var key = seg();
    var tabs = Array.prototype.filter.call(document.querySelectorAll('#root a[href^="#/"]'), vis);
    tabs.forEach(function (a) {
      var cur = (a.getAttribute("href") || "").replace(/^#\/?/, "");
      var name = TOOLS[cur] || (a.textContent || "").trim();
      if (name && a.getAttribute("aria-label") !== name) a.setAttribute("aria-label", name);
      if (cur === key) {
        if (a.getAttribute("aria-current") !== "page") a.setAttribute("aria-current", "page");
      } else if (a.hasAttribute("aria-current")) {
        a.removeAttribute("aria-current");
      }
    });
    var bar = tabs[0] && tabs[0].parentElement;
    if (bar && bar.classList && !bar.classList.contains("xn-ts-tabbar")) bar.classList.add("xn-ts-tabbar");
  }

  function markFields() {
    var key = seg();
    Array.prototype.filter.call(document.querySelectorAll("#root textarea"), vis).forEach(function (t) {
      var label = "输入文本（" + TOOLS[key] + "）";
      if (t.getAttribute("aria-label") !== label) t.setAttribute("aria-label", label);
    });
    Array.prototype.filter.call(document.querySelectorAll("#root select"), vis).forEach(function (s) {
      var label = "相似句判定阈值";
      if (s.getAttribute("aria-label") !== label) s.setAttribute("aria-label", label);
    });
  }

  function shortName(t) {
    return (t || "").replace(/（[^）]*）/g, "").replace(/\s+/g, " ").trim();
  }

  function nearestName(b) {
    var node = b.parentElement;
    for (var i = 0; i < 6 && node; i++, node = node.parentElement) {
      var h3 = node.querySelector("h3");
      if (h3) return shortName((h3.textContent || "").replace(/^[①②③④⑤⑥⑦⑧⑨]\s*/, ""));
      if (node.tagName === "H3") return shortName((node.textContent || "").replace(/^[①②③④⑤⑥⑦⑧⑨]\s*/, ""));
    }
    var card = b.closest(".rounded-xl");
    var h2 = card && card.querySelector("h2");
    if (h2) return shortName(h2.textContent);
    node = b.parentElement;
    for (var j = 0; j < 5 && node; j++, node = node.parentElement) {
      var h = node.querySelector("h2");
      if (h) return shortName(h.textContent);
    }
    return TOOLS[seg()] || "";
  }

  function markButtons() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      if (b.getAttribute("role") === "switch") return;
      var text = (b.textContent || "").replace(/\s+/g, "").trim();
      var aria = "";
      if (text === "复制") {
        var n = nearestName(b);
        aria = n ? "复制 " + n + " 结果" : "复制结果";
      } else if (text === "清空") {
        aria = "清空输入和结果";
      }
      if (aria && b.getAttribute("aria-label") !== aria) {
        b.setAttribute("aria-label", aria);
        if (!b.title) b.title = aria;
      }
    });
  }

  function markSwitch() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = (b.textContent || "").trim();
      if (t.indexOf("忽略大小写与首尾空格") < 0) return;
      if (b.getAttribute("role") !== "switch") b.setAttribute("role", "switch");
      var on = /：开\s*$/.test(t);
      var ck = String(on);
      if (b.getAttribute("aria-checked") !== ck) b.setAttribute("aria-checked", ck);
      var label = "忽略大小写与首尾空格";
      if (b.getAttribute("aria-label") !== label) b.setAttribute("aria-label", label);
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
    var steps = GUIDE[key] || GUIDE.count;
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
    topBtn.className = "xn-ts-top";
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
      markFields();
      markSwitch();
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
  window.addEventListener("hashchange", function () { window.setTimeout(tick, 160); });
  document.addEventListener("click", function () { window.setTimeout(tick, 140); }, true);

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
