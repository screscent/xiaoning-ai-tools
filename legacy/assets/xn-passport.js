/* R1314 签证材料清单合集 · xn-passport.js
   标题归一 / 导航编号与 aria / 核对进度条 / 复制可读名 / 默认值自动生成 */
(function () {
  if (window.__XN_PASS__) return;
  window.__XN_PASS__ = true;

  var NUMS = ["①", "②", "③", "④", "⑤", "⑥"];
  var CN = ["一", "二", "三", "四", "五", "六"];
  var TITLE_MAP = {
    "旅游签证材料清单": "工具一 · 旅游签证材料清单",
    "商务签证材料清单": "工具二 · 商务签证材料清单",
    "学生签证材料清单": "工具三 · 学生签证材料清单",
    "探亲访友材料清单": "工具四 · 探亲访友材料清单",
    "工具E 工作签证材料": "工具五 · 工作签证材料",
    "工具F 办理时间线": "工具六 · 办理时间线"
  };

  function visible(el) {
    return !!el && el.getBoundingClientRect().height > 0;
  }

  function visibleSection() {
    return Array.prototype.slice.call(document.querySelectorAll('#root section[id^="tool-"]')).filter(visible)[0] || null;
  }

  /* ---- 标题归一 ---- */
  function normalizeHeadings() {
    Array.prototype.forEach.call(document.querySelectorAll("#root section h2"), function (h) {
      var t = h.textContent.trim();
      if (TITLE_MAP[t] && h.textContent !== TITLE_MAP[t]) h.textContent = TITLE_MAP[t];
    });
  }

  /* ---- 导航编号 + aria ---- */
  function enhanceNav() {
    var links = Array.prototype.slice.call(document.querySelectorAll('#root a[href^="#/"]')).filter(visible);
    var hash = (location.hash || "#/tourist").replace("#", "");
    links.forEach(function (a, i) {
      var src = a.getAttribute("data-xn-label");
      if (!src) {
        var leaf = null;
        Array.prototype.forEach.call(a.querySelectorAll("*"), function (el) {
          if (!leaf && el.children.length === 0 && el.textContent.trim()) leaf = el;
        });
        src = (leaf ? leaf.textContent : a.textContent).trim();
        a.setAttribute("data-xn-label", src);
      }
      var want = NUMS[i] + " " + src;
      var leaf2 = null;
      Array.prototype.forEach.call(a.querySelectorAll("*"), function (el) {
        if (!leaf2 && el.children.length === 0 && el.textContent.trim()) leaf2 = el;
      });
      if (leaf2) {
        if (leaf2.textContent !== want) leaf2.textContent = want;
      } else if (a.textContent.trim() !== want) {
        a.textContent = want;
      }
      var href = (a.getAttribute("href") || "").replace("#", "");
      var active = href === hash || /bg-blue-500/.test(a.className);
      if (active) {
        if (a.getAttribute("aria-current") !== "page") a.setAttribute("aria-current", "page");
      } else if (a.hasAttribute("aria-current")) {
        a.removeAttribute("aria-current");
      }
      var al = "工具" + CN[i] + " " + src;
      if (a.getAttribute("aria-label") !== al) a.setAttribute("aria-label", al);
    });
  }

  /* ---- 核对进度条 ---- */
  function updateProgress() {
    var sec = visibleSection();
    if (!sec) return;
    var box = sec.querySelector('input[type="checkbox"]');
    if (!box) return;
    var all = sec.querySelectorAll('input[type="checkbox"]');
    var total = all.length;
    var done = 0;
    Array.prototype.forEach.call(all, function (c) { if (c.checked) done++; });
    var bar = sec.querySelector(".xn-visa-progress");
    if (!bar) {
      var row = sec.querySelector('div[class*="justify-between"][class*="text-xs"]');
      if (!row) return;
      bar = document.createElement("div");
      bar.className = "xn-visa-progress";
      var fill = document.createElement("i");
      bar.appendChild(fill);
      row.parentElement.insertBefore(bar, row.nextSibling);
    }
    var f = bar.querySelector("i");
    if (f) f.style.width = total ? Math.round((done / total) * 100) + "%" : "0%";
    bar.setAttribute("aria-label", "核对进度 " + done + " / " + total + " 项");
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", String(total));
    bar.setAttribute("aria-valuenow", String(done));
  }

  /* ---- 去掉开发者用语「地址栏深链（如 #/tourist）」 ---- */
  function cleanRouteHint() {
    Array.prototype.forEach.call(document.querySelectorAll("#root span"), function (el) {
      if (el.children.length) return;
      if (!/^#\/[\w-]+$/.test(el.textContent.trim())) return;
      var host = el.parentElement;
      if (host && /地址栏深链/.test(host.textContent)) {
        host.textContent = "选择签证类型开始核对：点击下方标签切换，也可以直接用地址栏链接分享当前类型。";
      }
    });
  }

  /* ---- 复制/重置可读名 ---- */
  function enhanceButtons() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      var t = b.textContent.trim();
      if (/一键复制清单/.test(t) && b.getAttribute("aria-label") !== "复制材料清单") b.setAttribute("aria-label", "复制材料清单");
      if (/重置勾选/.test(t) && b.getAttribute("aria-label") !== "重置所有勾选") b.setAttribute("aria-label", "重置所有勾选");
      if (/生成清单|生成时间线/.test(t)) b.style.setProperty("min-height", "48px", "important");
    });
  }

  /* ---- 开关可读名 ---- */
  function enhanceSwitch() {
    Array.prototype.forEach.call(document.querySelectorAll('#root button[role="switch"]'), function (b) {
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "切换是否首次申请");
    });
  }

  /* ---- 输入内联兜底 ---- */
  function enhanceInputs() {
    Array.prototype.forEach.call(document.querySelectorAll('#root select, #root input[type="date"]'), function (el) {
      if (el.getAttribute("data-xn-style") === "1") return;
      el.setAttribute("data-xn-style", "1");
      el.style.setProperty("min-height", "48px", "important");
      el.style.setProperty("font-size", "15.5px", "important");
    });
    Array.prototype.forEach.call(document.querySelectorAll('#root input[type="number"]'), function (el) {
      var al = el.getAttribute("aria-label") || "";
      var map = { "天": "停留天数（天）", "个月": "停留时长（个月）", "年": "工作年限（年）" };
      if (map[al] && el.getAttribute("aria-label") !== map[al]) el.setAttribute("aria-label", map[al]);
    });
  }

  /* ---- 默认值自动生成清单（每个 tab 一次） ---- */
  function autoGenerate() {
    if (!window.__XN_PASS_GEN__) window.__XN_PASS_GEN__ = {};
    var key = location.hash || "#/tourist";
    if (window.__XN_PASS_GEN__[key]) return;
    var sec = visibleSection();
    if (!sec) return;
    if (sec.querySelector('input[type="checkbox"]')) { window.__XN_PASS_GEN__[key] = 1; return; }
    var btn = Array.prototype.slice.call(sec.querySelectorAll("button")).filter(visible).filter(function (b) {
      return /生成清单|生成时间线/.test(b.textContent);
    })[0];
    if (!btn) return;
    window.__XN_PASS_GEN__[key] = 1;
    window.setTimeout(function () {
      try { btn.click(); } catch (e) {}
    }, 460);
  }

  function run() {
    try {
      normalizeHeadings();
      enhanceNav();
      updateProgress();
      enhanceButtons();
      cleanRouteHint();
      enhanceSwitch();
      enhanceInputs();
      autoGenerate();
    } catch (e) {}
  }

  var timer = null;
  function schedule() {
    if (timer) return;
    timer = window.setTimeout(function () {
      timer = null;
      run();
    }, 90);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule);
  else schedule();

  document.addEventListener("click", function (e) {
    var t = e.target;
    if (t && t.closest && (t.closest("button") || t.closest("label") || t.closest("a"))) {
      window.setTimeout(schedule, 140);
      window.setTimeout(schedule, 520);
    }
  });
  document.addEventListener("change", function (e) {
    if (e.target && e.target.type === "checkbox") {
      window.setTimeout(updateProgress, 60);
      window.setTimeout(updateProgress, 260);
    }
  });

  var mo = new MutationObserver(function (muts) {
    for (var i = 0; i < muts.length; i++) {
      if (muts[i].type === "childList" && muts[i].addedNodes.length) { schedule(); return; }
    }
  });
  try {
    mo.observe(document.getElementById("root") || document.body, { childList: true, subtree: true });
  } catch (e) {}
  window.setInterval(run, 1200);
})();
