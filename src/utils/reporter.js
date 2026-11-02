/**
 * Report Generator
 * Generates structured JSON and RFC-4180 compliant CSV migration reports.
 */

const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const REPORTS_DIR = path.resolve(__dirname, '../../reports');
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

/**
 * Escapes a cell value for CSV (RFC-4180 standard)
 * @param {any} value 
 * @returns {string}
 */
function escapeCsvCell(value) {
  if (value === null || value === undefined) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

class Reporter {
  /**
   * Generates both JSON and CSV reports from migration results
   * 
   * @param {Object} summaryData 
   * @returns {{ jsonPath: string, csvPath: string }}
   */
  generateReport(summaryData) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const jsonPath = path.join(REPORTS_DIR, `migration-report-${timestamp}.json`);
    const csvPath = path.join(REPORTS_DIR, `migration-report-${timestamp}.csv`);

    // Write JSON Report
    fs.writeFileSync(jsonPath, JSON.stringify(summaryData, null, 2), 'utf8');

    // Generate CSV Rows
    const headers = [
      'Firestore Doc ID',
      'Title',
      'Handle',
      'SKU',
      'Shopify Product ID',
      'Shopify Admin URL',
      'Status',
      'Variants Count',
      'Inventory Assigned',
      'Images Count',
      'Error Message',
      'Processed At'
    ];

    const rows = [headers.map(escapeCsvCell).join(',')];

    for (const item of (summaryData.items || [])) {
      const row = [
        item.firestoreDocId || '',
        item.title || '',
        item.handle || '',
        item.sku || '',
        item.shopifyProductId || '',
        item.shopifyAdminUrl || '',
        item.status || '',
        item.variantsCount || 0,
        item.totalStock || 0,
        item.imagesCount || 0,
        item.error || '',
        new Date().toISOString()
      ];
      rows.push(row.map(escapeCsvCell).join(','));
    }

    fs.writeFileSync(csvPath, rows.join('\r\n'), 'utf8');

    logger.success(`Migration Report generated:\n  - JSON: ${jsonPath}\n  - CSV:  ${csvPath}`);

    return { jsonPath, csvPath };
  }
}

module.exports = new Reporter();
