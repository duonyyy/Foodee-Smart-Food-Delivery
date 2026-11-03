/**
 * Foodee - Pipeline to Seed Authentic Vietnamese Food Images into MinIO (Part 2)
 * Features automatic retry and 1.5s delay to strictly adhere to Wikimedia rate limits.
 */

const Minio = require('minio');
const { Client: PgClient } = require('pg');

const DISHES = [
  {
    name: 'Bánh mì chảo đặc biệt',
    slug: 'banh-mi-chao.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/M%E1%BB%99t_ph%E1%BA%A7n_b%C3%A1nh_m%C3%AC_ch%C3%A1o_v%E1%BB%9Bi_tr%E1%BB%A9ng_v%C3%A0_ch%C3%A3_%2838657217774%29.jpg'
  },
  {
    name: 'Bánh mì que Hải Phòng',
    slug: 'banh-mi-que.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/B%C3%A1nh_m%C3%AC_que.jpg'
  },
  {
    name: 'Bánh mì xíu mại trứng muối',
    slug: 'banh-mi-xiu-mai.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/B%C3%A1nh_m%C3%AC_x%C3%ADu_m%E1%BA%A1i-meatball-sandwich.jpg'
  },
  {
    name: 'Bánh cuốn',
    slug: 'banh-cuon.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Banh_cuon.jpg'
  },
  {
    name: 'Bánh bèo',
    slug: 'banh-beo.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/B%C3%A1nh_b%C3%A8o.jpg'
  },
  {
    name: 'Bánh bột lọc',
    slug: 'banh-bot-loc.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/68/B%C3%A1nh_b%C3%A8o%2C_b%E1%BB%99t_l%E1%BB%8Dc%2C_nem_chua.jpg'
  },
  {
    name: 'Bánh căn',
    slug: 'banh-can.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/a3/B%C3%A1nh_c%C4%83n_1.jpg'
  },
  {
    name: 'Bánh đúc',
    slug: 'banh-duc.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/00/Banhduc-northern.jpg'
  },
  {
    name: 'Bánh giò',
    slug: 'banh-gio.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/9/91/B%C3%A1nh_gi%C3%B2.jpg'
  },
  {
    name: 'Bánh khọt',
    slug: 'banh-khot.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/89/B%C3%A1nh_kh%E1%BB%8Dt.jpg'
  },
  {
    name: 'Bánh xèo',
    slug: 'banh-xeo.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/B%C3%A1nh_x%C3%A8o_with_n%C6%B0%E1%BB%9Bc_m%E1%BA%AFm.jpg'
  },
  {
    name: 'Bánh tráng nướng',
    slug: 'banh-trang-nuong.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/fd/B%C3%A1nh_tr%C3%A1ng_n%C6%B0%E1%BB%9Bng_TP._H%E1%BB%93_Ch%C3%AD_Minh_-_street_food_in_Ho_Chi_Minh_City%2C_Vietnam.jpg'
  },
  {
    name: 'Bánh tráng trộn Sài Gòn',
    slug: 'banh-trang-tron.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/63/Vietnamese_%22banh_trang_tron%22.JPG'
  },
  {
    name: 'Bánh pía',
    slug: 'banh-pia.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/B%C3%A1nh_p%C3%ADa.JPG'
  },
  {
    name: 'Bánh chưng',
    slug: 'banh-chung.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Banh_chung_vuong.jpg'
  },
  {
    name: 'Cơm tấm',
    slug: 'com-tam.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/b0/C%C6%A1m_T%E1%BA%A5m%2C_Da_Nang%2C_Vietnam.jpg'
  },
  {
    name: 'Cơm tấm sườn bì chả trứng',
    slug: 'com-tam-suon-bi-cha.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/81/C%C6%A1m_t%E1%BA%A5m_s%C6%B0%E1%BB%9Dn_b%C3%AC_ch%E1%BA%A3.jpg'
  },
  {
    name: 'Cơm gà Hải Nam Hội An',
    slug: 'com-ga-hoi-an.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Com_ga_Viet_Nam_voi_ga_luoc_com_vang_va_nuoc_cham.jpg'
  },
  {
    name: 'Cơm cháy kho quẹt Nam Bộ',
    slug: 'com-chay-kho-quet.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/C%C6%A1m_ch%C3%A1y_kho_qu%E1%BA%B9t.jpg'
  },
  {
    name: 'Bò kho bánh mì Sài Gòn',
    slug: 'bo-kho.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/16/Bo_kho_mien_Bac.jpg'
  },
  {
    name: 'Cá kho tộ',
    slug: 'ca-kho-to.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/b4/C%C3%A1_kho_t%E1%BB%99.JPG'
  },
  {
    name: 'Canh chua',
    slug: 'canh-chua.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Canh_chua_c%C3%A1_l%C3%B3c_%E1%BB%9F_Th%E1%BB%A7y_Tr%C3%BAc_Qu%C3%A1n%2C_%C4%91%C6%B0%E1%BB%9Dng_Nguy%E1%BB%85n_Nh%E1%BB%AF_L%C3%A3m_%284%29.jpg'
  },
  {
    name: 'Cháo lòng',
    slug: 'chao-long.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Ch%C3%A1o_l%C3%B2ng.jpg'
  },
  {
    name: 'Cháo ếch Singapore chuẩn vị',
    slug: 'chao-ech.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Ch%C3%A1o_%E1%BA%BFch_Sing-ga-po_%28th%E1%BB%91_th%E1%BB%8Bt_%E1%BA%BFch%29_t%E1%BA%A1i_T%C3%A2n_Ph%C3%BA_th%C3%A1ng_1_n%C4%83m_2018_%283%29.jpg'
  },
  {
    name: 'Chả cá Lã Vọng Hà Nội',
    slug: 'cha-ca-la-vong.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/b7/Ch%E1%BA%A3_c%C3%A1_L%C3%A3_V%E1%BB%8Dng_H%C3%A0_N%E1%BB%99i_th%C3%A1ng_2_n%C4%83m_2018_%281%29.jpg'
  },
  {
    name: 'Xôi xéo',
    slug: 'xoi-xeo.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/X%C3%B4i_x%C3%A9o.jpg'
  },
  {
    name: 'Gỏi cuốn',
    slug: 'goi-cuon.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/03/Summer_roll.jpg'
  },
  {
    name: 'Gỏi ngó sen tôm thịt',
    slug: 'goi-ngo-sen.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/76/G%E1%BB%8Fi_b%C3%B4ng_%C4%91i%C3%AAn_%C4%91i%E1%BB%83n_v%C3%A0_t%C3%A9p_%C4%91%C3%B4%CC%81ng.jpg'
  },
  {
    name: 'Nem nướng Nha Trang',
    slug: 'nem-nuong.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Nem_n%C6%B0%E1%BB%9Bng.jpg'
  },
  {
    name: 'Ốc hương rang muối tuyết',
    slug: 'oc-huong.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/%E1%BB%90c_h%C6%B0%C6%A1ng_rang_me.jpg'
  },
  {
    name: 'Lẩu mắm miền Tây đặc sản',
    slug: 'lau-mam.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/L%E1%BA%A9u_c%C3%A1_d%C3%A0y_n%E1%BA%A5u_m%C3%B4n%2C_%C4%91%E1%BA%B7c_s%E1%BA%A3n_Qu%E1%BA%A3ng_Tr%E1%BB%8B-%C4%90%C3%B4ng_H%C3%A0_2018_%289%29.jpg'
  },
  {
    name: 'Lẩu gà lá é Tao Ngộ',
    slug: 'lau-ga-la-e.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/L%E1%BA%A9u_h%E1%BA%A3i_s%E1%BA%A3n_t%E1%BA%A1i_Ael_mall_n%C4%83m_2016_%283%29.jpg'
  },
  {
    name: 'Lẩu riêu cua bắp bò sườn sụn',
    slug: 'lau-rieu-cua.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/e2/M%C3%B3n_l%E1%BA%A9u_%C4%83n_v%E1%BB%9Bi_th%E1%BB%8Bt_b%C3%B2_%E1%BB%9F_H%C3%A0_N%E1%BB%99i_th%C3%A1ng_2_n%C4%83m_2018_%281%29.jpg'
  },
  {
    name: 'Chè bưởi An Giang',
    slug: 'che-buoi.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Coc_che_buoi.jpeg'
  },
  {
    name: 'Chè thái sầu riêng đặc biệt',
    slug: 'che-thai.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/75/Chendol2.jpg'
  },
  {
    name: 'Chè khúc bạch hạnh nhân',
    slug: 'che-khuc-bach.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/68/Ch%C3%A8_kh%C3%BAc_b%E1%BA%A1ch_%E1%BB%9F_qu%C3%A1n_Th%E1%BA%A3o_Vy_2020_09_06.jpg'
  },
  {
    name: 'Cà phê sữa đá Sài Gòn',
    slug: 'ca-phe-sua-da.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/b7/Viet-coffee.jpg'
  },
  {
    name: 'Cà phê trứng Hà Nội',
    slug: 'ca-phe-trung.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/22/C%C3%A0_ph%C3%AA_tr%E1%BB%A9ng.jpg'
  }
];

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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'FoodeeSeederBot/1.0 (https://github.com/duonyyy/FOOD; contact: dev@foodee.vn)'
      }
    });

    if (res.status === 429) {
      console.log(`    [429 Rate limited, waiting ${attempt * 3}s before retry...]`);
      await sleep(attempt * 3000);
      continue;
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    return res;
  }
  throw new Error('Exceeded max retries for rate limit');
}

