-- ============================================================================
-- Foodee - Cleanup Script for Legacy / Broken / Duplicate Foods and Images
-- Keeps strictly the 61 curated authentic Vietnamese dishes with high-res images
-- Safely re-links all historical orderDetails and reviews before deleting old items
-- ============================================================================

BEGIN;

DO $$
BEGIN
    RAISE NOTICE 'Re-linking orderDetails and reviews to new curated food items...';

    -- 1. Phở Bò Tái, Phở Bò Chín, Phở Đặc Biệt -> Phở
    UPDATE "orderDetails" SET food_id = (SELECT id FROM foods WHERE name = 'Phở' AND image LIKE '%w=800%' LIMIT 1) 
    WHERE food_id IN (SELECT id FROM foods WHERE name IN ('Phở Bò Tái', 'Phở Bò Chín', 'Phở Đặc Biệt') AND image NOT LIKE '%w=800%');
    
    UPDATE reviews SET food_id = (SELECT id FROM foods WHERE name = 'Phở' AND image LIKE '%w=800%' LIMIT 1) 
    WHERE food_id IN (SELECT id FROM foods WHERE name IN ('Phở Bò Tái', 'Phở Bò Chín', 'Phở Đặc Biệt') AND image NOT LIKE '%w=800%');

    -- 2. Phở Gà -> Phở gà ta đồi lá chanh
    UPDATE "orderDetails" SET food_id = (SELECT id FROM foods WHERE name = 'Phở gà ta đồi lá chanh' LIMIT 1) 
    WHERE food_id IN (SELECT id FROM foods WHERE name = 'Phở Gà' AND image NOT LIKE '%w=800%');
    
    UPDATE reviews SET food_id = (SELECT id FROM foods WHERE name = 'Phở gà ta đồi lá chanh' LIMIT 1) 
    WHERE food_id IN (SELECT id FROM foods WHERE name = 'Phở Gà' AND image NOT LIKE '%w=800%');

    -- 3. Bún Bò Huế -> Bún bò Huế
    UPDATE "orderDetails" SET food_id = (SELECT id FROM foods WHERE name = 'Bún bò Huế' AND image LIKE '%w=800%' LIMIT 1) 
    WHERE food_id IN (SELECT id FROM foods WHERE name = 'Bún Bò Huế' AND image NOT LIKE '%w=800%');

    UPDATE reviews SET food_id = (SELECT id FROM foods WHERE name = 'Bún bò Huế' AND image LIKE '%w=800%' LIMIT 1) 
    WHERE food_id IN (SELECT id FROM foods WHERE name = 'Bún Bò Huế' AND image NOT LIKE '%w=800%');

    -- 4. Bún Chả Hà Nội -> Bún chả
    UPDATE "orderDetails" SET food_id = (SELECT id FROM foods WHERE name = 'Bún chả' LIMIT 1) 
    WHERE food_id IN (SELECT id FROM foods WHERE name = 'Bún Chả Hà Nội' AND image NOT LIKE '%w=800%');

    UPDATE reviews SET food_id = (SELECT id FROM foods WHERE name = 'Bún chả' LIMIT 1) 
    WHERE food_id IN (SELECT id FROM foods WHERE name = 'Bún Chả Hà Nội' AND image NOT LIKE '%w=800%');

    -- 5. Cơm Tấm Sườn Nướng / Bì Chả -> Cơm tấm
    UPDATE "orderDetails" SET food_id = (SELECT id FROM foods WHERE name = 'Cơm tấm' AND image LIKE '%w=800%' LIMIT 1) 
    WHERE food_id IN (SELECT id FROM foods WHERE name IN ('Cơm Tấm Sườn Nướng', 'Cơm Tấm Bì Chả', 'Cơm Sườn Cốt Lết') AND image NOT LIKE '%w=800%');

    UPDATE reviews SET food_id = (SELECT id FROM foods WHERE name = 'Cơm tấm' AND image LIKE '%w=800%' LIMIT 1) 
    WHERE food_id IN (SELECT id FROM foods WHERE name IN ('Cơm Tấm Sườn Nướng', 'Cơm Tấm Bì Chả', 'Cơm Sườn Cốt Lết') AND image NOT LIKE '%w=800%');

    -- 6. Cơm Gà Xối Mỡ -> Cơm gà Hải Nam Hội An
    UPDATE "orderDetails" SET food_id = (SELECT id FROM foods WHERE name = 'Cơm gà Hải Nam Hội An' LIMIT 1) 
    WHERE food_id IN (SELECT id FROM foods WHERE name IN ('Cơm Gà Xối Mỡ', 'Cơm Gà Nướng') AND image NOT LIKE '%w=800%');

    UPDATE reviews SET food_id = (SELECT id FROM foods WHERE name = 'Cơm gà Hải Nam Hội An' LIMIT 1) 
    WHERE food_id IN (SELECT id FROM foods WHERE name IN ('Cơm Gà Xối Mỡ', 'Cơm Gà Nướng') AND image NOT LIKE '%w=800%');

    -- 7. Cơm Chiên Dương Châu / Cơm khác -> Cơm cháy kho quẹt Nam Bộ
    UPDATE "orderDetails" SET food_id = (SELECT id FROM foods WHERE name = 'Cơm cháy kho quẹt Nam Bộ' LIMIT 1) 
    WHERE food_id IN (SELECT id FROM foods WHERE name IN ('Cơm Chiên Dương Châu', 'Cơm Chiên Hải Sản', 'Cơm Âm Phủ', 'Cơm Hến') AND image NOT LIKE '%w=800%');

    UPDATE reviews SET food_id = (SELECT id FROM foods WHERE name = 'Cơm cháy kho quẹt Nam Bộ' LIMIT 1) 
    WHERE food_id IN (SELECT id FROM foods WHERE name IN ('Cơm Chiên Dương Châu', 'Cơm Chiên Hải Sản', 'Cơm Âm Phủ', 'Cơm Hến') AND image NOT LIKE '%w=800%');

    -- 8. Bánh Mì Pate / Thịt Nướng -> Bánh mì
    UPDATE "orderDetails" SET food_id = (SELECT id FROM foods WHERE name = 'Bánh mì' AND image LIKE '%w=800%' LIMIT 1) 
    WHERE food_id IN (SELECT id FROM foods WHERE name IN ('Bánh Mì Pate', 'Bánh Mì Thịt Nướng', 'Bánh Mì Xíu Mại', 'Bánh Mì Gà Nướng') AND image NOT LIKE '%w=800%');

    UPDATE reviews SET food_id = (SELECT id FROM foods WHERE name = 'Bánh mì' AND image LIKE '%w=800%' LIMIT 1) 
    WHERE food_id IN (SELECT id FROM foods WHERE name IN ('Bánh Mì Pate', 'Bánh Mì Thịt Nướng', 'Bánh Mì Xíu Mại', 'Bánh Mì Gà Nướng') AND image NOT LIKE '%w=800%');

    -- 9. Bánh Xèo Miền Tây -> Bánh xèo
    UPDATE "orderDetails" SET food_id = (SELECT id FROM foods WHERE name = 'Bánh xèo' AND image LIKE '%w=800%' LIMIT 1) 
    WHERE food_id IN (SELECT id FROM foods WHERE name = 'Bánh Xèo Miền Tây' AND image NOT LIKE '%w=800%');

    UPDATE reviews SET food_id = (SELECT id FROM foods WHERE name = 'Bánh xèo' AND image LIKE '%w=800%' LIMIT 1) 
    WHERE food_id IN (SELECT id FROM foods WHERE name = 'Bánh Xèo Miền Tây' AND image NOT LIKE '%w=800%');

    -- 10. Nem Nướng Nha Trang
    UPDATE "orderDetails" SET food_id = (SELECT id FROM foods WHERE name = 'Nem nướng Nha Trang' LIMIT 1) 
    WHERE food_id IN (SELECT id FROM foods WHERE name = 'Nem Nướng Nha Trang' AND image NOT LIKE '%w=800%');

    UPDATE reviews SET food_id = (SELECT id FROM foods WHERE name = 'Nem nướng Nha Trang' LIMIT 1) 
    WHERE food_id IN (SELECT id FROM foods WHERE name = 'Nem Nướng Nha Trang' AND image NOT LIKE '%w=800%');

    -- 11. Chè Ba Màu / Chè Thái -> Chè thái sầu riêng đặc biệt
    UPDATE "orderDetails" SET food_id = (SELECT id FROM foods WHERE name = 'Chè thái sầu riêng đặc biệt' LIMIT 1) 
    WHERE food_id IN (SELECT id FROM foods WHERE name IN ('Chè Ba Màu', 'Chè Thái', 'Chè Sầu Riêng', 'Chè Đậu Đỏ') AND image NOT LIKE '%w=800%');

    UPDATE reviews SET food_id = (SELECT id FROM foods WHERE name = 'Chè thái sầu riêng đặc biệt' LIMIT 1) 
    WHERE food_id IN (SELECT id FROM foods WHERE name IN ('Chè Ba Màu', 'Chè Thái', 'Chè Sầu Riêng', 'Chè Đậu Đỏ') AND image NOT LIKE '%w=800%');

    -- 12. Chè Cung Đình -> Chè bưởi An Giang
    UPDATE "orderDetails" SET food_id = (SELECT id FROM foods WHERE name = 'Chè bưởi An Giang' LIMIT 1) 
    WHERE food_id IN (SELECT id FROM foods WHERE name = 'Chè Cung Đình' AND image NOT LIKE '%w=800%');

    UPDATE reviews SET food_id = (SELECT id FROM foods WHERE name = 'Chè bưởi An Giang' LIMIT 1) 
    WHERE food_id IN (SELECT id FROM foods WHERE name = 'Chè Cung Đình' AND image NOT LIKE '%w=800%');

    -- 13. Cà Phê Sữa Đá -> Cà phê sữa đá Sài Gòn
    UPDATE "orderDetails" SET food_id = (SELECT id FROM foods WHERE name = 'Cà phê sữa đá Sài Gòn' LIMIT 1) 
    WHERE food_id IN (SELECT id FROM foods WHERE name = 'Cà Phê Sữa Đá' AND image NOT LIKE '%w=800%');

    UPDATE reviews SET food_id = (SELECT id FROM foods WHERE name = 'Cà phê sữa đá Sài Gòn' LIMIT 1) 
    WHERE food_id IN (SELECT id FROM foods WHERE name = 'Cà Phê Sữa Đá' AND image NOT LIKE '%w=800%');

    -- 14. Fallback for any other remaining references
    UPDATE "orderDetails" SET food_id = (SELECT id FROM foods WHERE name = 'Phở' AND image LIKE '%w=800%' LIMIT 1)
    WHERE food_id IN (SELECT id FROM foods WHERE image NOT LIKE '%w=800%');

    UPDATE reviews SET food_id = (SELECT id FROM foods WHERE name = 'Phở' AND image LIKE '%w=800%' LIMIT 1)
    WHERE food_id IN (SELECT id FROM foods WHERE image NOT LIKE '%w=800%');

    -- 15. Delete toppings attached to legacy foods
    DELETE FROM toppings WHERE food_id IN (SELECT id FROM foods WHERE image NOT LIKE '%w=800%');

    -- 16. Delete all legacy / low-res / western / broken image foods
    DELETE FROM foods WHERE image NOT LIKE '%w=800%';

    RAISE NOTICE 'Cleanup completed successfully.';
END $$;

COMMIT;

-- Verification
SELECT count(*) as total_active_foods, 
       count(CASE WHEN image LIKE '%pexels%' THEN 1 END) as pexels_remaining,
       count(CASE WHEN image LIKE '%w=800%' THEN 1 END) as sharp_images_count
FROM foods;
