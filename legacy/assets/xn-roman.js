/* 小凝工具站 · 罗马数字与中文数字增强 xn-roman v1
 * 能力：3 个工具标签 44 + aria-pressed/去圈号；格式胶囊 44 + aria-pressed 分组语义；
 *       示例 44、复制/清空 44 具名；h2 20 去圈号；结果大字 30；对照表数字放大；说明分工具；回到顶部。
 * 注入：legacy/keybxzdudk.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_ROMAN__) return;
  window.__XN_ROMAN__ = true;

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  var TABS = {
    "数字转写": "数字转写",
    "罗马反解": "罗马反解",
    "金额大写校验": "金额大写校验"
  };

  var GUIDE = {
    "数字转写": [
      "① 选择转换方向：阿拉伯 → 罗马、罗马 → 阿拉伯、阿拉伯 → 中文、中文 → 阿拉伯。",
      "② 在「输入值」里填数字或文字，下方会即时给出转换结果。",
      "③ 可切换中文数字的简体/繁体、罗马数字大小写，再点「复制结果」。"
    ],
    "罗马反解": [
      "① 在「罗马数字」里输入，如 MCMXCIV。",
      "② 下方给出对应数值与逐段解释（M=1000、CM=900…）。",
      "③ 点「复制结果」保存数值。"
    ],
    "金额大写校验": [
      "① 输入阿拉伯数字金额，如 1234.56。",
      "② 下方给出中文大写金额，可点「示例 1234.56」快速试算。",
      "③ 点复制按钮可把大写金额带走。"
    ]
  };

  function tabKey() {
    var active = null;
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (!TABS[t]) return;
      if (/(^|\s)border-blue-500(\s|$)/.test(b.className || "")) active = t;
    });
    return active || "数字转写";
  }

  function clean(t) {
    return (t || "").replace(/^[①②③④⑤⑥⑦⑧⑨]\s*/, "").replace(/\s+/g, "");
  }

  function markTabs() {
    var active = null;
    var tabs = Array.prototype.filter.call(document.querySelectorAll("#root button"), function (b) {
      return vis(b) && TABS[clean(b.textContent)];
    });
    tabs.forEach(function (b) {
      var name = TABS[clean(b.textContent)];
      if (!name) return;
      var on = /(^|\s)border-blue-500(\s|$)/.test(b.className || "");
      if (on) active = name;
      if (!b.classList.contains("xn-rm-tab")) b.classList.add("xn-rm-tab");
      var t = (b.textContent || "").trim();
      var c = t.replace(/^[①②③④⑤⑥⑦⑧⑨]\s*/, "");
      if (c !== t) b.textContent = c;
      var p = String(on);
      if (b.getAttribute("aria-pressed") !== p) b.setAttribute("aria-pressed", p);
      if (b.getAttribute("aria-label") !== name) b.setAttribute("aria-label", name);
    });
    var bar = tabs[0] && tabs[0].parentElement;
    if (bar && bar.classList && !bar.classList.contains("xn-rm-tabbar")) bar.classList.add("xn-rm-tabbar");
    return active || "数字转写";
  }

  function stripH2() {
    Array.prototype.forEach.call(document.querySelectorAll("#root h2"), function (h) {
      if (h.children.length) return;
      var t = (h.textContent || "").trim();
      var c = t.replace(/^[①②③④⑤⑥⑦⑧⑨]\s*/, "");
      if (c && c !== t) h.textContent = c;
    });
  }

  function markPills() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var text = clean(b.textContent);
      var group = "";
      if (text === "简体" || text === "繁体") group = "中文数字格式";
      else if (text === "大写" || text === "小写") group = "罗马数字大小写";
      else return;
      if (!b.classList.contains("xn-rm-pill")) b.classList.add("xn-rm-pill");
      var on = /(^|\s)border-blue-500(\s|$)/.test(b.className || "");
      var p = String(on);
      if (b.getAttribute("aria-pressed") !== p) b.setAttribute("aria-pressed", p);
      var label = group + "：" + text;
      if (b.getAttribute("aria-label") !== label) b.setAttribute("aria-label", label);
    });
  }

  function nearestLabel(b) {
    var card = b.closest("section, .rounded-xl");
    if (card) {
      var sp = card.querySelector("span.text-sm.font-medium.text-gray-500");
      if (sp) return (sp.textContent || "").trim();
    }
    return "";
  }

  function markButtons() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      if (b.classList.contains("xn-rm-tab") || b.classList.contains("xn-rm-pill")) return;
      var raw = (b.textContent || "").replace(/\s+/g, " ").trim();
      var text = clean(raw);
      var aria = "";
      if (text.indexOf("示例") === 0) aria = text.indexOf("金额") >= 0 || /^\d/.test(text.replace("示例", "")) ? "填入示例金额" : "填入示例数值";
      else if (text === "清空") aria = "清空输入和结果";
      else if (text === "复制结果" || text === "复制") {
        var n = nearestLabel(b);
        aria = n ? "复制 " + n : "复制结果";
      } else if (/^示例/.test(raw) && raw !== text) {
        aria = "填入示例数值";
      }
      if (aria && b.getAttribute("aria-label") !== aria) {
        b.setAttribute("aria-label", aria);
        if (!b.title) b.title = aria;
      }
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
    var steps = GUIDE[key] || GUIDE["数字转写"];
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
    topBtn.className = "xn-rm-top";
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
      markPills();
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
