// Diccionario ES/EN + helpers. Mismo patrón que markowitz-portfolio-lab/assets/js/i18n.js.

const I18N = (() => {
  const STORAGE_KEY = "capmbetalab-locale";

  const dict = {
    "nav.intro": { es: "Intro", en: "Intro" },
    "nav.paso1": { es: "1. Activos", en: "1. Assets" },
    "nav.paso2": { es: "2. Datos", en: "2. Data" },
    "nav.paso3": { es: "3. Regresión", en: "3. Regression" },
    "nav.paso4": { es: "4. Teoría", en: "4. Theory" },
    "nav.paso5": { es: "5. Resultados", en: "5. Results" },
    "nav.paso6": { es: "6. SML", en: "6. SML" },
    "nav.paso7": { es: "7. Beta móvil", en: "7. Rolling beta" },
    "nav.limites": { es: "Límites", en: "Limits" },
    "nav.creador": { es: "Creador", en: "Creator" },

    "hero.eyebrow": { es: "Proyecto educativo · Capital Asset Pricing Model", en: "Educational project · Capital Asset Pricing Model" },
    "hero.h1": { es: "Beta y alfa: el modelo CAPM, paso a paso", en: "Beta and alpha: the CAPM model, step by step" },
    "hero.lead": {
      es: `El mismo año que Markowitz (1990), William Sharpe ganó el Nobel por una idea que
        simplificó radicalmente la suya: en vez de necesitar la matriz de covarianza completa
        entre todos los activos, el <strong>CAPM</strong> reduce el riesgo de un activo a un
        solo número frente al mercado — su <em>beta</em>. Este sitio calcula beta, alfa y
        R² en vivo con datos reales, con tus propios activos y benchmark.`,
      en: `The same year as Markowitz (1990), William Sharpe won the Nobel Prize for an idea
        that radically simplified his: instead of needing the full covariance matrix across
        every asset, the <strong>CAPM</strong> reduces an asset's risk to a single number
        relative to the market — its <em>beta</em>. This site computes beta, alpha, and R²
        live with real data, using your own assets and benchmark.`,
    },

    "controls.assetLabel": { es: "Activo", en: "Asset" },
    "controls.benchmarkLabel": { es: "Benchmark (mercado)", en: "Benchmark (market)" },
    "controls.riskfreeLabel": { es: "Tasa libre de riesgo (% anual)", en: "Risk-free rate (% annual)" },
    "controls.yearsLabel": { es: "Años de histórico", en: "Years of history" },
    "controls.recalcBtn": { es: "Recalcular", en: "Recalculate" },
    "controls.loadingDefault": { es: "Cargando ejemplo por defecto…", en: "Loading default example…" },
    "controls.tickerHint": {
      es: "Los tickers deben existir en Yahoo Finance. Para acciones/ETFs de EE. UU. basta con el símbolo normal (ej. <code>AAPL</code>, <code>SPY</code>).",
      en: "Tickers must exist on Yahoo Finance. For US stocks/ETFs the plain symbol is enough (e.g. <code>AAPL</code>, <code>SPY</code>).",
    },

    "paso1.badge": { es: "PASO 1", en: "STEP 1" },
    "paso1.title": { es: "Elegir el activo y el benchmark", en: "Choose the asset and the benchmark" },
    "paso1.p1": {
      es: `El CAPM compara un activo contra "el mercado" — en la práctica, un índice amplio que
        sirve de proxy (típicamente <strong>SPY</strong>, que replica el S&P 500). El resultado
        depende del benchmark elegido: el mismo activo puede tener un beta distinto frente al
        S&P 500, el Nasdaq, o un índice internacional.`,
      en: `CAPM compares an asset against "the market" — in practice, a broad index used as a
        proxy (typically <strong>SPY</strong>, which tracks the S&P 500). The result depends on
        the benchmark chosen: the same asset can have a different beta against the S&P 500,
        the Nasdaq, or an international index.`,
    },
    "paso1.p2": {
      es: `Prueba cambiando el activo o el benchmark arriba: por ejemplo, compara una acción
        tecnológica volátil contra el S&P 500 (<code>SPY</code>) y luego contra el Nasdaq
        (<code>QQQ</code>) — el beta cambia porque el benchmark cambia.`,
      en: `Try changing the asset or benchmark above: for example, compare a volatile tech
        stock against the S&P 500 (<code>SPY</code>) and then against the Nasdaq
        (<code>QQQ</code>) — beta changes because the benchmark changes.`,
    },

    "paso2.badge": { es: "PASO 2", en: "STEP 2" },
    "paso2.title": { es: "Datos históricos y retornos", en: "Historical data and returns" },
    "paso2.p": {
      es: `Se descargan los precios de cierre diarios del activo y del benchmark, normalizados a
        base 100, y se calculan los <strong>retornos logarítmicos diarios</strong> de ambos —
        la materia prima de todo lo que sigue.`,
      en: `Daily closing prices for the asset and the benchmark are downloaded, normalized to
        base 100, and the <strong>daily log returns</strong> of both are computed — the raw
        material for everything that follows.`,
    },

    "paso3.badge": { es: "PASO 3", en: "STEP 3" },
    "paso3.title": { es: "Regresión: el activo contra el mercado", en: "Regression: the asset against the market" },
    "paso3.p": {
      es: `Cada punto es un día: en el eje x, el retorno del benchmark ese día; en el eje y, el
        retorno del activo. La <strong>recta ajustada por mínimos cuadrados</strong> (línea roja)
        resume la relación — su <strong>pendiente es beta</strong> (cuánto se mueve el activo
        por cada 1% que se mueve el mercado) y su <strong>intercepto es alfa</strong> (el
        retorno diario que el activo obtiene incluso cuando el mercado no se mueve).`,
      en: `Each point is one day: on the x-axis, that day's benchmark return; on the y-axis,
        the asset's return. The <strong>least-squares fitted line</strong> (red) summarizes the
        relationship — its <strong>slope is beta</strong> (how much the asset moves for every
        1% the market moves) and its <strong>intercept is alpha</strong> (the daily return the
        asset earns even when the market doesn't move at all).`,
    },

    "paso4.badge": { es: "PASO 4", en: "STEP 4" },
    "paso4.title": { es: "La teoría del CAPM", en: "CAPM theory" },
    "paso4.p1": {
      es: "El CAPM predice el retorno esperado de un activo a partir de un solo factor de riesgo, el mercado:",
      en: "CAPM predicts an asset's expected return from a single risk factor, the market:",
    },
    "paso4.p2": {
      es: `Donde <code>β</code> mide qué tan sensible es el activo a los movimientos del mercado.
        Se obtiene de la regresión lineal del Paso 3, y tiene una fórmula cerrada equivalente en
        términos de covarianza y varianza:`,
      en: `Where <code>β</code> measures how sensitive the asset is to market movements. It
        comes from the linear regression in Step 3, and has an equivalent closed-form formula
        in terms of covariance and variance:`,
    },
    "paso4.p3": {
      es: `El <strong>alfa de Jensen</strong> es la diferencia entre el retorno real del activo y
        lo que el CAPM predice — un alfa positivo históricamente significa que el activo rindió
        más de lo que su riesgo sistemático justificaba:`,
      en: `<strong>Jensen's alpha</strong> is the difference between the asset's actual return
        and what CAPM predicts — a positive alpha historically means the asset returned more
        than its systematic risk would justify:`,
    },
    "paso4.p4": {
      es: `El CAPM también descompone el riesgo total del activo (su varianza) en dos partes: el
        <strong>riesgo sistemático</strong> (el que viene de moverse con el mercado, no se
        elimina diversificando) y el <strong>riesgo idiosincrático</strong> (específico del
        activo, sí se elimina diversificando con más activos no correlacionados):`,
      en: `CAPM also splits the asset's total risk (its variance) into two parts:
        <strong>systematic risk</strong> (the part that comes from moving with the market,
        which diversification cannot remove) and <strong>idiosyncratic risk</strong> (specific
        to the asset, which diversification across more uncorrelated assets does remove):`,
    },
    "paso4.p5": {
      es: `Este sitio calcula beta, alfa, R² y la descomposición de riesgo con álgebra simple en
        el navegador, en vivo (código en <code>assets/js/capm.js</code>).`,
      en: `This site computes beta, alpha, R², and the risk decomposition with simple algebra
        in the browser, live (code in <code>assets/js/capm.js</code>).`,
    },
    "paso4.assumptions": {
      es: `<strong>Supuestos del modelo — con honestidad sobre sus límites:</strong> asume que
        todos los inversionistas tienen las mismas expectativas y pueden prestar/pedir prestado
        a la misma tasa libre de riesgo, que los mercados son eficientes y sin fricciones
        (costos de transacción, impuestos), y que el mercado es el <em>único</em> factor de
        riesgo relevante. En la práctica el beta cambia con el tiempo (Paso 7), y modelos
        multifactoriales (ej. Fama-French, que agrega tamaño y valor) explican mejor los
        retornos observados. El CAPM sigue siendo el punto de partida — el "modelo de un
        factor" que todos los demás modelos usan como base.`,
      en: `<strong>Model assumptions — honestly, limits included:</strong> it assumes all
        investors share the same expectations and can borrow/lend at the same risk-free rate,
        that markets are efficient and frictionless (no transaction costs or taxes), and that
        the market is the <em>only</em> relevant risk factor. In practice beta shifts over time
        (Step 7), and multi-factor models (e.g. Fama-French, which adds size and value) explain
        observed returns better. CAPM remains the starting point — the "one-factor model"
        every other model builds on.`,
    },

    "paso5.badge": { es: "PASO 5", en: "STEP 5" },
    "paso5.title": { es: "Resultados: beta, alfa y R²", en: "Results: beta, alpha, and R²" },
    "paso5.p": {
      es: `Con los datos del activo y benchmark elegidos, así quedan los tres números clave del
        CAPM, más la descomposición del riesgo total en sistemático e idiosincrático.`,
      en: `With the chosen asset and benchmark data, here are CAPM's three key numbers, plus
        the split of total risk into systematic and idiosyncratic.`,
    },
    "paso5.interpretation": {
      es: "Interpretación",
      en: "Interpretation",
    },

    "paso6.badge": { es: "PASO 6", en: "STEP 6" },
    "paso6.title": { es: "La Security Market Line", en: "The Security Market Line" },
    "paso6.p": {
      es: `La <strong>Security Market Line (SML)</strong> es la línea recta que traza el CAPM: para
        cada nivel de beta, el retorno que "debería" tener un activo. Agrega varios activos abajo
        para verlos ubicados frente a esa línea — por <strong>encima</strong> de la línea (alfa
        positivo, en <span style="color:var(--accent)">azul</span>) o por
        <strong>debajo</strong> (alfa negativo, en <span style="color:var(--accent3)">rojo</span>).`,
      en: `The <strong>Security Market Line (SML)</strong> is the straight line CAPM draws: for
        each beta level, the return an asset "should" have. Add several assets below to see
        where they land relative to that line — <strong>above</strong> it (positive alpha, in
        <span style="color:var(--accent)">blue</span>) or <strong>below</strong> it (negative
        alpha, in <span style="color:var(--accent3)">red</span>).`,
    },
    "paso6.assetsLabel": { es: "Activos a comparar (uno a la vez — Enter para agregar)", en: "Assets to compare (one at a time — Enter to add)" },
    "paso6.updateBtn": { es: "Actualizar SML", en: "Update SML" },
    "paso6.loading": { es: "Calculando…", en: "Computing…" },

    "paso7.badge": { es: "PASO 7", en: "STEP 7" },
    "paso7.title": { es: "Beta móvil: ¿es beta constante?", en: "Rolling beta: is beta constant?" },
    "paso7.p": {
      es: `Todo lo anterior asume un beta fijo para todo el histórico. En la práctica no lo es:
        recalculando beta sobre una <strong>ventana móvil de 252 días</strong> (un año de
        operación) y desplazándola día a día, se ve cómo cambia con el tiempo — a veces por
        cambios reales en el negocio, a veces por régimen de mercado (ej. betas que suben en
        crisis, cuando "todo cae junto").`,
      en: `Everything above assumes a fixed beta for the whole history. In practice it isn't
        one: recomputing beta over a <strong>252-day rolling window</strong> (one trading year)
        and sliding it forward day by day shows how it shifts over time — sometimes from real
        changes in the business, sometimes from market regime (e.g. betas that rise in crises,
        when "everything falls together").`,
    },

    "limits.badge": { es: "LÍMITES", en: "LIMITS" },
    "limits.title": { es: "Limitaciones y para seguir leyendo", en: "Limitations and further reading" },
    "limits.callout": {
      es: `Este sitio es material educativo, no asesoría financiera. Los datos vienen de Yahoo
        Finance (fuente gratuita, sin garantía de exactitud y con posibles huecos). Beta y alfa
        se estiman sobre un histórico fijo — ambos cambian según el período y el benchmark
        elegidos (pruébalo tú mismo en el Paso 7). Un alfa histórico positivo no garantiza que
        se repita: es una medida retrospectiva, no una predicción.`,
      en: `This site is educational material, not financial advice. Data comes from Yahoo
        Finance (a free source, with no accuracy guarantee and possible gaps). Beta and alpha
        are estimated over a fixed history — both change depending on the period and benchmark
        chosen (try it yourself in Step 7). A positive historical alpha is no guarantee it
        repeats: it's a backward-looking measure, not a prediction.`,
    },
    "limits.reading": {
      es: `Para profundizar: William Sharpe, <em>"Capital Asset Prices"</em>, Journal of Finance
        (1964) — el paper original del CAPM; Eugene Fama y Kenneth French, el modelo de tres (y
        luego cinco) factores que lo extiende; y el propio <a href="https://markowitz-portfolio-lab.vercel.app" target="_blank" rel="noopener">Markowitz Portfolio Lab</a>, la base de media-varianza sobre la que se construye el CAPM.`,
      en: `To go deeper: William Sharpe, <em>"Capital Asset Prices"</em>, Journal of Finance
        (1964) — the original CAPM paper; Eugene Fama and Kenneth French's three- (later
        five-) factor model, which extends it; and <a href="https://markowitz-portfolio-lab.vercel.app" target="_blank" rel="noopener">Markowitz Portfolio Lab</a> itself, the
        mean-variance foundation CAPM is built on.`,
    },

    "creator.badge": { es: "CREADOR", en: "CREATOR" },
    "creator.title": { es: "Sobre el creador", en: "About the creator" },
    "creator.text": { es: "Hecho por Andrés Londoño.", en: "Made by Andrés Londoño." },

    "footer.text": {
      es: "CAPM Beta-Alpha Lab — proyecto educativo independiente, segundo de la serie junto a Markowitz Portfolio Lab. Datos: Yahoo Finance. Cómputo: 100% en el navegador (JavaScript).",
      en: "CAPM Beta-Alpha Lab — an independent educational project, second in the series alongside Markowitz Portfolio Lab. Data: Yahoo Finance. Computation: 100% in the browser (JavaScript).",
    },

    // --- Generado por JS ---
    "app.removeTicker": { es: "Quitar {ticker}", en: "Remove {ticker}" },
    "app.maxTickersError": { es: "Máximo {n} activos en la SML.", en: "Maximum {n} assets in the SML." },
    "app.needOneTicker": { es: "Agrega al menos 1 activo para comparar.", en: "Add at least 1 asset to compare." },
    "app.downloading": { es: "Descargando precios de {asset} y {benchmark}…", en: "Downloading prices for {asset} and {benchmark}…" },
    "app.priceFetchError": { es: "Error al consultar precios", en: "Error fetching prices" },
    "app.notEnoughValid": { es: "No se pudieron obtener datos de {asset} o {benchmark}. ", en: "Could not get data for {asset} or {benchmark}. " },
    "app.tooFewDates": { es: "Muy pocas fechas en común entre el activo y el benchmark.", en: "Too few overlapping dates between the asset and the benchmark." },
    "app.needMoreForRolling": { es: "Se necesita más de un año de histórico para calcular beta móvil.", en: "More than one year of history is needed to compute rolling beta." },
    "app.ready": {
      es: "Listo — {asset} vs {benchmark}, {n} observaciones diarias ({d1} → {d2}).",
      en: "Ready — {asset} vs {benchmark}, {n} daily observations ({d1} → {d2}).",
    },
    "app.unexpectedError": { es: "Error inesperado.", en: "Unexpected error." },
    "app.statBeta": { es: "Beta (β)", en: "Beta (β)" },
    "app.statAlpha": { es: "Alfa anual (Jensen)", en: "Annual alpha (Jensen)" },
    "app.statR2": { es: "R²", en: "R²" },
    "app.statAssetReturn": { es: "Retorno anual del activo", en: "Asset annual return" },
    "app.statMarketReturn": { es: "Retorno anual del benchmark", en: "Benchmark annual return" },
    "app.statSystematic": { es: "Vol. sistemática", en: "Systematic vol." },
    "app.statIdiosyncratic": { es: "Vol. idiosincrática", en: "Idiosyncratic vol." },
    "app.interpAggressive": {
      es: "Con β = {beta}, {asset} es más volátil que el mercado — amplifica tanto las subidas como las bajadas de {benchmark}.",
      en: "With β = {beta}, {asset} is more volatile than the market — it amplifies both {benchmark}'s rallies and its drops.",
    },
    "app.interpDefensive": {
      es: "Con β = {beta}, {asset} es menos volátil que el mercado — se mueve menos que {benchmark}, tanto en subidas como en bajadas.",
      en: "With β = {beta}, {asset} is less volatile than the market — it moves less than {benchmark}, both up and down.",
    },
    "app.interpNeutral": {
      es: "Con β ≈ {beta}, {asset} se mueve prácticamente en línea con el mercado.",
      en: "With β ≈ {beta}, {asset} moves almost in line with the market.",
    },
    "app.interpAlphaPositive": {
      es: " Su alfa histórico es positivo ({alpha}): en este período rindió más de lo que su riesgo sistemático por sí solo explicaría.",
      en: " Its historical alpha is positive ({alpha}): over this period it returned more than its systematic risk alone would explain.",
    },
    "app.interpAlphaNegative": {
      es: " Su alfa histórico es negativo ({alpha}): en este período rindió menos de lo que su riesgo sistemático por sí solo explicaría.",
      en: " Its historical alpha is negative ({alpha}): over this period it returned less than its systematic risk alone would explain.",
    },
    "app.interpR2": {
      es: " El mercado explica el {r2} de la varianza de {asset} (R²) — el resto es riesgo específico del activo.",
      en: " The market explains {r2} of {asset}'s variance (R²) — the rest is asset-specific risk.",
    },

    // --- Gráficas (plots.js) ---
    "charts.priceYAxis": { es: "Precio normalizado (base 100)", en: "Normalized price (base 100)" },
    "charts.dailyReturns": { es: "Retornos diarios: {asset} vs {market}", en: "Daily returns: {asset} vs {market}" },
    "charts.fittedLine": { es: "Recta ajustada (β = pendiente)", en: "Fitted line (β = slope)" },
    "charts.marketReturnAxis": { es: "Retorno diario de {market} (%)", en: "{market} daily return (%)" },
    "charts.assetReturnAxis": { es: "Retorno diario de {asset} (%)", en: "{asset} daily return (%)" },
    "charts.smlLine": { es: "Security Market Line (teórica)", en: "Security Market Line (theoretical)" },
    "charts.assets": { es: "Activos", en: "Assets" },
    "charts.market": { es: "Mercado (benchmark)", en: "Market (benchmark)" },
    "charts.betaAxis": { es: "Beta (β)", en: "Beta (β)" },
    "charts.returnAxisAnnual": { es: "Retorno esperado anualizado (%)", en: "Annualized expected return (%)" },
    "charts.rollingBeta": { es: "Beta móvil (ventana de 252 días)", en: "Rolling beta (252-day window)" },
    "charts.marketBetaRef": { es: "Beta del mercado (β=1)", en: "Market beta (β=1)" },
    "charts.fullPeriodBeta": { es: "Beta del período completo", en: "Full-period beta" },
  };

  let locale = (localStorage.getItem(STORAGE_KEY) === "en") ? "en" : "es";

  function t(key, vars) {
    const entry = dict[key];
    let str = entry ? entry[locale] || entry.es : key;
    if (vars) {
      Object.keys(vars).forEach((k) => {
        str = str.replaceAll(`{${k}}`, vars[k]);
      });
    }
    return str;
  }

  function getLocale() {
    return locale;
  }

  function setLocale(newLocale) {
    locale = newLocale === "en" ? "en" : "es";
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
    applyStaticTranslations();
  }

  function applyStaticTranslations() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      el.innerHTML = t(key);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.placeholder = t(el.getAttribute("data-i18n-placeholder"));
    });
  }

  return { t, getLocale, setLocale, applyStaticTranslations };
})();
