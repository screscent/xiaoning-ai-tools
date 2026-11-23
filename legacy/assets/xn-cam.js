/* R1262 相机曝光与图片体积合集（dzff47slwd）· 人用友好层 */
(function () {
  "use strict";
  function txt(el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function del(el, c) { if (el && el.classList.contains(c)) el.classList.remove(c); }
  function setAttr(el, k, v) { if (el && el.getAttribute(k) !== v) el.setAttribute(k, v); }
  var applying = false;

  function apply() {
    if (applying) return;
    var root = document.getElementById("root");
    if (!root) return;
    applying = true;
    try {
      /* 1) 工具入口卡 */
      var cards = root.querySelectorAll('a[href^="#/"]');
      for (var i = 0; i < cards.length; i++) {
        var a = cards[i];
        add(a, "xn-cam-tool");
        if (/ring-2/.test(String(a.className)) || /border-blue-300/.test(String(a.className))) add(a, "xn-cam-on");
        else del(a, "xn-cam-on");
      }

      /* 2) 工具区 */
      var secs = root.querySelectorAll("section");
      for (var s = 0; s < secs.length; s++) {
        if (secs[s].querySelector("h2")) add(secs[s], "xn-cam-sec");
      }

      /* 3) 结果卡 / 大数字 / 单位 / 统计块 */
      var divs = root.querySelectorAll("div");
      for (var d = 0; d < divs.length; d++) {
        var el = divs[d];
        var cls = String(el.className);
        if (cls.indexOf("bg-slate-50/70") >= 0) add(el, "xn-cam-result");
        if (cls.indexOf("bg-white rounded-lg border") >= 0 && el.querySelector(".text-xs")) add(el, "xn-cam-stat");
      }

      var spans = root.querySelectorAll("span");
      for (var n = 0; n < spans.length; n++) {
        var sp = spans[n];
        var sc = String(sp.className);
        if (sc.indexOf("text-3xl") >= 0) { add(sp, "xn-cam-big"); continue; }
        if (sc.indexOf("text-sm") >= 0 && sp.parentElement && sp.parentElement.querySelector && sp.parentElement.querySelector(".xn-cam-big")) {
          if (txt(sp).length <= 4) add(sp, "xn-cam-unit");
        }
      }

      var stats = root.querySelectorAll('div[class*="text-lg"]');
      for (var v = 0; v < stats.length; v++) add(stats[v], "xn-cam-statval");

      /* 4) 上传区 */
      var labels = root.querySelectorAll("label");
      for (var l = 0; l < labels.length; l++) {
        var lb = labels[l];
        if (lb.getAttribute("aria-label") === "选择图片" || /border-dashed/.test(String(lb.className))) add(lb, "xn-cam-drop");
        if (!lb.getAttribute("aria-label") && lb.querySelector('input[type="file"]')) setAttr(lb, "aria-label", "选择图片");
      }

      /* 5) 标题去序号 */
      var h2s = root.querySelectorAll("h2");
      for (var z = 0; z < h2s.length; z++) {
        var raw = txt(h2s[z]);
        var clean = raw.replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "").replace(/^工具[A-Z]\s*/, "");
        if (clean !== raw && clean) h2s[z].textContent = clean;
      }

      /* 6) 兜底可访问名 */
      var anon = 0;
      var bs = root.querySelectorAll("button");
      for (var b = 0; b < bs.length; b++) {
        if (bs[b].getAttribute("aria-label") || txt(bs[b])) continue;
        anon += 1;
        setAttr(bs[b], "aria-label", "按钮 " + anon);
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
  document.addEventListener("input", function () { setTimeout(apply, 90); }, true);
  document.addEventListener("change", function () { setTimeout(apply, 90); }, true);
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
