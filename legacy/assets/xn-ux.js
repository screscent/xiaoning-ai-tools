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
    "WebP": "体积更小，兼容现代浏览器"
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

  function enhanceButtons() {
    var list = document.querySelectorAll("#root button");
    for (var i = 0; i < list.length; i++) {
      var b = list[i];
      var t = text(b);
      if (TITLES[t] && !b.title) b.title = TITLES[t];

      var parent = b.parentElement;
      if (!parent) continue;
      if (b.disabled) {
        if (!parent.querySelector(".xn-hint")) {
          var hint = document.createElement("div");
          hint.className = "xn-hint";
          if (/下载/.test(t)) hint.textContent = "上传图片并调整裁剪区域后即可下载";
          else if (/生成|开始/.test(t)) hint.textContent = "填写上方信息后即可开始";
          else hint.textContent = "完成上方填写后即可使用";
          parent.appendChild(hint);
        }
      } else if (!parent.querySelector("button:disabled")) {
        var old = parent.querySelector(".xn-hint");
        if (old) old.remove();
      }
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
