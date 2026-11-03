-- ============================================================================
-- Foodee - 60 Authentic Vietnamese Dishes Seeding Script
-- Covers all 30 AI Vision classes + 30 iconic specialties across Vietnam
-- ============================================================================
BEGIN;

-- 1. Ensure uuid-ossp extension is ready
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Insert or Update 60 Curated Dishes
-- [PHO_BUN] Phở
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Phở' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Phở bò truyền thống Hà Nội với nước dùng ninh từ xương bò thảo mộc trong 12 tiếng, bánh phở tươi mềm và thịt bò tái nạm ngọt đậm vị.',
            price = 65000,
            discount_percent = 0,
            rating = 4.9,
            sold_count = 620,
            purchased_number = 620,
            status = 'available',
            tag = 'signature',
            preparation_time = 10,
            category_id = '035f0d4c-12eb-4c9a-81d5-fd9e26628371',
            restaurant_id = '0eb10a4e-0560-4493-9631-fe3b2950f264',
            image = 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Phở', 'Phở bò truyền thống Hà Nội với nước dùng ninh từ xương bò thảo mộc trong 12 tiếng, bánh phở tươi mềm và thịt bò tái nạm ngọt đậm vị.', 65000, 0, 4.9,
            620, 620, 'available', 'signature', 10,
            '035f0d4c-12eb-4c9a-81d5-fd9e26628371', '0eb10a4e-0560-4493-9631-fe3b2950f264', 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [PHO_BUN] Bún bò Huế
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Bún bò Huế' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Bún bò Huế chuẩn vị cố đô với sợi bún to tròn, chả cua Huế, giò heo, nạm bò và nước dùng dậy mùi sả thơm cùng mắm ruốc đặc trưng.',
            price = 70000,
            discount_percent = 5,
            rating = 4.8,
            sold_count = 480,
            purchased_number = 480,
            status = 'available',
            tag = 'bestseller',
            preparation_time = 12,
            category_id = '035f0d4c-12eb-4c9a-81d5-fd9e26628371',
            restaurant_id = '0eb10a4e-0560-4493-9631-fe3b2950f264',
            image = 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Bún bò Huế', 'Bún bò Huế chuẩn vị cố đô với sợi bún to tròn, chả cua Huế, giò heo, nạm bò và nước dùng dậy mùi sả thơm cùng mắm ruốc đặc trưng.', 70000, 5, 4.8,
            480, 480, 'available', 'bestseller', 12,
            '035f0d4c-12eb-4c9a-81d5-fd9e26628371', '0eb10a4e-0560-4493-9631-fe3b2950f264', 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [BANH_MI] Bánh mì
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Bánh mì' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Bánh mì Sài Gòn vỏ giòn rụm kẹp đẫy pate gan béo ngậy, bơ thơm lừng, giò thủ, chả lụa, dưa leo giòn, đồ chua và ớt tươi cay nồng.',
            price = 32000,
            discount_percent = 0,
            rating = 4.9,
            sold_count = 890,
            purchased_number = 890,
            status = 'available',
            tag = 'signature',
            preparation_time = 5,
            category_id = 'a9ec9927-8949-4d45-af26-582a2cbfca92',
            restaurant_id = '56539df1-660d-42c9-b3d6-e1dc18f10b74',
            image = 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Bánh mì', 'Bánh mì Sài Gòn vỏ giòn rụm kẹp đẫy pate gan béo ngậy, bơ thơm lừng, giò thủ, chả lụa, dưa leo giòn, đồ chua và ớt tươi cay nồng.', 32000, 0, 4.9,
            890, 890, 'available', 'signature', 5,
            'a9ec9927-8949-4d45-af26-582a2cbfca92', '56539df1-660d-42c9-b3d6-e1dc18f10b74', 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [COM_MAN] Cơm tấm
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Cơm tấm' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Cơm tấm sườn nướng mỡ than hoa mật ong thơm nức, ăn kèm chả trứng béo ngậy, bì sợi giòn, dưa chua và chén nước mắm kẹo pha chuẩn vị.',
            price = 60000,
            discount_percent = 0,
            rating = 4.9,
            sold_count = 750,
            purchased_number = 750,
            status = 'available',
            tag = 'signature',
            preparation_time = 10,
            category_id = 'f1206d6c-dad7-46e3-bde6-c62036845a4e',
            restaurant_id = '8c0ecb65-43bf-4ad0-ba3d-556de3dc780b',
            image = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Cơm tấm', 'Cơm tấm sườn nướng mỡ than hoa mật ong thơm nức, ăn kèm chả trứng béo ngậy, bì sợi giòn, dưa chua và chén nước mắm kẹo pha chuẩn vị.', 60000, 0, 4.9,
            750, 750, 'available', 'signature', 10,
            'f1206d6c-dad7-46e3-bde6-c62036845a4e', '8c0ecb65-43bf-4ad0-ba3d-556de3dc780b', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [GOI_CUON] Gỏi cuốn
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Gỏi cuốn' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Gỏi cuốn thanh mát với tôm sú tươi luộc đỏ au, thịt ba chỉ, bún tươi và hẹ xanh cuộn trong lớp bánh tráng dẻo, chấm tương đen đậu phộng béo bùi.',
            price = 40000,
            discount_percent = 0,
            rating = 4.7,
            sold_count = 390,
            purchased_number = 390,
            status = 'available',
            tag = 'healthy',
            preparation_time = 8,
            category_id = '5280d259-314d-4773-88c1-85f3140eeb57',
            restaurant_id = '56539df1-660d-42c9-b3d6-e1dc18f10b74',
            image = 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Gỏi cuốn', 'Gỏi cuốn thanh mát với tôm sú tươi luộc đỏ au, thịt ba chỉ, bún tươi và hẹ xanh cuộn trong lớp bánh tráng dẻo, chấm tương đen đậu phộng béo bùi.', 40000, 0, 4.7,
            390, 390, 'available', 'healthy', 8,
            '5280d259-314d-4773-88c1-85f3140eeb57', '56539df1-660d-42c9-b3d6-e1dc18f10b74', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [BANH_XEO] Bánh xèo
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Bánh xèo' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Bánh xèo miền Tây viền giòn rụm vàng ươm bột nghệ, nhân đầy ắp tôm tươi, thịt ba rọi và giá đỗ, cuốn cùng xà lách cải bẹ xanh tươi non.',
            price = 65000,
            discount_percent = 0,
            rating = 4.8,
            sold_count = 340,
            purchased_number = 340,
            status = 'available',
            tag = 'popular',
            preparation_time = 15,
            category_id = '16e0caa1-b546-4399-9efe-436891a9d2c5',
            restaurant_id = '8c0ecb65-43bf-4ad0-ba3d-556de3dc780b',
            image = 'https://images.unsplash.com/photo-1505253758473-96b3015f21c9?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1505253758473-96b3015f21c9?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Bánh xèo', 'Bánh xèo miền Tây viền giòn rụm vàng ươm bột nghệ, nhân đầy ắp tôm tươi, thịt ba rọi và giá đỗ, cuốn cùng xà lách cải bẹ xanh tươi non.', 65000, 0, 4.8,
            340, 340, 'available', 'popular', 15,
            '16e0caa1-b546-4399-9efe-436891a9d2c5', '8c0ecb65-43bf-4ad0-ba3d-556de3dc780b', 'https://images.unsplash.com/photo-1505253758473-96b3015f21c9?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1505253758473-96b3015f21c9?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [BANH_XEO] Bánh cuốn
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Bánh cuốn' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Bánh cuốn tráng tay nóng hổi mỏng tang nhân thịt nạc mộc nhĩ nấm hương, rắc hành phi thơm nức, ăn kèm chả quế và nước mắm ớt chua ngọt ấm nóng.',
            price = 45000,
            discount_percent = 0,
            rating = 4.7,
            sold_count = 420,
            purchased_number = 420,
            status = 'available',
            tag = 'traditional',
            preparation_time = 10,
            category_id = '16e0caa1-b546-4399-9efe-436891a9d2c5',
            restaurant_id = '56539df1-660d-42c9-b3d6-e1dc18f10b74',
            image = 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Bánh cuốn', 'Bánh cuốn tráng tay nóng hổi mỏng tang nhân thịt nạc mộc nhĩ nấm hương, rắc hành phi thơm nức, ăn kèm chả quế và nước mắm ớt chua ngọt ấm nóng.', 45000, 0, 4.7,
            420, 420, 'available', 'traditional', 10,
            '16e0caa1-b546-4399-9efe-436891a9d2c5', '56539df1-660d-42c9-b3d6-e1dc18f10b74', 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [PHO_BUN] Bún chả
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Bún chả' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Bún chả Hà Nội trứ danh với chả miếng ba chỉ và chả viên nướng than hoa thơm lừng, ngập trong bát nước chấm chua ngọt cà rốt đu đủ giòn sần sật.',
            price = 68000,
            discount_percent = 10,
            rating = 4.9,
            sold_count = 560,
            purchased_number = 560,
            status = 'available',
            tag = 'bestseller',
            preparation_time = 12,
            category_id = '035f0d4c-12eb-4c9a-81d5-fd9e26628371',
            restaurant_id = '0eb10a4e-0560-4493-9631-fe3b2950f264',
            image = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Bún chả', 'Bún chả Hà Nội trứ danh với chả miếng ba chỉ và chả viên nướng than hoa thơm lừng, ngập trong bát nước chấm chua ngọt cà rốt đu đủ giòn sần sật.', 68000, 10, 4.9,
            560, 560, 'available', 'bestseller', 12,
            '035f0d4c-12eb-4c9a-81d5-fd9e26628371', '0eb10a4e-0560-4493-9631-fe3b2950f264', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [PHO_BUN] Bún đậu mắm tôm
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Bún đậu mắm tôm' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Mẹt bún đậu đầy đặn với đậu Mơ chiên phồng giòn rụm, chả cốm nóng hổi, thịt chân giò luộc, dồi sụn chiên và chén mắm tôm Thanh Hóa đánh sủi bọt ớt tắc.',
            price = 75000,
            discount_percent = 0,
            rating = 4.9,
            sold_count = 670,
            purchased_number = 670,
            status = 'available',
            tag = 'popular',
            preparation_time = 12,
            category_id = '035f0d4c-12eb-4c9a-81d5-fd9e26628371',
            restaurant_id = '0eb10a4e-0560-4493-9631-fe3b2950f264',
            image = 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Bún đậu mắm tôm', 'Mẹt bún đậu đầy đặn với đậu Mơ chiên phồng giòn rụm, chả cốm nóng hổi, thịt chân giò luộc, dồi sụn chiên và chén mắm tôm Thanh Hóa đánh sủi bọt ớt tắc.', 75000, 0, 4.9,
            670, 670, 'available', 'popular', 12,
            '035f0d4c-12eb-4c9a-81d5-fd9e26628371', '0eb10a4e-0560-4493-9631-fe3b2950f264', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [PHO_BUN] Bún riêu
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Bún riêu' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Bún riêu cua đồng với mảng gạch cua béo ngậy, đậu hũ rán vàng, cà chua tươi mọng và nước dùng giấm bỗng chua thanh dịu nhẹ đầu lưỡi.',
            price = 60000,
            discount_percent = 0,
            rating = 4.7,
            sold_count = 390,
            purchased_number = 390,
            status = 'available',
            tag = 'traditional',
            preparation_time = 10,
            category_id = '035f0d4c-12eb-4c9a-81d5-fd9e26628371',
            restaurant_id = '0eb10a4e-0560-4493-9631-fe3b2950f264',
            image = 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Bún riêu', 'Bún riêu cua đồng với mảng gạch cua béo ngậy, đậu hũ rán vàng, cà chua tươi mọng và nước dùng giấm bỗng chua thanh dịu nhẹ đầu lưỡi.', 60000, 0, 4.7,
            390, 390, 'available', 'traditional', 10,
            '035f0d4c-12eb-4c9a-81d5-fd9e26628371', '0eb10a4e-0560-4493-9631-fe3b2950f264', 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [PHO_BUN] Bún thịt nướng
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Bún thịt nướng' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Tô bún thịt nướng vàng ươm thơm mùi sả vừng, chả giò chiên giòn rụm, đậu phộng rang giòn, mỡ hành ngậy thơm và nước mắm tỏi ớt chua ngọt.',
            price = 55000,
            discount_percent = 0,
            rating = 4.8,
            sold_count = 510,
            purchased_number = 510,
            status = 'available',
            tag = 'popular',
            preparation_time = 10,
            category_id = '035f0d4c-12eb-4c9a-81d5-fd9e26628371',
            restaurant_id = '8c0ecb65-43bf-4ad0-ba3d-556de3dc780b',
            image = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Bún thịt nướng', 'Tô bún thịt nướng vàng ươm thơm mùi sả vừng, chả giò chiên giòn rụm, đậu phộng rang giòn, mỡ hành ngậy thơm và nước mắm tỏi ớt chua ngọt.', 55000, 0, 4.8,
            510, 510, 'available', 'popular', 10,
            '035f0d4c-12eb-4c9a-81d5-fd9e26628371', '8c0ecb65-43bf-4ad0-ba3d-556de3dc780b', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [PHO_BUN] Bún mắm
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Bún mắm' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Bún mắm miền Tây đậm đà nấu từ cốt cá linh, cá sặc ăn cùng heo quay giòn rụm, tôm sú, mực ống tươi, cà tím và đĩa rau đắng bông súng đồng nội.',
            price = 75000,
            discount_percent = 0,
            rating = 4.6,
            sold_count = 280,
            purchased_number = 280,
            status = 'available',
            tag = 'specialty',
            preparation_time = 12,
            category_id = '035f0d4c-12eb-4c9a-81d5-fd9e26628371',
            restaurant_id = '8c0ecb65-43bf-4ad0-ba3d-556de3dc780b',
            image = 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Bún mắm', 'Bún mắm miền Tây đậm đà nấu từ cốt cá linh, cá sặc ăn cùng heo quay giòn rụm, tôm sú, mực ống tươi, cà tím và đĩa rau đắng bông súng đồng nội.', 75000, 0, 4.6,
            280, 280, 'available', 'specialty', 12,
            '035f0d4c-12eb-4c9a-81d5-fd9e26628371', '8c0ecb65-43bf-4ad0-ba3d-556de3dc780b', 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [BANH_XEO] Bánh bèo
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Bánh bèo' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Khay bánh bèo chén xứ Huế bột gạo mềm mịn dẻo mát, phủ tôm chấy đỏ cam rực rỡ, tóp mỡ chiên giòn, mỡ hành và chan nước mắm ngọt ấm nóng.',
            price = 45000,
            discount_percent = 0,
            rating = 4.7,
            sold_count = 310,
            purchased_number = 310,
            status = 'available',
            tag = 'traditional',
            preparation_time = 10,
            category_id = '16e0caa1-b546-4399-9efe-436891a9d2c5',
            restaurant_id = '56539df1-660d-42c9-b3d6-e1dc18f10b74',
            image = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Bánh bèo', 'Khay bánh bèo chén xứ Huế bột gạo mềm mịn dẻo mát, phủ tôm chấy đỏ cam rực rỡ, tóp mỡ chiên giòn, mỡ hành và chan nước mắm ngọt ấm nóng.', 45000, 0, 4.7,
            310, 310, 'available', 'traditional', 10,
            '16e0caa1-b546-4399-9efe-436891a9d2c5', '56539df1-660d-42c9-b3d6-e1dc18f10b74', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [BANH_XEO] Bánh bột lọc
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Bánh bột lọc' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Bánh bột lọc Huế trong suốt dai sần sật bọc con tôm đỏ tươi và thịt ba chỉ rim kẹo đậm đà, chấm nước mắm ớt hiểm cay nồng đặc trưng.',
            price = 48000,
            discount_percent = 0,
            rating = 4.8,
            sold_count = 360,
            purchased_number = 360,
            status = 'available',
            tag = 'popular',
            preparation_time = 10,
            category_id = '16e0caa1-b546-4399-9efe-436891a9d2c5',
            restaurant_id = '56539df1-660d-42c9-b3d6-e1dc18f10b74',
            image = 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Bánh bột lọc', 'Bánh bột lọc Huế trong suốt dai sần sật bọc con tôm đỏ tươi và thịt ba chỉ rim kẹo đậm đà, chấm nước mắm ớt hiểm cay nồng đặc trưng.', 48000, 0, 4.8,
            360, 360, 'available', 'popular', 10,
            '16e0caa1-b546-4399-9efe-436891a9d2c5', '56539df1-660d-42c9-b3d6-e1dc18f10b74', 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [BANH_XEO] Bánh căn
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Bánh căn' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Bánh căn miền Trung nướng khuôn đất giòn đáy mềm lòng xốp mịn nhân tôm mực trứng cút, chấm ngập chén mắm nêm xíu mại hành hoa béo ngậy.',
            price = 55000,
            discount_percent = 0,
            rating = 4.7,
            sold_count = 290,
            purchased_number = 290,
            status = 'available',
            tag = 'regional',
            preparation_time = 15,
            category_id = '16e0caa1-b546-4399-9efe-436891a9d2c5',
            restaurant_id = '8c0ecb65-43bf-4ad0-ba3d-556de3dc780b',
            image = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Bánh căn', 'Bánh căn miền Trung nướng khuôn đất giòn đáy mềm lòng xốp mịn nhân tôm mực trứng cút, chấm ngập chén mắm nêm xíu mại hành hoa béo ngậy.', 55000, 0, 4.7,
            290, 290, 'available', 'regional', 15,
            '16e0caa1-b546-4399-9efe-436891a9d2c5', '8c0ecb65-43bf-4ad0-ba3d-556de3dc780b', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [PHO_BUN] Bánh canh
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Bánh canh' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Tô bánh canh sợi bột lọc dẻo trong nấu cùng tôm thịt, giò heo hầm mềm rục và nước dùng ngọt đậm đà từ xương ống rau củ.',
            price = 60000,
            discount_percent = 0,
            rating = 4.7,
            sold_count = 330,
            purchased_number = 330,
            status = 'available',
            tag = 'comfort',
            preparation_time = 12,
            category_id = '035f0d4c-12eb-4c9a-81d5-fd9e26628371',
            restaurant_id = '0eb10a4e-0560-4493-9631-fe3b2950f264',
            image = 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Bánh canh', 'Tô bánh canh sợi bột lọc dẻo trong nấu cùng tôm thịt, giò heo hầm mềm rục và nước dùng ngọt đậm đà từ xương ống rau củ.', 60000, 0, 4.7,
            330, 330, 'available', 'comfort', 12,
            '035f0d4c-12eb-4c9a-81d5-fd9e26628371', '0eb10a4e-0560-4493-9631-fe3b2950f264', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [CHE_TRANG_MIENG] Bánh chưng
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Bánh chưng' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Bánh chưng xanh Tết cổ truyền gói lá dong thơm, nếp nương dẻo quánh, nhân đỗ xanh bùi ngậy và thịt ba chỉ ướp hạt tiêu đen cay nồng đậm vị.',
            price = 85000,
            discount_percent = 0,
            rating = 4.9,
            sold_count = 220,
            purchased_number = 220,
            status = 'available',
            tag = 'traditional',
            preparation_time = 5,
            category_id = 'e79476a6-90a6-4b21-b8cf-390523a33fef',
            restaurant_id = 'ebb453b0-1b98-4bbc-a995-aab6d1a0e89f',
            image = 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Bánh chưng', 'Bánh chưng xanh Tết cổ truyền gói lá dong thơm, nếp nương dẻo quánh, nhân đỗ xanh bùi ngậy và thịt ba chỉ ướp hạt tiêu đen cay nồng đậm vị.', 85000, 0, 4.9,
            220, 220, 'available', 'traditional', 5,
            'e79476a6-90a6-4b21-b8cf-390523a33fef', 'ebb453b0-1b98-4bbc-a995-aab6d1a0e89f', 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [CHE_TRANG_MIENG] Bánh tét
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Bánh tét' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Đòn bánh tét Nam Bộ dẻo thơm hạt nếp lá dứa xanh ngát, nhân đậu xanh thịt mỡ béo bùi hoặc nhân chuối sứ chín ngọt thơm lừng.',
            price = 80000,
            discount_percent = 0,
            rating = 4.8,
            sold_count = 190,
            purchased_number = 190,
            status = 'available',
            tag = 'traditional',
            preparation_time = 5,
            category_id = 'e79476a6-90a6-4b21-b8cf-390523a33fef',
            restaurant_id = 'ebb453b0-1b98-4bbc-a995-aab6d1a0e89f',
            image = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Bánh tét', 'Đòn bánh tét Nam Bộ dẻo thơm hạt nếp lá dứa xanh ngát, nhân đậu xanh thịt mỡ béo bùi hoặc nhân chuối sứ chín ngọt thơm lừng.', 80000, 0, 4.8,
            190, 190, 'available', 'traditional', 5,
            'e79476a6-90a6-4b21-b8cf-390523a33fef', 'ebb453b0-1b98-4bbc-a995-aab6d1a0e89f', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [BANH_MI] Bánh đúc
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Bánh đúc' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Bánh đúc nóng Hà Nội dẻo quánh mịn màng múc nóng hổi, chan nước mắm ấm ngọt thanh, ăn kèm thịt băm xào mộc nhĩ hành phi thơm giòn.',
            price = 35000,
            discount_percent = 0,
            rating = 4.6,
            sold_count = 270,
            purchased_number = 270,
            status = 'available',
            tag = 'street_food',
            preparation_time = 8,
            category_id = 'a9ec9927-8949-4d45-af26-582a2cbfca92',
            restaurant_id = '56539df1-660d-42c9-b3d6-e1dc18f10b74',
            image = 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Bánh đúc', 'Bánh đúc nóng Hà Nội dẻo quánh mịn màng múc nóng hổi, chan nước mắm ấm ngọt thanh, ăn kèm thịt băm xào mộc nhĩ hành phi thơm giòn.', 35000, 0, 4.6,
            270, 270, 'available', 'street_food', 8,
            'a9ec9927-8949-4d45-af26-582a2cbfca92', '56539df1-660d-42c9-b3d6-e1dc18f10b74', 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [BANH_MI] Bánh giò
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Bánh giò' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Bánh giò nóng hổi gói lá chuối thơm phức, vỏ bột gạo tẻ mềm mịn tan trong miệng cùng nhân thịt băm, nấm mèo, trứng cút chấm tương ớt cay nồng.',
            price = 28000,
            discount_percent = 0,
            rating = 4.8,
            sold_count = 450,
            purchased_number = 450,
            status = 'available',
            tag = 'street_food',
            preparation_time = 5,
            category_id = 'a9ec9927-8949-4d45-af26-582a2cbfca92',
            restaurant_id = '56539df1-660d-42c9-b3d6-e1dc18f10b74',
            image = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Bánh giò', 'Bánh giò nóng hổi gói lá chuối thơm phức, vỏ bột gạo tẻ mềm mịn tan trong miệng cùng nhân thịt băm, nấm mèo, trứng cút chấm tương ớt cay nồng.', 28000, 0, 4.8,
            450, 450, 'available', 'street_food', 5,
            'a9ec9927-8949-4d45-af26-582a2cbfca92', '56539df1-660d-42c9-b3d6-e1dc18f10b74', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [BANH_XEO] Bánh khọt
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Bánh khọt' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Bánh khọt Vũng Tàu chiên khuôn gang giòn rụm bên ngoài mềm béo bên trong, mặt bánh phủ tôm tươi đỏ au, bột tôm chấy, cuốn rau cải xanh chấm mắm chua ngọt.',
            price = 60000,
            discount_percent = 0,
            rating = 4.9,
            sold_count = 410,
            purchased_number = 410,
            status = 'available',
            tag = 'bestseller',
            preparation_time = 15,
            category_id = '16e0caa1-b546-4399-9efe-436891a9d2c5',
            restaurant_id = '8c0ecb65-43bf-4ad0-ba3d-556de3dc780b',
            image = 'https://images.unsplash.com/photo-1505253758473-96b3015f21c9?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1505253758473-96b3015f21c9?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Bánh khọt', 'Bánh khọt Vũng Tàu chiên khuôn gang giòn rụm bên ngoài mềm béo bên trong, mặt bánh phủ tôm tươi đỏ au, bột tôm chấy, cuốn rau cải xanh chấm mắm chua ngọt.', 60000, 0, 4.9,
            410, 410, 'available', 'bestseller', 15,
            '16e0caa1-b546-4399-9efe-436891a9d2c5', '8c0ecb65-43bf-4ad0-ba3d-556de3dc780b', 'https://images.unsplash.com/photo-1505253758473-96b3015f21c9?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1505253758473-96b3015f21c9?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [CHE_TRANG_MIENG] Bánh pía
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Bánh pía' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Bánh pía Sóc Trăng vỏ ngàn lớp mỏng xốp mềm, nhân đậu xanh sầu riêng tươi thơm nức nở quyện lòng đỏ trứng muối bùi béo.',
            price = 50000,
            discount_percent = 0,
            rating = 4.8,
            sold_count = 310,
            purchased_number = 310,
            status = 'available',
            tag = 'specialty',
            preparation_time = 5,
            category_id = 'e79476a6-90a6-4b21-b8cf-390523a33fef',
            restaurant_id = 'ebb453b0-1b98-4bbc-a995-aab6d1a0e89f',
            image = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Bánh pía', 'Bánh pía Sóc Trăng vỏ ngàn lớp mỏng xốp mềm, nhân đậu xanh sầu riêng tươi thơm nức nở quyện lòng đỏ trứng muối bùi béo.', 50000, 0, 4.8,
            310, 310, 'available', 'specialty', 5,
            'e79476a6-90a6-4b21-b8cf-390523a33fef', 'ebb453b0-1b98-4bbc-a995-aab6d1a0e89f', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [BANH_MI] Bánh tráng nướng
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Bánh tráng nướng' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Bánh tráng nướng Đà Lạt giòn tan trên bếp than hoa với trứng gà, ruốc tép khô, hành lá, xúc xích, phô mai và xốt mayonnaise tương ớt thơm ngậy.',
            price = 30000,
            discount_percent = 0,
            rating = 4.9,
            sold_count = 780,
            purchased_number = 780,
            status = 'available',
            tag = 'street_food',
            preparation_time = 8,
            category_id = 'a9ec9927-8949-4d45-af26-582a2cbfca92',
            restaurant_id = '56539df1-660d-42c9-b3d6-e1dc18f10b74',
            image = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Bánh tráng nướng', 'Bánh tráng nướng Đà Lạt giòn tan trên bếp than hoa với trứng gà, ruốc tép khô, hành lá, xúc xích, phô mai và xốt mayonnaise tương ớt thơm ngậy.', 30000, 0, 4.9,
            780, 780, 'available', 'street_food', 8,
            'a9ec9927-8949-4d45-af26-582a2cbfca92', '56539df1-660d-42c9-b3d6-e1dc18f10b74', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [COM_MAN] Cá kho tộ
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Cá kho tộ' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Niêu cá lóc kho tộ đậm đà óng ánh nâu cánh gián, thịt cá săn chắc ngấm đẫm tiêu đen, ớt hiểm và mỡ thịt ba chỉ béo ngậy ăn với cơm nóng hao cơm.',
            price = 85000,
            discount_percent = 0,
            rating = 4.9,
            sold_count = 430,
            purchased_number = 430,
            status = 'available',
            tag = 'signature',
            preparation_time = 20,
            category_id = 'f1206d6c-dad7-46e3-bde6-c62036845a4e',
            restaurant_id = '8c0ecb65-43bf-4ad0-ba3d-556de3dc780b',
            image = 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Cá kho tộ', 'Niêu cá lóc kho tộ đậm đà óng ánh nâu cánh gián, thịt cá săn chắc ngấm đẫm tiêu đen, ớt hiểm và mỡ thịt ba chỉ béo ngậy ăn với cơm nóng hao cơm.', 85000, 0, 4.9,
            430, 430, 'available', 'signature', 20,
            'f1206d6c-dad7-46e3-bde6-c62036845a4e', '8c0ecb65-43bf-4ad0-ba3d-556de3dc780b', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [COM_MAN] Canh chua
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Canh chua' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Bát canh chua cá lóc Nam Bộ thanh mát nấu từ me chín, cá lóc đồng ngọt thịt, bạc hà, đậu bắp, dứa thơm, cà chua và rau om ngò gai ngào ngạt.',
            price = 65000,
            discount_percent = 0,
            rating = 4.8,
            sold_count = 390,
            purchased_number = 390,
            status = 'available',
            tag = 'traditional',
            preparation_time = 15,
            category_id = 'f1206d6c-dad7-46e3-bde6-c62036845a4e',
            restaurant_id = '8c0ecb65-43bf-4ad0-ba3d-556de3dc780b',
            image = 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Canh chua', 'Bát canh chua cá lóc Nam Bộ thanh mát nấu từ me chín, cá lóc đồng ngọt thịt, bạc hà, đậu bắp, dứa thơm, cà chua và rau om ngò gai ngào ngạt.', 65000, 0, 4.8,
            390, 390, 'available', 'traditional', 15,
            'f1206d6c-dad7-46e3-bde6-c62036845a4e', '8c0ecb65-43bf-4ad0-ba3d-556de3dc780b', 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [PHO_BUN] Cao lầu
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Cao lầu' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Cao lầu phố cổ Hội An với sợi mì dày dai màu vàng tro củi, thịt xíu mềm đậm đà, tóp mỡ chiên giòn rụm và rau đắng húng lủi Trà Quế tươi non.',
            price = 65000,
            discount_percent = 0,
            rating = 4.8,
            sold_count = 320,
            purchased_number = 320,
            status = 'available',
            tag = 'specialty',
            preparation_time = 12,
            category_id = '035f0d4c-12eb-4c9a-81d5-fd9e26628371',
            restaurant_id = '0eb10a4e-0560-4493-9631-fe3b2950f264',
            image = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Cao lầu', 'Cao lầu phố cổ Hội An với sợi mì dày dai màu vàng tro củi, thịt xíu mềm đậm đà, tóp mỡ chiên giòn rụm và rau đắng húng lủi Trà Quế tươi non.', 65000, 0, 4.8,
            320, 320, 'available', 'specialty', 12,
            '035f0d4c-12eb-4c9a-81d5-fd9e26628371', '0eb10a4e-0560-4493-9631-fe3b2950f264', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [COM_MAN] Cháo lòng
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Cháo lòng' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Tô cháo lòng hạt gạo bung xốp sánh ngọt hầm từ nước luộc lòng, kèm dồi huyết chiên thơm phức, lòng non giòn, gan, dạ dày và ớt tiêu cay nồng ấm bụng.',
            price = 50000,
            discount_percent = 0,
            rating = 4.7,
            sold_count = 360,
            purchased_number = 360,
            status = 'available',
            tag = 'comfort',
            preparation_time = 10,
            category_id = 'f1206d6c-dad7-46e3-bde6-c62036845a4e',
            restaurant_id = '8c0ecb65-43bf-4ad0-ba3d-556de3dc780b',
            image = 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Cháo lòng', 'Tô cháo lòng hạt gạo bung xốp sánh ngọt hầm từ nước luộc lòng, kèm dồi huyết chiên thơm phức, lòng non giòn, gan, dạ dày và ớt tiêu cay nồng ấm bụng.', 50000, 0, 4.7,
            360, 360, 'available', 'comfort', 10,
            'f1206d6c-dad7-46e3-bde6-c62036845a4e', '8c0ecb65-43bf-4ad0-ba3d-556de3dc780b', 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [PHO_BUN] Hủ tiếu
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Hủ tiếu' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Tô hủ tiếu dai sợi truyền thống Sài Gòn với thịt xá xíu, tôm sú tươi, trứng cút, thịt băm và nước súp trong veo ngọt thanh hầm từ tôm khô củ cải.',
            price = 55000,
            discount_percent = 0,
            rating = 4.7,
            sold_count = 530,
            purchased_number = 530,
            status = 'available',
            tag = 'popular',
            preparation_time = 10,
            category_id = '035f0d4c-12eb-4c9a-81d5-fd9e26628371',
            restaurant_id = '0eb10a4e-0560-4493-9631-fe3b2950f264',
            image = 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Hủ tiếu', 'Tô hủ tiếu dai sợi truyền thống Sài Gòn với thịt xá xíu, tôm sú tươi, trứng cút, thịt băm và nước súp trong veo ngọt thanh hầm từ tôm khô củ cải.', 55000, 0, 4.7,
            530, 530, 'available', 'popular', 10,
            '035f0d4c-12eb-4c9a-81d5-fd9e26628371', '0eb10a4e-0560-4493-9631-fe3b2950f264', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [PHO_BUN] Mì Quảng
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Mì Quảng' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Mì Quảng xứ Quảng sợi vàng óng nghệ, tôm tươi rim thịt ba chỉ đậm vị, trứng cút, đậu phộng rang giòn thơm lừng và bánh tráng mè nướng giòn rụm.',
            price = 60000,
            discount_percent = 0,
            rating = 4.8,
            sold_count = 440,
            purchased_number = 440,
            status = 'available',
            tag = 'signature',
            preparation_time = 12,
            category_id = '035f0d4c-12eb-4c9a-81d5-fd9e26628371',
            restaurant_id = '0eb10a4e-0560-4493-9631-fe3b2950f264',
            image = 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Mì Quảng', 'Mì Quảng xứ Quảng sợi vàng óng nghệ, tôm tươi rim thịt ba chỉ đậm vị, trứng cút, đậu phộng rang giòn thơm lừng và bánh tráng mè nướng giòn rụm.', 60000, 0, 4.8,
            440, 440, 'available', 'signature', 12,
            '035f0d4c-12eb-4c9a-81d5-fd9e26628371', '0eb10a4e-0560-4493-9631-fe3b2950f264', 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [GOI_CUON] Nem chua
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Nem chua' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Nem chua Thanh Hóa lên men tự nhiên gói lá ổi lá chuối, vị chua thanh ngọt thịt, bì lợn dai giòn sần sật điểm lát tỏi ớt thơm cay xè.',
            price = 45000,
            discount_percent = 0,
            rating = 4.7,
            sold_count = 380,
            purchased_number = 380,
            status = 'available',
            tag = 'specialty',
            preparation_time = 5,
            category_id = '5280d259-314d-4773-88c1-85f3140eeb57',
            restaurant_id = '56539df1-660d-42c9-b3d6-e1dc18f10b74',
            image = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Nem chua', 'Nem chua Thanh Hóa lên men tự nhiên gói lá ổi lá chuối, vị chua thanh ngọt thịt, bì lợn dai giòn sần sật điểm lát tỏi ớt thơm cay xè.', 45000, 0, 4.7,
            380, 380, 'available', 'specialty', 5,
            '5280d259-314d-4773-88c1-85f3140eeb57', '56539df1-660d-42c9-b3d6-e1dc18f10b74', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [COM_MAN] Xôi xéo
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Xôi xéo' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Gói xôi xéo Hà Nội nếp cái hoa vàng dẻo quánh vàng ươm, phủ đỗ xanh bào mỏng mịn màng, rưới mỡ gà béo ngậy và hành khô phi vàng giòn rụm.',
            price = 35000,
            discount_percent = 0,
            rating = 4.9,
            sold_count = 610,
            purchased_number = 610,
            status = 'available',
            tag = 'traditional',
            preparation_time = 5,
            category_id = 'f1206d6c-dad7-46e3-bde6-c62036845a4e',
            restaurant_id = '8c0ecb65-43bf-4ad0-ba3d-556de3dc780b',
            image = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Xôi xéo', 'Gói xôi xéo Hà Nội nếp cái hoa vàng dẻo quánh vàng ươm, phủ đỗ xanh bào mỏng mịn màng, rưới mỡ gà béo ngậy và hành khô phi vàng giòn rụm.', 35000, 0, 4.9,
            610, 610, 'available', 'traditional', 5,
            'f1206d6c-dad7-46e3-bde6-c62036845a4e', '8c0ecb65-43bf-4ad0-ba3d-556de3dc780b', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [PHO_BUN] Phở gà ta đồi lá chanh
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Phở gà ta đồi lá chanh' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Phở gà ta thịt chắc da vàng giòn sần sật thái lát, rắc lá chanh thơm lừng, nước dùng gà trong veo ngọt thanh tự nhiên từ xương gà hầm.',
            price = 68000,
            discount_percent = 0,
            rating = 4.8,
            sold_count = 420,
            purchased_number = 420,
            status = 'available',
            tag = 'popular',
            preparation_time = 10,
            category_id = '035f0d4c-12eb-4c9a-81d5-fd9e26628371',
            restaurant_id = '0eb10a4e-0560-4493-9631-fe3b2950f264',
            image = 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Phở gà ta đồi lá chanh', 'Phở gà ta thịt chắc da vàng giòn sần sật thái lát, rắc lá chanh thơm lừng, nước dùng gà trong veo ngọt thanh tự nhiên từ xương gà hầm.', 68000, 0, 4.8,
            420, 420, 'available', 'popular', 10,
            '035f0d4c-12eb-4c9a-81d5-fd9e26628371', '0eb10a4e-0560-4493-9631-fe3b2950f264', 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [PHO_BUN] Phở bò tái lăn Hà Nội
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Phở bò tái lăn Hà Nội' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Phở bò xào tái lăn trên lửa lớn dậy mùi tỏi phi thơm nức mũi, thịt bò mềm ngọt quyện hành hoa và nước dùng phở bò đậm đà sánh ngậy.',
            price = 75000,
            discount_percent = 0,
            rating = 4.9,
            sold_count = 510,
            purchased_number = 510,
            status = 'available',
            tag = 'signature',
            preparation_time = 12,
            category_id = '035f0d4c-12eb-4c9a-81d5-fd9e26628371',
            restaurant_id = '0eb10a4e-0560-4493-9631-fe3b2950f264',
            image = 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Phở bò tái lăn Hà Nội', 'Phở bò xào tái lăn trên lửa lớn dậy mùi tỏi phi thơm nức mũi, thịt bò mềm ngọt quyện hành hoa và nước dùng phở bò đậm đà sánh ngậy.', 75000, 0, 4.9,
            510, 510, 'available', 'signature', 12,
            '035f0d4c-12eb-4c9a-81d5-fd9e26628371', '0eb10a4e-0560-4493-9631-fe3b2950f264', 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [PHO_BUN] Bún ốc chuối đậu
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Bún ốc chuối đậu' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Bún ốc đồng giòn sần sật nấu với chuối tiêu xanh bùi bùi, đậu hũ rán vàng óng và thịt ba chỉ ngập trong nước canh thanh chua dậy mùi tía tô lá lốt.',
            price = 65000,
            discount_percent = 0,
            rating = 4.7,
            sold_count = 270,
            purchased_number = 270,
            status = 'available',
            tag = 'traditional',
            preparation_time = 12,
            category_id = '035f0d4c-12eb-4c9a-81d5-fd9e26628371',
            restaurant_id = '0eb10a4e-0560-4493-9631-fe3b2950f264',
            image = 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Bún ốc chuối đậu', 'Bún ốc đồng giòn sần sật nấu với chuối tiêu xanh bùi bùi, đậu hũ rán vàng óng và thịt ba chỉ ngập trong nước canh thanh chua dậy mùi tía tô lá lốt.', 65000, 0, 4.7,
            270, 270, 'available', 'traditional', 12,
            '035f0d4c-12eb-4c9a-81d5-fd9e26628371', '0eb10a4e-0560-4493-9631-fe3b2950f264', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [PHO_BUN] Bún thang Hà Nội
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Bún thang Hà Nội' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Món bún tinh tế đất Thăng Long với lườn gà xé nhỏ, giò lụa thái chỉ, trứng tráng mỏng sợi, nấm hương và chút tinh dầu cà cuống thơm lừng tao nhã.',
            price = 72000,
            discount_percent = 0,
            rating = 4.8,
            sold_count = 310,
            purchased_number = 310,
            status = 'available',
            tag = 'specialty',
            preparation_time = 12,
            category_id = '035f0d4c-12eb-4c9a-81d5-fd9e26628371',
            restaurant_id = '0eb10a4e-0560-4493-9631-fe3b2950f264',
            image = 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Bún thang Hà Nội', 'Món bún tinh tế đất Thăng Long với lườn gà xé nhỏ, giò lụa thái chỉ, trứng tráng mỏng sợi, nấm hương và chút tinh dầu cà cuống thơm lừng tao nhã.', 72000, 0, 4.8,
            310, 310, 'available', 'specialty', 12,
            '035f0d4c-12eb-4c9a-81d5-fd9e26628371', '0eb10a4e-0560-4493-9631-fe3b2950f264', 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [PHO_BUN] Bánh canh ghẹ Phú Quốc
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Bánh canh ghẹ Phú Quốc' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Bánh canh ghẹ nguyên con tươi ngọt vừa đánh bắt, nước súp sánh óng đỏ au từ gạch ghẹ và xương hải sản, ăn kèm muối tiêu chanh ớt xanh cay nồng.',
            price = 95000,
            discount_percent = 10,
            rating = 4.9,
            sold_count = 340,
            purchased_number = 340,
            status = 'available',
            tag = 'premium',
            preparation_time = 15,
            category_id = '035f0d4c-12eb-4c9a-81d5-fd9e26628371',
            restaurant_id = '0eb10a4e-0560-4493-9631-fe3b2950f264',
            image = 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Bánh canh ghẹ Phú Quốc', 'Bánh canh ghẹ nguyên con tươi ngọt vừa đánh bắt, nước súp sánh óng đỏ au từ gạch ghẹ và xương hải sản, ăn kèm muối tiêu chanh ớt xanh cay nồng.', 95000, 10, 4.9,
            340, 340, 'available', 'premium', 15,
            '035f0d4c-12eb-4c9a-81d5-fd9e26628371', '0eb10a4e-0560-4493-9631-fe3b2950f264', 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [PHO_BUN] Bánh canh cua giò heo
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Bánh canh cua giò heo' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Tô bánh canh cua đậm đà với thịt cua biển gỡ tươi rói, giò heo chặt khoanh hầm mềm béo, huyết tươi, chả cá và nước lèo cua sền sệt ngọt thanh.',
            price = 85000,
            discount_percent = 0,
            rating = 4.9,
            sold_count = 480,
            purchased_number = 480,
            status = 'available',
            tag = 'bestseller',
            preparation_time = 15,
            category_id = '035f0d4c-12eb-4c9a-81d5-fd9e26628371',
            restaurant_id = '0eb10a4e-0560-4493-9631-fe3b2950f264',
            image = 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Bánh canh cua giò heo', 'Tô bánh canh cua đậm đà với thịt cua biển gỡ tươi rói, giò heo chặt khoanh hầm mềm béo, huyết tươi, chả cá và nước lèo cua sền sệt ngọt thanh.', 85000, 0, 4.9,
            480, 480, 'available', 'bestseller', 15,
            '035f0d4c-12eb-4c9a-81d5-fd9e26628371', '0eb10a4e-0560-4493-9631-fe3b2950f264', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [PHO_BUN] Hủ tiếu Nam Vang đặc biệt
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Hủ tiếu Nam Vang đặc biệt' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Tô hủ tiếu Nam Vang thập cẩm hảo hạng gồm tôm sú, thịt nạc, thịt băm, tim cật giòn, trứng cút và nước dùng hầm mực khô xương ống ngọt đậm sâu.',
            price = 75000,
            discount_percent = 0,
            rating = 4.9,
            sold_count = 590,
            purchased_number = 590,
            status = 'available',
            tag = 'signature',
            preparation_time = 12,
            category_id = '035f0d4c-12eb-4c9a-81d5-fd9e26628371',
            restaurant_id = '0eb10a4e-0560-4493-9631-fe3b2950f264',
            image = 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Hủ tiếu Nam Vang đặc biệt', 'Tô hủ tiếu Nam Vang thập cẩm hảo hạng gồm tôm sú, thịt nạc, thịt băm, tim cật giòn, trứng cút và nước dùng hầm mực khô xương ống ngọt đậm sâu.', 75000, 0, 4.9,
            590, 590, 'available', 'signature', 12,
            '035f0d4c-12eb-4c9a-81d5-fd9e26628371', '0eb10a4e-0560-4493-9631-fe3b2950f264', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [BANH_MI] Bánh mì chảo đặc biệt
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Bánh mì chảo đặc biệt' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Chảo gang sôi xèo xèo gồm 2 trứng ốp la lòng đào, pate gan áp chảo thơm lừng, xíu mại sốt cà, xúc xích Đức, phô mai và bánh mì nóng giòn rụm.',
            price = 55000,
            discount_percent = 0,
            rating = 4.9,
            sold_count = 680,
            purchased_number = 680,
            status = 'available',
            tag = 'bestseller',
            preparation_time = 10,
            category_id = 'a9ec9927-8949-4d45-af26-582a2cbfca92',
            restaurant_id = '56539df1-660d-42c9-b3d6-e1dc18f10b74',
            image = 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Bánh mì chảo đặc biệt', 'Chảo gang sôi xèo xèo gồm 2 trứng ốp la lòng đào, pate gan áp chảo thơm lừng, xíu mại sốt cà, xúc xích Đức, phô mai và bánh mì nóng giòn rụm.', 55000, 0, 4.9,
            680, 680, 'available', 'bestseller', 10,
            'a9ec9927-8949-4d45-af26-582a2cbfca92', '56539df1-660d-42c9-b3d6-e1dc18f10b74', 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [BANH_MI] Bánh mì xíu mại trứng muối
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Bánh mì xíu mại trứng muối' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Ổ bánh mì kẹp viên xíu mại thịt heo mềm ngọt bọc trứng muối thơm bùi, rưới sốt cà chua sánh mịn và thêm ngò rí, dưa leo tươi giòn.',
            price = 38000,
            discount_percent = 0,
            rating = 4.8,
            sold_count = 520,
            purchased_number = 520,
            status = 'available',
            tag = 'popular',
            preparation_time = 5,
            category_id = 'a9ec9927-8949-4d45-af26-582a2cbfca92',
            restaurant_id = '56539df1-660d-42c9-b3d6-e1dc18f10b74',
            image = 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Bánh mì xíu mại trứng muối', 'Ổ bánh mì kẹp viên xíu mại thịt heo mềm ngọt bọc trứng muối thơm bùi, rưới sốt cà chua sánh mịn và thêm ngò rí, dưa leo tươi giòn.', 38000, 0, 4.8,
            520, 520, 'available', 'popular', 5,
            'a9ec9927-8949-4d45-af26-582a2cbfca92', '56539df1-660d-42c9-b3d6-e1dc18f10b74', 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [BANH_MI] Bánh mì que Hải Phòng
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Bánh mì que Hải Phòng' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Combo 5 ổ bánh mì que Hải Phòng nướng than giòn rụm, nhân pate béo bùi đậm đà tiêu xay chấm cùng tương ớt chí chương thơm cay nồng nàn.',
            price = 45000,
            discount_percent = 0,
            rating = 4.7,
            sold_count = 430,
            purchased_number = 430,
            status = 'available',
            tag = 'street_food',
            preparation_time = 6,
            category_id = 'a9ec9927-8949-4d45-af26-582a2cbfca92',
            restaurant_id = '56539df1-660d-42c9-b3d6-e1dc18f10b74',
            image = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Bánh mì que Hải Phòng', 'Combo 5 ổ bánh mì que Hải Phòng nướng than giòn rụm, nhân pate béo bùi đậm đà tiêu xay chấm cùng tương ớt chí chương thơm cay nồng nàn.', 45000, 0, 4.7,
            430, 430, 'available', 'street_food', 6,
            'a9ec9927-8949-4d45-af26-582a2cbfca92', '56539df1-660d-42c9-b3d6-e1dc18f10b74', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [COM_MAN] Cơm tấm sườn bì chả trứng
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Cơm tấm sườn bì chả trứng' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Suất cơm tấm đặc biệt ''full topping'' với miếng sườn cốt lết dày nướng than vàng thơm, bì heo trộn thính gạo, chả trứng hấp béo bùi và trứng ốp la lòng đào.',
            price = 75000,
            discount_percent = 0,
            rating = 4.9,
            sold_count = 820,
            purchased_number = 820,
            status = 'available',
            tag = 'bestseller',
            preparation_time = 10,
            category_id = 'f1206d6c-dad7-46e3-bde6-c62036845a4e',
            restaurant_id = '8c0ecb65-43bf-4ad0-ba3d-556de3dc780b',
            image = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Cơm tấm sườn bì chả trứng', 'Suất cơm tấm đặc biệt ''full topping'' với miếng sườn cốt lết dày nướng than vàng thơm, bì heo trộn thính gạo, chả trứng hấp béo bùi và trứng ốp la lòng đào.', 75000, 0, 4.9,
            820, 820, 'available', 'bestseller', 10,
            'f1206d6c-dad7-46e3-bde6-c62036845a4e', '8c0ecb65-43bf-4ad0-ba3d-556de3dc780b', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [COM_MAN] Cơm gà Hải Nam Hội An
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Cơm gà Hải Nam Hội An' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Cơm nấu nước cốt luộc gà vàng ươm dẻo thơm, gà ta xé phay bóp gỏi hành tây rau răm và chén canh gà nóng hổi kèm nước mắm gừng ớt tỏi cay thơm.',
            price = 68000,
            discount_percent = 0,
            rating = 4.8,
            sold_count = 490,
            purchased_number = 490,
            status = 'available',
            tag = 'signature',
            preparation_time = 12,
            category_id = 'f1206d6c-dad7-46e3-bde6-c62036845a4e',
            restaurant_id = '8c0ecb65-43bf-4ad0-ba3d-556de3dc780b',
            image = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Cơm gà Hải Nam Hội An', 'Cơm nấu nước cốt luộc gà vàng ươm dẻo thơm, gà ta xé phay bóp gỏi hành tây rau răm và chén canh gà nóng hổi kèm nước mắm gừng ớt tỏi cay thơm.', 68000, 0, 4.8,
            490, 490, 'available', 'signature', 12,
            'f1206d6c-dad7-46e3-bde6-c62036845a4e', '8c0ecb65-43bf-4ad0-ba3d-556de3dc780b', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [COM_MAN] Cơm cháy kho quẹt Nam Bộ
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Cơm cháy kho quẹt Nam Bộ' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Mẹt cơm cháy đáy nồi giòn tan vàng rộm chấm cùng niêu kho quẹt tôm khô thịt ba chỉ tóp mỡ đậm đà kẹo quánh và rổ rau luộc thanh mát.',
            price = 65000,
            discount_percent = 0,
            rating = 4.9,
            sold_count = 540,
            purchased_number = 540,
            status = 'available',
            tag = 'bestseller',
            preparation_time = 15,
            category_id = 'f1206d6c-dad7-46e3-bde6-c62036845a4e',
            restaurant_id = '8c0ecb65-43bf-4ad0-ba3d-556de3dc780b',
            image = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Cơm cháy kho quẹt Nam Bộ', 'Mẹt cơm cháy đáy nồi giòn tan vàng rộm chấm cùng niêu kho quẹt tôm khô thịt ba chỉ tóp mỡ đậm đà kẹo quánh và rổ rau luộc thanh mát.', 65000, 0, 4.9,
            540, 540, 'available', 'bestseller', 15,
            'f1206d6c-dad7-46e3-bde6-c62036845a4e', '8c0ecb65-43bf-4ad0-ba3d-556de3dc780b', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [COM_MAN] Bò kho bánh mì Sài Gòn
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Bò kho bánh mì Sài Gòn' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Nạm bò và gân bò hầm mềm rục cùng cà rốt trong nước sốt sánh mịn màu cam đỏ thơm lừng mùi sả, hồi, quế, chấm bánh mì giòn tan ăn mê ly.',
            price = 70000,
            discount_percent = 0,
            rating = 4.8,
            sold_count = 410,
            purchased_number = 410,
            status = 'available',
            tag = 'popular',
            preparation_time = 12,
            category_id = 'f1206d6c-dad7-46e3-bde6-c62036845a4e',
            restaurant_id = '8c0ecb65-43bf-4ad0-ba3d-556de3dc780b',
            image = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Bò kho bánh mì Sài Gòn', 'Nạm bò và gân bò hầm mềm rục cùng cà rốt trong nước sốt sánh mịn màu cam đỏ thơm lừng mùi sả, hồi, quế, chấm bánh mì giòn tan ăn mê ly.', 70000, 0, 4.8,
            410, 410, 'available', 'popular', 12,
            'f1206d6c-dad7-46e3-bde6-c62036845a4e', '8c0ecb65-43bf-4ad0-ba3d-556de3dc780b', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [COM_MAN] Chả cá Lã Vọng Hà Nội
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Chả cá Lã Vọng Hà Nội' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Chả cá lăng tẩm ướp riềng mẻ nghệ nướng vàng rồi xào nóng trên chảo cùng thì là, hành hoa xắt khúc, ăn kèm bún tươi, lạc rang và mắm tôm đánh sủi bọt.',
            price = 120000,
            discount_percent = 0,
            rating = 4.9,
            sold_count = 290,
            purchased_number = 290,
            status = 'available',
            tag = 'premium',
            preparation_time = 20,
            category_id = 'f1206d6c-dad7-46e3-bde6-c62036845a4e',
            restaurant_id = '8c0ecb65-43bf-4ad0-ba3d-556de3dc780b',
            image = 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Chả cá Lã Vọng Hà Nội', 'Chả cá lăng tẩm ướp riềng mẻ nghệ nướng vàng rồi xào nóng trên chảo cùng thì là, hành hoa xắt khúc, ăn kèm bún tươi, lạc rang và mắm tôm đánh sủi bọt.', 120000, 0, 4.9,
            290, 290, 'available', 'premium', 20,
            'f1206d6c-dad7-46e3-bde6-c62036845a4e', '8c0ecb65-43bf-4ad0-ba3d-556de3dc780b', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [GOI_CUON] Nem nướng Nha Trang
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Nem nướng Nha Trang' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Mẹt nem nướng lụi than hoa thơm nức mũi, ram chiên giòn rụm, bánh tráng mềm cuốn xoài xanh, dưa leo, rau thơm chấm nước sốt tương nếp gan heo bí truyền.',
            price = 70000,
            discount_percent = 0,
            rating = 4.9,
            sold_count = 630,
            purchased_number = 630,
            status = 'available',
            tag = 'bestseller',
            preparation_time = 15,
            category_id = '5280d259-314d-4773-88c1-85f3140eeb57',
            restaurant_id = '56539df1-660d-42c9-b3d6-e1dc18f10b74',
            image = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Nem nướng Nha Trang', 'Mẹt nem nướng lụi than hoa thơm nức mũi, ram chiên giòn rụm, bánh tráng mềm cuốn xoài xanh, dưa leo, rau thơm chấm nước sốt tương nếp gan heo bí truyền.', 70000, 0, 4.9,
            630, 630, 'available', 'bestseller', 15,
            '5280d259-314d-4773-88c1-85f3140eeb57', '56539df1-660d-42c9-b3d6-e1dc18f10b74', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [GOI_CUON] Gỏi ngó sen tôm thịt
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Gỏi ngó sen tôm thịt' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Đĩa gỏi ngó sen trắng ngần giòn sần sật bóp chua ngọt cùng tôm sú luộc đỏ au, thịt tai heo giòn dai, cà rốt thái hoa, rau răm và đậu phộng thơm bùi.',
            price = 65000,
            discount_percent = 0,
            rating = 4.8,
            sold_count = 310,
            purchased_number = 310,
            status = 'available',
            tag = 'fresh',
            preparation_time = 10,
            category_id = '5280d259-314d-4773-88c1-85f3140eeb57',
            restaurant_id = '8c0ecb65-43bf-4ad0-ba3d-556de3dc780b',
            image = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Gỏi ngó sen tôm thịt', 'Đĩa gỏi ngó sen trắng ngần giòn sần sật bóp chua ngọt cùng tôm sú luộc đỏ au, thịt tai heo giòn dai, cà rốt thái hoa, rau răm và đậu phộng thơm bùi.', 65000, 0, 4.8,
            310, 310, 'available', 'fresh', 10,
            '5280d259-314d-4773-88c1-85f3140eeb57', '8c0ecb65-43bf-4ad0-ba3d-556de3dc780b', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [COM_MAN] Cháo ếch Singapore chuẩn vị
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Cháo ếch Singapore chuẩn vị' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Niêu ếch đồng tươi kho cay nồng sốt tương đen Kung Pao đậm đà óng ánh, ăn kèm thố cháo trắng thơm phức dầu mè và hành hoa rắc tiêu.',
            price = 85000,
            discount_percent = 0,
            rating = 4.9,
            sold_count = 390,
            purchased_number = 390,
            status = 'available',
            tag = 'spicy',
            preparation_time = 15,
            category_id = 'f1206d6c-dad7-46e3-bde6-c62036845a4e',
            restaurant_id = '8c0ecb65-43bf-4ad0-ba3d-556de3dc780b',
            image = 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Cháo ếch Singapore chuẩn vị', 'Niêu ếch đồng tươi kho cay nồng sốt tương đen Kung Pao đậm đà óng ánh, ăn kèm thố cháo trắng thơm phức dầu mè và hành hoa rắc tiêu.', 85000, 0, 4.9,
            390, 390, 'available', 'spicy', 15,
            'f1206d6c-dad7-46e3-bde6-c62036845a4e', '8c0ecb65-43bf-4ad0-ba3d-556de3dc780b', 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [BANH_MI] Bánh tráng trộn Sài Gòn
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Bánh tráng trộn Sài Gòn' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Món ăn vặt đường phố nổi tiếng gồm bánh tráng sợi dẻo dai trộn xoài xanh chua bùi, bò khô đỏ, mực rim cay, tép sấy, trứng cút và rau răm rưới sốt me bò cay.',
            price = 25000,
            discount_percent = 0,
            rating = 4.9,
            sold_count = 950,
            purchased_number = 950,
            status = 'available',
            tag = 'street_food',
            preparation_time = 5,
            category_id = 'a9ec9927-8949-4d45-af26-582a2cbfca92',
            restaurant_id = '56539df1-660d-42c9-b3d6-e1dc18f10b74',
            image = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Bánh tráng trộn Sài Gòn', 'Món ăn vặt đường phố nổi tiếng gồm bánh tráng sợi dẻo dai trộn xoài xanh chua bùi, bò khô đỏ, mực rim cay, tép sấy, trứng cút và rau răm rưới sốt me bò cay.', 25000, 0, 4.9,
            950, 950, 'available', 'street_food', 5,
            'a9ec9927-8949-4d45-af26-582a2cbfca92', '56539df1-660d-42c9-b3d6-e1dc18f10b74', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [BANH_MI] Ốc hương rang muối tuyết
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Ốc hương rang muối tuyết' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Đĩa ốc hương biển tươi sống xào đảo cùng lớp muối tuyết trắng tinh cay cay tê tê, thịt ốc giòn ngọt sần sật thơm phức chấm muối tiêu chanh tươi.',
            price = 95000,
            discount_percent = 0,
            rating = 4.9,
            sold_count = 370,
            purchased_number = 370,
            status = 'available',
            tag = 'seafood',
            preparation_time = 15,
            category_id = 'a9ec9927-8949-4d45-af26-582a2cbfca92',
            restaurant_id = '56539df1-660d-42c9-b3d6-e1dc18f10b74',
            image = 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Ốc hương rang muối tuyết', 'Đĩa ốc hương biển tươi sống xào đảo cùng lớp muối tuyết trắng tinh cay cay tê tê, thịt ốc giòn ngọt sần sật thơm phức chấm muối tiêu chanh tươi.', 95000, 0, 4.9,
            370, 370, 'available', 'seafood', 15,
            'a9ec9927-8949-4d45-af26-582a2cbfca92', '56539df1-660d-42c9-b3d6-e1dc18f10b74', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [LAU_NUONG] Lẩu mắm miền Tây đặc sản
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Lẩu mắm miền Tây đặc sản' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Nồi lẩu mắm sôi sục thơm lừng mùi mắm cá linh cá sặc miền Tây, đầy ắp cá hú, tôm càng xanh, mực tươi, cà tím và rổ rau rừng hơn 15 loại đặc sản.',
            price = 180000,
            discount_percent = 10,
            rating = 4.9,
            sold_count = 280,
            purchased_number = 280,
            status = 'available',
            tag = 'signature',
            preparation_time = 20,
            category_id = '90233a84-779d-43e5-a6a6-e0afa29f761b',
            restaurant_id = '420bc5f0-0d0a-4f7b-b291-b1b0052cc99b',
            image = 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Lẩu mắm miền Tây đặc sản', 'Nồi lẩu mắm sôi sục thơm lừng mùi mắm cá linh cá sặc miền Tây, đầy ắp cá hú, tôm càng xanh, mực tươi, cà tím và rổ rau rừng hơn 15 loại đặc sản.', 180000, 10, 4.9,
            280, 280, 'available', 'signature', 20,
            '90233a84-779d-43e5-a6a6-e0afa29f761b', '420bc5f0-0d0a-4f7b-b291-b1b0052cc99b', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [LAU_NUONG] Lẩu gà lá é Tao Ngộ
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Lẩu gà lá é Tao Ngộ' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Nồi lẩu gà đồi săn chắc nấu nấm sò tươi và ớt xiêm xanh cay tê đầu lưỡi, nhúng ngập đĩa lá é trắng thơm mùi tinh dầu thảo mộc đặc trưng Đà Lạt.',
            price = 165000,
            discount_percent = 0,
            rating = 4.9,
            sold_count = 360,
            purchased_number = 360,
            status = 'available',
            tag = 'popular',
            preparation_time = 20,
            category_id = '90233a84-779d-43e5-a6a6-e0afa29f761b',
            restaurant_id = '420bc5f0-0d0a-4f7b-b291-b1b0052cc99b',
            image = 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Lẩu gà lá é Tao Ngộ', 'Nồi lẩu gà đồi săn chắc nấu nấm sò tươi và ớt xiêm xanh cay tê đầu lưỡi, nhúng ngập đĩa lá é trắng thơm mùi tinh dầu thảo mộc đặc trưng Đà Lạt.', 165000, 0, 4.9,
            360, 360, 'available', 'popular', 20,
            '90233a84-779d-43e5-a6a6-e0afa29f761b', '420bc5f0-0d0a-4f7b-b291-b1b0052cc99b', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [LAU_NUONG] Lẩu riêu cua bắp bò sườn sụn
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Lẩu riêu cua bắp bò sườn sụn' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Nồi lẩu riêu cua đồng thơm phức mùi giấm bỗng, gạch cua nổi váng vàng ruộm ngập tràn đĩa bắp bò hoa tươi giòn, sườn sụn non và rau chuối muống chẻ.',
            price = 175000,
            discount_percent = 0,
            rating = 4.9,
            sold_count = 420,
            purchased_number = 420,
            status = 'available',
            tag = 'bestseller',
            preparation_time = 20,
            category_id = '90233a84-779d-43e5-a6a6-e0afa29f761b',
            restaurant_id = 'b822054f-6064-4143-9d9d-892e34d2d85d',
            image = 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Lẩu riêu cua bắp bò sườn sụn', 'Nồi lẩu riêu cua đồng thơm phức mùi giấm bỗng, gạch cua nổi váng vàng ruộm ngập tràn đĩa bắp bò hoa tươi giòn, sườn sụn non và rau chuối muống chẻ.', 175000, 0, 4.9,
            420, 420, 'available', 'bestseller', 20,
            '90233a84-779d-43e5-a6a6-e0afa29f761b', 'b822054f-6064-4143-9d9d-892e34d2d85d', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [CHE_TRANG_MIENG] Chè bưởi An Giang
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Chè bưởi An Giang' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Cốc chè bưởi thơm ngon với cùi bưởi trắng ngần sần sật khử sạch vị đắng, nấu cùng đậu xanh bùi bở, bột năng sánh mịn và chan nước cốt dừa béo ngậy.',
            price = 30000,
            discount_percent = 0,
            rating = 4.8,
            sold_count = 510,
            purchased_number = 510,
            status = 'available',
            tag = 'traditional',
            preparation_time = 5,
            category_id = 'e79476a6-90a6-4b21-b8cf-390523a33fef',
            restaurant_id = 'ebb453b0-1b98-4bbc-a995-aab6d1a0e89f',
            image = 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Chè bưởi An Giang', 'Cốc chè bưởi thơm ngon với cùi bưởi trắng ngần sần sật khử sạch vị đắng, nấu cùng đậu xanh bùi bở, bột năng sánh mịn và chan nước cốt dừa béo ngậy.', 30000, 0, 4.8,
            510, 510, 'available', 'traditional', 5,
            'e79476a6-90a6-4b21-b8cf-390523a33fef', 'ebb453b0-1b98-4bbc-a995-aab6d1a0e89f', 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [CHE_TRANG_MIENG] Chè thái sầu riêng đặc biệt
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Chè thái sầu riêng đặc biệt' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Bát chè Thái thơm lừng múi sầu riêng tươi Đắk Lắk béo ngậy, mít thái, nhãn lồng, thạch dừa giòn sần sật chan ngập sữa tươi nước cốt dừa thanh mát.',
            price = 42000,
            discount_percent = 0,
            rating = 4.9,
            sold_count = 680,
            purchased_number = 680,
            status = 'available',
            tag = 'bestseller',
            preparation_time = 5,
            category_id = 'e79476a6-90a6-4b21-b8cf-390523a33fef',
            restaurant_id = 'ebb453b0-1b98-4bbc-a995-aab6d1a0e89f',
            image = 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Chè thái sầu riêng đặc biệt', 'Bát chè Thái thơm lừng múi sầu riêng tươi Đắk Lắk béo ngậy, mít thái, nhãn lồng, thạch dừa giòn sần sật chan ngập sữa tươi nước cốt dừa thanh mát.', 42000, 0, 4.9,
            680, 680, 'available', 'bestseller', 5,
            'e79476a6-90a6-4b21-b8cf-390523a33fef', 'ebb453b0-1b98-4bbc-a995-aab6d1a0e89f', 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [CHE_TRANG_MIENG] Chè khúc bạch hạnh nhân
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Chè khúc bạch hạnh nhân' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Từng viên khúc bạch sữa tươi và trà xanh mềm mịn béo ngậy tan trên đầu lưỡi, ăn cùng quả vải mọng nước, hạnh nhân lát sấy giòn và nước đường phèn thanh mát.',
            price = 38000,
            discount_percent = 0,
            rating = 4.8,
            sold_count = 470,
            purchased_number = 470,
            status = 'available',
            tag = 'refreshing',
            preparation_time = 5,
            category_id = 'e79476a6-90a6-4b21-b8cf-390523a33fef',
            restaurant_id = 'ebb453b0-1b98-4bbc-a995-aab6d1a0e89f',
            image = 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Chè khúc bạch hạnh nhân', 'Từng viên khúc bạch sữa tươi và trà xanh mềm mịn béo ngậy tan trên đầu lưỡi, ăn cùng quả vải mọng nước, hạnh nhân lát sấy giòn và nước đường phèn thanh mát.', 38000, 0, 4.8,
            470, 470, 'available', 'refreshing', 5,
            'e79476a6-90a6-4b21-b8cf-390523a33fef', 'ebb453b0-1b98-4bbc-a995-aab6d1a0e89f', 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [DO_UONG] Cà phê sữa đá Sài Gòn
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Cà phê sữa đá Sài Gòn' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Ly cà phê phin truyền thống Việt Nam pha từ hạt Robusta rang đậm đà, quyện sữa đặc thơm ngọt béo ngậy và đá bi sảng khoái ngày hè.',
            price = 28000,
            discount_percent = 0,
            rating = 4.9,
            sold_count = 1250,
            purchased_number = 1250,
            status = 'available',
            tag = 'signature',
            preparation_time = 3,
            category_id = '25d766ab-87a0-4ff9-967c-1296f7901eb5',
            restaurant_id = 'ebb453b0-1b98-4bbc-a995-aab6d1a0e89f',
            image = 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Cà phê sữa đá Sài Gòn', 'Ly cà phê phin truyền thống Việt Nam pha từ hạt Robusta rang đậm đà, quyện sữa đặc thơm ngọt béo ngậy và đá bi sảng khoái ngày hè.', 28000, 0, 4.9,
            1250, 1250, 'available', 'signature', 3,
            '25d766ab-87a0-4ff9-967c-1296f7901eb5', 'ebb453b0-1b98-4bbc-a995-aab6d1a0e89f', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [DO_UONG] Cà phê trứng Hà Nội
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Cà phê trứng Hà Nội' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Tách cà phê trứng truyền thống phố cổ Giảng với lớp kem trứng đánh bông mịn như mây béo ngậy thơm ngọt, nổi trên nền cà phê đen phin nóng đậm đà.',
            price = 40000,
            discount_percent = 0,
            rating = 4.9,
            sold_count = 580,
            purchased_number = 580,
            status = 'available',
            tag = 'signature',
            preparation_time = 5,
            category_id = '25d766ab-87a0-4ff9-967c-1296f7901eb5',
            restaurant_id = 'ebb453b0-1b98-4bbc-a995-aab6d1a0e89f',
            image = 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Cà phê trứng Hà Nội', 'Tách cà phê trứng truyền thống phố cổ Giảng với lớp kem trứng đánh bông mịn như mây béo ngậy thơm ngọt, nổi trên nền cà phê đen phin nóng đậm đà.', 40000, 0, 4.9,
            580, 580, 'available', 'signature', 5,
            '25d766ab-87a0-4ff9-967c-1296f7901eb5', 'ebb453b0-1b98-4bbc-a995-aab6d1a0e89f', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [DO_UONG] Trà đào cam sả thanh mát
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Trà đào cam sả thanh mát' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Ly trà đen ủ lạnh ngát hương sả tươi, vị chua dịu của cam vàng mọng nước kết hợp từng miếng đào giòn ngọt sần sật mát lạnh sảng khoái.',
            price = 35000,
            discount_percent = 0,
            rating = 4.8,
            sold_count = 720,
            purchased_number = 720,
            status = 'available',
            tag = 'refreshing',
            preparation_time = 3,
            category_id = '25d766ab-87a0-4ff9-967c-1296f7901eb5',
            restaurant_id = 'ebb453b0-1b98-4bbc-a995-aab6d1a0e89f',
            image = 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Trà đào cam sả thanh mát', 'Ly trà đen ủ lạnh ngát hương sả tươi, vị chua dịu của cam vàng mọng nước kết hợp từng miếng đào giòn ngọt sần sật mát lạnh sảng khoái.', 35000, 0, 4.8,
            720, 720, 'available', 'refreshing', 3,
            '25d766ab-87a0-4ff9-967c-1296f7901eb5', 'ebb453b0-1b98-4bbc-a995-aab6d1a0e89f', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;
