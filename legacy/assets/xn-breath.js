/* 小凝工具站 · 呼吸放松与节奏增强 xn-breath v1
 * 能力：2 个工具标签 44h/aria-current/具名；h2 去①②；参数输入 52/21 + 单位 aria；
 *       休息/循环常用值胶囊；开始 52/17 具名、复制/重置 46 具名；呼吸圆 34、图例 13、统计 16/800；
 *       进度条 12 + 渐变；节奏表 th13/td15、总周期 800、预算 21/800；逐步指引 14.5/13.5；回到顶部。
 * 注入：legacy/ny8rttpkdd.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_BREATH__) return;
  window.__XN_BREATH__ = true;

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }
  function clean(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }
  function each(list, fn) {
    Array.prototype.forEach.call(list, fn);
  }

  /* ---------- 标题 ---------- */
  function cleanHeads() {
    each(document.querySelectorAll("#root h2"), function (h) {
      each(h.childNodes, function (n) {
        if (n.nodeType !== 3) return;
        var t = n.nodeValue || "";
        var c = t.replace(/^\s*[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "").replace(/^\s*工具\s*[A-Za-z0-9一二三四五六七八九十]+\s*/, "");
        if (c !== t) n.nodeValue = c;
      });
    });
  }

  /* ---------- 工具标签 ---------- */
  function markTabs() {
    var btns = Array.prototype.filter.call(document.querySelectorAll("#root nav button"), vis);
    if (!btns.length) return;
    btns.forEach(function (b, i) {
      if (!b.classList.contains("xn-br-tab")) b.classList.add("xn-br-tab");
      var on = /bg-blue-500/.test(String(b.className || ""));
      if (on) {
        if (b.getAttribute("aria-current") !== "page") b.setAttribute("aria-current", "page");
      } else if (b.hasAttribute("aria-current")) {
        b.removeAttribute("aria-current");
      }
      var name = clean(b.textContent);
      var aria = "切换到：" + name + "（工具 " + (i + 1) + "）";
      if (name && b.getAttribute("aria-label") !== aria) b.setAttribute("aria-label", aria);
    });
  }

  /* ---------- 输入：单位 + 常用值 ---------- */
  var FIELDS = [
    { aria: "吸气秒数（秒）" },
    { aria: "屏息秒数（秒）" },
    { aria: "呼气秒数（秒）" },
    { aria: "休息秒数（秒）", quick: [0, 2, 5] },
    { aria: "循环次数（次）", quick: [4, 8, 12] }
  ];

  function nativeSet(el, v) {
    var desc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    if (desc && desc.set) desc.set.call(el, v);
    else el.value = v;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function visibleTitle() {
    var h2 = Array.prototype.find.call(document.querySelectorAll("#root h2"), function (h) {
      return vis(h) && !/使用说明/.test(h.textContent);
    });
    return h2 ? clean(h2.textContent) : "";
  }

  function markInputs() {
    var title = visibleTitle();
    var inputs = Array.prototype.filter.call(document.querySelectorAll("#root input[type=number]"), vis);
    if (!inputs.length) return;
    // 工具一：5 个参数；工具二：只有循环次数
    var two = title.indexOf("4-7-8") >= 0 || title.indexOf("478") >= 0 || inputs.length === 1;
    if (two) {
      var only = inputs[0];
      if (only.getAttribute("aria-label") !== "循环次数（次）") only.setAttribute("aria-label", "循环次数（次）");
      return;
    }
    inputs.forEach(function (input, idx) {
      var item = FIELDS[idx];
      if (!item) return;
      if (input.getAttribute("aria-label") !== item.aria) input.setAttribute("aria-label", item.aria);
      if (!item.quick) return;
      var host = input.parentElement;
      if (!host) return;
      if (host.querySelector(":scope > .xn-br-qrow")) return;
      var row = document.createElement("div");
      row.className = "xn-br-qrow";
      item.quick.forEach(function (q) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "xn-br-q";
        b.textContent = String(q);
        b.setAttribute("aria-label", "填入 " + q + "（" + item.aria + "）");
        b.addEventListener("click", function (e) {
          e.preventDefault();
          nativeSet(input, String(q));
          input.focus();
        });
        row.appendChild(b);
      });
      host.appendChild(row);
    });
  }

  /* ---------- 主按钮 ---------- */
  function markButtons() {
    var sel = Array.prototype.find.call(document.querySelectorAll("#root select"), vis);
    var preset = sel && sel.options[sel.selectedIndex] ? clean(sel.options[sel.selectedIndex].textContent) : "";
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (t === "开始") {
        if (!b.classList.contains("xn-br-go")) b.classList.add("xn-br-go");
        var aria = "开始呼吸练习" + (preset ? "（" + preset + "）" : "");
        if (b.getAttribute("aria-label") !== aria) b.setAttribute("aria-label", aria);
        if (!b.title) b.title = aria;
      } else if (t === "停止") {
        if (!b.classList.contains("xn-br-stop")) b.classList.add("xn-br-stop");
        if (b.getAttribute("aria-label") !== "停止呼吸练习") b.setAttribute("aria-label", "停止呼吸练习");
      } else if (t === "复制参数") {
        if (!b.classList.contains("xn-br-secondary")) b.classList.add("xn-br-secondary");
        if (b.getAttribute("aria-label") !== "复制呼吸参数") b.setAttribute("aria-label", "复制呼吸参数");
      } else if (t === "重置") {
        if (!b.classList.contains("xn-br-secondary")) b.classList.add("xn-br-secondary");
        if (b.getAttribute("aria-label") !== "重置呼吸练习") b.setAttribute("aria-label", "重置呼吸练习");
      } else if (t === "复制节奏表") {
        if (!b.classList.contains("xn-br-secondary")) b.classList.add("xn-br-secondary");
        if (b.getAttribute("aria-label") !== "复制 4-7-8 呼吸节奏表") b.setAttribute("aria-label", "复制 4-7-8 呼吸节奏表");
      }
    });
  }

  /* ---------- 计时区 / 节奏表 ---------- */
  function markBlocks() {
    each(document.querySelectorAll("#root .relative.flex.items-center.justify-center.rounded-full"), function (c) {
      if (!c.classList.contains("xn-br-circle")) c.classList.add("xn-br-circle");
    });
    each(document.querySelectorAll("#root p.text-sm.text-gray-400"), function (p) {
      if (!/跟随圆圈呼吸|点击「开始」/.test(p.textContent)) return;
      if (!p.classList.contains("xn-br-status")) p.classList.add("xn-br-status");
    });
    each(document.querySelectorAll("#root .flex.items-center.justify-center.gap-3"), function (r) {
      if (!/吸气/.test(r.textContent) || !/呼气/.test(r.textContent)) return;
      if (!r.classList.contains("xn-br-legend")) r.classList.add("xn-br-legend");
    });
    each(document.querySelectorAll("#root .flex.items-center.justify-between"), function (r) {
      if (!vis(r)) return;
      var t = clean(r.textContent);
      if (/^进度/.test(t) && /总时长/.test(t)) {
        if (!r.classList.contains("xn-br-stat")) r.classList.add("xn-br-stat");
      }
      if (/等待开始|进行中|完成/.test(t) && /%$/.test(t)) {
        if (!r.classList.contains("xn-br-barmeta")) r.classList.add("xn-br-barmeta");
      }
    });
    each(document.querySelectorAll("#root .w-full.h-2\\.5"), function (bar) {
      if (!bar.classList.contains("xn-br-bar")) bar.classList.add("xn-br-bar");
    });
    each(document.querySelectorAll("#root p.text-amber-700"), function (p) {
      if (!p.classList.contains("xn-br-note")) p.classList.add("xn-br-note");
    });
    each(document.querySelectorAll("#root table"), function (tb) {
      if (!tb.classList.contains("xn-br-table")) tb.classList.add("xn-br-table");
    });
    each(document.querySelectorAll("#root .border-blue-100"), function (c) {
      if (!c.querySelector("span")) return;
      if (!c.classList.contains("xn-br-budget")) c.classList.add("xn-br-budget");
    });
    each(document.querySelectorAll("#root ol.space-y-1\\.5"), function (ol) {
      if (!ol.classList.contains("xn-br-steps")) ol.classList.add("xn-br-steps");
      var head = ol.previousElementSibling;
      if (head && !head.classList.contains("xn-br-stephead")) head.classList.add("xn-br-stephead");
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "xn-br-top";
    topBtn.setAttribute("aria-label", "回到顶部");
    topBtn.title = "回到顶部";
    topBtn.textContent = "↑";
    topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    document.body.appendChild(topBtn);
  }

  function tick() {
    try {
      cleanHeads();
      markTabs();
      markInputs();
      markButtons();
      markBlocks();
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
  window.setInterval(tick, 1000);
  document.addEventListener("click", function () { window.setTimeout(tick, 200); }, true);

  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    window.setTimeout(function () { pending = false; tick(); }, 120);
  }
  var mo = new MutationObserver(schedule);
  mo.observe(document.body, { childList: true, subtree: true, characterData: true });

  window.addEventListener("scroll", function () {
    if (!topBtn) return;
    if (window.scrollY > 620) topBtn.classList.add("is-on");
    else topBtn.classList.remove("is-on");
  }, { passive: true });
})();
