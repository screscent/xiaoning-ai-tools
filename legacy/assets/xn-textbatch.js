/* 小凝工具站 · 文本批量处理增强 xn-textbatch v1
 * 能力：5 个工具标签 44 + aria-current/去圈号；文本域语义名与示例胶囊；
 *       处理模式/选项胶囊 44 + aria-pressed；开始处理 50；结果复制 44 具名；回到顶部。
 * 注入：legacy/urjnzsdyk8.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_TEXTBATCH__) return;
  window.__XN_TEXTBATCH__ = true;

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  var TOOLS = {
    text: "文本批量处理",
    t2table: "文本转表格",
    reverse: "行反转",
    renumber: "行号重排",
    stats: "文本统计"
  };

  var MODES = {
    "去重": "去重",
    "查找替换": "查找替换",
    "排序": "排序",
    "添加前后缀": "添加前后缀"
  };

  var OPTS = {
    "完全重复": "去重方式：完全重复",
    "忽略大小写": "去重方式：忽略大小写",
    "忽略首尾空白": "去重方式：忽略首尾空白",
    "保留空行": "空行处理：保留空行",
    "去除空行": "空行处理：去除空行"
  };

  var SAMPLES = [
    { l: "含重复", v: "苹果\n香蕉\n苹果\n橙子" },
    { l: "含空行", v: "第一行\n\n第三行\n\n第五行" },
    { l: "带空格", v: "  苹果  \n香蕉 \n苹果\n" }
  ];

  var nativeSetter = null;
  function setValue(el, v) {
    try {
      if (!nativeSetter) {
        var proto = el.tagName === "TEXTAREA" ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
        nativeSetter = Object.getOwnPropertyDescriptor(proto, "value").set;
      }
      nativeSetter.call(el, v);
    } catch (e) {
      el.value = v;
    }
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function addChips(el) {
    var host = el.parentElement;
    if (!host || host.querySelector(".xn-tb-chips")) return;
    var row = document.createElement("div");
    row.className = "xn-tb-chips";
    row.setAttribute("role", "group");
    row.setAttribute("aria-label", "示例文本");
    SAMPLES.forEach(function (item) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = item.l;
      b.setAttribute("aria-label", "填入示例：" + item.l);
      b.addEventListener("click", function (ev) {
        ev.preventDefault();
        setValue(el, item.v);
      });
      row.appendChild(b);
    });
    host.insertBefore(row, el.nextSibling);
  }

  function markTabs() {
    var seg = String(location.hash || "").replace(/^#\/?/, "").split(/[?/]/)[0] || "text";
    var tabs = Array.prototype.filter.call(document.querySelectorAll('#root a[href^="#/"]'), vis);
    tabs.forEach(function (a) {
      var key = (a.getAttribute("href") || "").replace(/^#\/?/, "");
      var name = TOOLS[key] || (a.textContent || "").replace(/^[①②③④⑤⑥]\s*/, "").trim();
      var clean = (a.textContent || "").replace(/^[①②③④⑤⑥]\s*/, "").trim();
      if (clean && clean !== a.textContent.trim()) a.textContent = clean;
      if (a.getAttribute("aria-label") !== name) a.setAttribute("aria-label", name);
      if (key === seg) {
        if (a.getAttribute("aria-current") !== "page") a.setAttribute("aria-current", "page");
      } else if (a.hasAttribute("aria-current")) {
        a.removeAttribute("aria-current");
      }
    });
    var bar = tabs[0] && tabs[0].parentElement;
    if (bar && bar.classList && !bar.classList.contains("xn-tb-tabbar")) bar.classList.add("xn-tb-tabbar");
  }

  function stripH2() {
    Array.prototype.forEach.call(document.querySelectorAll("#root h2"), function (h) {
      if (h.children.length) return;
      var t = (h.textContent || "").trim();
      var c = t.replace(/^[①②③④⑤⑥⑦⑧⑨]\s*/, "");
      if (c && c !== t) h.textContent = c;
    });
  }

  function markFields() {
    var areas = Array.prototype.filter.call(document.querySelectorAll("#root textarea"), vis);
    areas.forEach(function (t) {
      if (t.getAttribute("aria-label") !== "输入文本（每行一条）") t.setAttribute("aria-label", "输入文本（每行一条）");
      addChips(t);
    });
  }

  function markModes() {
    var key = String(location.hash || "").replace(/^#\/?/, "").split(/[?/]/)[0] || "text";
    if (key !== "text") return;
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var text = (b.textContent || "").replace(/\s+/g, "").trim();
      if (!MODES[text]) return;
      if (!b.classList.contains("xn-tb-mode")) b.classList.add("xn-tb-mode");
      var active = /bg-blue-600/.test(b.className);
      if (b.getAttribute("aria-pressed") !== String(active)) b.setAttribute("aria-pressed", String(active));
      var label = "处理模式：" + text;
      if (b.getAttribute("aria-label") !== label) b.setAttribute("aria-label", label);
    });
  }

  function markOptions() {
    var key = String(location.hash || "").replace(/^#\/?/, "").split(/[?/]/)[0] || "text";
    if (key !== "text") return;
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var text = (b.textContent || "").replace(/\s+/g, "").trim();
      if (!OPTS[text]) return;
      if (!b.classList.contains("xn-tb-opt")) b.classList.add("xn-tb-opt");
      var active = /bg-blue-100/.test(b.className);
      if (b.getAttribute("aria-pressed") !== String(active)) b.setAttribute("aria-pressed", String(active));
      if (b.getAttribute("aria-label") !== OPTS[text]) b.setAttribute("aria-label", OPTS[text]);
    });
  }

  function nearestH3(b) {
    var node = b.parentElement;
    for (var i = 0; i < 6 && node; i++, node = node.parentElement) {
      var h = node.querySelector("h3");
      if (h) return (h.textContent || "").trim();
    }
    return "";
  }

  function rewriteNote() {
    var all = Array.prototype.filter.call(document.querySelectorAll("#root *"), function (el) {
      return (el.textContent || "").indexOf("深链") >= 0;
    });
    if (!all.length) return;
    var target = null;
    all.forEach(function (el) {
      var hasChild = Array.prototype.some.call(el.children, function (c) {
        return (c.textContent || "").indexOf("深链") >= 0;
      });
      if (!hasChild) target = el;
    });
    if (!target || !target.parentElement) return;
    var host = target.parentElement;
    if (host.children.length > 6) return;
    var tag = host.children[0] ? host.children[0].tagName.toLowerCase() : "p";
    var steps = [
      "① 选择上方工具标签切换：批量处理 / 转表格 / 行反转 / 行号重排 / 文本统计。",
      "② 粘贴文本，每行一条；可点示例胶囊快速填入。",
      "③ 选处理模式与选项，点「开始处理」。",
      "④ 结果区可复制单项，也可「复制全文」。"
    ];
    if ((host.textContent || "").indexOf("选择上方工具标签切换") >= 0) return;
    host.innerHTML = "";
    steps.forEach(function (t) {
      var el = document.createElement(tag === "li" ? "li" : "p");
      el.textContent = t;
      host.appendChild(el);
    });
  }

  function markButtons() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var text = (b.textContent || "").replace(/\s+/g, "").trim();
      var aria = "";
      if (text === "开始处理") aria = "开始处理文本";
      else if (text === "复制全文") aria = "复制全文";
      else if (text === "复制") {
        var h3 = nearestH3(b);
        aria = h3 ? "复制 " + h3 : "复制结果";
      }
      if (aria && b.getAttribute("aria-label") !== aria) {
        b.setAttribute("aria-label", aria);
        if (!b.title) b.title = aria;
      }
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "xn-tb-top";
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
      markModes();
      markOptions();
      rewriteNote();
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
  window.addEventListener("hashchange", function () { window.setTimeout(tick, 150); });

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