-- [DO_UONG] Trà sen vàng củ năng
DO $$
DECLARE
    v_food_id uuid;
BEGIN
    SELECT id INTO v_food_id FROM "foods" WHERE name = 'Trà sen vàng củ năng' LIMIT 1;
    
    IF v_food_id IS NOT NULL THEN
        UPDATE "foods" SET
            description = 'Trà Ô Long thanh khiết kết hợp hạt sen Huế bùi bở thơm dịu, thạch củ năng giòn sần sật và lớp kem sữa macchiato mằn mặn béo ngậy.',
            price = 42000,
            discount_percent = 0,
            rating = 4.9,
            sold_count = 640,
            purchased_number = 640,
            status = 'available',
            tag = 'bestseller',
            preparation_time = 4,
            category_id = '25d766ab-87a0-4ff9-967c-1296f7901eb5',
            restaurant_id = 'ebb453b0-1b98-4bbc-a995-aab6d1a0e89f',
            image = 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80',
            image_urls = 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80',
            updated_at = NOW()
        WHERE id = v_food_id;
    ELSE
        INSERT INTO "foods" (
            id, name, description, price, discount_percent, rating,
            sold_count, purchased_number, status, tag, preparation_time,
            category_id, restaurant_id, image, image_urls, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(), 'Trà sen vàng củ năng', 'Trà Ô Long thanh khiết kết hợp hạt sen Huế bùi bở thơm dịu, thạch củ năng giòn sần sật và lớp kem sữa macchiato mằn mặn béo ngậy.', 42000, 0, 4.9,
            640, 640, 'available', 'bestseller', 4,
            '25d766ab-87a0-4ff9-967c-1296f7901eb5', 'ebb453b0-1b98-4bbc-a995-aab6d1a0e89f', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
        );
    END IF;
