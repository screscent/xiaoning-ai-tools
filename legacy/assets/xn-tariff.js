/* 小凝工具站 · 手机套餐与流量成本增强 xn-tariff v1
 * 能力：入口卡 aria-label；标题放大；文本输入 16px；添加/复制/次要按钮 44h + aria。
 * 注入：legacy/vfd6jblsqf.html 的 </body> 前追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_TARIFF__) return;
  window.__XN_TARIFF__ = true;

  var CN = ["一", "二", "三", "四", "五", "六", "七", "八"];

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  function markCards() {
    Array.prototype.filter.call(document.querySelectorAll('#root a[href^="#/"]'), vis).forEach(function (a, i) {
      var nameEl = a.querySelector("h2,h3,strong,b,div");
      var name = nameEl ? (nameEl.textContent || "").trim().slice(0, 18) : "";
      if (!name) name = "工具" + CN[i];
      var label = "进入工具" + CN[i] + "：" + name;
      if (a.getAttribute("aria-label") !== label) a.setAttribute("aria-label", label);
    });
  }

  function markButtons() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = (b.textContent || "").replace(/\s+/g, "").trim();
      if (!t) return;
      if (/^复制/.test(t)) {
        b.classList.add("xn-tf-copy");
        if (b.getAttribute("aria-label") !== t) b.setAttribute("aria-label", t);
        return;
      }
      if (/^(添加|新增)/.test(t)) {
        b.classList.add("xn-tf-add");
        if (b.getAttribute("aria-label") !== t) b.setAttribute("aria-label", t);
        return;
      }
      if (/^(顺便|估算|重置|清空)/.test(t)) {
        b.classList.add("xn-tf-mini");
        if (b.getAttribute("aria-label") !== t) b.setAttribute("aria-label", t);
      }
    });
  }

  function markInputs() {
    Array.prototype.forEach.call(document.querySelectorAll("#root input"), function (inp) {
      var type = inp.getAttribute("type");
      if (!type || /^(text|search|url|email|tel|date|time)$/.test(type)) inp.classList.add("xn-tf-inp");
    });
  }

  function fixLabels() {
    Array.prototype.forEach.call(document.querySelectorAll("#root h2, #root h3, #root p, #root span, #root div"), function (el) {
      if (el.children.length) return;
      var t = (el.textContent || "").trim();
      var m = t.match(/^工具[A-F]\s*(.+)$/);
      if (m) el.textContent = m[1];
    });
  }

  function tick() {
    try {
      fixLabels();
      markCards();
      markButtons();
      markInputs();
    } catch (e) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tick, { once: true });
  } else {
    tick();
  }
  window.setTimeout(tick, 900);
  window.setTimeout(tick, 2200);

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
