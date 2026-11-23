/* R1270 Markdown 写作合集（ekg2knvhte）· 人用友好层
 * - 工具 tab 放大到 44/46，标题编号归一（工具F → 工具 06）
 * - Markdown 编辑器：语法快捷条 + 实时字符/行数
 * - 统计卡数值放大；预览正文重新排版；复制按钮命名
 */
(function () {
  "use strict";
  if (window.__XN_MARK__) return;
  window.__XN_MARK__ = true;

  function txt(el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function setAttr(el, k, v) { if (el && el.getAttribute(k) !== v) el.setAttribute(k, v); }
  var applying = false;

  var LETTER = { A: "01", B: "02", C: "03", D: "04", E: "05", F: "06" };

  function tidyTitle(s) {
    var m = s.match(/^工具\s*([A-F])\s*(.*)$/);
    if (!m) return null;
    var rest = (m[2] || "").replace(/^[·:：\s]+/, "");
    return "工具 " + LETTER[m[1]] + (rest ? " · " + rest : "");
  }

  function setValue(el, v, caret) {
    var proto = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value");
    proto.set.call(el, v);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    if (typeof caret === "number") {
      try { el.focus(); el.setSelectionRange(caret, caret); } catch (e) {}
    }
  }

  var SNIPS = [
    { t: "H2", a: "插入二级标题", s: "\n## 小标题\n", back: 4 },
    { t: "加粗", a: "插入加粗", s: "**加粗文字**", back: 2 },
    { t: "列表", a: "插入无序列表", s: "\n- 条目一\n- 条目二\n" },
    { t: "链接", a: "插入链接", s: "[链接文字](https://)", back: 1 },
    { t: "代码", a: "插入代码块", s: "\n```\n代码\n```\n", back: 4 },
    { t: "表格", a: "插入表格", s: "\n| 列1 | 列2 |\n| --- | --- |\n| 值1 | 值2 |\n" },
    { t: "引用", a: "插入引用", s: "\n> 引用内容\n" }
  ];

  function addSnips(ta) {
    var host = ta.parentElement;
    var outer = host && host.parentElement;
    if (!host || !outer || outer.querySelector(".md-snips")) return;
    var bar = document.createElement("div");
    bar.className = "md-snips";
    bar.setAttribute("role", "toolbar");
    bar.setAttribute("aria-label", "Markdown 快捷语法");
    SNIPS.forEach(function (sn) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = sn.t;
      setAttr(b, "aria-label", sn.a);
      b.title = sn.a;
      b.onclick = function () {
        var v = ta.value || "";
        var st = ta.selectionStart || 0;
        var en = ta.selectionEnd || 0;
        var sel = v.slice(st, en);
        var body = sel ? sn.s.replace(/加粗文字|链接文字|条目一|引用内容|代码/, sel) : sn.s;
        /* 行内语法落在第 1 行行首时补换行，避免和标题/正文粘连 */
        if (st === 0 && !/^\n/.test(body)) body += "\n";
        var next = v.slice(0, st) + body + v.slice(en);
        var caret = st + body.length - (sn.back || 0);
        setValue(ta, next, caret);
        updateMeta();
      };
      bar.appendChild(b);
    });
    outer.insertBefore(bar, host);
  }

  function addMeta(ta) {
    var host = ta.parentElement;
    var outer = host && host.parentElement;
    if (!host || !outer || outer.querySelector(":scope > .md-meta")) return;
    var bar = document.createElement("div");
    bar.className = "md-meta";
    bar.innerHTML = '<span></span><span>边写边统计</span>';
    outer.insertBefore(bar, host.nextSibling);
  }

  function updateMeta() {
    var bars = document.querySelectorAll("#root .md-meta");
    for (var i = 0; i < bars.length; i++) {
      var bar = bars[i];
      var host = bar.previousElementSibling;
      var ta = host && host.querySelector("textarea");
      if (!ta) continue;
      var v = ta.value || "";
      var chars = v.length;
      var visible = v.replace(/\s/g, "").length;
      var lines = v ? v.split("\n").length : 0;
      var span = bar.firstElementChild;
      var html = "字符 <b>" + chars + "</b> · 非空白 <b>" + visible + "</b> · 行 <b>" + lines + "</b>";
      if (span && span.innerHTML !== html) span.innerHTML = html;
    }
  }

  function apply() {
    if (applying) return;
    var root = document.getElementById("root");
    if (!root) return;
    applying = true;
    try {
      /* 1) 工具 tab */
      var tabs = root.querySelectorAll('nav[role="tablist"] a');
      for (var i = 0; i < tabs.length; i++) add(tabs[i], "md-tab");

      /* 2) 标题编号 */
      var h2s = root.querySelectorAll("h2");
      for (var z = 0; z < h2s.length; z++) {
        var raw = txt(h2s[z]);
        var t = tidyTitle(raw);
        if (t && t !== raw) h2s[z].textContent = t;
      }

      /* 3) 卡片 */
      var cands = root.querySelectorAll("section,div.rounded-xl,div.rounded-2xl");
      for (var c = 0; c < cands.length; c++) {
        var el = cands[c];
        if (el.querySelector("textarea") || /md-preview/.test(String(el.className))) add(el, "md-card");
      }

      /* 4) 编辑器：快捷条 + 计数 */
      var tas = root.querySelectorAll("textarea");
      for (var k = 0; k < tas.length; k++) {
        var ta = tas[k];
        var ph = ta.getAttribute("placeholder") || "";
        add(ta, "md-editor");
        var host0 = ta.parentElement;
        var hasLines = !!(host0 && host0.querySelector(".line-numbers"));
        ta.classList.toggle("md-with-lines", hasLines);
        if (host0) host0.classList.toggle("md-lines", hasLines);
        if (/Markdown 原文|生成结果/.test(ph)) {
          addSnips(ta);
          addMeta(ta);
        }
        if (!ta.getAttribute("aria-label")) {
          setAttr(ta, "aria-label", /生成结果/.test(ph) ? "生成的 Markdown 内容" : "Markdown 原文");
        }
      }
      updateMeta();

      /* 5) 统计卡 */
      var cards = root.querySelectorAll(".grid > div");
      for (var g = 0; g < cards.length; g++) {
        var card = cards[g];
        var val = card.querySelector(".text-xl");
        if (!val) continue;
        add(card, "md-stat");
        add(val, "md-statval");
      }

      /* 6) 复制按钮 */
      var btns = root.querySelectorAll("button");
      for (var b = 0; b < btns.length; b++) {
        var bt = btns[b];
        var label = txt(bt);
        if (/^复制/.test(label)) {
          add(bt, "md-copy");
          setAttr(bt, "aria-label", label);
        }
      }

      /* 7) 预览正文容器 */
      var ph1 = root.querySelector('h1:not([class*="text-2xl"])');
      if (ph1 && ph1.parentElement) add(ph1.parentElement, "md-preview");
    } finally {
      applying = false;
    }
  }

  apply();
  setTimeout(apply, 300);
  setTimeout(apply, 900);
  setTimeout(apply, 1800);
  window.addEventListener("hashchange", function () { setTimeout(apply, 120); setTimeout(apply, 500); });
  document.addEventListener("click", function () { setTimeout(apply, 60); setTimeout(apply, 300); }, true);
  document.addEventListener("input", function () { setTimeout(updateMeta, 80); }, true);
  var rootEl = document.getElementById("root");
  if (rootEl && window.MutationObserver) {
    var timer = null;
    new MutationObserver(function () {
      if (applying) return;
      clearTimeout(timer);
      timer = setTimeout(apply, 160);
    }).observe(rootEl, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  }
})();
