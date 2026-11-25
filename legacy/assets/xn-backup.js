/* 小凝工具站 · 数据备份与备份计划增强 xn-backup v1
 * 能力：2 个工具标签 44 + aria-pressed/去圈号；生成 50；复制/清空 44 并按区块具名；
 *       评分大数字 38 + aria-live；开关扩 44 热区；复选/单选 20 + 整行 40/44；说明分工具；回到顶部。
 * 注入：legacy/urkyphdyk8.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_BACKUP__) return;
  window.__XN_BACKUP__ = true;

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  var GUIDE = {
    check: [
      "① 填写数据量、备份份数、数据类型，并按实际情况打开三个开关（异地 / 离线 / 定期校验）。",
      "② 点「生成自查清单」，查看达标评分、差距清单与建议方案。",
      "③ 按「恢复演练步骤」实际演练一次，最后复制清单或清空重来。"
    ],
    plan: [
      "① 勾选要备份的数据类型（照片 / 文档 / 代码 / 密码 / 聊天记录）。",
      "② 选择备份频率（每日 / 每周 / 每月）。",
      "③ 点「生成备份计划」，再复制计划保存。"
    ]
  };

  function tabButtons() {
    return Array.prototype.filter.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return false;
      var t = (b.textContent || "").replace(/\s+/g, "");
      return /3-2-1自查/.test(t) || /备份计划/.test(t);
    }).filter(function (b) {
      return String(b.className || "").indexOf("py-1.5") >= 0;
    });
  }

  function tabKey() {
    var key = "check";
    tabButtons().forEach(function (b) {
      if (/(^|\s)bg-gray-900(\s|$)/.test(b.className || "") && /备份计划/.test(b.textContent)) key = "plan";
    });
    return key;
  }

  function markTabs() {
    var tabs = tabButtons();
    tabs.forEach(function (b) {
      var isPlan = /备份计划/.test(b.textContent);
      var on = /(^|\s)bg-gray-900(\s|$)/.test(b.className || "");
      if (!b.classList.contains("xn-bk-tab")) b.classList.add("xn-bk-tab");
      var t = (b.textContent || "").trim();
      var c = t.replace(/^[①②③④⑤⑥⑦⑧⑨]\s*/, "");
      if (c !== t) b.textContent = c;
      var p = String(on);
      if (b.getAttribute("aria-pressed") !== p) b.setAttribute("aria-pressed", p);
      var label = isPlan ? "备份计划" : "3-2-1 自查";
      if (b.getAttribute("aria-label") !== label) b.setAttribute("aria-label", label);
    });
    var bar = tabs[0] && tabs[0].parentElement;
    if (bar && bar.classList && !bar.classList.contains("xn-bk-tabbar")) bar.classList.add("xn-bk-tabbar");
  }

  function stripH2() {
    Array.prototype.forEach.call(document.querySelectorAll("#root h2"), function (h) {
      if (h.children.length) return;
      var t = (h.textContent || "").trim();
      var c = t.replace(/^[①②③④⑤⑥⑦⑧⑨]\s*/, "");
      if (c && c !== t) h.textContent = c;
    });
  }

  function sectionName(b) {
    var node = b.parentElement;
    for (var i = 0; i < 7 && node; i++, node = node.parentElement) {
      var h = node.querySelector("h2");
      if (h) return (h.textContent || "").trim();
    }
    return "";
  }

  function isDark(b) {
    return /(^|\s)bg-gray-900(\s|$)/.test(b.className || "");
  }

  function markButtons() {
    var key = tabKey();
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      if (b.classList.contains("xn-bk-tab") || b.getAttribute("role") === "switch") return;
      var text = (b.textContent || "").replace(/\s+/g, "").trim();
      var sec = sectionName(b);
      var aria = "";
      if (text === "生成自查清单") aria = "生成自查清单";
      else if (text === "生成备份计划") aria = "生成备份计划";
      else if (text === "复制清单") aria = isDark(b) && sec === "保存或重来" ? "复制备份方案" : "复制自查清单";
      else if (text === "复制计划") aria = "复制备份计划";
      else if (text === "清空") aria = sec === "保存或重来" ? "清空保存内容" : "清空自查输入";
      if (aria && b.getAttribute("aria-label") !== aria) {
        b.setAttribute("aria-label", aria);
        if (!b.title) b.title = aria;
      }
    });
    // 评分区域读屏播报
    if (key === "check") {
      Array.prototype.forEach.call(document.querySelectorAll("#root .rounded-xl, #root section"), function (c) {
        if (!vis(c)) return;
        if ((c.textContent || "").indexOf("达标评分") < 0) return;
        if (c.getAttribute("aria-live") !== "polite") c.setAttribute("aria-live", "polite");
      });
    }
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
    var steps = GUIDE[key] || GUIDE.check;
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
    topBtn.className = "xn-bk-top";
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
