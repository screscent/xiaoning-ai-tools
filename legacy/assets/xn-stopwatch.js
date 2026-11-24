/* 小凝工具站 · 秒表与计时记录增强 xn-stopwatch v1
 * 能力：切换条 aria-current/aria-label + 移动横滑吸顶；标题去工具E/F；计时数字等宽；
 *       开始/暂停主按钮、计次/重置/导出次按钮 44+；毫秒开关 20px；提示条改写；间歇常用值；倒计时预设；回到顶部。
 * 注入：legacy/x8s6kkcakb.html 的 </body> 前追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_STOPWATCH__) return;
  window.__XN_STOPWATCH__ = true;

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  var TABS = [
    { key: "stopwatch", name: "秒表", desc: "计时与计次", hint: "点「开始」计时，运行中点「计次」记录分段；「显示毫秒」可切换精度。" },
    { key: "laps", name: "分段", desc: "查看计次记录", hint: "这里会列出每次计次的分段与累计时间，先在「秒表」里计次即可。" },
    { key: "compare", name: "对比", desc: "两组计时并列", hint: "A / B 两组独立计时，分别点「开始」，可并列对比耗时。" },
    { key: "export", name: "导出", desc: "CSV / Markdown", hint: "先在「秒表」里完成计次，再回到这里导出 CSV 或 Markdown。" },
    { key: "interval", name: "间歇", desc: "训练计时配置", hint: "填写运动 / 休息秒数、组数与热身组数，自动生成逐组时间表。" },
    { key: "countdown", name: "多段倒计时", desc: "按序列累计", hint: "每行写「名称,分钟」，自动按 09:00 起点累计各段结束时刻。" }
  ];

  function currentIndex() {
    var hash = (location.hash || "").replace(/^#\/?/, "").replace(/\/+$/, "");
    if (!hash) return 0;
    for (var i = 0; i < TABS.length; i++) if (TABS[i].key === hash) return i;
    return 0;
  }

  function markTabs() {
    var tabs = Array.prototype.filter.call(document.querySelectorAll('#root a[href^="#/"]'), vis);
    var idx = currentIndex();
    tabs.forEach(function (a, i) {
      var meta = TABS[i];
      if (!meta) return;
      var label = meta.name + "（" + meta.desc + "）";
      if (a.getAttribute("aria-label") !== label) a.setAttribute("aria-label", label);
      if (i === idx) {
        if (a.getAttribute("aria-current") !== "page") a.setAttribute("aria-current", "page");
      } else if (a.hasAttribute("aria-current")) {
        a.removeAttribute("aria-current");
      }
    });
    var bar = tabs[0] && tabs[0].parentElement;
    if (bar && bar.classList && !bar.classList.contains("xn-sw-tabbar")) bar.classList.add("xn-sw-tabbar");
  }

  function fixTitle() {
    Array.prototype.forEach.call(document.querySelectorAll("#root h2, #root h3"), function (el) {
      if (el.children.length) return;
      var t = (el.textContent || "").trim();
      var m = t.match(/^工具[A-F]\s*(.+)$/);
      if (m) el.textContent = m[1];
    });
  }

  function markTime() {
    Array.prototype.forEach.call(document.querySelectorAll("#root .scope-font-mono"), function (el) {
      el.classList.add("xn-sw-time");
      var fs = parseFloat(window.getComputedStyle(el).fontSize) || 0;
      if (fs >= 30 && !el.classList.contains("xn-sw-bigtime")) el.classList.add("xn-sw-bigtime");
    });
  }

  function markButtons() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var text = (b.textContent || "").replace(/\s+/g, "").trim();
      if (!text) return;
      if (/^(开始|暂停|继续|停止)$/.test(text)) {
        b.classList.add("xn-sw-primary");
        if (b.getAttribute("aria-label") !== text) b.setAttribute("aria-label", text);
      } else if (/^(计次|重置|导出|一键复制|复制)/.test(text)) {
        b.classList.add("xn-sw-secondary");
        if (b.getAttribute("aria-label") !== text) b.setAttribute("aria-label", text);
      } else if (/^(按计次|最快优先|最慢优先)/.test(text)) {
        b.classList.add("xn-sw-filter");
        var on = /bg-indigo-500/.test(b.className || "");
        var val = on ? "true" : "false";
        if (b.getAttribute("aria-pressed") !== val) b.setAttribute("aria-pressed", val);
        if (b.getAttribute("aria-label") !== text) b.setAttribute("aria-label", text);
      }
    });
  }

  function markCheckbox() {
    Array.prototype.forEach.call(document.querySelectorAll('#root input[type="checkbox"]'), function (cb) {
      var wrap = cb.closest("label");
      var name = wrap ? (wrap.textContent || "").trim().slice(0, 12) : "显示毫秒";
      if (cb.getAttribute("aria-label") !== name) cb.setAttribute("aria-label", name);
    });
  }

  function markHint() {
    var meta = TABS[currentIndex()];
    Array.prototype.forEach.call(document.querySelectorAll("#root .xn-hint"), function (h) {
      if (meta && h.textContent.trim() !== meta.hint) h.textContent = meta.hint;
      h.setAttribute("role", "note");
    });
  }

  /* 间歇训练的常用值 */
  var INTERVAL = [
    { re: /运动时长/, vals: [[30, "30 秒"], [45, "45 秒"], [60, "60 秒"], [90, "90 秒"]] },
    { re: /休息时长/, vals: [[10, "10 秒"], [15, "15 秒"], [30, "30 秒"]] },
    { re: /组数（/, vals: [[5, "5 组"], [8, "8 组"], [10, "10 组"], [12, "12 组"]] },
    { re: /热身组数/, vals: [[0, "0 组"], [1, "1 组"], [2, "2 组"], [3, "3 组"]] }
  ];

  var nativeInput = null;
  function setValue(el, v) {
    try {
      var proto = el.tagName === "TEXTAREA" ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
      if (el.tagName === "TEXTAREA") {
        Object.getOwnPropertyDescriptor(proto, "value").set.call(el, v);
      } else {
        if (!nativeInput) nativeInput = Object.getOwnPropertyDescriptor(proto, "value").set;
        nativeInput.call(el, v);
      }
    } catch (e) {
      el.value = v;
    }
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function addChips(inp, vals) {
    var host = inp.parentElement;
    if (!host || host.querySelector(".xn-sw-chips")) return;
    var row = document.createElement("div");
    row.className = "xn-sw-chips";
    row.setAttribute("role", "group");
    row.setAttribute("aria-label", "常用值");
    vals.forEach(function (pair) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = pair[1];
      b.setAttribute("aria-label", "设为 " + pair[1]);
      b.addEventListener("click", function (ev) {
        ev.preventDefault();
        setValue(inp, String(pair[0]));
      });
      row.appendChild(b);
    });
    host.appendChild(row);
  }

  function markInterval() {
    Array.prototype.forEach.call(document.querySelectorAll('#root input[type="number"]'), function (inp) {
      var label = inp.getAttribute("aria-label") || "";
      for (var i = 0; i < INTERVAL.length; i++) {
        if (INTERVAL[i].re.test(label)) {
          addChips(inp, INTERVAL[i].vals);
          break;
        }
      }
    });
  }

  var PRESETS = [
    { label: "HIIT 4 段", text: "热身,5\n冲刺,1\n休息,2\n拉伸,5" },
    { label: "番茄 4 段", text: "专注,25\n休息,5\n专注,25\n休息,5" },
    { label: "拉伸 3 段", text: "颈肩,3\n腰背,4\n腿后侧,5" }
  ];

  function markCountdown() {
    var ta = document.querySelector("#root textarea");
    if (!ta) return;
    ta.classList.add("xn-sw-textarea");
    if (ta.parentElement && ta.parentElement.querySelector(".xn-sw-presets")) return;
    var host = ta.parentElement;
    if (!host) return;
    var row = document.createElement("div");
    row.className = "xn-sw-chips xn-sw-presets";
    row.setAttribute("role", "group");
    row.setAttribute("aria-label", "示例序列");
    PRESETS.forEach(function (p) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = p.label;
      b.setAttribute("aria-label", "填入" + p.label);
      b.addEventListener("click", function (ev) {
        ev.preventDefault();
        setValue(ta, p.text);
      });
      row.appendChild(b);
    });
    host.appendChild(row);
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "xn-sw-top";
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
      fixTitle();
      markTabs();
      markTime();
      markButtons();
      markCheckbox();
      markHint();
      markInterval();
      markCountdown();
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
  window.setInterval(tick, 1000);

  window.addEventListener("scroll", function () {
    if (!topBtn) return;
    if (window.scrollY > 620) topBtn.classList.add("is-on");
    else topBtn.classList.remove("is-on");
  }, { passive: true });
})();
