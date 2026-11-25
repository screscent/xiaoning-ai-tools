/* 小凝工具站 · 家具尺寸与入户搬运增强 xn-move v1
 * 能力：6 工具标签 44h/单行横滑/aria-current/具名；工具卡徽标与 h2 归一；
 *       分组标题 13/700；输入 52 + 单位语义 + 常用值胶囊；拆包装开关 role/aria-checked；
 *       分段选项 role=group/aria-pressed + 44 高；计算按钮 52 具名；结果首项 19/800、
 *       明细 14.5/700、状态条 15/700；复制 44 具名；回到顶部。
 * 注入：legacy/qhp4pmstfq.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_MOVE__) return;
  window.__XN_MOVE__ = true;

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }
  function clean(t) {
    return (t || "").replace(/\s+/g, " ").trim();
  }
  function each(list, fn) {
    Array.prototype.forEach.call(list, fn);
  }

  /* ---------- 标题：去「工具D」前缀 / 圈号 ---------- */
  function cleanHeads() {
    each(document.querySelectorAll("#root h2"), function (h) {
      each(h.childNodes, function (n) {
        if (n.nodeType !== 3) return;
        var t = n.nodeValue || "";
        var c = t.replace(/^\s*[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "").replace(/^\s*工具\s*[A-Fa-f0-9]+\s*/, "");
        if (c !== t) n.nodeValue = c;
      });
      each(h.querySelectorAll("*"), function (el) {
        if (el.children.length) return;
        var t = el.textContent || "";
        var c = t.replace(/^\s*[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "").replace(/^\s*工具\s*[A-Fa-f0-9]+\s*/, "");
        if (c && c !== t) el.textContent = c;
      });
    });
    each(document.querySelectorAll("#root section > div:first-child > span"), function (el) {
      if (el.children.length) return;
      if (!/^工具\s*[一二三四五六七八九十0-9A-Fa-f]+$/.test(clean(el.textContent))) return;
      if (!el.classList.contains("xn-mv-badge")) el.classList.add("xn-mv-badge");
    });
  }

  /* ---------- 工具标签 ---------- */
  function markTabs() {
    var links = Array.prototype.filter.call(document.querySelectorAll("#root nav a"), function (a) {
      return vis(a) && a.getAttribute("href") && a.getAttribute("href").indexOf("#/") === 0;
    });
    if (!links.length) return;
    var hash = location.hash || "";
    var active = null;
    links.forEach(function (a) {
      if (!a.classList.contains("xn-mv-tab")) a.classList.add("xn-mv-tab");
      if (hash && a.getAttribute("href") === hash) active = a;
    });
    if (!active && !hash) active = links[0];
    links.forEach(function (a, i) {
      if (a === active) {
        if (a.getAttribute("aria-current") !== "page") a.setAttribute("aria-current", "page");
      } else if (a.hasAttribute("aria-current")) {
        a.removeAttribute("aria-current");
      }
      var name = clean(a.textContent);
      var aria = "跳到：" + name + "（工具 " + (i + 1) + "）";
      if (name && a.getAttribute("aria-label") !== aria) a.setAttribute("aria-label", aria);
    });
  }

  function currentTitle() {
    var h2 = Array.prototype.find.call(document.querySelectorAll("#root h2"), function (h) {
      return vis(h) && !/使用说明/.test(h.textContent);
    });
    return h2 ? clean(h2.textContent) : "";
  }

  /* ---------- 分组标题 ---------- */
  function markGroups() {
    each(document.querySelectorAll("#root section .space-y-3 > div > div:first-child"), function (el) {
      var next = el.nextElementSibling;
      if (!next) return;
      var cls = String(next.className || "");
      if (cls.indexOf("grid") < 0) return;
      if (el.querySelector("input, button")) return;
      var t = clean(el.textContent);
      if (!t || t.length > 24) return;
      if (!el.classList.contains("xn-mv-group")) el.classList.add("xn-mv-group");
    });
  }

  /* ---------- 拆包装开关 ---------- */
  function markSwitches() {
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      if (!b.querySelector("span.flex.h-5")) return;
      if (!b.classList.contains("xn-mv-switch")) b.classList.add("xn-mv-switch");
      var box = b.querySelector("span.flex.h-5");
      var on = false;
      if (box) {
        var boxCls = String(box.className || "");
        on = /(^|\s)bg-(amber|orange|emerald|green|teal|indigo|blue|sky|violet)-[3-9]00(\s|$)/.test(boxCls);
        if (!on) {
          var bg = getComputedStyle(box).backgroundColor || "";
          on = !!bg && bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)" && bg !== "rgb(255, 255, 255)";
        }
      }
      var nameEl = b.querySelector("span:nth-child(2) > span:first-child");
      var name = clean(nameEl && nameEl.textContent);
      if (name) {
        var aria = name + "（勾选表示输入尺寸含外包装）";
        if (b.getAttribute("aria-label") !== aria) b.setAttribute("aria-label", aria);
        if (!b.title) b.title = aria;
      }
      if (!b.hasAttribute("role")) b.setAttribute("role", "checkbox");
      var val = on ? "true" : "false";
      if (b.getAttribute("aria-checked") !== val) b.setAttribute("aria-checked", val);
    });
  }

  /* ---------- 分段选项 ---------- */
  function segLabel(grid) {
    var prev = grid.previousElementSibling;
    if (prev) {
      var t = clean(prev.textContent);
      if (t && t.length <= 24) return t;
    }
    return "";
  }
  function markSegments() {
    each(document.querySelectorAll("#root section div.grid"), function (g) {
      var btns = Array.prototype.filter.call(g.querySelectorAll("button"), vis);
      if (!btns.length) return;
      if (g.querySelector("input, select, textarea")) return;
      if (!g.classList.contains("xn-mv-seg")) g.classList.add("xn-mv-seg");
      var label = segLabel(g);
      if (label) {
        if (!g.hasAttribute("role")) g.setAttribute("role", "group");
        if (g.getAttribute("aria-label") !== label) g.setAttribute("aria-label", label);
      }
      btns.forEach(function (b) {
        if (!b.classList.contains("xn-mv-opt")) b.classList.add("xn-mv-opt");
        var cls = String(b.className || "");
        var on = /(^|\s)bg-white(\s|$)/.test(cls) && /font-semibold/.test(cls);
        if (!on) {
          var bg = getComputedStyle(b).backgroundColor;
          on = bg === "rgb(255, 255, 255)";
        }
        var val = on ? "true" : "false";
        if (b.getAttribute("aria-pressed") !== val) b.setAttribute("aria-pressed", val);
        var t = clean(b.textContent);
        if (t) {
          var aria = label ? label + "：" + t : t;
          if (b.getAttribute("aria-label") !== aria) b.setAttribute("aria-label", aria);
        }
      });
    });
  }

  /* ---------- 输入：语义 + 常用值 ---------- */
  var FIELDS = [
    { key: "沙发与门洞", items: [
      { aria: "长（cm）", quick: [180, 200, 220] },
      { aria: "宽（cm）", quick: [85, 95, 110] },
      { aria: "高（cm）", quick: [75, 90, 105] },
      { aria: "门洞宽（净，cm）", quick: [80, 85, 90, 100] },
      { aria: "门洞高（净，cm）", quick: [198, 200, 210] }
    ] },
    { key: "柜体与楼梯", items: [
      { aria: "楼梯宽（净，cm）", quick: [80, 85, 90, 100] },
      { aria: "转角平台边长（cm）", quick: [100, 110, 120] },
      { aria: "家具最长边（cm）", quick: [180, 200, 220] },
      { aria: "楼层数（层）", quick: [1, 2, 3, 6] }
    ] },
    { key: "电梯与入户通道", items: [
      { aria: "电梯门宽（净，cm）", quick: [80, 90, 100] },
      { aria: "电梯门高（净，cm）", quick: [200, 210, 220] },
      { aria: "轿厢深（cm）", quick: [120, 140, 160] },
      { aria: "轿厢宽（cm）", quick: [100, 120, 140] },
      { aria: "走廊宽（净，cm）", quick: [90, 100, 120] },
      { aria: "家具边一（cm）", quick: [180, 200, 220] },
      { aria: "家具边二（cm）", quick: [85, 95, 110] },
      { aria: "家具边三（cm）", quick: [75, 85, 95] }
    ] },
    { key: "搬运人数估算", items: [
      { aria: "家具重量（kg）", quick: [30, 50, 80, 150, 300] },
      { aria: "楼层数（层）", quick: [1, 3, 6, 12] }
    ] },
    { key: "搬运防护包装", items: [
      { aria: "楼层数（层）", quick: [1, 3, 6, 12] }
    ] }
  ];

  function fieldsFor(title) {
    var out = null;
    FIELDS.forEach(function (m) {
      if (!out && title.indexOf(m.key) >= 0) out = m.items;
    });
    return out;
  }

  function nativeSet(el, v) {
    var desc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    if (desc && desc.set) desc.set.call(el, v);
    else el.value = v;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function markInputs() {
    var items = fieldsFor(currentTitle());
    if (!items) return;
    var inputs = Array.prototype.filter.call(document.querySelectorAll("#root input"), vis);
    inputs.forEach(function (input, idx) {
      var item = items[idx];
      if (!item) return;
      if (input.getAttribute("aria-label") !== item.aria) input.setAttribute("aria-label", item.aria);
      if (!input.title) input.title = "可以直接输入数字，或点下方常用值";
      var host = input.parentElement;
      if (!host) return;
      var mark = "xn-mv-q-" + idx;
      if (host.querySelector(':scope > .xn-mv-qrow[data-for="' + mark + '"]')) return;
      var old = host.querySelector(":scope > .xn-mv-qrow");
      if (old) old.parentElement.removeChild(old);
      var row = document.createElement("div");
      row.className = "xn-mv-qrow";
      (item.quick || []).forEach(function (q) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "xn-mv-q";
        b.textContent = String(q);
        b.setAttribute("aria-label", "填入 " + q + "（" + item.aria + "）");
        b.addEventListener("click", function (e) {
          e.preventDefault();
          nativeSet(input, String(q));
          input.focus();
        });
        row.appendChild(b);
      });
      row.setAttribute("data-for", mark);
      if (input.nextSibling) host.insertBefore(row, input.nextSibling);
      else host.appendChild(row);
    });
  }

  /* ---------- 计算 / 空状态 / 结果 ---------- */
  function markButtons() {
    var title = currentTitle();
    each(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var t = clean(b.textContent);
      if (t === "计算") {
        if (!b.classList.contains("xn-mv-go")) b.classList.add("xn-mv-go");
        var aria = "计算" + (title ? "「" + title + "」" : "") + "结果";
        if (b.getAttribute("aria-label") !== aria) b.setAttribute("aria-label", aria);
        if (!b.title) b.title = aria;
      }
    });
    each(document.querySelectorAll("#root div"), function (d) {
      if (d.children.length) return;
      if (!/结果会显示在这里/.test(d.textContent || "")) return;
      if (!d.classList.contains("xn-mv-empty")) d.classList.add("xn-mv-empty");
    });
  }

  function markResults() {
    var title = currentTitle();
    each(document.querySelectorAll("#root .mt-4 > div"), function (box) {
      if (String(box.className || "").indexOf("overflow-hidden") < 0) return;
      if (!box.classList.contains("xn-mv-result")) box.classList.add("xn-mv-result");
      var head = box.firstElementChild;
      if (head && !head.classList.contains("xn-mv-rhead")) head.classList.add("xn-mv-rhead");
      var copy = box.querySelector("button");
      if (copy && /复制/.test(clean(copy.textContent))) {
        if (!copy.classList.contains("xn-mv-copy")) copy.classList.add("xn-mv-copy");
        var aria = "复制" + (title ? "「" + title + "」" : "") + "结果";
        if (copy.getAttribute("aria-label") !== aria) copy.setAttribute("aria-label", aria);
      }
      var body = box.querySelector(".space-y-3\\.5") || box.lastElementChild;
      if (body) {
        var banner = body.firstElementChild;
        if (banner && banner.children.length === 0 && clean(banner.textContent)) {
          if (!banner.classList.contains("xn-mv-banner")) banner.classList.add("xn-mv-banner");
        }
        each(body.querySelectorAll("dl > div"), function (row, i) {
          var badge = i === 0 ? "xn-mv-kpi" : "";
          if (badge && !row.classList.contains(badge)) row.classList.add(badge);
        });
      }
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "xn-mv-top";
    topBtn.setAttribute("aria-label", "回到顶部");
    topBtn.title = "回到顶部";
    topBtn.textContent = "↑";
    topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    document.body.appendChild(topBtn);
  }

  function tick() {
    try {
      cleanHeads();
      markTabs();
      markGroups();
      markSwitches();
      markSegments();
      markInputs();
      markButtons();
      markResults();
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
  window.addEventListener("hashchange", tick);
  document.addEventListener("click", function () { window.setTimeout(tick, 200); }, true);

  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    window.setTimeout(function () { pending = false; tick(); }, 120);
  }
  var mo = new MutationObserver(schedule);
  mo.observe(document.body, { childList: true, subtree: true, characterData: true });
  window.setInterval(tick, 1000);

  window.addEventListener("scroll", function () {
    if (!topBtn) return;
    if (window.scrollY > 620) topBtn.classList.add("is-on");
    else topBtn.classList.remove("is-on");
  }, { passive: true });
})();
