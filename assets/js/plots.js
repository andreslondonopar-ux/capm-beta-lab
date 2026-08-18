// Helpers de Plotly.js — mismo sistema de diseño y config interactiva que markowitz-portfolio-lab.

const Plots = (() => {
  const COLORS = {
    bg: "#0f1420",
    paper: "#0f1420",
    grid: "#232b3d",
    text: "#c9d1e0",
    accent: "#5b9df6",
    accent2: "#f6ad55",
    accent3: "#f56565",
    muted: "#5a6478",
  };

  const CONFIG = {
    scrollZoom: true,
    displayModeBar: true,
    doubleClick: "reset+autosize",
    responsive: true,
    displaylogo: false,
  };

  function baseLayout(title, extra = {}) {
    return {
      title: title ? { text: title, font: { color: COLORS.text, size: 15 } } : undefined,
      paper_bgcolor: COLORS.paper,
      plot_bgcolor: COLORS.bg,
      font: { color: COLORS.text, family: "Inter, system-ui, sans-serif" },
      margin: { t: title ? 40 : 20, r: 20, b: 45, l: 55 },
      dragmode: "pan",
      hovermode: "x unified",
      xaxis: { gridcolor: COLORS.grid, zerolinecolor: COLORS.grid, ...(extra.xaxis || {}) },
      yaxis: { gridcolor: COLORS.grid, zerolinecolor: COLORS.grid, ...(extra.yaxis || {}) },
      legend: { font: { color: COLORS.text }, bgcolor: "rgba(0,0,0,0)" },
      ...extra,
    };
  }

  const LINE_COLORS = [
    "#5b9df6", "#f6ad55", "#f56565", "#4fd1c5", "#a78bfa",
    "#34d399", "#f472b6", "#fbbf24", "#22d3ee", "#94a3b8",
  ];
  const LINE_WIDTH = 1.6;
  const LINE_WIDTH_ACTIVE = 3;
  const DIM_OPACITY = 0.15;

  function renderNormalizedPrices(el, tickers, dates, priceMatrix) {
    const n = tickers.length;
    const traces = tickers.map((t, i) => {
      const base = priceMatrix[0][i];
      return {
        x: dates,
        y: priceMatrix.map((row) => (row[i] / base) * 100),
        type: "scatter",
        mode: "lines",
        name: t,
        line: { width: LINE_WIDTH, color: LINE_COLORS[i % LINE_COLORS.length] },
      };
    });
    const layout = baseLayout(null, {
      hovermode: "closest",
      yaxis: { title: I18N.t("charts.priceYAxis"), gridcolor: COLORS.grid },
    });
    Plotly.newPlot(el, traces, layout, CONFIG).then(() => {
      const highlight = (idx) => {
        const widths = new Array(n).fill(LINE_WIDTH);
        const opacities = new Array(n).fill(DIM_OPACITY);
        widths[idx] = LINE_WIDTH_ACTIVE;
        opacities[idx] = 1;
        Plotly.restyle(el, { "line.width": widths, opacity: opacities });
      };
      const reset = () => {
        Plotly.restyle(el, { "line.width": new Array(n).fill(LINE_WIDTH), opacity: new Array(n).fill(1) });
      };
      el.on("plotly_hover", (evt) => {
        if (evt.points && evt.points.length) highlight(evt.points[0].curveNumber);
      });
      el.on("plotly_unhover", reset);
      el.querySelectorAll(".legend .traces").forEach((node, idx) => {
        node.style.cursor = "pointer";
        node.addEventListener("mouseenter", () => highlight(idx));
        node.addEventListener("mouseleave", reset);
      });
    });
  }

  // Scatter de retorno del activo vs. retorno del mercado + la recta de regresión ajustada
  // (pendiente = beta, intercepto = alfa diario). El gráfico central del sitio.
  function renderRegressionScatter(el, { assetReturns, marketReturns, beta, alphaDaily, assetTicker, marketTicker }) {
    const xPct = marketReturns.map((r) => r * 100);
    const yPct = assetReturns.map((r) => r * 100);

    const scatterTrace = {
      x: xPct,
      y: yPct,
      mode: "markers",
      type: "scattergl",
      name: I18N.t("charts.dailyReturns", { asset: assetTicker, market: marketTicker }),
      marker: { size: 4, color: COLORS.accent, opacity: 0.45 },
      hovertemplate: `${marketTicker}: %{x:.2f}%<br>${assetTicker}: %{y:.2f}%<extra></extra>`,
    };

    const xMin = Math.min(...xPct);
    const xMax = Math.max(...xPct);
    const lineX = [xMin, xMax];
    const lineY = lineX.map((x) => (alphaDaily * 100 + beta * (x / 100) * 100));
    const lineTrace = {
      x: lineX,
      y: lineY,
      mode: "lines",
      type: "scatter",
      name: I18N.t("charts.fittedLine"),
      line: { color: COLORS.accent3, width: 2.5 },
      hoverinfo: "skip",
    };

    const layout = baseLayout(null, {
      hovermode: "closest",
      xaxis: { title: I18N.t("charts.marketReturnAxis", { market: marketTicker }), gridcolor: COLORS.grid, zeroline: true },
      yaxis: { title: I18N.t("charts.assetReturnAxis", { asset: assetTicker }), gridcolor: COLORS.grid, zeroline: true },
    });
    Plotly.newPlot(el, [scatterTrace, lineTrace], layout, CONFIG);
  }

  // Security Market Line: cada activo (de los ticker-chips) como un punto en el plano
  // beta vs. retorno esperado anualizado, contra la línea teórica del CAPM.
  function renderSML(el, { points, riskFree, marketReturnAnnual }) {
    // El rango del eje no puede asumir beta >= 0 — activos como bonos largos suelen tener
    // beta negativo frente a acciones, y es justamente uno de los puntos pedagógicos más
    // interesantes de la SML (diversificación real), no un caso a recortar de la vista.
    const betas = points.map((p) => p.beta);
    const minBeta = Math.min(0, ...betas);
    const maxBeta = Math.max(1.4, ...betas);
    const pad = (maxBeta - minBeta) * 0.15;
    const xMin = minBeta - pad;
    const xMax = maxBeta + pad;
    const smlX = [xMin, xMax];
    const smlY = smlX.map((b) => (riskFree + b * (marketReturnAnnual - riskFree)) * 100);

    const smlTrace = {
      x: smlX,
      y: smlY,
      mode: "lines",
      type: "scatter",
      name: I18N.t("charts.smlLine"),
      line: { color: COLORS.text, width: 2, dash: "dash" },
      hoverinfo: "skip",
    };

    const pointsTrace = {
      x: points.map((p) => p.beta),
      y: points.map((p) => p.returnAnnual * 100),
      mode: "markers+text",
      type: "scatter",
      name: I18N.t("charts.assets"),
      text: points.map((p) => p.ticker),
      textposition: "top center",
      textfont: { color: COLORS.text, size: 12 },
      marker: {
        size: 12,
        color: points.map((p) => (p.alphaAnnual >= 0 ? COLORS.accent : COLORS.accent3)),
        line: { color: COLORS.bg, width: 1.5 },
      },
      hovertemplate: "%{text}<br>β: %{x:.2f}<br>Retorno: %{y:.1f}%<extra></extra>",
    };

    const marketTrace = {
      x: [1],
      y: [marketReturnAnnual * 100],
      mode: "markers",
      type: "scatter",
      name: I18N.t("charts.market"),
      marker: { size: 14, color: COLORS.accent2, symbol: "diamond", line: { color: COLORS.bg, width: 2 } },
      hovertemplate: `${I18N.t("charts.market")}: β=1, %{y:.1f}%<extra></extra>`,
    };

    const layout = baseLayout(null, {
      hovermode: "closest",
      xaxis: { title: I18N.t("charts.betaAxis"), gridcolor: COLORS.grid, range: [xMin, xMax], zeroline: true },
      yaxis: { title: I18N.t("charts.returnAxisAnnual"), gridcolor: COLORS.grid },
    });
    Plotly.newPlot(el, [smlTrace, pointsTrace, marketTrace], layout, CONFIG);
  }

  // Serie de tiempo del beta calculado en ventana deslizante — muestra que beta no es
  // una constante.
  function renderRollingBeta(el, points, fullPeriodBeta) {
    const trace = {
      x: points.map((p) => p.date),
      y: points.map((p) => p.beta),
      mode: "lines",
      type: "scatter",
      name: I18N.t("charts.rollingBeta"),
      line: { color: COLORS.accent, width: 2 },
    };
    const refLine = {
      x: [points[0].date, points[points.length - 1].date],
      y: [1, 1],
      mode: "lines",
      type: "scatter",
      name: I18N.t("charts.marketBetaRef"),
      line: { color: COLORS.text, width: 1, dash: "dot" },
      hoverinfo: "skip",
    };
    const fullPeriodLine = {
      x: [points[0].date, points[points.length - 1].date],
      y: [fullPeriodBeta, fullPeriodBeta],
      mode: "lines",
      type: "scatter",
      name: I18N.t("charts.fullPeriodBeta"),
      line: { color: COLORS.accent2, width: 1, dash: "dash" },
      hoverinfo: "skip",
    };
    const layout = baseLayout(null, {
      hovermode: "x unified",
      yaxis: { title: I18N.t("charts.betaAxis"), gridcolor: COLORS.grid },
    });
    Plotly.newPlot(el, [trace, refLine, fullPeriodLine], layout, CONFIG);
  }

  return {
    COLORS,
    CONFIG,
    baseLayout,
    renderNormalizedPrices,
    renderRegressionScatter,
    renderSML,
    renderRollingBeta,
  };
})();
