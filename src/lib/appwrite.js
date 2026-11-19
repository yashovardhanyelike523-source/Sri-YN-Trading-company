// Appwrite Client Configuration for SRI YN TRADING COMPANY
import { Client, Databases, Storage, Account, ID, Query } from 'appwrite';

export const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1';
export const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || '6afeeaa3001176191eee';
export const APPWRITE_DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || 'sri_yn_db';
export const APPWRITE_BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID || 'bills';

export const client = new Client();
client
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

export const databases = new Databases(client);
export const storage = new Storage(client);
export const account = new Account(client);
export { ID, Query };

export const APPWRITE_COLLECTIONS = {
  TRANSACTIONS: 'transactions',
  INVENTORY_LOTS: 'inventory_lots',
  COLD_STORAGES: 'cold_storages',
  CUSTOMERS_SUPPLIERS: 'customers_suppliers',
  UPLOADED_BILLS: 'uploaded_bills',
};
