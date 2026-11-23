/* R1272 App 权限与隐私泄露自查（glfhwvcqng）· 人用友好层
 * - 两个工具切换补 44px 与 aria-pressed
 * - 开关补 role=switch / aria-checked / 热区
 * - 结果卡与高风险卡片、步骤列表重排；生成按钮 48px
 */
(function () {
  "use strict";
  if (window.__XN_PRIV__) return;
  window.__XN_PRIV__ = true;

  function txt(el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); }
  function add(el, c) { if (el && !el.classList.contains(c)) el.classList.add(c); }
  function setAttr(el, k, v) { if (el && el.getAttribute(k) !== v) el.setAttribute(k, v); }
  var applying = false;

  function updateMeta() {
    var tas = document.querySelectorAll("#root textarea.pr-editor");
    for (var i = 0; i < tas.length; i++) {
      var ta = tas[i];
      var host = ta.parentElement;
      var meta = host && host.querySelector(".pr-meta");
      if (!meta) continue;
      var v = ta.value || "";
      var html = "字数 <b>" + v.length + "</b> · 行 <b>" + (v ? v.split("\n").length : 0) + "</b>";
      var span = meta.firstElementChild;
      if (span && span.innerHTML !== html) span.innerHTML = html;
    }
  }

  function apply() {
    if (applying) return;
    var root = document.getElementById("root");
    if (!root) return;
    applying = true;
    try {
      /* 1) 工具切换 */
      var btns = root.querySelectorAll("button");
      for (var i = 0; i < btns.length; i++) {
        var b = btns[i];
        var label = txt(b);
        if (/^(权限清单|泄露自查)$/.test(label)) {
          add(b, "pr-tab");
          setAttr(b, "aria-pressed", /bg-indigo-600/.test(String(b.className)) ? "true" : "false");
        }
        if (/生成自查清单/.test(label)) add(b, "pr-generate");
        if (/开始扫描/.test(label)) add(b, "pr-generate");
        if (/^复制/.test(label)) add(b, "pr-copy");
        /* 开关：rounded-full + w-11 */
        var cls = String(b.className);
        if (/rounded-full/.test(cls) && /w-11/.test(cls)) {
          add(b, "pr-switch");
          setAttr(b, "role", "switch");
          setAttr(b, "aria-checked", /bg-indigo-600/.test(cls) ? "true" : "false");
          var row = b.parentElement;
          if (row) {
            add(row, "pr-switch-row");
            var nm = row.querySelector("span");
            if (nm && !b.getAttribute("aria-label")) setAttr(b, "aria-label", txt(nm));
          }
        }
      }

      /* 2) 标题：圈号后补空格 */
      var h2s = root.querySelectorAll("section > h2");
      for (var h = 0; h < h2s.length; h++) {
        var raw = txt(h2s[h]);
        var fixed = raw.replace(/^([①②③④⑤⑥⑦⑧⑨⑩])\s*/, "$1 ");
        if (fixed !== raw) h2s[h].textContent = fixed;
      }

      /* 3) 结果卡 */
      var cards = root.querySelectorAll("div.rounded-xl.border");
      for (var c = 0; c < cards.length; c++) {
        var card = cards[c];
        var head = card.firstElementChild;
        if (!head || !head.querySelector("h2")) continue;
        if (!/必查权限清单|高风险权限|建议设置路径|自查结果|条目统计/.test(txt(head))) continue;
        add(card, "pr-card");
        var rows = card.querySelectorAll(".flex.items-start");
        for (var r = 0; r < rows.length; r++) {
          if (rows[r].tagName === "LI") continue;
          add(rows[r], "pr-row");
          var nameBox = rows[r].children[1];
          var nameEl = nameBox && nameBox.firstElementChild;
          if (nameEl) add(nameEl, "pr-name");
        }
        var ol = card.querySelector("ol");
        if (ol) add(ol, "pr-steps");
        if (/条目统计/.test(txt(head))) {
          add(card, "pr-stat");
          var vals = card.querySelectorAll(".text-xl");
          for (var vi = 0; vi < vals.length; vi++) add(vals[vi], "pr-statval");
        }
      }

      /* 权限勾选按钮热区 */
      var chk = root.querySelectorAll('button[aria-label^="标记 "]');
      for (var ci = 0; ci < chk.length; ci++) {
        add(chk[ci], "pr-check");
        setAttr(chk[ci], "aria-pressed", /bg-indigo-600/.test(String(chk[ci].className)) ? "true" : "false");
      }

      /* 4) 高风险提示块 */
      var risky = root.querySelectorAll('[class*="bg-rose-50"],[class*="bg-red-50"],[class*="bg-amber-50"]');
      for (var k = 0; k < risky.length; k++) add(risky[k], "pr-risk");

      /* 5) 泄露扫描：文本域 + 字数 + 脱敏建议步骤 */
      var tas = root.querySelectorAll("textarea");
      for (var ti = 0; ti < tas.length; ti++) {
        var ta = tas[ti];
        if (!/粘贴/.test(ta.getAttribute("placeholder") || "")) continue;
        add(ta, "pr-editor");
        if (!ta.getAttribute("aria-label")) setAttr(ta, "aria-label", "粘贴待检查文本");
        var host = ta.parentElement;
        if (host && !host.querySelector(".pr-meta")) {
          var meta = document.createElement("div");
          meta.className = "pr-meta";
          meta.innerHTML = "<span></span>";
          host.insertBefore(meta, ta.nextSibling);
        }
      }
      var ols = root.querySelectorAll("ol");
      for (var oi = 0; oi < ols.length; oi++) {
        var box = ols[oi].closest("div");
        if (box && /脱敏建议/.test(txt(box))) add(ols[oi], "pr-steps");
      }
      updateMeta();
    } finally {
      applying = false;
    }
  }

  apply();
  setTimeout(apply, 300);
  setTimeout(apply, 900);
  setTimeout(apply, 1800);
  document.addEventListener("click", function () { setTimeout(apply, 60); setTimeout(apply, 300); }, true);
  document.addEventListener("input", function () { setTimeout(updateMeta, 80); }, true);
  var rootEl = document.getElementById("root");
  if (rootEl && window.MutationObserver) {
    var timer = null;
    new MutationObserver(function () {
      if (applying) return;
      clearTimeout(timer);
      timer = setTimeout(apply, 140);
    }).observe(rootEl, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  }
})();
