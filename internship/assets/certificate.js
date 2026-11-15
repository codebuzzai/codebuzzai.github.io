/*
 * CodeBuzz AI Internship Program: certificate template
 * ------------------------------------------------------
 * One renderer draws the certificate on a <canvas>, so the on-screen preview,
 * the PNG and the PDF are always the same picture.
 *
 *   CBCertificate.draw(canvas, data, widthPx)  → Promise (resolves when drawn)
 *   CBCertificate.downloadPdf(data)            → Promise (saves an A4 landscape PDF)
 *   CBCertificate.downloadPng(data)            → Promise
 *
 * data = { fullName, college, from, to, certificateId, issuedOn, sample }
 *        (dates are 'YYYY-MM-DD'; sample:true stamps a SAMPLE watermark)
 *
 * Wording, signatory and the verify link come from CB_INTERNSHIP.certificate in config.js.
 */
(function () {
  var W = 1123, H = 794;                      // A4 landscape at 96 dpi: every measurement below is in these units
  var BADGE = '#36BEF7', INK = '#1D1D1F', GREY = '#6E6E73', FAINT = '#A1A1A6', LINE = '#E5E5EA';
  var SANS = '"DM Sans", "Helvetica Neue", Helvetica, Arial, sans-serif';
  var MONO = '"JetBrains Mono", ui-monospace, Menlo, Consolas, monospace';

  function cfg() {
    var c = (window.CB_INTERNSHIP || {}).certificate || {};
    return {
      program: c.program || 'CodeBuzz AI Internship Program',
      description: c.description || 'a two-week virtual internship covering programming fundamentals, system design and the basics of AI, completed with a hands-on project.',
      signatoryName: c.signatoryName || '',
      signatoryTitle: c.signatoryTitle || 'CodeBuzz.ai',
      signatureImage: c.signatureImage || '',
      verifyUrl: c.verifyUrl || 'codebuzz.ai/internship/verify'
    };
  }

  // '2026-11-16' → '16 November 2026' (or '16 Nov 2026' when short)
  function longDate(s, short) {
    if (!s) return '';
    var p = String(s).slice(0, 10).split('-');
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return isNaN(d) ? '' : d.getDate() + ' ' + (short ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'])[d.getMonth()] + ' ' + d.getFullYear();
  }

  function loadImage(src) {
    return new Promise(function (resolve) {
      if (!src) return resolve(null);
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { resolve(null); };
      img.src = src;
    });
  }
  function loadFonts() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    var want = ['400 20px "DM Sans"', '500 20px "DM Sans"', '600 20px "DM Sans"', '700 20px "DM Sans"', '500 20px "JetBrains Mono"'];
    var all = Promise.all(want.map(function (f) { return document.fonts.load(f).catch(function () {}); }));
    // Never wait more than 3s for web fonts: the fallback fonts still give a clean certificate
    return Promise.race([all, new Promise(function (r) { setTimeout(r, 3000); })]);
  }

  // Text with letter-spacing (drawn glyph by glyph so it works in every browser)
  function tracked(ctx, text, x, y, spacing, align) {
    var chars = String(text).split(''), width = 0;
    chars.forEach(function (ch) { width += ctx.measureText(ch).width + spacing; });
    width -= spacing;
    var cx = align === 'center' ? x - width / 2 : align === 'right' ? x - width : x;
    ctx.textAlign = 'left';
    chars.forEach(function (ch) { ctx.fillText(ch, cx, y); cx += ctx.measureText(ch).width + spacing; });
    return width;
  }
  function wrap(ctx, text, maxWidth) {
    var words = String(text).split(/\s+/), lines = [], line = '';
    words.forEach(function (w) {
      var t = line ? line + ' ' + w : w;
      if (line && ctx.measureText(t).width > maxWidth) { lines.push(line); line = w; } else line = t;
    });
    if (line) lines.push(line);
    return lines;
  }
  // Largest font size (from `size` down to `min`) at which the text fits in maxWidth
  function fit(ctx, text, weight, size, min, maxWidth) {
    for (var s = size; s > min; s -= 1) {
      ctx.font = weight + ' ' + s + 'px ' + SANS;
      if (ctx.measureText(text).width <= maxWidth) return s;
    }
    ctx.font = weight + ' ' + min + 'px ' + SANS;
    return min;
  }

  function paint(ctx, d, assets) {
    var c = cfg(), cx = W / 2;

    // Paper
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, H);

    // Brand line across the top edge, then a single hairline frame
    var g = ctx.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, '#00C2FF'); g.addColorStop(1, '#8B5CF6');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, 6);
    ctx.strokeStyle = LINE; ctx.lineWidth = 1;
    ctx.strokeRect(36.5, 40.5, W - 73, H - 77);

    // Logo: the CodeBuzz "CB" badge (same mark as the site favicon), drawn as vectors so it stays sharp in print
    var bs = 58, bx = cx - bs / 2, by = 84, br = 14;
    ctx.fillStyle = BADGE;
    ctx.beginPath();
    ctx.moveTo(bx + br, by);
    ctx.arcTo(bx + bs, by, bx + bs, by + bs, br); ctx.arcTo(bx + bs, by + bs, bx, by + bs, br);
    ctx.arcTo(bx, by + bs, bx, by, br); ctx.arcTo(bx, by, bx + bs, by, br);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#111111';
    ctx.font = '500 25px "Helvetica Neue", Helvetica, Arial, ' + SANS;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('CB', cx, by + bs / 2 + 1.5);
    var y;
    ctx.textBaseline = 'alphabetic';
    ctx.font = '700 19px ' + SANS;
    var w1 = ctx.measureText('CodeBuzz').width, w2 = ctx.measureText('.ai').width, wx = cx - (w1 + w2) / 2;
    ctx.textAlign = 'left';
    ctx.fillStyle = INK; ctx.fillText('CodeBuzz', wx, 172);
    ctx.fillStyle = '#0095CC'; ctx.fillText('.ai', wx + w1, 172);

    // Title
    ctx.fillStyle = GREY;
    ctx.font = '600 13px ' + SANS;
    tracked(ctx, 'CERTIFICATE OF COMPLETION', cx, 228, 5.2, 'center');

    ctx.fillStyle = FAINT;
    ctx.font = '400 15px ' + SANS;
    ctx.textAlign = 'center';
    ctx.fillText('This is to certify that', cx, 282);

    // Name
    ctx.fillStyle = INK;
    var name = d.fullName || '';
    fit(ctx, name, 600, 60, 30, W - 260);
    ctx.textAlign = 'center';
    ctx.fillText(name, cx, 352);

    // Short brand rule under the name
    var rg = ctx.createLinearGradient(cx - 36, 0, cx + 36, 0);
    rg.addColorStop(0, '#00C2FF'); rg.addColorStop(1, '#8B5CF6');
    ctx.fillStyle = rg;
    ctx.fillRect(cx - 36, 378, 72, 3);

    // College
    y = 418;
    if (d.college) {
      ctx.fillStyle = GREY;
      fit(ctx, d.college, 500, 17, 12, W - 300);
      ctx.fillText(d.college, cx, y);
      y += 40;
    } else y += 6;

    // Statement
    ctx.fillStyle = GREY;
    ctx.font = '400 16.5px ' + SANS;
    ctx.fillText('has successfully completed the', cx, y);
    y += 34;
    ctx.fillStyle = INK;
    ctx.font = '600 24px ' + SANS;
    ctx.fillText(c.program, cx, y);
    y += 32;
    ctx.fillStyle = GREY;
    ctx.font = '400 15.5px ' + SANS;
    wrap(ctx, c.description, 640).forEach(function (line) { ctx.fillText(line, cx, y); y += 25; });

    // Details row: period · the student's unique ID · issued on
    var rowY = 612, cols = [
      ['INTERNSHIP PERIOD', longDate(d.from, true) + '  –  ' + longDate(d.to, true), SANS],
      ['UNIQUE ID', d.certificateId || '', MONO],
      ['ISSUED ON', longDate(d.issuedOn), SANS]
    ];
    var left = 110, right = W - 110, colW = (right - left) / 3;
    ctx.strokeStyle = LINE; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(left, rowY - 34.5); ctx.lineTo(right, rowY - 34.5); ctx.stroke();
    cols.forEach(function (col, i) {
      var x = left + colW * i + colW / 2;
      ctx.fillStyle = FAINT;
      ctx.font = '600 9.5px ' + SANS;
      tracked(ctx, col[0], x, rowY, 2.2, 'center');
      ctx.fillStyle = INK;
      for (var fs = col[2] === MONO ? 15 : 16; fs > 9; fs -= 0.5) {      // shrink a long value to stay inside its column
        ctx.font = '500 ' + fs + 'px ' + col[2];
        if (ctx.measureText(col[1]).width <= colW - 36) break;
      }
      ctx.textAlign = 'center';
      ctx.fillText(col[1], x, rowY + 26);
      if (i) { ctx.beginPath(); ctx.moveTo(left + colW * i + .5, rowY - 14); ctx.lineTo(left + colW * i + .5, rowY + 32); ctx.stroke(); }
    });

    // Signatory (left) and verification note (right)
    var footY = 714;
    ctx.textAlign = 'left';
    if (assets.signature) {
      var sh = 38, sw = sh * assets.signature.width / assets.signature.height;
      ctx.drawImage(assets.signature, left, footY - 22 - sh, sw, sh);
    }
    if (c.signatoryName) {
      ctx.fillStyle = INK;
      ctx.font = '600 13.5px ' + SANS;
      ctx.fillText(c.signatoryName, left, footY - 4);
      ctx.fillStyle = GREY;
      ctx.font = '400 11.5px ' + SANS;
      ctx.fillText(c.signatoryTitle, left, footY + 13);
    } else {
      // No named signatory: "Issued by" over the organisation, mirroring the verify note on the right
      ctx.fillStyle = FAINT;
      ctx.font = '400 10.5px ' + SANS;
      ctx.fillText('Issued by', left, footY - 4);
      ctx.fillStyle = INK;
      ctx.font = '600 12.5px ' + SANS;
      ctx.fillText(c.signatoryTitle, left, footY + 13);
    }

    ctx.textAlign = 'right';
    ctx.fillStyle = FAINT;
    ctx.font = '400 10.5px ' + SANS;
    ctx.fillText('Verify this certificate at', right, footY - 4);
    ctx.fillStyle = GREY;
    ctx.font = '500 11.5px ' + SANS;
    ctx.fillText(c.verifyUrl + (d.certificateId ? '  ·  Unique ID ' + d.certificateId : ''), right, footY + 13);

    if (d.sample) {
      ctx.save();
      ctx.translate(cx, H / 2); ctx.rotate(-Math.PI / 7);
      ctx.fillStyle = 'rgba(29,29,31,.055)';
      ctx.font = '700 170px ' + SANS;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('SAMPLE', 0, 0);
      ctx.restore();
    }
  }

  function draw(canvas, data, widthPx) {
    var c = cfg();
    return Promise.all([loadFonts(), loadImage(c.signatureImage)]).then(function (r) {
      var px = Math.round(widthPx || W * 2), scale = px / W;
      canvas.width = px; canvas.height = Math.round(H * scale);
      var ctx = canvas.getContext('2d');
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      paint(ctx, data || {}, { signature: r[1] });
      return canvas;
    });
  }

  // ---------- Downloads ----------
  function fileName(d, ext) {
    var who = String(d.fullName || 'certificate').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return 'CodeBuzz-Internship-Certificate-' + who + '.' + ext;
  }
  function save(blob, name) {
    var a = document.createElement('a'), url = URL.createObjectURL(blob);
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }
  function bytes(dataUrl) {
    var bin = atob(dataUrl.split(',')[1]), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  function ascii(s) {
    var out = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) out[i] = s.charCodeAt(i) & 255;
    return out;
  }
  // A one-page A4 landscape PDF that holds the certificate as a full-page JPEG (300 dpi)
  function pdfFromJpeg(jpeg, pxW, pxH, title) {
    var PW = 841.89, PH = 595.28, parts = [], offsets = [], pos = 0;
    function push(chunk) { var b = typeof chunk === 'string' ? ascii(chunk) : chunk; parts.push(b); pos += b.length; }
    function obj(n, body) { offsets[n] = pos; push(n + ' 0 obj\n'); body(); push('\nendobj\n'); }
    var content = 'q ' + PW + ' 0 0 ' + PH + ' 0 0 cm /Im0 Do Q';
    var safeTitle = String(title).replace(/[^\x20-\x7E]/g, '').replace(/[\\()]/g, '');
    push('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
    obj(1, function () { push('<< /Type /Catalog /Pages 2 0 R >>'); });
    obj(2, function () { push('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'); });
    obj(3, function () { push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + PW + ' ' + PH + '] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>'); });
    obj(4, function () {
      push('<< /Type /XObject /Subtype /Image /Width ' + pxW + ' /Height ' + pxH + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + jpeg.length + ' >>\nstream\n');
      push(jpeg); push('\nendstream');
    });
    obj(5, function () { push('<< /Length ' + content.length + ' >>\nstream\n' + content + '\nendstream'); });
    obj(6, function () { push('<< /Title (' + safeTitle + ') /Author (CodeBuzz.ai) /Creator (CodeBuzz AI Internship Program) >>'); });
    var xref = pos;
    push('xref\n0 7\n0000000000 65535 f \n');
    for (var i = 1; i <= 6; i++) push(('0000000000' + offsets[i]).slice(-10) + ' 00000 n \n');
    push('trailer\n<< /Size 7 /Root 1 0 R /Info 6 0 R >>\nstartxref\n' + xref + '\n%%EOF\n');
    return new Blob(parts, { type: 'application/pdf' });
  }

  function downloadPdf(data) {
    return draw(document.createElement('canvas'), data, 3508).then(function (cv) {
      var jpeg = bytes(cv.toDataURL('image/jpeg', 0.93));
      save(pdfFromJpeg(jpeg, cv.width, cv.height, 'Internship Certificate - ' + (data.fullName || '')), fileName(data, 'pdf'));
    });
  }
  function downloadPng(data) {
    return draw(document.createElement('canvas'), data, 2400).then(function (cv) {
      return new Promise(function (resolve) {
        cv.toBlob(function (blob) { save(blob, fileName(data, 'png')); resolve(); }, 'image/png');
      });
    });
  }

  window.CBCertificate = { draw: draw, downloadPdf: downloadPdf, downloadPng: downloadPng, longDate: longDate, WIDTH: W, HEIGHT: H };
})();
