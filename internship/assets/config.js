/*
 * CodeBuzz Internship — front-end configuration
 * ------------------------------------------------
 * apiBase: the public URL of the Cloud Run API (no trailing slash).
 *   After deploying the API, replace the value below, e.g.
 *   'https://api.codebuzz.ai' or 'https://internship-api-xxxxx-el.a.run.app'
 *
 * When the page is opened from localhost, it talks to the API running
 * locally on port 8080 so you can test without deploying.
 */
(function () {
  var isLocal = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  window.CB_INTERNSHIP = {
    apiBase: isLocal ? 'http://localhost:8080' : 'https://api.codebuzz.ai',
    internshipDays: 14,          // 2 weeks, start and end dates included
    // Scheduled batch start dates (each runs internshipDays). Keep in sync with internship/index.html
    batches: ['2026-11-02', '2026-11-16', '2026-11-30', '2026-12-14'],
    customLastDay: '2026-12-31', // custom-date internships must end on or before this day
    paymentsEnabled: false       // switch to true once Razorpay is wired up
  };
})();
