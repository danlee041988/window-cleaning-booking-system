/**
 * Lighthouse Testing Script
 * Run a comprehensive Lighthouse audit on the booking form
 */

const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const config = {
  // Use a custom config to focus on our key metrics
  extends: 'lighthouse:default',
  settings: {
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    formFactor: 'desktop',
    throttling: {
      rttMs: 40,
      throughputKbps: 10240,
      cpuSlowdownMultiplier: 1,
    },
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false,
    },
  },
};

const mobileConfig = {
  ...config,
  settings: {
    ...config.settings,
    formFactor: 'mobile',
    throttling: {
      rttMs: 150,
      throughputKbps: 1638.4,
      cpuSlowdownMultiplier: 4,
    },
    screenEmulation: {
      mobile: true,
      width: 360,
      height: 640,
      deviceScaleFactor: 2,
      disabled: false,
    },
  },
};

async function runLighthouse(url, options = {}, config = null) {
  // Launch browser
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    // Run Lighthouse
    const { lhr: result } = await lighthouse(
      url,
      {
        port: new URL(browser.wsEndpoint()).port,
        output: 'json',
        logLevel: 'error',
      },
      config
    );

    return result;
  } finally {
    await browser.close();
  }
}

async function generateReport(results, device) {
  const timestamp = new Date().toISOString().split('T')[0];
  const reportPath = path.join(__dirname, `lighthouse-report-${device}-${timestamp}.json`);
  
  // Save full report
  await fs.writeFile(reportPath, JSON.stringify(results, null, 2));
  
  // Generate summary
  const summary = {
    device,
    timestamp: new Date().toISOString(),
    scores: {
      performance: Math.round(results.categories.performance.score * 100),
      accessibility: Math.round(results.categories.accessibility.score * 100),
      bestPractices: Math.round(results.categories['best-practices'].score * 100),
      seo: Math.round(results.categories.seo.score * 100),
    },
    metrics: {
      firstContentfulPaint: results.audits['first-contentful-paint'].displayValue,
      largestContentfulPaint: results.audits['largest-contentful-paint'].displayValue,
      totalBlockingTime: results.audits['total-blocking-time'].displayValue,
      cumulativeLayoutShift: results.audits['cumulative-layout-shift'].displayValue,
      speedIndex: results.audits['speed-index'].displayValue,
    },
    opportunities: results.audits['performance-budget']?.details?.items || [],
    accessibility_issues: results.categories.accessibility.auditRefs
      .filter(ref => {
        const audit = results.audits[ref.id];
        return audit && audit.score !== null && audit.score < 1;
      })
      .map(ref => ({
        id: ref.id,
        title: results.audits[ref.id].title,
        description: results.audits[ref.id].description,
        score: results.audits[ref.id].score,
      })),
  };
  
  return summary;
}

async function main() {
  console.log('🚀 Starting Lighthouse audit...\n');
  
  const url = process.argv[2] || 'http://localhost:3000';
  console.log(`Testing URL: ${url}\n`);
  
  try {
    // Run desktop audit
    console.log('📱 Running desktop audit...');
    const desktopResults = await runLighthouse(url, {}, config);
    const desktopSummary = await generateReport(desktopResults, 'desktop');
    
    console.log('\n✅ Desktop Results:');
    console.log(`   Performance: ${desktopSummary.scores.performance}/100`);
    console.log(`   Accessibility: ${desktopSummary.scores.accessibility}/100`);
    console.log(`   Best Practices: ${desktopSummary.scores.bestPractices}/100`);
    console.log(`   SEO: ${desktopSummary.scores.seo}/100`);
    
    // Run mobile audit
    console.log('\n📱 Running mobile audit...');
    const mobileResults = await runLighthouse(url, {}, mobileConfig);
    const mobileSummary = await generateReport(mobileResults, 'mobile');
    
    console.log('\n✅ Mobile Results:');
    console.log(`   Performance: ${mobileSummary.scores.performance}/100`);
    console.log(`   Accessibility: ${mobileSummary.scores.accessibility}/100`);
    console.log(`   Best Practices: ${mobileSummary.scores.bestPractices}/100`);
    console.log(`   SEO: ${mobileSummary.scores.seo}/100`);
    
    // Key metrics
    console.log('\n📊 Key Performance Metrics (Mobile):');
    console.log(`   First Contentful Paint: ${mobileSummary.metrics.firstContentfulPaint}`);
    console.log(`   Largest Contentful Paint: ${mobileSummary.metrics.largestContentfulPaint}`);
    console.log(`   Total Blocking Time: ${mobileSummary.metrics.totalBlockingTime}`);
    console.log(`   Cumulative Layout Shift: ${mobileSummary.metrics.cumulativeLayoutShift}`);
    
    // Accessibility issues
    if (mobileSummary.accessibility_issues.length > 0) {
      console.log('\n⚠️  Accessibility Issues to Address:');
      mobileSummary.accessibility_issues.forEach(issue => {
        console.log(`   - ${issue.title} (Score: ${issue.score})`);
      });
    } else {
      console.log('\n✅ No accessibility issues found!');
    }
    
    // Save summary
    const summaryPath = path.join(__dirname, 'lighthouse-summary.json');
    await fs.writeFile(summaryPath, JSON.stringify({
      desktop: desktopSummary,
      mobile: mobileSummary,
    }, null, 2));
    
    console.log(`\n📄 Full reports saved to:`);
    console.log(`   - lighthouse-report-desktop-*.json`);
    console.log(`   - lighthouse-report-mobile-*.json`);
    console.log(`   - lighthouse-summary.json`);
    
  } catch (error) {
    console.error('❌ Error running Lighthouse:', error);
    process.exit(1);
  }
}

// Check if lighthouse is installed
try {
  require.resolve('lighthouse');
  require.resolve('puppeteer');
} catch (e) {
  console.log('📦 Installing required dependencies...\n');
  console.log('Run: npm install --save-dev lighthouse puppeteer\n');
  process.exit(1);
}

main();