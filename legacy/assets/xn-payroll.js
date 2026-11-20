/* R1101 工资与加班费计算合集 — 人用友好增强（幂等）
   1. tab aria-current
   2. 数字字段常用值胶囊
   3. 结果自动计算（有「计算」按钮的 tab）
   4. 按钮 aria 与复制提示
   不改 React 逻辑。 */
(function () {
  if (window.__xnPayroll) return;
  window.__xnPayroll = 1;

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

  var PRESETS = [
    [/^月薪（元）$/, [5000, 8000, 10000, 15000, 20000]],
    [/^工作日加班小时$/, [1, 2, 4, 8]],
    [/^休息日加班小时$/, [0, 2, 4, 8]],
    [/^法定节假日加班小时$/, [0, 8]],
    [/^日工资（元）$/, [200, 300, 400, 500]],
    [/^法定节假日加班天数$/, [0, 1, 2, 3]],
    [/^休息日加班天数$/, [0, 1, 2]],
    [/^本月加班小时$/, [0, 20, 36, 45]],
    [/^单日最长加班小时$/, [2, 3, 4]],
    [/^本周休息天数$/, [0, 1, 2]],
    [/^夜班小时$/, [0, 20, 40, 60]],
    [/^夜班津贴标准（元\/小时）$/, [5, 10, 15, 20]],
    [/^值班天数$/, [0, 1, 2, 3]],
    [/^值班津贴标准（元\/天）$/, [50, 100, 200]],
    [/^税前月薪（元）$/, [8000, 12000, 20000, 30000]],
    [/^社保公积金缴费基数（元）$/, [8000, 12000, 20000]],
    [/^专项附加扣除（月合计，元）$/, [0, 1000, 2000, 3000]],
    [/^年终奖金额（元）$/, [0, 10000, 30000, 50000]],
    [/^请假天数（天）$/, [0.5, 1, 2, 3]],
    [/^当地最低工资标准（元\/月）$/, [2000, 2400, 2690]]
  ];

  function setInput(input, v) {
    var setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    setter.call(input, String(v));
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function tabs(root) {
    var nav = q(".otc-tabs", root)[0];
    if (nav) setAttr(nav, "aria-label", "工具切换");
    q(".otc-tab", root).forEach(function (a) {
      if (a.classList.contains("active")) setAttr(a, "aria-current", "page");
      else if (a.getAttribute("aria-current")) a.removeAttribute("aria-current");
    });
  }

  function fields(root) {
    q(".otc-input-group", root).forEach(function (g) {
      if (!vis(g)) return;
      var input = g.querySelector('input[type="number"]');
      if (!input) return;
      var labelEl = g.querySelector(".otc-label");
      var name = labelEl ? txt(labelEl) : (input.getAttribute("aria-label") || "");
      if (!name) return;
      var rule = PRESETS.filter(function (r) { return r[0].test(name); })[0];
      if (!rule) return;
      var box = g.querySelector(".xn-pay-presets");
      if (!box) {
        box = document.createElement("div");
        box.className = "xn-pay-presets";
        box.setAttribute("role", "group");
        box.setAttribute("aria-label", name + "常用值");
        rule[1].forEach(function (v) {
          var b = document.createElement("button");
          b.type = "button";
          b.textContent = String(v);
          b.setAttribute("aria-label", "设为 " + v);
          b.addEventListener("click", function () { setInput(input, v); });
          box.appendChild(b);
        });
        g.appendChild(box);
      }
      var cur = parseFloat(input.value);
      q("button", box).forEach(function (b) {
        setAttr(b, "data-xn-active", parseFloat(b.textContent) === cur ? "1" : "0");
      });
    });
  }

  function toggles(root) {
    q(".otc-toggle", root).forEach(function (b) {
      if (!vis(b)) return;
      setAttr(b, "aria-label", "是否安排补休（休息日）");
      setAttr(b, "aria-pressed", b.classList.contains("on") ? "true" : "false");
    });
  }

  function buttons(root) {
    q("button", root).forEach(function (b) {
      if (!vis(b)) return;
      var t = txt(b);
      if (t === "计算") {
        if (b.getAttribute("aria-label") !== "重新计算") setAttr(b, "aria-label", "重新计算");
        if (!b.getAttribute("title")) b.setAttribute("title", "根据当前输入重新计算");
      } else if (t === "复制结果") {
        if (b.getAttribute("aria-label") !== "复制计算结果") setAttr(b, "aria-label", "复制计算结果");
        if (!b.getAttribute("title")) b.setAttribute("title", "复制计算结果到剪贴板");
      } else if (t === "清空") {
        if (b.getAttribute("aria-label") !== "清空并恢复默认值") setAttr(b, "aria-label", "清空并恢复默认值");
      }
    });
    q("select", root).forEach(function (s) {
      if (s.getAttribute("aria-label") === "月计薪天数" && !s.getAttribute("title")) {
        s.setAttribute("title", "法定月计薪天数为 21.75 天");
      }
    });
  }

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

  var busy = false;
  function enhance() {
    if (busy) return;
    busy = true;
    try {
      var root = document.getElementById("root");
      if (!root) return;
      root.setAttribute("data-xn-payroll", "1");
      tabs(root);
      fields(root);
      buttons(root);
      toggles(root);
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

  var calcTimer = 0;
  function autoCalc() {
    clearTimeout(calcTimer);
    calcTimer = setTimeout(function () {
      var b = q("button").filter(function (x) {
        return vis(x) && txt(x) === "计算";
      })[0];
      if (b) b.click();
    }, 280);
  }

  function bind() {
    var root = document.getElementById("root");
    if (!root) { setTimeout(bind, 300); return; }
    enhance();
    if (window.MutationObserver) new MutationObserver(schedule).observe(root, { childList: true, subtree: true });
    window.addEventListener("hashchange", function () {
      setTimeout(enhance, 150);
      setTimeout(autoCalc, 260);
    });
    document.addEventListener("input", function (e) {
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "SELECT")) {
        autoCalc();
        schedule();
      }
    }, true);
    document.addEventListener("change", function (e) {
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "SELECT")) autoCalc();
    }, true);
    document.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("button");
      if (b && txt(b) === "复制结果") toast("已复制到剪贴板");
    }, true);
    setInterval(schedule, 1800);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
