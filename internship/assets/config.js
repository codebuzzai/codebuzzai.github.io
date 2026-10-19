/*
 * CodeBuzz Internship — front-end configuration
 * ------------------------------------------------
 * apiBase: the public URL of the Cloud Run API (no trailing slash).
 *
 * When the page is opened from localhost, it talks to the API running
 * locally on port 8080 so you can test without deploying.
 */
(function () {
  var isLocal = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  window.CB_INTERNSHIP = {
    apiBase: isLocal ? 'http://localhost:8080' : 'https://cb-internship-api-xms23mbk5a-ul.a.run.app',
    internshipDays: 14,          // 2 weeks, start and end dates included
    // Scheduled batch start dates (each runs internshipDays). Keep in sync with internship/index.html
    // and INTERNSHIP_BATCHES in the API's deploy.ps1
    batches: ['2026-11-02', '2026-11-16', '2026-11-30', '2026-12-14'],
    customLastDay: '2026-12-31', // custom-date internships must end on or before this day
    paymentsEnabled: true        // Razorpay checkout on payment.html (set false to pause online payments)
  };
})();
