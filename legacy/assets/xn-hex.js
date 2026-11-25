/* 小凝工具站 · 十六进制查看与 Base64 增强 xn-hex v1
 * 能力：6 个工具标签 44/aria-pressed/去圈号；输入 120；动作 48；复制/示例/清空 44 具名；
 *       开关（ASCII 对照 / 大写十六进制 / URL-safe）44 + aria-pressed；结果终端 13.5；
 *       统计行胶囊；说明按当前工具切换；回到顶部。
 * 注入：legacy/qsiducnhme.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_HEX__) return;
  window.__XN_HEX__ = true;

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  var GUIDE = [
    [
      "① 粘贴文本，或点「选择文件」（只读取前 64KB）；按需选「每行字节数」8 / 16 / 32。",
      "② 点「转换文本」，下方输出十六进制转储；需要时可开「ASCII 对照」「大写十六进制」。",
      "③ 点「复制转储」带走结果，或「清空」重新开始。"
    ],
    [
      "① 粘贴要编码的文本，或要解码的 Base64 字符串。",
      "② 需要 URL 安全字符时，勾上「URL-safe」（- 和 _ 替代 + 和 /）。",
      "③ 点「编码」或「解码」，查看结果后复制或清空。"
    ],
    [
      "① 粘贴十六进制（如 48 65 6C 6C 6F）或二进制（如 01001000…），空格会被忽略。",
      "② 点「转换」，自动识别进制并给出另一种写法。",
      "③ 复制结果或清空，继续下一条。"
    ],
    [
      "① 粘贴文本进行编码，或粘贴 Base32 字符串解码（如 NBSWY3DP）。",
      "② 点「编码」或「解码」；需要样例时点「示例」自动填入。",
      "③ 复制结果或清空。"
    ],
    [
      "① 粘贴文本进行编码，或粘贴 Base64URL 字符串解码（如 YT9i）。",
      "② 点「编码」或「解码」；不确定格式时点「示例」看样例。",
      "③ 复制结果或清空。"
    ],
    [
      "① 粘贴十六进制（如 68656c6c6f）或 ASCII 文本（如 hello）。",
      "② 点「转换」，输出对应的 ASCII 或十六进制。",
      "③ 复制结果或清空。"
    ]
  ];

  function nav() {
    return document.querySelector("#root main > nav");
  }

  function tabs() {
    var n = nav();
    return n ? Array.prototype.filter.call(n.querySelectorAll("button"), vis) : [];
  }

  function activeIndex() {
    var list = tabs();
    for (var i = 0; i < list.length; i++) {
      if (/(^|\s)bg-gray-800(\s|$)/.test(list[i].className || "")) return i;
    }
    return 0;
  }

  function stripCircle(t) {
    return (t || "").trim().replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "");
  }

  function markTabs() {
    tabs().forEach(function (b) {
      var clean = stripCircle(b.textContent);
      if (clean && b.textContent !== clean) b.textContent = clean;
      if (!b.classList.contains("xn-hx-tab")) b.classList.add("xn-hx-tab");
      var on = /(^|\s)bg-gray-800(\s|$)/.test(b.className || "");
      var p = String(on);
      if (b.getAttribute("aria-pressed") !== p) b.setAttribute("aria-pressed", p);
      if (b.getAttribute("aria-label") !== clean) b.setAttribute("aria-label", clean);
    });
  }

  function stripHeadings() {
    Array.prototype.forEach.call(document.querySelectorAll("#root h2, #root h3"), function (h) {
      if (h.children.length) return;
      var t = (h.textContent || "").trim();
      var c = stripCircle(t);
      if (c && c !== t) h.textContent = c;
    });
  }

  function panel() {
    return document.querySelector("#root main > section:nth-of-type(1)");
  }

  function markToggles() {
    var root = panel();
    if (!root) return;
    Array.prototype.forEach.call(root.querySelectorAll("button"), function (b) {
      if (!vis(b)) return;
      var t = (b.textContent || "").replace(/\s+/g, "");
      var aria = "";
      if (t === "ASCII对照") aria = "显示 ASCII 对照列";
      else if (t === "大写十六进制") aria = "使用大写十六进制";
      if (!aria) return;
      if (!b.classList.contains("xn-hx-toggle")) b.classList.add("xn-hx-toggle");
      var on = /(^|\s)border-gray-700(\s|$)/.test(b.className || "");
      var p = String(on);
      if (b.getAttribute("aria-pressed") !== p) b.setAttribute("aria-pressed", p);
      if (b.getAttribute("aria-label") !== aria) b.setAttribute("aria-label", aria);
    });

    Array.prototype.forEach.call(root.querySelectorAll('input[type="checkbox"]'), function (c) {
      if (!vis(c)) return;
      var aria = "使用 URL-safe 编码（- 和 _ 替代 + 和 /）";
      if (c.getAttribute("aria-label") !== aria) c.setAttribute("aria-label", aria);
    });
  }

  function markButtons() {
    var root = panel();
    if (!root) return;
    var idx = activeIndex();
    Array.prototype.forEach.call(root.querySelectorAll("button"), function (b) {
      if (!vis(b)) return;
      if (b.classList.contains("xn-hx-tab")) return;
      var t = (b.textContent || "").replace(/\s+/g, "").trim();
      var aria = "";
      var primary = false;
      if (t === "转换文本") { aria = "把文本转换为十六进制转储"; primary = true; }
      else if (t === "转换") {
        aria = idx === 2 ? "转换十六进制与二进制" : "把十六进制转换为 ASCII";
        primary = true;
      } else if (t === "编码") {
        aria = idx === 3 ? "Base32 编码" : idx === 4 ? "Base64URL 编码" : "Base64 编码";
        primary = true;
      } else if (t === "解码") {
        aria = idx === 3 ? "Base32 解码" : idx === 4 ? "Base64URL 解码" : "Base64 解码";
        primary = true;
      } else if (t === "复制结果") aria = "复制转换结果";
      else if (t === "复制转储") aria = "复制十六进制转储";
      else if (t === "示例") aria = "填入示例内容";
      else if (t === "清空") aria = "清空输入和结果";

      if (!aria) return;
      if (b.getAttribute("aria-label") !== aria) b.setAttribute("aria-label", aria);
      if (primary) {
        if (!b.classList.contains("xn-hx-primary")) b.classList.add("xn-hx-primary");
      } else if (!b.classList.contains("xn-hx-toggle")) {
        if (!b.classList.contains("xn-hx-btn")) b.classList.add("xn-hx-btn");
      }
    });
  }

  function markStats() {
    var root = panel();
    if (!root) return;
    Array.prototype.forEach.call(root.querySelectorAll("div, span, p"), function (e) {
      if (!vis(e) || e.children.length > 2) return;
      var t = (e.textContent || "").replace(/\s+/g, "");
      if (!/^输入字符数/.test(t) && !/^输出长度/.test(t)) return;
      if (!e.classList.contains("xn-hx-stat")) e.classList.add("xn-hx-stat");
    });
  }

  function markPre() {
    var root = panel();
    if (!root) return;
    Array.prototype.forEach.call(root.querySelectorAll("pre"), function (pre) {
      if (!vis(pre)) return;
      if (!pre.classList.contains("xn-hx-pre")) pre.classList.add("xn-hx-pre");
      if (!pre.hasAttribute("tabindex")) pre.setAttribute("tabindex", "0");
      if (pre.getAttribute("aria-label") !== "转换结果") pre.setAttribute("aria-label", "转换结果");
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
    var idx = activeIndex();
    if (d.getAttribute("data-xn-guide") === String(idx)) return;
    var host = null;
    Array.prototype.forEach.call(d.children, function (c) {
      if (c.tagName.toLowerCase() !== "summary" && !host) host = c;
    });
    if (!host) return;
    var steps = GUIDE[idx] || GUIDE[0];
    host.innerHTML = "";
    steps.forEach(function (t) {
      var p = document.createElement("p");
      p.textContent = t;
      host.appendChild(p);
    });
    d.setAttribute("data-xn-guide", String(idx));
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "xn-hx-top";
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
      markToggles();
      markButtons();
      markStats();
      markPre();
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
  document.addEventListener("click", function () { window.setTimeout(tick, 160); }, true);

  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    window.setTimeout(function () {
      pending = false;
      tick();
    }, 100);
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
