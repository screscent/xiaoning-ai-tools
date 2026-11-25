/* 小凝工具站 · 命名与大小写转换增强 xn-naming v1
 * 能力：6 个工具标签 44 + aria-current；清空 36/44 热区、复制全部 44、行内图标复制 36/44 热区 + 具名；
 *       结果行标签 12.5/值 14.5；目标场景胶囊 44 + aria-pressed 分组；命名建议数字高亮；说明分工具；回到顶部。
 * 注入：legacy/uidvbyxjku.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_NAMING__) return;
  window.__XN_NAMING__ = true;

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  var TOOLS = {
    case: "命名风格",
    upper: "大小写",
    split: "拆词缩写",
    slug: "Slug 文件名",
    batch: "批量转换",
    code: "常量与配置命名"
  };

  var GUIDE = {
    case: [
      "① 粘贴任意文本（可含空格、下划线、中划线、中文）。",
      "② 下方即时给出 camelCase / snake_case / kebab-case / PascalCase / CONSTANT_CASE 五种写法。",
      "③ 逐行点复制按钮，或点「复制全部」一次带走。"
    ],
    upper: [
      "① 输入要转换的文本。",
      "② 下方给出全大写、全小写、首字母大写等写法。",
      "③ 逐条复制或「复制全部」。"
    ],
    split: [
      "① 输入词或短语（可含空格 / 下划线 / 中划线）。",
      "② 下方给出词列表、词数、首字母缩写与最长词等统计。",
      "③ 按需复制单个结果或全部。"
    ],
    slug: [
      "① 输入标题或文件名。",
      "② 下方给出 URL slug 与安全文件名两种写法。",
      "③ 点复制按钮即可用于链接或文件命名。"
    ],
    batch: [
      "① 每行输入一个名字。",
      "② 选择目标风格（camelCase / snake_case / kebab-case / PascalCase / CONSTANT_CASE）。",
      "③ 每一行都会单独给出转换结果，可单独复制或「复制全部」。"
    ],
    code: [
      "① 输入原始名称，如 user login count。",
      "② 选择目标场景（环境变量 / 常量枚举 / 配置键 / 国际化 key）与分隔符（中划线 / 下划线 / 点）。",
      "③ 下方给出推荐写法和长度、词数建议，可按需复制。"
    ]
  };

  function seg() {
    var h = String(location.hash || "").replace(/^#\/?/, "").split(/[?/]/)[0];
    return TOOLS[h] ? h : "case";
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
    if (bar && bar.classList && !bar.classList.contains("xn-nm-tabbar")) bar.classList.add("xn-nm-tabbar");
  }

  function markFields() {
    Array.prototype.filter.call(document.querySelectorAll("#root textarea"), vis).forEach(function (t) {
      if (t.getAttribute("aria-label")) return;
      t.setAttribute("aria-label", "输入文本（" + TOOLS[seg()] + "）");
    });
  }

  function markButtons() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      if (b.classList.contains("xn-nm-chip")) return;
      var text = (b.textContent || "").replace(/\s+/g, "").trim();
      var title = b.getAttribute("title") || "";
      var aria = "";
      if (text === "复制全部") aria = "复制全部结果";
      else if (text === "清空") aria = "清空输入和结果";
      else if (title.indexOf("复制") === 0) {
        var name = title.slice(2).trim();
        aria = name ? "复制 " + name : "复制结果";
      }
      if (aria && b.getAttribute("aria-label") !== aria) {
        b.setAttribute("aria-label", aria);
        if (!b.title) b.title = aria;
      }
    });
  }

  function chipGroup(text) {
    if (/环境变量|常量枚举|配置键|国际化/.test(text)) return "目标场景";
    if (/中划线|下划线|^点/.test(text)) return "分隔符";
    return "";
  }

  function markChips() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var text = (b.textContent || "").replace(/\s+/g, " ").trim();
      var group = chipGroup(text);
      if (!group) return;
      if (!b.classList.contains("xn-nm-chip")) b.classList.add("xn-nm-chip");
      var on = /(^|\s)bg-blue-600(\s|$)/.test(b.className || "");
      var p = String(on);
      if (b.getAttribute("aria-pressed") !== p) b.setAttribute("aria-pressed", p);
      var label = group + "：" + text;
      if (b.getAttribute("aria-label") !== label) b.setAttribute("aria-label", label);
    });
  }

  /* 命名建议：· 长度 16：… → 数字高亮 */
  function markTips() {
    Array.prototype.forEach.call(document.querySelectorAll("#root p"), function (p) {
      if (!vis(p) || p.children.length) return;
      var t = (p.textContent || "").trim();
      if (!/^[·•]\s*(长度|词数)/.test(t)) return;
      if (!p.classList.contains("xn-nm-tip")) p.classList.add("xn-nm-tip");
      if (p.getAttribute("data-xn-num") === "1") return;
      p.innerHTML = t.replace(/([·•]\s*[^0-9]*?)(\d+)/g, function (all, pre, num) {
        return pre + '<strong class="xn-nm-num">' + num + "</strong>";
      });
      p.setAttribute("data-xn-num", "1");
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
    var steps = GUIDE[key] || GUIDE.case;
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
    topBtn.className = "xn-nm-top";
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
      markButtons();
      markChips();
      markTips();
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
