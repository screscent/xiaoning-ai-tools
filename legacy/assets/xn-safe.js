/* R1275 密码与账号安全合集（uidlsfxjku）· 人用友好层
 * - 6 个工具 3×2 网格导航、44px 与 aria-current
 * - 滑杆/复选行/按钮触达放大；弱/中/强徽标、分段强度条、指标卡
 * - 密码与备份码输出大号等宽显示
 */
(function () {
  "use strict";
  if (window.__XN_SAFE__) return;
  window.__XN_SAFE__ = true;

  function txt(el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function setAttr(el, k, v) { if (el && el.getAttribute(k) !== v) el.setAttribute(k, v); }
  function vis(el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; }
  var applying = false;

  var CHIPS = /^(短信验证码|认证器 App|硬件密钥|邮箱|网银|社交|工作系统|购物)$/;
  var LEVELS = { "很弱": "weak", "弱": "weak", "中等": "mid", "中": "mid", "强": "good", "很强": "good", "非常强": "good" };

  function apply() {
    if (applying) return;
    var root = document.getElementById("root");
    if (!root) return;
    applying = true;
    try {
      /* 1) 工具导航 */
      var first = root.querySelector('a[href="#/password"]');
      var tabs = first && first.parentElement;
      if (tabs) {
        add(tabs, "sv-tabs");
        var links = tabs.querySelectorAll("a");
        for (var i = 0; i < links.length; i++) {
          var cls = String(links[i].className);
          if (/bg-blue-600|bg-indigo-600|bg-emerald-600/.test(cls)) setAttr(links[i], "aria-current", "page");
          else links[i].removeAttribute("aria-current");
        }
      }

      /* 2) 复选行 */
      var rows = root.querySelectorAll("label");
      for (var r = 0; r < rows.length; r++) {
        if (rows[r].querySelector('input[type="checkbox"]')) add(rows[r], "sv-row");
      }

      /* 3) 按钮：复制 / 胶囊 / 长文本操作 */
      var btns = root.querySelectorAll("section button");
      for (var b = 0; b < btns.length; b++) {
        var bt = btns[b];
        var label = txt(bt);
        if (/^复制/.test(label)) add(bt, "sv-copy");
        if (CHIPS.test(label.replace(/\s+/g, " "))) {
          add(bt, "sv-chip");
          setAttr(bt, "aria-pressed", /bg-(blue|indigo|emerald)-600/.test(String(bt.className)) ? "true" : "false");
        }
        if (label.length >= 14 && !/^复制/.test(label) && !CHIPS.test(label)) add(bt, "sv-act");
      }

      /* 4) 强度评估 */
      var strH = document.getElementById("tool-strength");
      var sec = strH && strH.closest("section");
      if (sec) {
        var spans = sec.querySelectorAll("span, div");
        for (var s = 0; s < spans.length; s++) {
          var tx = txt(spans[s]);
          if (spans[s].children.length || !LEVELS[tx]) continue;
          add(spans[s], "sv-verdict");
          setAttr(spans[s], "data-level", LEVELS[tx]);
        }
        /* 指标 */
        var metricRow = null;
        var flexes = sec.querySelectorAll("div.flex.flex-wrap");
        for (var f = 0; f < flexes.length; f++) {
          if (/长度/.test(txt(flexes[f])) && /熵值/.test(txt(flexes[f]))) metricRow = flexes[f];
        }
        if (metricRow) {
          for (var m = 0; m < metricRow.children.length; m++) add(metricRow.children[m], "sv-metric");
        }
        /* 分段强度条 */
        var bars = sec.querySelectorAll("div");
        for (var d = 0; d < bars.length; d++) {
          var kids = bars[d].children;
          if (kids.length >= 4 && /rounded/.test(String(kids[0].className)) && !txt(kids[0])) {
            add(bars[d], "sv-bar");
            break;
          }
        }
        /* 建议列表 */
        var uls = sec.querySelectorAll("ul");
        for (var u = 0; u < uls.length; u++) add(uls[u], "sv-tips");
      }
    } finally {
      applying = false;
    }
  }

  apply();
  setTimeout(apply, 300);
  setTimeout(apply, 900);
  setTimeout(apply, 1800);
  window.addEventListener("hashchange", function () { setTimeout(apply, 120); setTimeout(apply, 500); });
  document.addEventListener("click", function () { setTimeout(apply, 60); setTimeout(apply, 300); }, true);
  document.addEventListener("input", function () { setTimeout(apply, 120); }, true);
  var rootEl = document.getElementById("root");
  if (rootEl && window.MutationObserver) {
    var timer = null;
    new MutationObserver(function () {
      if (applying) return;
      clearTimeout(timer);
      timer = setTimeout(apply, 160);
    }).observe(rootEl, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  }
})();
