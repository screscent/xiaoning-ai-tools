/* R1097 验房与收房检查合集 — 人用友好增强（幂等）
   1. 清单勾选行语义与触达
   2. 进度状态、进度条 ARIA 与配色
   3. 分类计数可读性
   4. 遗漏项默认折叠（25 条不再顶在清单前）
   5. B–F 工具的小按钮 / 筛选 / 结果指标一致性
   不改 React 状态，只补样式钩子与 ARIA。 */
(function () {
  if (window.__xnInspect) return;
  window.__xnInspect = 1;

  var missOpen = false;

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
  function setAttr(el, k, v) {
    if (el.getAttribute(k) !== v) el.setAttribute(k, v);
  }

  function paintMiss(sec) {
    var count = sec.querySelectorAll("li").length;
    var btn = sec.querySelector(".xn-miss-toggle");
    var open = count <= 4 ? true : missOpen;
    setAttr(sec, "data-xn-empty", count === 0 ? "1" : "0");
    setAttr(sec, "data-xn-open", open ? "1" : "0");
    if (btn) {
      btn.style.display = count <= 4 ? "none" : "";
      var label = open ? "收起" : "展开 " + count + " 项";
      if (btn.textContent !== label) btn.textContent = label;
      setAttr(btn, "aria-expanded", open ? "true" : "false");
    }
  }

  function enhanceProgress(root) {
    var countEl = q("span", root).filter(function (s) {
      return !s.children.length && /已完成\s*\d+\s*\/\s*\d+\s*项/.test(txt(s));
    })[0];
    if (!countEl) return;

    var m = /已完成\s*(\d+)\s*\/\s*(\d+)\s*项/.exec(txt(countEl));
    if (!m) return;
    var done = +m[1], total = +m[2];
    var state = done === 0 ? "zero" : done >= total ? "done" : "active";

    var box = countEl.closest("div.mt-5.border-t") || countEl.parentElement.parentElement;
    box.classList.add("xn-progress-box");
    setAttr(box, "data-xn-state", state);

    var num = countEl.parentElement.querySelector(".text-4xl");
    if (num) num.classList.add("xn-progress-num");

    countEl.classList.add("xn-progress-count");
    setAttr(countEl, "aria-live", "polite");
    countEl.parentElement.classList.add("xn-progress-line");

    var status = box.querySelector(".xn-inspect-status");
    if (!status) {
      status = document.createElement("span");
      status.className = "xn-inspect-status";
      countEl.parentElement.appendChild(status);
    }
    var label = state === "zero" ? "未开始" : state === "done" ? "已全部完成" : "进行中";
    if (status.textContent !== label) status.textContent = label;

    var bar = box.querySelector(".mt-3.h-2") || box.querySelector("div[class*='h-2'][class*='rounded-full']");
    if (bar) {
      bar.classList.add("xn-bar");
      setAttr(bar, "data-xn-state", state);
      setAttr(bar, "role", "progressbar");
      setAttr(bar, "aria-label", "验房完成进度");
      setAttr(bar, "aria-valuemin", "0");
      setAttr(bar, "aria-valuemax", String(total));
      setAttr(bar, "aria-valuenow", String(done));
      setAttr(bar, "aria-valuetext", "已完成 " + done + " 项，共 " + total + " 项");
    }
  }

  function enhance() {
    var root = document.getElementById("root");
    if (!root) return;
    root.setAttribute("data-xn-inspect", "1");

    // 顶部工具切换
    q('nav a[href^="#/"]', root).forEach(function (a) {
      a.classList.add("xn-tab-link");
    });

    // 毛坯 / 精装分段
    var seg = q("div.flex.rounded-xl.border.border-slate-200.bg-slate-50.p-1", root)[0];
    if (seg) {
      seg.classList.add("xn-seg");
      setAttr(seg, "role", "group");
      setAttr(seg, "aria-label", "房屋类型");
      q("button[aria-pressed]", seg).forEach(function (b) {
        b.classList.add("xn-check-seg");
      });
    }

    // 工具头部图标
    q("span.bg-blue-600", root).forEach(function (s) {
      if (s.className.indexOf("size-9") >= 0) s.classList.add("xn-tool-icon");
    });

    // A：清单勾选行
    q("li button[aria-pressed]", root).filter(vis).forEach(function (b) {
      b.classList.add("xn-check");
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", txt(b));
    });

    // A：分类计数
    q("span.tnum.ml-auto", root).forEach(function (s) {
      if (s.children.length) return;
      var t = txt(s);
      var m = /^(\d+)\s*\/\s*(\d+)$/.exec(t);
      if (!m) return;
      var card = s.closest("div.overflow-hidden.rounded-2xl");
      if (!card) return;
      s.classList.add("xn-cat-count");
      if (s.parentElement) s.parentElement.classList.add("xn-cat-head");
      var d = +m[1], total = +m[2];
      card.classList.toggle("xn-cat-done", total > 0 && d === total);
      var label = "已完成 " + d + " 项，共 " + total + " 项";
      setAttr(s, "title", label);
      setAttr(s, "aria-label", label);
    });

    // A：进度
    enhanceProgress(root);

    // A：全部勾选 / 重置
    q("button", root).forEach(function (b) {
      var t = txt(b);
      if (t === "全部勾选") {
        b.classList.add("xn-action-btn");
        setAttr(b, "aria-label", "全部勾选，共 25 项");
      } else if (t === "重置") {
        b.classList.add("xn-action-btn");
        setAttr(b, "aria-label", "重置所有检查项");
      }
    });

    // A：遗漏项折叠（全部勾选后该面板会换成完成文案，仍需按剩余数收起）
    q("div.mt-4.rounded-xl", root).forEach(function (sec) {
      if (!/遗漏项/.test(sec.textContent)) return;
      sec.classList.add("xn-miss");
      var head = sec.firstElementChild;
      if (!head) return;
      head.classList.add("xn-miss-head");
      var btn = head.querySelector(".xn-miss-toggle");
      if (!btn) {
        btn = document.createElement("button");
        btn.type = "button";
        btn.className = "xn-miss-toggle";
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          missOpen = !missOpen;
          paintMiss(sec);
        });
        head.appendChild(btn);
      }
      var list = sec.querySelector("ul");
      if (list) {
        if (!list.id) list.id = "xn-miss-list";
        setAttr(btn, "aria-controls", list.id);
      }
      paintMiss(sec);
    });

    // B–F：结果卡与指标
    q("div.rounded-2xl", root).forEach(function (card) {
      var h3 = q("h3", card).filter(function (h) {
        return h.closest("div.rounded-2xl") === card;
      })[0];
      if (!h3) return;
      if (!/核对结果|测算结果|清单要点与时长/.test(txt(h3))) return;
      card.classList.add("xn-result");
      var grid = card.querySelector("div.mt-4.grid");
      if (grid && grid.className.indexOf("grid-cols-3") >= 0) {
        grid.classList.add("xn-metrics");
        q(":scope > div", grid).forEach(function (tile) {
          tile.classList.add("xn-metric");
        });
      }
    });

    // B：示例填充按钮
    q("button", root).forEach(function (b) {
      if (/^(多层|小高层|高层)\s/.test(txt(b)) && b.className.indexOf("rounded-full") >= 0) {
        b.classList.add("xn-preset");
      }
    });

    // D/E/F：恢复默认
    q("button", root).forEach(function (b) {
      if (txt(b) === "恢复默认") {
        b.classList.add("xn-reset");
        setAttr(b, "aria-label", "恢复默认值");
      }
    });

    // C：状态筛选
    q("button", root).forEach(function (b) {
      var t = txt(b);
      if (!/^(全部|待整改|整改中|已整改)\s*\d*$/.test(t)) return;
      if (b.className.indexOf("rounded-lg") < 0) return;
      b.classList.add("xn-filter");
      setAttr(b, "aria-pressed", b.className.indexOf("bg-blue-600") >= 0 ? "true" : "false");
    });

    // F：交接步骤序号
    q("li > span.tnum.size-5", root).forEach(function (s) {
      s.classList.add("xn-step-num");
    });
  }

  var timer = null;
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(enhance, 90);
  }

  function boot() {
    var root = document.getElementById("root");
    if (!root) {
      setTimeout(boot, 300);
      return;
    }
    enhance();
    var mo = new MutationObserver(schedule);
    mo.observe(root, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["aria-pressed", "class", "style"]
    });
    window.addEventListener("hashchange", function () {
      setTimeout(enhance, 150);
    });
    setTimeout(enhance, 500);
    setTimeout(enhance, 1600);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
