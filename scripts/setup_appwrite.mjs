// Automated Appwrite Provisioning Script for SRI YN TRADING COMPANY
import https from 'node:https';

const ENDPOINT = 'https://sgp.cloud.appwrite.io/v1';
const PROJECT_ID = '6afeeaa3001176191eee';
const API_KEY = 'standard_08d89ec03061408db6c5da0822da009e247dd262ed64c11dfbdec4f74c98ee968c266383febf814a88582373bafe8cb5fa424ff1a1c5956373acd8c44b1f42cda86464e402f1de0ee528bb4f74e9dbef894391e81b49d6a7c0ec628e8a0dca33e090e922edfa014f913bd4f9dafd9bf44b4a018ff33fe2d953a7d82577ff3800';

const DATABASE_ID = 'sri_yn_db';
const BUCKET_ID = 'bills';

function apiRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${ENDPOINT}${path}`);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method,
      headers: {
        'X-Appwrite-Project': PROJECT_ID,
        'X-Appwrite-Key': API_KEY,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            resolve({ error: true, status: res.statusCode, data: parsed });
          }
        } catch {
          resolve({ error: true, status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  console.log('🚀 Starting Appwrite Database Provisioning for SRI YN TRADING COMPANY...');

  // 1. Create or verify Database
  console.log('📦 Setting up Database: sri_yn_db...');
  const dbRes = await apiRequest('/databases', 'POST', {
    databaseId: DATABASE_ID,
    name: 'Sri YN Trading Database',
    enabled: true,
  });
  if (dbRes.error && dbRes.status !== 409) {
    console.log('Database creation note:', dbRes.data?.message || dbRes);
  } else {
    console.log('✅ Database sri_yn_db ready!');
  }

  // 2. Permissions to allow client app access
  const publicPermissions = [
    'read("any")',
    'create("any")',
    'update("any")',
    'delete("any")',
  ];

  // 3. Define Collections
  const collections = [
    {
      id: 'transactions',
      name: 'Combined Master Register (Transactions)',
      attributes: [
        { key: 'transaction_id', type: 'string', size: 64, required: true },
        { key: 'date', type: 'string', size: 32, required: true },
        { key: 'type', type: 'string', size: 32, required: true }, // sale, purchase, receipt, payment
        { key: 'party_name', type: 'string', size: 128, required: true },
        { key: 'party_phone', type: 'string', size: 32, required: false, default: '' },
        { key: 'item_name', type: 'string', size: 128, required: false, default: 'Red Chilli (Standard)' },
        { key: 'cold_storage', type: 'string', size: 128, required: false, default: '' },
        { key: 'lot_no', type: 'string', size: 64, required: false, default: '' },
        { key: 'quantity_kg', type: 'float', required: false, default: 0 },
        { key: 'rate_per_kg', type: 'float', required: false, default: 0 },
        { key: 'total_amount', type: 'float', required: false, default: 0 },
        { key: 'paid_amount', type: 'float', required: false, default: 0 },
        { key: 'balance_amount', type: 'float', required: false, default: 0 },
        { key: 'bill_no', type: 'string', size: 64, required: false, default: '' },
        { key: 'payment_mode', type: 'string', size: 32, required: false, default: 'Cash' },
        { key: 'remarks', type: 'string', size: 255, required: false, default: '' },
        { key: 'status', type: 'string', size: 32, required: false, default: 'active' },
      ],
    },
    {
      id: 'inventory_lots',
      name: 'Chilli Inventory Lots',
      attributes: [
        { key: 'lot_no', type: 'string', size: 64, required: true },
        { key: 'cold_storage', type: 'string', size: 128, required: true },
        { key: 'item_name', type: 'string', size: 128, required: true },
        { key: 'current_stock_kg', type: 'float', required: true, default: 0 },
        { key: 'initial_stock_kg', type: 'float', required: false, default: 0 },
        { key: 'purchase_rate', type: 'float', required: false, default: 0 },
        { key: 'remarks', type: 'string', size: 255, required: false, default: '' },
        { key: 'status', type: 'string', size: 32, required: false, default: 'active' },
      ],
    },
    {
      id: 'cold_storages',
      name: 'Cold Storage Warehouses',
      attributes: [
        { key: 'name', type: 'string', size: 128, required: true },
        { key: 'location', type: 'string', size: 255, required: true },
        { key: 'contact_person', type: 'string', size: 128, required: false, default: '' },
        { key: 'phone', type: 'string', size: 32, required: false, default: '' },
        { key: 'capacity_kg', type: 'float', required: false, default: 0 },
        { key: 'remarks', type: 'string', size: 255, required: false, default: '' },
      ],
    },
    {
      id: 'customers_suppliers',
      name: 'Customers & Suppliers Directory',
      attributes: [
        { key: 'name', type: 'string', size: 128, required: true },
        { key: 'type', type: 'string', size: 32, required: true }, // customer, supplier, both
        { key: 'phone', type: 'string', size: 32, required: false, default: '' },
        { key: 'village_city', type: 'string', size: 128, required: false, default: '' },
        { key: 'outstanding_balance', type: 'float', required: false, default: 0 },
      ],
    },
    {
      id: 'uploaded_bills',
      name: 'Uploaded Bills & Mandi Slips',
      attributes: [
        { key: 'bill_no', type: 'string', size: 64, required: false, default: '' },
        { key: 'file_id', type: 'string', size: 128, required: true },
        { key: 'file_name', type: 'string', size: 255, required: true },
        { key: 'file_url', type: 'string', size: 1000, required: true },
        { key: 'file_size', type: 'integer', required: false, default: 0 },
        { key: 'remarks', type: 'string', size: 255, required: false, default: '' },
      ],
    },
  ];

  for (const col of collections) {
    console.log(`\n📋 Creating Collection: ${col.id} (${col.name})...`);
    const cRes = await apiRequest(`/databases/${DATABASE_ID}/collections`, 'POST', {
      collectionId: col.id,
      name: col.name,
      permissions: publicPermissions,
      documentSecurity: false,
      enabled: true,
    });

    if (cRes.error && cRes.status !== 409) {
      console.log(`Note for ${col.id}:`, cRes.data?.message || cRes);
    } else {
      console.log(`✅ Collection ${col.id} initialized.`);
    }

    // Add attributes
    for (const attr of col.attributes) {
      process.stdout.write(`  Adding attribute ${attr.key} (${attr.type})... `);
      let attrRes;
      if (attr.type === 'string') {
        attrRes = await apiRequest(`/databases/${DATABASE_ID}/collections/${col.id}/attributes/string`, 'POST', {
          key: attr.key,
          size: attr.size || 255,
          required: attr.required,
          default: attr.required ? undefined : (attr.default ?? null),
        });
      } else if (attr.type === 'float') {
        attrRes = await apiRequest(`/databases/${DATABASE_ID}/collections/${col.id}/attributes/float`, 'POST', {
          key: attr.key,
          required: attr.required,
          default: attr.required ? undefined : (attr.default ?? null),
          min: -100000000,
          max: 1000000000,
        });
      } else if (attr.type === 'integer') {
        attrRes = await apiRequest(`/databases/${DATABASE_ID}/collections/${col.id}/attributes/integer`, 'POST', {
          key: attr.key,
          required: attr.required,
          default: attr.required ? undefined : (attr.default ?? null),
        });
      }

      if (attrRes.error && attrRes.status !== 409) {
        console.log(`(warning: ${attrRes.data?.message || attrRes.status})`);
      } else {
        console.log('done.');
      }
      // Small pause to allow Appwrite backend schema lock release
      await sleep(400);
    }
  }

  // 4. Create Storage Bucket for Bills
  console.log('\n🗄️ Setting up Storage Bucket: bills...');
  const bucketRes = await apiRequest('/storage/buckets', 'POST', {
    bucketId: BUCKET_ID,
    name: 'Bills & Mandi Slips',
    permissions: publicPermissions,
    fileSecurity: false,
    enabled: true,
    maximumFileSize: 20000000, // 20MB
    allowedFileExtensions: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
    compression: 'gzip',
    encryption: true,
    antivirus: true,
  });

  if (bucketRes.error && bucketRes.status !== 409) {
    console.log('Bucket note:', bucketRes.data?.message || bucketRes);
  } else {
    console.log('✅ Storage Bucket bills ready!');
  }

  console.log('\n🎉 ALL APPWRITE DATABASE COLLECTIONS & BUCKETS SUCCESSFULLY PROVISIONED!');
}

main().catch(console.error);
