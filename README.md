# YEZ BEE – Firebase & Cloudinary to Shopify Migration System

A production-grade, fault-tolerant Node.js migration system designed to migrate the complete YEZ BEE fashion e-commerce product catalog from **Firebase Firestore** (`africa-south1`) and **Cloudinary** to **Shopify** via the **Shopify Admin GraphQL API**.

---

## 📋 Features

- **Strict SKU Preservation**: Retains the exact same SKU across all variant sizes (e.g., `SBF 038` for sizes M, L, XL, 2XL, 3XL). Never generates synthetic SKUs or appends sizes.
- **Cloudinary Media Migration**: Ingests original Cloudinary images, preserving primary flag (`isPrimary`), custom order, and alt text without altering or deleting Cloudinary assets.
- **Rich Fashion Metafields**: Maps clothing attributes into Shopify storefront metafields (`fabric`, `fit`, `pattern`, `occasion`, `feeding_friendly`, `maternity`, `care_instructions`, `neck_style`, `sleeve_length`, `length`, `gender`, `short_description`, `firestore_id`).
- **Inventory Location Assignment**: Assigns variant inventory quantities to an active Shopify location.
- **Resume & Checkpoint Engine**: Persists migration state to `checkpoint.json` after every single product. Resumes interrupted migrations without creating duplicates.
- **Shopify Leaky-Bucket Rate Limiting**: Adaptive throttling and exponential backoff with full jitter to comply with Shopify API rate limits.
- **Security-First Architecture**: Token sanitization on console and file logs, isolated `.env` loading, and complete `.gitignore` coverage.
- **Comprehensive Reporting**: Generates timestamped JSON and RFC-4180 CSV reports in `reports/`.

---

## 📂 Project Structure

```text
yezbee-shopify-migration/
├── serviceAccountKey.json          # Firebase service account credentials (Ignored by git)
├── .env                            # Shopify & environment credentials (Ignored by git)
├── .env.example                    # Template environment file
├── .gitignore                      # Git exclusion rules
├── package.json                    # Project configuration and npm run scripts
├── test-shopify.js                 # Integration & credential diagnostic utility
├── src/
│   ├── config/
│   │   ├── firebase.js             # Firebase Admin & Firestore initialization (africa-south1)
│   │   └── shopify.js              # Shopify credentials & OAuth token manager
│   ├── services/
│   │   ├── firestore.service.js    # Firestore read-only data service
│   │   ├── shopify.service.js      # Shopify Admin GraphQL client
│   │   └── cloudinary.service.js   # Cloudinary image validation & ordering service
│   ├── migrations/
│   │   ├── product.mapper.js       # Firestore-to-Shopify schema mapper
│   │   ├── product.migration.js    # Single-product migration orchestrator
│   │   └── inventory.migration.js  # Location inventory adjustment service
│   ├── utils/
│   │   ├── logger.js               # Sanitizing logger (console + files)
│   │   ├── retry.js                # Exponential backoff retry handler
│   │   ├── checkpoint.js           # Atomic migration checkpoint manager
│   │   └── reporter.js             # JSON & CSV report generator
│   └── index.js                    # CLI runner for dry-run, test, all, update, report
├── logs/                           # Persistent log output (Ignored by git)
│   ├── migration.log
│   └── error.log
└── reports/                        # JSON & CSV migration reports
    ├── migration-report-*.json
    └── migration-report-*.csv
```

---

## ⚙️ Setup Instructions

### Step 1: Open Terminal in Project Directory

Open **Windows Command Prompt (cmd)** or **PowerShell**:

```cmd
cd C:\Users\dines\Desktop\yezbee-shopify-migration
```

### Step 2: Configure Environment Variables

Open `.env` in your text editor and fill in your Shopify credentials:

