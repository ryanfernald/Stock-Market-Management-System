#!/usr/bin/node
require('dotenv').config({ path: '../.env' });
const admin = require('firebase-admin');
const mysql = require('mysql2/promise');

// Firebase Admin SDK initialization
const serviceAccount = require('./firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FB_Name,
});

// MySQL Database connection
const db = mysql.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  port: process.env.DATABASE_PORT,
});

async function syncFirebaseUsersWithDB() {
  try {
    let nextPageToken = undefined;
    const firebaseUsers = [];

    do {
      const result = await admin.auth().listUsers(1000, nextPageToken);
      firebaseUsers.push(...result.users);
      nextPageToken = result.pageToken || null;
    } while (nextPageToken);

    console.log(`Fetched ${firebaseUsers.length} users from Firebase Authentication.`);

    for (const user of firebaseUsers) {
      const userId = user.uid; // Firebase UID maps to `user_id`
      const email = user.email || null;
      const firstName = user.displayName?.split(' ')[0] || 'Unknown'; // First part of displayName
      const lastName = user.displayName?.split(' ')[1] || 'Unknown'; // Second part of displayName

      // Check if user exists in the database
      const [rows] = await db.query('SELECT * FROM User WHERE user_id = ?', [userId]);

      if (rows.length === 0) {
        // Insert user into the database if they don't exist
        await db.query(
          'INSERT INTO User (user_id, email, first_name, last_name) VALUES (?, ?, ?, ?)',
          [userId, email, firstName, lastName]
        );
        console.log(`Added user ${userId} (${email}) to the database.`);
      } else {
        console.log(`User ${userId} (${email}) already exists in the database.`);
      }
    }

    console.log('Firebase users synced with the database.');
  } catch (error) {
    console.error('Error syncing users:', error);
  } finally {
    await db.end();
  }
}

syncFirebaseUsersWithDB();