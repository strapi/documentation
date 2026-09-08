/* THE ONE EURO FILTER (Casiez, Roussel, Vogel, CHI 2012).
   A moving average forces one choice for two opposite needs: heavy smoothing
   makes a still hand calm and a moving hand late, light smoothing does the
   reverse. This one varies its own cutoff with the speed of the signal, so a
   still hand is smoothed hard and a fast hand is barely touched at all.
   Pure maths. It knows nothing about hands, DOM or MediaPipe. */

function alpha(cutoff, dt) {
  const tau = 1 / (2 * Math.PI * cutoff);
  return 1 / (1 + tau / dt);
}

export function makeOneEuro(opts) {
  const o = opts || {};
  // Swept 0.02/0.05/0.10/0.14/0.16/0.25/0.5/1.0 against the reference fixture,
  // measuring both ends of the tradeoff on the same window: tremor kept climbs
  // from 1.1% to 35.4% as minCutoff rises, while lag during the fastest
  // motion the trace actually lets us measure barely moves at all (max abs
  // error 0.0739 at 0.02 down to 0.0528 at 1.0 -- both tiny next to the
  // 0.45-wide pinch band). Lag never becomes a real cost in this trace, so
  // the lowest swept value, which gives the best tremor suppression, wins.
  const minCutoff = o.minCutoff === undefined ? 0.02 : o.minCutoff;
  // beta is the speed coefficient: how much the cutoff opens up as the hand
  // moves. Too small and fast motion lags; too large and tremor comes back.
  const beta = o.beta === undefined ? 0.007 : o.beta;
  const dCutoff = o.dCutoff === undefined ? 1.0 : o.dCutoff;

  let xPrev = null, dxPrev = 0, tPrev = null;

  return {
    reset() { xPrev = null; dxPrev = 0; tPrev = null; },
    filter(x, t) {
      if (xPrev === null || tPrev === null) { xPrev = x; tPrev = t; return x; }
      const dt = Math.max(1e-4, t - tPrev);
      // the derivative is filtered too, or its own noise would open the cutoff
      const dx = (x - xPrev) / dt;
      const aD = alpha(dCutoff, dt);
      const dxHat = aD * dx + (1 - aD) * dxPrev;
      const cutoff = minCutoff + beta * Math.abs(dxHat);
      const a = alpha(cutoff, dt);
      const xHat = a * x + (1 - a) * xPrev;
      xPrev = xHat; dxPrev = dxHat; tPrev = t;
      return xHat;
    },
  };
}
