/* 小凝工具站 · 文本脱敏与分享自查增强 xn-redact v1
 * 能力：6 张工具卡 aria-current/aria-label；区块标题放大；文本域 16px；
 *      主操作/复制/还原 44h + aria；统计数字放大；脱敏结果等宽。
 * 注入：legacy/npxiz82aq6.html 的 </body> 前追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_REDACT__) return;
  window.__XN_REDACT__ = true;

  var CN = ["一", "二", "三", "四", "五", "六", "七", "八"];

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  function cards() {
    return Array.prototype.filter.call(
      document.querySelectorAll('#root button[class*="rounded-lg border"][class*="px-3"]'),
      function (b) { return vis(b) && /^0[1-6]/.test((b.textContent || "").trim()); }
    );
  }

  function markCards() {
    var list = cards();
    list.forEach(function (b, i) {
      var on = b.className.indexOf("border-[#2563EB]") >= 0;
      var cur = on ? "true" : "false";
      if (b.getAttribute("aria-current") !== cur) b.setAttribute("aria-current", cur);
      var nameEl = b.children[1] || b.children[0];
      var name = nameEl ? (nameEl.textContent || "").trim().slice(0, 20) : "";
      if (!name) name = "工具" + CN[i];
      var label = "切换到工具" + CN[i] + "：" + name + (on ? "（当前）" : "");
      if (b.getAttribute("aria-label") !== label) b.setAttribute("aria-label", label);
    });
  }

  function markH2() {
    var list = cards();
    var idx = -1;
    for (var i = 0; i < list.length; i++) {
      if (list[i].getAttribute("aria-current") === "true") { idx = i; break; }
    }
    if (idx < 0) return;
    var nameEl = list[idx].children[1] || list[idx].children[0];
    var name = nameEl ? (nameEl.textContent || "").trim() : "";
    if (!name) return;
    var h2 = document.querySelector("#root h2");
    if (!h2) return;
    var want = String(idx + 1).padStart(2, "0") + " · " + name;
    if ((h2.textContent || "").trim() !== want) h2.textContent = want;
  }

  function markButtons() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      if (b.classList.contains("xn-rd-run") || b.classList.contains("xn-rd-copy") || b.classList.contains("xn-rd-act")) return;
      var t = (b.textContent || "").replace(/\s+/g, "").trim();
      if (!t || /^0[1-6]/.test(t)) return;
      if (/^复制/.test(t)) {
        b.classList.add("xn-rd-copy");
        if (b.getAttribute("aria-label") !== t) b.setAttribute("aria-label", t);
        return;
      }
      if (/^(还原|重置|清空)/.test(t)) {
        b.classList.add("xn-rd-act");
        if (b.getAttribute("aria-label") !== t) b.setAttribute("aria-label", t);
        return;
      }
      if (/^(一键脱敏|批量脱敏|开始|生成|计算|检查)/.test(t)) {
        b.classList.add("xn-rd-run");
        if (b.getAttribute("aria-label") !== t) b.setAttribute("aria-label", t);
      }
    });
  }

  function markStats() {
    Array.prototype.forEach.call(document.querySelectorAll("#root div.tabular-nums, #root span.tabular-nums"), function (el) {
      if (!vis(el)) return;
      if (/^\d+$/.test((el.textContent || "").trim())) el.classList.add("xn-rd-num");
    });
  }

  function markOutputs() {
    Array.prototype.forEach.call(document.querySelectorAll("#root div"), function (d) {
      if (!vis(d) || d.children.length > 0) return;
      if (/^\s*$/.test(d.textContent || "")) return;
      if (/(^|\s)font-mono(\s|$)|break-all/.test(d.className) && (d.textContent || "").length > 8) d.classList.add("xn-rd-out");
    });
  }

  function fixGuide() {
    Array.prototype.forEach.call(document.querySelectorAll("#root p, #root div"), function (el) {
      if (el.children.length) return;
      var t = (el.textContent || "").trim();
      if (!/#mask|#batch|#rules|#share|#custom|#hash/.test(t)) return;
      var want = "6 个工具互相独立，点击上方标签即可切换，已输入的内容不会丢失。";
      if (t !== want) el.textContent = want;
    });
  }

  function tick() {
    try {
      fixGuide();
      markCards();
      markH2();
      markButtons();
      markStats();
      markOutputs();
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
    }, 80);
  }
  var mo = new MutationObserver(schedule);
  mo.observe(document.body, { childList: true, subtree: true });
  window.setInterval(tick, 1200);
})();
