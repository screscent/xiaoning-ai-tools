/* xn-vault.js · 密码合集：模式 aria-pressed / 开关 div role=switch / 图标 aria（幂等） */
(function () {
  if (window.__XN_VAULT__) return;
  window.__XN_VAULT__ = 1;

  var root = null;

  function pick() {
    root = document.querySelector("#root");
    return !!root;
  }

  function decorate() {
    if (!root) return;
    var btns = root.querySelectorAll("button");
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      var text = (b.textContent || "").replace(/\s+/g, " ").trim();
      if (/^①\s*密码短语$|^②\s*PIN 备份码$/.test(text)) {
        var on = /bg-blue-600/.test(b.className);
        var want = on ? "true" : "false";
        if (b.getAttribute("aria-pressed") !== want) b.setAttribute("aria-pressed", want);
        if (!on && !b.classList.contains("px-mode-off")) b.classList.add("px-mode-off");
        if (on && b.classList.contains("px-mode-off")) b.classList.remove("px-mode-off");
      }
      if (!b.getAttribute("aria-label")) {
        var title = b.getAttribute("title");
        if (!text && title) b.setAttribute("aria-label", title);
        else if (text) b.setAttribute("aria-label", text);
      }
    }
    // 开关行：可点 div（含「首字母大写/附加随机数字」）
    var rows = root.querySelectorAll('div[class*="cursor-pointer"][class*="p-3"]');
    for (var j = 0; j < rows.length; j++) {
      var row = rows[j];
      var label = (row.textContent || "").replace(/\s+/g, "");
      if (!/首字母大写|附加随机数字/.test(label)) continue;
      if (!row.classList.contains("px-switchrow")) row.classList.add("px-switchrow");
      var sw = row.querySelector('div[class*="rounded-full"]');
      var onSw = !!(sw && /bg-blue-/.test(sw.className));
      var wantC = onSw ? "true" : "false";
      if (row.getAttribute("role") !== "switch") row.setAttribute("role", "switch");
      if (row.getAttribute("tabindex") !== "0") row.setAttribute("tabindex", "0");
      if (row.getAttribute("aria-checked") !== wantC) row.setAttribute("aria-checked", wantC);
      if (!row.getAttribute("aria-label")) row.setAttribute("aria-label", label);
      if (row.getAttribute("data-xn-key") !== "1") {
        row.setAttribute("data-xn-key", "1");
        row.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); this.click(); }
        });
      }
    }
  }

  function start() {
    if (!pick()) { setTimeout(start, 300); return; }
    decorate();
    var mo = new MutationObserver(function () { decorate(); });
    mo.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "aria-checked"] });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(start, 60); });
  } else {
    setTimeout(start, 60);
  }
})();
