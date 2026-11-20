/* 图片水印页增强（仅 mknibarxwr 引用）：滑块数值放大 + 字号快捷值 + 当前设置摘要 */
(function () {
  "use strict";
  if (window.__XN_WM__) return;
  window.__XN_WM__ = true;

  function txt(el) { return (el.textContent || "").trim(); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function setRange(el, v) {
    var proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    proto.set.call(el, String(v));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function labelRowOf(input) {
    var p = input.parentElement;
    if (!p) return null;
    var first = p.firstElementChild;
    if (first && /flex/.test((first.className || "").toString())) return first;
    return null;
  }

  function valueNode(row) {
    if (!row) return null;
    var kids = [].slice.call(row.children);
    for (var i = kids.length - 1; i >= 0; i--) {
      var k = kids[i];
      if (k.children && k.children.length) continue;
      if (/^\d+(\.\d+)?\s?(px|%|°|deg)?$/.test(txt(k))) return k;
    }
    return null;
  }

  function ensureChips(input, row) {
    if (!row || !/字号/.test(txt(row))) return;
    var host = input.parentElement;
    if (!host || host.querySelector(".xn-wm-chips")) return;
    var wrap = document.createElement("div");
    wrap.className = "xn-wm-chips";
    [24, 36, 48, 64, 96].forEach(function (v) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = v + "px";
      b.onclick = function () { setRange(input, v); setTimeout(updateAll, 60); };
      wrap.appendChild(b);
    });
    host.insertBefore(wrap, input.nextSibling);
  }

  function readRanges() {
    var out = {};
    var inputs = document.querySelectorAll("#root input[type=range]");
    for (var i = 0; i < inputs.length; i++) {
      var el = inputs[i];
      var row = labelRowOf(el);
      if (!row) continue;
      var label = (el.getAttribute("aria-label") || txt(row)).replace(/[\d.\s%px°deg]+$/g, "");
      var unit = "";
      var t = txt(row);
      if (/px/.test(t)) unit = "px"; else if (/%/.test(t)) unit = "%"; else if (/°|deg/.test(t)) unit = "°";
      out[label || ("滑杆" + i)] = el.value + unit;
      var vn = valueNode(row);
      if (vn && !vn.classList.contains("xn-wm-val")) vn.classList.add("xn-wm-val");
      ensureChips(el, row);
    }
    return out;
  }

  function updateBar(vals) {
    var dl = [].slice.call(document.querySelectorAll("#root button")).filter(function (b) { return /下载图片/.test(txt(b)); })[0];
    if (!dl) return;
    var row = dl.parentElement;
    if (!row) return;
    var bar = document.getElementById("xn-wm-setbar");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "xn-wm-setbar";
      bar.className = "xn-wm-setbar";
      row.parentElement.insertBefore(bar, row);
    }
    var order = ["字号", "透明度", "旋转角度"];
    var parts = [];
    order.forEach(function (k) { if (vals[k]) parts.push(k.replace("角度", "") + " " + vals[k]); });
    Object.keys(vals).forEach(function (k) { if (order.indexOf(k) < 0 && parts.length < 5) parts.push(k + " " + vals[k]); });
    var html = '<span class="xn-setlabel">当前设置</span>';
    if (!parts.length) html += "<b>上传图片后调整</b>";
    else html += parts.map(function (p) { return "<b>" + esc(p) + "</b>"; }).join("<span>·</span>");
    if (bar.innerHTML !== html) bar.innerHTML = html;
  }

  function tabs() {
    var anchors = [].slice.call(document.querySelectorAll('#root a[href^="#/"]')).filter(function (a) {
      return /水印|透明/.test(txt(a)) && a.getBoundingClientRect().height > 20;
    });
    if (!anchors.length) return;
    var nav = anchors[0].parentElement;
    if (nav) nav.classList.add("xn-wm-tabs");
  }

  function ranges() {
    var inputs = document.querySelectorAll("#root input[type=range]");
    for (var i = 0; i < inputs.length; i++) {
      var el = inputs[i];
      var label = el.getAttribute("aria-label") || "";
      var unit = label === "透明度" ? "%" : label === "旋转角度" ? "°" : "px";
      var vt = el.value + unit;
      if (el.getAttribute("aria-valuetext") !== vt) el.setAttribute("aria-valuetext", vt);
    }
  }

  function controls() {
    var btns = [].slice.call(document.querySelectorAll("#root button"));
    btns.forEach(function (b) {
      var aria = b.getAttribute("aria-label") || "";
      if (/^(左上|中上|右上|左中|居中|右中|左下|中下|右下)$/.test(aria)) {
        b.classList.add("xn-wm-pos");
        var box = b.parentElement;
        if (box && box.getAttribute("role") !== "group") {
          box.setAttribute("role", "group");
          box.setAttribute("aria-label", "水印位置");
        }
      } else if (/^水印颜色：/.test(aria)) {
        b.classList.add("xn-wm-color");
        var cb = b.parentElement;
        if (cb && cb.getAttribute("role") !== "group") {
          cb.setAttribute("role", "group");
          cb.setAttribute("aria-label", "水印颜色");
        }
      } else if (/下载图片/.test(txt(b))) {
        b.classList.add("xn-wm-primary");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "下载带水印图片");
      } else if (txt(b) === "重置") {
        b.classList.add("xn-wm-ghost");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "重置水印参数");
      }
    });
    [].slice.call(document.querySelectorAll("#root div")).forEach(function (d) {
      if (d.children.length === 1 && /请先上传本地图片/.test(txt(d)) && d.getBoundingClientRect().height > 120) {
        d.classList.add("xn-wm-preview");
      }
    });
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    try { tabs(); ranges(); controls(); } catch (e) {}
    try { updateBar(readRanges()); } catch (e) {}
  }

  var scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(function () { scheduled = false; updateAll(); }, 250);
  }

  function boot() {
    var root = document.getElementById("root");
    if (!root) { setTimeout(boot, 300); return; }
    updateAll();
    new MutationObserver(schedule).observe(root, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["class"] });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
