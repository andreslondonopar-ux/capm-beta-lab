// Modelo CAPM: regresión OLS simple entre los retornos de un activo y los de un benchmark.
// A diferencia de Markowitz.js no necesita álgebra matricial — con un solo factor (el
// mercado), beta/alfa/R² tienen fórmulas cerradas de una sola variable.

const TRADING_DAYS = 252;

const CAPM = (() => {
  function alignPrices(dataByTicker) {
    const tickers = Object.keys(dataByTicker);
    const maps = tickers.map((t) => new Map(dataByTicker[t].map((r) => [r.date, r.close])));
    let commonDates = [...maps[0].keys()];
    for (let i = 1; i < maps.length; i++) {
      const s = maps[i];
      commonDates = commonDates.filter((d) => s.has(d));
    }
    commonDates.sort();
    const prices = commonDates.map((date) => tickers.map((_, i) => maps[i].get(date)));
    return { tickers, dates: commonDates, prices };
  }

  function logReturns(priceSeries) {
    const rets = new Array(priceSeries.length - 1);
    for (let i = 1; i < priceSeries.length; i++) rets[i - 1] = Math.log(priceSeries[i] / priceSeries[i - 1]);
    return rets;
  }

  function mean(arr) {
    let s = 0;
    for (const x of arr) s += x;
    return s / arr.length;
  }

  function covariance(a, b, meanA, meanB) {
    let s = 0;
    for (let i = 0; i < a.length; i++) s += (a[i] - meanA) * (b[i] - meanB);
    return s / (a.length - 1);
  }

  function variance(a, meanA) {
    return covariance(a, a, meanA, meanA);
  }

  // Regresión OLS de un solo factor: r_i = alpha + beta * r_m + epsilon.
  // Beta/alfa se calculan sobre retornos diarios (el factor de anualización se cancela en el
  // cociente Cov/Var), y luego se anualiza solo el alfa (que sí depende de la escala) ×252.
  function regress(assetReturns, marketReturns) {
    const n = assetReturns.length;
    const meanA = mean(assetReturns);
    const meanM = mean(marketReturns);
    const covAM = covariance(assetReturns, marketReturns, meanA, meanM);
    const varM = variance(marketReturns, meanM);
    const varA = variance(assetReturns, meanA);

    const beta = covAM / varM;
    const alphaDaily = meanA - beta * meanM;
    const alphaAnnual = alphaDaily * TRADING_DAYS;
    const corr = covAM / Math.sqrt(varA * varM);
    const r2 = corr * corr;

    const systematicVar = beta * beta * varM * TRADING_DAYS;
    const idiosyncraticVar = Math.max(varA - beta * beta * varM, 0) * TRADING_DAYS;

    return {
      n,
      beta,
      alphaAnnual,
      r2,
      assetReturnAnnual: meanA * TRADING_DAYS,
      marketReturnAnnual: meanM * TRADING_DAYS,
      assetVolAnnual: Math.sqrt(varA * TRADING_DAYS),
      marketVolAnnual: Math.sqrt(varM * TRADING_DAYS),
      systematicVolAnnual: Math.sqrt(systematicVar),
      idiosyncraticVolAnnual: Math.sqrt(idiosyncraticVar),
    };
  }

  function capmExpectedReturn(beta, riskFree, marketReturnAnnual) {
    return riskFree + beta * (marketReturnAnnual - riskFree);
  }

  // Beta calculado sobre una ventana deslizante de `window` observaciones, un punto por
  // cada día donde ya hay suficiente historia — muestra que beta cambia con el tiempo.
  function rollingBeta(assetReturns, marketReturns, dates, window) {
    const points = [];
    for (let end = window; end <= assetReturns.length; end++) {
      const a = assetReturns.slice(end - window, end);
      const m = marketReturns.slice(end - window, end);
      const meanA = mean(a);
      const meanM = mean(m);
      const varM = variance(m, meanM);
      const covAM = covariance(a, m, meanA, meanM);
      points.push({ date: dates[end], beta: covAM / varM });
    }
    return points;
  }

  return { alignPrices, logReturns, mean, covariance, variance, regress, capmExpectedReturn, rollingBeta, TRADING_DAYS };
})();
