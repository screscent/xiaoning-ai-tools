/* xn-darkroom.js · 图片滤镜与调色合集：标题归一 / tab 语义 / 示例图 / 滑杆快捷值（幂等） */
(function () {
  "use strict";
  if (window.__XN_DARKROOM__) return;
  window.__XN_DARKROOM__ = 1;

  var CN = ["一", "二", "三", "四", "五", "六"];
  var CIRCLE = ["①", "②", "③", "④", "⑤", "⑥"];
  var HASH_ORDER = ["gray", "blur", "vintage", "tone", "sharpen", "temperature"];
  var NAMES = { gray: "灰度", blur: "模糊", vintage: "复古", tone: "明暗", sharpen: "锐化", temperature: "色温" };

  function text(el) { return (el && (el.textContent || "").trim()) || ""; }

  function setNative(el, value) {
    var proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    var setter = Object.getOwnPropertyDescriptor(proto, "value").set;
    setter.call(el, String(value));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function curIndex() {
    var h = (location.hash || "").replace(/^#\//, "");
    var k = HASH_ORDER.indexOf(h);
    return k > -1 ? k : 0;
  }

  /* 1. 标题归一 */
  function normalizeHeading() {
    var h2 = document.querySelector("#root h2");
    if (!h2) return;
    var idx = curIndex();
    var name = NAMES[HASH_ORDER[idx]];
    if (!name) return;
    var want = "工具" + CN[idx] + " · " + name;
    if (text(h2) !== want) h2.textContent = want;
  }

  /* 2. tab：编号 + 当前态 */
  function enhanceTabs() {
    var tabs = document.querySelectorAll('#root a[href^="#/"]');
    var idx = curIndex();
    for (var i = 0; i < tabs.length; i++) {
      var a = tabs[i];
      if (a.getAttribute("data-xn-num") !== CIRCLE[i]) a.setAttribute("data-xn-num", CIRCLE[i] || "");
      var id = (a.getAttribute("href") || "").replace(/^#\//, "");
      var active = id === HASH_ORDER[idx];
      if (active) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
      if (!a.getAttribute("aria-label")) {
        a.setAttribute("aria-label", "切换到工具" + CN[i] + " " + (NAMES[id] || text(a)));
      }
    }
  }

  /* 3. 模式按钮（灰度/黑白等） */
  function enhanceModes() {
    var btns = document.querySelectorAll('#root button[class*="text-xs"][class*="px-3"]');
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      if (b.className.indexOf("border-dashed") > -1) continue;
      if (!b.classList.contains("xn-mode")) b.classList.add("xn-mode");
      b.setAttribute("aria-pressed", /bg-blue-500|bg-blue-600/.test(b.className) ? "true" : "false");
    }
  }

  function syncModes() {
    var btns = document.querySelectorAll("#root button.xn-mode");
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute("aria-pressed", /bg-blue-500|bg-blue-600/.test(btns[i].className) ? "true" : "false");
    }
  }

  /* 4. 滑杆：数值强调 + 快捷值 */
  function unitOf(range) {
    var box = range.parentElement;
    var valEl = box ? box.querySelector(".tabular-nums") : null;
    var m = valEl ? /[^\d.\-]+$/.exec(text(valEl)) : null;
    return m ? m[0] : "";
  }

  function enhanceRanges() {
    var ranges = document.querySelectorAll('#root input[type="range"]');
    for (var i = 0; i < ranges.length; i++) {
      var r = ranges[i];
      var box = r.parentElement;
      if (!box || box.querySelector(":scope > .xn-range-presets")) continue;
      var min = parseFloat(r.min || "0");
      var max = parseFloat(r.max || "100");
      var step = parseFloat(r.step || "1");
      var unit = unitOf(r);
      var vals = [min, min + (max - min) * 0.25, min + (max - min) * 0.5, min + (max - min) * 0.75, max];
      var row = document.createElement("div");
      row.className = "xn-range-presets";
      for (var j = 0; j < vals.length; j++) {
        var v = Math.round(vals[j] / step) * step;
        v = Math.min(max, Math.max(min, v));
        var labelText = (Math.round(v * 10) / 10) + unit;
        var b = document.createElement("button");
        b.type = "button";
        b.textContent = labelText;
        b.dataset.xnVal = String(v);
        b.setAttribute("aria-label", "设置" + text(b) + "");
        row.appendChild(b);
      }
      box.appendChild(row);
    }
  }

  /* 5. 示例图片：无需上传即可试用 */
  function sampleBlob(cb) {
    var c = document.createElement("canvas");
    c.width = 800; c.height = 520;
    var g = c.getContext("2d");
    var sky = g.createLinearGradient(0, 0, 0, 520);
    sky.addColorStop(0, "#0ea5e9");
    sky.addColorStop(0.55, "#fbbf24");
    sky.addColorStop(1, "#f97316");
    g.fillStyle = sky; g.fillRect(0, 0, 800, 520);
    g.fillStyle = "rgba(255, 245, 205, .95)";
    g.beginPath(); g.arc(560, 170, 78, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(255, 255, 255, .30)";
    g.beginPath(); g.arc(560, 170, 112, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#0f766e";
    g.beginPath(); g.moveTo(0, 380); g.lineTo(190, 250); g.lineTo(360, 380); g.closePath(); g.fill();
    g.fillStyle = "#115e59";
    g.beginPath(); g.moveTo(260, 380); g.lineTo(470, 210); g.lineTo(700, 380); g.closePath(); g.fill();
    g.fillStyle = "#134e4a"; g.fillRect(0, 380, 800, 140);
    g.fillStyle = "rgba(255, 255, 255, .16)";
    for (var i = 0; i < 7; i++) g.fillRect(40 + i * 110, 404 + (i % 3) * 26, 70, 4);
    g.fillStyle = "rgba(15, 23, 42, .25)"; g.fillRect(0, 500, 800, 20);
    if (c.toBlob) c.toBlob(cb, "image/png");
    else cb(null);
  }

  function loadSample() {
    var input = document.querySelector('#root input[type="file"]');
    if (!input) return;
    sampleBlob(function (blob) {
      if (!blob) return;
      var file = new File([blob], "示例图片.png", { type: "image/png" });
      var dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  function enhanceUpload() {
    var up = document.querySelector('#root button[class*="border-dashed"]');
    if (!up) return;
    if (!up.getAttribute("aria-label")) up.setAttribute("aria-label", "选择本地图片，或使用下方示例图");
    var card = up.parentElement;
    if (!card || card.querySelector(":scope > .xn-sample-row")) return;
    var row = document.createElement("div");
    row.className = "xn-sample-row";
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = "载入示例图";
    b.setAttribute("aria-label", "载入示例图片，无需上传");
    b.title = "生成一张示例图，立即体验滤镜效果";
    row.appendChild(b);
    card.appendChild(row);
  }

  /* 6. 空预览 / 提示文案 / aria */
  function markPreview() {
    var cards = document.querySelectorAll("#root .bg-white.rounded-lg");
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      if (!card.querySelector("h3")) continue;
      if (!/请先上传图片/.test(card.textContent)) continue;
      var box = card.children[1];
      if (box && box.classList) box.classList.add("xn-preview-empty");
    }
    var tips = document.querySelectorAll("#root div, #root span, #root p");
    for (var k = 0; k < tips.length; k++) {
      var el = tips[k];
      if (el.children.length) continue;
      if (text(el) === "上传图片并调整裁剪区域后即可下载") {
        el.textContent = "先上传图片（或载入示例图），再调整参数，即可下载";
      }
    }
    var btns = document.querySelectorAll("#root button");
    for (var m = 0; m < btns.length; m++) {
      var t = text(btns[m]);
      if (!btns[m].getAttribute("aria-label")) {
        if (t === "重置") btns[m].setAttribute("aria-label", "重置滤镜参数");
        else if (/下载图片/.test(t)) btns[m].setAttribute("aria-label", "下载处理后的图片");
      }
    }
  }

  /* 7. 事件委托 */
  function onClick(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest(".xn-sample-row button")) {
      loadSample();
      return;
    }
    var chip = t.closest(".xn-range-presets button");
    if (chip) {
      var box = chip.parentElement && chip.parentElement.parentElement;
      var range = box && box.querySelector('input[type="range"]');
      if (range) { setNative(range, chip.dataset.xnVal); range.focus(); }
      return;
    }
    if (t.closest(".xn-mode")) setTimeout(syncModes, 60);
  }

  function enhanceAll() {
    try {
      normalizeHeading();
      enhanceTabs();
      enhanceModes();
      enhanceRanges();
      enhanceUpload();
      markPreview();
    } catch (e) { /* 增强失败不影响原功能 */ }
  }

  function boot() {
    var root = document.getElementById("root");
    if (!root) { setTimeout(boot, 300); return; }
    enhanceAll();
    document.addEventListener("click", onClick, true);
    window.addEventListener("hashchange", function () { enhanceAll(); });
    try {
      new MutationObserver(function () { enhanceAll(); }).observe(root, { childList: true, subtree: true });
    } catch (e) {}
    setInterval(enhanceAll, 900);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
