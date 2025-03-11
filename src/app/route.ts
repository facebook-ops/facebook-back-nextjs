// import sqlite3 from 'sqlite3';
// import { open } from 'sqlite';

// // إنشاء اتصال بقاعدة البيانات
// async function getDb() {
//   return open({
//       filename: './users.db',
//       driver: sqlite3.Database
//   });
// }

// // إنشاء الجدول عند التشغيل
// (async () => {
// const db = await getDb();
// await db.exec(`
//   CREATE TABLE IF NOT EXISTS users (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   username TEXT,
//   password TEXT
//   )
// `);
// })();

// const GET = async () => {
//   return Response.json({message : "Hello GET"})
// }

// const POST = async (request: any) => {
//   console.log('working ...');
    
//   const db = await getDb();
  
//       try {

//         const reqData = await request.json();

//         const { username, password } = reqData;

//         console.log(reqData);
//         if (!username || !password) {
//             return Response.json({ error: 'يجب إدخال جميع الحقول' });
//         }

//         // إدخال البيانات في قاعدة البيانات
//         await db.run(
//             'INSERT INTO users (username, password) VALUES (?, ?)',
//             [username, password]
//         );

//         return Response.json({ message: 'تم التسجيل بنجاح' });
//         } catch (error: any) {
//         if (error.message.includes('SQLITE_CONSTRAINT')) {
//             return Response.json({ error: 'اسم المستخدم موجود مسبقاً' });
//         }
//         console.error('Server error:', error);
//         return Response.json({ error: 'خطأ في الخادم' });
//         }
// }


// export {GET, POST}

// app/api/register/route.ts
import postgres from 'postgres';
import { neon } from '@neondatabase/serverless'

// تكوين اتصال Neon DB
//const sql = postgres(process.env.DATABASE_URL!);
const sql = neon(process.env.DATABASE_URL!);

// إنشاء الجدول (نفذ مرة واحدة فقط)
async function createTable() {
  await sql(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL
    )
  `);
}

// تنفيذ إنشاء الجدول عند التشغيل
createTable();

export async function GET() {
  const rows = await sql("SELECT * FROM users");
  return Response.json({ rows });
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return Response.json(
        { error: 'يجب إدخال جميع الحقول' },
        { status: 400 }
      );
    }
    
    // إدخال البيانات في قاعدة البيانات
    const result = await sql("INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id", [username, password]);

    return Response.json(
      { message: 'تم التسجيل بنجاح', id: result[0].id },
      { status: 201 }
    );
    
  } catch (error: any) {
    if (error.message.includes('unique_violation')) {
      return Response.json(
        { error: 'اسم المستخدم موجود مسبقاً' },
        { status: 409 }
      );
    }
    console.error('Server error:', error);
    return Response.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}