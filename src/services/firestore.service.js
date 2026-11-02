/**
 * Firestore Service
 * Read-only interface to Firebase Firestore products collection.
 * Strictly preserves original Firestore data without modifications or deletions.
 */

const { getDb } = require('../config/firebase');
const logger = require('../utils/logger');

const COLLECTION_NAME = 'products';

class FirestoreService {
  /**
   * Fetch all product documents from Firestore
   * @returns {Promise<Array<Object>>} List of products with Firestore doc ID included
   */
  async getAllProducts() {
    try {
      const db = getDb();
      logger.info(`Fetching products from Firestore collection "${COLLECTION_NAME}"...`);
      const snapshot = await db.collection(COLLECTION_NAME).get();

      const products = [];
      snapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data()
        });
      });

      logger.info(`Retrieved ${products.length} products from Firestore.`);
      return products;
    } catch (err) {
      logger.error(`Failed to fetch products from Firestore: ${err.message}`, err);
      throw err;
    }
  }

  /**
   * Fetch a single product by Firestore Document ID
   * @param {string} docId 
   * @returns {Promise<Object|null>}
   */
  async getProductById(docId) {
    try {
      const db = getDb();
      const doc = await db.collection(COLLECTION_NAME).doc(docId).get();
      if (!doc.exists) {
        return null;
      }
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (err) {
      logger.error(`Failed to fetch product ${docId} from Firestore: ${err.message}`, err);
      throw err;
    }
  }

  /**
   * Fetch a single product by slug
   * @param {string} slug 
   * @returns {Promise<Object|null>}
   */
  async getProductBySlug(slug) {
    try {
      const db = getDb();
      const snapshot = await db.collection(COLLECTION_NAME).where('slug', '==', slug).limit(1).get();
      if (snapshot.empty) {
        return null;
      }
      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (err) {
      logger.error(`Failed to fetch product with slug "${slug}" from Firestore: ${err.message}`, err);
      throw err;
    }
  }

  /**
   * Count total products in Firestore
   * @returns {Promise<number>}
   */
  async countProducts() {
    try {
      const db = getDb();
      const res = await db.collection(COLLECTION_NAME).count().get();
      return res.data().count;
    } catch (err) {
      logger.error(`Failed to count products in Firestore: ${err.message}`, err);
      throw err;
    }
  }
}

module.exports = new FirestoreService();