```env
# Target Shopify Store Handle (e.g., yezbee-fashion-skmumi5z)
SHOPIFY_SHOP=yezbee-fashion-skmumi5z

# Shopify App Credentials (Client Credentials Grant)
SHOPIFY_CLIENT_ID=your_client_id_here
SHOPIFY_CLIENT_SECRET=your_client_secret_here

# Alternative: Direct Admin API Access Token (Recommended if app is a Custom App)
# SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxx

# Shopify API Version (defaults to 2026-10)
SHOPIFY_API_VERSION=2026-10

# Firebase Service Account Path
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
```

#### How to get Shopify Credentials:

1. **Method A: Custom App in Shopify Admin (Quickest & Most Reliable)**
   - Go to: `https://yezbee-fashion-skmumi5z.myshopify.com/admin`
   - Navigate to **Settings** → **Apps and sales channels** → **Develop apps**.
   - Click **Create an app** (Name: `Yezbee Data Migration`).
   - Under **Configuration** → **Admin API integration**, select:
     - `write_products`, `read_products`
     - `write_inventory`, `read_inventory`
     - `read_locations`
     - `write_files`, `read_files`
   - Click **Install app**.
   - Copy the **Admin API access token** (starts with `shpat_`) and paste into `.env`:
     ```env
     SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_your_token_here
     ```

2. **Method B: Partner Dashboard Dev App (Client Credentials Grant)**
   - If using Client Credentials, ensure the App and Store belong to the **same Shopify Partner Organization**.
   - Add your `SHOPIFY_CLIENT_ID` and `SHOPIFY_CLIENT_SECRET` in `.env`.
   - *Note: If Shopify returns `shop_not_permitted`, follow Method A above.*

---

## 🚀 Execution Commands

Run the commands in this exact order:

### 1. Test Integration & Diagnostics

Validates Firebase connection, tests Shopify authentication, checks API scopes, and lists your store's inventory locations:

```cmd
npm run test:shopify
```

### 2. Deep Catalog Audit

Audits all 63 products, validates 327 variants, resolves handle collisions (e.g. SBF 056 vs SBF 057), verifies 332 Cloudinary image URLs, and checks for cross-product SKU duplicates. **Strictly read-only:**

```cmd
npm run audit
```

### 3. Catalog Dry Run & Preview

Reads all products from Firestore, runs schema transformation, validates SKUs and Cloudinary image URLs, and prints a formatted catalog table. **Does not modify anything in Shopify:**

```cmd
npm run preview
```

### 3. Test Migrate ONE Product

Migrates a single product (`SBF 038`) to Shopify with all variants, Cloudinary images, metafields, and inventory at your chosen location. Validates results and generates a verification report:

```cmd
npm run migrate:test
```

*To test a specific product by slug:*
```cmd
node src/index.js --mode=test-one --slug=sbf-038
```

*To test a specific product by Firestore Document ID:*
```cmd
node src/index.js --mode=test-one --id=2xcewteSVfrzcctS1qeY
```

### 4. Full Catalog Migration

Migrates all remaining products to Shopify sequentially. Automatically skips already migrated products and saves checkpoints after each success:

```cmd
npm run migrate:all
```

*To run without interactive confirmation:*
```cmd
npm run migrate:all -- --yes
```

### 5. Update Existing Products

If you have updated descriptions, prices, or metafields in Firestore and want to sync them to the existing Shopify products:

```cmd
npm run migrate:update
```

### 6. View Migration Status & Generate Report

Displays summary statistics from `checkpoint.json` and exports fresh JSON and CSV reports to `reports/`:

```cmd
npm run report
```

---

## 🔒 Security & Data Integrity Guarantees

1. **Strictly Read-Only on Source**: Does not perform any update, deletion, or modification in Firebase Firestore or Cloudinary.
2. **Secret Redaction**: Any token, API key, or credential is automatically sanitized from console output, `logs/migration.log`, and `logs/error.log`.
3. **Safe Resumption**: In case of network interruption or operator abort (`Ctrl + C`), the migration checkpoint (`checkpoint.json`) guarantees no duplicate products are created upon restart.
4. **SKU Consistency**: All variants of a fashion garment maintain the same SKU as specified in the Firestore product catalog.
#   y b z e e e  
 #   y b z e e e  
 