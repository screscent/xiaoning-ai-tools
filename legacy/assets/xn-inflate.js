/* 小凝工具站 · 通胀与购买力增强 xn-inflate v1
 * 能力：单页滚动导航 aria-current/吸顶；输入语义名；常用值胶囊；开关 role/aria；下拉区分名；
 *       复制/清空 44h + aria；使用说明标题降级；回到顶部。
 * 注入：legacy/puhymr3a4t.html 的 </body> 前追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_INFLATE__) return;
  window.__XN_INFLATE__ = true;

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  /* 每个工具的：导航名、输入语义名、胶囊值、开关名 */
  var TOOLS = [
    {
      id: "tool-power",
      nav: "购买力换算",
      inputs: ["当前金额（元）", "年均通胀率（%）", "年数（年）", "年化投资收益率（%）"],
      chips: [
        [[100000, "10 万"], [500000, "50 万"], [1000000, "100 万"], [3000000, "300 万"]],
        [[2, "2%"], [3, "3%"], [5, "5%"]],
        [[5, "5 年"], [10, "10 年"], [20, "20 年"], [30, "30 年"]],
        [[3, "3%"], [5, "5%"], [8, "8%"]]
      ],
      switches: ["是否扣除通胀算实际收益"]
    },
    {
      id: "tool-save",
      nav: "存款实际收益",
      inputs: ["存款本金（元）", "年化利率（%）", "年均通胀率（%）", "存款年数（年）"],
      chips: [
        [[100000, "10 万"], [500000, "50 万"], [1000000, "100 万"]],
        [[2, "2%"], [3, "3%"], [5, "5%"]],
        [[2, "2%"], [3, "3%"], [5, "5%"]],
        [[3, "3 年"], [5, "5 年"], [10, "10 年"]]
      ],
      switches: ["是否扣除通胀算实际收益"]
    },
    {
      id: "tool-salary",
      nav: "工资实际涨幅",
      inputs: ["当前月薪（元）", "年均名义涨幅（%）", "年均通胀率（%）", "年数（年）"],
      chips: [
        [[5000, "5 千"], [10000, "1 万"], [20000, "2 万"], [30000, "3 万"]],
        [[3, "3%"], [5, "5%"], [10, "10%"]],
        [[2, "2%"], [3, "3%"], [5, "5%"]],
        [[3, "3 年"], [5, "5 年"], [10, "10 年"]]
      ],
      switches: ["是否扣除通胀算实际涨幅"]
    },
    {
      id: "tool-goal",
      nav: "目标金额调整",
      inputs: ["目标金额（元）", "年均通胀率（%）", "年数（年）"],
      chips: [
        [[500000, "50 万"], [1000000, "100 万"], [3000000, "300 万"]],
        [[2, "2%"], [3, "3%"], [5, "5%"]],
        [[5, "5 年"], [10, "10 年"], [20, "20 年"]]
      ],
      switches: []
    },
    {
      id: "tool-retire",
      nav: "退休购买力",
      inputs: ["当前年龄（岁）", "退休年龄（岁）", "退休后每月支出（元）", "年均通胀率（%）", "退休后年数（年）"],
      chips: [
        [[25, "25 岁"], [30, "30 岁"], [35, "35 岁"], [40, "40 岁"]],
        [[55, "55 岁"], [60, "60 岁"], [65, "65 岁"]],
        [[5000, "5 千"], [8000, "8 千"], [12000, "1.2 万"]],
        [[2, "2%"], [2.5, "2.5%"], [3, "3%"]],
        [[15, "15 年"], [20, "20 年"], [25, "25 年"]]
      ],
      switches: []
    }
  ];

  var nativeSetter = null;
  function setValue(inp, v) {
    try {
      if (!nativeSetter) nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      nativeSetter.call(inp, v);
    } catch (e) {
      inp.value = v;
    }
    inp.dispatchEvent(new Event("input", { bubbles: true }));
    inp.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function addChips(inp, vals) {
    var rel = inp.parentElement;
    var host = rel && rel.classList && rel.classList.contains("relative") ? rel.parentElement : rel;
    if (!host || host.querySelector(".xn-if-chips")) return;
    var row = document.createElement("div");
    row.className = "xn-if-chips";
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

  function markSections() {
    TOOLS.forEach(function (cfg) {
      var sec = document.getElementById(cfg.id);
      if (!sec) return;
      var inputs = Array.prototype.slice.call(sec.querySelectorAll("input")).filter(vis);
      inputs.forEach(function (inp, i) {
        if (cfg.inputs[i]) {
          var label = cfg.inputs[i];
          if (inp.getAttribute("aria-label") !== label) inp.setAttribute("aria-label", label);
        }
        if (cfg.chips[i]) addChips(inp, cfg.chips[i]);
      });
      var badge = sec.querySelector("span.h-7.w-7");
      if (badge && !badge.classList.contains("xn-if-badge")) badge.classList.add("xn-if-badge");
      var switches = Array.prototype.slice.call(sec.querySelectorAll('button[class*="rounded-full"]')).filter(vis);
      switches.forEach(function (b, i) {
        if (b.getAttribute("role") !== "switch") b.setAttribute("role", "switch");
        var on = /bg-blue-600/.test(b.className || "");
        var val = on ? "true" : "false";
        if (b.getAttribute("aria-checked") !== val) b.setAttribute("aria-checked", val);
        var name = cfg.switches[i];
        if (name && b.getAttribute("aria-label") !== name) b.setAttribute("aria-label", name);
      });
    });
  }

  function markSelects() {
    var sels = Array.prototype.filter.call(document.querySelectorAll("#root select"), vis);
    sels.forEach(function (s) {
      var sec = s.closest("section");
      var id = sec ? sec.id : "";
      var name = id === "tool-goal" ? "目标金额口径" : id === "tool-power" ? "换算方向" : "";
      if (name && s.getAttribute("aria-label") !== name) s.setAttribute("aria-label", name);
    });
  }

  function markButtons() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var text = (b.textContent || "").replace(/\s+/g, "").trim();
      if (text === "复制结果" || text === "已复制") {
        if (b.getAttribute("aria-label") !== "复制结果") b.setAttribute("aria-label", "复制结果");
      } else if (text === "清空") {
        if (b.getAttribute("aria-label") !== "清空") b.setAttribute("aria-label", "清空");
      } else if (/^(换算|计算|测算)/.test(text)) {
        if (!b.classList.contains("xn-if-go")) b.classList.add("xn-if-go");
      }
    });
  }

  function markNote() {
    Array.prototype.forEach.call(document.querySelectorAll("#root h2"), function (h) {
      var t = (h.textContent || "").trim();
      if (t === "使用说明" && !h.classList.contains("xn-if-note")) h.classList.add("xn-if-note");
    });
  }

  function markNav() {
    var tabs = Array.prototype.filter.call(document.querySelectorAll('#root a[href^="#/"]'), vis);
    tabs.forEach(function (a, i) {
      var cfg = TOOLS[i];
      var label = cfg ? "工具 " + (i + 1) + "：" + cfg.nav : (a.textContent || "").trim();
      if (a.getAttribute("aria-label") !== label) a.setAttribute("aria-label", label);
    });
    var bar = tabs[0] && tabs[0].parentElement;
    if (bar && bar.classList && !bar.classList.contains("xn-if-nav")) bar.classList.add("xn-if-nav");
    syncNavCurrent();
  }

  /* 滚动时高亮当前工具 */
  function syncNavCurrent() {
    var secs = TOOLS.map(function (c) { return document.getElementById(c.id); });
    var idx = -1;
    var line = 160;
    for (var i = 0; i < secs.length; i++) {
      var s = secs[i];
      if (!s) continue;
      if (s.getBoundingClientRect().top <= line) idx = i;
    }
    if (idx < 0) idx = 0;
    var tabs = Array.prototype.filter.call(document.querySelectorAll('#root a[href^="#/"]'), vis);
    tabs.forEach(function (a, i) {
      if (i === idx) {
        if (a.getAttribute("aria-current") !== "page") a.setAttribute("aria-current", "page");
      } else if (a.hasAttribute("aria-current")) {
        a.removeAttribute("aria-current");
      }
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "xn-if-top";
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
      markNote();
      markSections();
      markSelects();
      markButtons();
      markNav();
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
    syncNavCurrent();
    if (!topBtn) return;
    if (window.scrollY > 620) topBtn.classList.add("is-on");
    else topBtn.classList.remove("is-on");
  }, { passive: true });
})();
