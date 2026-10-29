/*
 * CodeBuzz.ai — site analytics (loaded in the <head> of every page)
 * ----------------------------------------------------------------
 * PostHog (product analytics) + Meta Pixel (ads) + Google Analytics 4. One place to change all three.
 * Each cbTrack event goes to all three (GA4 gets its recommended names: purchase, begin_checkout, sign_up).
 * Pages call window.cbTrack(event, props) for custom events, e.g. the Purchase on payment-success.
 */
(function () {
  var path = location.pathname;
  // Never send personal portal screens or private links as page content
  var privatePage = /\/internship\/(admin|dashboard|reset-password)(\.html)?$/.test(path);

  /* ---------- PostHog ---------- */
  if (!(window.posthog && window.posthog.__SV)) {
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog && window.posthog.__loaded)||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="ki Ci init qi Hi pr Bi zi Di capture calculateEventProperties Qi register register_once register_for_session unregister unregister_for_session Ki getFeatureFlag getFeatureFlagPayload getFeatureFlagResult getAllFeatureFlags isFeatureEnabled reloadFeatureFlags updateFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys renderSurvey displaySurvey cancelPendingSurvey canRenderSurvey canRenderSurveyAsync Xi identify setPersonProperties unsetPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset shutdown setIdentity clearIdentity get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException addExceptionStep captureLog startExceptionAutocapture stopExceptionAutocapture loadToolbar get_property getSessionProperty Ji Gi createPersonProfile setInternalOrTestUser Yi Ai rn opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing get_explicit_consent_status is_capturing clear_opt_in_out_capturing Vi debug mr it getPageViewId captureTraceFeedback captureTraceMetric Oi".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    posthog.init('phc_xQMKxFjK4kurVMZhVyXEy8UC9hoxtLgMmLKqQCTfKs6x', {
      api_host: 'https://us.i.posthog.com',
      defaults: '2026-05-30',
      person_profiles: 'identified_only',
      // Private pages (admin, student portal): count the visit, but don't record what's on screen
      disable_session_recording: privatePage,
      mask_all_text: privatePage,
      mask_all_element_attributes: privatePage
    });
  }

  /* ---------- Meta Pixel ---------- */
  if (!window.fbq) {
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
      n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '1393333359453502');
    fbq('track', 'PageView');
  }

  /* ---------- Google Analytics 4 ---------- */
  var GA_ID = 'G-2CSRTVXREF';
  if (!window.gtag) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', GA_ID);
    var ga = document.createElement('script'); ga.async = true;
    ga.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(ga);
  }

  /* ---------- Helper for custom events ---------- */
  // cbTrack('Purchase', { value: 2149, currency: 'INR' }, { eventID: 'pay_123' })
  window.cbTrack = function (event, props, metaOptions) {
    var standard = /^(PageView|ViewContent|Search|AddToCart|AddToWishlist|InitiateCheckout|AddPaymentInfo|Purchase|Lead|CompleteRegistration|Contact|Subscribe|StartTrial)$/;
    try { if (window.fbq) fbq(standard.test(event) ? 'track' : 'trackCustom', event, props || {}, metaOptions || {}); } catch (_) {}
    try { if (window.posthog && posthog.capture) posthog.capture(event, props || {}); } catch (_) {}
    try {
      if (window.gtag) {
        // GA4 uses its own recommended names for the standard events
        var p = props || {}, ga4 = { Purchase: 'purchase', InitiateCheckout: 'begin_checkout', CompleteRegistration: 'sign_up', Lead: 'generate_lead' }[event];
        var params = { value: p.value, currency: p.currency, item_name: p.content_name };
        if (event === 'Purchase' && metaOptions && metaOptions.eventID) params.transaction_id = metaOptions.eventID;   // GA4 de-duplicates by this
        gtag('event', ga4 || event.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase(), params);
      }
    } catch (_) {}
  };
})();
