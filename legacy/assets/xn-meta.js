/* 图片元数据与隐私清理合集页增强（仅 2qcwr7qqxb 引用）
 * - 占位标题「工具E/工具F」归一
 * - EXIF 两个下拉补 aria；下载提示去掉「裁剪」错词
 * - 定位脱敏：城市坐标 + 模糊半径快捷值 + 设置摘要
 * - 清除元数据：图片数量快捷值 + 设置摘要
 * - 结果数字分级、风险徽标配色
 */
(function () {
  "use strict";
  if (window.__XN_META__) return;
  window.__XN_META__ = true;

  function txt(el) { return (el.textContent || "").trim(); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function setInput(el, v) {
    var proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    proto.set.call(el, String(v));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }
  function inputBy(prefix) {
    return [].slice.call(document.querySelectorAll("#root input")).filter(function (i) {
      return (i.getAttribute("aria-label") || "").indexOf(prefix) === 0;
    })[0];
  }

  /* ---------- 标题与文案 ---------- */
  function fixTitles() {
    [].slice.call(document.querySelectorAll("#root h1, #root h2, #root h3")).forEach(function (h) {
      var t = txt(h);
      if (/^工具[A-Z]\s+/.test(t)) h.textContent = t.replace(/^工具[A-Z]\s+/, "");
    });
  }

  function fixSelects() {
    var sels = [].slice.call(document.querySelectorAll("#root select"));
    sels.forEach(function (s) {
      if (s.getAttribute("aria-label")) return;
      var t = s.options[0] ? s.options[0].text : "";
      if (/全部信息|拍摄设备/.test(t)) s.setAttribute("aria-label", "显示项");
      else if (/Canvas|GPS/.test(t)) s.setAttribute("aria-label", "清除方式");
    });
  }

  function fixDownloadHint() {
    [].slice.call(document.querySelectorAll("#root .xn-hint")).forEach(function (h) {
      if (/裁剪/.test(txt(h))) h.textContent = "选择图片并执行清除后即可下载";
    });
  }

  /* ---------- 通用胶囊 ---------- */
  function chipsRow(anchor, items, onPick, extraClass) {
    if (!anchor || !anchor.parentElement) return null;
    var host = anchor.parentElement;
    var wrap = host.querySelector(".xn-chips" + (extraClass ? "." + extraClass : ""));
    if (wrap) return wrap;
    wrap = document.createElement("div");
    wrap.className = "xn-chips" + (extraClass ? " " + extraClass : "");
    items.forEach(function (it) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = it.label;
      if (it.title) b.title = it.title;
      b.onclick = function () { onPick(it.value); setTimeout(updateAll, 40); };
      wrap.appendChild(b);
    });
    host.appendChild(wrap);
    return wrap;
  }

  function syncSimple(input, wrap, values) {
    if (!wrap) return;
    var cur = parseFloat(input.value);
    [].slice.call(wrap.children).forEach(function (b, i) {
      b.classList.toggle("is-on", !isNaN(cur) && cur === values[i]);
    });
  }

  /* ---------- 定位脱敏 ---------- */
  var CITIES = [
    { label: "上海", lat: 31.2304, lng: 121.4737 },
    { label: "北京", lat: 39.9042, lng: 116.4074 },
    { label: "深圳", lat: 22.5431, lng: 114.0579 },
    { label: "成都", lat: 30.5728, lng: 104.0668 }
  ];
  var RADII = [100, 500, 1000, 5000];

  function enhanceGPS() {
    var lat = inputBy("纬度"), lng = inputBy("经度"), rad = inputBy("模糊半径");
    if (!lat || !lng || !rad) return;
    /* 城市快捷值：插在经纬度网格之后 */
    if (!document.querySelector("#root .xn-cities")) {
      var grid = lat.parentElement;
      while (grid && !(grid.querySelector('input[aria-label="经度"]'))) grid = grid.parentElement;
      if (grid && grid.parentElement) {
        var wrap = document.createElement("div");
        wrap.className = "xn-chips xn-cities";
        CITIES.forEach(function (c) {
          var b = document.createElement("button");
          b.type = "button";
          b.textContent = c.label;
          b.title = c.lat + ", " + c.lng;
          b.onclick = function () {
            setInput(lat, c.lat);
            setInput(lng, c.lng);
            setTimeout(updateAll, 40);
          };
          wrap.appendChild(b);
        });
        grid.parentElement.insertBefore(wrap, grid.nextSibling);
      }
    }
    /* 半径快捷值 */
    var rwrap = document.querySelector("#root .xn-radius");
    if (!rwrap) {
      rwrap = chipsRow(rad, RADII.map(function (v) { return { label: v + " m", value: v }; }), function (v) {
        setInput(rad, v);
      }, "xn-radius");
    }
    syncSimple(rad, rwrap, RADII);
    /* 摘要 */
    var btn = [].slice.call(document.querySelectorAll("#root button")).filter(function (b) { return txt(b) === "计算模糊坐标"; })[0];
    if (btn) {
      var bar = document.querySelector("#root .xn-setbar");
      if (!bar) {
        bar = document.createElement("div");
        bar.className = "xn-setbar";
        var row = btn.parentElement;
        row.parentElement.insertBefore(bar, row);
      }
      var parts = [];
      if (lat.value) parts.push("纬度 " + lat.value);
      if (lng.value) parts.push("经度 " + lng.value);
      if (rad.value) parts.push("半径 " + rad.value + " m");
      var html = '<span class="xn-setlabel">当前设置</span>';
      if (!parts.length) html += '<span class="xn-setnote">填写经纬度与模糊半径后计算</span>';
      else html += parts.map(function (p) { return "<b>" + esc(p) + "</b>"; }).join("<span>·</span>");
      if (bar.innerHTML !== html) bar.innerHTML = html;
    }
  }

  /* ---------- 清除元数据 ---------- */
  var COUNTS = [1, 10, 50, 100];

  function enhanceStrip() {
    var cnt = inputBy("图片数量");
    if (!cnt) return;
    var wrap = document.querySelector("#root .xn-counts");
    if (!wrap) {
      wrap = chipsRow(cnt, COUNTS.map(function (v) { return { label: v + " 张", value: v }; }), function (v) {
        setInput(cnt, v);
      }, "xn-counts");
    }
    syncSimple(cnt, wrap, COUNTS);
    var btn = [].slice.call(document.querySelectorAll("#root button")).filter(function (b) { return txt(b) === "生成清除清单"; })[0];
    if (!btn) return;
    var bar = document.querySelector("#root .xn-setbar2");
    if (!bar) {
      bar = document.createElement("div");
      bar.className = "xn-setbar xn-setbar2";
      var row = btn.parentElement;
      row.parentElement.insertBefore(bar, row);
    }
    var keep = [].slice.call(document.querySelectorAll("#root button")).filter(function (b) {
      var c = (b.className || "").toString();
      return /^(是|否)$/.test(txt(b)) && /(bg-blue-5|bg-blue-6|bg-slate-900|text-white)/.test(c);
    });
    var keepTxt = keep.length ? txt(keep[0]) : "否";
    var html = '<span class="xn-setlabel">当前设置</span><b>' + esc(cnt.value || "?") + " 张</b>" +
      '<span>·</span><b>保留拍摄时间 ' + esc(keepTxt || "否") + "</b>";
    if (bar.innerHTML !== html) bar.innerHTML = html;
  }

  /* ---------- 结果数字与风险 ---------- */
  function ctxOf(el) {
    var n = el.parentElement, best = "";
    for (var i = 0; i < 4 && n; i++, n = n.parentElement) {
      var t = (n.innerText || "").replace(/\s+/g, " ").trim();
      if (!t) continue;
      if (/[\u4e00-\u9fa5]{2}/.test(t)) return t;
      if (!best || t.length < best.length) best = t;
    }
    return best;
  }

  function markResults() {
    var leaves = [].slice.call(document.querySelectorAll("#root span, #root strong, #root p, #root div"));
    leaves.forEach(function (el) {
      if (el.children.length) return;
      var t = txt(el);
      if (!t) return;
      var ctx = ctxOf(el);
      if (/^(低风险|中风险|高风险)$/.test(t)) {
        el.classList.add("xn-risk", /低/.test(t) ? "xn-risk-low" : /中/.test(t) ? "xn-risk-mid" : "xn-risk-high");
      } else if (/^\d+ × \d+ px$/.test(t) || /^\d+(\.\d+)? MP$/.test(t)) {
        el.classList.add("xn-num-lg");
      } else if (/^\d+(\.\d+)? (B|KB|MB)$/.test(t)) {
        el.classList.remove("xn-num-lg", "xn-hero-num");
        if (/共节省|节省/.test(ctx)) el.classList.add("xn-hero-num");
        else if (el.closest('div[class*="overflow-hidden"]') || el.closest("table")) { /* 表格行内保持原字号 */ }
        else el.classList.add("xn-num-lg");
      } else if (/^\(\d+(\.\d+)?%\)$/.test(t) && /共节省|节省/.test(ctx)) {
        if (el.parentElement) el.parentElement.classList.add("xn-save-big");
      } else if (/^\d+(\.\d+)? (B|KB|MB) \(\d+(\.\d+)?%\)$/.test(t)) {
        el.classList.add("xn-save");
      } else if (/^-?\d+\.\d{3,}(,\s*-?\d+\.\d{3,})?$/.test(t)) {
        el.classList.add("xn-num-lg", "xn-mono");
      } else if (/^≈ [\d.]+ m$/.test(t)) {
        el.classList.add("xn-num-lg");
      } else if (/^\d+ 张$/.test(t) || /^共 \d+ 类$/.test(t)) {
        el.classList.add("xn-num-lg");
      }
    });
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    fixTitles();
    fixSelects();
    fixDownloadHint();
    enhanceGPS();
    enhanceStrip();
    markResults();
  }

  var scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(function () { scheduled = false; try { updateAll(); } catch (e) {} }, 240);
  }

  function boot() {
    var root = document.getElementById("root");
    if (!root) { setTimeout(boot, 300); return; }
    updateAll();
    new MutationObserver(schedule).observe(root, {
      childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["class"]
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
