/* R1321 透明边裁剪与批量清单合集 · xn-trim.js
   工具编号 / 标题归一 / 标签语义 / 滑杆与数字 / 示例图 / 批量清单文案 */
(function () {
  if (window.__XN_TRIM__) return;
  window.__XN_TRIM__ = true;

  var CN = ["一", "二"];
  var NUM = ["①", "②"];
  var TABS = ["透明边裁剪", "批量清单"];

  function visible(el) {
    return !!el && el.getBoundingClientRect().height > 0;
  }

  /* ---- 标题归一 ---- */
  function normalizeHeadings() {
    Array.prototype.forEach.call(document.querySelectorAll("#root h2"), function (h) {
      var t = h.textContent.trim();
      if (/^工具[一二]\s*·/.test(t)) {
        h.classList.add("xn-tr-tool");
        return;
      }
      var m = t.match(/^[①②]\s*(.+)$/);
      if (!m) return;
      var idx = t.charAt(0) === "①" ? 0 : 1;
      var next = "工具" + CN[idx] + " · " + m[1].trim();
      if (t !== next) h.textContent = next;
      h.classList.add("xn-tr-tool");
    });
  }

  /* ---- 工具切换 ---- */
  function activeTabIndex() {
    var btns = Array.prototype.slice.call(document.querySelectorAll("#root button"));
    for (var i = 0; i < btns.length; i++) {
      var t = btns[i].textContent.trim();
      if (TABS.indexOf(t) < 0) continue;
      if (String(btns[i].className).indexOf("bg-blue-500") >= 0) return TABS.indexOf(t);
    }
    return 0;
  }

  function enhanceTabs() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      var t = b.textContent.trim();
      var idx = TABS.indexOf(t);
      if (idx < 0) return;
      b.classList.add("xn-tr-tab");
      if (b.getAttribute("data-no") !== NUM[idx]) b.setAttribute("data-no", NUM[idx]);
      var active = String(b.className).indexOf("bg-blue-500") >= 0;
      b.classList.toggle("is-active", active);
      if (active) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
      var al = "工具" + CN[idx] + "：" + TABS[idx] + (active ? "（当前）" : "");
      if (b.getAttribute("aria-label") !== al) b.setAttribute("aria-label", al);
    });
  }

  /* ---- 卡片 ---- */
  function markCard(el) {
    var n = el;
    for (var i = 0; i < 7 && n; i++) {
      if (n.className && String(n.className).indexOf("bg-white") >= 0) {
        n.classList.add("xn-tr-card");
        return;
      }
      n = n.parentElement;
    }
  }

  function enhanceCards() {
    var drop = document.querySelector("#root div.border-dashed");
    if (drop) {
      drop.classList.add("xn-tr-drop");
      markCard(drop);
    }
    var cap = null;
    Array.prototype.forEach.call(document.querySelectorAll("#root div, #root p"), function (e) {
      if (e.children.length === 0 && /裁剪前后对比/.test(e.textContent)) cap = e;
    });
    if (cap) markCard(cap);
    var batchLabel = null;
    Array.prototype.forEach.call(document.querySelectorAll("#root label, #root div"), function (e) {
      if (e.children.length === 0 && /输入文件名列表/.test(e.textContent)) batchLabel = e;
    });
    if (batchLabel) markCard(batchLabel);
  }

  /* ---- 上传示例图 ---- */
  function addExample() {
    var drop = document.querySelector("#root div.border-dashed");
    if (!drop) return;
    if (document.querySelector("#root .xn-tr-example")) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "xn-tr-example";
    btn.textContent = "没有图片？载入示例图 →";
    btn.setAttribute("aria-label", "载入带透明边的示例图片");
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var input = document.querySelector('#root input[type="file"]');
      if (!input) return;
      var c = document.createElement("canvas");
      c.width = 360; c.height = 260;
      var g = c.getContext("2d");
      g.clearRect(0, 0, 360, 260);
      var grad = g.createLinearGradient(70, 70, 290, 190);
      grad.addColorStop(0, "#14b8a6");
      grad.addColorStop(1, "#0ea5e9");
      g.fillStyle = grad;
      g.beginPath();
      if (g.roundRect) g.roundRect(70, 70, 220, 120, 16);
      else g.rect(70, 70, 220, 120);
      g.fill();
      g.fillStyle = "#ffffff";
      g.font = "bold 32px sans-serif";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText("示例图", 180, 130);
      c.toBlob(function (blob) {
        if (!blob) return;
        try {
          var file = new File([blob], "example-transparent.png", { type: "image/png" });
          var dt = new DataTransfer();
          dt.items.add(file);
          input.files = dt.files;
          input.dispatchEvent(new Event("change", { bubbles: true }));
        } catch (err) {}
      }, "image/png");
    });
    drop.parentNode.insertBefore(btn, drop.nextSibling);
  }

  /* ---- 滑杆数值（由 CSS 直接命中 text-blue-600 数值） ---- */

  function syncRanges() {
    Array.prototype.forEach.call(document.querySelectorAll('#root input[type="range"]'), function (el) {
      var min = parseFloat(el.min) || 0;
      var max = parseFloat(el.max) || 100;
      var v = parseFloat(el.value) || 0;
      var p = Math.max(0, Math.min(100, ((v - min) / (max - min || 1)) * 100));
      el.style.setProperty("--xn-p", p.toFixed(1) + "%");
    });
  }

  function syncExample() {
    var input = document.querySelector('#root input[type="file"]');
    var ex = document.querySelector("#root .xn-tr-example");
    if (!ex || !input) return;
    var has = !!(input.files && input.files.length);
    ex.style.display = has ? "none" : "inline-flex";
  }

  /* ---- 结果数字 ---- */
  function enhanceResults() {
    ["原始尺寸", "裁剪后尺寸", "像素减少", "减少像素数"].forEach(function (label) {
      var el = null;
      Array.prototype.forEach.call(document.querySelectorAll("#root span, #root div"), function (e) {
        if (!el && e.children.length === 0 && e.textContent.trim() === label) el = e;
      });
      if (!el) return;
      var tile = el.parentElement;
      if (!tile) return;
      tile.classList.add("xn-tr-tile");
      Array.prototype.forEach.call(tile.children, function (c) {
        if (c !== el) c.classList.add("xn-tr-num");
      });
    });
    ["原始图片", "裁剪结果"].forEach(function (label) {
      Array.prototype.forEach.call(document.querySelectorAll("#root span, #root div"), function (e) {
        if (e.children.length !== 0) return;
        if (e.textContent.trim() === label) e.classList.add("xn-tr-cap");
      });
    });
  }

  /* ---- 按钮 ---- */
  function enhanceButtons() {
    var map = {
      "开始裁剪": ["xn-tr-primary", "开始裁剪透明边"],
      "下载裁剪结果": ["xn-tr-primary", "下载裁剪后的图片"],
      "复制尺寸信息": ["xn-tr-action", "复制尺寸信息"],
      "重置": ["xn-tr-action", "重置当前图片"],
      "复制清单": ["xn-tr-action", "复制批量裁剪清单"]
    };
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      var t = b.textContent.replace(/\s+/g, " ").trim();
      if (!map[t]) return;
      b.classList.add(map[t][0]);
      if (b.getAttribute("aria-label") !== map[t][1]) b.setAttribute("aria-label", map[t][1]);
      b.style.setProperty("min-height", map[t][0] === "xn-tr-primary" ? "48px" : "44px", "important");
    });
  }

  /* ---- 其它控件 ---- */
  function enhanceControls() {
    Array.prototype.forEach.call(document.querySelectorAll("#root select"), function (el) {
      el.style.setProperty("height", "48px", "important");
      el.style.setProperty("min-height", "48px", "important");
      el.style.setProperty("font-size", "16px", "important");
    });
    Array.prototype.forEach.call(document.querySelectorAll('#root input[type="color"]'), function (el) {
      el.style.setProperty("height", "48px", "important");
      el.style.setProperty("width", "56px", "important");
      var sib = el.parentElement && el.parentElement.querySelector("span");
      if (sib) sib.classList.add("xn-tr-hex");
    });
    Array.prototype.forEach.call(document.querySelectorAll("#root textarea"), function (el) {
      el.classList.add("xn-tr-ta");
    });
  }

  /* ---- 批量清单文案 ---- */
  function fixHints() {
    var active = activeTabIndex();
    var text = "先点击上方虚线区域选择图片，选好后即可开始裁剪";
    Array.prototype.forEach.call(document.querySelectorAll("#root .xn-hint"), function (el) {
      if (active === 1) {
        el.style.display = "none";
        return;
      }
      el.style.display = "";
      if (el.textContent.trim() !== text) el.textContent = text;
    });
    Array.prototype.forEach.call(document.querySelectorAll("#root span"), function (sp) {
      if (sp.children.length === 0 && /已完成/.test(sp.textContent)) sp.classList.add("xn-tr-count");
    });
  }

  function run() {
    try {
      normalizeHeadings();
      enhanceTabs();
      enhanceCards();
      addExample();
      syncRanges();
      syncExample();
      enhanceResults();
      enhanceButtons();
      enhanceControls();
      fixHints();
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
      window.setTimeout(schedule, 120);
      window.setTimeout(schedule, 460);
    }
  });
  document.addEventListener("input", function (e) {
    if (e.target && e.target.type === "range") syncRanges();
  });
  document.addEventListener("change", function (e) {
    if (e.target && (e.target.tagName === "SELECT" || e.target.type === "range" || e.target.type === "file")) {
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
