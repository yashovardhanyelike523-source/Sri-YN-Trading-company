# SRI YN TRADING COMPANY
## Wholesale Red Chilli Trading & Cold Storage Management System
### Client Handover Manual • వినియోగదారుని మార్గదర్శిని (User Guide)

---

## 1. Login & Security (లాగిన్ & భద్రత)
* **Website URL:** Your deployed Netlify link (or `http://localhost:5175/`)
* **Default Admin Email:** `admin@sriyntrading.com`
* **Default Password:** `Admin@123456`
* **Security:** All business records, customer balances, and stock are protected. Always click **Logout** on the top right after finishing your day's work.

---

## 2. English / తెలుగు (Bilingual Toggle)
* On the top header, click the **"తెలుగు / English"** button anytime to switch the entire application between Telugu and English with one touch.

---

## 3. How to Use the Modules (వినియోగ పద్ధతి)

### A. Combined Master Sheet (ప్రధాన రిజిస్టర్ - Most Important Feature)
* **What it is:** One central master register that displays every sale, purchase, and payment in one continuous spreadsheet.
* **Auto Sync:** You never need to enter any transaction twice. Whenever a bill is printed or a purchase is recorded, it immediately appears here.
* **Features:** Search by customer name, bill number, or lot; filter by date range; export to Excel/CSV; or click **Print** for an official paper ledger.

### B. New Sale Bill (క్రొత్త అమ్మకం బిల్లు)
1. Click **"New Sale Bill"** on the dashboard.
2. Select or enter the **Customer Name** and Phone.
3. Select the **Chilli Variety** (Teja S17, Byadgi, Guntur Sannam, 334, 273, Fatki).
4. Select the **Cold Storage** and **Lot Number** (the system shows you the exact available stock in KG).
5. Enter **Quantity in KG** and **Rate per KG (₹)**.
   * *The system automatically calculates the Total Amount ($Qty \times Rate$) and Remaining Balance.*
6. Enter the **Paid Amount** and select payment mode (Cash, UPI/PhonePe, Bank Transfer, Cheque).
7. Click **"💾 Save & Print Bill"**:
   * It instantly downloads a professional A4 PDF invoice with company seal & signature lines.
   * Automatically deducts the quantity from the selected lot's stock.
   * Automatically adds the bill to the Combined Master Sheet.

### C. Add Purchase / Stock Intake (సరుకు కొనుగోలు & స్టాక్ పెంపు)
1. Click **"Add Purchase"** on the dashboard.
2. Enter the **Farmer/Supplier Name** and Phone.
3. Choose to either create a **New Lot Number** or add to an **Existing Lot**.
4. Select the **Cold Storage Warehouse**.
5. Enter **Quantity in KG** and **Purchase Rate / KG**.
6. Click **"📥 Save Purchase & Increase Stock"**:
   * Immediately increases warehouse stock.
   * Logs procurement cost to the Master Register.

### D. Inventory & Cold Storage (గోదాములు & మిర్చి నిల్వలు)
* View total stock in both **Kilograms (KG)** and **Quintals (Qtl)** ($100\text{ kg} = 1\text{ Quintal}$).
* Filter stock by individual cold storage facilities.
* Add new cold storages under the **Cold Storage** tab.

### E. Payments & Outstanding Balances (ఖాతాదారుల బాకీలు & చెల్లింపులు)
* Click **"Record Payment"** to log:
  * **Customer Receipt (నగదు స్వీకరణ):** When a customer pays an outstanding balance.
  * **Supplier Payment (రైతుకు చెల్లింపు):** When paying farmers or mandi suppliers.
* Outstanding balances update automatically without duplicate billing.

### F. Mandi Slips & Bill Uploads (కాటా రసీదులు & ఫోటోలు)
* Snap live photos using your mobile camera or upload lorry weighbridge slips, APMC receipts, and chamber deposit slips.

### G. Backup & Handover (సెట్టింగ్స్ & బ్యాకప్)
* Go to **Settings** $\rightarrow$ **"Download JSON Backup"** to save an offline backup of all business data to your computer or phone.

---

## 4. Mobile Installation (మొబైల్ ఫోన్‌లో యాప్‌గా ఇన్‌స్టాల్ చేయడం)
1. Open your live website link on **Google Chrome** on your Android phone.
2. Tap the **3 dots (⋮)** in the top right corner.
3. Tap **"Install app"** (or **"Add to Home Screen"**).
4. The **SRI YN TRADING COMPANY** icon will appear on your phone screen and open in full-screen mode just like a native mobile app!
