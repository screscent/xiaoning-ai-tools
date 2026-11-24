/* R1312 用药提醒与间隔计算合集 · xn-med.js
   工具切换语义 / 结果编号连续化 / 计数与日期强调 / 复制可读名 */
(function () {
  if (window.__XN_MED__) return;
  window.__XN_MED__ = true;

  var NUMS = ["①", "②", "③", "④", "⑤", "⑥"];

  function visible(el) {
    return !!el && el.getBoundingClientRect().height > 0;
  }

  function visibleH2() {
    return Array.prototype.slice.call(document.querySelectorAll("#root h2")).filter(visible);
  }

  function toolIndex() {
    var h2s = visibleH2();
    for (var i = 0; i < h2s.length; i++) {
      if (/服药间隔/.test(h2s[i].textContent)) return 1;
    }
    return 0;
  }

  /* ---- 工具切换 ---- */
  function enhanceTabs() {
    var active = toolIndex();
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      var raw = b.textContent.trim().replace(/^[①-⑥]\s*/, "");
      if (raw !== "用药清单" && raw !== "服药间隔") return;
      var idx = raw === "用药清单" ? 0 : 1;
      var want = NUMS[idx] + " " + raw;
      if (b.textContent.trim() !== want) b.textContent = want;
      var pressed = active === idx ? "true" : "false";
      if (b.getAttribute("aria-pressed") !== pressed) b.setAttribute("aria-pressed", pressed);
      var al = idx === 0 ? "切换到工具一 用药清单" : "切换到工具二 服药间隔";
      if (b.getAttribute("aria-label") !== al) b.setAttribute("aria-label", al);
      b.style.setProperty("min-height", "44px", "important");
    });
  }

  /* ---- 标题：工具二标题脱离编号，结果块编号连续 ---- */
  function normalizeHeadings() {
    var h2s = Array.prototype.slice.call(document.querySelectorAll("#root h2"));
    h2s.forEach(function (h) {
      var t = h.textContent.trim();
      if (/^②\s*服药间隔计算$/.test(t) || /^服药间隔计算$/.test(t)) {
        if (h.textContent !== "服药间隔计算") h.textContent = "服药间隔计算";
        h.classList.add("xn-med-tool");
      }
    });
    // 结果块顺序重排 ①..N
    var seq = 0;
    Array.prototype.slice.call(document.querySelectorAll("#root h2")).forEach(function (h) {
      if (h.classList.contains("xn-med-tool")) return;
      var t = h.textContent.trim();
      var m = t.match(/^[①②③④⑤⑥]\s*(.*)$/);
      if (!m) return;
      var next = NUMS[seq] + " " + m[1].trim();
      seq++;
      if (h.textContent !== next) h.textContent = next;
    });
  }

  /* ---- 累计次数强调 ---- */
  function markCount() {
    Array.prototype.forEach.call(document.querySelectorAll("#root span"), function (s) {
      if (s.children.length !== 0) return;
      if (s.textContent.trim() !== "次") return;
      var p = s.parentElement;
      if (p && !p.classList.contains("xn-med-count")) p.classList.add("xn-med-count");
    });
  }

  /* ---- 复制可读名 ---- */
  function enhanceCopy() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      var t = b.textContent.trim();
      if (/复制清单/.test(t) && b.getAttribute("aria-label") !== "复制服药清单") b.setAttribute("aria-label", "复制服药清单");
      if (/复制时间表/.test(t) && b.getAttribute("aria-label") !== "复制服药时间表") b.setAttribute("aria-label", "复制服药时间表");
      if (/生成清单/.test(t)) b.style.setProperty("min-height", "48px", "important");
    });
  }

  /* ---- 输入内联兜底 ---- */
  function enhanceInputs() {
    Array.prototype.forEach.call(document.querySelectorAll('#root input[type="text"], #root input[type="time"], #root select'), function (el) {
      if (el.getAttribute("data-xn-style") === "1") return;
      el.setAttribute("data-xn-style", "1");
      el.style.setProperty("min-height", "48px", "important");
      el.style.setProperty("font-size", "15.5px", "important");
    });
  }

  function run() {
    try {
      enhanceTabs();
      normalizeHeadings();
      markCount();
      enhanceCopy();
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
