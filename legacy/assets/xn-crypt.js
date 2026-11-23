/* R1274 文本加解密与哈希合集（sfw5ysy97s）· 人用友好层
 * - 导航/按钮触达放大，口令显示切换补 aria-pressed
 * - 文本域实时字符/字节统计；结果块、计算参数、说明区排版
 */
(function () {
  "use strict";
  if (window.__XN_CRYPT__) return;
  window.__XN_CRYPT__ = true;

  function txt(el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function setAttr(el, k, v) { if (el && el.getAttribute(k) !== v) el.setAttribute(k, v); }
  var applying = false;

  function bytes(s) {
    try { return new TextEncoder().encode(s).length; } catch (e) { return s.length; }
  }

  function updateMeta() {
    var tas = document.querySelectorAll("#root textarea");
    for (var i = 0; i < tas.length; i++) {
      var ta = tas[i];
      var host = ta.parentElement;
      var meta = host && host.querySelector(":scope > .sv-meta");
      if (!meta) continue;
      var v = ta.value || "";
      var html = "字符 <b>" + v.length + "</b> · UTF-8 <b>" + bytes(v) + "</b> 字节";
      var span = meta.firstElementChild;
      if (span && span.innerHTML !== html) span.innerHTML = html;
    }
  }

  function addMeta(ta) {
    var host = ta.parentElement;
    if (!host || host.querySelector(":scope > .sv-meta")) return;
    var m = document.createElement("div");
    m.className = "sv-meta";
    m.innerHTML = "<span></span>";
    host.insertBefore(m, ta.nextSibling);
  }

  function apply() {
    if (applying) return;
    var root = document.getElementById("root");
    if (!root) return;
    applying = true;
    try {
      /* 1) 导航 */
      var links = root.querySelectorAll('nav a[href^="#/"]');
      for (var i = 0; i < links.length; i++) add(links[i], "sv-tab");

      /* 2) 口令显示切换 */
      var btns = root.querySelectorAll("button");
      for (var b = 0; b < btns.length; b++) {
        var bt = btns[b];
        var label = txt(bt) || bt.getAttribute("aria-label") || "";
        if (/显示口令|隐藏口令/.test(label)) {
          add(bt, "sv-eye");
          setAttr(bt, "aria-pressed", /隐藏口令/.test(label) ? "true" : "false");
          setAttr(bt, "aria-label", label);
        }
        if (/^当前：/.test(label)) {
          add(bt, "sv-case");
          setAttr(bt, "aria-pressed", /小写/.test(label) ? "true" : "false");
          setAttr(bt, "aria-label", "摘要大小写：" + (/小写/.test(label) ? "小写" : "大写") + "（点击切换）");
        }
        if (/^复制/.test(label)) {
          add(bt, "sv-copy");
          setAttr(bt, "aria-label", label);
        }
      }

      /* 3) 口令输入语义 */
      var pws = root.querySelectorAll('input[type="password"]');
      for (var p = 0; p < pws.length; p++) {
        var box = pws[p].parentElement;
        var lb = box && box.parentElement ? box.parentElement.querySelector("label") : null;
        if (lb && !pws[p].getAttribute("aria-label")) setAttr(pws[p], "aria-label", txt(lb));
      }

      /* 4) 文本域计数 */
      var tas = root.querySelectorAll("textarea");
      for (var t = 0; t < tas.length; t++) addMeta(tas[t]);
      updateMeta();

      /* 5) 结果输出块 */
      var outs = root.querySelectorAll('.max-h-72, div[class*="bg-slate-900"]');
      for (var o = 0; o < outs.length; o++) {
        if (outs[o].querySelector("textarea")) continue;
        add(outs[o], "sv-out");
      }

      /* 6) 计算参数块 */
      var grids = root.querySelectorAll("div.grid");
      for (var g = 0; g < grids.length; g++) {
        var s = txt(grids[g]);
        if (/摘要长度|输出格式|迭代次数/.test(s) && /编码方式|输出格式|密钥长度/.test(s)) add(grids[g], "sv-params");
      }

      /* 7) 使用说明 / 安全提示 */
      var h2s = root.querySelectorAll("h2");
      for (var h = 0; h < h2s.length; h++) {
        if (txt(h2s[h]) === "使用说明") {
          var sec = h2s[h].closest("section") || h2s[h].parentElement.parentElement;
          if (sec) add(sec, "sv-guide");
        }
      }
      var divs = root.querySelectorAll("div");
      for (var d = 0; d < divs.length; d++) {
        var t2 = txt(divs[d]);
        if (t2.length < 260 && /^安全提示/.test(t2) && /amber/.test(String(divs[d].className))) add(divs[d], "sv-safety");
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
  document.addEventListener("input", function () { setTimeout(updateMeta, 80); }, true);
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
