/* R1100 居家烘焙换算合集 — 人用友好增强（幂等）
   1. 工具E/F 占位与 tab 文案归一；路由串隐藏
   2. 数字/下拉 aria 语义化
   3. 数量 / 份数常用值胶囊
   4. 全部复制按钮：可读标签 + 触达 + 图标补字
   5. 结果 hero / 换算卡 / 表格钩子
   不改 React 逻辑。 */
(function () {
  if (window.__xnBaking) return;
  window.__xnBaking = 1;

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

  /* 1. 文案与路由串 */
  function normalize(root) {
    q("nav a", root).forEach(function (a) {
      q("span", a).forEach(function (s) {
        if (s.children.length) return;
        var t = txt(s);
        if (/^工具[A-F]\s*\S/.test(t)) s.textContent = t.replace(/^工具[A-F]\s*/, "");
      });
    });
    q("h1,h2,h3", root).forEach(function (h) {
      var t = txt(h);
      var n = t.replace(/^工具[A-F]\s*/, "");
      if (n !== t && n) h.textContent = n;
    });
    q("span", root).forEach(function (s) {
      if (s.children.length) return;
      var t = txt(s);
      if (!/^#\/[\w-]+$/.test(t)) return;
      add(s, "xn-route-hint");
      s.setAttribute("aria-hidden", "true");
    });
  }

  /* 2/3. 字段 */
  var PRESETS = [
    [/^数量$/, [0.5, 1, 1.5, 2, 3]],
    [/^原配方份数$/, [2, 4, 6, 8]],
    [/^目标份数$/, [4, 6, 8, 12]]
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
      var ctl = lab.querySelector('input[type="number"],select');
      if (!ctl) return;
      var nameEl = lab.querySelector("div > span");
      var name = nameEl ? txt(nameEl) : "";
      if (name) {
        if (ctl.getAttribute("aria-label") !== name) ctl.setAttribute("aria-label", name);
        if (!ctl.getAttribute("title")) ctl.setAttribute("title", name);
      }
      if (!ctl.matches('input[type="number"]') || !name) return;
      var rule = PRESETS.filter(function (r) { return r[0].test(name); })[0];
      if (!rule) return;
      var box = lab.querySelector(".xn-bake-presets");
      if (!box) {
        box = document.createElement("div");
        box.className = "xn-bake-presets";
        box.setAttribute("role", "group");
        box.setAttribute("aria-label", name + "常用值");
        rule[1].forEach(function (v) {
          var b = document.createElement("button");
          b.type = "button";
          b.textContent = String(v);
          b.setAttribute("aria-label", "设为 " + v);
          b.addEventListener("click", function () { setInput(ctl, v); });
          box.appendChild(b);
        });
        lab.appendChild(box);
      }
      var cur = parseFloat(ctl.value);
      q("button", box).forEach(function (b) {
        setAttr(b, "data-xn-active", parseFloat(b.textContent) === cur ? "1" : "0");
      });
    });
  }

  /* 4. 复制按钮 */
  function copyLabel(b) {
    var t = txt(b);
    if (t === "复制结果") return "复制换算结果";
    if (t && t !== "复制") return t;
    var tr = b.closest("tr");
    if (tr) {
      var cells = Array.prototype.slice.call(tr.children).map(txt).filter(function (x) { return x && x !== "复制"; });
      if (cells.length) return "复制 " + cells.join(" ");
    }
    var card = b.closest("div.rounded-xl");
    if (card) {
      var lab = card.querySelector("div");
      var val = card.querySelector("span.font-mono");
      var unit = card.querySelector("span[class*='text-[11.5px]'],span[class*='text-[12px]']");
      var s = [lab ? txt(lab) : "", val ? txt(val) : "", unit ? txt(unit) : ""].join(" ").replace(/\s+/g, " ").trim();
      if (s) return "复制 " + s;
    }
    return t || "复制";
  }

  function buttons(root) {
    q("button", root).forEach(function (b) {
      if (!vis(b)) return;
      var t = txt(b);
      var isCopy = t.indexOf("复制") >= 0 || (!t && b.querySelector("svg.lucide-copy"));
      if (!isCopy) {
        // 症状按钮
        if (/^(塌陷|开裂|不熟|过干)$/.test(t) && b.className.indexOf("rounded") >= 0) {
          add(b, "xn-symptom-btn");
          if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "查看「" + t + "」的排查结果");
        }
        return;
      }
      add(b, "xn-copy-b");
      if (!t) add(b, "xn-icon-only");
      var lab = copyLabel(b);
      if (b.getAttribute("aria-label") !== lab) b.setAttribute("aria-label", lab);
      if (!b.getAttribute("title")) b.setAttribute("title", lab);
    });
  }

  /* 4b. 分段按钮 */
  function segments(root) {
    q("button", root).forEach(function (b) {
      if (!vis(b)) return;
      var c = b.className || "";
      if (c.indexOf("flex-1 rounded-lg") < 0) return;
      var t = txt(b);
      if (!t) return;
      add(b, "xn-seg-btn");
      setAttr(b, "aria-pressed", c.indexOf("bg-white") >= 0 ? "true" : "false");
      var box = b.parentElement;
      if (box && !box.getAttribute("role")) {
        box.setAttribute("role", "group");
        box.setAttribute("aria-label", "选项");
      }
    });
  }

  /* 5. 结果结构 */
  function blocks(root) {
    var hero = q("div.rounded-2xl", root).filter(function (d) {
      return vis(d) && d.textContent.indexOf("换算结果") >= 0 && d.querySelector("span.font-mono") && d.getBoundingClientRect().height < 420;
    })[0];
    if (hero) {
      add(hero, "xn-bake-hero");
      var grid = hero.querySelector("div.grid");
      if (grid) add(grid, "xn-conv");
    }
  }

  var busy = false;
  function enhance() {
    if (busy) return;
    busy = true;
    try {
      var root = document.getElementById("root");
      if (!root) return;
      root.setAttribute("data-xn-baking", "1");
      normalize(root);
      fields(root);
      buttons(root);
      segments(root);
      blocks(root);
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
    setInterval(schedule, 1800);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
