const Minio = require('minio');
const { Client: PgClient } = require('pg');

const minioClient = new Minio.Client({
  endPoint: 'minio',
  port: 9000,
  useSSL: false,
  accessKey: 'miniouser',
  secretKey: 'miniopassword'
});

const pgClient = new PgClient({
  host: 'postgres',
  port: 5432,
  user: 'postgres',
  password: process.env.DB_PASSWORD || '123456',
  database: 'fooddie_db'
});

const LAST_THREE = [
  {
    name: 'Bánh mì chảo đặc biệt',
    slug: 'banh-mi-chao.jpg',
    url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800'
  },
  {
    name: 'Cơm gà Hải Nam Hội An',
    slug: 'com-ga-hoi-an.jpg',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/71/Hainanese_Chicken_Rice.jpg/960px-Hainanese_Chicken_Rice.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail'
  },
  {
    name: 'Gỏi ngó sen tôm thịt',
    slug: 'goi-ngo-sen.jpg',
    url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800'
  }
];

async function run() {
  await pgClient.connect();
  for (const item of LAST_THREE) {
    console.log('Fetching', item.name, '...');
    const res = await fetch(item.url, { headers: { 'User-Agent': 'FoodeeSeederBot/1.0 (contact: dev@foodee.vn)' } });
    if (!res.ok) throw new Error('Fetch failed: ' + res.status);
    const buffer = Buffer.from(await res.arrayBuffer());
    const objectName = 'food-images/' + item.slug;
    const minioUrl = 'http://localhost:9000/foodee/' + objectName;

    await minioClient.putObject('foodee', objectName, buffer, { 'Content-Type': 'image/jpeg' });
    await pgClient.query('UPDATE foods SET image = $1, image_urls = $2, updated_at = NOW() WHERE name = $3', [minioUrl, minioUrl, item.name]);
    console.log('SUCCESS:', item.name, '->', minioUrl, '(', buffer.length, 'bytes)');
  }
  await pgClient.end();
}
run().catch(console.error);
