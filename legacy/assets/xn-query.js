/* R1267 SQL 格式化与缩进规范合集（ija4mt8zig）· 人用友好层 */
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
      /* 1) 模式按钮 / 开关 / 动作按钮 */
      var btns = root.querySelectorAll("button");
      for (var b = 0; b < btns.length; b++) {
        var bt = btns[b];
        var s = txt(bt);
        var cls = String(bt.className);

        if (/^(?:[①②]\s*)?(SQL 格式化|缩进规范)$/.test(s)) {
          add(bt, "xn-sql-mode");
          setAttr(bt, "aria-pressed", /bg-blue-50/.test(cls) ? "true" : "false");
          var clean = s.replace(/^[①②]\s*/, "");
          if (clean !== s && clean) bt.textContent = clean;
          continue;
        }
        if (/^[开关]（/.test(s)) {
          add(bt, "xn-sql-toggle");
          setAttr(bt, "aria-pressed", /bg-blue-50/.test(cls) ? "true" : "false");
          continue;
        }
        if (s === "格式化" || s === "规范") { add(bt, "xn-sql-primary"); continue; }
        if (s === "清空") { add(bt, "xn-sql-danger"); continue; }
        if (s === "压缩成单行" || s === "复制压缩结果" || s === "复制" || s === "复制结果") { add(bt, "xn-sql-secondary"); continue; }
      }

      /* 2) 结果卡 / 统计块 */
      var divs = root.querySelectorAll("div,section");
      for (var d = 0; d < divs.length; d++) {
        var el = divs[d];
        var ec = String(el.className);
        if (ec.indexOf("rounded-xl") >= 0 && ec.indexOf("border") >= 0 && el.querySelector("h3")) add(el, "xn-sql-card");
        if (ec.indexOf("rounded-lg") >= 0 && ec.indexOf("bg-slate-50") >= 0 && el.querySelectorAll("span").length === 2) {
          add(el, "xn-sql-stat");
          var spans = el.querySelectorAll("span");
          add(spans[1], "xn-sql-statnum");
        }
      }

      /* 3) 输入兜底名称 */
      var tas = root.querySelectorAll("textarea");
      for (var t = 0; t < tas.length; t++) {
        var cur = tas[t].getAttribute("aria-label") || "";
        if (tas[t].id === "indent-input") setAttr(tas[t], "aria-label", "SQL 文本（缩进规范）");
        else if (!cur || cur.length < 3) setAttr(tas[t], "aria-label", "SQL 文本");
      }
      var sels = root.querySelectorAll("select");
      for (var s2 = 0; s2 < sels.length; s2++) {
        if (!sels[s2].getAttribute("aria-label")) {
          var lb = sels[s2].parentElement && sels[s2].parentElement.querySelector("label");
          setAttr(sels[s2], "aria-label", lb ? txt(lb) : "选项");
        }
      }

      /* 4) 兜底可访问名 */
      var anon = 0;
      for (var q = 0; q < btns.length; q++) {
        if (btns[q].getAttribute("aria-label") || txt(btns[q])) continue;
        anon += 1;
        setAttr(btns[q], "aria-label", "按钮 " + anon);
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
