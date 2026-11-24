/* 小凝工具站 · Unicode 码点增强 xn-unicode v1
 * 能力：两个工具标签 44 + aria-pressed；文本域/单字输入语义名与示例胶囊（含自动执行）；
 *       显示 UTF-8 开关扩热区；查询/统计 48、复制 44 具名；表格横滑容器；深链文案改写；回到顶部。
 * 注入：legacy/kezwhcdudk.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_UNICODE__) return;
  window.__XN_UNICODE__ = true;

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  var SAMPLES = {
    query: [
      { l: "A 中 😀", v: "A中😀" },
      { l: "家庭 emoji", v: "👨‍👩‍👧‍👦" },
      { l: "全角标点", v: "，。！？；：“”" },
      { l: "零宽字符", v: "a\u200Bb" }
    ],
    stat: [
      { l: "Hello 你好 🌍", v: "Hello 你好 🌍" },
      { l: "中英混排 123", v: "中英混排 123" },
      { l: "全角符号", v: "（）【】《》" },
      { l: "多行文本", v: "第一行\n第二行 emoji 🌱" }
    ]
  };

  function currentKey() {
    return /codestat/.test(String(location.hash || "")) ? "codestat" : "unicode";
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

  function runAction(key) {
    var want = key === "codestat" ? "统计" : "查询";
    var b = Array.prototype.filter.call(document.querySelectorAll("#root button"), function (x) {
      return vis(x) && (x.textContent || "").replace(/\s+/g, "").trim() === want;
    })[0];
    if (b) b.click();
  }

  function addChips(el, vals, action) {
    var host = el.parentElement;
    if (!host) return;
    var old = host.querySelector(".xn-uni-chips");
    if (old && old.dataset.first === vals[0].l) return;
    if (old) old.remove();
    var row = document.createElement("div");
    row.className = "xn-uni-chips";
    row.dataset.first = vals[0].l;
    row.setAttribute("role", "group");
    row.setAttribute("aria-label", "示例文本");
    vals.forEach(function (item) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = item.l;
      b.setAttribute("aria-label", "填入示例：" + item.l);
      b.addEventListener("click", function (ev) {
        ev.preventDefault();
        setValue(el, item.v);
        window.setTimeout(function () { runAction(action); }, 180);
      });
      row.appendChild(b);
    });
    host.insertBefore(row, el.nextSibling);
  }

  function markTabs() {
    var key = currentKey();
    var tabs = Array.prototype.filter.call(document.querySelectorAll('#root button[class*="border-b-2"]'), vis);
    tabs.forEach(function (b) {
      var text = (b.textContent || "").replace(/\s+/g, "").trim();
      var mine = /码点查询/.test(text) ? "unicode" : (/码点统计/.test(text) ? "codestat" : "");
      if (!mine) return;
      var active = mine === key;
      if (b.getAttribute("aria-pressed") !== String(active)) b.setAttribute("aria-pressed", String(active));
      var label = mine === "unicode" ? "码点查询（逐字分析）" : "码点统计（字符与字节数）";
      if (b.getAttribute("aria-label") !== label) b.setAttribute("aria-label", label);
    });
    var bar = tabs[0] && tabs[0].parentElement;
    if (bar && bar.classList && !bar.classList.contains("xn-uni-tabbar")) bar.classList.add("xn-uni-tabbar");
  }

  function markFields() {
    var areas = Array.prototype.filter.call(document.querySelectorAll("#root textarea"), vis);
    areas.forEach(function (t, i) {
      var isStat = i > 0;
      var want = isStat ? "输入文本（统计字符数与字节数）" : "输入文本（逐字符分析）";
      if (t.getAttribute("aria-label") !== want) t.setAttribute("aria-label", want);
      addChips(t, isStat ? SAMPLES.stat : SAMPLES.query, isStat ? "codestat" : "unicode");
    });
    Array.prototype.forEach.call(document.querySelectorAll('#root input[type="text"]'), function (i) {
      if (!vis(i) || i.getAttribute("aria-label")) return;
      i.setAttribute("aria-label", "或输入单个字符（优先于上方文本）");
    });
    Array.prototype.forEach.call(document.querySelectorAll('#root button[role="switch"]'), function (b) {
      if (!vis(b)) return;
      if (b.getAttribute("aria-label") !== "显示 UTF-8 列") b.setAttribute("aria-label", "显示 UTF-8 列");
      if (!b.title) b.title = "显示或隐藏表格中的 UTF-8 字节列";
    });
  }

  function markButtons() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var text = (b.textContent || "").replace(/\s+/g, "").trim();
      var aria = "";
      if (text === "查询") aria = "查询（逐字分析）";
      else if (text === "统计") aria = "统计（字符与字节数）";
      else if (text === "复制结果") {
        var node = b.parentElement;
        var isStat = false, done = false;
        while (node && node !== document.body) {
          var txt = node.textContent || "";
          var hasStat = txt.indexOf("文本码点统计") >= 0;
          var hasQ = txt.indexOf("逐字分析表") >= 0;
          if (hasStat && !hasQ) { isStat = true; done = true; break; }
          if (hasQ && !hasStat) { isStat = false; done = true; break; }
          node = node.parentElement;
        }
        aria = done && isStat ? "复制统计结果" : "复制逐字分析结果";
      }
      if (aria && b.getAttribute("aria-label") !== aria) {
        b.setAttribute("aria-label", aria);
        if (!b.title) b.title = aria;
      }
    });
  }

  function wrapTables() {
    Array.prototype.forEach.call(document.querySelectorAll("#root table"), function (t) {
      if (!t.parentElement || t.parentElement.classList.contains("xn-uni-scroll")) return;
      var box = document.createElement("div");
      box.className = "xn-uni-scroll";
      t.parentElement.insertBefore(box, t);
      box.appendChild(t);
    });
  }

  function rewriteNote() {
    Array.prototype.forEach.call(document.querySelectorAll("#root h2"), function (h) {
      if ((h.textContent || "").trim() === "使用说明" && !h.classList.contains("xn-uni-note")) h.classList.add("xn-uni-note");
    });
    var host = null;
    Array.prototype.forEach.call(document.querySelectorAll("#root li, #root p"), function (li) {
      if ((li.textContent || "").indexOf("深链") >= 0) host = li.parentElement;
    });
    if (host) {
      var steps = [
        "① 选择「码点查询 / 码点统计」标签切换工具。",
        "② 粘贴文本，或直接输入单个字符（单字优先）。",
        "③ 点「查询」看逐字码点表；点「统计」看字符数 / 字节数。",
        "④ 需要时用「复制结果」带走文本结果。"
      ];
      var first = host.children[0];
      if (host.children.length !== steps.length || (first && (first.textContent || "").indexOf("选择「码点查询") < 0)) {
        host.innerHTML = "";
        steps.forEach(function (t) {
          var p = document.createElement("p");
          p.textContent = t;
          host.appendChild(p);
        });
      }
    }
    // 兜底：任何残留的 #/unicode、#/codestat 路由串都换成中文工具名
    Array.prototype.forEach.call(document.querySelectorAll("#root *"), function (el) {
      if (el.children.length) return;
      var t = el.textContent || "";
      if (t.indexOf("#/") < 0) return;
      var n = t.replace(/#\/(unicode|codestat)/g, function (m, k) { return k === "codestat" ? "码点统计" : "码点查询"; });
      if (n !== t) el.textContent = n;
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "xn-uni-top";
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
      wrapTables();
      rewriteNote();
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
