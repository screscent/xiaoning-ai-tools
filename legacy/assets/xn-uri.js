/* R1265 URL 编解码与参数解析合集（frnp3wgsra）· 人用友好层 */
(function () {
  "use strict";
  function txt(el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function setAttr(el, k, v) { if (el && el.getAttribute(k) !== v) el.setAttribute(k, v); }
  var applying = false;

  function apply() {
    if (applying) return;
    var root = document.getElementById("root");
    if (!root) return;
    applying = true;
    try {
      var TOOL_RE = /^(?:[①②③④⑤⑥⑦⑧⑨⑩]\s*)?(URL 编解码|Base32|参数拆分|编码对比|Base58)$/;

      /* 1) 工具 tab：去序号 + 状态 */
      var btns = root.querySelectorAll("button");
      var firstTool = null;
      for (var i = 0; i < btns.length; i++) {
        var b = btns[i];
        var s = txt(b);
        if (TOOL_RE.test(s)) {
          if (!firstTool) firstTool = b;
          add(b, "xn-uri-tool");
          setAttr(b, "aria-pressed", /bg-blue-500/.test(String(b.className)) ? "true" : "false");
          var clean = s.replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "");
          if (clean !== s && clean) b.textContent = clean;
          continue;
        }
        /* 2) 动作按钮优先于 chip */
        if (s === "处理") { add(b, "xn-uri-primary"); continue; }
        if (s === "示例") { add(b, "xn-uri-small"); continue; }
        if (s === "复制") { add(b, "xn-uri-copy"); continue; }
        var cls = String(b.className);
        if (cls.indexOf("px-3 py-1.5") >= 0 && cls.indexOf("rounded-lg") >= 0) {
          add(b, "xn-uri-chip");
          setAttr(b, "aria-pressed", /bg-blue-500/.test(cls) ? "true" : "false");
        }
      }
      if (firstTool && firstTool.parentElement) add(firstTool.parentElement, "xn-uri-tabs");

      /* 3) 结果卡 / 表格 */
      var divs = root.querySelectorAll("div");
      for (var d = 0; d < divs.length; d++) {
        var el = divs[d];
        var ec = String(el.className);
        if (ec.indexOf("rounded-xl") >= 0 && ec.indexOf("border") >= 0 && el.querySelector("h3")) add(el, "xn-uri-card");
      }
      var tas = root.querySelectorAll("textarea");
      for (var a = 0; a < tas.length; a++) {
        if (!tas[a].getAttribute("aria-label")) {
          setAttr(tas[a], "aria-label", tas[a].getAttribute("placeholder") || "输入文本");
        }
      }

      /* 4) 标题去序号 / 工具字母 */
      var h2s = root.querySelectorAll("h2");
      for (var z = 0; z < h2s.length; z++) {
        var raw = txt(h2s[z]);
        var hc = raw.replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "").replace(/^工具[A-Z]\s*/, "");
        if (hc !== raw && hc) h2s[z].textContent = hc;
      }

      /* 5) 兜底可访问名 */
      var anon = 0;
      var bs = root.querySelectorAll("button");
      for (var q = 0; q < bs.length; q++) {
        if (bs[q].getAttribute("aria-label") || txt(bs[q])) continue;
        anon += 1;
        setAttr(bs[q], "aria-label", "按钮 " + anon);
      }
    } finally {
      applying = false;
    }
  }

  apply();
  setTimeout(apply, 300);
  setTimeout(apply, 900);
  setTimeout(apply, 1800);
  window.addEventListener("hashchange", function () { setTimeout(apply, 120); });
  document.addEventListener("click", function () { setTimeout(apply, 60); setTimeout(apply, 260); setTimeout(apply, 700); }, true);
  document.addEventListener("input", function () { setTimeout(apply, 100); }, true);
  var rootEl = document.getElementById("root");
  if (rootEl && window.MutationObserver) {
    var timer = null;
    new MutationObserver(function () {
      if (applying) return;
      clearTimeout(timer);
      timer = setTimeout(apply, 140);
    }).observe(rootEl, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  }
})();
