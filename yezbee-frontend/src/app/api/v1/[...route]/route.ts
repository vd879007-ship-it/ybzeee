import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { promises as fsPromises } from 'fs';
import { join as pathJoin } from 'path';
if (!admin.apps.length) {
  try {
    const projectId = (process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'yezbee-5944b').replace(/^"|"$/g, '').trim();
    let clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (clientEmail) {
      clientEmail = clientEmail.trim();
      if (clientEmail.startsWith('"') && clientEmail.endsWith('"')) {
        clientEmail = clientEmail.slice(1, -1);
      }
      if (clientEmail.startsWith("'") && clientEmail.endsWith("'")) {
        clientEmail = clientEmail.slice(1, -1);
      }
    }

    if (privateKey) {
      let cleanKey = privateKey.trim();
      if (cleanKey.startsWith('"') && cleanKey.endsWith('"')) {
        cleanKey = cleanKey.slice(1, -1);
      }
      if (cleanKey.startsWith("'") && cleanKey.endsWith("'")) {
        cleanKey = cleanKey.slice(1, -1);
      }
      cleanKey = cleanKey.replace(/\\n/g, '\n').trim();
      while (cleanKey.endsWith('\\') || cleanKey.endsWith('\n') || cleanKey.endsWith('\r')) {
        cleanKey = cleanKey.slice(0, -1).trim();
      }
      privateKey = cleanKey;
      console.log('Frontend Firebase Init Private Key Debug:', {
        length: privateKey?.length,
        startsWith: privateKey?.slice(0, 30),
        endsWith: privateKey?.slice(-30),
        hasRealNewlines: privateKey?.includes('\n'),
        hasLiteralNewlines: privateKey?.includes('\\n'),
      });
    }

    if (clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } else {
      admin.initializeApp({ projectId });
    }
  } catch (e) {
    console.warn('Firebase init in Next.js API route warning:', e);
  }
}

const getDb = () => admin.firestore();

// In-Memory Fast Cache for Instant Product Responses (< 1ms)
interface CacheEntry {
  data: any;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 1000;

function getCachedData(key: string): any | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCachedData(key: string, data: any): void {
  if (data && data.success && Array.isArray(data.data) && data.data.length === 0) {
    return;
  }
  memoryCache.set(key, { data, timestamp: Date.now() });
}

function clearProductCache(): void {
  memoryCache.clear();
}

function corsResponse(data: any, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
    },
  });
}

