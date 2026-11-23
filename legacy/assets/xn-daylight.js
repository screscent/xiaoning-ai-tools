/* xn-daylight.js · 日出日落与光线时刻合集：标题归一 / 药丸语义 / 吸顶导航 / 城市与常用值（幂等） */
(function () {
  "use strict";
  if (window.__XN_DAYLIGHT__) return;
  window.__XN_DAYLIGHT__ = 1;

  var CN = ["一", "二", "三", "四", "五", "六"];
  var CIRCLE = ["①", "②", "③", "④", "⑤", "⑥"];
  var NAMES = ["日出日落", "黄金与蓝调", "昼长与季节", "拍摄时间规划", "光时对照", "月相与夜空窗口"];
  var HASH_ORDER = ["sun", "golden", "daylight", "plan", "city", "moon"];
  var CITIES = [
    { n: "北京", lat: 39.90, lng: 116.41 },
    { n: "上海", lat: 31.23, lng: 121.47 },
    { n: "广州", lat: 23.13, lng: 113.26 },
    { n: "成都", lat: 30.57, lng: 104.07 },
    { n: "哈尔滨", lat: 45.80, lng: 126.53 }
  ];

  function text(el) { return (el && (el.textContent || "").trim()) || ""; }

  function setNative(el, value) {
    var proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    var setter = Object.getOwnPropertyDescriptor(proto, "value").set;
    setter.call(el, String(value));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function fmtDate(d) {
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" + m : m) + "-" + (day < 10 ? "0" + day : day);
  }

  function toolSections() {
    var all = document.querySelectorAll("#root section");
    var out = [];
    for (var i = 0; i < all.length; i++) {
      if (all[i].querySelector("h2")) out.push(all[i]);
    }
    return out;
  }

  /* 1. 标题归一：A日出日落 → 工具一 · 日出日落 */
  function normalizeHeadings() {
    var secs = toolSections();
    for (var i = 0; i < secs.length; i++) {
      var h = secs[i].querySelector("h2");
      var name = NAMES[i];
      if (!h || !name) continue;
      var want = "工具" + (CN[i] || (i + 1)) + " · " + name;
      if (text(h) !== want) h.textContent = want;
    }
  }

  /* 2. 分配锚点 id（不改变 React 结构） */
  function assignIds() {
    var secs = toolSections();
    for (var i = 0; i < secs.length; i++) {
      if (secs[i].id !== "xn-sun-" + (i + 1)) secs[i].id = "xn-sun-" + (i + 1);
    }
  }

  /* 3. 当前工具：药丸 + 吸顶导航同步 */
  function setActive(index) {
    var pills = document.querySelectorAll('#root a[href^="#/"]');
    for (var i = 0; i < pills.length; i++) {
      if (i === index) pills[i].setAttribute("aria-current", "true");
      else pills[i].removeAttribute("aria-current");
    }
    var nav = document.getElementById("xnSunNav");
    if (nav) {
      for (var j = 0; j < nav.children.length; j++) {
        if (j === index) nav.children[j].setAttribute("aria-current", "true");
        else nav.children[j].removeAttribute("aria-current");
      }
    }
  }

  function currentIndexFromHash() {
    var h = (location.hash || "").replace(/^#\//, "");
    var k = HASH_ORDER.indexOf(h);
    return k;
  }

  function enhancePills() {
    var pills = document.querySelectorAll('#root a[href^="#/"]');
    for (var i = 0; i < pills.length; i++) {
      if (pills[i].getAttribute("data-xn-num") !== CIRCLE[i]) {
        pills[i].setAttribute("data-xn-num", CIRCLE[i] || "");
      }
      if (!pills[i].getAttribute("aria-label") && NAMES[i]) {
        pills[i].setAttribute("aria-label", "跳转到工具" + (CN[i] || (i + 1)) + " " + NAMES[i]);
      }
    }
  }

  function buildNav() {
    if (document.getElementById("xnSunNav")) return;
    var secs = toolSections();
    if (!secs.length) return;
    var nav = document.createElement("div");
    nav.id = "xnSunNav";
    nav.className = "xn-sun-nav";
    nav.setAttribute("role", "navigation");
    nav.setAttribute("aria-label", "工具快速跳转");
    for (var i = 0; i < secs.length && i < NAMES.length; i++) {
      (function (sec, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", "跳转到工具" + CN[i] + " " + NAMES[i]);
        var n = document.createElement("span");
        n.className = "n";
        n.textContent = CN[i];
        b.appendChild(n);
        b.appendChild(document.createTextNode(NAMES[i]));
        b.addEventListener("click", function () {
          sec.scrollIntoView({ behavior: "smooth", block: "start" });
          setActive(i);
        });
        nav.appendChild(b);
      })(secs[i], i);
    }
    secs[0].parentNode.insertBefore(nav, secs[0]);

    var ticking = false;
    var spy = function () {
      var current = 0;
      for (var j = 0; j < secs.length; j++) {
        if (secs[j].getBoundingClientRect().top <= 120) current = j;
      }
      setActive(current);
      if (window.scrollY > 240) nav.classList.add("is-on");
      else nav.classList.remove("is-on");
    };
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { ticking = false; spy(); });
    }, { passive: true });
    spy();
  }

  /* 4. 常用值：日期 / 时间 / 年份 */
  function addPresets(input, items) {
    var box = input.parentElement;
    if (!box) return;
    if (box.querySelector(":scope > .xn-sun-presets")) return;
    var row = document.createElement("div");
    row.className = "xn-sun-presets";
    for (var i = 0; i < items.length; i++) {
      (function (it) {
        var b = document.createElement("button");
        b.type = "button";
        b.textContent = it.label;
        b.dataset.xnVal = it.value;
        b.setAttribute("aria-label", "填入 " + it.label);
        row.appendChild(b);
      })(items[i]);
    }
    box.appendChild(row);
  }

  function enhancePresets() {
    var inputs = document.querySelectorAll('#root section input');
    for (var i = 0; i < inputs.length; i++) {
      var el = inputs[i];
      var label = el.getAttribute("aria-label") || "";
      if (el.type === "date") {
        var today = new Date();
        var next = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
        addPresets(el, [
          { label: "今天", value: fmtDate(today) },
          { label: "下月同日", value: fmtDate(next) }
        ]);
      } else if (el.type === "time") {
        if (/日出/.test(label)) {
          addPresets(el, [
            { label: "05:30", value: "05:30" }, { label: "06:00", value: "06:00" },
            { label: "06:30", value: "06:30" }, { label: "07:00", value: "07:00" }
          ]);
        } else if (/日落/.test(label)) {
          addPresets(el, [
            { label: "17:00", value: "17:00" }, { label: "17:30", value: "17:30" },
            { label: "18:00", value: "18:00" }, { label: "18:30", value: "18:30" }
          ]);
        }
      } else if (el.type === "number" && /^年份/.test(label)) {
        addPresets(el, [
          { label: "2025", value: "2025" }, { label: "2026", value: "2026" }, { label: "2027", value: "2027" }
        ]);
      }
    }
  }

  /* 5. 常用城市：一键填纬度+经度 */
  function addCityPresets(sec) {
    var lat = sec.querySelector('input[aria-label^="纬度"]');
    var lng = sec.querySelector('input[aria-label^="经度"]');
    if (!lat || !lng) return;
    var grid = lat.parentElement && lat.parentElement.parentElement;
    if (!grid || grid.querySelector(":scope > .xn-city-presets")) return;
    var row = document.createElement("div");
    row.className = "xn-city-presets";
    for (var i = 0; i < CITIES.length; i++) {
      (function (c) {
        var b = document.createElement("button");
        b.type = "button";
        b.textContent = c.n;
        b.dataset.xnLat = String(c.lat);
        b.dataset.xnLng = String(c.lng);
        b.setAttribute("aria-label", "填入" + c.n + "的经纬度");
        row.appendChild(b);
      })(CITIES[i]);
    }
    grid.appendChild(row);
  }

  function enhanceCities() {
    var secs = toolSections();
    for (var i = 0; i < secs.length; i++) addCityPresets(secs[i]);
  }

  /* 6. 主结果 / 复制按钮 / 结果语义 */
  function markResults() {
    var secs = toolSections();
    for (var i = 0; i < secs.length; i++) {
      var vals = secs[i].querySelectorAll(".tabular-nums.font-semibold");
      var primary = null;
      for (var j = 0; j < vals.length; j++) {
        vals[j].classList.remove("xn-primary");
        if (!primary && /\d/.test(vals[j].textContent || "")) primary = vals[j];
      }
      if (primary) primary.classList.add("xn-primary");
      var grids = secs[i].querySelectorAll("div.grid");
      for (var k = 0; k < grids.length; k++) {
        if (grids[k].querySelector(".tabular-nums.font-semibold") && !grids[k].getAttribute("aria-live")) {
          grids[k].setAttribute("aria-live", "polite");
        }
      }
    }
    var btns = document.querySelectorAll("#root section button");
    for (var m = 0; m < btns.length; m++) {
      if (text(btns[m]) === "复制结果" && !btns[m].getAttribute("aria-label")) {
        btns[m].setAttribute("aria-label", "复制计算结果");
      }
    }
  }

  /* 7. 事件委托 */
  function onClick(e) {
    var t = e.target;
    if (!t || !t.closest) return;

    var chip = t.closest(".xn-city-presets button");
    if (chip) {
      var sec = chip.closest("section");
      var lat = sec && sec.querySelector('input[aria-label^="纬度"]');
      var lng = sec && sec.querySelector('input[aria-label^="经度"]');
      if (lat) setNative(lat, chip.dataset.xnLat);
      if (lng) setNative(lng, chip.dataset.xnLng);
      if (lat) lat.focus();
      return;
    }

    var p = t.closest(".xn-sun-presets button");
    if (p) {
      var box = p.parentElement && p.parentElement.parentElement;
      var input = box && box.querySelector("input");
      if (input) { setNative(input, p.dataset.xnVal); input.focus(); }
    }
  }

  function enhanceAll() {
    try {
      normalizeHeadings();
      assignIds();
      enhancePills();
      buildNav();
      enhancePresets();
      enhanceCities();
      markResults();
    } catch (e) { /* 增强失败不影响原功能 */ }
  }

  function boot() {
    var root = document.getElementById("root");
    if (!root) { setTimeout(boot, 300); return; }
    enhanceAll();
    document.addEventListener("click", onClick, true);
    window.addEventListener("hashchange", function () {
      var idx = currentIndexFromHash();
      if (idx > -1) setActive(idx);
    });
    try {
      new MutationObserver(function () { enhanceAll(); }).observe(root, { childList: true, subtree: true });
    } catch (e) {}
    setInterval(enhanceAll, 900);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
