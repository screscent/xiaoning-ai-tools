/* R1114 每周菜单与采购计划合集 — 人用友好增强（幂等）
   1. 页签当前态
   2. 忌口 aria-pressed / 分组
   3. 生成/重新生成命名
   4. 逐日菜单结构化 + 锁定按钮带上下文
   不改 React 逻辑。 */
(function () {
  if (window.__xnMenu) return;
  window.__xnMenu = 1;

  function q(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function vis(el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; }
  function txt(el) { return (el.textContent || "").trim().replace(/\s+/g, " "); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function setAttr(el, k, v) { if (el.getAttribute(k) !== v) el.setAttribute(k, v); }

  var AVOID = ["不吃辣", "不吃海鲜", "不吃香菜", "不吃牛肉"];
  var DAY_RE = /第[一二三四五六七]天/;

  function tabs(root) {
    var btns = q("button", root).filter(function (b) { return vis(b) && /^(七天菜单|采购汇总|库存临期|花费人均|预算|备餐分装)$/.test(txt(b)); });
    if (!btns.length) return;
    add(btns[0].parentElement, "xn-menu-tabs");
    btns.forEach(function (b) {
      var on = /bg-\[#2563eb\]|bg-blue-600/.test(b.className || "");
      setAttr(b, "aria-current", on ? "true" : "false");
    });
  }

  function controls(root) {
    q("button", root).forEach(function (b) {
      if (!vis(b)) return;
      var t = txt(b);
      if (AVOID.indexOf(t) >= 0) {
        add(b, "xn-menu-chip");
        var on = /border-\[#2563eb\]|bg-blue-50|ring-/.test(b.className || "");
        setAttr(b, "aria-pressed", on ? "true" : "false");
        b.setAttribute("aria-label", t + "（忌口）");
        var box = b.parentElement;
        if (box && box.getAttribute("role") !== "group") {
          box.setAttribute("role", "group");
          box.setAttribute("aria-label", "忌口，可多选");
        }
      } else if (t === "生成菜单" || t === "重新生成") {
        add(b, "xn-menu-run");
        b.setAttribute("aria-label", t === "生成菜单" ? "生成七天菜单" : "重新生成菜单");
      }
    });
    var num = q('input[type="number"]', root).filter(vis)[0];
    if (num && !num.getAttribute("aria-label")) num.setAttribute("aria-label", "用餐人数");
  }

  function days(root) {
    // 日头
    q("div", root).forEach(function (d) {
      if (vis(d) && DAY_RE.test(txt(d)) && txt(d).length <= 4 && d.children.length === 0) {
        add(d, "xn-menu-day-head");
        if (d.parentElement) add(d.parentElement, "xn-menu-day");
      }
    });

    // 餐行
    q("li", root).forEach(function (li) {
      if (!vis(li)) return;
      var t = txt(li);
      if (!/^(早餐|午餐|晚餐)/.test(t) || li.getBoundingClientRect().height > 80) return;
      add(li, "xn-menu-row");
      var spans = q(":scope > span", li);
      if (spans[0]) add(spans[0], "xn-menu-meal");
      if (spans[1]) {
        add(spans[1], "xn-menu-dish");
        q("span", spans[1]).forEach(function (x) {
          if (/^[荤素]$/.test(txt(x))) add(x, "xn-menu-tag");
        });
      }
      var btn = li.querySelector("button");
      if (btn) decorateLock(btn, li);
    });
  }

  function decorateLock(btn, row) {
    add(btn, "xn-menu-lock");
    var meal = "";
    var first = row ? row.querySelector("span") : null;
    if (first) meal = txt(first);
    var day = "";
    var up = btn;
    for (var i = 0; i < 6 && up; i++) {
      up = up.parentElement;
      var m = up ? txt(up).match(DAY_RE) : null;
      if (m) { day = m[0]; break; }
    }
    var icon = btn.querySelector("svg");
    var locked = icon ? /lucide-lock(?!-open)/.test(icon.getAttribute("class") || "") : false;
    setAttr(btn, "aria-pressed", locked ? "true" : "false");
    btn.setAttribute("aria-label", (day || "") + (meal || "") + (locked ? "：已锁定，点击取消" : "：未锁定，点击锁定"));
    btn.setAttribute("title", (day || "") + (meal || ""));
  }

  var busy = false;
  function enhance() {
    if (busy) return;
    busy = true;
    try {
      var root = document.getElementById("root");
      if (!root) return;
      tabs(root);
      controls(root);
      days(root);
    } catch (e) {
      /* 静默 */
    } finally {
      busy = false;
    }
  }

  var timer = 0;
  function schedule() { clearTimeout(timer); timer = setTimeout(enhance, 90); }

  function bind() {
    var root = document.getElementById("root");
    if (!root) { setTimeout(bind, 300); return; }
    enhance();
    if (window.MutationObserver) new MutationObserver(schedule).observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "aria-label"] });
    setTimeout(enhance, 800);
    setInterval(schedule, 1500);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
})();