END $$;

-- 3. Add Popular Toppings for key dishes

DO $$
DECLARE
    r_food RECORD;
BEGIN
    -- Phở toppings
    FOR r_food IN SELECT id FROM "foods" WHERE name LIKE 'Phở%' LOOP
        INSERT INTO "toppings" (id, name, price, "isAvailable", food_id, created_at, updated_at)
        VALUES (uuid_generate_v4(), 'Quẩy giòn nóng', 5000, true, r_food.id, NOW(), NOW())
        ON CONFLICT DO NOTHING;
        
        INSERT INTO "toppings" (id, name, price, "isAvailable", food_id, created_at, updated_at)
        VALUES (uuid_generate_v4(), 'Trứng chần thảo mộc', 10000, true, r_food.id, NOW(), NOW())
        ON CONFLICT DO NOTHING;

        INSERT INTO "toppings" (id, name, price, "isAvailable", food_id, created_at, updated_at)
        VALUES (uuid_generate_v4(), 'Thịt bò tái thêm', 25000, true, r_food.id, NOW(), NOW())
        ON CONFLICT DO NOTHING;
    END LOOP;

    -- Bún bò Huế toppings
    FOR r_food IN SELECT id FROM "foods" WHERE name = 'Bún bò Huế' LOOP
        INSERT INTO "toppings" (id, name, price, "isAvailable", food_id, created_at, updated_at)
        VALUES (uuid_generate_v4(), 'Chả cua Huế thêm', 15000, true, r_food.id, NOW(), NOW())
        ON CONFLICT DO NOTHING;
        
        INSERT INTO "toppings" (id, name, price, "isAvailable", food_id, created_at, updated_at)
        VALUES (uuid_generate_v4(), 'Giò gân khoanh', 20000, true, r_food.id, NOW(), NOW())
        ON CONFLICT DO NOTHING;
    END LOOP;

    -- Cơm tấm toppings
    FOR r_food IN SELECT id FROM "foods" WHERE name LIKE 'Cơm tấm%' LOOP
        INSERT INTO "toppings" (id, name, price, "isAvailable", food_id, created_at, updated_at)
        VALUES (uuid_generate_v4(), 'Trứng ốp la lòng đào', 8000, true, r_food.id, NOW(), NOW())
        ON CONFLICT DO NOTHING;
        
        INSERT INTO "toppings" (id, name, price, "isAvailable", food_id, created_at, updated_at)
        VALUES (uuid_generate_v4(), 'Chả trứng hấp', 12000, true, r_food.id, NOW(), NOW())
        ON CONFLICT DO NOTHING;

        INSERT INTO "toppings" (id, name, price, "isAvailable", food_id, created_at, updated_at)
        VALUES (uuid_generate_v4(), 'Sườn nướng thêm', 35000, true, r_food.id, NOW(), NOW())
        ON CONFLICT DO NOTHING;
    END LOOP;

    -- Bánh mì toppings
    FOR r_food IN SELECT id FROM "foods" WHERE name LIKE 'Bánh mì%' LOOP
        INSERT INTO "toppings" (id, name, price, "isAvailable", food_id, created_at, updated_at)
        VALUES (uuid_generate_v4(), 'Pate gan thêm', 7000, true, r_food.id, NOW(), NOW())
        ON CONFLICT DO NOTHING;
        
        INSERT INTO "toppings" (id, name, price, "isAvailable", food_id, created_at, updated_at)
        VALUES (uuid_generate_v4(), 'Chả lụa thêm', 8000, true, r_food.id, NOW(), NOW())
        ON CONFLICT DO NOTHING;
    END LOOP;

    -- Chè & Đồ uống toppings
    FOR r_food IN SELECT id FROM "foods" WHERE name LIKE 'Chè%' OR name LIKE 'Trà%' LOOP
        INSERT INTO "toppings" (id, name, price, "isAvailable", food_id, created_at, updated_at)
        VALUES (uuid_generate_v4(), 'Trân châu củ năng', 6000, true, r_food.id, NOW(), NOW())
        ON CONFLICT DO NOTHING;
        
        INSERT INTO "toppings" (id, name, price, "isAvailable", food_id, created_at, updated_at)
        VALUES (uuid_generate_v4(), 'Thạch dừa giòn', 5000, true, r_food.id, NOW(), NOW())
        ON CONFLICT DO NOTHING;
    END LOOP;
END $$;
        

COMMIT;

-- Verification query
SELECT count(*) as total_foods, count(DISTINCT name) as unique_food_names FROM "foods";