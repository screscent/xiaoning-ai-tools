/* R1316 条码生成与尺寸校验合集 · xn-barcode.js
   标题归一 / 工具切换与开关语义 / 预览卡 / 操作按钮可读名 */
(function () {
  if (window.__XN_BARCODE__) return;
  window.__XN_BARCODE__ = true;

  var NUMS = ["①", "②"];
  var CN = ["一", "二"];

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
      var next = "工具" + CN[idx] + " · " + m[1].trim();
      if (h.textContent !== next) h.textContent = next;
      h.classList.add("xn-bc-tool");
    });
  }

  /* ---- 工具切换 ---- */
  function enhanceTabs() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!/^[①②]/.test(b.textContent.trim())) return;
      if (!/Code128|尺寸校验/.test(b.textContent)) return;
      b.classList.add("xn-bc-tab");
      var idx = b.textContent.trim().charAt(0) === "①" ? 0 : 1;
      var active = /bg-blue-600/.test(b.className);
      var pressed = active ? "true" : "false";
      if (b.getAttribute("aria-pressed") !== pressed) b.setAttribute("aria-pressed", pressed);
      var al = idx === 0 ? "切换到工具一 条码生成 Code128" : "切换到工具二 条码尺寸与校验";
      if (b.getAttribute("aria-label") !== al) b.setAttribute("aria-label", al);
      b.style.setProperty("min-height", "44px", "important");
      b.style.setProperty("font-size", "13.5px", "important");
    });
  }

  /* ---- 显示文字开关 ---- */
  function enhanceSwitch() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (b.textContent.trim()) return;
      if (!/rounded-full/.test(b.className)) return;
      b.classList.add("xn-bc-switch");
      if (b.getAttribute("role") !== "switch") b.setAttribute("role", "switch");
      var on = /bg-blue-600/.test(b.className);
      var checked = on ? "true" : "false";
      if (b.getAttribute("aria-checked") !== checked) b.setAttribute("aria-checked", checked);
      if (b.getAttribute("aria-label") !== "显示条码下方文字") b.setAttribute("aria-label", "显示条码下方文字");
      b.style.setProperty("min-height", "44px", "important");
    });
  }

  /* ---- 预览卡 ---- */
  function enhancePreview() {
    Array.prototype.forEach.call(document.querySelectorAll("#root canvas"), function (c) {
      var box = c.parentElement;
      if (box && !box.classList.contains("xn-barcode-preview")) box.classList.add("xn-barcode-preview");
    });
  }

  /* ---- 操作按钮 ---- */
  function enhanceActions() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      var t = b.textContent.trim();
      if (!/^(下载 PNG|复制内容|重置)$/.test(t)) return;
      b.classList.add("xn-bc-action");
      var al = t === "下载 PNG" ? "下载条码 PNG" : t === "复制内容" ? "复制条码内容" : "重置条码参数";
      if (b.getAttribute("aria-label") !== al) b.setAttribute("aria-label", al);
      b.style.setProperty("min-height", "44px", "important");
    });
  }

  /* ---- 输入可读名 ---- */
  function enhanceInputs() {
    Array.prototype.forEach.call(document.querySelectorAll('#root input[type="number"]'), function (inp) {
      var al = inp.getAttribute("aria-label") || "";
      if (al === "条高") inp.setAttribute("aria-label", "条高（像素）");
    });
    Array.prototype.forEach.call(document.querySelectorAll('#root input[type="text"], #root select'), function (el) {
      if (el.getAttribute("data-xn-style") === "1") return;
      el.setAttribute("data-xn-style", "1");
      el.style.setProperty("min-height", "48px", "important");
      el.style.setProperty("font-size", "15.5px", "important");
    });
  }

  /* ---- 状态卡去重：编码合法 / 编码合法 → 说明 ---- */
  function cleanStatus() {
    Array.prototype.forEach.call(document.querySelectorAll("#root p"), function (p) {
      if (p.children.length) return;
      if (p.textContent.trim() !== "编码合法") return;
      p.textContent = "已通过 Code128 校验，可直接下载或打印使用。";
    });
  }

  function run() {
    try {
      normalizeHeadings();
      enhanceTabs();
      enhanceSwitch();
      enhancePreview();
      enhanceActions();
      enhanceInputs();
      cleanStatus();
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
