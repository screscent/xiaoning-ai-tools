/* 小凝工具站 · 隐私设置自查增强 xn-privacy v1
 * 能力：5 个工具卡片 72h/aria-label/选中靛蓝渐变；隐藏与卡片重复的胶囊导航；
 *       清单行 64/68 + 勾选框 22 + 标题 15 + 说明 13.5；完成度 20px/800 + 进度条 10px；
 *       全选/清空 44、复制整改清单 44 靛蓝；空态 13；回到顶部。
 * 注入：legacy/ijankg8zig.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_PRIVACY__) return;
  window.__XN_PRIVACY__ = true;

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  function clean(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }

  function markCards() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var text = clean(b.textContent);
      var m = text.match(/^(.*?)已勾选\s*(\d+)\/(\d+)$/);
      if (!m) return;
      if (!b.classList.contains("xn-pv-card")) b.classList.add("xn-pv-card");
      var name = m[1].trim();
      if (!name) return;
      var aria = name + "，已勾选 " + m[2] + " 项，共 " + m[3] + " 项";
      if (b.getAttribute("aria-label") !== aria) b.setAttribute("aria-label", aria);
    });
  }

  function hideDuplicatePills() {
    Array.prototype.forEach.call(document.querySelectorAll("#root div"), function (d) {
      if (d.classList.contains("xn-pv-pills")) return;
      var btns = Array.prototype.filter.call(d.querySelectorAll(":scope > button"), vis);
      if (btns.length < 5) return;
      var allPill = btns.every(function (b) { return /rounded-full/.test(b.className || ""); });
      if (!allPill) return;
      var names = btns.map(function (b) { return clean(b.textContent); });
      var uniq = names.filter(function (n, i) { return names.indexOf(n) === i; });
      if (uniq.length !== btns.length) return;
      if (!/社交平台隐私/.test(names.join(""))) return;
      d.classList.add("xn-pv-pills");
    });
  }

  function markButtons() {
    Array.prototype.forEach.call(document.querySelectorAll("#root main > section button"), function (b) {
      if (!vis(b)) return;
      if (/rounded-full/.test(b.className || "")) return;
      var t = clean(b.textContent);
      var aria = "";
      if (t === "全选") aria = "全选当前清单";
      else if (t === "清空") aria = "清空当前清单勾选";
      else if (t === "一键复制整改清单") aria = "复制整改清单";
      if (!aria) return;
      if (b.getAttribute("aria-label") !== aria) b.setAttribute("aria-label", aria);
      if (!b.title) b.title = aria;
    });
  }

  function markProgress() {
    Array.prototype.forEach.call(document.querySelectorAll("#root main > section div"), function (d) {
      if (!vis(d) || d.classList.contains("xn-pv-progress")) return;
      var txt = clean(d.textContent);
      if (txt.indexOf("完成度") !== 0) return;
      var pct = d.querySelector("span.font-semibold");
      if (!pct || !/^\d+\/\d+ · \d+%$/.test(clean(pct.textContent))) return;
      d.classList.add("xn-pv-progress");
      pct.classList.add("xn-pv-pct");
      if (pct.getAttribute("aria-live") !== "polite") pct.setAttribute("aria-live", "polite");
    });
  }

  function fixNavHint() {
    var box = document.querySelector("#root .border-dashed");
    if (!box) return;
    var ps = box.querySelectorAll("p");
    for (var i = 0; i < ps.length; i++) {
      var t = clean(ps[i].textContent);
      if (t.indexOf("点击标签即可切换") < 0) continue;
      ps[i].textContent = "下面有 5 个独立工具，点上方卡片即可切换；也可在地址后加 #social、#phone、#browser、#account、#mfa 直达对应清单。";
      break;
    }
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "xn-pv-top";
    topBtn.setAttribute("aria-label", "回到顶部");
    topBtn.title = "回到顶部";
    topBtn.textContent = "↑";
    topBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    document.body.appendChild(topBtn);
  }

  function tick() {
    try {
      markCards();
      hideDuplicatePills();
      markButtons();
      markProgress();
      fixNavHint();
      ensureTop();
    } catch (e) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tick, { once: true });
  } else {
    tick();
  }
  window.setTimeout(tick, 900);
  window.setTimeout(tick, 2200);
  document.addEventListener("click", function () { window.setTimeout(tick, 160); }, true);

  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    window.setTimeout(function () {
      pending = false;
      tick();
    }, 100);
  }
  var mo = new MutationObserver(schedule);
  mo.observe(document.body, { childList: true, subtree: true, characterData: true });
  window.setInterval(tick, 900);

  window.addEventListener("scroll", function () {
    if (!topBtn) return;
    if (window.scrollY > 620) topBtn.classList.add("is-on");
    else topBtn.classList.remove("is-on");
  }, { passive: true });
})();
