/* R1318 家庭药品与药箱清单合集 · xn-medbox.js
   工具编号 / 标题归一 / 表格与日期强调 / 开关与按钮语义 */
(function () {
  if (window.__XN_MEDBOX__) return;
  window.__XN_MEDBOX__ = true;

  var NUMS = ["①", "②"];

  function visible(el) {
    return !!el && el.getBoundingClientRect().height > 0;
  }

  /* ---- 标题归一 ---- */
  function normalizeHeadings() {
    Array.prototype.forEach.call(document.querySelectorAll("#root h2"), function (h) {
      var t = h.textContent.trim();
      var m = t.match(/^[①②]\s*(.+)$/);
      if (!m) return;
      var idx = t.charAt(0) === "①" ? 0 : 1;
      var next = "工具" + (idx === 0 ? "一" : "二") + " · " + m[1].trim();
      if (h.textContent !== next) h.textContent = next;
      h.classList.add("xn-mb-tool");
    });
  }

  function visibleToolIndex() {
    var h2 = Array.prototype.slice.call(document.querySelectorAll("#root h2")).filter(visible)[0];
    return h2 && h2.textContent.indexOf("工具二") === 0 ? 1 : 0;
  }

  /* ---- 工具切换 ---- */
  function enhanceTabs() {
    var active = visibleToolIndex();
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      var raw = b.textContent.trim().replace(/^[①②]\s*/, "");
      if (raw !== "保质期提醒" && raw !== "药箱清单") return;
      var idx = raw === "保质期提醒" ? 0 : 1;
      var want = NUMS[idx] + " " + raw;
      if (b.textContent.trim() !== want) b.textContent = want;
      b.classList.add("xn-mb-tab");
      var pressed = active === idx ? "true" : "false";
      if (b.getAttribute("aria-pressed") !== pressed) b.setAttribute("aria-pressed", pressed);
      var al = idx === 0 ? "切换到工具一 保质期提醒" : "切换到工具二 药箱清单";
      if (b.getAttribute("aria-label") !== al) b.setAttribute("aria-label", al);
      b.style.setProperty("min-height", "44px", "important");
      b.style.setProperty("font-size", "13.5px", "important");
    });
  }

  /* ---- 表格行状态底色 ---- */
  function markRows() {
    Array.prototype.forEach.call(document.querySelectorAll("#root table tbody tr"), function (tr) {
      var t = tr.textContent;
      tr.classList.remove("xn-exp-row-danger", "xn-exp-row-warn");
      if (t.indexOf("已过期") >= 0) tr.classList.add("xn-exp-row-danger");
      else if (t.indexOf("临期") >= 0) tr.classList.add("xn-exp-row-warn");
    });
  }

  /* ---- 临期清单日期强调 ---- */
  function markDates() {
    Array.prototype.forEach.call(document.querySelectorAll('#root li[class*="justify-between"]'), function (li) {
      var txt = li.textContent;
      var danger = txt.indexOf("已过期") >= 0;
      var warn = txt.indexOf("剩余") >= 0 || txt.indexOf("临期") >= 0;
      if (!danger && !warn) return;
      Array.prototype.forEach.call(li.querySelectorAll("*"), function (el) {
        if (el.children.length) return;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(el.textContent.trim())) return;
        el.classList.add("xn-exp-date");
        el.classList.add(danger ? "danger" : "warn");
      });
    });
  }

  /* ---- 只显示临期开关 ---- */
  function enhanceSwitch() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      var t = b.textContent.trim();
      if (t !== "关" && t !== "开") return;
      b.classList.add("xn-mb-switch");
      if (b.getAttribute("role") !== "switch") b.setAttribute("role", "switch");
      var checked = t === "开" ? "true" : "false";
      if (b.getAttribute("aria-checked") !== checked) b.setAttribute("aria-checked", checked);
      if (b.getAttribute("aria-label") !== "只显示临期与过期") b.setAttribute("aria-label", "只显示临期与过期");
      b.style.setProperty("min-height", "44px", "important");
    });
  }

  /* ---- 按钮 ---- */
  function enhanceButtons() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      var t = b.textContent.trim();
      var map = {
        "检查": ["xn-mb-primary", "重新检查药品清单"],
        "复制结果": ["xn-mb-action", "复制提醒清单"],
        "清空": ["xn-mb-action", "清空药品清单"],
        "复制清单": ["xn-mb-action", "复制药箱建议清单"]
      };
      if (!map[t]) return;
      b.classList.add(map[t][0]);
      if (b.getAttribute("aria-label") !== map[t][1]) b.setAttribute("aria-label", map[t][1]);
      b.style.setProperty("min-height", t === "检查" ? "48px" : "44px", "important");
    });
  }

  /* ---- 输入 ---- */
  function enhanceInputs() {
    Array.prototype.forEach.call(document.querySelectorAll("#root select"), function (el) {
      if (el.getAttribute("data-xn-style") === "1") return;
      el.setAttribute("data-xn-style", "1");
      el.style.setProperty("min-height", "48px", "important");
      el.style.setProperty("font-size", "15.5px", "important");
    });
    Array.prototype.forEach.call(document.querySelectorAll('#root input[type="number"]'), function (el) {
      if (el.getAttribute("aria-label") === "临期提醒天数") el.setAttribute("aria-label", "临期提醒天数（天）");
    });
  }

  function run() {
    try {
      normalizeHeadings();
      enhanceTabs();
      markRows();
      markDates();
      enhanceSwitch();
      enhanceButtons();
      enhanceInputs();
    } catch (e) {}
  }

  var timer = null;
  function schedule() {
    if (timer) return;
    timer = window.setTimeout(function () {
      timer = null;
      run();
    }, 90);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule);
  else schedule();

  document.addEventListener("click", function (e) {
    var t = e.target;
    if (t && t.closest && (t.closest("button") || t.closest("label"))) {
      window.setTimeout(schedule, 140);
      window.setTimeout(schedule, 520);
    }
  });
  document.addEventListener("change", function (e) {
    if (e.target && (e.target.type === "checkbox" || e.target.tagName === "SELECT" || e.target.tagName === "TEXTAREA")) {
      window.setTimeout(schedule, 120);
      window.setTimeout(schedule, 520);
    }
  });

  var mo = new MutationObserver(function (muts) {
    for (var i = 0; i < muts.length; i++) {
      if (muts[i].type === "childList" && muts[i].addedNodes.length) { schedule(); return; }
    }
  });
  try {
    mo.observe(document.getElementById("root") || document.body, { childList: true, subtree: true });
  } catch (e) {}
  window.setInterval(run, 1200);
})();
