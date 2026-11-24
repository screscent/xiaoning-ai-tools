/* 小凝工具站 · ICO 图标与多尺寸打包增强 xn-ico v1
 * 能力：两个工具标签 44h + aria-pressed/aria-label；标题「①/② · 名称」并跟随切换；
 *      尺寸复选框 20px；下拉 48/16；文件选择 44h；添加/下载/重置 44h + aria。
 * 注入：legacy/r3ar3ezjyr.html 的 </body> 前追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_ICO__) return;
  window.__XN_ICO__ = true;

  var SYM = ["①", "②"];
  var NAMES = ["单图转 ICO", "多尺寸打包"];

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  function tabs() {
    return Array.prototype.filter.call(document.querySelectorAll("#root button"), function (b) {
      return vis(b) && /^[①②]/.test((b.textContent || "").trim());
    });
  }

  function activeIdx(list) {
    for (var i = 0; i < list.length; i++) {
      if (/border-sky-500/.test(list[i].className)) return i;
    }
    return 0;
  }

  function markTabs() {
    var list = tabs();
    if (!list.length) return;
    var idx = activeIdx(list);
    list.forEach(function (b, i) {
      b.classList.add("xn-ic-tab");
      var cur = i === idx ? "true" : "false";
      if (b.getAttribute("aria-pressed") !== cur) b.setAttribute("aria-pressed", cur);
      var label = "切换到工具" + (i + 1) + "：" + NAMES[i] + (i === idx ? "（当前）" : "");
      if (b.getAttribute("aria-label") !== label) b.setAttribute("aria-label", label);
    });
  }

  function markH2() {
    var idx = activeIdx(tabs());
    var want = SYM[idx] + " · " + NAMES[idx];
    /* 页面切换会重建 h2，可能同时存在多个：全部按当前索引重写 */
    Array.prototype.forEach.call(document.querySelectorAll("#root h2"), function (h2) {
      var t = (h2.textContent || "").trim();
      /* 只改工具标题（以 ① / ② 开头），保留「生成结果」等小节标题 */
      if (!/^[①②③④⑤⑥⑦⑧⑨]/.test(t)) return;
      if (t !== want) h2.textContent = want;
    });
  }

  function markFile() {
    Array.prototype.forEach.call(document.querySelectorAll('#root input[type="file"]'), function (f) {
      var lab = f.closest("label");
      if (lab) lab.classList.add("xn-ic-file");
      var id = f.getAttribute("id");
      if (id) {
        var byFor = document.querySelector('#root label[for="' + id + '"]');
        if (byFor) byFor.classList.add("xn-ic-file");
      }
    });
    Array.prototype.forEach.call(document.querySelectorAll("#root label"), function (lab) {
      if (!vis(lab)) return;
      if (/选择图片/.test(lab.textContent || "")) lab.classList.add("xn-ic-file");
    });
  }

  function markButtons() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b) || b.classList.contains("xn-ic-tab")) return;
      var t = (b.textContent || "").replace(/\s+/g, "").trim();
      if (!t) return;
      var label = (b.textContent || "").replace(/\s+/g, " ").trim();
      if (/^(下载)/.test(t)) {
        b.classList.add("xn-ic-run");
        if (b.getAttribute("aria-label") !== label) b.setAttribute("aria-label", label);
        return;
      }
      if (/^(重置|清空|选择图片)/.test(t)) {
        b.classList.add("xn-ic-act");
        if (b.getAttribute("aria-label") !== label) b.setAttribute("aria-label", label);
        return;
      }
      if (/^(添加|使用示例|示例)/.test(t)) {
        b.classList.add("xn-ic-mini");
        if (b.getAttribute("aria-label") !== label) b.setAttribute("aria-label", label);
      }
    });
  }

  function tick() {
    try {
      markTabs();
      markH2();
      markFile();
      markButtons();
    } catch (e) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tick, { once: true });
  } else {
    tick();
  }
  window.setTimeout(tick, 900);
  window.setTimeout(tick, 2200);

  document.addEventListener("click", function (e) {
    var t = e.target;
    if (t && t.closest && t.closest("#root button")) window.setTimeout(tick, 30);
  }, true);

  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    window.setTimeout(function () {
      pending = false;
      tick();
    }, 60);
  }
  var mo = new MutationObserver(schedule);
  mo.observe(document.body, { childList: true, subtree: true });
  window.setInterval(tick, 800);
})();
