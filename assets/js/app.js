// Orquestación: dos pipelines independientes.
// (1) Activo vs. benchmark — Pasos 2, 3, 5, 7 (regresión, resultados, beta móvil).
// (2) Security Market Line — Paso 6, multi-activo vía ticker-chips, contra el mismo
//     benchmark/tasa libre de riesgo configurados arriba.
// Bilingüe desde el arranque (ver assets/js/i18n.js) — todo string generado aquí pasa por
// I18N.t().

const MAX_SML_TICKERS = 10;
const ROLLING_WINDOW = 252;

(function () {
  const el = (id) => document.getElementById(id);

  const assetInput = el("asset-input");
  const benchmarkInput = el("benchmark-input");
  const riskfreeInput = el("riskfree-input");
  const yearsInput = el("years-input");
  const recalcBtn = el("recalc-btn");
  const statusLineEl = el("status-line");
  const langToggleBtn = el("lang-toggle");

  const plotPricesEl = el("plot-prices");
  const plotRegressionEl = el("plot-regression");
  const statTilesEl = el("stat-tiles");
  const interpretationTextEl = el("interpretation-text");
  const plotRollingBetaEl = el("plot-rolling-beta");

  const smlTickerChipsEl = el("sml-ticker-chips");
  const smlTickerEntryInput = el("sml-ticker-entry");
  const smlUpdateBtn = el("sml-update-btn");
  const smlStatusLineEl = el("sml-status-line");
  const plotSmlEl = el("plot-sml");
  const smlTableToggle = el("sml-table-toggle");
  const smlTableWrap = el("sml-table-wrap");

  let state = null; // { assetTicker, benchmarkTicker, dates, prices, assetReturns, marketReturns, regression, rollingPoints, riskFree }
  let smlTickers = ["MSFT", "JPM", "XOM", "GLD", "TLT"];

  function fmtPct(x, d = 1) {
    return (x * 100).toFixed(d) + "%";
  }
  function fmtNum(x, d = 2) {
    return x.toFixed(d);
  }
  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }
  function toISO(d) {
    return d.toISOString().slice(0, 10);
  }
  function setStatus(msg, isError = false) {
    statusLineEl.textContent = msg;
    statusLineEl.classList.toggle("error", !!isError);
  }
  function setSmlStatus(msg, isError = false) {
    smlStatusLineEl.textContent = msg;
    smlStatusLineEl.classList.toggle("error", !!isError);
  }
  function setBusy(b) {
    recalcBtn.disabled = b;
    document.body.classList.toggle("is-recalculating", b);
  }

  async function fetchPrices(tickers, years) {
    const end = new Date();
    const start = new Date(end.getFullYear() - years, end.getMonth(), end.getDate());
    const url = `/api/prices?tickers=${encodeURIComponent(tickers.join(","))}&start=${toISO(start)}&end=${toISO(end)}`;
    const res = await fetch(url);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || I18N.t("app.priceFetchError"));
    return json;
  }

  // --- Pipeline principal: activo vs. benchmark ---

  function renderStatTiles(regression) {
    const betaUp = regression.beta >= 1;
    statTilesEl.innerHTML = `
      <div class="stat-tile"><div class="label">${I18N.t("app.statBeta")}</div><div class="value ${betaUp ? "up" : "down"}">${fmtNum(regression.beta)}</div></div>
      <div class="stat-tile"><div class="label">${I18N.t("app.statAlpha")}</div><div class="value ${regression.alphaAnnual >= 0 ? "up" : "down"}">${fmtPct(regression.alphaAnnual)}</div></div>
      <div class="stat-tile"><div class="label">${I18N.t("app.statR2")}</div><div class="value">${fmtNum(regression.r2)}</div></div>
      <div class="stat-tile"><div class="label">${I18N.t("app.statAssetReturn")}</div><div class="value">${fmtPct(regression.assetReturnAnnual)}</div></div>
      <div class="stat-tile"><div class="label">${I18N.t("app.statMarketReturn")}</div><div class="value">${fmtPct(regression.marketReturnAnnual)}</div></div>
      <div class="stat-tile"><div class="label">${I18N.t("app.statSystematic")}</div><div class="value">${fmtPct(regression.systematicVolAnnual)}</div></div>
      <div class="stat-tile"><div class="label">${I18N.t("app.statIdiosyncratic")}</div><div class="value">${fmtPct(regression.idiosyncraticVolAnnual)}</div></div>
    `;
  }

  function renderInterpretation(regression, assetTicker, benchmarkTicker) {
    const beta = regression.beta;
    let text;
    if (beta > 1.1) {
      text = I18N.t("app.interpAggressive", { beta: fmtNum(beta), asset: assetTicker, benchmark: benchmarkTicker });
    } else if (beta < 0.9) {
      text = I18N.t("app.interpDefensive", { beta: fmtNum(beta), asset: assetTicker, benchmark: benchmarkTicker });
    } else {
      text = I18N.t("app.interpNeutral", { beta: fmtNum(beta) });
    }
    text += I18N.t(regression.alphaAnnual >= 0 ? "app.interpAlphaPositive" : "app.interpAlphaNegative", {
      alpha: fmtPct(regression.alphaAnnual),
    });
    text += I18N.t("app.interpR2", { r2: fmtNum(regression.r2), asset: assetTicker });
    interpretationTextEl.textContent = text;
  }

  function renderFromState() {
    if (!state) return;
    const { assetTicker, benchmarkTicker, dates, prices, assetReturns, marketReturns, regression, rollingPoints } = state;

    Plots.renderNormalizedPrices(plotPricesEl, [assetTicker, benchmarkTicker], dates, prices);
    Plots.renderRegressionScatter(plotRegressionEl, {
      assetReturns,
      marketReturns,
      beta: regression.beta,
      alphaDaily: regression.alphaAnnual / CAPM.TRADING_DAYS,
      assetTicker,
      marketTicker: benchmarkTicker,
    });
    renderStatTiles(regression);
    renderInterpretation(regression, assetTicker, benchmarkTicker);

    if (rollingPoints && rollingPoints.length > 0) {
      Plots.renderRollingBeta(plotRollingBetaEl, rollingPoints, regression.beta);
    }

    setStatus(
      I18N.t("app.ready", {
        asset: assetTicker,
        benchmark: benchmarkTicker,
        n: dates.length,
        d1: dates[0],
        d2: dates[dates.length - 1],
      })
    );
  }

  async function runPipeline() {
    const assetTicker = assetInput.value.trim().toUpperCase() || "AAPL";
    const benchmarkTicker = benchmarkInput.value.trim().toUpperCase() || "SPY";
    assetInput.value = assetTicker;
    benchmarkInput.value = benchmarkTicker;

    setBusy(true);
    setStatus(I18N.t("app.downloading", { asset: assetTicker, benchmark: benchmarkTicker }));

    try {
      const years = clamp(parseInt(yearsInput.value, 10) || 8, 2, 20);
      const json = await fetchPrices([assetTicker, benchmarkTicker], years);
      const data = json.data || {};
      const errors = json.errors || {};

      if (!data[assetTicker] || !data[benchmarkTicker]) {
        throw new Error(
          I18N.t("app.notEnoughValid", { asset: assetTicker, benchmark: benchmarkTicker }) +
            Object.entries(errors).map(([t, e]) => `${t}: ${e}`).join(" | ")
        );
      }

      const aligned = CAPM.alignPrices({ [assetTicker]: data[assetTicker], [benchmarkTicker]: data[benchmarkTicker] });
      if (aligned.dates.length < 60) {
        throw new Error(I18N.t("app.tooFewDates"));
      }

      const assetIdx = aligned.tickers.indexOf(assetTicker);
      const benchmarkIdx = aligned.tickers.indexOf(benchmarkTicker);
      const assetPriceSeries = aligned.prices.map((row) => row[assetIdx]);
      const marketPriceSeries = aligned.prices.map((row) => row[benchmarkIdx]);
      const assetReturns = CAPM.logReturns(assetPriceSeries);
      const marketReturns = CAPM.logReturns(marketPriceSeries);
      const riskFree = (parseFloat(riskfreeInput.value) || 0) / 100;

      const regression = CAPM.regress(assetReturns, marketReturns);

      let rollingPoints = [];
      if (assetReturns.length > ROLLING_WINDOW) {
        rollingPoints = CAPM.rollingBeta(assetReturns, marketReturns, aligned.dates, ROLLING_WINDOW);
      }

      state = {
        assetTicker,
        benchmarkTicker,
        dates: aligned.dates,
        prices: aligned.prices.map((row) => [row[assetIdx], row[benchmarkIdx]]),
        assetReturns,
        marketReturns,
        regression,
        rollingPoints,
        riskFree,
      };
      renderFromState();
    } catch (err) {
      setStatus(err.message || I18N.t("app.unexpectedError"), true);
    } finally {
      setBusy(false);
    }
  }

  // --- Pipeline SML: multi-activo vía ticker-chips ---

  function renderSmlChips() {
    smlTickerChipsEl.querySelectorAll(".ticker-chip").forEach((chip) => chip.remove());
    smlTickers.forEach((t) => {
      const chip = document.createElement("span");
      chip.className = "ticker-chip";
      chip.textContent = t;
      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.setAttribute("aria-label", I18N.t("app.removeTicker", { ticker: t }));
      removeBtn.textContent = "×";
      removeBtn.addEventListener("click", () => {
        smlTickers = smlTickers.filter((x) => x !== t);
        renderSmlChips();
      });
      chip.appendChild(removeBtn);
      smlTickerChipsEl.insertBefore(chip, smlTickerEntryInput);
    });
  }

  function addSmlTicker(raw) {
    const ticker = raw.trim().toUpperCase();
    if (!ticker || smlTickers.includes(ticker)) return;
    if (smlTickers.length >= MAX_SML_TICKERS) {
      setSmlStatus(I18N.t("app.maxTickersError", { n: MAX_SML_TICKERS }), true);
      return;
    }
    smlTickers.push(ticker);
  }

  function addSmlTickersFromRaw(raw) {
    raw.split(",").map((s) => s.trim()).filter(Boolean).forEach(addSmlTicker);
    renderSmlChips();
  }

  function renderSmlTable(points) {
    const sorted = [...points].sort((a, b) => b.returnAnnual - a.returnAnnual);
    const rows = sorted
      .map(
        (p) =>
          `<tr><td>${p.ticker}</td><td>${fmtNum(p.beta)}</td><td>${fmtPct(p.alphaAnnual)}</td><td>${fmtNum(p.r2)}</td><td>${fmtPct(p.returnAnnual)}</td></tr>`
      )
      .join("");
    smlTableWrap.innerHTML = `<table class="data-table"><thead><tr><th>${I18N.t("app.tableAsset")}</th><th>${I18N.t("app.tableBeta")}</th><th>${I18N.t("app.tableAlpha")}</th><th>${I18N.t("app.tableR2")}</th><th>${I18N.t("app.tableReturn")}</th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  function setupTableToggle(btn, wrapEl) {
    btn.addEventListener("click", () => {
      const isHidden = wrapEl.hasAttribute("hidden");
      if (isHidden) wrapEl.removeAttribute("hidden");
      else wrapEl.setAttribute("hidden", "");
      btn.textContent = isHidden ? I18N.t("app.hideTable") : I18N.t("app.viewTable");
    });
  }

  async function runSmlPipeline() {
    if (smlTickerEntryInput.value.trim()) {
      addSmlTickersFromRaw(smlTickerEntryInput.value);
      smlTickerEntryInput.value = "";
    }
    if (smlTickers.length < 1) {
      setSmlStatus(I18N.t("app.needOneTicker"), true);
      return;
    }
    if (!state) {
      setSmlStatus(I18N.t("controls.loadingDefault"));
      return;
    }

    smlUpdateBtn.disabled = true;
    plotSmlEl.closest(".card").classList.add("is-dimmed");
    setSmlStatus(I18N.t("paso6.loading"));

    try {
      const { benchmarkTicker, riskFree } = state;
      const years = clamp(parseInt(yearsInput.value, 10) || 8, 2, 20);
      const json = await fetchPrices([...smlTickers, benchmarkTicker], years);
      const data = json.data || {};
      const errors = json.errors || {};

      const validTickers = smlTickers.filter((t) => data[t]);
      if (validTickers.length < 1 || !data[benchmarkTicker]) {
        throw new Error(
          I18N.t("app.notEnoughValid", { asset: smlTickers.join(", "), benchmark: benchmarkTicker }) +
            Object.entries(errors).map(([t, e]) => `${t}: ${e}`).join(" | ")
        );
      }

      // Cualquier ticker que no traiga datos, o que traiga muy pocas fechas en común con el
      // benchmark, se omite del gráfico — pero se le avisa al usuario cuál y por qué, en vez
      // de dejarlo desaparecer en silencio.
      const omitted = smlTickers.filter((t) => !data[t]).map((t) => `${t} — ${errors[t] || I18N.t("app.priceFetchError")}`);

      const points = [];
      for (const ticker of validTickers) {
        const aligned = CAPM.alignPrices({ [ticker]: data[ticker], [benchmarkTicker]: data[benchmarkTicker] });
        if (aligned.dates.length < 60) {
          omitted.push(`${ticker} — ${I18N.t("app.tooFewDates")}`);
          continue;
        }
        const tIdx = aligned.tickers.indexOf(ticker);
        const bIdx = aligned.tickers.indexOf(benchmarkTicker);
        const tReturns = CAPM.logReturns(aligned.prices.map((row) => row[tIdx]));
        const bReturns = CAPM.logReturns(aligned.prices.map((row) => row[bIdx]));
        const reg = CAPM.regress(tReturns, bReturns);
        points.push({ ticker, beta: reg.beta, returnAnnual: reg.assetReturnAnnual, alphaAnnual: reg.alphaAnnual, r2: reg.r2 });
      }

      if (points.length === 0) throw new Error(I18N.t("app.tooFewDates"));

      const marketReturnAnnual = points.length ? state.regression.marketReturnAnnual : 0;
      Plots.renderSML(plotSmlEl, { points, riskFree, marketReturnAnnual });
      renderSmlTable(points);
      setSmlStatus(omitted.length ? I18N.t("app.omitted", { list: omitted.join(", ") }) : "");
    } catch (err) {
      setSmlStatus(err.message || I18N.t("app.unexpectedError"), true);
    } finally {
      smlUpdateBtn.disabled = false;
      plotSmlEl.closest(".card").classList.remove("is-dimmed");
    }
  }

  recalcBtn.addEventListener("click", runPipeline);
  [assetInput, benchmarkInput, riskfreeInput, yearsInput].forEach((input) => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") runPipeline();
    });
  });

  smlUpdateBtn.addEventListener("click", runSmlPipeline);
  setupTableToggle(smlTableToggle, smlTableWrap);
  smlTickerEntryInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSmlTickersFromRaw(smlTickerEntryInput.value);
      smlTickerEntryInput.value = "";
    } else if (e.key === "Backspace" && smlTickerEntryInput.value === "" && smlTickers.length > 0) {
      smlTickers.pop();
      renderSmlChips();
    }
  });
  smlTickerEntryInput.addEventListener("blur", () => {
    if (smlTickerEntryInput.value.trim()) {
      addSmlTickersFromRaw(smlTickerEntryInput.value);
      smlTickerEntryInput.value = "";
    }
  });

  langToggleBtn.addEventListener("click", () => {
    const next = I18N.getLocale() === "es" ? "en" : "es";
    I18N.setLocale(next);
    langToggleBtn.textContent = next === "es" ? "EN" : "ES";
    renderSmlChips();
    if (window.renderMathInElement) {
      window.renderMathInElement(document.body, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "\\(", right: "\\)", display: false },
        ],
      });
    }
    if (state) {
      renderFromState();
      runSmlPipeline();
    } else {
      setStatus(I18N.t("controls.loadingDefault"));
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    I18N.applyStaticTranslations();
    langToggleBtn.textContent = I18N.getLocale() === "es" ? "EN" : "ES";
    renderSmlChips();
    if (window.renderMathInElement) {
      window.renderMathInElement(document.body, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "\\(", right: "\\)", display: false },
        ],
      });
    }
    runPipeline().then(runSmlPipeline);
  });
})();
