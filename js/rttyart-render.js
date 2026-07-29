/* ============================================================================
 * rttyart-render.js — RTTY / Baudot art renderer
 *
 * Descended from the RTTY Art Viewer written by Bill Bytheway, AA6ED, as a Java
 * applet in 1999. The carriage model here is his; the original source is kept in
 * this repository at original/rttyart.java.
 *
 * Three things this does that flat renderers do not:
 *
 *   1. LF is resolved per file rather than assumed. On a Model 15/28 page printer
 *      a line feed advances the paper and leaves the carriage where it stands,
 *      which is what Bill modelled. But files that have been through a text-mode
 *      conversion carry bare LFs that merely stand in for CRLF, and honoring
 *      those literally sends the carriage off to column 5000. So: if a file has
 *      no CRLF at all, or bare LFs outnumber them, LF is treated as a full line
 *      ending. Otherwise it advances the paper only. The carriage is also
 *      clamped at a physical right margin, because a real one cannot pass it.
 *
 *   2. Overstrike accumulates ink. Striking a cell twice puts twice the ribbon on
 *      the paper and it comes out darker — that is the entire reason artists did
 *      it. 22 files in the gallery use overstrike for tone, one of them
 *      (Faces.pix) across 100% of its inked cells. Painting opaque black over
 *      opaque black throws all of that away.
 *
 *   3. Zoom re-renders rather than scaling the bitmap, so text stays crisp.
 *
 * Usage:
 *     const stats = RTTYArt.render(canvas, text, { scale: 2 });
 * ==========================================================================*/

