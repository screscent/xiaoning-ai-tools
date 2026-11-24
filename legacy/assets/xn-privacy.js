/* R1320 浏览器指纹与隐私评分合集 · xn-privacy.js
   工具标题归一 / 标签语义 / 开关整行可点 / 数字与报告增强 */
(function () {
  if (window.__XN_PRIVACY__) return;
  window.__XN_PRIVACY__ = true;

  var CN = ["一", "二"];
  var TOOLS = [
    ["#/fingerprint", "浏览器指纹自查"],
    ["#/privacyscore", "隐私暴露评分"]
  ];

  function visible(el) {
    return !!el && el.getBoundingClientRect().height > 0;
  }

  /* ---- 标题归一：①浏览器指纹自查 → 工具一 · 浏览器指纹自查 ---- */
  function normalizeHeadings() {
    Array.prototype.forEach.call(document.querySelectorAll("#root h2"), function (h) {
      var t = h.textContent.trim();
      if (/^工具[一二]\s*·/.test(t)) {
        h.classList.add("xn-pv-tool");
        h.classList.remove("xn-pv-sec");
        return;
      }
      var m = t.match(/^[①②]\s*(.+)$/);
      if (m) {
        var idx = t.charAt(0) === "①" ? 0 : 1;
        var next = "工具" + CN[idx] + " · " + m[1].trim();
        if (t !== next) h.textContent = next;
        h.classList.add("xn-pv-tool");
        h.classList.remove("xn-pv-sec");
        return;
      }
      if (!h.classList.contains("xn-pv-sec")) h.classList.add("xn-pv-sec");
    });
  }

  /* ---- 工具标签 ---- */
  function enhanceTabs() {
    var hash = location.hash || "";
    Array.prototype.forEach.call(document.querySelectorAll("#root a"), function (a) {
      var label = a.textContent.replace(/\s+/g, " ").trim();
      if (!/^[①②]\s*(指纹自查|隐私评分)$/.test(label)) return;
      var idx = label.charAt(0) === "①" ? 0 : 1;
      a.classList.add("xn-pv-tab");
      var active = String(a.className).indexOf("bg-slate-900") >= 0 || (hash && hash.indexOf(TOOLS[idx][0]) === 0);
      a.classList.toggle("is-active", active);
      if (active) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
      var al = "工具" + CN[idx] + "：" + TOOLS[idx][1] + (active ? "（当前）" : "");
      if (a.getAttribute("aria-label") !== al) a.setAttribute("aria-label", al);
      a.style.setProperty("min-height", "44px", "important");
    });
  }

  /* ---- 开关：扩大热区 + 整行可点 ---- */
  function enhanceSwitches() {
    Array.prototype.forEach.call(document.querySelectorAll('#root button[role="switch"]'), function (b) {
      b.classList.add("xn-pv-switch");
      var row = b.parentElement;
      if (row) {
        row.classList.add("xn-pv-row");
        Array.prototype.forEach.call(row.querySelectorAll("span"), function (sp) {
          var c = String(sp.className);
          if (/text-xs/.test(c) && /font-medium/.test(c) && !/rounded/.test(c)) sp.classList.add("xn-pv-swlabel");
        });
      }
    });
  }

  /* ---- 关键数字 / 徽标 / 清单行 ---- */
  function enhanceResults() {
    Array.prototype.forEach.call(document.querySelectorAll("#root span"), function (sp) {
      var cls = String(sp.className);
      if (/text-2xl/.test(cls) && /font-bold/.test(cls)) sp.classList.add("xn-pv-ent");
      if (/text-\[(10|11)px\]/.test(cls)) {
        if (/font-mono/.test(cls)) sp.classList.add("xn-pv-mono");
        else if (/rounded/.test(cls) && /(border|bg-)/.test(cls)) sp.classList.add("xn-pv-chip");
        else sp.classList.add("xn-pv-note");
      }
      if (/text-xs/.test(cls) && /font-medium/.test(cls) && /sm:w-28/.test(cls)) sp.classList.add("xn-pv-item");
    });
    Array.prototype.forEach.call(document.querySelectorAll("#root p"), function (p) {
      if (/text-3xl/.test(String(p.className))) p.classList.add("xn-pv-score");
    });
    Array.prototype.forEach.call(document.querySelectorAll("#root pre"), function (pre) {
      pre.classList.add("xn-pv-pre");
    });
  }

  /* ---- 按钮 ---- */
  function enhanceButtons() {
    var map = {
      "开始自查": ["xn-pv-primary", "开始浏览器指纹自查"],
      "复制报告": ["xn-pv-action", "复制脱敏自查报告"],
      "复制评分报告": ["xn-pv-action", "复制隐私评分报告"],
      "清空": ["xn-pv-action", "清空当前结果"]
    };
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      var t = b.textContent.replace(/\s+/g, " ").trim();
      if (!map[t]) return;
      b.classList.add(map[t][0]);
      if (b.getAttribute("aria-label") !== map[t][1]) b.setAttribute("aria-label", map[t][1]);
      b.style.setProperty("min-height", t === "开始自查" ? "48px" : "44px", "important");
    });
  }

  function run() {
    try {
      normalizeHeadings();
      enhanceTabs();
      enhanceSwitches();
      enhanceResults();
      enhanceButtons();
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

  /* 整行点击切换开关（点按钮本身不重复触发） */
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var row = t.closest(".xn-pv-row");
    if (row && !t.closest('button[role="switch"]')) {
      var sw = row.querySelector('button[role="switch"]');
      if (sw) {
        sw.click();
        return;
      }
    }
    if (t.closest("a") || t.closest("button")) {
      window.setTimeout(schedule, 120);
      window.setTimeout(schedule, 460);
    }
  });
  document.addEventListener("change", function (e) {
    if (e.target && (e.target.tagName === "SELECT" || e.target.type === "checkbox")) {
      window.setTimeout(schedule, 120);
      window.setTimeout(schedule, 460);
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
