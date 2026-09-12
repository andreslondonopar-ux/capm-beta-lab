# CAPM Beta-Alpha Lab

Laboratorio educativo interactivo sobre el **modelo CAPM** (Capital Asset Pricing Model): calcula beta, alfa de Jensen y R² en vivo con datos reales de mercado, explicando cada paso desde la regresión hasta la Security Market Line.

🔗 **En vivo:** [capm-beta-lab.vercel.app](https://capm-beta-lab.vercel.app)

## Qué hace

El sitio recorre el modelo CAPM en 7 pasos, con datos reales (no simulados) de Yahoo Finance:

1. **Activos** — elige un activo y un benchmark (ej. AAPL vs. SPY).
2. **Datos** — precios históricos diarios ajustados por dividendos/splits.
3. **Regresión** — beta y alfa vía regresión lineal de retornos en exceso (`Ri - Rf = α + β(Rm - Rf)`), no de retornos crudos.
4. **Teoría** — la fórmula de CAPM explicada con notación matemática (KaTeX).
5. **Resultados** — beta, alfa de Jensen, R², Information Ratio, t-stat de significancia del alfa, y beta ajustada estilo Blume.
6. **Security Market Line** — SML multi-activo, con la línea empírica superpuesta (ilustra el fenómeno de "betting against beta").
7. **Beta móvil** — beta en ventana móvil de 252 días, para ver cómo cambia en el tiempo.

Incluye una sección de límites del modelo (con la crítica de Roll de 1977) y notas metodológicas sobre por qué el alfa se calcula sobre retornos en exceso y no sobre retornos crudos.

## Stack técnico

- **JavaScript vanilla**, sin frameworks — todo el cálculo (regresión, estadística) corre en el navegador.
- **Vercel Serverless Function** (`api/prices.js`) como proxy a Yahoo Finance, para evitar CORS y esconder el user-agent necesario.
- **KaTeX** para renderizar fórmulas.
- **Plotly** para las gráficas (regresión, SML, beta móvil).
- Bilingüe ES/EN (`assets/js/i18n.js`), sin recargar la página.

## Validación de la matemática

Antes de confiar en los cálculos con datos reales, beta/alfa/R² se validaron contra un caso sintético con parámetros conocidos. También se corrigió un bug real detectado durante una auditoría posterior: el alfa se regresionaba sobre retornos crudos en vez de retornos en exceso sobre la tasa libre de riesgo, lo que sesgaba el alfa reportado en `Rf·(1-β)` — confirmado y corregido comparando contra el sesgo esperado analíticamente.

## Correr en local

```bash
npm install -g vercel   # si no lo tienes
vercel dev
```

No requiere variables de entorno ni API keys — `api/prices.js` consulta Yahoo Finance directamente.

## Estructura

```
index.html            # la página, un solo archivo con las 7 secciones
assets/css/site.css    # estilos
assets/js/
  app.js               # orquesta el flujo entre pasos
  capm.js              # regresión, beta, alfa, R², Information Ratio, SML
  plots.js             # gráficas Plotly
  i18n.js              # sistema bilingüe ES/EN
api/prices.js           # función serverless: proxy a Yahoo Finance
```

## Parte de una serie

Este es el segundo de una serie de laboratorios educativos de finanzas cuantitativas, todos con la misma arquitectura (datos reales, matemática vanilla-JS validada antes de publicar, bilingüe):

- [Markowitz Portfolio Lab](https://markowitz-portfolio-lab.vercel.app) — optimización de portafolios media-varianza
- **CAPM Beta-Alpha Lab** (este repo)
- [Black-Scholes / Options Greeks Lab](https://black-scholes-lab.vercel.app) — precio de opciones y los Griegos
- [VaR Dashboard](https://var-risk-lab.vercel.app) — Value at Risk y Expected Shortfall
- [Kelly Criterion Lab](https://kelly-criterion-lab.vercel.app) — position sizing óptimo

## Autor

Andrés Londoño Paredes — estudiante de Finanzas, Universidad Icesi.
