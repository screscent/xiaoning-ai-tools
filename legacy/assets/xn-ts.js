/* 小凝工具站 · 时间戳与日期工具增强 xn-ts v1
 * 能力：切换条 aria-current/aria-label + 移动横滑吸顶；输入语义名与常用值；复制/清空 44+aria；
 *       结果值等宽放大；回到顶部。
 * 注入：legacy/urjhfedyk8.html 的 </body> 前追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_TS__) return;
  window.__XN_TS__ = true;

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function nowStr() {
    var d = new Date();
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + " " +
      pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
  }
  function todayStr() {
    var d = new Date();
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  var TOOLS = {
    timestamp: {
      name: "时间戳", desc: "秒 / 毫秒与日期互转",
      labels: ["时间戳 / 日期时间（自动识别）"],
      chips: [[
        { l: "现在（秒）", f: function () { return String(Math.floor(Date.now() / 1000)); } },
        { l: "现在（毫秒）", f: function () { return String(Date.now()); } },
        { l: "示例日期", v: "2026-10-30 12:00:00" }
      ]]
    },
    timezone: {
      name: "时区换算", desc: "两个时区之间换算",
      labels: ["时间（按源时区解析）", "源时区", "目标时区"],
      chips: [
        [{ l: "现在", f: nowStr }, { l: "示例", v: "2026-10-30 12:00:00" }],
        [{ l: "上海", v: "Asia/Shanghai" }, { l: "UTC", v: "UTC" }, { l: "伦敦", v: "Europe/London" }],
        [{ l: "纽约", v: "America/New_York" }, { l: "伦敦", v: "Europe/London" }, { l: "东京", v: "Asia/Tokyo" }]
      ]
    },
    tzabbr: {
      name: "时区缩写", desc: "缩写与 IANA 对照",
      labels: ["时区缩写或 IANA 名称"],
      chips: [[
        { l: "CST", v: "CST" }, { l: "EST", v: "EST" }, { l: "JST", v: "JST" },
        { l: "UTC", v: "UTC" }, { l: "上海", v: "Asia/Shanghai" }
      ]]
    },
    isofmt: {
      name: "ISO·RFC", desc: "ISO / RFC / Unix 输出",
      labels: ["日期时间", "时区偏移"],
      chips: [
        [{ l: "现在", f: nowStr }, { l: "示例", v: "2026-10-30 12:00:00" }],
        [{ l: "+08:00", v: "+08:00" }, { l: "+00:00", v: "+00:00" }, { l: "-05:00", v: "-05:00" }]
      ]
    },
    week: {
      name: "周数与季节", desc: "ISO 周 / 季度 / 季节",
      labels: ["日期"],
      chips: [[{ l: "今天", f: todayStr }, { l: "示例", v: "2026-10-30" }]]
    },
    cron: {
      name: "Cron 解析", desc: "5 段表达式解释",
      labels: ["Cron 表达式（5 段）"],
      chips: [[
        { l: "每天 3 点", v: "0 3 * * *" },
        { l: "每 5 分钟", v: "*/5 * * * *" },
        { l: "工作日 9 点", v: "0 9 * * 1-5" }
      ]]
    }
  };

  var nativeInput = null;
  function setValue(inp, v) {
    try {
      if (!nativeInput) nativeInput = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      nativeInput.call(inp, v);
    } catch (e) {
      inp.value = v;
    }
    inp.dispatchEvent(new Event("input", { bubbles: true }));
    inp.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function addChips(inp, vals) {
    var host = inp.parentElement;
    if (!host || host.querySelector(".xn-ts-chips")) return;
    var row = document.createElement("div");
    row.className = "xn-ts-chips";
    row.setAttribute("role", "group");
    row.setAttribute("aria-label", "常用值");
    vals.forEach(function (item) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = item.l;
      b.setAttribute("aria-label", "填入" + item.l);
      b.addEventListener("click", function (ev) {
        ev.preventDefault();
        setValue(inp, typeof item.f === "function" ? item.f() : String(item.v));
      });
      row.appendChild(b);
    });
    host.appendChild(row);
  }

  function currentKey() {
    var seg = String(location.hash || "").replace(/^#\/?/, "").split("/")[0];
    return TOOLS[seg] ? seg : "timestamp";
  }

  function markTabs() {
    var key = currentKey();
    var tabs = Array.prototype.filter.call(document.querySelectorAll('#root a[href^="#/"]'), vis);
    tabs.forEach(function (a) {
      var seg = (a.getAttribute("href") || "").replace(/^#\/?/, "");
      var meta = TOOLS[seg];
      if (meta) {
        var label = meta.name + "（" + meta.desc + "）";
        if (a.getAttribute("aria-label") !== label) a.setAttribute("aria-label", label);
      }
      if (seg === key) {
        if (a.getAttribute("aria-current") !== "page") a.setAttribute("aria-current", "page");
      } else if (a.hasAttribute("aria-current")) {
        a.removeAttribute("aria-current");
      }
    });
    var bar = tabs[0] && tabs[0].parentElement;
    if (bar && bar.classList && !bar.classList.contains("xn-ts-tabbar")) bar.classList.add("xn-ts-tabbar");
  }

  function markFields() {
    var meta = TOOLS[currentKey()];
    if (!meta) return;
    var inputs = Array.prototype.filter.call(document.querySelectorAll("#root input"), vis).filter(function (i) {
      var t = (i.getAttribute("type") || "text").toLowerCase();
      return /^(text|search|url|email|tel)$/.test(t);
    });
    inputs.forEach(function (inp, i) {
      inp.classList.add("xn-ts-inp");
      if (meta.labels[i] && inp.getAttribute("aria-label") !== meta.labels[i]) inp.setAttribute("aria-label", meta.labels[i]);
      if (meta.chips[i]) addChips(inp, meta.chips[i]);
    });
  }

  function markButtons() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var text = (b.textContent || "").replace(/\s+/g, "").trim();
      if (text === "清空") {
        if (b.getAttribute("aria-label") !== "清空") b.setAttribute("aria-label", "清空");
        return;
      }
      if (text === "复制" || text === "已复制") {
        var row = b.parentElement;
        var name = "";
        if (row) {
          var labelEl = row.querySelector('div[class*="text-[11.5px]"], div[class*="text-[12px]"]');
          if (labelEl) name = (labelEl.textContent || "").trim();
        }
        var aria = name ? "复制 " + name : "复制结果";
        if (b.getAttribute("aria-label") !== aria) b.setAttribute("aria-label", aria);
      }
    });
  }

  function fixNote() {
    Array.prototype.forEach.call(document.querySelectorAll("#root h2, #root h3"), function (el) {
      if (el.children.length) return;
      var t = (el.textContent || "").trim();
      if (t === "使用说明" && !el.classList.contains("xn-ts-note")) el.classList.add("xn-ts-note");
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "xn-ts-top";
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
      fixNote();
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
  window.addEventListener("hashchange", function () { window.setTimeout(tick, 120); });

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