(function (root) {
  'use strict';

  // ITA2 / Baudot printable set, exactly as Bill's switch statement defined it.
  var BAUDOT = new Set(
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-$!&#\'()"/:;?,. '.split('')
  );

  var DEFAULTS = {
    charW: 5,          // 10 chars/inch and 6 lines/inch on a real page printer
    charH: 9,          // is a 1:1.67 cell; 5x9 keeps that proportion
    pad: 6,
    font: 'bold 8px "Courier New", Courier, monospace',
    bg: '#fffff0',
    ink: '#111100',
    // Two defensible ink models, because they trade off against each other:
    //
    //   additive  baseAlpha 1.00 / overstrikeAlpha 0.55
    //     First strike identical to a flat renderer, so any cell struck once is
    //     pixel-for-pixel unchanged and files without overstrike are provably
    //     untouched. But a saturated first strike leaves no headroom to darken,
    //     so overstrike can only spread outward. Conservative and subtle.
    //
    //   tonal     baseAlpha 0.78 / overstrikeAlpha 0.62
    //     One strike is dark grey, two near-black, three solid. This is closer
    //     to ribbon on paper and shows the real tonal range the artists were
    //     working with -- at the cost of single-struck areas reading lighter
    //     than the current gallery renderer.
    //   auto      baseAlpha 'auto'
    //     Per file, pick the base density so that the file's own heaviest cell
    //     lands at full ink. A file with no overstrike gets baseAlpha 1 and is
    //     therefore untouched; a file whose darkest cell is struck twice gets
    //     0.86, so one strike reads lighter and two read solid; a three-strike
    //     file gets 0.73 and shows three tones. Each file uses its full range
    //     and none is gratuitously lightened. This is the default.
    baseAlpha: 'auto',
    saturation: 0.98,   // ink coverage the heaviest cell should reach
    overstrikeAlpha: 0.55,
    scale: 1,
    overstrike: true,
    lfReturnsCarriage: 'auto', // 'auto' | true | false
    rightMargin: 132,          // widest common teleprinter carriage
    strictBaudot: false,       // true = Bill's exact filter, drops ASCII art
    jitter: 0.4        // sub-pixel spread on repeat strikes, as on real paper
  };

  /* A file with no CRLF anywhere has been converted to Unix line endings at some
   * point in its travels, so its LFs are line terminators rather than genuine
   * feed-without-return. adam$eve.pix in the gallery is exactly this case. */
  function lfIsTerminator(text) {
    var crlf = 0, bare = 0;
    for (var i = 0; i < text.length; i++) {
      if (text[i] !== '\n') continue;
      if (i > 0 && text[i - 1] === '\r') crlf++; else bare++;
    }
    return crlf === 0 || bare > crlf;
  }

  // Control bytes that are transport padding rather than content: CP/M EOF,
  // paper-tape rubout, nulls, bell, and anything with the parity bit set.
  function isArtifact(code) {
    return code === 0x1a || code === 0x7f || code === 0x00 ||
           code === 0x07 || code === 0x09 || code > 0x7e;
  }

  function keeps(ch, strict) {
    if (strict) return BAUDOT.has(ch);
    var c = ch.charCodeAt(0);
    if (isArtifact(c)) return false;
    return c >= 0x20 && c <= 0x7e;
  }

  /* Walk the text as a teletype carriage, collecting every character that lands
   * on each cell. Returns a Map keyed "row,col" holding arrays of characters, so
   * a cell struck three times carries three entries. */
  function layout(text, opt) {
    var cells = new Map();
    var col = 0, row = 0, maxCol = 0, maxRow = 0;
    var printable = 0, dropped = 0, bareCR = 0, bareLF = 0, midLineLF = 0;
    var clipped = 0;

    var lfReturns = opt.lfReturnsCarriage === 'auto'
      ? lfIsTerminator(text)
      : !!opt.lfReturnsCarriage;

    for (var i = 0; i < text.length; i++) {
      var ch = text[i];

      if (ch === '\r') {
        if (text[i + 1] !== '\n') bareCR++;
        if (col > maxCol) maxCol = col;
        col = 0;
        continue;
      }
      if (ch === '\n') {
        if (i === 0 || text[i - 1] !== '\r') {
          bareLF++;
          if (col > 0) midLineLF++;
        }
        if (col > maxCol) maxCol = col;
        row++;
        if (row > maxRow) maxRow = row;
        if (lfReturns || (i > 0 && text[i - 1] === '\r')) col = 0;
        continue;
      }
      if (!keeps(ch, opt.strictBaudot)) { dropped++; continue; }

      // A real carriage stops dead at the right margin; it does not wrap and it
      // cannot run off the platen.
      if (col >= opt.rightMargin) { clipped++; printable++; continue; }

      if (ch !== ' ') {                       // spaces advance but leave no ink
        var key = row + ',' + col;
        var stack = cells.get(key);
        if (stack) stack.push(ch); else cells.set(key, [ch]);
      }
      col++;
      printable++;
    }
    if (col > maxCol) maxCol = col;
    if (maxCol > opt.rightMargin) maxCol = opt.rightMargin;

    return {
      cells: cells, rows: maxRow + 1, cols: maxCol,
      printable: printable, dropped: dropped, clipped: clipped,
      lfReturnsCarriage: lfReturns,
      bareCR: bareCR, bareLF: bareLF, midLineLF: midLineLF
    };
  }

  /* Solve 1-(1-a)^peak = saturation, so a cell struck `peak` times lands at full
   * ink and everything below it falls into a real tonal ramp. peak of 1 gives
   * a = saturation = 1, which leaves files without overstrike exactly as they
   * render today. */
  function autoBase(peak, saturation) {
    if (peak <= 1) return 1;
    return 1 - Math.pow(1 - saturation, 1 / peak);
  }

  /* Deterministic sub-pixel offset so a given cell always jitters the same way.
   * Real overstrike never lands perfectly registered; without this, repeat
   * strikes of the same character are invisible except as a darkness change. */
  function wobble(row, col, strike, amount) {
    var h = (row * 73856093) ^ (col * 19349663) ^ (strike * 83492791);
    h = (h < 0 ? -h : h) % 1000;
    return ((h / 1000) - 0.5) * 2 * amount;
  }

  function render(canvas, text, options) {
    var opt = Object.assign({}, DEFAULTS, options || {});
    var lay = layout(text, opt);

    var cols = Math.max(lay.cols, 10);
    var rows = Math.max(lay.rows, 5);
    var s = opt.scale;

    var W = cols * opt.charW + opt.pad * 2;
    var H = rows * opt.charH + opt.pad * 2;

    canvas.width = Math.round(W * s);
    canvas.height = Math.round(H * s);
    canvas.style.width = Math.round(W * s) + 'px';
    canvas.style.height = Math.round(H * s) + 'px';

    // Deepest pile of strikes anywhere in this file sets the tonal range.
    var peak = 1;
    lay.cells.forEach(function (stack) { if (stack.length > peak) peak = stack.length; });
    var base = opt.baseAlpha === 'auto' ? autoBase(peak, opt.saturation) : opt.baseAlpha;

    /* autoBase solves for a density where `peak` strikes *all at that density*
     * composite to `saturation`. Applying the fixed overstrikeAlpha to later
     * strikes breaks that solution: a two-strike file lands at 0.94 rather than
     * 0.98, which is lighter than the flat render it is supposed to darken. The
     * fixed models are defined as a full first strike plus a weaker repeat, so
     * they keep overstrikeAlpha; auto uses its own solved density throughout. */
    var over = opt.baseAlpha === 'auto' ? base : opt.overstrikeAlpha;

    var ctx = canvas.getContext('2d');
    ctx.setTransform(s, 0, 0, s, 0, 0);
    ctx.fillStyle = opt.bg;
    ctx.fillRect(0, 0, W, H);
    ctx.font = opt.font;
    ctx.fillStyle = opt.ink;
    ctx.textBaseline = 'top';

    var inked = 0, multi = 0, maxHits = 1;

    lay.cells.forEach(function (stack, key) {
      var parts = key.split(',');
      var row = +parts[0], col = +parts[1];
      var x = opt.pad + col * opt.charW;
      var y = opt.pad + row * opt.charH;

      inked++;
      if (stack.length > 1) multi++;
      if (stack.length > maxHits) maxHits = stack.length;

      if (!opt.overstrike) {
        ctx.globalAlpha = 1;
        ctx.fillText(stack[stack.length - 1], x, y);
        return;
      }

      for (var k = 0; k < stack.length; k++) {
        // Every pass after the first lands slightly off register, the way a real
        // carriage never quite repeats itself. The cell gets both darker and a
        // touch fatter, which is what overstrike actually looks like on paper.
        ctx.globalAlpha = k === 0 ? base : over;
        var dx = k === 0 ? 0 : wobble(row, col, k, opt.jitter);
        var dy = k === 0 ? 0 : wobble(col, row, k, opt.jitter);
        ctx.fillText(stack[k], x + dx, y + dy);
      }
    });

    ctx.globalAlpha = 1;

    return {
      charCount: lay.printable,
      lineCount: lay.rows,
      cols: lay.cols,
      dropped: lay.dropped,
      clipped: lay.clipped,
      lfReturnsCarriage: lay.lfReturnsCarriage,
      overstrikeOps: lay.bareCR,
      bareLF: lay.bareLF,
      midLineLF: lay.midLineLF,
      inkedCells: inked,
      multiStruckCells: multi,
      maxHits: maxHits,
      pctMulti: inked ? Math.round(1000 * multi / inked) / 10 : 0,
      width: W, height: H
    };
  }

  /* Strip extension and trailing callsign for display. Handles .pox as well as
   * .pix — crane.pox and getinout.pox are real files in the gallery. */
  function displayName(filename) {
    return filename
      .replace(/\.(pix|pox)$/i, '')
      .replace(/_[A-Z0-9]{4,7}$/i, '')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_-]/g, ' ')
      .trim();
  }

  function extractCall(filename) {
    var m = filename.match(/_([A-Z0-9]{4,7})\.(pix|pox)$/i);
    if (!m) return null;
    var c = m[1].toUpperCase();
    return (/[A-Z]/.test(c) && /[0-9]/.test(c)) ? c : null;
  }

  root.RTTYArt = {
    render: render,
    displayName: displayName,
    extractCall: extractCall,
    BAUDOT: BAUDOT,
    DEFAULTS: DEFAULTS
  };
})(typeof window !== 'undefined' ? window : this);
