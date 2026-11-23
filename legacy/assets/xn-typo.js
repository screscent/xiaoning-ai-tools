/* xn-typo.js · 字体/渐变合集：模式 aria-pressed / 开关 / 按钮层级（幂等） */
(function () {
  if (window.__XN_TYPO__) return;
  window.__XN_TYPO__ = 1;

  var root = null;

  function pick() {
    root = document.querySelector("#root");
    return !!root;
  }

  function decorate() {
    if (!root) return;
    var btns = root.querySelectorAll("button");
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      var text = (b.textContent || "").replace(/\s+/g, " ").trim();
      // 模式切换
      if (/^字体排版$|^渐变生成$/.test(text)) {
        var on = /bg-blue-600/.test(b.className);
        var want = on ? "true" : "false";
        if (b.getAttribute("aria-pressed") !== want) b.setAttribute("aria-pressed", want);
        if (on) {
          if (b.classList.contains("px-mode-off")) b.classList.remove("px-mode-off");
        } else if (!b.classList.contains("px-mode-off")) {
          b.classList.add("px-mode-off");
        }
        continue;
      }
      // 开关行：内部开关 span 的底色判断状态
      if (text === "关" || text === "开") {
        if (!b.classList.contains("px-switch")) b.classList.add("px-switch");
        var sw = b.querySelector('span[class*="rounded-full"]');
        var enabled = !!(sw && /bg-blue-/.test(sw.className));
        var wp = enabled ? "true" : "false";
        if (b.getAttribute("aria-pressed") !== wp) b.setAttribute("aria-pressed", wp);
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "输出 CSS 变量");
        continue;
      }
      // 预设 chip（12px 小按钮）
      if (!b.classList.contains("px-chip")) {
        var fs = parseFloat(getComputedStyle(b).fontSize) || 16;
        if (fs <= 12.5 && text.length > 2 && !/w-full/.test(b.className)) b.classList.add("px-chip");
      }
      // 主/次行动
      if (/^生成字阶表$|^生成渐变$|^复制 CSS$/i.test(text)) b.classList.add("px-primary");
      if (/^复制结果$|^清空$/.test(text)) b.classList.add("px-sub");
      if (!b.getAttribute("aria-label") && text) b.setAttribute("aria-label", text);
    }
  }

  function start() {
    if (!pick()) return;
    decorate();
    var mo = new MutationObserver(function () { decorate(); });
    mo.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(start, 60); });
  } else {
    setTimeout(start, 60);
  }
})();
