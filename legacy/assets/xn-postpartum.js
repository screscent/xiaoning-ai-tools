/* R1099 月子护理与产后恢复合集 — 人用友好增强（幂等）
   1. 工具D/E/F 占位标题归一；区块一~六 → 工具 01~06
   2. tab aria-current 与分组语义
   3. 数字字段语义 aria + 常用值胶囊
   4. 结果区结构钩子（KPI / 三餐分配 / 食物份量 / 宜忌）
   5. 采购清单品类勾选 + 已备进度（localStorage）
   6. 复制/计算按钮 aria 与复制提示
   不改 React 逻辑。 */
(function () {
  if (window.__xnPostpartum) return;
  window.__xnPostpartum = 1;

  var STORE_KEY = "xnR1099shop";
  var CN = { 一: "01", 二: "02", 三: "03", 四: "04", 五: "05", 六: "06" };

  function q(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }
  function vis(el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }
  function txt(el) {
    return (el.textContent || "").trim().replace(/\s+/g, " ");
  }
  function add(el, cls) {
    if (el && !el.classList.contains(cls)) el.classList.add(cls);
  }
  function setAttr(el, k, v) {
    if (el.getAttribute(k) !== v) el.setAttribute(k, v);
  }
  function setText(el, v) {
    if (el && el.textContent !== v) el.textContent = v;
  }
  function sectionOf(needle) {
    return q("#root section").filter(vis).find(function (s) {
      return txt(s).indexOf(needle) >= 0;
    });
  }

  /* ---------- 1. 文案归一 ---------- */
  function normalize(root) {
    q("h2", root).forEach(function (h) {
      var t = txt(h);
      var n = t.replace(/^工具[A-F]\s*/, "");
      if (n !== t && n) h.textContent = n;
    });
    q("span", root).forEach(function (s) {
      if (s.children.length) return;
      var t = txt(s);
      var m = /^区块([一二三四五六])$/.exec(t);
      if (!m) return;
      add(s, "xn-step-pill");
      s.textContent = "工具 " + (CN[m[1]] || "01");
    });
  }

  /* ---------- 2. tab ---------- */
  function tabs(root) {
    var nav = q("nav", root)[0];
    if (nav) setAttr(nav, "aria-label", "工具切换");
    var hash = location.hash || "#/meal";
    if (hash.indexOf("#/") !== 0) hash = "#/meal";
    var hit = false;
    q('nav a[href^="#/"]', root).forEach(function (a) {
      if (a.getAttribute("href") === hash) {
        setAttr(a, "aria-current", "page");
        hit = true;
      } else if (a.getAttribute("aria-current")) {
        a.removeAttribute("aria-current");
      }
    });
    if (!hit) {
      var first = q('nav a[href^="#/"]', root)[0];
      if (first) setAttr(first, "aria-current", "page");
    }
  }

  /* ---------- 3. 字段 ---------- */
  var PRESETS = [
    [/^产后天数$/, [7, 14, 28, 42]],
    [/^体重$/, [50, 55, 60, 65, 70]],
    [/^(住家服务天数|服务天数)$/, [26, 42]],
    [/^月子中心入住天数$/, [0, 14, 28]],
    [/^月嫂日均价$/, [380, 430, 500]],
    [/^月子中心日均价$/, [800, 1000, 1200]],
    [/^月嫂月薪$/, [8000, 10000, 12000, 15000]],
    [/^预计面试人数$/, [1, 2, 3]],
    [/^坐月子天数$/, [30, 42]],
    [/^天数$/, [28, 30, 42]],
    [/^每日餐数$/, [3, 5]],
    [/^每餐主料克数$/, [120, 150, 180]],
    [/^产后修复项目预算$/, [2000, 3000, 5000, 10000]],
    [/^其他杂项$/, [1000, 2000, 3000]]
  ];

  function setInput(input, v) {
    var setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    setter.call(input, String(v));
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function fields(root) {
    q("label.block", root).forEach(function (lab) {
      if (!vis(lab)) return;
      var input = lab.querySelector('input[type="number"]');
      if (!input) return;
      var nameEl = lab.querySelector(":scope > span > span");
      var labelText = nameEl ? txt(nameEl) : "";
      var wrap = lab.querySelector(":scope > span.flex.items-center");
      var unitEl = wrap ? wrap.querySelector(":scope > span") : null;
      var unit = unitEl ? txt(unitEl) : "";
      if (labelText && unit) {
        var aria = labelText + "（" + unit + "）";
        if (input.getAttribute("aria-label") !== aria) input.setAttribute("aria-label", aria);
      }
      if (!labelText || !wrap) return;
      var rule = PRESETS.filter(function (r) { return r[0].test(labelText); })[0];
      if (!rule) return;
      var box = lab.querySelector(".xn-presets");
      if (!box) {
        box = document.createElement("div");
        box.className = "xn-presets";
        box.setAttribute("role", "group");
        box.setAttribute("aria-label", labelText + "常用值");
        rule[1].forEach(function (v) {
          var b = document.createElement("button");
          b.type = "button";
          b.className = "xn-preset";
          b.textContent = String(v);
          b.setAttribute("aria-label", "设为 " + v + (unit ? " " + unit : ""));
          b.addEventListener("click", function () {
            setInput(input, v);
          });
          box.appendChild(b);
        });
        lab.appendChild(box);
      }
      var cur = parseFloat(input.value);
      q(".xn-preset", box).forEach(function (b) {
        setAttr(b, "data-xn-active", parseFloat(b.textContent) === cur ? "1" : "0");
      });
    });
  }

  function selects(root) {
    q("select", root).forEach(function (sel) {
      if (!vis(sel)) return;
      add(sel, "xn-select");
      var rel = sel.closest("div");
      var box = rel && rel.parentElement;
      var lab = null;
      if (box) lab = box.querySelector("span,label") || box.querySelector(":scope > label");
      var t = lab ? txt(lab).slice(0, 20) : "";
      if (t && !sel.getAttribute("aria-label")) sel.setAttribute("aria-label", t + "，点击切换");
      if (!sel.getAttribute("title")) sel.setAttribute("title", "点击切换" + (t ? "：" + t : ""));
    });
  }

  /* ---------- 4. 结果区钩子 ---------- */
  function blocks(root) {
    var hero = sectionOf("每日建议总热量");
    if (hero) {
      add(hero, "xn-result-hero");
      var kpi = hero.querySelector("div.grid");
      if (kpi) add(kpi, "xn-kpis");
    }
    var dist = q("#root section", root).filter(function (s) {
      return s.querySelector("h3") && txt(s.querySelector("h3")) === "三餐两点热量分配";
    })[0];
    if (dist) add(dist, "xn-dist");

    var food = q("#root section", root).filter(function (s) {
      return s.querySelector("h3") && txt(s.querySelector("h3")) === "每餐食物份量示例";
    })[0];
    if (food) add(food, "xn-food");

    q("#root section", root).forEach(function (s) {
      var h = s.querySelector("h3");
      if (!h) return;
      var t = txt(h);
      if (t.indexOf("宜吃清单") >= 0 || t.indexOf("少吃") >= 0) add(s, "xn-lists");
    });

    var shop = q("#root section", root).filter(function (s) {
      return s.querySelector("h3") && txt(s.querySelector("h3")) === "采购品类与预算";
    })[0];
    if (shop) add(shop, "xn-shop");
  }

  /* ---------- 5. 采购勾选 ---------- */
  function shopState() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || "{}") || {}; }
    catch (e) { return {}; }
  }
  function shopSave(st) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(st)); } catch (e) {}
  }
  function shopApply(shop, st) {
    var grid = shop.querySelector("div.grid");
    if (!grid) return [];
    var cards = Array.prototype.slice.call(grid.children).filter(function (c) {
      return c.getAttribute("data-xn-shop");
    });
    cards.forEach(function (card) {
      var name = card.getAttribute("data-xn-shop");
      var on = !!st[name];
      if (on !== card.classList.contains("xn-shop-done")) card.classList.toggle("xn-shop-done", on);
      var b = card.querySelector(".xn-shop-check");
      if (b) setAttr(b, "aria-pressed", on ? "true" : "false");
    });
    return cards;
  }
  function shopSum(shop, cards) {
    var grid = shop.querySelector("div.grid");
    if (!grid || !cards.length) return;
    var sum = shop.querySelector(".xn-shop-sum");
    if (!sum) {
      sum = document.createElement("div");
      sum.className = "xn-shop-sum";
      sum.innerHTML = '<span class="xn-sum-text"></span><span class="xn-shop-bar"><i></i></span><button type="button" class="xn-shop-clear">清空勾选</button>';
      grid.parentElement.insertBefore(sum, grid);
    }
    var done = cards.filter(function (c) { return c.classList.contains("xn-shop-done"); }).length;
    var label = done + "/" + cards.length;
    var t = sum.querySelector(".xn-sum-text");
    if (t && t.getAttribute("data-xn-v") !== label) {
      t.setAttribute("data-xn-v", label);
      t.innerHTML = "已备 <b>" + done + "</b> / " + cards.length + " 类";
    }
    var bar = sum.querySelector(".xn-shop-bar > i");
    if (bar) bar.style.width = Math.round((done / cards.length) * 100) + "%";
  }
  function shop(root) {
    var shopEl = q("#root section", root).filter(function (s) {
      return s.querySelector("h3") && txt(s.querySelector("h3")) === "采购品类与预算";
    })[0];
    if (!shopEl || !vis(shopEl)) return;
    var grid = shopEl.querySelector("div.grid");
    if (!grid) return;
    var st = shopState();
    Array.prototype.slice.call(grid.children).forEach(function (card) {
      if (card.getAttribute("data-xn-shop")) return;
      var nameEl = card.querySelector("div.flex span");
      if (!nameEl) return;
      var name = (nameEl.childNodes[0] && nameEl.childNodes[0].nodeValue || "").trim();
      if (!name) return;
      card.setAttribute("data-xn-shop", name);
      add(nameEl, "xn-shop-name");
      var badge = nameEl.querySelector("span");
      if (badge) add(badge, "xn-shop-badge");
      var amt = card.querySelector("div.flex.flex-wrap > span:last-child");
      if (amt && amt !== nameEl) add(amt, "xn-shop-amount");
      var head = card.querySelector("div.flex.flex-wrap") || card.firstElementChild;
      if (!head) return;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "xn-shop-check";
      btn.setAttribute("aria-label", "标记「" + name + "」已备");
      btn.setAttribute("title", "勾选表示已买");
      btn.addEventListener("click", function () {
        var s = shopState();
        s[name] = !s[name];
        shopSave(s);
        var cards = shopApply(shopEl, s);
        shopSum(shopEl, cards);
      });
      head.insertBefore(btn, head.firstChild);
    });
    var cards = shopApply(shopEl, st);
    shopSum(shopEl, cards);
  }

  /* ---------- 6. 按钮与提示 ---------- */
  function toast(msg) {
    var el = document.querySelector(".xn-toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "xn-toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.setAttribute("data-on", "1");
    clearTimeout(el.__t);
    el.__t = setTimeout(function () { el.removeAttribute("data-on"); }, 1600);
  }

  function buttons(root) {
    q("button", root).forEach(function (b) {
      if (!vis(b)) return;
      var t = txt(b);
      if (t === "复制结果") {
        add(b, "xn-copy-result");
        if (!b.getAttribute("aria-label") || b.getAttribute("aria-label") === "复制结果") {
          setAttr(b, "aria-label", "复制计算结果");
        }
        if (!b.getAttribute("title")) setAttr(b, "title", "复制计算结果到剪贴板");
      } else if (t === "计算") {
        add(b, "xn-calc");
        setAttr(b, "aria-label", "重新计算");
      }
    });
  }

  /* ---------- 调度 ---------- */
  var busy = false;
  function enhance() {
    if (busy) return;
    busy = true;
    try {
      var root = document.getElementById("root");
      if (!root) return;
      root.setAttribute("data-xn-postpartum", "1");
      normalize(root);
      tabs(root);
      blocks(root);
      fields(root);
      selects(root);
      shop(root);
      buttons(root);
    } catch (e) {
      /* 静默 */
    } finally {
      busy = false;
    }
  }

  var timer = 0;
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(enhance, 90);
  }

  function bind() {
    var root = document.getElementById("root");
    if (!root) { setTimeout(bind, 300); return; }
    enhance();
    if (window.MutationObserver) new MutationObserver(schedule).observe(root, { childList: true, subtree: true });
    window.addEventListener("hashchange", function () { setTimeout(enhance, 150); });
    document.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("button");
      if (!b) return;
      if (b.classList.contains("xn-shop-clear")) {
        shopSave({});
        var sec = b.closest("section");
        if (sec) {
          var cards = shopApply(sec, {});
          shopSum(sec, cards);
        }
        toast("已清空勾选");
      } else if (b.classList.contains("xn-copy-result")) {
        toast("已复制到剪贴板");
      }
    }, true);
    setInterval(schedule, 1800);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
