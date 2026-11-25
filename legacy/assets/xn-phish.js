/* 小凝工具站 · 钓鱼链接自查与分享自查增强 xn-phish v1
 * 能力：2 个工具标签 44 + aria-pressed/去圈号；开始检查 50；复制/清空 44 具名；
 *       开关 aria-label + 热区；检查项 20/整行热区；结果表格与评分放大；说明分工具；回到顶部。
 * 注入：legacy/mkplawrxwr.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_PHISH__) return;
  window.__XN_PHISH__ = true;

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  var GUIDE = {
    phish: [
      "① 每行粘贴一条链接，勾选要检查的项目（可多选），按要求填可疑关键词。",
      "② 点「开始检查」，下方给出每条链接的风险等级、评分与命中项。",
      "③ 看「高风险统计」与「综合风险评分」，再复制结果或清空。"
    ],
    share: [
      "① 粘贴要分享的链接或分享文案。",
      "② 点「开始检查」，查看风险清单与建议。",
      "③ 按提示修改后再对外分享。"
    ]
  };

  function tabButtons() {
    return Array.prototype.filter.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return false;
      var t = (b.textContent || "").replace(/\s+/g, "");
      if (t !== "钓鱼自查" && t !== "分享自查") return false;
      return String(b.className || "").indexOf("py-1.5") >= 0;
    });
  }

  function tabKey() {
    var key = "phish";
    tabButtons().forEach(function (b) {
      if (/(^|\s)bg-blue-50(\s|$)/.test(b.className || "") && /分享自查/.test(b.textContent)) key = "share";
    });
    return key;
  }

  function markTabs() {
    var tabs = tabButtons();
    tabs.forEach(function (b) {
      var isShare = /分享自查/.test(b.textContent);
      var on = /(^|\s)bg-blue-50(\s|$)/.test(b.className || "");
      if (!b.classList.contains("xn-ph-tab")) b.classList.add("xn-ph-tab");
      var p = String(on);
      if (b.getAttribute("aria-pressed") !== p) b.setAttribute("aria-pressed", p);
      var label = isShare ? "分享自查" : "钓鱼自查";
      if (b.getAttribute("aria-label") !== label) b.setAttribute("aria-label", label);
    });
    var bar = tabs[0] && tabs[0].parentElement;
    if (bar && bar.classList && !bar.classList.contains("xn-ph-tabbar")) bar.classList.add("xn-ph-tabbar");
  }

  function stripHeadings() {
    Array.prototype.forEach.call(document.querySelectorAll("#root h2, #root h3"), function (h) {
      if (h.children.length) return;
      var t = (h.textContent || "").trim();
      var c = t.replace(/^[①②③④⑤⑥⑦⑧⑨]\s*/, "");
      if (c && c !== t) h.textContent = c;
    });
  }

  function markSwitch() {
    Array.prototype.forEach.call(document.querySelectorAll('#root button[role="switch"]'), function (b) {
      if (!vis(b)) return;
      var lab = b.closest("label");
      var name = lab ? (lab.textContent || "").replace(/\s+/g, "").trim() : "显示风险评分";
      if (name && name !== "显示风险评分") {
        // label 内含开关自身无文字，取其文本即可
        name = name.replace(/显示风险评分/, "显示风险评分") || "显示风险评分";
      }
      if (!name) name = "显示风险评分";
      if (b.getAttribute("aria-label") !== name) b.setAttribute("aria-label", name);
    });
  }

  function markButtons() {
    var key = tabKey();
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      if (b.classList.contains("xn-ph-tab") || b.getAttribute("role") === "switch") return;
      var text = (b.textContent || "").replace(/\s+/g, "").trim();
      var aria = "";
      if (text === "开始检查") aria = key === "share" ? "开始检查分享链接" : "开始检查链接";
      else if (text === "复制结果") aria = key === "share" ? "复制分享自查结果" : "复制钓鱼自查结果";
      else if (text === "清空") aria = "清空输入和结果";
      if (aria && b.getAttribute("aria-label") !== aria) {
        b.setAttribute("aria-label", aria);
        if (!b.title) b.title = aria;
      }
    });
  }

  function guideDetails() {
    var list = Array.prototype.slice.call(document.querySelectorAll("#root details"));
    for (var i = 0; i < list.length; i++) {
      var s = list[i].querySelector("summary");
      if (s && (s.textContent || "").indexOf("使用说明") >= 0) return list[i];
    }
    return null;
  }

  function rewriteGuide() {
    var d = guideDetails();
    if (!d) return;
    var key = tabKey();
    if (d.getAttribute("data-xn-guide") === key) return;
    var host = null;
    Array.prototype.forEach.call(d.children, function (c) {
      if (c.tagName.toLowerCase() !== "summary" && !host) host = c;
    });
    if (!host) return;
    var steps = GUIDE[key] || GUIDE.phish;
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
    topBtn.className = "xn-ph-top";
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
      stripHeadings();
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
