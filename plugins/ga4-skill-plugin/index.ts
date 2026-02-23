import type {LoadContext, Plugin} from '@docusaurus/types';

type PluginOptions = {
  measurementId: string;
  gtmContainerId: string;
  bookId: string;
  consentMode: 'always_on' | 'balanced_by_region' | 'strict_by_default';
};

export default function ga4SkillPlugin(_context: LoadContext, options: PluginOptions): Plugin {
  const {measurementId, gtmContainerId, bookId, consentMode} = options;

  const consentState = consentMode === 'always_on' ? 'granted' : 'denied';

  const initScript = `
(function() {
  if (window.__ga4SkillTagLoaded) return;
  window.__ga4SkillTagLoaded = true;

  window.dataLayer = window.dataLayer || [];
  window.bookAnalyticsContext = {
    book_id: ${JSON.stringify(bookId)},
    version: 'v2',
    measurement_id: ${JSON.stringify(measurementId)}
  };

  window.dataLayer.push({
    event: 'consent_default',
    analytics_storage: ${JSON.stringify(consentState)},
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });

  window.bookAnalyticsTrack = function(eventName, params) {
    var payload = Object.assign({}, params || {}, {
      event_name: eventName,
      book_id: window.bookAnalyticsContext.book_id,
      page_path: window.location.pathname,
      version: window.bookAnalyticsContext.version
    });
    window.dataLayer.push(Object.assign({ event: eventName }, payload));
  };

  (function(w, d, s, l, i) {
    w[l] = w[l] || [];
    w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var f = d.getElementsByTagName(s)[0],
      j = d.createElement(s),
      dl = l !== 'dataLayer' ? '&l=' + l : '';
    j.async = true;
    j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
    f.parentNode.insertBefore(j, f);
  })(window, document, 'script', 'dataLayer', ${JSON.stringify(gtmContainerId)});
})();
`;

  const noScript = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmContainerId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;

  return {
    name: 'ga4-skill-plugin',
    injectHtmlTags() {
      return {
        headTags: [
          {
            tagName: 'script',
            innerHTML: initScript,
          },
        ],
        preBodyTags: [
          {
            tagName: 'noscript',
            innerHTML: noScript,
          },
        ],
      };
    },
  };
}
