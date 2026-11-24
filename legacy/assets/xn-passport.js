/* 小凝工具站 · 护照签证与入境增强 xn-passport v1
 * 能力：六工具切换 aria-pressed + 移动三列吸顶；标题去工具E/F；使用说明降级；
 *       日期/数字常用值；输入 48/16；复制 44+aria；结果数字 24；回到顶部。
 * 注入：legacy/urkdhldyk8.html 的 </body> 前追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_PASSPORT__) return;
  window.__XN_PASSPORT__ = true;

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  var TOOL_NAMES = ["护照余量", "签证有效期", "停留天数", "换发提醒", "照片", "过境转机"];

  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function fmt(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function shift(days) { var d = new Date(); d.setDate(d.getDate() + days); return d; }
  function shiftMonths(m) { var d = new Date(); d.setMonth(d.getMonth() + m); return d; }
  function shiftYears(y) { var d = new Date(); d.setFullYear(d.getFullYear() + y); return d; }

  var DATE_CHIPS = {
    "护照签发日期": [[fmt(shift(0)), "今天"], [fmt(shiftYears(-5)), "5 年前"], [fmt(shiftYears(-10)), "10 年前"]],
    "计划入境日期": [[fmt(shift(0)), "今天"], [fmt(shift(30)), "30 天后"], [fmt(shift(90)), "90 天后"]],
    "签证签发日": [[fmt(shift(0)), "今天"], [fmt(shift(-30)), "30 天前"]],
    "签证到期日": [[fmt(shift(0)), "今天"], [fmt(shiftYears(1)), "1 年后"]],
    "计划离境日期": [[fmt(shift(0)), "今天"], [fmt(shift(30)), "30 天后"], [fmt(shift(90)), "90 天后"]],
    "入境日期": [[fmt(shift(0)), "今天"]],
    "离境日期": [[fmt(shift(30)), "30 天后"], [fmt(shift(90)), "90 天后"]],
    "护照到期日": [[fmt(shiftMonths(6)), "6 个月后"], [fmt(shiftYears(1)), "1 年后"], [fmt(shiftYears(5)), "5 年后"]],
    "计划出行日": [[fmt(shift(0)), "今天"], [fmt(shift(30)), "30 天后"], [fmt(shift(90)), "90 天后"]]
  };

  var NUM_CHIPS = [
    { re: /允许停留天数/, vals: [[15, "15 天"], [30, "30 天"], [60, "60 天"], [90, "90 天"]] },
    { re: /照片宽度/, vals: [[413, "413 标准"], [600, "600 高清"]] },
    { re: /照片高度/, vals: [[531, "531 标准"], [600, "600 方图"]] },
    { re: /头部占比/, vals: [[65, "65%"], [70, "70%"], [75, "75%"]] }
  ];

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
    if (!host || host.querySelector(".xn-pp-chips")) return;
    var row = document.createElement("div");
    row.className = "xn-pp-chips";
    row.setAttribute("role", "group");
    row.setAttribute("aria-label", "常用值");
    vals.forEach(function (pair) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = pair[1];
      b.setAttribute("aria-label", "设为" + pair[1]);
      b.addEventListener("click", function (ev) {
        ev.preventDefault();
        setValue(inp, String(pair[0]));
      });
      row.appendChild(b);
    });
    host.appendChild(row);
  }

  function markTabs() {
    var tabs = Array.prototype.filter.call(document.querySelectorAll("#root button"), function (b) {
      return vis(b) && TOOL_NAMES.indexOf((b.textContent || "").trim()) >= 0;
    });
    tabs.forEach(function (b) {
      var cs = window.getComputedStyle(b);
      var bg = cs.backgroundColor || "";
      var cls = b.className || "";
      var active = /border-blue-600|text-blue-600|bg-blue-600|bg-\[#/.test(cls) ||
        (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "rgb(255, 255, 255)" && bg.indexOf("255, 255, 255") < 0);
      var val = active ? "true" : "false";
      if (b.getAttribute("aria-pressed") !== val) b.setAttribute("aria-pressed", val);
      if (b.getAttribute("aria-label") !== (b.textContent || "").trim()) b.setAttribute("aria-label", (b.textContent || "").trim());
    });
    var bar = tabs[0] && tabs[0].parentElement;
    if (bar && bar.classList && !bar.classList.contains("xn-pp-tabs")) bar.classList.add("xn-pp-tabs");
  }

  function fixTitle() {
    Array.prototype.forEach.call(document.querySelectorAll("#root h2, #root h3"), function (el) {
      if (el.children.length) return;
      var t = (el.textContent || "").trim();
      if (t === "使用说明" && !el.classList.contains("xn-pp-note")) el.classList.add("xn-pp-note");
      var m = t.match(/^工具[A-F]\s*(.+)$/);
      if (m) el.textContent = m[1];
    });
  }

  function markInputs() {
    Array.prototype.forEach.call(document.querySelectorAll("#root input"), function (inp) {
      var type = (inp.getAttribute("type") || "text").toLowerCase();
      if (/^(date|time|text|search|url|email|tel)$/.test(type)) inp.classList.add("xn-pp-inp");
      var label = inp.getAttribute("aria-label") || "";
      if (type === "date" && DATE_CHIPS[label]) addChips(inp, DATE_CHIPS[label]);
      if (type === "number") {
        for (var i = 0; i < NUM_CHIPS.length; i++) {
          if (NUM_CHIPS[i].re.test(label)) { addChips(inp, NUM_CHIPS[i].vals); break; }
        }
      }
    });
  }

  function markButtons() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      var text = (b.textContent || "").replace(/\s+/g, "").trim();
      if (text === "复制结果" || text === "已复制") {
        if (b.getAttribute("aria-label") !== "复制结果") b.setAttribute("aria-label", "复制结果");
      }
    });
  }

  function markKpi() {
    Array.prototype.forEach.call(document.querySelectorAll("#root div, #root span, #root p"), function (el) {
      if (el.children.length) return;
      var t = (el.textContent || "").trim();
      if (!t || t.length > 16) return;
      var cs = window.getComputedStyle(el);
      if (parseFloat(cs.fontSize) >= 20 && (parseInt(cs.fontWeight, 10) || 400) >= 700) {
        if (!el.classList.contains("xn-pp-kpi")) el.classList.add("xn-pp-kpi");
      }
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "xn-pp-top";
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
      markInputs();
      markButtons();
      markKpi();
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
  window.setInterval(tick, 900);

  window.addEventListener("scroll", function () {
    if (!topBtn) return;
    if (window.scrollY > 620) topBtn.classList.add("is-on");
    else topBtn.classList.remove("is-on");
  }, { passive: true });
})();
