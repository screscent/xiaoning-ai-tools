/* R1313 年龄与生日计算合集 · xn-bday.js
   标题归一 / 工具编号 / 日期快捷 chip / 复制可读名 / 输入内联兜底 */
(function () {
  if (window.__XN_BDAY__) return;
  window.__XN_BDAY__ = true;

  var NUMS = ["①", "②", "③", "④", "⑤", "⑥"];
  var NAMES = ["精确年龄", "生日倒计时", "届龄节点", "生日对比", "退休", "生肖星座"];
  var TITLE_MAP = {
    "精确年龄": "工具一 · 精确年龄",
    "生日倒计时": "工具二 · 生日倒计时",
    "届龄节点": "工具三 · 届龄节点",
    "生日对比": "工具四 · 生日对比",
    "工具E 退休时间与工作年限": "工具五 · 退休时间与工作年限",
    "工具F 生肖与星座速查": "工具六 · 生肖与星座速查"
  };

  function visible(el) {
    return !!el && el.getBoundingClientRect().height > 0;
  }

  /* ---- 标题归一 ---- */
  function normalizeHeadings() {
    Array.prototype.forEach.call(document.querySelectorAll("#root h2"), function (h) {
      var t = h.textContent.trim();
      if (TITLE_MAP[t] && h.textContent !== TITLE_MAP[t]) h.textContent = TITLE_MAP[t];
    });
  }

  /* ---- 工具切换：①–⑥ + aria-label ---- */
  function enhanceTabs() {
    var tabs = Array.prototype.slice.call(document.querySelectorAll("#root button[aria-pressed]")).filter(visible);
    tabs.forEach(function (b) {
      var src = b.getAttribute("data-xn-label");
      if (!src) {
        src = b.textContent.trim().replace(/^[①-⑥]\s*/, "");
        b.setAttribute("data-xn-label", src);
      }
      var idx = NAMES.indexOf(src);
      if (idx < 0) return;
      var want = NUMS[idx] + " " + src;
      if (b.textContent.trim() !== want) b.textContent = want;
      var al = "切换到工具" + ["一", "二", "三", "四", "五", "六"][idx] + " " + src;
      if (b.getAttribute("aria-label") !== al) b.setAttribute("aria-label", al);
      b.style.setProperty("min-height", "44px", "important");
    });
  }

  /* ---- 日期快捷 chip ---- */
  function sampleChips(aria) {
    if (/参考日期|今天/.test(aria)) return ["今天", "2027-01-01"];
    if (/第二个人|乙/.test(aria)) return ["示例 1992-08-08"];
    if (/参加工作/.test(aria)) return ["示例 2013-07-01"];
    if (/出生|生日/.test(aria)) return ["示例 1990-05-20", "2000-01-01"];
    return [];
  }

  function setDate(inp, v) {
    var setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    setter.call(inp, v);
    inp.dispatchEvent(new Event("input", { bubbles: true }));
    inp.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function enhanceDates() {
    Array.prototype.forEach.call(document.querySelectorAll('#root input[type="date"]'), function (inp) {
      if (!visible(inp)) return;
      if (inp.getAttribute("data-xn-chips") === "1") return;
      var aria = inp.getAttribute("aria-label") || "";
      var list = sampleChips(aria);
      if (!list.length) return;
      inp.setAttribute("data-xn-chips", "1");
      var box = document.createElement("div");
      box.className = "xn-bday-chips";
      list.forEach(function (label) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "xn-bday-chip";
        b.textContent = label;
        b.setAttribute("aria-label", "填入" + label.replace("示例 ", "示例日期 "));
        b.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          var v = label === "今天" ? new Date().toISOString().slice(0, 10) : label.replace("示例 ", "");
          setDate(inp, v);
        });
        box.appendChild(b);
      });
      var label = inp.closest("label");
      if (label) label.appendChild(box);
      else inp.insertAdjacentElement("afterend", box);
    });
  }

  /* ---- 复制按钮 ---- */
  function enhanceCopy() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!/复制结果/.test(b.textContent)) return;
      b.classList.add("xn-bday-copy");
      if (b.getAttribute("aria-label") !== "复制计算结果") b.setAttribute("aria-label", "复制计算结果");
      b.style.setProperty("min-height", "44px", "important");
    });
  }

  /* ---- 输入内联兜底 ---- */
  function enhanceInputs() {
    Array.prototype.forEach.call(document.querySelectorAll('#root input[type="date"], #root select'), function (el) {
      if (el.getAttribute("data-xn-style") === "1") return;
      el.setAttribute("data-xn-style", "1");
      el.style.setProperty("min-height", "48px", "important");
      el.style.setProperty("font-size", "15.5px", "important");
    });
  }

  function run() {
    try {
      normalizeHeadings();
      enhanceTabs();
      enhanceDates();
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
