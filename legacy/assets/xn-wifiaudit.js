/* 小凝工具站 · Wi-Fi 安全与端口自查增强 xn-wifiaudit v1
 * 能力：工具卡 aria-pressed/aria-label；开关语义名与扩热区；年数胶囊；
 *       生成 50、复制/清空 44 具名；结果区风险色与字号；回到顶部。
 * 注入：legacy/ja4c4jkp5e.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_WIFIAUDIT__) return;
  window.__XN_WIFIAUDIT__ = true;

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  var YEARS = [
    { l: "1 年", v: 1 },
    { l: "3 年", v: 3 },
    { l: "5 年", v: 5 },
    { l: "8 年", v: 8 }
  ];

  var nativeInput = null;
  function setValue(el, v) {
    try {
      if (!nativeInput) nativeInput = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      nativeInput.call(el, String(v));
    } catch (e) {
      el.value = String(v);
    }
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.dispatchEvent(new Event("blur", { bubbles: true }));
  }

  function addChips(inp, vals) {
    var label = inp.closest("label");
    var host = label || inp.parentElement;
    if (!host || host.querySelector(".xn-wa-chips")) return;
    var row = document.createElement("div");
    row.className = "xn-wa-chips";
    row.setAttribute("role", "group");
    row.setAttribute("aria-label", "常用年数");
    vals.forEach(function (item) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = item.l;
      b.setAttribute("aria-label", "填入 " + item.l);
      b.addEventListener("click", function (ev) {
        ev.preventDefault();
        setValue(inp, item.v);
      });
      row.appendChild(b);
    });
    host.appendChild(row);
  }

  function markCards() {
    var cards = Array.prototype.filter.call(document.querySelectorAll('#root button[class*="rounded-xl"][class*="text-left"]'), vis);
    cards.forEach(function (b) {
      var text = (b.textContent || "").replace(/\s+/g, "");
      var isPort = /端口自查/.test(text);
      var aria = isPort ? "端口自查（开放端口暴露与处置建议）" : "Wi-Fi 自查（加密与配置评分、整改路径）";
      var active = /border-blue-500/.test(b.className);
      if (b.getAttribute("aria-pressed") !== String(active)) b.setAttribute("aria-pressed", String(active));
      if (b.getAttribute("aria-label") !== aria) b.setAttribute("aria-label", aria);
    });
  }

  function markFields() {
    var nums = Array.prototype.filter.call(document.querySelectorAll('#root input[type="number"]'), vis);
    nums.forEach(function (inp) {
      if (inp.getAttribute("aria-label") !== "路由器使用年数") inp.setAttribute("aria-label", "路由器使用年数");
      addChips(inp, YEARS);
    });
    Array.prototype.forEach.call(document.querySelectorAll('#root select'), function (s) {
      if (vis(s) && !s.getAttribute("aria-label")) s.setAttribute("aria-label", "加密方式");
    });
    Array.prototype.forEach.call(document.querySelectorAll('#root button[role="switch"]'), function (b) {
      if (!vis(b)) return;
      var label = "";
      var title = b.parentElement && b.parentElement.querySelector("p");
      if (title) label = (title.textContent || "").replace(/\s+/g, "").trim();
      if (!label && b.parentElement) label = (b.parentElement.textContent || "").replace(/\s+/g, "").slice(0, 18);
      if (label && b.getAttribute("aria-label") !== label) b.setAttribute("aria-label", label);
    });
  }

  function currentKey() {
    var card = Array.prototype.filter.call(document.querySelectorAll('#root button[class*="rounded-xl"][class*="text-left"]'), vis)[0];
    var active = Array.prototype.filter.call(document.querySelectorAll('#root button[class*="rounded-xl"][class*="text-left"]'), function (b) {
      return vis(b) && /border-blue-500/.test(b.className);
    })[0] || card;
    return active && /端口自查/.test(active.textContent || "") ? "port" : "wifi";
  }

  function markButtons() {
    var key = currentKey();
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var text = (b.textContent || "").replace(/\s+/g, "").trim();
      var aria = "";
      if (text === "生成自查清单") aria = "生成 Wi-Fi 自查清单";
      else if (text === "生成端口自查报告") aria = "生成端口自查报告";
      else if (text === "复制自查清单") aria = "复制自查清单";
      else if (text === "复制报告") aria = "复制端口自查报告";
      else if (text === "清空") aria = key === "port" ? "清空端口自查选项" : "清空 Wi-Fi 自查选项";
      if (aria && b.getAttribute("aria-label") !== aria) {
        b.setAttribute("aria-label", aria);
        if (!b.title) b.title = aria;
      }
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "xn-wa-top";
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
      markFields();
      markButtons();
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
  window.addEventListener("hashchange", function () { window.setTimeout(tick, 150); });

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
  window.setInterval(tick, 900);

  window.addEventListener("scroll", function () {
    if (!topBtn) return;
    if (window.scrollY > 620) topBtn.classList.add("is-on");
    else topBtn.classList.remove("is-on");
  }, { passive: true });
})();
