/* R1118 垃圾分类与回收变现合集 — 人用友好增强（幂等，不碰 React 状态） */
(function () {
  "use strict";
  if (window.__xnWaste) return;
  window.__xnWaste = true;

  var TXT = function (el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); };
  var VIS = function (el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  var ID_LABEL = {
    "sort-item": "物品名称",
    "sort-hazardous": "是否含有害部件（电池 / 灯管）",
    "sort-clean": "是否洁净干燥",
    "price-cardboard": "纸箱重量（kg）",
    "price-bottles": "塑料瓶个数",
    "price-cans": "易拉罐个数",
    "price-clothes": "旧衣重量（kg）",
    "bulky-count": "大件件数",
    "bulky-floor": "楼层",
    "bulky-type": "大件物品类型",
    "bulky-elevator": "是否有电梯",
    "compost-daily": "每日厨余量（kg）",
    "compost-volume": "堆肥桶容积（L）",
    "compost-carbon": "碳氮比",
    "compost-temp": "环境温度（℃）",
    "bucket-people": "家庭人数",
    "bucket-area": "厨房面积（㎡）",
    "bucket-compost": "是否做厨余堆肥",
    "schedule-community": "社区类型",
    "schedule-frequency": "回收频次",
    "schedule-weight": "每周可回收物重量（kg）"
  };

  function tabs() {
    var anchors = [].slice.call(document.querySelectorAll("#root a")).filter(function (a) {
      var p = a.parentElement;
      return p && p.className && p.className.indexOf("grid-cols-6") >= 0 && TXT(a).length <= 10;
    });
    if (!anchors.length) return;
    var box = anchors[0].parentElement;
    if (box.getAttribute("data-xn-waste-tabs") !== "1") {
      box.setAttribute("data-xn-waste-tabs", "1");
      box.classList.add("xn-waste-tabs");
      box.setAttribute("role", "tablist");
      box.setAttribute("aria-label", "垃圾分类工具");
    }
    anchors.forEach(function (a) {
      var active = (a.className || "").indexOf("bg-[#1F6B45]") >= 0;
      a.setAttribute("role", "tab");
      a.setAttribute("aria-selected", active ? "true" : "false");
      if (active) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
      if (!a.getAttribute("aria-label")) a.setAttribute("aria-label", TXT(a));
    });
  }

  function labelFor(el) {
    var out = [];
    var n = el.parentElement;
    for (var i = 0; i < 3 && n; i++) {
      var kids = [].slice.call(n.querySelectorAll("div,label,span"));
      for (var k = 0; k < kids.length; k++) {
        var x = kids[k];
        if (x === el || x.contains(el)) continue;
        if (x.children.length) continue;
        var s = TXT(x);
        if (!s || s.length < 2 || s.length > 18) continue;
        if (/^\d/.test(s)) continue;
        if (/^(kg|个|件|层|人|份|℃|L|㎡|元|是|否)$/.test(s)) continue;
        out.push(s);
      }
      n = n.parentElement;
    }
    if (!out.length) return "";
    out.sort(function (a, b) { return a.length - b.length; });
    return out[0];
  }

  function controls() {
    var list = [].slice.call(document.querySelectorAll("#root input, #root select, #root textarea"));
    list.forEach(function (el) {
      if (!VIS(el)) return;
      if (el.getAttribute("aria-label")) return;
      var l = ID_LABEL[el.id] || labelFor(el);
      if (!l && el.placeholder) l = el.placeholder.split(/[，,。]/)[0];
      if (l) el.setAttribute("aria-label", l);
    });
  }

  function actions() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      var s = TXT(b);
      if (/^复制|一键复制/.test(s)) {
        b.classList.add("xn-waste-copy");
        var cl = "复制结果全文，复制到剪贴板";
        if (b.getAttribute("aria-label") !== cl) b.setAttribute("aria-label", cl);
        if (!b.getAttribute("title")) b.setAttribute("title", cl);
        return;
      }
      if (/^清空/.test(s)) {
        b.classList.add("xn-waste-clear");
        var gl = "清空输入与结果";
        if (b.getAttribute("aria-label") !== gl) b.setAttribute("aria-label", gl);
        return;
      }
      if (/^(开始判断|计算估价|估算费用|估算堆肥|规划垃圾桶|查看收运表)$/.test(s)) {
        b.classList.add("xn-waste-primary");
        if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", s);
      }
    });
  }

  function steps() {
    [].slice.call(document.querySelectorAll("#root div")).forEach(function (d) {
      var h4 = d.querySelector(":scope > div > h4");
      if (!h4) return;
      if (d.children.length > 2) return;
      var r = d.getBoundingClientRect();
      if (r.height < 40 || r.height > 260) return;
      d.classList.add("xn-waste-step");
      h4.classList.add("xn-waste-step-title");
      var body = h4.parentElement ? h4.parentElement.nextElementSibling : null;
      if (!body) body = h4.nextElementSibling;
      if (body) body.classList.add("xn-waste-step-body");
      var no = d.querySelector(":scope > div > span");
      if (no && /^\d{1,2}$/.test(TXT(no))) no.classList.add("xn-waste-step-no");
    });
  }

  function headings() {
    [].slice.call(document.querySelectorAll("#root h1, #root h2")).forEach(function (h) {
      [].slice.call(h.childNodes).forEach(function (node) {
        if (node.nodeType === 3 && /^\s*工具[A-Z]\s+/.test(node.textContent)) {
          node.textContent = node.textContent.replace(/^\s*工具[A-Z]\s+/, "");
        }
      });
    });
  }

  function run() {
    tabs();
    controls();
    actions();
    steps();
    headings();
  }

  var timer = null;
  function schedule() {
    if (timer) return;
    timer = setTimeout(function () { timer = null; run(); }, 90);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule);
  else schedule();
  window.addEventListener("load", schedule);
  window.addEventListener("hashchange", schedule);
  var mo = new MutationObserver(schedule);
  mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  setTimeout(run, 700);
  setTimeout(run, 1500);
})();
