/* R1257 高铁与火车出行速查合集（bcreamk6f9） */
(function () {
  "use strict";
  function txt(el) { return (el.textContent || "").replace(/\s+/g, " ").trim(); }
  var SHORT = {
    "#/fare": "改签费", "#/station": "进站时间", "#/luggage": "行李规格",
    "#/childfare": "儿童票", "#/seat": "座位选择"
  };
  function apply() {
    var root = document.getElementById("root");
    if (!root) return;
    var nav = root.querySelector("nav");
    if (nav) {
      nav.classList.add("xn-train-tabs");
      nav.setAttribute("role", "tablist");
      nav.setAttribute("aria-label", "高铁工具切换");
      var links = nav.querySelectorAll("a");
      for (var i = 0; i < links.length; i++) {
        var a = links[i];
        var h = a.getAttribute("href") || "";
        var on = h === location.hash || (!location.hash && i === 0);
        a.setAttribute("role", "tab");
        a.setAttribute("aria-selected", on ? "true" : "false");
        var s = SHORT[h];
        if (s && txt(a) !== s) a.textContent = s;
      }
    }
    var btns = root.querySelectorAll("button");
    for (var k = 0; k < btns.length; k++) {
      var b = btns[k];
      b.classList.remove("xn-train-chip", "xn-train-copy");
      var t = txt(b);
      if (t === "一键复制") b.classList.add("xn-train-copy");
      else if (b.getAttribute("aria-pressed") !== null) b.classList.add("xn-train-chip");
    }
    var h2s = root.querySelectorAll("h2");
    for (var j = 0; j < h2s.length; j++) {
      var raw = txt(h2s[j]);
      var clean = raw
        .replace(/^工具[A-Z]\s*/, "")
        .replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "")
        .replace(/^[·\s]+/, "");
      if (clean !== raw && clean) h2s[j].textContent = clean;
    }
  }
  apply();
  setTimeout(apply, 300);
  setTimeout(apply, 900);
  window.addEventListener("hashchange", function () { setTimeout(apply, 100); });
  var rootEl = document.getElementById("root");
  if (rootEl && window.MutationObserver) {
    var timer = null;
    new MutationObserver(function () { clearTimeout(timer); timer = setTimeout(apply, 150); })
      .observe(rootEl, { childList: true, subtree: true });
  }
})();
