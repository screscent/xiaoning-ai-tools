/* 小凝工具站 · 绿植养护增强 xn-plant v1
 * 能力：切换条 aria-current + 名称；标题归一（去工具E/F）；输入 48/16；选项 aria-pressed；
 *       复制按钮 44h/aria；常用值快捷胶囊；移动端切换条吸顶；回到顶部。
 * 注入：legacy/ij5ecw8zig.html 的 </body> 前追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_PLANT__) return;
  window.__XN_PLANT__ = true;

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  var TABS = [
    { key: "water", name: "浇水", sub: "频率 / 浇透 / 光照" },
    { key: "soil", name: "土壤", sub: "配比 / 换盆 / 盆径" },
    { key: "pest", name: "病虫", sub: "黄叶 / 烂根 / 虫害" },
    { key: "fert", name: "施肥", sub: "季节 / 频率 / 浓度" },
    { key: "light", name: "补光", sub: "时长 / 电费 / 光照" },
    { key: "vacation", name: "出门养护", sub: "出门前 / 补水 / 恢复" }
  ];

  function markTabs() {
    var tabs = Array.prototype.filter.call(document.querySelectorAll('#root a[href^="#/"]'), vis);
    tabs.forEach(function (a, i) {
      var meta = TABS[i] || { name: (a.textContent || "").trim().slice(0, 6), sub: "" };
      var active = /bg-emerald-700/.test(a.className || "");
      if (active) {
        if (a.getAttribute("aria-current") !== "page") a.setAttribute("aria-current", "page");
      } else if (a.hasAttribute("aria-current")) {
        a.removeAttribute("aria-current");
      }
      var label = meta.sub ? meta.name + "（" + meta.sub + "）" : meta.name;
      if (a.getAttribute("aria-label") !== label) a.setAttribute("aria-label", label);
    });
    var bar = tabs[0] && tabs[0].parentElement;
    if (bar && bar.classList && !bar.classList.contains("xn-pl-tabbar")) bar.classList.add("xn-pl-tabbar");
  }

  function markButtons() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var text = (b.textContent || "").replace(/\s+/g, "").trim();
      if (/^(复制|已复制)/.test(text)) {
        if (b.getAttribute("aria-label") !== "复制结果") b.setAttribute("aria-label", "复制结果");
        return;
      }
      var cls = b.className || "";
      if (/rounded-(2xl|full)/.test(cls) && /border/.test(cls) && b.hasAttribute("aria-label")) {
        var on = /bg-emerald-700/.test(cls);
        var val = on ? "true" : "false";
        if (b.getAttribute("aria-pressed") !== val) b.setAttribute("aria-pressed", val);
      }
    });
  }

  function markInputs() {
    Array.prototype.forEach.call(document.querySelectorAll("#root input"), function (inp) {
      var type = (inp.getAttribute("type") || "text").toLowerCase();
      if (!/^(text|search|url|email|tel|date|time|number)$/.test(type)) return;
      inp.classList.add("xn-pl-inp");
      addChips(inp);
    });
  }

  function chipValues(label) {
    if (/功率/.test(label)) return [[20, "20W"], [30, "30W"], [50, "50W"], [100, "100W"]];
    if (/灯数量|数量/.test(label)) return [[1, "1 盏"], [2, "2 盏"], [3, "3 盏"], [4, "4 盏"]];
    if (/开灯|小时/.test(label)) return [[6, "6 小时"], [8, "8 小时"], [12, "12 小时"], [16, "16 小时"]];
    if (/电价|元/.test(label)) return [[0.5, "0.5 元"], [0.55, "0.55 元"], [0.6, "0.6 元"], [0.65, "0.65 元"]];
    if (/天数|出门/.test(label)) return [[3, "3 天"], [7, "7 天"], [14, "14 天"], [30, "30 天"]];
    return null;
  }

  function addChips(inp) {
    var label = inp.getAttribute("aria-label") || "";
    if (!label) {
      var wrap = inp.closest("label");
      if (wrap) label = (wrap.textContent || "").trim().slice(0, 12);
    }
    var vals = chipValues(label);
    if (!vals) return;
    var host = inp.parentElement;
    if (!host || host.querySelector(".xn-pl-chips")) return;
    var row = document.createElement("div");
    row.className = "xn-pl-chips";
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

  function fixPlaceholders() {
    Array.prototype.forEach.call(document.querySelectorAll("#root h2, #root h3, #root p, #root span, #root div"), function (el) {
      if (el.children.length) return;
      var t = (el.textContent || "").trim();
      var m = t.match(/^工具[A-F]\s*(.+)$/);
      if (m) el.textContent = m[1];
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "xn-pl-top";
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
      fixPlaceholders();
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
