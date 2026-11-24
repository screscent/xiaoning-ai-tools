/* 小凝工具站 · 桌游与棋牌计分增强 xn-board v1
 * 能力：切换条 aria-label + 移动横滑吸顶；隐藏路由提示；标题去工具F；数字常用值胶囊；
 *       复制/清空 44h + aria；回到顶部。
 * 注入：legacy/urweqddyk8.html 的 </body> 前追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_BOARD__) return;
  window.__XN_BOARD__ = true;

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  function markTabs() {
    var tabs = Array.prototype.filter.call(document.querySelectorAll('#root a[href^="#/"]'), vis);
    tabs.forEach(function (a) {
      var t = (a.textContent || "").replace(/\s+/g, " ").trim();
      if (t && a.getAttribute("aria-label") !== t) a.setAttribute("aria-label", t);
    });
    var bar = tabs[0] && tabs[0].parentElement;
    if (bar && bar.classList && !bar.classList.contains("xn-bd-tabbar")) bar.classList.add("xn-bd-tabbar");
  }

  /* 隐藏「当前：xxx｜也可在网址后加 #/xxx 直达」开发者提示 */
  function hideRouteHint() {
    Array.prototype.forEach.call(document.querySelectorAll("#root p, #root div, #root span"), function (el) {
      if (el.children.length) return;
      var t = (el.textContent || "").trim();
      if (!t || t.length > 90) return;
      if (/^当前：/.test(t) && /#\//.test(t) && /直达/.test(t)) {
        el.style.display = "none";
        el.setAttribute("aria-hidden", "true");
      }
    });
  }

  function markButtons() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var text = (b.textContent || "").replace(/\s+/g, "").trim();
      var label = text.indexOf("复制") === 0 || text === "已复制" ? "复制结果" : text === "清空" ? "清空" : "";
      if (label && b.getAttribute("aria-label") !== label) b.setAttribute("aria-label", label);
    });
  }

  function fixTitle() {
    Array.prototype.forEach.call(document.querySelectorAll("#root h2, #root h3"), function (el) {
      if (el.children.length) return;
      var t = (el.textContent || "").trim();
      var m = t.match(/^工具[A-F]\s*(.+)$/);
      if (m) el.textContent = m[1];
    });
  }

  /* 按输入语义给常用值 */
  function chipValues(label) {
    if (/每人基础分/.test(label)) return [[0, "0 分"], [50, "50 分"], [100, "100 分"], [-10, "-10 分"]];
    if (/每局加分/.test(label)) return [[0, "0 分"], [10, "10 分"], [20, "20 分"], [-5, "-5 分"]];
    if (/计划局数/.test(label)) return [[3, "3 局"], [5, "5 局"], [8, "8 局"], [10, "10 局"]];
    if (/局数/.test(label)) return [[1, "1 局"], [3, "3 局"], [5, "5 局"], [10, "10 局"]];
    if (/可用时长/.test(label)) return [[30, "30 分"], [60, "60 分"], [90, "90 分"], [120, "120 分"]];
    if (/每个回合时长|回合时长/.test(label)) return [[2, "2 分"], [3, "3 分"], [5, "5 分"]];
    if (/新手比例/.test(label)) return [[0, "0%"], [25, "25%"], [50, "50%"], [75, "75%"]];
    if (/总人数/.test(label)) return [[6, "6 人"], [8, "8 人"], [12, "12 人"], [16, "16 人"]];
    if (/我方手牌/.test(label)) return [[5, "5 张"], [7, "7 张"], [10, "10 张"], [13, "13 张"]];
    if (/对手手牌/.test(label)) return [[5, "5 张"], [7, "7 张"], [10, "10 张"], [13, "13 张"]];
    if (/已知牌/.test(label)) return [[0, "0 张"], [5, "5 张"], [10, "10 张"], [17, "17 张"]];
    return null;
  }

  function addChips(inp) {
    var label = inp.getAttribute("aria-label") || "";
    if (!label) {
      var wrap = inp.closest("label");
      if (wrap) label = (wrap.textContent || "").trim().slice(0, 14);
    }
    var vals = chipValues(label);
    if (!vals) return;
    var host = inp.parentElement;
    if (!host || host.querySelector(".xn-bd-chips")) return;
    var row = document.createElement("div");
    row.className = "xn-bd-chips";
    row.setAttribute("role", "group");
    row.setAttribute("aria-label", "常用值");
    vals.forEach(function (pair) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = pair[1];
      b.setAttribute("aria-label", "设为 " + pair[1]);
      b.addEventListener("click", function (ev) {
        ev.preventDefault();
        setValue(inp, String(pair[0]));
      });
      row.appendChild(b);
    });
    host.appendChild(row);
  }

  var nativeSetter = null;
  function setValue(inp, v) {
    try {
      if (!nativeSetter) nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      nativeSetter.call(inp, v);
    } catch (e) {
      inp.value = v;
    }
    inp.dispatchEvent(new Event("input", { bubbles: true }));
    inp.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function markInputs() {
    Array.prototype.forEach.call(document.querySelectorAll("#root input"), function (inp) {
      var type = (inp.getAttribute("type") || "text").toLowerCase();
      if (!/^(number|text)$/.test(type)) return;
      addChips(inp);
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "xn-bd-top";
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
      hideRouteHint();
      fixTitle();
      markTabs();
      markButtons();
      markInputs();
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
  window.setInterval(tick, 900);

  window.addEventListener("scroll", function () {
    if (!topBtn) return;
    if (window.scrollY > 620) topBtn.classList.add("is-on");
    else topBtn.classList.remove("is-on");
  }, { passive: true });
})();
