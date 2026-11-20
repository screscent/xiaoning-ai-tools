/* R1102 羽毛球入门与装备合集 — 人用友好增强（幂等）
   1. 工具E/F → 工具 05/06；tab/分段 aria
   2. 成本与预约输入：常用值胶囊
   3. 结果 KPI 钩子、复制按钮命名与提示
   不改 React 逻辑。 */
(function () {
  if (window.__xnBadminton) return;
  window.__xnBadminton = 1;

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
    [/^场地单价/, [60, 80, 100, 120]],
    [/^每次时长/, [1, 1.5, 2]],
    [/^用球个数/, [2, 3, 6, 12]],
    [/^球单价/, [5, 8, 10, 12]],
    [/^参与人数/, [2, 4, 6, 8]],
    [/^场地每小时费用/, [60, 80, 100]],
    [/^使用小时/, [1, 1.5, 2]]
  ];

  function setInput(input, v) {
    var setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    setter.call(input, String(v));
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function normalize(root) {
    q("h1,h2,h3", root).forEach(function (h) {
      var t = txt(h);
      var n = t.replace(/^工具E\s*/, "工具 05 ").replace(/^工具F\s*/, "工具 06 ");
      if (n !== t) h.textContent = n;
    });
  }

  function tabs(root) {
    q("div.grid", root).forEach(function (g) {
      var c = g.className || "";
      if (c.indexOf("grid-cols-6") >= 0 && c.indexOf("max-w-4xl") >= 0) add(g, "xn-bm-tabs");
    });
    q(".xn-bm-tabs > a", root).forEach(function (a) {
      if (a.getAttribute("aria-current") === "page") return;
      if (a.classList.contains("bg-emerald-600")) setAttr(a, "aria-current", "page");
    });
  }

  function segments(root) {
    q("button", root).forEach(function (b) {
      var c = b.className || "";
      if (c.indexOf("flex-1 rounded-lg") < 0) return;
      if (!vis(b)) return;
      var t = txt(b);
      if (!t) return;
      add(b, "xn-bm-seg");
      setAttr(b, "aria-pressed", c.indexOf("bg-white") >= 0 ? "true" : "false");
      var box = b.parentElement;
      if (box) add(box, "xn-bm-segbox");
      if (box && !box.getAttribute("role")) {
        box.setAttribute("role", "group");
        var label = /^(新手|进阶|高手)$/.test(t) ? "你的水平"
          : /^(进攻|控球|双打前场)$/.test(t) ? "你的打法"
          : /^(单打视角|双打视角)$/.test(t) ? "视角切换" : "选项";
        box.setAttribute("aria-label", label);
      }
    });
  }

  function fields(root) {
    q('input[type="number"]', root).forEach(function (input) {
      if (!vis(input)) return;
      var aria = input.getAttribute("aria-label") || "";
      if (!aria) return;
      var rule = PRESETS.filter(function (r) { return r[0].test(aria); })[0];
      if (!rule) return;
      var wrap = input.closest("div");
      var group = wrap && wrap.parentElement;
      if (!group) return;
      var box = group.querySelector(".xn-bm-presets");
      if (!box) {
        box = document.createElement("div");
        box.className = "xn-bm-presets";
        box.setAttribute("role", "group");
        box.setAttribute("aria-label", aria.split("（")[0] + "常用值");
        rule[1].forEach(function (v) {
          var b = document.createElement("button");
          b.type = "button";
          b.textContent = String(v);
          b.setAttribute("aria-label", "设为 " + v);
          b.addEventListener("click", function () {
            setInput(input, v);
            q("button", box).forEach(function (x) {
              setAttr(x, "data-xn-active", parseFloat(x.textContent) === parseFloat(v) ? "1" : "0");
            });
          });
          box.appendChild(b);
        });
        group.appendChild(box);
      }
      var cur = parseFloat(input.value);
      q("button", box).forEach(function (b) {
        setAttr(b, "data-xn-active", parseFloat(b.textContent) === cur ? "1" : "0");
      });
    });
  }

  function blocks(root) {
    q("div.rounded-2xl", root).forEach(function (card) {
      if (!vis(card)) return;
      if (!/每次总成本|总费用（场地费）/.test(card.textContent)) return;
      if (card.getBoundingClientRect().height > 900) return;
      add(card, "xn-bm-hero");
      var grid = card.querySelector("div.grid");
      if (grid) add(grid, (grid.className || "").indexOf("grid-cols-3") >= 0 ? "xn-bm-kpis3" : "xn-bm-kpis");
    });
    // 五个字段的成本输入：3 + 2 排列
    q("div.grid", root).forEach(function (g) {
      if (!vis(g)) return;
      if (g.children.length !== 5) return;
      if (!g.querySelector('input[type="number"]')) return;
      add(g, "xn-bm-grid5");
    });
    // 结果 KPI 卡（球拍/用球/计分）
    q("div", root).forEach(function (d) {
      if (!vis(d)) return;
      if (d.textContent.indexOf("输入即出结果") < 0) return;
      if (d.getBoundingClientRect().height > 700) return;
      var card = d.closest("div.rounded-2xl");
      if (!card) return;
      var grid = card.querySelector("div.grid");
      if (grid && !grid.querySelector("input")) add(grid, "xn-bm-kpis");
    });
    q("span", root).forEach(function (s) {
      if (!/^(违例|合法)$/.test(txt(s))) return;
      add(s, "xn-bm-badge");
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

  function buttons(root) {
    q("button", root).forEach(function (b) {
      if (!vis(b)) return;
      var t = txt(b);
      if (t.indexOf("复制") !== 0) return;
      add(b, "xn-bm-copy");
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", t);
      if (!b.getAttribute("title")) b.setAttribute("title", "复制到剪贴板");
    });
  }

  var busy = false;
  function enhance() {
    if (busy) return;
    busy = true;
    try {
      var root = document.getElementById("root");
      if (!root) return;
      root.setAttribute("data-xn-badminton", "1");
      normalize(root);
      tabs(root);
      segments(root);
      fields(root);
      blocks(root);
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
    window.addEventListener("hashchange", function () { setTimeout(enhance, 160); });
    document.addEventListener("input", function (e) {
      if (e.target && e.target.tagName === "INPUT") schedule();
    }, true);
    setInterval(schedule, 1800);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
