/* 小凝工具站 · 编码转换合集增强 xn-encode v1
 * 能力：标签 01–06 编号 + aria-label/aria-current；工具标题「工具一 · …」；
 *      输入打标；复制/清空/示例按钮 aria 与可点区；结果区与统计打标；说明文案贴合编码场景。
 * 注入：legacy/keye5ddudk.html 的 </body> 前追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_ENCODE__) return;
  window.__XN_ENCODE__ = true;

  var CN = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  function tabs() {
    return Array.prototype.filter.call(
      document.querySelectorAll('#root div.flex.flex-wrap.gap-2.mb-6 a[href^="#/"]'),
      vis
    );
  }

  function activeIdx(list) {
    var hash = location.hash.replace(/\?.*$/, "");
    for (var i = 0; i < list.length; i++) {
      if (list[i].getAttribute("href") === hash) return i;
    }
    return 0;
  }

  function markTabs() {
    var list = tabs();
    if (!list.length) return;
    var idx = activeIdx(list);
    list.forEach(function (a, i) {
      var no = String(i + 1).padStart(2, "0");
      if (a.getAttribute("data-no") !== no) a.setAttribute("data-no", no);
      var name = (a.textContent || "").trim() || "工具" + CN[i];
      var label = "前往工具" + CN[i] + "：" + name + (i === idx ? "（当前）" : "");
      if (a.getAttribute("aria-label") !== label) a.setAttribute("aria-label", label);
      var cur = i === idx ? "true" : "false";
      if (a.getAttribute("aria-current") !== cur) a.setAttribute("aria-current", cur);
    });
  }

  function markH2() {
    var h2 = document.querySelector("#root h2");
    if (!h2 || !vis(h2)) return;
    h2.classList.add("xn-en-h2");
    var list = tabs();
    var idx = activeIdx(list);
    var base = (h2.textContent || "").trim().replace(/^工具[一二三四五六七八九十]\s*[·:：]?\s*/, "");
    var want = "工具" + CN[idx] + " · " + base;
    if ((h2.textContent || "").trim() !== want) h2.textContent = want;
  }

  function markInputs() {
    Array.prototype.forEach.call(document.querySelectorAll("#root textarea"), function (t) {
      if (vis(t)) t.classList.add("xn-en-area");
    });
    Array.prototype.forEach.call(document.querySelectorAll("#root input"), function (inp) {
      var type = inp.getAttribute("type");
      if (!type || /^(text|search|url|email|tel|number)$/.test(type)) inp.classList.add("xn-en-inp");
    });
    Array.prototype.forEach.call(document.querySelectorAll("#root select"), function (s) {
      s.classList.add("xn-en-sel");
    });
  }

  function resultLabel(btn) {
    var box = btn.closest("div.flex.items-center.justify-between") || btn.parentElement;
    if (!box) return "";
    var sp = box.querySelector("span");
    if (!sp) return "";
    var t = (sp.textContent || "").trim();
    /* 长括号说明只取主名，避免 aria 过长 */
    return t.split("（")[0].split("(")[0].trim().slice(0, 24);
  }

  function markButtons() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = (b.textContent || "").replace(/\s+/g, "").trim();
      if (/^复制/.test(t)) {
        b.classList.add("xn-en-copy");
        var label = resultLabel(b);
        var aria = label ? "复制" + label : "复制结果";
        if (b.getAttribute("aria-label") !== aria) b.setAttribute("aria-label", aria);
        return;
      }
      var title = b.getAttribute("title") || "";
      if (!t && /清空/.test(title)) {
        b.classList.add("xn-en-icon");
        if (b.getAttribute("aria-label") !== "清空输入") b.setAttribute("aria-label", "清空输入");
        return;
      }
      if (/示例|填入/.test(t)) b.classList.add("xn-en-mini");
    });
  }

  function markResults() {
    Array.prototype.forEach.call(document.querySelectorAll("#root div.font-mono"), function (d) {
      if (!vis(d)) return;
      if (/break-all|whitespace-pre/.test(d.className)) d.classList.add("xn-en-res");
    });
    Array.prototype.forEach.call(document.querySelectorAll("#root div, #root p"), function (d) {
      if (d.children.length > 2) return;
      var t = (d.textContent || "").trim();
      if (/^原文 \d+ 字符/.test(t) && !d.classList.contains("xn-en-stat")) d.classList.add("xn-en-stat");
    });
  }

  function fixGuide() {
    Array.prototype.forEach.call(document.querySelectorAll("#root p"), function (p) {
      if (p.children.length) return;
      var t = (p.textContent || "").trim();
      if (!/^[①②③④⑤]/.test(t)) return;
      var n = t;
      if (t === "②填写数值、编码、税额等参数") n = "②粘贴要处理的文本或链接";
      else if (t === "③查看计算结果与建议") n = "③即时查看编码 / 解码结果";
      if (n !== t) p.textContent = n;
      p.classList.add("xn-en-guide");
    });
  }

  function tick() {
    try {
      markTabs();
      markH2();
      markInputs();
      markButtons();
      markResults();
      fixGuide();
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
  window.setInterval(tick, 1200);
})();
