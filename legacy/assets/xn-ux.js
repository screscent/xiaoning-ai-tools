/* 小凝工具站 · 通用 UX 增强 v1（渐进增强，不改业务逻辑）
 * 能力：输入可读标签 / 数字预设与单位提示 / 禁用态说明 / 比例按钮释义 / 小字号兜底
 * 注入：scripts/legacy_ux_inject.py 追加 <script src="./assets/xn-ux.js" defer>
 */
(function () {
  "use strict";
  if (window.__XN_UX_LOADED__) return;
  window.__XN_UX_LOADED__ = true;

  var TITLES = {
    "1:1": "正方形，适合头像与封面",
    "4:3": "相机横图，适合照片",
    "16:9": "宽屏比例，适合视频与壁纸",
    "3:2": "照片冲印常用比例",
    "自由": "手动输入宽高",
    "居中": "裁剪框放在图片中央",
    "左上": "裁剪框贴左上角",
    "右下": "裁剪框贴右下角",
    "PNG": "无损，适合图标与透明背景",
    "JPEG": "体积小，适合照片",
    "JPG": "体积小，适合照片；不支持透明背景",
    "WebP": "体积更小，兼容现代浏览器",
    "高": "画质优先，文件较大，适合需要清晰细节的图片",
    "中": "画质与体积平衡，日常推荐",
    "低": "体积最小，画质损失较明显，适合快速分享",
    "原尺寸": "保持图片原始像素尺寸，不做缩放",
    "1920px": "长边缩到 1920px，适合网页与社交分享",
    "1280px": "长边缩到 1280px，适合文章配图",
    "800px": "长边缩到 800px，适合缩略图与消息预览",
    "压缩图片": "单张压缩：调质量、最长边与格式",
    "批量处理": "一次拖入多张，统一参数批量压缩",
    "前后对比": "左右对比压缩前后体积与画质",
    "画质取舍": "不同画质档位的体积与清晰度参考",
    "尺寸缩放与限制": "按长边缩放，控制最大尺寸",
    "格式选择": "JPG / PNG / WebP 格式差异与选择建议"
  };

  function text(el) {
    return (el && (el.textContent || "").trim()) || "";
  }

  function fieldLabel(input) {
    var box = input.closest("div.space-y-2") || input.parentElement;
    if (!box) return "";
    var sp = box.querySelector("span, label");
    return text(sp).slice(0, 20);
  }

  function setValue(input, value) {
    var proto = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    var setter = Object.getOwnPropertyDescriptor(proto, "value").set;
    setter.call(input, String(value));
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function enhanceInputs() {
    var nodes = document.querySelectorAll("#root input, #root select, #root textarea");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var label = fieldLabel(el);
      if (label && !el.getAttribute("aria-label")) el.setAttribute("aria-label", label);

      if (el.type === "number") {
        el.setAttribute("inputmode", "decimal");
        if (!el.title) el.title = "可直接输入，或用右侧箭头微调";
        var max = parseFloat(el.max || "0");
        var isSize = /宽|高|尺寸|像素/.test(label);
        var box = el.closest("div.space-y-2");
        if (isSize && max >= 1000 && box && !box.querySelector(".xn-presets")) {
          var wrap = document.createElement("div");
          wrap.className = "xn-presets";
          [800, 1200, 1600, 2048].forEach(function (v) {
            var b = document.createElement("button");
            b.type = "button";
            b.textContent = v + " px";
            b.addEventListener("click", function () { setValue(el, v); });
            wrap.appendChild(b);
          });
          box.appendChild(wrap);
        }
      }
    }
  }

  function enhanceSelects() {
    var list = document.querySelectorAll("#root select");
    for (var i = 0; i < list.length; i++) {
      var sel = list[i];
      for (var j = 0; j < sel.options.length; j++) {
        var o = sel.options[j];
        var t = (o.textContent || "").trim();
        if (TITLES[t] && !o.title) o.title = TITLES[t];
      }
    }
  }

  function groupLabel(btn) {
    var row = btn.parentElement;
    if (!row) return "";
    var prev = row.previousElementSibling;
    if (prev) {
      var pt = text(prev);
      if (pt && pt.length <= 12) return pt;
    }
    var gp = row.parentElement;
    if (gp) {
      var kids = gp.children;
      for (var i = 0; i < kids.length; i++) {
        var k = kids[i];
        if (k === row) continue;
        if (k.querySelector && k.querySelector("button")) continue;
        var kt = text(k);
        if (kt && kt.length <= 12) return kt;
      }
    }
    return "";
  }

  function enhanceButtons() {
    var list = document.querySelectorAll("#root button");
    for (var i = 0; i < list.length; i++) {
      var b = list[i];
      var t = text(b);
      if (TITLES[t] && !b.title) b.title = TITLES[t];

      if (b.hasAttribute("aria-pressed")) {
        var gl = groupLabel(b);
        if (gl && !b.getAttribute("aria-label")) b.setAttribute("aria-label", gl + "：" + t);
      }

      var parent = b.parentElement;
      if (!parent) continue;
      var cs = window.getComputedStyle(parent);
      var hintHost = (cs.display.indexOf("flex") === 0 && cs.flexDirection.indexOf("row") === 0)
        ? parent.parentElement || parent
        : parent;
      if (b.disabled) {
        if (!hintHost.querySelector(".xn-hint")) {
          var hint = document.createElement("div");
          hint.className = "xn-hint";
          if (/下载/.test(t)) hint.textContent = "上传图片并调整裁剪区域后即可下载";
          else if (document.querySelector('#root input[type=file], #root label[class*="border-dashed"]')) {
            hint.textContent = "先点击上方虚线区域选择文件，选好后即可开始";
            hint.style.textAlign = "left";
          } else if (/生成|开始/.test(t)) hint.textContent = "填写上方信息后即可开始";
          else hint.textContent = "完成上方填写后即可使用";
          hintHost.appendChild(hint);
        }
      } else if (!parent.querySelector("button:disabled")) {
        var old = hintHost.querySelector(".xn-hint");
        if (old) old.remove();
      }
    }
  }

  function enhanceUploads() {
    var zones = document.querySelectorAll('#root label[class*="border-dashed"]');
    for (var i = 0; i < zones.length; i++) {
      var z = zones[i];
      if (!z.getAttribute("aria-label")) z.setAttribute("aria-label", text(z).slice(0, 80) || "选择文件");
    }
    var links = document.querySelectorAll('#root a[class*="shrink-0"]');
    for (var j = 0; j < links.length; j++) {
      var a = links[j];
      var at = text(a);
      if (TITLES[at] && !a.title) a.title = TITLES[at];
    }
  }

  function tuneSmallFont() {
    var els = document.querySelectorAll("#root span, #root p, #root li, #root td, #root small");
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.classList.contains("xn-presets") || el.closest(".xn-presets")) continue;
      if (el.dataset.xnFs) continue;
      if (!text(el)) continue;
      var fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs > 0 && fs < 11.5) {
        el.style.fontSize = "12px";
        el.dataset.xnFs = "1";
      }
    }
  }

  var scheduled = false;
  function enhanceAll() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(function () {
      scheduled = false;
      try {
        enhanceInputs();
        enhanceSelects();
        enhanceButtons();
        enhanceUploads();
        tuneSmallFont();
      } catch (e) {
        /* 静默：增强失败不影响原功能 */
      }
    });
  }

  function boot() {
    var root = document.getElementById("root");
    if (!root) {
      setTimeout(boot, 300);
      return;
    }
    enhanceAll();
    var obs = new MutationObserver(function () { enhanceAll(); });
    obs.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["class", "disabled", "aria-disabled"]
    });
    window.addEventListener("resize", enhanceAll);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
