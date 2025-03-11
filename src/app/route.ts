import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// إنشاء اتصال بقاعدة البيانات
async function getDb() {
  return open({
      filename: './users.db',
      driver: sqlite3.Database
  });
}

// إنشاء الجدول عند التشغيل
(async () => {
const db = await getDb();
await db.exec(`
  CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  password TEXT
  )
`);
})();

const GET = async (req: any) => {
  return Response.json({message : "Hello GET"})
}

const POST = async (request: any) => {
  console.log('working ...');
    
  const db = await getDb();
  
      try {

        const reqData = await request.json();

        const { username, password } = reqData;

        console.log(reqData);
        if (!username || !password) {
            return Response.json({ error: 'يجب إدخال جميع الحقول' });
        }

        // إدخال البيانات في قاعدة البيانات
        await db.run(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, password]
        );

        return Response.json({ message: 'تم التسجيل بنجاح' });
        } catch (error: any) {
        if (error.message.includes('SQLITE_CONSTRAINT')) {
            return Response.json({ error: 'اسم المستخدم موجود مسبقاً' });
        }
        console.error('Server error:', error);
        return Response.json({ error: 'خطأ في الخادم' });
        }
}


export {GET, POST}