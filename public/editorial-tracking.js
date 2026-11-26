/* Optional editorial analytics: no framework imports; failure must not affect reading. */
(function () {
  "use strict";
  try {
    if (/bot|spider|crawl|slurp|screenshot|Google-InspectionTool/i.test(navigator.userAgent || "")) return;
    var script = document.currentScript;
    var endpoint = script && script.getAttribute("data-track-endpoint");
    if (!endpoint) return;
    function read(key, local) {
      try { return (local ? localStorage : sessionStorage).getItem(key); } catch (_) { return null; }
    }
    function write(key, value) {
      try { sessionStorage.setItem(key, value); } catch (_) {}
    }
    var session = read("_curify_session_id") || ("session_" + Date.now() + "_" + Math.random().toString(36).slice(2));
    write("_curify_session_id", session);
    var userId;
    try { userId = JSON.parse(read("curifyUser", true) || "null").user_id; } catch (_) {}
    var campaign = {};
    var input = new URLSearchParams(location.search);
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid", "ref"].forEach(function (key) {
      var value = input.get(key);
      if (value) campaign[key] = value.slice(0, 200);
    });
    var query = new URLSearchParams(campaign).toString();
    var pageUrl = location.pathname + (query ? "?" + query : "");
    if (pageUrl.length > 1024) pageUrl = location.pathname;
    var referrer;
    try { var ref = new URL(document.referrer); referrer = (ref.origin + ref.pathname).slice(0, 500); } catch (_) {}
    if (!read("_curify_first_touch")) write("_curify_first_touch", JSON.stringify({landing_page: pageUrl.slice(0, 500), utm: campaign, referrer: referrer}));
    function track(contentId, action) {
      try {
        var body = JSON.stringify({content_id: contentId, content_type: "page", action_type: action, user_id: userId, session_id: session, referrer: referrer, current_page_url: pageUrl, current_page_route: "/blog/[slug]"});
        if (navigator.sendBeacon && navigator.sendBeacon(endpoint, new Blob([body], {type: "application/json"}))) return;
        fetch(endpoint, {method: "POST", headers: {"Content-Type": "application/json"}, body: body, keepalive: true}).catch(function () {});
      } catch (_) {}
    }
    if (!read("_curify_session_view_fired")) {
      write("_curify_session_view_fired", "1");
      track(location.pathname, "view");
    }
    document.addEventListener("click", function (event) {
      try {
        var link = event.target instanceof Element ? event.target.closest("a[href]") : null;
        var href = link && link.getAttribute("href");
        if (!href || href.charAt(0) !== "/" || !link.closest("article, [data-blog-footer]")) return;
        var slug = location.pathname.split("/").filter(Boolean).pop();
        track("blog-link:" + slug + ":" + href, "click");
      } catch (_) {}
    });
  } catch (_) {}
})();
