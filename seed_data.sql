-- Seed Data for Smart Travel Planner
-- Note: This script assumes you already have at least ONE user registered and logged in 
-- so that `public.profiles` has at least one row. We will use the first user's ID for these trips.

DO $$
DECLARE
  v_user_id UUID;
  v_trip1_id UUID := gen_random_uuid();
  v_trip2_id UUID := gen_random_uuid();
  v_trip3_id UUID := gen_random_uuid();
  v_trip4_id UUID := gen_random_uuid();
BEGIN
  -- Lấy ID của user đầu tiên trong bảng profiles
  SELECT id INTO v_user_id FROM public.profiles LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Không tìm thấy user nào trong bảng profiles. Vui lòng đăng ký 1 tài khoản trên web trước khi chạy script này.';
  END IF;

  -- 1. Insert Trips giả
  INSERT INTO public.trips (id, user_id, title, destination_summary, cover_image, days, budget, is_public, likes, comments)
  VALUES 
    (v_trip1_id, v_user_id, 'Phượt Xuyên Việt Bằng Xe Máy', 'Hành trình 14 ngày khám phá cung đường biển đẹp nhất Việt Nam từ Bắc chí Nam.', '/logo-mark.svg', 14, 500, true, 1250, 45),
    (v_trip2_id, v_user_id, 'Seoul Mùa Thu Lá Vàng', '5 ngày ăn sập Myeongdong, check-in tháp Namsan và càn quét các khu mua sắm.', '/logo-mark.svg', 5, 1200, true, 890, 12),
    (v_trip3_id, v_user_id, 'Nghỉ Cực Chill Tại Bali', 'Trải nghiệm resort 5 sao vách đá, lướt sóng và ngắm hoàng hôn đền Uluwatu.', '/logo-mark.svg', 4, 850, true, 3400, 150),
    (v_trip4_id, v_user_id, 'Cuối Tuần Bạo Lực Ở Đà Lạt', 'Săn mây đồi chè, ăn bánh tráng nướng và cafe lê la trọn vẹn 3 ngày 2 đêm.', '/logo-mark.svg', 3, 200, true, 560, 5);

  -- 2. Insert Locations giả (Lịch trình) cho các Trip trên
  
  -- Trip 1: Xuyên Việt
  INSERT INTO public.locations (trip_id, name, category, cost, day_number, rating)
  VALUES 
    (v_trip1_id, 'Hà Nội - Phở Thìn Lò Đúc', 'Food', 5, 1, 4.5),
    (v_trip1_id, 'Cầu Thanh Trì', 'Fun', 0, 1, 4.0),
    (v_trip1_id, 'Đèo Hải Vân', 'Fun', 0, 5, 5.0),
    (v_trip1_id, 'Hội An - Mì Quảng Ông Hai', 'Food', 3, 6, 4.8),
    (v_trip1_id, 'Homestay Chill Cà Tàng', 'Stay', 20, 6, 4.2);

  -- Trip 2: Seoul
  INSERT INTO public.locations (trip_id, name, category, cost, day_number, rating)
  VALUES 
    (v_trip2_id, 'Khách sạn Gangnam', 'Stay', 150, 1, 4.7),
    (v_trip2_id, 'Phố đi bộ Myeongdong', 'Fun', 200, 1, 4.9),
    (v_trip2_id, 'BBQ Thịt Nướng Hàn Quốc', 'Food', 40, 1, 5.0),
    (v_trip2_id, 'Tháp Namsan', 'Fun', 15, 2, 4.6);

  -- Trip 3: Bali
  INSERT INTO public.locations (trip_id, name, category, cost, day_number, rating)
  VALUES 
    (v_trip3_id, 'Rock Bar Ayana Resort', 'Fun', 100, 1, 4.9),
    (v_trip3_id, 'Potato Head Beach Club', 'Food', 80, 2, 4.8),
    (v_trip3_id, 'Đền Uluwatu', 'Fun', 10, 3, 5.0);

END $$;
