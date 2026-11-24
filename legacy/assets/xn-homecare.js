/* R1324 家电清洗与保养周期合集 · xn-homecare.js
   工具编号 / 标题归一 / 标签语义 / 结果金额放大 / 首次加载回顶 */
(function () {
  if (window.__XN_HOMECARE__) return;
  window.__XN_HOMECARE__ = true;

  var CN = ["一", "二", "三", "四", "五"];
  var NUM = ["①", "②", "③", "④", "⑤"];
  var COPY_LABELS = ["复制空调清洗结果", "复制洗衣机清洗结果", "复制冰箱清洁结果", "复制油烟机清洗结果", "复制净水滤芯结果"];
  var userNavigated = false;
  var activeHref = "";

  function visible(el) {
    return !!el && el.getBoundingClientRect().height > 0;
  }

  function toolSections() {
    return Array.prototype.slice.call(document.querySelectorAll("#root section")).filter(function (s) {
      var h = s.querySelector("h2");
      return !!h && h.textContent.trim() !== "使用说明";
    });
  }

  /* ---- 标题归一 ---- */
  function normalizeHeadings() {
    toolSections().forEach(function (s, i) {
      var h = s.querySelector("h2");
      var t = h.textContent.trim();
      var name = t.replace(/^工具[一二三四五A-E]\s*[·:：]?\s*/, "").trim() || t;
      var next = "工具" + CN[i] + " · " + name;
      if (t !== next) h.textContent = next;
      h.classList.add("xn-hc-h2");
      s.classList.add("xn-hc-card");
    });
  }

  /* ---- 工具标签 ---- */
  function enhanceTabs() {
    var anchors = Array.prototype.slice.call(document.querySelectorAll('#root a[href^="#/"]'));
    if (!anchors.length) return;
    if (!activeHref) {
      var cur = anchors.filter(function (a) { return a.getAttribute("aria-current") === "true" || a.getAttribute("aria-current") === "page"; })[0];
      activeHref = (cur && cur.getAttribute("href")) || (location.hash && location.hash.indexOf("#/") === 0 ? location.hash : anchors[0].getAttribute("href"));
    }
    anchors.forEach(function (a, i) {
      a.classList.add("xn-hc-tab");
      if (a.getAttribute("data-no") !== NUM[i]) a.setAttribute("data-no", NUM[i]);
      var active = a.getAttribute("href") === activeHref;
      a.classList.toggle("is-active", active);
      if (active) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
      var name = a.textContent.replace(/^[①-⑤]\s*/, "").trim();
      var al = "工具" + CN[i] + "：" + name + (active ? "（当前）" : "");
      if (a.getAttribute("aria-label") !== al) a.setAttribute("aria-label", al);
    });
    var row = anchors[0].parentElement;
    if (row) row.classList.add("xn-hc-tabrow");
  }

  /* ---- 使用说明 ---- */
  function polishGuide() {
    var h = Array.prototype.slice.call(document.querySelectorAll("#root h2")).filter(function (x) {
      return x.textContent.trim() === "使用说明";
    })[0];
    if (h) {
      var sec = h.closest("section") || h.parentElement.parentElement;
      if (sec) sec.classList.add("xn-hc-guide");
    }
    Array.prototype.forEach.call(document.querySelectorAll("#root li, #root p"), function (li) {
      if (li.children.length > 0) return;
      if (/深链/.test(li.textContent)) li.textContent = "① 点选上方工具标签即可切换工具；";
    });
    Array.prototype.forEach.call(document.querySelectorAll("#root span"), function (sp) {
      if (sp.children.length === 0 && /^#\//.test(sp.textContent.trim())) sp.style.display = "none";
    });
  }

  /* ---- 结果行 ---- */
  function enhanceRows() {
    Array.prototype.forEach.call(document.querySelectorAll("#root div"), function (d) {
      var c = String(d.className);
      if (!/justify-between/.test(c) || !/py-2\.5/.test(c)) return;
      if (d.children.length !== 2) return;
      d.classList.add("xn-hc-row");
      var lab = d.children[0];
      var val = d.children[1];
      lab.classList.add("xn-hc-rlabel");
      if (val.children.length) {
        val.children[0].classList.add("xn-hc-ramount");
        for (var i = 1; i < val.children.length; i++) val.children[i].classList.add("xn-hc-rmeta");
      } else {
        val.classList.add("xn-hc-ramount");
      }
    });
    Array.prototype.forEach.call(document.querySelectorAll("#root div"), function (d) {
      if (/bg-sky-50/.test(String(d.className))) d.classList.add("xn-hc-tip");
    });
    Array.prototype.forEach.call(document.querySelectorAll("#root div"), function (d) {
      if (d.children.length === 0 && /保养提醒/.test(d.textContent) && d.getBoundingClientRect().height > 0) {
        d.classList.add("xn-hc-tiptitle");
      }
    });
  }

  /* ---- 按钮 ---- */
  function enhanceButtons() {
    var sections = toolSections();
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      var t = b.textContent.replace(/\s+/g, " ").trim();
      if (t === "计算") {
        b.classList.add("xn-hc-primary");
        if (b.getAttribute("aria-label") !== "开始计算") b.setAttribute("aria-label", "开始计算");
        b.style.setProperty("min-height", "48px", "important");
      } else if (t === "复制结果") {
        b.classList.add("xn-hc-action");
        var sec = b.closest("section");
        var i = sections.indexOf(sec);
        var al = COPY_LABELS[i] || "复制计算结果";
        if (b.getAttribute("aria-label") !== al) b.setAttribute("aria-label", al);
        b.style.setProperty("min-height", "44px", "important");
      }
    });
  }

  /* ---- 控件 ---- */
  function enhanceControls() {
    Array.prototype.forEach.call(document.querySelectorAll("#root select"), function (el) {
      el.style.setProperty("height", "48px", "important");
      el.style.setProperty("min-height", "48px", "important");
      el.style.setProperty("font-size", "16px", "important");
    });
  }

  /* ---- 首次加载回顶（避免自动跳到工具中段） ---- */
  function resetInitialScroll() {
    if (userNavigated) return;
    if (window.scrollY > 0) window.scrollTo(0, 0);
    var row = document.querySelector("#root .xn-hc-tabrow");
    if (row && row.scrollLeft > 0) row.scrollLeft = 0;
  }

  function run() {
    try {
      normalizeHeadings();
      enhanceTabs();
      polishGuide();
      enhanceRows();
      enhanceButtons();
      enhanceControls();
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
    if (!t || !t.closest) return;
    var a = t.closest('a[href^="#/"]');
    if (a) {
      userNavigated = true;
      activeHref = a.getAttribute("href");
      window.setTimeout(schedule, 100);
      window.setTimeout(schedule, 450);
      return;
    }
    if (t.closest("button")) {
      window.setTimeout(schedule, 150);
      window.setTimeout(schedule, 520);
    }
  });
  document.addEventListener("change", function (e) {
    if (e.target && (e.target.tagName === "SELECT" || e.target.type === "number")) {
      window.setTimeout(schedule, 150);
      window.setTimeout(schedule, 520);
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

  setTimeout(resetInitialScroll, 1400);
  setTimeout(resetInitialScroll, 2400);
})();
