/* 文本行去重排序与统计合集页增强（仅 2qes9dqqxb 引用）
 * - 结果文本域补 aria；开关补 role=switch/aria-checked/名称与热区
 * - 5 个工具标签补 aria-current
 * - 复制按钮上方当前设置摘要（排序方式 + 三个开关）
 */
(function () {
  "use strict";
  if (window.__XN_TXT__) return;
  window.__XN_TXT__ = true;

  function txt(el) { return (el.textContent || "").trim(); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function isOn(btn) {
    return /bg-blue-500|bg-blue-600|bg-indigo-\d00/.test((btn.className || "").toString());
  }

  function isTabActive(btn) {
    var c = (btn.className || "").toString();
    return /text-white/.test(c) && !/bg-white/.test(c);
  }

  function visibleAreas() {
    return [].slice.call(document.querySelectorAll("#root textarea")).filter(function (t) {
      return t.getBoundingClientRect().height > 0;
    });
  }

  function fixAreas() {
    var tas = visibleAreas();
    if (tas[0] && (tas[0].getAttribute("aria-label") || "") !== "原文（每行一条）") {
      tas[0].setAttribute("aria-label", "原文（每行一条）");
    }
    if (tas[1] && !tas[1].getAttribute("aria-label")) {
      tas[1].setAttribute("aria-label", "处理结果");
    }
  }

  function fixSwitches() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      if (txt(b) || !/h-5/.test((b.className || "").toString()) || !/w-9/.test((b.className || "").toString())) return;
      var p = b.parentElement;
      var label = "";
      for (var i = 0; i < 2 && p; i++, p = p.parentElement) {
        var t = (p.innerText || "").replace(/\s+/g, " ").trim();
        if (t && t.length <= 16) { label = t; break; }
      }
      var on = isOn(b);
      b.setAttribute("role", "switch");
      b.setAttribute("aria-checked", on ? "true" : "false");
      if (label) {
        b.setAttribute("aria-label", label);
        b.title = label + "：" + (on ? "开" : "关");
      }
      b.classList.add("xn-switch");
    });
  }

  var TAB_NAMES = ["行去重排序", "行统计", "行号前缀", "去重计数", "最长行"];

  function fixTabs() {
    [].slice.call(document.querySelectorAll("#root button")).forEach(function (b) {
      var t = txt(b);
      if (TAB_NAMES.indexOf(t) < 0) return;
      if (isTabActive(b)) b.setAttribute("aria-current", "true");
      else b.removeAttribute("aria-current");
      b.setAttribute("title", t);
    });
  }

  function activeTabName() {
    var cur = document.querySelector('#root button[aria-current="true"]');
    return cur ? txt(cur) : "";
  }

  function updateBar() {
    var btn = [].slice.call(document.querySelectorAll("#root button")).filter(function (b) { return txt(b) === "复制结果"; })[0];
    if (!btn) return;
    var bar = document.querySelector("#root .xn-setbar");
    if (activeTabName() && activeTabName() !== "行去重排序") {
      if (bar) bar.style.display = "none";
      return;
    }
    if (!bar) {
      bar = document.createElement("div");
      bar.className = "xn-setbar";
      var row = btn.parentElement;
      var cs = window.getComputedStyle(row);
      var flexRow = cs.display.indexOf("flex") === 0 && cs.flexDirection.indexOf("row") === 0;
      if (flexRow && row.parentElement) row.parentElement.insertBefore(bar, row);
      else row.insertBefore(bar, btn);
    }
    bar.style.display = "flex";
    var sel = document.querySelector("#root select");
    var sort = sel && sel.selectedIndex >= 0 ? sel.options[sel.selectedIndex].text : "保持原序";
    var switches = [].slice.call(document.querySelectorAll('#root button[role="switch"]'));
    var parts = ["排序 " + sort];
    switches.forEach(function (s) {
      var lab = s.getAttribute("aria-label");
      if (lab) parts.push(lab + " " + (s.getAttribute("aria-checked") === "true" ? "开" : "关"));
    });
    var html = '<span class="xn-setlabel">当前设置</span>' +
      parts.map(function (p) { return "<b>" + esc(p) + "</b>"; }).join("<span>·</span>");
    if (bar.innerHTML !== html) bar.innerHTML = html;
  }

  function updateAll() {
    if (!document.getElementById("root")) return;
    fixAreas();
    fixSwitches();
    fixTabs();
    updateBar();
  }

  var scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(function () { scheduled = false; try { updateAll(); } catch (e) {} }, 240);
  }

  function boot() {
    var root = document.getElementById("root");
    if (!root) { setTimeout(boot, 300); return; }
    updateAll();
    new MutationObserver(schedule).observe(root, {
      childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["class"]
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
