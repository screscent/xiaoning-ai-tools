/* 小凝工具站 · 洗手计时与步骤提示增强 xn-wash v1
 * 能力：2 个工具标签 44h/aria-current/具名；h2 去②；设置行 50h；
 *       秒数输入 52 + 秒 aria + 6 档常用值；3 个开关 50x28 + role=switch/aria-checked/具名；
 *       开始 52/17 具名、重置 48、复制步骤具名；计时数字 54、状态 15、步骤点名 11.5；
 *       步骤卡 15/700 + 编号胶囊 + 说明 13；洗手要点 13；回到顶部。
 * 注入：legacy/rdqjum4t4r.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_WASH__) return;
  window.__XN_WASH__ = true;

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
      if (!b.classList.contains("xn-wash-tab")) b.classList.add("xn-wash-tab");
      var cls = String(b.className || "");
      var on = /bg-teal-600/.test(cls);
      var cur = on ? "page" : null;
      if (cur) {
        if (b.getAttribute("aria-current") !== "page") b.setAttribute("aria-current", "page");
      } else if (b.hasAttribute("aria-current")) {
        b.removeAttribute("aria-current");
      }
      var name = clean(b.textContent).replace(/^\d+\.\s*/, "");
      var aria = "切换到：" + name + "（工具 " + (i + 1) + "）";
      if (name && b.getAttribute("aria-label") !== aria) b.setAttribute("aria-label", aria);
    });
  }

  /* ---------- 设置行 ---------- */
  function markRows() {
    each(document.querySelectorAll("#root .flex.items-center.justify-between"), function (r) {
      if (!vis(r)) return;
      if (!r.querySelector("input, select, button")) return;
      if (!r.classList.contains("xn-wash-row")) r.classList.add("xn-wash-row");
    });
  }

  /* ---------- 秒数输入 + 常用值 ---------- */
  function nativeSet(el, v) {
    var desc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    if (desc && desc.set) desc.set.call(el, v);
    else el.value = v;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }
  function markInputs() {
    each(document.querySelectorAll("#root input[type=number]"), function (input) {
      if (!vis(input)) return;
      var aria = "计时秒数（秒）";
      if (input.getAttribute("aria-label") !== aria) input.setAttribute("aria-label", aria);
      if (!input.title) input.title = "可输入 5–120 秒，或点下方常用值";
      var row = input.parentElement && input.parentElement.parentElement;
      if (!row) return;
      var host = row.parentElement || row;
      if (host.querySelector(":scope > .xn-wash-qrow") || row.querySelector(":scope > .xn-wash-qrow")) return;
      var quick = [10, 15, 20, 30, 40, 60];
      var box = document.createElement("div");
      box.className = "xn-wash-qrow";
      quick.forEach(function (q) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "xn-wash-q";
        b.textContent = q + " 秒";
        b.setAttribute("aria-label", "填入 " + q + " 秒");
        b.addEventListener("click", function (e) {
          e.preventDefault();
          nativeSet(input, String(q));
          input.focus();
        });
        box.appendChild(b);
      });
      if (row.nextSibling) host.insertBefore(box, row.nextSibling);
      else host.appendChild(box);
    });
  }

  /* ---------- 开关 ---------- */
  function rowLabel(btn) {
    var row = btn.parentElement;
    var s = row && row.querySelector("span");
    return clean(s && s.textContent);
  }
  function markSwitches() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var cls = String(b.className || "");
      if (!/h-6/.test(cls) || !/w-11/.test(cls)) return;
      if (!b.classList.contains("xn-wash-switch")) b.classList.add("xn-wash-switch");
      var on = /bg-(teal|emerald|green|cyan|sky|blue)-[3-9]00/.test(cls);
      var val = on ? "true" : "false";
      if (b.getAttribute("role") !== "switch") b.setAttribute("role", "switch");
      if (b.getAttribute("aria-checked") !== val) b.setAttribute("aria-checked", val);
      var name = rowLabel(b);
      if (name) {
        var aria = name + "（拨动开关）";
        if (b.getAttribute("aria-label") !== aria) b.setAttribute("aria-label", aria);
        if (!b.title) b.title = aria;
      }
    });
  }

  /* ---------- 主按钮 ---------- */
  function markButtons() {
    var secSel = Array.prototype.find.call(document.querySelectorAll("#root select"), vis);
    var scene = secSel && secSel.options[secSel.selectedIndex] ? clean(secSel.options[secSel.selectedIndex].textContent) : "";
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (t === "开始") {
        if (!b.classList.contains("xn-wash-go")) b.classList.add("xn-wash-go");
        var aria = "开始洗手计时";
        if (b.getAttribute("aria-label") !== aria) b.setAttribute("aria-label", aria);
        if (!b.title) b.title = aria;
      } else if (t === "重置") {
        if (!b.classList.contains("xn-wash-secondary")) b.classList.add("xn-wash-secondary");
        if (b.getAttribute("aria-label") !== "重置计时") b.setAttribute("aria-label", "重置计时");
        if (!b.title) b.title = "重置计时";
      } else if (t === "复制步骤") {
        if (!b.classList.contains("xn-wash-secondary")) b.classList.add("xn-wash-secondary");
        var a2 = "复制洗手步骤" + (scene ? "（" + scene + "场景）" : "");
        if (b.getAttribute("aria-label") !== a2) b.setAttribute("aria-label", a2);
      }
    });
    // 计时器下方的图标重置按钮（无文字）
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b) || clean(b.textContent)) return;
      if (b.classList.contains("xn-wash-switch")) return;
      if (b.getBoundingClientRect().height < 40) return;
      var inner = b.querySelector("span");
      if (!inner || !inner.querySelector("svg")) return;
      if (!b.classList.contains("xn-wash-secondary")) b.classList.add("xn-wash-secondary");
      if (b.getAttribute("aria-label") !== "重置计时") b.setAttribute("aria-label", "重置计时");
      if (!b.title) b.title = "重置计时";
    });
  }

  /* ---------- 计时器 / 步骤卡 / 要点 ---------- */
  function markBlocks() {
    each(document.querySelectorAll("#root .relative.w-44.h-44"), function (c) {
      if (!c.classList.contains("xn-wash-clock")) c.classList.add("xn-wash-clock");
    });
    each(document.querySelectorAll("#root p.text-sm.text-gray-400"), function (p) {
      if (!/点击「开始」/.test(p.textContent)) return;
      if (!p.classList.contains("xn-wash-status")) p.classList.add("xn-wash-status");
    });
    each(document.querySelectorAll("#root span.text-\\[10px\\]"), function (s) {
      if (!s.classList.contains("xn-wash-stepname")) s.classList.add("xn-wash-stepname");
    });
    each(document.querySelectorAll("#root .w-2\\.5.h-2\\.5"), function (d) {
      if (!d.classList.contains("xn-wash-stepdot")) d.classList.add("xn-wash-stepdot");
    });
    each(document.querySelectorAll("#root [class*='bg-white/70']"), function (c) {
      if (!c.classList.contains("xn-wash-tipcard")) c.classList.add("xn-wash-tipcard");
    });
    each(document.querySelectorAll("#root [class*='bg-teal-50/40']"), function (c) {
      if (!c.classList.contains("xn-wash-stepcard")) c.classList.add("xn-wash-stepcard");
    });
    each(document.querySelectorAll("#root p.text-sm.text-gray-500"), function (p) {
      if (!/秒/.test(p.textContent)) return;
      if (p.querySelector("span")) {
        if (!p.classList.contains("xn-wash-sum")) p.classList.add("xn-wash-sum");
        each(p.querySelectorAll("span"), function (s) {
          if (/秒/.test(s.textContent) && !s.classList.contains("xn-wash-sec") && s.className.indexOf("text-green") < 0) s.classList.add("xn-wash-sec");
        });
      }
    });
    each(document.querySelectorAll("#root ul.mt-3"), function (ul) {
      if (!ul.classList.contains("xn-wash-tips")) ul.classList.add("xn-wash-tips");
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "xn-wash-top";
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
      markRows();
      markInputs();
      markSwitches();
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
