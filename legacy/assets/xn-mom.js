/* 小凝工具站 · 母婴护理与开销增强 xn-mom v1
 * 能力：5 个工具标签 44h/aria-current/具名；h2 去「工具A~D/⑤」前缀；
 *       输入 52/20 + 语义 aria + 常用值胶囊；喂养方式 44 + aria-pressed；
 *       一键复制结果 46 具名；结果数字 19/800；回到顶部；使用说明去「深链」。
 * 注入：legacy/qsnqwjnhme.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_MOM__) return;
  window.__XN_MOM__ = true;

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  function clean(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }

  /* ---------- 标题：去占位前缀 ---------- */
  function stripPrefix() {
    Array.prototype.forEach.call(document.querySelectorAll("#root h2"), function (h) {
      Array.prototype.forEach.call(h.querySelectorAll("*"), function (el) {
        if (el.children.length) return;
        var t = el.textContent || "";
        var c = t.replace(/^\s*工具[A-Za-z]\s*/, "").replace(/^\s*[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "");
        if (c && c !== t) el.textContent = c;
      });
      if (!h.children.length) {
        var t2 = h.textContent || "";
        var c2 = t2.replace(/^\s*工具[A-Za-z]\s*/, "").replace(/^\s*[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "");
        if (c2 && c2 !== t2) h.textContent = c2;
      }
      if (/使用说明/.test(h.textContent) && !h.classList.contains("xn-mom-guideh")) {
        h.classList.add("xn-mom-guideh");
      }
    });
  }

  /* ---------- 工具标签 ---------- */
  function markTabs() {
    var links = Array.prototype.filter.call(document.querySelectorAll("#root nav a"), vis);
    if (!links.length) return;
    var hash = location.hash || "";
    var active = null;
    links.forEach(function (a) {
      if (!a.classList.contains("xn-mom-tab")) a.classList.add("xn-mom-tab");
      if (hash && a.getAttribute("href") === hash) active = a;
    });
    if (!active && !hash) active = links[0];
    links.forEach(function (a) {
      if (a === active) {
        if (a.getAttribute("aria-current") !== "page") a.setAttribute("aria-current", "page");
      } else if (a.hasAttribute("aria-current")) {
        a.removeAttribute("aria-current");
      }
      var sp = a.querySelector("span.truncate") || a.querySelector("span:last-child");
      var name = clean(sp ? sp.textContent : a.textContent);
      if (name && a.getAttribute("aria-label") !== name) a.setAttribute("aria-label", name);
    });
  }

  /* ---------- 当前工具 ---------- */
  function currentTitle() {
    var h2 = Array.prototype.find.call(document.querySelectorAll("#root h2"), function (h) {
      return vis(h) && !/使用说明/.test(h.textContent);
    });
    return h2 ? clean(h2.textContent) : "";
  }

  /* ---------- 输入语义 + 常用值 ---------- */
  var FIELDS = [
    { key: "疫苗时间表", items: [
      { aria: "宝宝出生日期", date: true, quick: ["今天"] },
      { aria: "宝宝月龄（个月）", quick: [0, 1, 3, 6, 12] }
    ] },
    { key: "尿布开销", items: [
      { aria: "每天尿布片数（片 / 天）", quick: [4, 6, 8, 10, 12] },
      { aria: "每片尿布单价（元）", quick: [1, 1.5, 2, 3] }
    ] },
    { key: "衣物尺码", items: [
      { aria: "宝宝月龄（个月）", quick: [0, 3, 6, 9, 12] },
      { aria: "宝宝体重（kg）", quick: [3, 5, 7, 9] },
      { aria: "宝宝身高（cm）", quick: [50, 60, 70, 80] }
    ] },
    { key: "辅食添加", items: [
      { aria: "宝宝月龄（个月）", quick: [6, 8, 10, 12] },
      { aria: "宝宝体重（kg）", quick: [6, 8, 10, 12] }
    ] },
    { key: "奶粉冲调", items: [
      { aria: "每勺兑水量（ml / 勺）", quick: [30, 60] },
      { aria: "目标冲调量（ml）", quick: [60, 90, 120, 150] },
      { aria: "每勺奶粉克数（g）", quick: [4.5, 8.5] }
    ] }
  ];

  function fieldsFor(title) {
    var out = null;
    FIELDS.forEach(function (m) {
      if (!out && title.indexOf(m.key) === 0) out = m.items;
    });
    return out;
  }

  function nativeSet(el, v) {
    var proto = el.tagName === "INPUT" ? HTMLInputElement.prototype : HTMLElement.prototype;
    var desc = Object.getOwnPropertyDescriptor(proto, "value");
    if (desc && desc.set) desc.set.call(el, v);
    else el.value = v;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function buildQuick(input, item) {
    var row = document.createElement("div");
    row.className = "xn-mom-qrow";
    (item.quick || []).forEach(function (q) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "xn-mom-q";
      var isDate = input.type === "date";
      var label;
      var val;
      if (isDate) {
        var d = new Date();
        label = "今天（" + (d.getMonth() + 1) + "月" + d.getDate() + "日）";
        val = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
      } else {
        label = String(q);
        val = String(q);
      }
      b.textContent = label;
      b.setAttribute("aria-label", "填入" + label + "（" + item.aria + "）");
      b.addEventListener("click", function (e) {
        e.preventDefault();
        nativeSet(input, val);
        input.focus();
      });
      row.appendChild(b);
    });
    return row;
  }

  function markInputs() {
    var title = currentTitle();
    var items = fieldsFor(title);
    if (!items) return;
    var inputs = Array.prototype.filter.call(document.querySelectorAll("#root input"), vis);
    inputs.forEach(function (input, idx) {
      var item = items[idx];
      if (!item) return;
      if (input.getAttribute("aria-label") !== item.aria) input.setAttribute("aria-label", item.aria);
      if (!input.classList.contains("xn-mom-input")) input.classList.add("xn-mom-input");
      var host = input.parentElement;
      if (!host) return;
      var mark = "xn-mom-q-" + idx;
      if (host.querySelector(':scope > .xn-mom-qrow[data-for="' + mark + '"]')) return;
      var old = host.querySelector(':scope > .xn-mom-qrow');
      if (old) old.parentElement.removeChild(old);
      var row = buildQuick(input, item);
      row.setAttribute("data-for", mark);
      if (input.nextSibling) host.insertBefore(row, input.nextSibling);
      else host.appendChild(row);
    });
  }

  /* ---------- 喂养方式胶囊 ---------- */
  var MODES = ["母乳", "配方奶", "混合"];
  function markModes() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (MODES.indexOf(t) < 0) return;
      if (!b.classList.contains("xn-mom-mode")) b.classList.add("xn-mom-mode");
      if (!b.hasAttribute("aria-pressed")) {
        var on = /text-white|bg-(rose|pink|red)-/.test(String(b.className));
        b.setAttribute("aria-pressed", on ? "true" : "false");
      }
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "喂养方式：" + t);
    });
  }

  /* ---------- 主按钮：一键复制结果 ---------- */
  function markPrimary() {
    var title = currentTitle();
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      if (clean(b.textContent).indexOf("一键复制结果") < 0) return;
      if (!b.classList.contains("xn-mom-primary")) b.classList.add("xn-mom-primary");
      var aria = "复制" + (title || "当前工具") + "结果";
      if (b.getAttribute("aria-label") !== aria) b.setAttribute("aria-label", aria);
      if (!b.title) b.title = aria;
    });
  }

  /* ---------- 使用说明：去「深链」说法 ---------- */
  function fixGuide() {
    Array.prototype.forEach.call(document.querySelectorAll("#root li, #root p, #root span"), function (el) {
      if (el.children.length) return;
      var t = el.textContent || "";
      if (t.indexOf("深链") < 0) return;
      var c = t.replace(/选择要用的工具标签\s*或直接访问深链/, "选择要用的工具标签切换").replace(/\s*或直接访问深链/g, "").replace(/\s*深链\s*/g, "标签切换");
      if (c !== t) el.textContent = c;
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "xn-mom-top";
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
      stripPrefix();
      markTabs();
      markInputs();
      markModes();
      markPrimary();
      fixGuide();
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
  document.addEventListener("click", function () { window.setTimeout(tick, 180); }, true);

  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    window.setTimeout(function () {
      pending = false;
      tick();
    }, 120);
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
