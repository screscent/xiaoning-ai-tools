/* R1310 汇率换算与换汇成本合集 · xn-fx.js
   编号导航 / 标题归一 / 复制可读名 / 金额与币种分隔 / 模式 aria */
(function () {
  if (window.__XN_FX__) return;
  window.__XN_FX__ = true;

  var NUMS = ["①", "②", "③", "④", "⑤", "⑥"];
  var CN = ["一", "二", "三", "四", "五", "六"];
  var LETTER = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5 };

  function visible(el) {
    return !!el && el.getBoundingClientRect().height > 0;
  }

  /* ---- 标题归一 ---- */
  function normalizeHeadings() {
    Array.prototype.forEach.call(document.querySelectorAll("#root section h2"), function (h) {
      var t = h.textContent.trim();
      var m = t.match(/^工具([A-F])\s*[·:：-]?\s*(.*)$/);
      if (!m) return;
      var next = "工具" + CN[LETTER[m[1]]] + " · " + m[2].trim();
      if (h.textContent !== next) h.textContent = next;
    });
  }

  /* ---- 导航编号与可读名 ---- */
  function enhanceNav() {
    Array.prototype.forEach.call(document.querySelectorAll('#root a[href^="#/"]'), function (a, i) {
      var src = a.getAttribute("data-xn-label");
      if (!src) {
        src = a.textContent.trim().replace(/^[①-⑥]\s*/, "");
        a.setAttribute("data-xn-label", src);
      }
      var want = NUMS[i] + " " + src;
      if (a.textContent.trim() !== want) a.textContent = want;
      var al = "工具" + CN[i] + " " + src;
      if (a.getAttribute("aria-label") !== al) a.setAttribute("aria-label", al);
    });
  }

  /* ---- 模式按钮（购汇 / 结汇） ---- */
  function enhanceModes() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      var t = b.textContent.trim();
      if (!/^(购汇（换入外币）|结汇（换回人民币）|购汇|结汇)$/.test(t)) return;
      var active = /bg-slate-900|bg-teal-|bg-emerald-/.test(b.className);
      var pressed = active ? "true" : "false";
      if (b.getAttribute("aria-pressed") !== pressed) b.setAttribute("aria-pressed", pressed);
      var al = t.indexOf("购汇") >= 0 ? "按购汇方向计算（换入外币）" : "按结汇方向计算（换回人民币）";
      if (b.getAttribute("aria-label") !== al) b.setAttribute("aria-label", al);
      b.style.setProperty("min-height", "44px", "important");
    });
  }

  /* ---- 复制按钮可读名 ---- */
  function enhanceCopy() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!/复制结果/.test(b.textContent)) return;
      if (b.getAttribute("aria-label") !== "复制计算结果") b.setAttribute("aria-label", "复制计算结果");
    });
  }

  /* ---- 币种输入可读名 ---- */
  function enhanceCurrencyInputs() {
    Array.prototype.forEach.call(document.querySelectorAll('#root input[type="text"]'), function (inp) {
      var label = inp.closest("label");
      var txt = (label ? label.textContent : "") + " " + (inp.getAttribute("aria-label") || "");
      var al = null;
      if (/源币种/.test(txt)) al = "源币种代码（如 USD）";
      else if (/目标币种/.test(txt)) al = "目标币种代码（如 CNY）";
      else if (/基准币种/.test(txt)) al = "基准币种代码（如 CNY）";
      if (al && inp.getAttribute("aria-label") !== al) inp.setAttribute("aria-label", al);
      if (inp.getAttribute("data-xn-style") !== "1") {
        inp.setAttribute("data-xn-style", "1");
        inp.style.setProperty("min-height", "48px", "important");
        inp.style.setProperty("font-size", "15.5px", "important");
      }
    });
  }

  /* ---- 金额与币种之间加细分隔，提升可读性 ---- */
  function spaceAmounts() {
    var sel = '#root section p[class*="text-[22px]"], #root section p[class*="text-base"][class*="font-semibold"]';
    Array.prototype.forEach.call(document.querySelectorAll(sel), function (p) {
      if (p.getAttribute("data-xn-amt") === "1") return;
      var t = p.textContent.trim();
      var m = t.match(/^([0-9][0-9.,]*)([A-Z]{3,5})$/);
      if (!m) return;
      p.setAttribute("data-xn-amt", "1");
      p.textContent = m[1] + "\u2009" + m[2];
    });
  }

  function run() {
    try {
      normalizeHeadings();
      enhanceNav();
      enhanceModes();
      enhanceCopy();
      enhanceCurrencyInputs();
      spaceAmounts();
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

  document.documentElement.style.scrollBehavior = "smooth";

  document.addEventListener("click", function (e) {
    var t = e.target;
    if (t && t.closest && (t.closest('a[href^="#/"]') || t.closest("button"))) {
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
