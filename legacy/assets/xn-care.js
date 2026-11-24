/* R1311 家电保养与周期提醒合集 · xn-care.js
   标题归一 / 工具切换 aria / 日期强调 / 复制可读名 / 默认值自动生成 */
(function () {
  if (window.__XN_CARE__) return;
  window.__XN_CARE__ = true;

  var NUMS = ["①", "②", "③", "④", "⑤", "⑥"];
  var CN = ["一", "二", "三", "四", "五", "六"];
  var LETTER = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5 };

  function visible(el) {
    return !!el && el.getBoundingClientRect().height > 0;
  }

  function visibleToolIndex() {
    var h2 = Array.prototype.slice.call(document.querySelectorAll("#root section h2")).filter(visible)[0];
    if (!h2) return 0;
    var t = h2.textContent.trim();
    if (t.indexOf("工具二") === 0 || t.indexOf("工具三") === 0) return 1;
    return 0;
  }

  /* ---- 标题归一 ---- */
  function normalizeHeadings() {
    Array.prototype.forEach.call(document.querySelectorAll("#root section h2"), function (h) {
      var t = h.textContent.trim();
      var m = t.match(/^[①②③④⑤⑥]\s*(.+)$/);
      if (m) {
        var i = NUMS.indexOf(t.charAt(0));
        var next = "工具" + CN[Math.max(0, i)] + " · " + m[1].trim();
        if (h.textContent !== next) h.textContent = next;
        return;
      }
      var mm = t.match(/^工具([A-F])\s*[·:：-]?\s*(.*)$/);
      if (mm) {
        var n2 = "工具" + CN[LETTER[mm[1]]] + " · " + mm[2].trim();
        if (h.textContent !== n2) h.textContent = n2;
      }
    });
  }

  /* ---- 工具切换：aria-pressed / aria-label ---- */
  function enhanceTabs() {
    var active = visibleToolIndex();
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      var raw = b.textContent.trim().replace(/^[①-⑥]\s*/, "");
      if (raw !== "滤芯提醒" && raw !== "保养周期") return;
      var idx = raw === "滤芯提醒" ? 0 : 1;
      var pressed = active === idx ? "true" : "false";
      if (b.getAttribute("aria-pressed") !== pressed) b.setAttribute("aria-pressed", pressed);
      var al = idx === 0 ? "切换到工具一 滤芯更换提醒" : "切换到工具二 家电保养周期表";
      if (b.getAttribute("aria-label") !== al) b.setAttribute("aria-label", al);
      b.style.setProperty("min-height", "44px", "important");
    });
  }

  /* ---- 日期强调 ---- */
  function wrapDates() {
    Array.prototype.forEach.call(document.querySelectorAll("#root section p, #root section span, #root section div"), function (el) {
      if (el.children.length) return;
      if (el.getAttribute("data-xn-care-date") === "1") return;
      var t = el.textContent.trim();
      if (!t) return;
      if (/^\d{4}-\d{2}-\d{2}$/.test(t)) {
        el.setAttribute("data-xn-care-date", "1");
        el.classList.add("xn-care-date");
        return;
      }
      var m = t.match(/^(.*?)(\d{4}-\d{2}-\d{2})(.*)$/);
      if (!m) return;
      el.setAttribute("data-xn-care-date", "1");
      el.textContent = "";
      el.appendChild(document.createTextNode(m[1]));
      var strong = document.createElement("span");
      strong.className = "xn-care-date";
      strong.textContent = m[2];
      el.appendChild(strong);
      el.appendChild(document.createTextNode(m[3]));
      el.classList.add("xn-care-line");
    });
  }

  /* ---- 结果卡小标题 ---- */
  function markTitles() {
    var names = { "建议保养周期": 1, "下次保养日期与剩余天数": 1, "耗材更换建议": 1, "本次待办清单": 1 };
    Array.prototype.forEach.call(document.querySelectorAll("#root section *"), function (el) {
      if (el.children.length) return;
      var t = el.textContent.trim();
      if (names[t] && !el.classList.contains("xn-care-title")) el.classList.add("xn-care-title");
    });
  }

  /* ---- 复制可读名 ---- */
  function enhanceCopy() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      var t = b.textContent.trim();
      if (/复制提醒/.test(t) && b.getAttribute("aria-label") !== "复制提醒内容") b.setAttribute("aria-label", "复制提醒内容");
      if (/复制周期表/.test(t) && b.getAttribute("aria-label") !== "复制保养周期表") b.setAttribute("aria-label", "复制保养周期表");
      if (/生成提醒/.test(t)) b.style.setProperty("min-height", "48px", "important");
    });
  }

  /* ---- 开关可读名 ---- */
  function enhanceSwitch() {
    Array.prototype.forEach.call(document.querySelectorAll('#root button[role="switch"]'), function (b) {
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "切换是否已更换滤芯");
    });
  }

  /* ---- 输入内联兜底 ---- */
  function enhanceInputs() {
    Array.prototype.forEach.call(document.querySelectorAll('#root select, #root input[type="date"]'), function (el) {
      if (el.getAttribute("data-xn-style") === "1") return;
      el.setAttribute("data-xn-style", "1");
      el.style.setProperty("min-height", "48px", "important");
      el.style.setProperty("font-size", "15.5px", "important");
    });
  }

  /* ---- 默认值自动生成提醒 ---- */
  function autoGenerate() {
    if (window.__XN_CARE_AUTO__) return;
    var sec = document.getElementById("tool-reminder");
    if (!sec || !visible(sec)) return;
    if (/建议保养周期|下次保养日期/.test(sec.innerText)) { window.__XN_CARE_AUTO__ = true; return; }
    var btn = Array.prototype.slice.call(sec.querySelectorAll("button")).filter(visible).filter(function (b) {
      return /生成提醒/.test(b.textContent);
    })[0];
    if (!btn) return;
    window.__XN_CARE_AUTO__ = true;
    window.setTimeout(function () {
      try { btn.click(); } catch (e) {}
    }, 480);
  }

  function run() {
    try {
      normalizeHeadings();
      enhanceTabs();
      wrapDates();
      markTitles();
      enhanceCopy();
      enhanceSwitch();
      enhanceInputs();
      autoGenerate();
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
