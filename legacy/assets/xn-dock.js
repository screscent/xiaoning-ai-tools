/* R1271 Docker 命令与实战速查（ekrwstvhte）· 人用友好层
 * - 分类导航/标题归一、命令行字号与复制按钮放大
 * - 检索结果计数 + 空状态 + 一键清空
 * - Compose 步进/删除/重置按钮触达放大
 */
(function () {
  "use strict";
  if (window.__XN_DOCK__) return;
  window.__XN_DOCK__ = true;

  function txt(el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function setAttr(el, k, v) { if (el && el.getAttribute(k) !== v) el.setAttribute(k, v); }
  function visible(el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; }
  var applying = false;

  function tidyTitle(s) {
    s = s.replace(/^工具([A-F])\s*/, function (_, l) { return "工具 0" + (l.charCodeAt(0) - 64) + " · "; });
    s = s.replace(/^([^·]{1,12})·\s*/, "$1 · ");
    return s;
  }

  function cmdText(pre) {
    var s = txt(pre).replace(/^\$\s*/, "");
    return s.length > 52 ? s.slice(0, 52) + "…" : s;
  }

  /* ---------- 检索计数 / 空状态 ---------- */
  function searchBox() {
    return document.querySelector("#root input.dk-search");
  }

  function ensureHint() {
    var inp = searchBox();
    if (!inp) return null;
    var box = inp.closest(".dk-searchbox") || inp.parentElement;
    var outer = box && box.parentElement;
    if (!box || !outer) return null;
    var hint = outer.querySelector(".dk-hint");
    if (!hint) {
      hint = document.createElement("div");
      hint.className = "dk-hint";
      outer.insertBefore(hint, box.nextSibling);
    }
    return hint;
  }

  function updateSearch() {
    var inp = searchBox();
    var hint = ensureHint();
    if (!inp || !hint) return;
    if (!visible(inp)) { hint.style.display = "none"; return; }
    hint.style.display = "";
    var total = 0;
    var pres = document.querySelectorAll("#root pre.dk-pre");
    for (var i = 0; i < pres.length; i++) if (visible(pres[i])) total += 1;
    var q = (inp.value || "").trim();
    var body;
    if (q && total === 0) {
      body = '<span class="dk-empty">没有匹配的命令，试试更短的关键词（如 run / volume）</span>';
    } else if (q) {
      body = "匹配 <b>" + total + "</b> 条命令（关键词：" + q.replace(/[&<>"]/g, "") + "）";
    } else {
      body = "共 <b>" + total + "</b> 条命令 · 输入关键词即时筛选";
    }
    var html = "<span>" + body + "</span>" + (q ? '<button type="button" class="dk-clear">清空搜索</button>' : "");
    if (hint.innerHTML !== html) {
      hint.innerHTML = html;
      var clr = hint.querySelector(".dk-clear");
      if (clr) clr.onclick = function () {
        var live = document.querySelector("#root input.dk-search");
        if (!live) return;
        var setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
        setter.set.call(live, "");
        live.dispatchEvent(new Event("input", { bubbles: true }));
        live.dispatchEvent(new Event("change", { bubbles: true }));
        try { live.focus(); } catch (e) {}
        setTimeout(updateSearch, 120);
        setTimeout(updateSearch, 400);
      };
    }
  }

  function apply() {
    if (applying) return;
    var root = document.getElementById("root");
    if (!root) return;
    applying = true;
    try {
      /* 1) 分类导航 */
      var navs = root.querySelectorAll('nav a[href^="#/"]');
      for (var i = 0; i < navs.length; i++) add(navs[i], "dk-nav");

      /* 2) 标题归一 */
      var h2s = root.querySelectorAll("h2");
      for (var z = 0; z < h2s.length; z++) {
        var raw = txt(h2s[z]);
        var t = tidyTitle(raw);
        if (t && t !== raw) h2s[z].textContent = t;
      }

      /* 3) 命令卡 / 代码块 / 复制按钮 */
      var pres = root.querySelectorAll("pre");
      for (var p = 0; p < pres.length; p++) {
        var pre = pres[p];
        add(pre, "dk-pre");
        var card = pre.parentElement && pre.parentElement.parentElement;
        if (card) add(card, "dk-cmd");
      }
      var btns = root.querySelectorAll("button");
      for (var b = 0; b < btns.length; b++) {
        var bt = btns[b];
        var label = txt(bt);
        if (/^复制/.test(label) || bt.getAttribute("aria-label") === "复制") {
          add(bt, "dk-copy");
          if (!label) add(bt, "dk-gen");
          var pre2 = bt.parentElement && bt.parentElement.querySelector("pre");
          if (pre2) setAttr(bt, "aria-label", "复制命令：" + cmdText(pre2));
          else if (!bt.getAttribute("aria-label")) setAttr(bt, "aria-label", "复制");
        }
        if (bt.getAttribute("aria-label") && /服务/.test(bt.getAttribute("aria-label"))) add(bt, "dk-step");
        if (label === "删除") add(bt, "dk-del");
        if (/^重置/.test(label)) add(bt, "dk-reset");
      }

      /* 4) 检索框 + 计数 */
      var search = root.querySelector('input[placeholder*="检索"]');
      if (search) {
        add(search, "dk-search");
        var sb = search.parentElement;
        if (sb) add(sb, "dk-searchbox");
        updateSearch();
      }

      /* 5) Compose / 清理卡片 */
      var secs = root.querySelectorAll("section,div.rounded-xl,div.rounded-2xl");
      for (var s = 0; s < secs.length; s++) {
        var sec = secs[s];
        if (sec.querySelector("pre")) add(sec, "dk-card");
        if (sec.querySelector('input') && sec.querySelector("label")) {
          add(sec, "dk-compose");
          var grids = sec.querySelectorAll("div.grid");
          for (var gi = 0; gi < grids.length; gi++) {
            if (grids[gi].querySelector("input")) add(grids[gi], "dk-fields");
          }
          var preY = sec.querySelector("pre");
          if (preY) add(preY, "dk-yaml");
          var lbls = sec.querySelectorAll("label");
          for (var li = 0; li < lbls.length; li++) {
            if (/环境变量/.test(txt(lbls[li]))) add(lbls[li], "dk-span2");
          }
        }
      }

      /* 6) 危险提示 */
      var ps = root.querySelectorAll(".dk-cmd p, .dk-cmd li");
      for (var w = 0; w < ps.length; w++) {
        if (/^⚠|^危险/.test(txt(ps[w]))) add(ps[w], "dk-warn");
      }

      /* 6) 清理估算数字字段 */
      var labels = root.querySelectorAll("label");
      for (var l = 0; l < labels.length; l++) {
        if (!/镜像数|容器数|卷数/.test(txt(labels[l]))) continue;
        var box = labels[l].parentElement;
        if (box) add(box, "dk-num");
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
  document.addEventListener("input", function () {
    setTimeout(function () { updateSearch(); }, 80);
  }, true);
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
