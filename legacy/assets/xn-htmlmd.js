/* 小凝工具站 · HTML 与 Markdown 互转增强 xn-htmlmd v1
 * 能力：切换按钮 44 + aria-pressed/aria-label；文本域语义名与示例胶囊；
 *       保留链接开关注入 role/switch 与扩热区；转换 48/复制清空 44 具名；统计数字 aria；回到顶部。
 * 注入：legacy/vfmedklsqf.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_HTMLMD__) return;
  window.__XN_HTMLMD__ = true;

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  var MD = { key: "md2html", name: "MD转HTML", desc: "Markdown 转 HTML 结构" };
  var HTML = { key: "html2md", name: "HTML转MD", desc: "HTML 转 Markdown 文本" };

  var SAMPLES = {
    html: [
      { l: "标题+段落", v: '<h1>标题</h1><p>正文 <strong>粗体</strong> 与 <em>斜体</em>。</p>' },
      { l: "列表", v: '<ul><li>第一项</li><li>第二项 <a href="https://example.com">链接</a></li></ul>' },
      { l: "链接与图片", v: '<p><a href="https://example.com">示例链接</a></p><p><img src="https://example.com/a.png" alt="示例图"></p>' },
      { l: "引用与代码", v: "<blockquote><p>一段引用</p></blockquote><pre><code>const a = 1;</code></pre>" }
    ],
    md: [
      { l: "标题与强调", v: "# 标题\n\n段落：**粗体**、*斜体*。" },
      { l: "列表", v: "- 第一项\n- 第二项\n\n1. 有序一\n2. 有序二" },
      { l: "代码块", v: "```js\nconst a = 1;\n```" },
      { l: "链接", v: "[示例链接](https://example.com)" }
    ]
  };

  function currentKey() {
    return /md2html/.test(String(location.hash || "")) ? "md2html" : "html2md";
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

  function addChips(el, vals) {
    if (!el.parentElement || el.parentElement.querySelector(".xn-hm-chips")) return;
    var row = document.createElement("div");
    row.className = "xn-hm-chips";
    row.setAttribute("role", "group");
    row.setAttribute("aria-label", "填入示例");
    vals.forEach(function (item) {
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
    el.parentElement.insertBefore(row, el.nextSibling);
  }

  function markTabs() {
    var key = currentKey();
    var nav = document.querySelector("#root nav");
    if (!nav) return;
    var tabs = Array.prototype.filter.call(nav.querySelectorAll("button"), vis);
    tabs.forEach(function (b) {
      var text = (b.textContent || "").replace(/\s+/g, "").trim();
      var meta = text === "MD转HTML" ? MD : (text === "HTML转MD" ? HTML : null);
      if (!meta) return;
      var active = meta.key === key;
      if (b.getAttribute("aria-pressed") !== String(active)) b.setAttribute("aria-pressed", String(active));
      var label = meta.name + "（" + meta.desc + "）";
      if (b.getAttribute("aria-label") !== label) b.setAttribute("aria-label", label);
    });
    if (!nav.classList.contains("xn-hm-tabbar")) nav.classList.add("xn-hm-tabbar");
  }

  function markFields() {
    var key = currentKey();
    var areas = Array.prototype.filter.call(document.querySelectorAll("#root textarea"), vis);
    areas.forEach(function (t) {
      var want = key === "md2html" ? "Markdown 内容（待转换为 HTML）" : "HTML 内容（待转换为 Markdown）";
      if (t.getAttribute("aria-label") !== want) t.setAttribute("aria-label", want);
      addChips(t, key === "md2html" ? SAMPLES.md : SAMPLES.html);
    });
    Array.prototype.forEach.call(document.querySelectorAll("#root select"), function (s) {
      if (!vis(s) || s.getAttribute("aria-label")) return;
      s.setAttribute("aria-label", "转换选项");
    });
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var track = b.querySelector("span");
      var tx = (b.textContent || "").replace(/\s+/g, "").trim();
      if (!track || (tx !== "开" && tx !== "关")) return;
      if (b.tagName !== "BUTTON") return;
      if (!b.hasAttribute("role")) b.setAttribute("role", "switch");
      var on = tx === "开";
      if (b.getAttribute("aria-checked") !== String(on)) b.setAttribute("aria-checked", String(on));
      if (b.getAttribute("aria-label") !== "保留链接") b.setAttribute("aria-label", "保留链接");
      if (!b.title) b.title = "保留链接：关闭后只保留链接文字";
    });
  }

  function markButtons() {
    var key = currentKey();
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var text = (b.textContent || "").replace(/\s+/g, "").trim();
      var aria = "";
      if (text === "转换") aria = key === "md2html" ? "转换（Markdown → HTML）" : "转换（HTML → Markdown）";
      else if (text === "复制Markdown") aria = "复制 Markdown 结果";
      else if (text === "复制HTML") aria = "复制 HTML 结果";
      else if (text === "清空") aria = "清空输入与结果";
      if (aria && b.getAttribute("aria-label") !== aria) {
        b.setAttribute("aria-label", aria);
        if (!b.title) b.title = aria;
      }
    });
  }

  function markStats() {
    Array.prototype.forEach.call(document.querySelectorAll("#root .flex.items-baseline"), function (row) {
      if (!vis(row)) return;
      var spans = row.querySelectorAll(":scope > span");
      if (spans.length < 2) return;
      var v = (spans[0].textContent || "").trim();
      var l = (spans[1].textContent || "").trim();
      if (!l) return;
      var aria = l + " " + v;
      if (row.getAttribute("aria-label") !== aria) row.setAttribute("aria-label", aria);
      if (row.getAttribute("role") !== "group") row.setAttribute("role", "group");
    });
  }

  function easeParseNote() {
    Array.prototype.forEach.call(document.querySelectorAll("#root section"), function (sec) {
      var h = sec.querySelector("h2");
      if (!h || (h.textContent || "").indexOf("解析提示") < 0) return;
      sec.classList.add("xn-hm-note");
      if ((h.textContent || "").trim() !== "HTML 校验提示") h.textContent = "HTML 校验提示";
      var ps = sec.querySelectorAll("p");
      if (!ps.length) return;
      var raw = (ps[0].textContent || "").trim();
      var m = raw.match(/line\s+(\d+)\s+at\s+column\s+(\d+)/i);
      if (!m) return;
      var zh = "第 " + m[1] + " 行第 " + m[2] + " 列附近有标签未闭合或书写有误；宽松解析仍可正常转换，可展开查看原始信息。";
      if (ps[0].textContent !== zh) ps[0].textContent = zh;
      if (!sec.querySelector(".xn-hm-raw")) {
        var d = document.createElement("details");
        d.className = "xn-hm-raw";
        var sum = document.createElement("summary");
        sum.textContent = "查看原始校验信息";
        var pre = document.createElement("p");
        pre.textContent = raw;
        d.appendChild(sum);
        d.appendChild(pre);
        ps[0].parentElement.insertBefore(d, ps[0].nextSibling);
      }
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "xn-hm-top";
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
      markStats();
      easeParseNote();
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
