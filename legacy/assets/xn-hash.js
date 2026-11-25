/* 小凝工具站 · 哈希校验与 HMAC 增强 xn-hash v1
 * 能力：3 个工具标签 44 + aria-current/去圈号；输入模式与大小写胶囊 44 + aria-pressed；
 *       位数数字胶囊化并改中文可读；结果复制 44 具名；示例胶囊；使用说明按页重写；回到顶部。
 * 注入：legacy/r3akzzzjyr.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_HASH__) return;
  window.__XN_HASH__ = true;

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  var TOOLS = {
    hash: "哈希校验",
    hmac: "HMAC 加盐",
    crc32: "CRC32 校验"
  };

  var SAMPLES = [
    { l: "abc", v: "abc" },
    { l: "hello world", v: "hello world" },
    { l: "中文测试", v: "中文测试：小凝工具集" }
  ];

  var GUIDE = {
    hash: [
      "① 在上方选择「文本」或「文件」输入方式。",
      "② 文本模式下粘贴内容，或点下方示例胶囊快速填入。",
      "③ SHA-256 / SHA-384 / SHA-512 会同时计算，点结果右侧「复制」单独取值。",
      "④ 可选：把对方给的哈希粘到「预期哈希」，页面会按长度自动识别算法并提示是否一致。"
    ],
    hmac: [
      "① 粘贴要计算的文本，并填入 HMAC 密钥（可留空）。",
      "② 选择 HMAC 算法：SHA-256 / SHA-1 / SHA-512。",
      "③ 结果区同时给出 HMAC 值与加盐 SHA-256，可分别复制。"
    ],
    crc32: [
      "① 粘贴文本，或点「示例」快速试算。",
      "② 结果同时给出 CRC32 十六进制与十进制两种写法，按需要复制。"
    ]
  };

  function seg() {
    var h = String(location.hash || "").replace(/^#\/?/, "").split(/[?/]/)[0];
    if (!h || !TOOLS[h]) return "hash";
    return h;
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

  function addChips(el) {
    var host = el.parentElement;
    if (!host || host.querySelector(".xn-hash-chips")) return;
    var row = document.createElement("div");
    row.className = "xn-hash-chips";
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

  function cleanPrefix(t) {
    return (t || "").replace(/^[①②③④⑤⑥⑦⑧⑨]\s*/, "").trim();
  }

  function markTabs() {
    var key = seg();
    var tabs = Array.prototype.filter.call(document.querySelectorAll('#root a[href^="#/"]'), vis);
    tabs.forEach(function (a) {
      var name = TOOLS[(a.getAttribute("href") || "").replace(/^#\/?/, "")];
      var clean = cleanPrefix(a.textContent);
      if (clean && clean !== a.textContent.trim()) a.textContent = clean;
      var label = name || clean;
      if (label && a.getAttribute("aria-label") !== label) a.setAttribute("aria-label", label);
      var cur = (a.getAttribute("href") || "").replace(/^#\/?/, "");
      if (cur === key) {
        if (a.getAttribute("aria-current") !== "page") a.setAttribute("aria-current", "page");
      } else if (a.hasAttribute("aria-current")) {
        a.removeAttribute("aria-current");
      }
    });
    var bar = tabs[0] && tabs[0].parentElement;
    if (bar && bar.classList && !bar.classList.contains("xn-hash-tabbar")) bar.classList.add("xn-hash-tabbar");
  }

  function stripSectionH2() {
    Array.prototype.forEach.call(document.querySelectorAll("#root h2"), function (h) {
      if (h.classList.contains("text-sm")) return;
      if (h.children.length) return;
      var t = (h.textContent || "").trim();
      var c = cleanPrefix(t);
      if (c && c !== t) h.textContent = c;
    });
  }

  function markFields() {
    var key = seg();
    var areas = Array.prototype.filter.call(document.querySelectorAll("#root textarea"), vis);
    areas.forEach(function (t) {
      if (!t.getAttribute("aria-label")) t.setAttribute("aria-label", "要计算哈希的文本");
      if (key !== "crc32") addChips(t);
    });
    var keyInput = Array.prototype.filter.call(document.querySelectorAll('#root input[type="text"]'), vis)
      .filter(function (i) { return /密钥/.test(i.placeholder || ""); })[0];
    if (keyInput && !keyInput.getAttribute("aria-label")) keyInput.setAttribute("aria-label", "HMAC 密钥（可留空）");
  }

  /* 输入字数：已输入 3 个字符 → 数字放大胶囊 */
  function markCount() {
    Array.prototype.forEach.call(document.querySelectorAll("#root p"), function (p) {
      if (!vis(p) || p.children.length > 1) return;
      var t = (p.textContent || "").trim();
      var m = /^已输入\s*(\d+)\s*个字符$/.exec(t);
      if (!m) return;
      if (!p.classList.contains("xn-hash-count")) p.classList.add("xn-hash-count");
      if (p.getAttribute("data-xn-count") === m[1]) return;
      p.innerHTML = '已输入 <span class="xn-hash-count-num"></span> 个字符';
      p.querySelector(".xn-hash-count-num").textContent = m[1];
      p.setAttribute("data-xn-count", m[1]);
    });
    Array.prototype.forEach.call(document.querySelectorAll("#root p"), function (p) {
      if (!vis(p) || p.children.length) return;
      if ((p.textContent || "").indexOf("默认填入示例") < 0) return;
      if (!p.classList.contains("xn-hash-count")) p.classList.add("xn-hash-count");
    });
  }

  function activeByBorder(b) {
    return /(^|\s)border-blue-500(\s|$)/.test(b.className || "");
  }

  function markModes() {
    var key = seg();
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var text = (b.textContent || "").replace(/\s+/g, "").trim();
      if (key === "hash" && (text === "文本" || text === "文件")) {
        if (!b.classList.contains("xn-hash-mode")) b.classList.add("xn-hash-mode");
        var p = String(activeByBorder(b));
        if (b.getAttribute("aria-pressed") !== p) b.setAttribute("aria-pressed", p);
        var label = "输入模式：" + text;
        if (b.getAttribute("aria-label") !== label) b.setAttribute("aria-label", label);
        return;
      }
      if (key === "hash" && (text === "小写" || text === "大写")) {
        if (!b.classList.contains("xn-hash-case")) b.classList.add("xn-hash-case");
        var p2 = String(activeByBorder(b));
        if (b.getAttribute("aria-pressed") !== p2) b.setAttribute("aria-pressed", p2);
        var label2 = "输出大小写：" + text;
        if (b.getAttribute("aria-label") !== label2) b.setAttribute("aria-label", label2);
      }
    });
  }

  function shortTitle(t) {
    return (t || "").replace(/（[^）]*）/g, "").replace(/\s+/g, " ").trim();
  }

  function resultTitle(b) {
    var row = b.parentElement;
    if (row) {
      var lbl = row.querySelector("span.text-xs.text-gray-500");
      if (lbl) {
        var base = "";
        var head = row.parentElement;
        for (var k = 0; k < 3 && head; k++, head = head.parentElement) {
          var hh = head.querySelector("h2.text-sm, h3.text-sm");
          if (hh) { base = shortTitle(hh.textContent); break; }
        }
        var sub = shortTitle(lbl.textContent);
        if (sub) return (base ? base + " " : "") + sub;
      }
    }
    var node = b.parentElement;
    for (var i = 0; i < 5 && node; i++, node = node.parentElement) {
      var h = node.querySelector("h2.text-sm, h3.text-sm");
      if (h) return shortTitle(h.textContent);
      if (node.tagName === "H2" || node.tagName === "H3") return shortTitle(node.textContent);
    }
    return "";
  }

  function markButtons() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      if (b.classList.contains("xn-hash-chips") || b.closest(".xn-hash-chips")) return;
      var text = (b.textContent || "").replace(/\s+/g, "").trim();
      var aria = "";
      if (text === "清空") aria = "清空输入和结果";
      else if (text === "复制全部结果" || text === "已复制") aria = "复制全部哈希结果";
      else if (text === "示例") aria = "填入示例文本";
      else if (text === "复制" || text === "已复制") {
        var t = resultTitle(b);
        aria = t ? "复制 " + t : "复制结果";
      }
      if (aria && b.getAttribute("aria-label") !== aria) {
        b.setAttribute("aria-label", aria);
        if (!b.title) b.title = aria;
      }
    });
  }

  /* 位数文案：64 个 hex 字符 · 256 bit → 256 位 · 64 个十六进制字符；32 bit · 多项式 → 32 位 · 多项式 */
  function friendlyNumbers() {
    Array.prototype.forEach.call(document.querySelectorAll("#root h2.text-sm + span, #root h3.text-sm + span"), function (sp) {
      var t = (sp.textContent || "").trim();
      var m = /^(\d+)\s*个\s*hex\s*字符\s*[·・]\s*(\d+)\s*bit$/i.exec(t);
      if (m) {
        var next = m[2] + " 位 · " + m[1] + " 个十六进制字符";
        if (sp.textContent.trim() !== next) sp.textContent = next;
        return;
      }
      var m2 = /^(\d+)\s*bit\s*[·・]\s*(.+)$/i.exec(t);
      if (m2) {
        var next2 = m2[1] + " 位 · " + m2[2].trim();
        if (sp.textContent.trim() !== next2) sp.textContent = next2;
      }
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
    var steps = GUIDE[key] || GUIDE.hash;
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
    topBtn.className = "xn-hash-top";
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
      markFields();
      markCount();
      markModes();
      markButtons();
      friendlyNumbers();
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
