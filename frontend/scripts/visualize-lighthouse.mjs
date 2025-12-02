#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lade Lighthouse Report (prüfe zuerst Production, dann Dev)
const productionReportPath = path.join(__dirname, '..', 'lighthouse-report-production.json');
const devReportPath = path.join(__dirname, '..', 'lighthouse-report.json');

let reportPath = productionReportPath;
if (!fs.existsSync(productionReportPath)) {
  reportPath = devReportPath;
  console.log('⚠️  Production Report nicht gefunden, verwende Dev Report');
} else {
  console.log('✅ Verwende Production Build Report');
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

// Extrahiere Metriken - verwende direkte Audits falls metrics nicht verfügbar
const metrics = report.audits.metrics?.details?.items?.[0] || {};
const categories = report.categories || {};

// Performance Scores
const performanceScore = Math.round((categories.performance?.score || 0) * 100);
const accessibilityScore = Math.round((categories.accessibility?.score || 0) * 100);
const bestPracticesScore = Math.round((categories['best-practices']?.score || 0) * 100);
const seoScore = Math.round((categories.seo?.score || 0) * 100);

// Core Web Vitals - verwende direkte Audits als Fallback
const lcpAudit = report.audits['largest-contentful-paint'];
const fidAudit = report.audits['max-potential-fid'];
const clsAudit = report.audits['cumulative-layout-shift'];
const fcpAudit = report.audits['first-contentful-paint'];
const ttiAudit = report.audits['interactive'];
const tbtAudit = report.audits['total-blocking-time'];
const siAudit = report.audits['speed-index'];
const ttfbAudit = report.audits['server-response-time'];

// Core Web Vitals - verwende Audit-Werte als Fallback
const lcp = Math.round(metrics.largestContentfulPaint || lcpAudit?.numericValue || 0);
const fid = Math.round(metrics.maxPotentialFID || fidAudit?.numericValue || 0);
const cls = metrics.cumulativeLayoutShift || clsAudit?.numericValue || 0;

// Weitere Metriken - verwende Audit-Werte als Fallback
const fcp = Math.round(metrics.firstContentfulPaint || fcpAudit?.numericValue || 0);
const tti = Math.round(metrics.interactive || ttiAudit?.numericValue || 0);
const tbt = Math.round(metrics.totalBlockingTime || tbtAudit?.numericValue || 0);
const si = Math.round(metrics.speedIndex || siAudit?.numericValue || 0);
const ttfb = Math.round(metrics.timeToFirstByte || ttfbAudit?.numericValue || 0);

// Bewertungsfunktion
function getScoreColor(score) {
  if (score >= 90) return '#0cce6b'; // Grün
  if (score >= 50) return '#ffa400'; // Orange
  return '#ff4e42'; // Rot
}

function getMetricStatus(value, thresholds) {
  const { good, needsImprovement } = thresholds;
  if (value <= good) return { status: 'good', color: '#0cce6b' };
  if (value <= needsImprovement) return { status: 'needs-improvement', color: '#ffa400' };
  return { status: 'poor', color: '#ff4e42' };
}

// HTML Template
const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lighthouse Metriken - RentACar</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      min-height: 100vh;
    }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    
    h1 {
      color: white;
      text-align: center;
      margin-bottom: 30px;
      font-size: 2.5em;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }
    
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .card {
      background: white;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      transition: transform 0.3s ease;
    }
    
    .card:hover {
      transform: translateY(-5px);
    }
    
    .card h2 {
      color: #333;
      margin-bottom: 15px;
      font-size: 1.5em;
      border-bottom: 2px solid #eee;
      padding-bottom: 10px;
    }
    
    .score-circle {
      width: 120px;
      height: 120px;
      margin: 20px auto;
      position: relative;
    }
    
    .score-value {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 2.5em;
      font-weight: bold;
    }
    
    .metric-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      margin: 8px 0;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid;
    }
    
    .metric-label {
      font-weight: 600;
      color: #555;
    }
    
    .metric-value {
      font-size: 1.2em;
      font-weight: bold;
    }
    
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.85em;
      font-weight: 600;
      margin-left: 10px;
    }
    
    .status-good {
      background: #0cce6b;
      color: white;
    }
    
    .status-needs-improvement {
      background: #ffa400;
      color: white;
    }
    
    .status-poor {
      background: #ff4e42;
      color: white;
    }
    
    .chart-container {
      position: relative;
      height: 300px;
      margin-top: 20px;
    }
    
    .info-box {
      background: #e3f2fd;
      border-left: 4px solid #2196f3;
      padding: 15px;
      margin: 15px 0;
      border-radius: 4px;
    }
    
    .info-box h3 {
      color: #1976d2;
      margin-bottom: 8px;
    }
    
    .info-box p {
      color: #555;
      line-height: 1.6;
    }
    
    .timestamp {
      text-align: center;
      color: white;
      margin-top: 30px;
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚗 RentACar - Lighthouse Metriken</h1>
    
    <!-- Performance Scores -->
    <div class="grid">
      <div class="card">
        <h2>Performance</h2>
        <div class="score-circle">
          <canvas id="performanceChart"></canvas>
          <div class="score-value" style="color: ${getScoreColor(performanceScore)}">${performanceScore}</div>
        </div>
      </div>
      
      <div class="card">
        <h2>Accessibility</h2>
        <div class="score-circle">
          <canvas id="accessibilityChart"></canvas>
          <div class="score-value" style="color: ${getScoreColor(accessibilityScore)}">${accessibilityScore}</div>
        </div>
      </div>
      
      <div class="card">
        <h2>Best Practices</h2>
        <div class="score-circle">
          <canvas id="bestPracticesChart"></canvas>
          <div class="score-value" style="color: ${getScoreColor(bestPracticesScore)}">${bestPracticesScore}</div>
        </div>
      </div>
      
      <div class="card">
        <h2>SEO</h2>
        <div class="score-circle">
          <canvas id="seoChart"></canvas>
          <div class="score-value" style="color: ${getScoreColor(seoScore)}">${seoScore}</div>
        </div>
      </div>
    </div>
    
    <!-- Core Web Vitals -->
    <div class="card" style="margin-bottom: 20px;">
      <h2>Core Web Vitals</h2>
      <div class="info-box">
        <h3>Was sind Core Web Vitals?</h3>
        <p>Core Web Vitals sind die wichtigsten Metriken für die Benutzererfahrung. Sie werden von Google für das Ranking verwendet.</p>
      </div>
      
      <div class="metric-item" style="border-left-color: ${getMetricStatus(lcp, { good: 2500, needsImprovement: 4000 }).color}">
        <div>
          <span class="metric-label">LCP (Largest Contentful Paint)</span>
          <span class="status-badge status-${getMetricStatus(lcp, { good: 2500, needsImprovement: 4000 }).status}">
            ${lcp <= 2500 ? 'Gut' : lcp <= 4000 ? 'Verbesserung nötig' : 'Schlecht'}
          </span>
        </div>
        <span class="metric-value" style="color: ${getMetricStatus(lcp, { good: 2500, needsImprovement: 4000 }).color}">
          ${(lcp / 1000).toFixed(2)}s
        </span>
      </div>
      
      <div class="metric-item" style="border-left-color: ${getMetricStatus(fid, { good: 100, needsImprovement: 300 }).color}">
        <div>
          <span class="metric-label">FID (First Input Delay)</span>
          <span class="status-badge status-${getMetricStatus(fid, { good: 100, needsImprovement: 300 }).status}">
            ${fid <= 100 ? 'Gut' : fid <= 300 ? 'Verbesserung nötig' : 'Schlecht'}
          </span>
        </div>
        <span class="metric-value" style="color: ${getMetricStatus(fid, { good: 100, needsImprovement: 300 }).color}">
          ${fid}ms
        </span>
      </div>
      
      <div class="metric-item" style="border-left-color: ${getMetricStatus(cls, { good: 0.1, needsImprovement: 0.25 }).color}">
        <div>
          <span class="metric-label">CLS (Cumulative Layout Shift)</span>
          <span class="status-badge status-${getMetricStatus(cls, { good: 0.1, needsImprovement: 0.25 }).status}">
            ${cls <= 0.1 ? 'Gut' : cls <= 0.25 ? 'Verbesserung nötig' : 'Schlecht'}
          </span>
        </div>
        <span class="metric-value" style="color: ${getMetricStatus(cls, { good: 0.1, needsImprovement: 0.25 }).color}">
          ${cls.toFixed(3)}
        </span>
      </div>
    </div>
    
    <!-- Performance Metriken -->
    <div class="card" style="margin-bottom: 20px;">
      <h2>Performance Metriken</h2>
      <div class="chart-container">
        <canvas id="performanceMetricsChart"></canvas>
      </div>
    </div>
    
    <!-- Detaillierte Metriken -->
    <div class="grid">
      <div class="card">
        <h2>Ladezeiten</h2>
        <div class="metric-item">
          <span class="metric-label">First Contentful Paint (FCP)</span>
          <span class="metric-value">${(fcp / 1000).toFixed(2)}s</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">Largest Contentful Paint (LCP)</span>
          <span class="metric-value">${(lcp / 1000).toFixed(2)}s</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">Time to Interactive (TTI)</span>
          <span class="metric-value">${(tti / 1000).toFixed(2)}s</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">Time to First Byte (TTFB)</span>
          <span class="metric-value">${(ttfb / 1000).toFixed(2)}s</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">Speed Index</span>
          <span class="metric-value">${(si / 1000).toFixed(2)}s</span>
        </div>
      </div>
      
      <div class="card">
        <h2>Interaktivität</h2>
        <div class="metric-item">
          <span class="metric-label">Total Blocking Time (TBT)</span>
          <span class="metric-value">${tbt}ms</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">First Input Delay (FID)</span>
          <span class="metric-value">${fid}ms</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">Cumulative Layout Shift (CLS)</span>
          <span class="metric-value">${cls.toFixed(3)}</span>
        </div>
      </div>
    </div>
    
    <div class="timestamp">
      <p>Report erstellt: ${new Date(report.fetchTime).toLocaleString('de-DE')}</p>
      <p>Lighthouse Version: ${report.lighthouseVersion}</p>
    </div>
  </div>
  
  <script>
    // Chart.js Konfiguration
    Chart.defaults.font.family = "'Segoe UI', Roboto, sans-serif";
    Chart.defaults.font.size = 12;
    
    // Score Circle Charts
    function createScoreChart(canvasId, score, color) {
      const ctx = document.getElementById(canvasId).getContext('2d');
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          datasets: [{
            data: [score, 100 - score],
            backgroundColor: [color, '#e0e0e0'],
            borderWidth: 0
          }]
        },
        options: {
          cutout: '75%',
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
          },
          maintainAspectRatio: false
        }
      });
    }
    
    // Performance Metriken Chart
    const perfCtx = document.getElementById('performanceMetricsChart').getContext('2d');
    new Chart(perfCtx, {
      type: 'bar',
      data: {
        labels: ['FCP', 'LCP', 'TTI', 'TTFB', 'SI', 'TBT', 'FID'],
        datasets: [{
          label: 'Zeit (ms)',
          data: [${fcp}, ${lcp}, ${tti}, ${ttfb}, ${si}, ${tbt}, ${fid}],
          backgroundColor: [
            ${fcp <= 1800 ? "'#0cce6b'" : fcp <= 3000 ? "'#ffa400'" : "'#ff4e42'"},
            ${lcp <= 2500 ? "'#0cce6b'" : lcp <= 4000 ? "'#ffa400'" : "'#ff4e42'"},
            ${tti <= 3800 ? "'#0cce6b'" : tti <= 7300 ? "'#ffa400'" : "'#ff4e42'"},
            ${ttfb <= 800 ? "'#0cce6b'" : ttfb <= 1800 ? "'#ffa400'" : "'#ff4e42'"},
            ${si <= 3400 ? "'#0cce6b'" : si <= 5800 ? "'#ffa400'" : "'#ff4e42'"},
            ${tbt <= 200 ? "'#0cce6b'" : tbt <= 600 ? "'#ffa400'" : "'#ff4e42'"},
            ${fid <= 100 ? "'#0cce6b'" : fid <= 300 ? "'#ffa400'" : "'#ff4e42'"}
          ],
          borderColor: '#fff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Performance Metriken im Vergleich',
            font: { size: 16, weight: 'bold' }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Zeit (Millisekunden)'
            }
          }
        }
      }
    });
    
    // Erstelle Score Charts
    createScoreChart('performanceChart', ${performanceScore}, '${getScoreColor(performanceScore)}');
    createScoreChart('accessibilityChart', ${accessibilityScore}, '${getScoreColor(accessibilityScore)}');
    createScoreChart('bestPracticesChart', ${bestPracticesScore}, '${getScoreColor(bestPracticesScore)}');
    createScoreChart('seoChart', ${seoScore}, '${getScoreColor(seoScore)}');
  </script>