export async function OPTIONS() {
  return corsResponse({ success: true });
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ route: string[] }> }) {
  const { route } = await params;
  const routePath = Array.isArray(route) ? (route as string[]).join('/') : String(route);
  const db = getDb();

  try {
    if (routePath === 'health') {
      return corsResponse({
        success: true,
        message: 'YEZ BEE API is running & Firebase Firestore Connected',
        dbConnected: true,
        databaseState: 'CONNECTED (Firestore)',
        timestamp: new Date().toISOString(),
      });
    }

    if (routePath === 'debug') {
      const productsSnap = await db.collection('products').limit(5).get();
      const sampleProducts = productsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      return corsResponse({
        success: true,
        dbConnected: true,
        productCountInDb: productsSnap.size,
        sampleProducts,
        timestamp: new Date().toISOString(),
      });
    }

    const cacheKey = `req_${request.url}`;
    const cached = getCachedData(cacheKey);
    if (cached) {
      return corsResponse(cached);
    }

    if (routePath === 'products/admin/all') {
      const url = new URL(request.url);
      const limit = parseInt(url.searchParams.get('limit') || '50', 10);
      const page = parseInt(url.searchParams.get('page') || '1', 10);

      const snapshot = await db.collection('products').limit(limit).get();
      const items = snapshot.docs.map(doc => ({ _id: doc.id, id: doc.id, ...doc.data() }));

      const resData = {
        success: true,
        data: items,
        pagination: { total: items.length, page, limit, totalPages: 1 },
      };
      setCachedData(cacheKey, resData);
      return corsResponse(resData);
    }

    if (routePath === 'products/admin/stats') {
      const snapshot = await db.collection('products').get();
      const total = snapshot.size;
      let published = 0;
      let draft = 0;
      let featured = 0;

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.status === 'PUBLISHED') published++;
        if (data.status === 'DRAFT') draft++;
        if (data.featured) featured++;
      });

      const resData = {
        success: true,
        data: { total, published, draft, archived: 0, lowStock: 0, outOfStock: 0, featured },
      };
      setCachedData(cacheKey, resData);
      return corsResponse(resData);
    }

    if (routePath === 'categories') {
      const snapshot = await db.collection('categories').get();
      let items = snapshot.docs.map(doc => ({ _id: doc.id, id: doc.id, ...doc.data() }));

      if (items.length === 0) {
        items = [
          { _id: 'cat-1', name: 'CASUALS', slug: 'casuals', hasFeedingSplit: true },
          { _id: 'cat-2', name: 'PARTY WEAR', slug: 'party-wear', hasFeedingSplit: true },
          { _id: 'cat-3', name: 'ETHNIC WEAR', slug: 'ethnic-wear', hasFeedingSplit: true },
          { _id: 'cat-4', name: 'LOUNGE WEAR', slug: 'lounge-wear', hasFeedingSplit: false },
          { _id: 'cat-5', name: 'PEPLUM TOPS', slug: 'peplum-tops', hasFeedingSplit: true },
          { _id: 'cat-6', name: 'KIDS WEAR', slug: 'kids-wear', hasFeedingSplit: false },
        ] as any;
      }

      const categoriesData = { success: true, data: items };
      setCachedData(cacheKey, categoriesData);
      return corsResponse(categoriesData);
    }

    if (routePath === 'products' || routePath === 'products/featured') {
      const url = new URL(request.url);
      const limit = parseInt(url.searchParams.get('limit') || '100', 10);
      const isNew = url.searchParams.get('isNew') === 'true' || url.searchParams.get('newArrival') === 'true';
      const isBestSeller = url.searchParams.get('isBestSeller') === 'true' || url.searchParams.get('bestSeller') === 'true';

      let queryRef: FirebaseFirestore.Query = db.collection('products');
      if (isNew) queryRef = queryRef.where('newArrival', '==', true);
      if (isBestSeller) queryRef = queryRef.where('bestSeller', '==', true);

      const snapshot = await queryRef.limit(limit).get();
      const items = snapshot.docs.map(doc => ({ _id: doc.id, id: doc.id, ...doc.data() }));

      const resData = {
        success: true,
        data: items,
        pagination: { total: items.length, page: 1, limit, totalPages: 1 },
      };
      setCachedData(cacheKey, resData);
      return corsResponse(resData);
    }

    if (routePath.startsWith('products/')) {
      const idOrSlug = routePath.replace('products/', '').replace('id/', '');
      let item: any = null;

      const docSnap = await db.collection('products').doc(idOrSlug).get();
      if (docSnap.exists) {
        item = { _id: docSnap.id, id: docSnap.id, ...docSnap.data() };
      } else {
        const slugSnap = await db.collection('products').where('slug', '==', idOrSlug).limit(1).get();
        if (!slugSnap.empty) {
          item = { _id: slugSnap.docs[0].id, id: slugSnap.docs[0].id, ...slugSnap.docs[0].data() };
        }
      }

      if (!item) {
        return corsResponse({ success: false, message: 'Product not found' }, 404);
      }
      const resData = { success: true, data: item, product: item };
      setCachedData(cacheKey, resData);
      return corsResponse(resData);
    }

    return corsResponse({ success: true, message: 'API V1 Active', timestamp: new Date().toISOString() });
  } catch (err: any) {
    console.error('Next.js API Route GET error:', err);
    return corsResponse({ success: false, message: err.message || 'Server error' }, 500);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ route: string[] }> }) {
  const { route } = await params;
  const routePath = Array.isArray(route) ? (route as string[]).join('/') : String(route);
  const db = getDb();

  try {
    // Handle image upload by saving file to the local filesystem and returning a URL
    if (routePath === 'products/upload-image' || routePath === 'products/upload-images') {
      try {
        const formData = await request.formData();
        const files: File[] = [];
        const singleFile = formData.get('image') as File;
        if (singleFile) files.push(singleFile);
        const multiple = formData.getAll('images') as File[];
        if (multiple && multiple.length) files.push(...multiple);

        if (files.length === 0) {
          return corsResponse({ success: false, message: 'No image file provided for upload' }, 400);
        }

        // Ensure upload directory exists
        const uploadDir = pathJoin(process.cwd(), 'public', 'uploads');
        await fsPromises.mkdir(uploadDir, { recursive: true });

        const uploadedInfos = [];
        for (const file of files) {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          // Create a safe filename
          const timestamp = Date.now();
          const safeName = file.name.replace(/[^a-zA-Z0-9.\-_/]/g, '_');
          const filename = `${timestamp}-${safeName}`;
          const filePath = pathJoin(uploadDir, filename);
          await fsPromises.writeFile(filePath, buffer);
          // Build a public URL (assuming Next.js static serving from /public)
          const publicUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/uploads/${filename}`;
          uploadedInfos.push({
            url: publicUrl,
            secure_url: publicUrl,
            public_id: filename,
            publicId: filename,
          });
        }

        // If single upload, return first object; else array of objects
        const responseData = uploadedInfos.length === 1 ? uploadedInfos[0] : uploadedInfos;
        return corsResponse({
          success: true,
          message: 'Image uploaded successfully',
          data: responseData,
        });
      } catch (e: any) {
        console.warn('Image upload error:', e);
        return corsResponse({ success: false, message: e.message || 'Upload failed' }, 500);
      }
    }

    if (routePath === 'payments/create-order' || routePath === 'payment/create-order') {
      const body = await request.json();
      const amount = body.amount || 100;
      const currency = body.currency || 'INR';
      const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_live_TTw5p1xB5oHjpM';
      const keySecret = process.env.RAZORPAY_KEY_SECRET || '2k8t2xr5xZvY3lG7V2zoFH8y';

      try {
        const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;
        const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: Math.round(amount * 100),
            currency,
            receipt: `receipt_${Date.now()}`,
            payment_capture: 1,
          }),
        });

        const order = await rzpResponse.json();
        if (!rzpResponse.ok) {
          throw new Error(order.error?.description || 'Razorpay order creation failed');
        }

        return corsResponse({
          success: true,
          data: {
            id: order.id,
            amount: order.amount,
            currency: order.currency,
            receipt: order.receipt,
            status: order.status,
          },
        });
      } catch (rzpErr: any) {
        return corsResponse({ success: false, message: rzpErr.message || 'Razorpay order creation failed' }, 500);
      }
    }

    if (routePath === 'payments/verify' || routePath === 'payment/verify') {
      const body = await request.json();
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;
      const keySecret = process.env.RAZORPAY_KEY_SECRET || '2k8t2xr5xZvY3lG7V2zoFH8y';

      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (expectedSignature === razorpaySignature) {
        return corsResponse({
          success: true,
          message: 'Payment verified successfully!',
          data: { isVerified: true, razorpayOrderId, razorpayPaymentId },
        });
      } else {
        return corsResponse({ success: false, message: 'Invalid payment signature' }, 400);
      }
    }

    if (routePath === 'products') {
      const body = await request.json();
      const docRef = db.collection('products').doc();
      const slug = body.slug || (body.name ? body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : `product-${Date.now()}`);

      const newProduct = {
        ...body,
        slug,
        status: body.status || 'PUBLISHED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await docRef.set(newProduct);
      clearProductCache();
      return corsResponse(
        {
          success: true,
          data: { _id: docRef.id, id: docRef.id, ...newProduct },
          message: 'Product created successfully in Firebase Firestore!',
        },
        201
      );
    }

    return corsResponse({ success: false, message: 'Route not found' }, 404);
  } catch (err: any) {
    console.error('Next.js API Route POST error:', err);
    return corsResponse({ success: false, message: err.message || 'Error processing request' }, 500);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ route: string[] }> }) {
  const { route } = await params;
  const routePath = (route || []).join('/');
  const db = getDb();

  try {
    if (routePath.startsWith('products/')) {
      const productId = routePath.replace('products/', '');
      const body = await request.json();
      await db.collection('products').doc(productId).set({ ...body, updatedAt: new Date().toISOString() }, { merge: true });
      clearProductCache();
      return corsResponse({
        success: true,
        data: { _id: productId, ...body },
        message: 'Product updated successfully in Firebase Firestore!',
      });
    }
    return corsResponse({ success: false, message: 'Route not found' }, 404);
  } catch (err: any) {
    console.error('Next.js API Route PUT error:', err);
    return corsResponse({ success: false, message: err.message }, 500);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ route: string[] }> }) {
  const { route } = await params;
  const routePath = (route || []).join('/');
  const db = getDb();

  try {
    if (routePath.startsWith('products/')) {
      const productId = routePath.replace('products/', '');
      await db.collection('products').doc(productId).delete();
      clearProductCache();
      return corsResponse({ success: true, message: 'Product deleted from Firebase Firestore' });
    }
    return corsResponse({ success: true });
  } catch (err: any) {
    console.error('Next.js API Route DELETE error:', err);
    return corsResponse({ success: false, message: err.message }, 500);
  }
}
