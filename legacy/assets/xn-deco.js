/* R1104 家居软装尺寸合集 — 人用友好增强（幂等）
   1. 工具E/F 文案归一
   2. tab 容器语义与移动横滑
   3. 步进器触达、常用值
   4. 选项卡 aria、复制/使用说明语义
   不改 React 逻辑。 */
(function () {
  if (window.__xnDeco) return;
  window.__xnDeco = 1;

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
    [/^窗宽/, [200, 240, 280, 320]],
    [/^窗高$/, [240, 260, 280]],
    [/^软装总预算/, [10000, 20000, 30000, 50000]],
    [/^房间数/, [2, 3, 4]]
  ];

  function setInput(input, v) {
    var setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    setter.call(input, String(v));
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function normalize(root) {
    q("h1,h2,h3", root).forEach(function (h) {
      if (h.children.length) return;
      var t = txt(h);
      var n = t.replace(/^工具[EF]\s*/, "");
      if (n !== t && n) h.textContent = n;
    });
    q("span", root).forEach(function (s) {
      if (s.children.length) return;
      var t = txt(s);
      if (!/^工具[EF]\s*\S/.test(t)) return;
      s.textContent = t.replace(/^工具[EF]\s*/, "");
    });
  }

  function tabs(root) {
    var anchors = q('a[href^="#/"]', root);
    if (!anchors.length) return;
    var box = anchors[0].parentElement;
    if (box) add(box, "xn-deco-tabs");
    anchors.forEach(function (a) {
      var c = a.className || "";
      if (c.indexOf("border-[#b0704b]") >= 0) setAttr(a, "aria-current", "page");
      else if (a.getAttribute("aria-current")) a.removeAttribute("aria-current");
    });
  }

  function steppers(root) {
    q("div.flex.items-center.overflow-hidden", root).forEach(function (w) {
      if (!w.querySelector('input[inputmode="numeric"]')) return;
      if (!vis(w)) return;
      add(w, "xn-stepper");
      q("button", w).forEach(function (b) {
        if (!b.getAttribute("aria-label")) {
          b.setAttribute("aria-label", txt(b) === "+" ? "增加" : "减少");
        }
      });
      var input = w.querySelector("input");
      input.style.setProperty("font-size", "20px", "important");
      var aria = input.getAttribute("aria-label") || "";
      var rule = PRESETS.filter(function (r) { return r[0].test(aria); })[0];
      if (!rule) return;
      var group = w.parentElement;
      if (!group) return;
      var box = group.querySelector(".xn-deco-presets");
      if (!box) {
        box = document.createElement("div");
        box.className = "xn-deco-presets";
        box.setAttribute("role", "group");
        box.setAttribute("aria-label", aria + "常用值");
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

  function options(root) {
    q("button", root).forEach(function (b) {
      var c = b.className || "";
      if (c.indexOf("rounded-xl border px-3 py-2 text-left") < 0) return;
      if (!vis(b)) return;
      add(b, "xn-deco-opt");
      setAttr(b, "aria-pressed", c.indexOf("border-[#b0704b]") >= 0 ? "true" : "false");
      var box = b.parentElement;
      if (box && !box.getAttribute("role")) {
        box.setAttribute("role", "group");
        box.setAttribute("aria-label", "选项");
      }
    });
  }

  function blocks(root) {
    q("div", root).forEach(function (d) {
      if (!vis(d)) return;
      if (d.getBoundingClientRect().height > 620) return;
      if (d.textContent.indexOf("复制结果") < 0) return;
      var big = d.querySelector('span[class*="text-[34px]"]');
      if (big) add(d, "xn-deco-result");
    });
    q("button", root).forEach(function (b) {
      if (!vis(b)) return;
      var t = txt(b);
      if (t === "复制结果") {
        add(b, "xn-deco-copy");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "复制计算结果");
        if (!b.getAttribute("title")) b.setAttribute("title", "复制计算结果到剪贴板");
      } else if (t.indexOf("使用说明") === 0) {
        add(b, "xn-deco-usage");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "展开使用说明");
      }
    });
  }

  var busy = false;
  function enhance() {
    if (busy) return;
    busy = true;
    try {
      var root = document.getElementById("root");
      if (!root) return;
      root.setAttribute("data-xn-deco", "1");
      normalize(root);
      tabs(root);
      steppers(root);
      options(root);
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
    window.addEventListener("hashchange", function () { setTimeout(enhance, 160); });
    document.addEventListener("input", function (e) {
      if (e.target && e.target.tagName === "INPUT") schedule();
    }, true);
    setInterval(schedule, 2000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