</body>
</html>`;

// Speichere HTML
const outputPath = path.join(__dirname, '..', 'lighthouse-metrics.html');
fs.writeFileSync(outputPath, html, 'utf-8');

console.log('✅ Lighthouse Metriken visualisiert!');
console.log(`📊 HTML Report erstellt: ${outputPath}`);
console.log(`\nÖffne die Datei im Browser:`);
console.log(`   open ${outputPath}`);


import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lade Lighthouse Report (prüfe zuerst Production, dann Dev)
const productionReportPath = path.join(__dirname, '..', 'lighthouse-report-production.json');
const devReportPath = path.join(__dirname, '..', 'lighthouse-report.json');

let reportPath = productionReportPath;
if (!fs.existsSync(productionReportPath)) {
  reportPath = devReportPath;
  console.log('⚠️  Production Report nicht gefunden, verwende Dev Report');
} else {
  console.log('✅ Verwende Production Build Report');
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

// Extrahiere Metriken - verwende direkte Audits falls metrics nicht verfügbar
const metrics = report.audits.metrics?.details?.items?.[0] || {};
const categories = report.categories || {};

// Performance Scores
const performanceScore = Math.round((categories.performance?.score || 0) * 100);
const accessibilityScore = Math.round((categories.accessibility?.score || 0) * 100);
const bestPracticesScore = Math.round((categories['best-practices']?.score || 0) * 100);
const seoScore = Math.round((categories.seo?.score || 0) * 100);

// Core Web Vitals - verwende direkte Audits als Fallback
const lcpAudit = report.audits['largest-contentful-paint'];
const fidAudit = report.audits['max-potential-fid'];
const clsAudit = report.audits['cumulative-layout-shift'];
const fcpAudit = report.audits['first-contentful-paint'];
const ttiAudit = report.audits['interactive'];
const tbtAudit = report.audits['total-blocking-time'];
const siAudit = report.audits['speed-index'];
const ttfbAudit = report.audits['server-response-time'];

// Core Web Vitals - verwende Audit-Werte als Fallback
const lcp = Math.round(metrics.largestContentfulPaint || lcpAudit?.numericValue || 0);
const fid = Math.round(metrics.maxPotentialFID || fidAudit?.numericValue || 0);
const cls = metrics.cumulativeLayoutShift || clsAudit?.numericValue || 0;

// Weitere Metriken - verwende Audit-Werte als Fallback
const fcp = Math.round(metrics.firstContentfulPaint || fcpAudit?.numericValue || 0);
const tti = Math.round(metrics.interactive || ttiAudit?.numericValue || 0);
const tbt = Math.round(metrics.totalBlockingTime || tbtAudit?.numericValue || 0);
const si = Math.round(metrics.speedIndex || siAudit?.numericValue || 0);
const ttfb = Math.round(metrics.timeToFirstByte || ttfbAudit?.numericValue || 0);

// Bewertungsfunktion
function getScoreColor(score) {
  if (score >= 90) return '#0cce6b'; // Grün
  if (score >= 50) return '#ffa400'; // Orange
  return '#ff4e42'; // Rot
}

function getMetricStatus(value, thresholds) {
  const { good, needsImprovement } = thresholds;
  if (value <= good) return { status: 'good', color: '#0cce6b' };
  if (value <= needsImprovement) return { status: 'needs-improvement', color: '#ffa400' };
  return { status: 'poor', color: '#ff4e42' };
}

// HTML Template
const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lighthouse Metriken - RentACar</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      min-height: 100vh;
    }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    
    h1 {
      color: white;
      text-align: center;
      margin-bottom: 30px;
      font-size: 2.5em;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }
    
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .card {
      background: white;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      transition: transform 0.3s ease;
    }
    
    .card:hover {
      transform: translateY(-5px);
    }
    
    .card h2 {
      color: #333;
      margin-bottom: 15px;
      font-size: 1.5em;
      border-bottom: 2px solid #eee;
      padding-bottom: 10px;
    }
    
    .score-circle {
      width: 120px;
      height: 120px;
      margin: 20px auto;
      position: relative;
    }
    
    .score-value {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 2.5em;
      font-weight: bold;
    }
    
    .metric-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      margin: 8px 0;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid;
    }
    
    .metric-label {
      font-weight: 600;
      color: #555;
    }
    
    .metric-value {
      font-size: 1.2em;
      font-weight: bold;
    }
    
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.85em;
      font-weight: 600;
      margin-left: 10px;
    }
    
    .status-good {
      background: #0cce6b;
      color: white;
    }
    
    .status-needs-improvement {
      background: #ffa400;
      color: white;
    }
    
    .status-poor {
      background: #ff4e42;
      color: white;
    }
    
    .chart-container {
      position: relative;
      height: 300px;
      margin-top: 20px;
    }
    
    .info-box {
      background: #e3f2fd;
      border-left: 4px solid #2196f3;
      padding: 15px;
      margin: 15px 0;
      border-radius: 4px;
    }
    
    .info-box h3 {
      color: #1976d2;
      margin-bottom: 8px;
    }
    
    .info-box p {
      color: #555;
      line-height: 1.6;
    }
    
    .timestamp {
      text-align: center;
      color: white;
      margin-top: 30px;
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚗 RentACar - Lighthouse Metriken</h1>
    
    <!-- Performance Scores -->
    <div class="grid">
      <div class="card">
        <h2>Performance</h2>
        <div class="score-circle">
          <canvas id="performanceChart"></canvas>
          <div class="score-value" style="color: ${getScoreColor(performanceScore)}">${performanceScore}</div>
        </div>
      </div>
      
      <div class="card">
        <h2>Accessibility</h2>
        <div class="score-circle">
          <canvas id="accessibilityChart"></canvas>
          <div class="score-value" style="color: ${getScoreColor(accessibilityScore)}">${accessibilityScore}</div>
        </div>
      </div>
      
      <div class="card">
        <h2>Best Practices</h2>
        <div class="score-circle">
          <canvas id="bestPracticesChart"></canvas>
          <div class="score-value" style="color: ${getScoreColor(bestPracticesScore)}">${bestPracticesScore}</div>
        </div>
      </div>
      
      <div class="card">
        <h2>SEO</h2>
        <div class="score-circle">
          <canvas id="seoChart"></canvas>
          <div class="score-value" style="color: ${getScoreColor(seoScore)}">${seoScore}</div>
        </div>
      </div>
    </div>
    
    <!-- Core Web Vitals -->
    <div class="card" style="margin-bottom: 20px;">
      <h2>Core Web Vitals</h2>
      <div class="info-box">
        <h3>Was sind Core Web Vitals?</h3>
        <p>Core Web Vitals sind die wichtigsten Metriken für die Benutzererfahrung. Sie werden von Google für das Ranking verwendet.</p>
      </div>
      
      <div class="metric-item" style="border-left-color: ${getMetricStatus(lcp, { good: 2500, needsImprovement: 4000 }).color}">
        <div>
          <span class="metric-label">LCP (Largest Contentful Paint)</span>
          <span class="status-badge status-${getMetricStatus(lcp, { good: 2500, needsImprovement: 4000 }).status}">
            ${lcp <= 2500 ? 'Gut' : lcp <= 4000 ? 'Verbesserung nötig' : 'Schlecht'}
          </span>
        </div>
        <span class="metric-value" style="color: ${getMetricStatus(lcp, { good: 2500, needsImprovement: 4000 }).color}">
          ${(lcp / 1000).toFixed(2)}s
        </span>
      </div>
      
      <div class="metric-item" style="border-left-color: ${getMetricStatus(fid, { good: 100, needsImprovement: 300 }).color}">
        <div>
          <span class="metric-label">FID (First Input Delay)</span>
          <span class="status-badge status-${getMetricStatus(fid, { good: 100, needsImprovement: 300 }).status}">
            ${fid <= 100 ? 'Gut' : fid <= 300 ? 'Verbesserung nötig' : 'Schlecht'}
          </span>
        </div>
        <span class="metric-value" style="color: ${getMetricStatus(fid, { good: 100, needsImprovement: 300 }).color}">
          ${fid}ms
        </span>
      </div>
      
      <div class="metric-item" style="border-left-color: ${getMetricStatus(cls, { good: 0.1, needsImprovement: 0.25 }).color}">
        <div>
          <span class="metric-label">CLS (Cumulative Layout Shift)</span>
          <span class="status-badge status-${getMetricStatus(cls, { good: 0.1, needsImprovement: 0.25 }).status}">
            ${cls <= 0.1 ? 'Gut' : cls <= 0.25 ? 'Verbesserung nötig' : 'Schlecht'}
          </span>
        </div>
        <span class="metric-value" style="color: ${getMetricStatus(cls, { good: 0.1, needsImprovement: 0.25 }).color}">
          ${cls.toFixed(3)}
        </span>
      </div>
    </div>
    
    <!-- Performance Metriken -->
    <div class="card" style="margin-bottom: 20px;">
      <h2>Performance Metriken</h2>
      <div class="chart-container">
        <canvas id="performanceMetricsChart"></canvas>
      </div>
    </div>
    
    <!-- Detaillierte Metriken -->
    <div class="grid">
      <div class="card">
        <h2>Ladezeiten</h2>
        <div class="metric-item">
          <span class="metric-label">First Contentful Paint (FCP)</span>
          <span class="metric-value">${(fcp / 1000).toFixed(2)}s</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">Largest Contentful Paint (LCP)</span>
          <span class="metric-value">${(lcp / 1000).toFixed(2)}s</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">Time to Interactive (TTI)</span>
          <span class="metric-value">${(tti / 1000).toFixed(2)}s</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">Time to First Byte (TTFB)</span>
          <span class="metric-value">${(ttfb / 1000).toFixed(2)}s</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">Speed Index</span>
          <span class="metric-value">${(si / 1000).toFixed(2)}s</span>
        </div>
      </div>
      
      <div class="card">
        <h2>Interaktivität</h2>
        <div class="metric-item">
          <span class="metric-label">Total Blocking Time (TBT)</span>
          <span class="metric-value">${tbt}ms</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">First Input Delay (FID)</span>
          <span class="metric-value">${fid}ms</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">Cumulative Layout Shift (CLS)</span>
          <span class="metric-value">${cls.toFixed(3)}</span>
        </div>
      </div>
    </div>
    
    <div class="timestamp">
      <p>Report erstellt: ${new Date(report.fetchTime).toLocaleString('de-DE')}</p>
      <p>Lighthouse Version: ${report.lighthouseVersion}</p>
    </div>
  </div>
  
  <script>
    // Chart.js Konfiguration
    Chart.defaults.font.family = "'Segoe UI', Roboto, sans-serif";
    Chart.defaults.font.size = 12;
    
    // Score Circle Charts
    function createScoreChart(canvasId, score, color) {
      const ctx = document.getElementById(canvasId).getContext('2d');
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          datasets: [{
            data: [score, 100 - score],
            backgroundColor: [color, '#e0e0e0'],
            borderWidth: 0
          }]
        },
        options: {
          cutout: '75%',
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
          },
          maintainAspectRatio: false
        }
      });
    }
    
    // Performance Metriken Chart
    const perfCtx = document.getElementById('performanceMetricsChart').getContext('2d');
    new Chart(perfCtx, {
      type: 'bar',
      data: {
        labels: ['FCP', 'LCP', 'TTI', 'TTFB', 'SI', 'TBT', 'FID'],
        datasets: [{
          label: 'Zeit (ms)',
          data: [${fcp}, ${lcp}, ${tti}, ${ttfb}, ${si}, ${tbt}, ${fid}],
          backgroundColor: [
            ${fcp <= 1800 ? "'#0cce6b'" : fcp <= 3000 ? "'#ffa400'" : "'#ff4e42'"},
            ${lcp <= 2500 ? "'#0cce6b'" : lcp <= 4000 ? "'#ffa400'" : "'#ff4e42'"},
            ${tti <= 3800 ? "'#0cce6b'" : tti <= 7300 ? "'#ffa400'" : "'#ff4e42'"},
            ${ttfb <= 800 ? "'#0cce6b'" : ttfb <= 1800 ? "'#ffa400'" : "'#ff4e42'"},
            ${si <= 3400 ? "'#0cce6b'" : si <= 5800 ? "'#ffa400'" : "'#ff4e42'"},
            ${tbt <= 200 ? "'#0cce6b'" : tbt <= 600 ? "'#ffa400'" : "'#ff4e42'"},
            ${fid <= 100 ? "'#0cce6b'" : fid <= 300 ? "'#ffa400'" : "'#ff4e42'"}
          ],
          borderColor: '#fff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Performance Metriken im Vergleich',
            font: { size: 16, weight: 'bold' }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Zeit (Millisekunden)'
            }
          }
        }
      }
    });
    
    // Erstelle Score Charts
    createScoreChart('performanceChart', ${performanceScore}, '${getScoreColor(performanceScore)}');
    createScoreChart('accessibilityChart', ${accessibilityScore}, '${getScoreColor(accessibilityScore)}');
    createScoreChart('bestPracticesChart', ${bestPracticesScore}, '${getScoreColor(bestPracticesScore)}');
    createScoreChart('seoChart', ${seoScore}, '${getScoreColor(seoScore)}');
  </script>
</body>
</html>`;

// Speichere HTML
const outputPath = path.join(__dirname, '..', 'lighthouse-metrics.html');
fs.writeFileSync(outputPath, html, 'utf-8');

console.log('✅ Lighthouse Metriken visualisiert!');
console.log(`📊 HTML Report erstellt: ${outputPath}`);
console.log(`\nÖffne die Datei im Browser:`);
console.log(`   open ${outputPath}`);