async function main() {
  await pgClient.connect();
  console.log(`Processing ${DISHES.length} dishes with 1.8s cooldown...`);

  let successCount = 0;

  for (let i = 0; i < DISHES.length; i++) {
    const item = DISHES[i];
    const objectName = `food-images/${item.slug}`;
    const minioUrl = `http://localhost:9000/foodee/${objectName}`;

    try {
      console.log(`[${i + 1}/${DISHES.length}] Fetching ${item.name}...`);
      const res = await fetchWithRetry(item.url);

      const buffer = Buffer.from(await res.arrayBuffer());
      const contentType = res.headers.get('content-type') || 'image/jpeg';

      await minioClient.putObject('foodee', objectName, buffer, {
        'Content-Type': contentType
      });

      // Update Database
      await pgClient.query(
        `UPDATE "foods" SET "image" = $1, "image_urls" = $2, "updated_at" = NOW() WHERE "name" = $3`,
        [minioUrl, minioUrl, item.name]
      );

      console.log(` -> OK: ${item.name} (${buffer.length} bytes)`);
      successCount++;
    } catch (err) {
      console.error(` -> FAILED: ${item.name}: ${err.message}`);
    }

    // Cooldown 1.8s between each image
    await sleep(1800);
  }

  console.log(`\nFinished: ${successCount}/${DISHES.length} dishes updated.`);
  await pgClient.end();
}

main().catch(console.error);
