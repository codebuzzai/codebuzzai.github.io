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
    // Scheduled batch start dates: a new 2-week batch every Monday, 16 Nov 2026 → 11 Jan 2027.
    // Keep in sync with internship/index.html and INTERNSHIP_BATCHES in the API's deploy.ps1
    batches: ['2026-11-16', '2026-11-23', '2026-11-30', '2026-12-07', '2026-12-14',
              '2026-12-21', '2026-12-28', '2027-01-04', '2027-01-11'],
    feeInr: 1999,                // fallbacks only: the live prices come from the API (/pricing)
    hardcopyFeeInr: 150,         // optional printed certificate, courier included
    referralRewardInr: 100,      // cashback per referred student who pays (keep in sync with the API)
    paymentsEnabled: false       // false = Pay button disabled with a "payment window will be enabled from Nov 1st onwards" note (set true when Razorpay is ready)
  };
})();
