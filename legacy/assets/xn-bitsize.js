/* R1326 图片体积与位深估算合集 · xn-bitsize.js
   工具编号 / 标题归一 / 导航语义 / 结果数字 / 按钮 aria */
(function () {
  if (window.__XN_BITSIZE__) return;
  window.__XN_BITSIZE__ = true;

  var NUM = ["01", "02", "03", "04", "05", "06"];
  var CN = ["一", "二", "三", "四", "五", "六"];
  var NAMES = ["位深体积", "内存占用", "压缩比估算", "色彩数", "批量压缩体积", "打印 DPI"];
  var COPY_LABELS = [
    "复制位深体积结果", "复制内存占用结果", "复制压缩比估算结果",
    "复制色彩数结果", "复制批量压缩体积结果", "复制打印 DPI 结果"
  ];

  function visible(el) {
    return !!el && el.getBoundingClientRect().height > 0;
  }

  function toolSections() {
    return Array.prototype.slice.call(document.querySelectorAll("#root section")).filter(function (s) {
      return !!s.querySelector("h2");
    });
  }

  /* ---- 标题归一 ---- */
  function normalizeHeadings() {
    var secs = toolSections();
    secs.forEach(function (s, i) {
      var h = s.querySelector("h2");
      var t = h.textContent.trim();
      if (t === "使用说明") return;
      var name = t.replace(/^工具[一二三四五六A-F]\s*[·:：]?\s*/, "").trim() || NAMES[i] || t;
      var next = "工具" + CN[i] + " · " + name;
      if (t !== next) h.textContent = next;
      h.classList.add("xn-bs-h2");
      s.classList.add("xn-bs-card");
    });
  }

  /* ---- 工具导航卡 ---- */
  function enhanceTabs() {
    var anchors = Array.prototype.slice.call(document.querySelectorAll('#root a[href^="#/"]'));
    if (!anchors.length) return;
    anchors.forEach(function (a, i) {
      a.classList.add("xn-bs-tab");
      if (a.getAttribute("data-no") !== NUM[i]) a.setAttribute("data-no", NUM[i]);
      var al = "前往工具" + CN[i] + "：" + (NAMES[i] || a.textContent.replace(/\s+/g, " ").trim());
      if (a.getAttribute("aria-label") !== al) a.setAttribute("aria-label", al);
      Array.prototype.forEach.call(a.querySelectorAll("span, div"), function (sp) {
        if (sp.children.length === 0 && /前往工具/.test(sp.textContent)) sp.classList.add("xn-bs-tablink");
      });
    });
    var grid = anchors[0].parentElement;
    if (grid) {
      grid.classList.add("xn-bs-tabgrid");
      var cols = window.matchMedia("(max-width: 640px)").matches ? "repeat(2, minmax(0, 1fr))" : "repeat(3, minmax(0, 1fr))";
      grid.style.setProperty("grid-template-columns", cols, "important");
      grid.style.setProperty("gap", "10px", "important");
    }
  }

  /* ---- 结果卡 ---- */
  function enhanceTiles() {
    Array.prototype.forEach.call(document.querySelectorAll('#root div[class*="rounded-xl"][class*="p-4"]'), function (d) {
      var p = d.querySelector('p[class*="text-lg"]');
      if (!p) return;
      d.classList.add("xn-bs-tile");
      p.classList.add("xn-bs-val");
      Array.prototype.forEach.call(d.children, function (c2) {
        if (c2 !== p && c2.children.length === 0) c2.classList.add("xn-bs-tilelabel");
      });
    });
    Array.prototype.forEach.call(document.querySelectorAll("#root p"), function (p) {
      if (/text-\[1[12]px\]/.test(String(p.className)) && /^[^。]{4,40}$/.test(p.textContent.trim())) {
        p.classList.add("xn-bs-note");
      }
    });
  }

  /* ---- 按钮 ---- */
  function enhanceButtons() {
    var secs = toolSections();
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (b.textContent.replace(/\s+/g, " ").trim() !== "复制结果") return;
      b.classList.add("xn-bs-copy");
      var sec = b.closest("section");
      var i = secs.indexOf(sec);
      var al = COPY_LABELS[i] || "复制计算结果";
      if (b.getAttribute("aria-label") !== al) b.setAttribute("aria-label", al);
      b.style.setProperty("min-height", "44px", "important");
    });
  }

  /* ---- 控件 ---- */
  function enhanceControls() {
    Array.prototype.forEach.call(document.querySelectorAll("#root select"), function (el) {
      el.style.setProperty("height", "48px", "important");
      el.style.setProperty("min-height", "48px", "important");
      el.style.setProperty("font-size", "16px", "important");
    });
  }

  function run() {
    try {
      normalizeHeadings();
      enhanceTabs();
      enhanceTiles();
      enhanceButtons();
      enhanceControls();
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
    if (t && t.closest && (t.closest("a") || t.closest("button"))) {
      window.setTimeout(schedule, 110);
      window.setTimeout(schedule, 460);
    }
  });
  document.addEventListener("change", function (e) {
    if (e.target && (e.target.tagName === "SELECT" || e.target.type === "number")) {
      window.setTimeout(schedule, 150);
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
