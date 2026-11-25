/* 小凝工具站 · Markdown 表格排版增强 xn-mdtable v1
 * 能力：6 个工具标签 44 + aria-current/aria-label；分隔符胶囊 44 + aria-pressed；
 *       文本域示例胶囊（CSV/文本）；清空/复制 44 具名；结果区可读性；回到顶部。
 * 注入：legacy/x8slbmcakb.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_MDTABLE__) return;
  window.__XN_MDTABLE__ = true;

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  var TOOLS = {
    csv: { name: "CSV 转表格", desc: "逗号 / 制表符 / 竖线分隔" },
    text: { name: "文本转表格", desc: "每行一条，竖线分列" },
    html: { name: "表格转 HTML", desc: "Markdown 表格转 HTML" },
    align: { name: "对齐调整", desc: "左 / 中 / 右对齐" },
    t2json: { name: "表格转 JSON", desc: "表格转对象数组" },
    list: { name: "列表与嵌套", desc: "列表与嵌套结构" }
  };

  var SAMPLES = {
    csv: [
      { l: "3×3 示例", v: "姓名,年龄,城市\n张三,28,上海\n李四,34,北京", pill: "逗号" },
      { l: "制表符示例", v: "a\tb\n1\t2", pill: "制表符" },
      { l: "竖线分隔", v: "名称|数量\n苹果|3", pill: "竖线" }
    ],
    text: [
      { l: "两列", v: "名称|数量\n苹果|3\n香蕉|5" },
      { l: "三列", v: "日期|项目|金额\n10-01|午餐|32\n10-02|交通|18" }
    ]
  };

  function currentKey() {
    var seg = String(location.hash || "").replace(/^#\/?/, "").split(/[?/]/)[0];
    return TOOLS[seg] ? seg : "csv";
  }

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

  function clickPill(label) {
    var b = Array.prototype.filter.call(document.querySelectorAll("#root button"), function (x) {
      return vis(x) && (x.textContent || "").replace(/\s+/g, "").trim() === label;
    })[0];
    if (b) b.click();
  }

  function addChips(el, vals) {
    var host = el.parentElement;
    if (!host) return;
    var old = host.querySelector(".xn-md-chips");
    if (old && old.dataset.first === vals[0].l) return;
    if (old) old.remove();
    var row = document.createElement("div");
    row.className = "xn-md-chips";
    row.dataset.first = vals[0].l;
    row.setAttribute("role", "group");
    row.setAttribute("aria-label", "示例数据");
    vals.forEach(function (item) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = item.l;
      b.setAttribute("aria-label", "填入示例：" + item.l);
      b.addEventListener("click", function (ev) {
        ev.preventDefault();
        setValue(el, item.v);
        if (item.pill) window.setTimeout(function () { clickPill(item.pill); }, 120);
      });
      row.appendChild(b);
    });
    host.insertBefore(row, el.nextSibling);
  }

  function markTabs() {
    var key = currentKey();
    var tabs = Array.prototype.filter.call(document.querySelectorAll('#root a[href^="#/"]'), vis);
    tabs.forEach(function (a) {
      var seg = (a.getAttribute("href") || "").replace(/^#\/?/, "");
      var meta = TOOLS[seg];
      if (!meta) return;
      var label = meta.name + "（" + meta.desc + "）";
      if (a.getAttribute("aria-label") !== label) a.setAttribute("aria-label", label);
      if (seg === key) {
        if (a.getAttribute("aria-current") !== "page") a.setAttribute("aria-current", "page");
      } else if (a.hasAttribute("aria-current")) {
        a.removeAttribute("aria-current");
      }
    });
    var bar = tabs[0] && tabs[0].parentElement;
    if (bar && bar.classList && !bar.classList.contains("xn-md-tabbar")) bar.classList.add("xn-md-tabbar");
  }

  function markPills() {
    var pills = Array.prototype.filter.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b) || b.closest(".xn-md-chips")) return false;
      if (!/rounded-lg/.test(b.className) || !/px-3/.test(b.className)) return false;
      var t = (b.textContent || "").replace(/\s+/g, "").trim();
      return t === "逗号" || t === "制表符" || t === "竖线";
    });
    pills.forEach(function (b) {
      if (!b.classList.contains("xn-md-pill")) b.classList.add("xn-md-pill");
      var active = /bg-blue-600/.test(b.className);
      if (!b.hasAttribute("aria-pressed") || b.getAttribute("aria-pressed") !== String(active)) {
        b.setAttribute("aria-pressed", String(active));
      }
      var t = (b.textContent || "").replace(/\s+/g, "").trim();
      var label = "分隔符：" + t + (active ? "（当前）" : "");
      if (b.getAttribute("aria-label") !== label) b.setAttribute("aria-label", label);
    });
    var host = pills[0] && pills[0].parentElement;
    if (host && host.getAttribute("role") !== "group") {
      host.setAttribute("role", "group");
      host.setAttribute("aria-label", "分隔符");
    }
  }

  function markFields() {
    var key = currentKey();
    var areas = Array.prototype.filter.call(document.querySelectorAll("#root textarea"), vis);
    areas.forEach(function (t) {
      if (SAMPLES[key]) addChips(t, SAMPLES[key]);
    });
  }

  function markButtons() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var text = (b.textContent || "").replace(/\s+/g, "").trim();
      var aria = "";
      if (text === "清空") aria = "清空输入";
      else if (text === "复制") aria = "复制 Markdown 表格";
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
    topBtn.className = "xn-md-top";
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
      markPills();
      markFields();
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
  mo.observe(document.body, { childList: true, subtree: true });
  window.setInterval(tick, 900);

  window.addEventListener("scroll", function () {
    if (!topBtn) return;
    if (window.scrollY > 620) topBtn.classList.add("is-on");
    else topBtn.classList.remove("is-on");
  }, { passive: true });
})();
