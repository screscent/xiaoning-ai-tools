/* 小凝工具站 · 轮播图与指示点增强 xn-carousel v1
 * 能力：切换条 44px + aria-label/aria-current；数字/下拉语义名与常用值胶囊；
 *       开关可点区 44px；复制/清空具名 44px；摘要数字放大；回到顶部。
 * 注入：legacy/fr2tregsra.html 的 xn-ux 脚本后追加 <script defer>。
 */
(function () {
  "use strict";
  if (window.__XN_CAROUSEL__) return;
  window.__XN_CAROUSEL__ = true;

  function vis(el) {
    return el && el.getBoundingClientRect().height > 0;
  }

  var TOOLS = {
    carousel: {
      key: "carousel",
      name: "轮播图",
      desc: "CSS 轮播图样式生成器",
      nums: ["轮播宽度（像素）", "轮播高度（像素）", "圆角半径（像素）"],
      selects: ["切换间隔（每张停留秒数）"],
      chips: [
        [{ l: "640 常用", v: 640 }, { l: "800 宽屏", v: 800 }, { l: "1200 大图", v: 1200 }],
        [{ l: "360 16:9", v: 360 }, { l: "450 3:2", v: 450 }, { l: "600 方图", v: 600 }],
        [{ l: "0 直角", v: 0 }, { l: "12 默认", v: 12 }, { l: "24 圆润", v: 24 }]
      ]
    },
    dots: {
      key: "dots",
      name: "指示点",
      desc: "指示点与自动播放关键帧",
      nums: ["指示点张数（2 到 8 张）", "自动播放间隔（秒）"],
      selects: ["指示点样式（圆点或长条）"],
      chips: [
        [{ l: "3 张", v: 3 }, { l: "5 张", v: 5 }, { l: "8 张", v: 8 }],
        [{ l: "3 秒", v: 3 }, { l: "4 秒", v: 4 }, { l: "6 秒", v: 6 }]
      ]
    }
  };

  function currentKey() {
    var h = String(location.hash || "");
    return h.indexOf("dots") >= 0 ? "dots" : "carousel";
  }

  var nativeInput = null;
  function setValue(el, v) {
    try {
      if (!nativeInput) {
        var proto = el.tagName === "SELECT" ? window.HTMLSelectElement.prototype : window.HTMLInputElement.prototype;
        nativeInput = Object.getOwnPropertyDescriptor(proto, "value").set;
      }
      nativeInput.call(el, String(v));
    } catch (e) {
      el.value = String(v);
    }
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.dispatchEvent(new Event("blur", { bubbles: true }));
  }

  function addChips(el, vals) {
    var label = el.closest("label");
    var host = label || el.parentElement;
    if (!host || host.querySelector(".xn-cr-chips")) return;
    var row = document.createElement("div");
    row.className = "xn-cr-chips";
    row.setAttribute("role", "group");
    row.setAttribute("aria-label", "常用值");
    vals.forEach(function (item) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = item.l;
      b.setAttribute("aria-label", "填入 " + item.l);
      b.addEventListener("click", function (ev) {
        ev.preventDefault();
        setValue(el, item.v);
      });
      row.appendChild(b);
    });
    host.appendChild(row);
  }

  function markTabs() {
    var key = currentKey();
    var tabs = Array.prototype.filter.call(document.querySelectorAll('#root a[href^="#/"]'), vis);
    tabs.forEach(function (a) {
      var seg = (a.getAttribute("href") || "").replace(/^#\/?/, "");
      var meta = TOOLS[seg];
      if (meta) {
        var label = meta.name + "（" + meta.desc + "）";
        if (a.getAttribute("aria-label") !== label) a.setAttribute("aria-label", label);
      }
      if (seg === key) {
        if (a.getAttribute("aria-current") !== "page") a.setAttribute("aria-current", "page");
      } else if (a.hasAttribute("aria-current")) {
        a.removeAttribute("aria-current");
      }
    });
    var bar = tabs[0] && tabs[0].parentElement;
    if (bar && bar.classList && !bar.classList.contains("xn-cr-tabbar")) bar.classList.add("xn-cr-tabbar");
  }

  function markFields() {
    var meta = TOOLS[currentKey()];
    if (!meta) return;
    var nums = Array.prototype.filter.call(document.querySelectorAll('#root input[type="number"]'), vis);
    nums.forEach(function (inp, i) {
      if (meta.nums[i] && inp.getAttribute("aria-label") !== meta.nums[i]) inp.setAttribute("aria-label", meta.nums[i]);
      if (meta.chips[i]) addChips(inp, meta.chips[i]);
    });
    var selects = Array.prototype.filter.call(document.querySelectorAll("#root select"), vis);
    selects.forEach(function (sel, i) {
      if (meta.selects[i] && sel.getAttribute("aria-label") !== meta.selects[i]) sel.setAttribute("aria-label", meta.selects[i]);
    });
    var sw = document.querySelector('#root button[role="switch"]');
    if (sw) {
      if (!sw.hasAttribute("aria-checked")) sw.setAttribute("aria-checked", String(sw.className.indexOf("bg-slate-900") >= 0));
      if (sw.getAttribute("aria-label") !== "自动播放开关") sw.setAttribute("aria-label", "自动播放开关");
      if (!sw.title) sw.title = "自动播放开关";
    }
    var color = document.querySelector('#root input[type="color"]');
    if (color) {
      if (color.getAttribute("aria-label") !== "指示点颜色（十六进制）") color.setAttribute("aria-label", "指示点颜色（十六进制）");
      if (!color.title) color.title = "选择指示点颜色";
    }
  }

  function markButtons() {
    var seen = {};
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (!vis(b)) return;
      var text = (b.textContent || "").replace(/\s+/g, "").trim();
      var sec = b.closest("section");
      var hasPre = !!(sec && sec.querySelector("pre"));
      var aria = "";
      if (text === "清空") aria = "清空参数并恢复默认";
      else if (text === "复制代码") {
        var p = b.parentElement && b.parentElement.querySelector("p");
        var desc = p ? (p.textContent || "") : "";
        if (/HTML/i.test(desc)) aria = "复制指示点 HTML 结构";
        else if (/CSS/i.test(desc)) aria = "复制指示点 CSS 代码";
        else aria = "复制指示点 CSS 代码（顶部）";
      } else if (text === "复制CSS") {
        aria = hasPre ? "复制 CSS 代码（代码区）" : "复制 CSS 代码";
      } else if (text === "复制HTML") {
        var isDots = Array.prototype.some.call(document.querySelectorAll(".dot-stage"), function (el) {
          return el.getBoundingClientRect().height > 0;
        });
        aria = isDots ? "复制指示点 HTML 结构" : (hasPre ? "复制 HTML 结构（代码区）" : "复制 HTML 结构");
      }
      if (aria) {
        if (seen[aria]) { seen[aria] += 1; aria += " " + seen[aria]; } else { seen[aria] = 1; }
        if (b.getAttribute("aria-label") !== aria) b.setAttribute("aria-label", aria);
        if (!b.title) b.title = aria;
      }
    });
  }

  function markPills() {
    Array.prototype.forEach.call(document.querySelectorAll('#root div[class*="rounded-lg"][class*="px-2.5"]'), function (d) {
      if (!vis(d)) return;
      var t = (d.textContent || "").replace(/\s+/g, " ").trim();
      if (!d.getAttribute("aria-label") && t) d.setAttribute("aria-label", t);
      if (!d.getAttribute("role")) d.setAttribute("role", "group");
    });
  }

  var topBtn = null;
  function ensureTop() {
    if (topBtn && document.body.contains(topBtn)) return;
    topBtn = document.createElement("button");
    topBtn.type = "button";
    topBtn.className = "xn-cr-top";
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
      markTabs();
      markFields();
      markButtons();
      markPills();
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
