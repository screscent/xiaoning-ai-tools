/* 小凝工具站 · JSON 接口与 Zod 校验增强 xn-zodschema v1
 * 能力：标签 44 + aria-pressed；文本域/输入语义名与 JSON 示例胶囊（自动生成）；
 *       复选框整行 44；生成 50、复制/清空 44 具名；结果区细节；回到顶部。
 * 注入：legacy/ja45jzkp5e.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_ZODSCHEMA__) return;
  window.__XN_ZODSCHEMA__ = true;

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  var SAMPLES = {
    iface: [
      { l: "对象与数组", v: '{\n  "items": [\n    { "id": 1, "name": "A" },\n    { "id": 2, "name": "B" }\n  ],\n  "total": 2\n}' },
      { l: "嵌套与 null", v: '{\n  "user": { "id": 1, "tags": ["a", "b"] },\n  "deleted_at": null\n}' },
      { l: "数字与布尔", v: '{\n  "count": 3,\n  "active": true,\n  "score": 9.5\n}' }
    ],
    zod: [
      { l: "简单对象", v: '{\n  "id": 1,\n  "name": "A"\n}' },
      { l: "可选字段", v: '{\n  "id": 1,\n  "nickname": null\n}' },
      { l: "数组字段", v: '{\n  "tags": ["a", "b"],\n  "count": 2\n}' }
    ]
  };

  function currentKey() {
    return /zod/.test(String(location.hash || "")) ? "zod" : "iface";
  }

  var nativeSetter = null;
  function setValue(el, v) {
    try {
      if (!nativeSetter) {
        var proto = el.tagName === "TEXTAREA" ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
        nativeSetter = Object.getOwnPropertyDescriptor(proto, "value").set;
      }
      nativeSetter.call(el, v);
    } catch (e) {
      el.value = v;
    }
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function generate() {
    var b = Array.prototype.filter.call(document.querySelectorAll("#root button"), function (x) {
      return vis(x) && /^生成/.test((x.textContent || "").replace(/\s+/g, ""));
    })[0];
    if (b) b.click();
  }

  function addChips(el, vals) {
    var host = el.parentElement;
    if (!host) return;
    var old = host.querySelector(".xn-zs-chips");
    if (old && old.dataset.first === vals[0].l) return;
    if (old) old.remove();
    var row = document.createElement("div");
    row.className = "xn-zs-chips";
    row.dataset.first = vals[0].l;
    row.setAttribute("role", "group");
    row.setAttribute("aria-label", "JSON 示例");
    vals.forEach(function (item) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = item.l;
      b.setAttribute("aria-label", "填入示例：" + item.l);
      b.addEventListener("click", function (ev) {
        ev.preventDefault();
        setValue(el, item.v);
        window.setTimeout(generate, 200);
      });
      row.appendChild(b);
    });
    host.insertBefore(row, el.nextSibling);
  }

  function markTabs() {
    var key = currentKey();
    var tabs = Array.prototype.filter.call(document.querySelectorAll('#root button[class*="px-3"][class*="rounded-lg"][class*="border"]'), vis);
    tabs.forEach(function (b) {
      var text = (b.textContent || "").replace(/\s+/g, "").trim();
      var mine = /接口生成/.test(text) ? "iface" : (/Zod/.test(text) ? "zod" : "");
      if (!mine) return;
      var active = mine === key;
      if (b.getAttribute("aria-pressed") !== String(active)) b.setAttribute("aria-pressed", String(active));
      var label = mine === "iface" ? "接口生成（JSON 转 TypeScript）" : "Zod 校验（JSON 转 Zod Schema）";
      if (b.getAttribute("aria-label") !== label) b.setAttribute("aria-label", label);
    });
    var bar = tabs[0] && tabs[0].parentElement;
    if (bar && bar.classList && !bar.classList.contains("xn-zs-tabbar")) bar.classList.add("xn-zs-tabbar");
  }

  function markFields() {
    var key = currentKey();
    var areas = Array.prototype.filter.call(document.querySelectorAll("#root textarea"), vis);
    areas.forEach(function (t) {
      var want = key === "zod" ? "JSON 对象（生成 Zod Schema）" : "JSON 数据（生成 TypeScript 接口）";
      if (t.getAttribute("aria-label") !== want) t.setAttribute("aria-label", want);
      addChips(t, key === "zod" ? SAMPLES.zod : SAMPLES.iface);
    });
    Array.prototype.forEach.call(document.querySelectorAll('#root input[type="text"]'), function (i) {
      if (!vis(i)) return;
      if (!i.classList.contains("xn-zs-inp")) i.classList.add("xn-zs-inp");
      if (i.getAttribute("aria-label") !== "根接口名") i.setAttribute("aria-label", "根接口名");
    });
    Array.prototype.forEach.call(document.querySelectorAll('#root input[type="checkbox"]'), function (c) {
      if (!vis(c)) return;
      if (c.getAttribute("aria-label") !== "添加 export 关键字") c.setAttribute("aria-label", "添加 export 关键字");
      if (!c.title) c.title = "生成时在每个接口前加 export";
      var box = c.parentElement;
      if (!box || box.classList.contains("xn-zs-ckhit")) return;
      box.classList.add("xn-zs-ckhit");
      box.addEventListener("click", function (ev) {
        if (ev.target !== c) c.click();
      });
    });
  }

  function markButtons() {
    var key = currentKey();
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var text = (b.textContent || "").replace(/\s+/g, "").trim();
      var aria = "";
      if (/^生成/.test(text)) aria = key === "zod" ? "生成 Zod Schema" : "生成 TypeScript 接口";
      else if (text === "复制代码") aria = key === "zod" ? "复制 Zod Schema 代码" : "复制 TypeScript 接口代码";
      else if (text === "清空") aria = "清空 JSON 与结果";
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
    topBtn.className = "xn-zs-top";
    topBtn.setAttribute("aria-label", "回到顶部");
    topBtn.title = "回到顶部";
    topBtn.textContent = "↑";
    topBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    document.body.appendChild(topBtn);
  }

  function rewriteNote() {
    var all = Array.prototype.filter.call(document.querySelectorAll("#root *"), function (el) {
      return (el.textContent || "").indexOf("左侧文本框") >= 0;
    });
    if (!all.length) return;
    var target = null;
    all.forEach(function (el) {
      var hasChild = Array.prototype.some.call(el.children, function (c) {
        return (c.textContent || "").indexOf("左侧文本框") >= 0;
      });
      if (!hasChild) target = el;
    });
    if (!target) return;
    var t = target.textContent || "";
    var n = t.replace(/在左侧文本框/g, "在 JSON 文本框").replace(/右侧将显示/g, "下方将显示");
    if (n !== t) target.textContent = n;
  }

  function tick() {
    try {
      markTabs();
      markFields();
      markButtons();
      rewriteNote();
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
