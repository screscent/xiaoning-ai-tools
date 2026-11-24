/* R1322 服务器排障速查合集 · xn-ops.js
   章节编号 / 筛选标签语义 / COPY本地化 / 搜索框修复 / 回到顶部 */
(function () {
  if (window.__XN_OPS__) return;
  window.__XN_OPS__ = true;

  var chipEls = [];

  function visible(el) {
    return !!el && el.getBoundingClientRect().height > 0;
  }

  /* ---- 顶部工具导航（吸顶 + 启用态） ---- */
  function enhanceToolNav() {
    var anchors = Array.prototype.slice.call(document.querySelectorAll('#root a[href^="#/"]'));
    if (!anchors.length) return;
    var nav = anchors[0].parentElement;
    if (nav) nav.classList.add("xn-ops-toolnav");

    var enabled = {};
    Array.prototype.forEach.call(document.querySelectorAll("#root section"), function (sec) {
      var h2 = sec.querySelector("h2");
      if (!h2) return;
      var label = null;
      Array.prototype.forEach.call(sec.querySelectorAll("span"), function (sp) {
        if (!label && /^#\//.test(sp.textContent.trim())) label = sp;
      });
      if (!label) return;
      var locked = /即可启用该工具|点顶部标签启用/.test(sec.textContent);
      if (!locked) enabled[label.textContent.trim()] = true;
    });

    anchors.forEach(function (a) {
      a.classList.add("xn-ops-toolnav-item");
      var active = !!enabled[a.getAttribute("href")];
      a.setAttribute("aria-pressed", active ? "true" : "false");
      var plain = a.textContent.replace(/\s+/g, " ").trim().replace(/^(\d{2})\s*/, "$1 ");
      var al = (active ? "当前工具：" : "启用工具：") + plain;
      if (a.getAttribute("aria-label") !== al) a.setAttribute("aria-label", al);
    });
  }

  /* ---- 滚动后的吸顶快捷工具条 ---- */
  function ensureFixedNav() {
    var nav = document.querySelector("#root .xn-ops-toolnav");
    if (!nav) return;
    var fixed = document.querySelector(".xn-ops-fixednav");
    if (!fixed) {
      fixed = document.createElement("div");
      fixed.className = "xn-ops-fixednav";
      fixed.setAttribute("role", "navigation");
      fixed.setAttribute("aria-label", "工具快速切换");
      document.body.appendChild(fixed);
    }
    var anchors = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#/"]'));
    if (fixed.children.length !== anchors.length) {
      fixed.innerHTML = "";
      anchors.forEach(function (a) {
        var c = document.createElement("a");
        var href = a.getAttribute("href");
        c.setAttribute("href", href);
        c.className = "xn-ops-toolnav-item";
        c.textContent = a.textContent.replace(/\s+/g, " ").trim().replace(/^(\d{2})\s*/, "$1 ");
        c.addEventListener("click", function (ev) {
          ev.preventDefault();
          var orig = document.querySelector('#root a[href="' + href + '"]');
          if (orig) orig.click();
          if (window.scrollY > 40) window.scrollTo({ top: 0, behavior: "smooth" });
          window.setTimeout(schedule, 450);
        });
        fixed.appendChild(c);
      });
    }
    anchors.forEach(function (a, i) {
      var c = fixed.children[i];
      if (!c) return;
      var pressed = a.getAttribute("aria-pressed") || "false";
      if (c.getAttribute("aria-pressed") !== pressed) c.setAttribute("aria-pressed", pressed);
      var al = a.getAttribute("aria-label") || c.textContent;
      if (c.getAttribute("aria-label") !== al) c.setAttribute("aria-label", al);
    });
    var r = nav.getBoundingClientRect();
    fixed.classList.toggle("show", r.bottom < 0);
  }

  /* ---- 隐藏开发者路由标签 + 友好启用提示 ---- */
  function polishLabels() {
    Array.prototype.forEach.call(document.querySelectorAll("#root span"), function (sp) {
      if (/^#\//.test(sp.textContent.trim())) sp.classList.add("xn-ops-routelabel");
    });
    Array.prototype.forEach.call(document.querySelectorAll("#root p"), function (p) {
      if (p.textContent.indexOf("点顶部标签启用该工具") < 0) return;
      var sec = p.closest("section");
      var h2 = sec && sec.querySelector("h2");
      if (!h2) return;
      var numEl = h2.querySelector("span");
      var num = numEl ? numEl.textContent.trim() : "";
      var name = h2.textContent.trim();
      if (num) name = name.replace(num, "").trim();
      var next = "点上方「" + (num ? num + " " : "") + name + "」标签即可启用该工具。";
      if (p.textContent.trim() !== next) p.textContent = next;
    });
  }

  /* ---- 章节标题与编号 ---- */
  function enhanceHeadings() {
    Array.prototype.forEach.call(document.querySelectorAll("#root h2"), function (h) {
      h.classList.add("xn-ops-h2");
      var sp = h.querySelector("span");
      if (sp) sp.classList.add("xn-ops-num");
    });
    Array.prototype.forEach.call(document.querySelectorAll("#root h3"), function (h) {
      h.classList.add("xn-ops-h3");
    });
  }

  /* ---- 卡片 ---- */
  function enhanceCards() {
    Array.prototype.forEach.call(document.querySelectorAll("#root article"), function (a) {
      a.classList.add("xn-ops-card");
    });
  }

  /* ---- 筛选标签 ---- */
  function enhanceChips() {
    chipEls = Array.prototype.slice.call(document.querySelectorAll("#root button")).filter(function (b) {
      var c = String(b.className);
      return /px-2\.5/.test(c) && /font-mono/.test(c);
    });
    chipEls.forEach(function (b) {
      b.classList.add("xn-ops-chip");
      if (!b.hasAttribute("aria-pressed")) b.setAttribute("aria-pressed", "false");
      var al = "筛选：" + b.textContent.trim();
      if (b.getAttribute("aria-label") !== al) b.setAttribute("aria-label", al);
    });
    var row = chipEls[0] && chipEls[0].parentElement;
    if (row) row.classList.add("xn-ops-chiprow");
  }

  /* ---- COPY → 复制 ---- */
  function enhanceCopy() {
    Array.prototype.forEach.call(document.querySelectorAll("#root button"), function (b) {
      if (b.textContent.trim() !== "COPY") return;
      b.classList.add("xn-ops-copy");
      if (b.textContent.trim() !== "复制") b.textContent = "复制";
      if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", "复制命令");
    });
  }

  /* ---- 搜索框 ---- */
  function enhanceSearch() {
    Array.prototype.forEach.call(document.querySelectorAll("#root input.ops-input"), function (i) {
      i.style.setProperty("min-height", "48px", "important");
      i.style.setProperty("background", "transparent", "important");
      i.style.setProperty("color", "#e6edf5", "important");
      i.style.setProperty("font-size", "14px", "important");
      var box = i.parentElement;
      if (box) box.classList.add("xn-ops-searchbox");
    });
  }

  /* ---- 回到顶部 ---- */
  function ensureTop() {
    if (document.querySelector(".xn-ops-top")) return;
    var b = document.createElement("button");
    b.type = "button";
    b.className = "xn-ops-top";
    b.setAttribute("aria-label", "回到顶部");
    b.textContent = "↑";
    b.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    document.body.appendChild(b);
  }

  function syncTop() {
    var b = document.querySelector(".xn-ops-top");
    if (!b) return;
    b.classList.toggle("show", window.scrollY > 600);
  }

  function run() {
    try {
      enhanceToolNav();
      polishLabels();
      ensureFixedNav();
      enhanceHeadings();
      enhanceCards();
      enhanceChips();
      enhanceCopy();
      enhanceSearch();
      ensureTop();
      syncTop();
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

  /* 标签点击：自行维护 aria-pressed（应用本身无激活态样式） */
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var chip = t.closest(".xn-ops-chip");
    if (chip) {
      var was = chip.getAttribute("aria-pressed") === "true";
      chipEls.forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
      if (!was) chip.setAttribute("aria-pressed", "true");
      else chip.setAttribute("aria-pressed", "false");
      window.setTimeout(schedule, 120);
      return;
    }
    if (t.closest("button")) {
      window.setTimeout(schedule, 160);
      window.setTimeout(schedule, 520);
    }
  });
  window.addEventListener("scroll", syncTop, { passive: true });

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
