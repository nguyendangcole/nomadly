-- =====================================================================
-- MOCK DATA — Nomadly The Vibe Tribe
-- Tạo 6 fake users + 18 diverse public trips + locations + reviews + comments
-- 
-- ⚠️ QUAN TRỌNG: Script này tạo FAKE PROFILES không gắn với tài khoản auth thật.
--   Các trips sẽ hiện ở Explore & Vibe Feed như bình thường.
-- 
-- Chạy trong Supabase SQL Editor → Run
-- =====================================================================

DO $$
DECLARE
  -- 6 fake user IDs
  u1 UUID := 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa';
  u2 UUID := 'bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb';
  u3 UUID := 'cccccccc-3333-3333-3333-cccccccccccc';
  u4 UUID := 'dddddddd-4444-4444-4444-dddddddddddd';
  u5 UUID := 'eeeeeeee-5555-5555-5555-eeeeeeeeeeee';
  u6 UUID := 'ffffffff-6666-6666-6666-ffffffffffff';

  -- Trip IDs
  t1  UUID := gen_random_uuid();
  t2  UUID := gen_random_uuid();
  t3  UUID := gen_random_uuid();
  t4  UUID := gen_random_uuid();
  t5  UUID := gen_random_uuid();
  t6  UUID := gen_random_uuid();
  t7  UUID := gen_random_uuid();
  t8  UUID := gen_random_uuid();
  t9  UUID := gen_random_uuid();
  t10 UUID := gen_random_uuid();
  t11 UUID := gen_random_uuid();
  t12 UUID := gen_random_uuid();
  t13 UUID := gen_random_uuid();
  t14 UUID := gen_random_uuid();
  t15 UUID := gen_random_uuid();
  t16 UUID := gen_random_uuid();
  t17 UUID := gen_random_uuid();
  t18 UUID := gen_random_uuid();

  loc1 UUID := gen_random_uuid();
  loc2 UUID := gen_random_uuid();
  loc3 UUID := gen_random_uuid();
  loc4 UUID := gen_random_uuid();
  loc5 UUID := gen_random_uuid();

BEGIN

-- =====================================================================
-- 1. FAKE USERS & PROFILES
-- Chú ý: Cần tạo user trong auth.users trước vì profiles có khóa ngoại (foreign key) trỏ tới auth.users.
-- =====================================================================

-- Tạo identities trong auth.users
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at) VALUES
  (u1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'minh.phuot@gmail.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
  (u2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sarah.exp@gmail.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
  (u3, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'dat.backpack@gmail.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
  (u4, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'linh.luxury@gmail.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
  (u5, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'tom.wander@gmail.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
  (u6, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mai.adventure@gmail.com', crypt('password123', gen_salt('bf')), now(), now(), now())
ON CONFLICT (id) DO NOTHING;

-- Tạo profiles cho các identities vừa tạo
INSERT INTO public.profiles (id, name, avatar_url, plan) VALUES
  (u1, 'Minh Phượt Thủ', 'https://api.dicebear.com/7.x/avataaars/svg?seed=minh', 'free'),
  (u2, 'Sarah Explorer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', 'pro'),
  (u3, 'Đạt Backpacker', 'https://api.dicebear.com/7.x/avataaars/svg?seed=dat', 'free'),
  (u4, 'Linh Luxury', 'https://api.dicebear.com/7.x/avataaars/svg?seed=linh', 'pro'),
  (u5, 'Tom Wanderer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=tom', 'free'),
  (u6, 'Mai Adventurer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=mai', 'free')
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, avatar_url = EXCLUDED.avatar_url, plan = EXCLUDED.plan;

-- =====================================================================
-- 2. TRIPS — 18 chuyến đi đa dạng
-- =====================================================================
INSERT INTO public.trips (id, user_id, title, destination_summary, cover_image, days, budget, is_public, likes, comments, created_at) VALUES

-- Minh (u1) — Dân phượt Việt Nam
(t1,  u1, '🏍️ Hà Giang Loop Không Phanh', 'Chinh phục cung đường đèo đẹp nhất Đông Nam Á: Mã Pì Lèng, Đồng Văn, 4 mùa hoa tam giác mạch. Trải nghiệm hợp chốn nào?', '/assets/branding/logo-mark.png', 5, 150, true, 4200, 98, now() - interval '3 days'),
(t2,  u1, '🌊 Côn Đảo Hoang Dã 4 Ngày', 'Đảo thiêng liêng với biển xanh ngọc bích, rùa biển đẻ trứng và nghĩa trang Hàng Dương. Thao thức lòng người.', '/assets/branding/logo-mark.png', 4, 600, true, 1870, 34, now() - interval '7 days'),
(t3,  u1, '🎋 Ninh Bình Bình Yên Ngày Cuối Tuần', 'Tam Cốc, Tràng An, Bích Động chỉ với 2 ngày mà cảnh vật như bức tranh thủy mặc cổ điển.', '/assets/branding/logo-mark.png', 2, 120, true, 980, 15, now() - interval '14 days'),

-- Sarah (u2) — Tây ba lô yêu Châu Á
(t4,  u2, '🗼 Tokyo 7 Ngày Ăn Sập Nhật Bản', 'Từ Shibuya Crossing đến núi Phú Sĩ, Akihabara đến Arashiyama. Ramen, sushi, onsen và không ngủ.', '/assets/branding/logo-mark.png', 7, 2200, true, 5600, 210, now() - interval '2 days'),
(t5,  u2, '🌸 Kyoto Mùa Hoa Anh Đào', '1000 ngôi đền, geisha thật sự, matcha khắp nơi và rừng tre Arashiyama. Mùa xuân đẹp mê hồn.', '/assets/branding/logo-mark.png', 5, 1800, true, 3200, 87, now() - interval '10 days'),
(t6,  u2, '🛺 Bangkok Street Food Tour', 'Pad thai lúc 2am, Chatuchak Market, Chinatown, chùa Emerald Buddha và mua sắm tới bến ở MBK.', '/assets/branding/logo-mark.png', 4, 400, true, 2100, 56, now() - interval '20 days'),

-- Đạt (u3) — Backpacker nghèo nhưng chất
(t7,  u3, '🎒 Phú Quốc Budget Trip Cho Dân Nghèo', 'Khám phá Phú Quốc chỉ với 1.5 triệu/ngày: thuê xe máy, biển vắng Bãi Dài, chợ đêm hải sản tươi rói.', '/assets/branding/logo-mark.png', 3, 200, true, 1340, 42, now() - interval '5 days'),
(t8,  u3, '🏔️ Trekking Fansipan Nóc Nhà Đông Dương', 'Leo 3143m trong 2 ngày 1 đêm, ngủ lán giữa rừng nguyên sinh. Khó nhưng đỉnh theo đúng nghĩa đen.', '/assets/branding/logo-mark.png', 2, 80, true, 2890, 73, now() - interval '8 days'),
(t9,  u3, '🇨🇲 Khmer Temples — Siem Reap 4 Ngày', 'Angkor Wat lúc bình minh, Bayon 216 khuôn mặt, Ta Prohm cây đa ôm đền, bia Angkor luôn tay. Lịch sử sống động.', '/assets/branding/logo-mark.png', 4, 350, true, 1560, 38, now() - interval '18 days'),

-- Linh (u4) — Dân luxury travel
(t10, u4, '🏨 Santorini & Mykonos Honeymoon', 'Ngồi nhà màu trắng xanh nhìn hoàng hôn Oia, ăn fresh seafood và uống wine Hy Lạp cả ngày. Trăng mật hoàn hảo.', '/assets/branding/logo-mark.png', 7, 5000, true, 7800, 312, now() - interval '1 day'),
(t11, u4, '🌴 Maldives Overwater Bungalow 5 Sao', 'Private villa trên biển, san hô đẹp nhất thế giới, dolphin cruise và spa thư giãn. Thiên đường là đây.', '/assets/branding/logo-mark.png', 6, 8000, true, 9200, 445, now() - interval '4 days'),
(t12, u4, '🥂 Paris — Thành Phố Tình Yêu Mùa Đông', 'Eiffel Tower có tuyết, Seine River cruise, Louvre chạy vèo vèo, rượu vang và pho mát đỉnh cao.', '/assets/branding/logo-mark.png', 6, 3500, true, 4100, 128, now() - interval '15 days'),

-- Tom (u5) — Adventurer thích extreme
(t13, u5, '🤿 Great Barrier Reef Diving Trip', 'Dive cùng cá mập, sea turtle, manta ray. 3 ngày trên liveaboard boat. Queensland Úc đẹp đến choáng ngợp.', '/assets/branding/logo-mark.png', 3, 1200, true, 3400, 89, now() - interval '6 days'),
(t14, u5, '🏂 Hokkaido Powder Snow — Niseko', 'Trượt tuyết trên snow ngon nhất thế giới, onsen ngoài trời giữa tuyết trắng. Hokkaido crab xúc miệng.', '/assets/branding/logo-mark.png', 5, 2800, true, 2700, 64, now() - interval '12 days'),
(t15, u5, '🧗 Đà Nẵng Cực Chất — Leo Núi Bà Nà, Ngũ Hành Sơn', 'Cáp treo Golden Bridge kéo lê khách mỗi ngày, leo núi Ngũ Hành Sơn, lặn Mỹ Khê Crystal clear water.', '/assets/branding/logo-mark.png', 3, 300, true, 1890, 52, now() - interval '9 days'),

-- Mai (u6) — Digital nomad thích cozy trips
(t16, u6, '☕ Chiang Mai Digital Nomad Month', 'Làm việc remote tại cafe đẹp nhất Thái Lan, yoga buổi sáng, thăm chùa bạch mã, massage Thái mỗi tối. Work-life balance đỉnh.', '/assets/branding/logo-mark.png', 28, 800, true, 2300, 71, now() - interval '3 days'),
(t17, u6, '🏡 Đà Lạt Sáng Sương Mù — Cà Phê & Hoa', 'Thức dậy lúc 6am lên đồi uống cà phê nhìn mây trôi, chụp ảnh rừng thông và ăn bánh tráng nướng cheat ngày.', '/assets/branding/logo-mark.png', 3, 180, true, 3100, 93, now() - interval '11 days'),
(t18, u6, '🇵🇹 Lisbon & Porto — Portugal Slow Travel', 'Đi bộ lên đồi ngắm tram vintage, uống Pastéis de Nata nóng hổi, nghe Fado live và xem Atlantic sunset.', '/assets/branding/logo-mark.png', 8, 1600, true, 1750, 47, now() - interval '22 days')

ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- 3. LOCATIONS — Lịch trình cho các trip
-- =====================================================================

-- t1: Hà Giang Loop
INSERT INTO public.locations (trip_id, name, category, cost, day_number, rating, description) VALUES
(t1, 'Km0 nhà thờ Đồng Văn', 'Fun', 0, 1, 5.0, 'Check-in góc ảnh đẹp nhất Đồng Văn lúc chiều tà.'),
(t1, 'Mã Pì Lèng Pass', 'Fun', 0, 2, 5.0, 'Đèo hùng vĩ nhất Việt Nam, nhìn xuống sông Nho Quế xanh lam.'),
(t1, 'Homestay người Mông Lũng Cú', 'Stay', 8, 2, 4.5, 'Ngủ nhà trình tường, ăn thắng cố, uống rượu ngô.'),
(t1, 'Ruộng bậc thang Hoàng Su Phì', 'Fun', 0, 3, 4.8, 'Đẹp nhất mùa lúa chín tháng 9-10.'),
(t1, 'Cháo ấu tẩu Đồng Văn', 'Food', 2, 1, 4.7, 'Cháo đặc sản ấm lòng cao nguyên đá.');

-- t4: Tokyo
INSERT INTO public.locations (trip_id, name, category, cost, day_number, rating, description) VALUES
(t4, 'Shibuya Scramble Crossing', 'Fun', 0, 1, 4.8, 'Ngã 5 đông người nhất thế giới. Ngắm từ Starbucks tầng 2.'),
(t4, 'Ichiran Ramen Shinjuku', 'Food', 15, 1, 5.0, 'Ramen ăn 1 mình trong booth riêng, ngon đến mức không muốn nói chuyện.'),
(t4, 'Khách sạn Dormy Inn Asakusa', 'Stay', 120, 1, 4.6, 'Onsen trên tầng thượng nhìn ra Asakusa temple.'),
(t4, 'Akihabara Electronics District', 'Fun', 200, 2, 4.7, 'Mê cung anime, manga, đồ điện tử. Cần mang theo thêm tiền.'),
(t4, 'Tsukiji Outer Market', 'Food', 30, 3, 4.9, 'Sushi omakase tươi nhất buổi sáng, cá ngừ maguro chảy dầu.');

-- t10: Santorini
INSERT INTO public.locations (trip_id, name, category, cost, day_number, rating, description) VALUES
(t10, 'Oia Sunset Point', 'Fun', 0, 1, 5.0, 'Hoàng hôn đẹp nhất thế giới. Đến sớm 2 tiếng để có chỗ đứng tốt.'),
(t10, 'Amoudi Bay Seafood Dinner', 'Food', 120, 2, 4.9, 'Nhà hàng ven biển, tôm hùm và bạch tuộc tươi sống.'),
(t10, 'Grace Hotel Santorini', 'Stay', 500, 1, 5.0, 'Infinity pool nhìn ra biển Aegean. Worth every euro.'),
(t10, 'Akrotiri Volcano Tour', 'Fun', 25, 3, 4.5, 'Di tích thành phố cổ bị vùi lấp 3600 năm trước.'),
(t10, 'Wine Tasting at Santo Wines', 'Food', 40, 4, 4.8, 'Rượu vang trắng Assyrtiko trên vách núi nhìn ra caldera.');

-- t11: Maldives  
INSERT INTO public.locations (trip_id, name, category, cost, day_number, rating, description) VALUES
(t11, 'Overwater Bungalow Soneva Fushi', 'Stay', 1200, 1, 5.0, 'Villa tư nhân trên biển, kính đáy nhìn cá ngay dưới chân.'),
(t11, 'Snorkeling Coral Garden', 'Fun', 0, 2, 5.0, 'San hô nguyên sinh, cá đuối và rùa bơi quanh người.'),
(t11, 'Dolphin Sunset Cruise', 'Fun', 80, 3, 5.0, 'Cá heo nhảy quanh thuyền lúc mặt trời lặn. Magical.'),
(t11, 'Underwater Restaurant Ithaa', 'Food', 200, 4, 5.0, 'Ăn dưới đáy biển, cá bơi quanh cửa kính. Unusual dinner!'),
(t11, 'Spa with Ocean View', 'Fun', 150, 5, 4.9, 'Massage bên bờ biển với tiếng sóng vỗ.');

-- t16: Chiang Mai
INSERT INTO public.locations (trip_id, name, category, cost, day_number, rating, description) VALUES
(t16, 'Graph Cafe Nimman', 'Food', 5, 1, 4.9, 'Cafe laptop-friendly, wifi 100mbps, cold brew xuất sắc.'),
(t16, 'Doi Suthep Temple', 'Fun', 3, 2, 4.8, 'Leo 309 bậc hoặc đi thang máy, view nhìn xuống thành phố đẹp.'),
(t16, 'Sunday Walking Street', 'Fun', 20, 3, 4.7, 'Chợ đêm đồ handmade, massaged Thai, street food khổng lồ.'),
(t16, 'Elephant Nature Park', 'Fun', 80, 7, 5.0, 'Chơi với voi, cho voi ăn, voi tắm. Không có khổ sai voi.'),
(t16, 'MAYA Mall Food Court', 'Food', 8, 5, 4.5, 'Khao soi ngon nhất đời ở đây, 60 baht một tô.');

-- =====================================================================
-- 4. REVIEWS
-- =====================================================================
INSERT INTO public.reviews (id, location_id, user_id, rating, comment, created_at)
SELECT gen_random_uuid(), l.id, u3, 5, 'Tuyệt vời không thể tả nổi, nhất định sẽ quay lại!', now() - interval '2 days'
FROM public.locations l
INNER JOIN public.trips t ON t.id = l.trip_id
WHERE t.id = t1 AND l.name = 'Mã Pì Lèng Pass'
LIMIT 1;

INSERT INTO public.reviews (id, location_id, user_id, rating, comment, created_at)
SELECT gen_random_uuid(), l.id, u5, 5, 'Ichiran Ramen is life-changing. Nothing has ever tasted better at 11pm after a long day.', now() - interval '3 days'
FROM public.locations l
INNER JOIN public.trips t ON t.id = l.trip_id
WHERE t.id = t4 AND l.name = 'Ichiran Ramen Shinjuku'
LIMIT 1;

INSERT INTO public.reviews (id, location_id, user_id, rating, comment, created_at)
SELECT gen_random_uuid(), l.id, u2, 5, 'The sunset at Oia changed my life. I cried. I''m not ashamed.', now() - interval '1 day'
FROM public.locations l
INNER JOIN public.trips t ON t.id = l.trip_id
WHERE t.id = t10 AND l.name = 'Oia Sunset Point'
LIMIT 1;

INSERT INTO public.reviews (id, location_id, user_id, rating, comment, created_at)
SELECT gen_random_uuid(), l.id, u1, 5, 'Đàn cá heo xuất hiện đúng lúc hoàng hôn. Đây là trải nghiệm thần kỳ nhất đời tôi.', now() - interval '5 days'
FROM public.locations l
INNER JOIN public.trips t ON t.id = l.trip_id
WHERE t.id = t11 AND l.name = 'Dolphin Sunset Cruise'
LIMIT 1;

INSERT INTO public.reviews (id, location_id, user_id, rating, comment, created_at)
SELECT gen_random_uuid(), l.id, u4, 4, 'Graph Cafe is 10/10 for remote work vibes. Been here 3 weeks straight lol.', now() - interval '4 days'
FROM public.locations l
INNER JOIN public.trips t ON t.id = l.trip_id
WHERE t.id = t16 AND l.name = 'Graph Cafe Nimman'
LIMIT 1;

-- =====================================================================
-- 5. TRIP COMMENTS
-- =====================================================================
INSERT INTO public.trip_comments (id, trip_id, user_id, comment, created_at) VALUES
(gen_random_uuid(), t1,  u2, 'Hà Giang loop trên bucket list của mình rồi! Thuê xe ở đâu vậy bạn?', now() - interval '2 days'),
(gen_random_uuid(), t1,  u3, 'Mình đã đi 3 lần rồi mà vẫn muốn quay lại. Tháng 10 là đẹp nhất đó nha!', now() - interval '1 day'),
(gen_random_uuid(), t4,  u1, 'Tokyo đỉnh quá!! Bạn ăn ramen ở đâu ngon nhất vậy?', now() - interval '3 days'),
(gen_random_uuid(), t4,  u3, 'Ichiran Ramen must try!! Shibuya crossing ban đêm còn đẹp hơn ban ngày nữa.', now() - interval '2 days'),
(gen_random_uuid(), t4,  u5, 'Just booked my Tokyo trip after seeing this. Arigatou!', now() - interval '1 day'),
(gen_random_uuid(), t10, u1, 'Đây là dream honeymoon của mình và vợ!! Bao giờ mới được đi đây :(', now() - interval '4 hours'),
(gen_random_uuid(), t10, u3, 'Maldives và Santorini được rồi, tiếp theo là đâu vậy Linh? 😍', now() - interval '2 hours'),
(gen_random_uuid(), t11, u2, 'The underwater restaurant is insane. Worth the splurge honestly!', now() - interval '3 days'),
(gen_random_uuid(), t11, u5, 'Photos are SURREAL. That bungalow 😭😭😭', now() - interval '1 day'),
(gen_random_uuid(), t16, u4, 'Chiang Mai is perfect for digital nomads. Cheap, good internet, amazing food!', now() - interval '6 hours'),
(gen_random_uuid(), t16, u2, 'Going there next month! Any café recommendations besides Graph?', now() - interval '2 hours'),
(gen_random_uuid(), t17, u1, 'Đà Lạt sáng sương là đỉnh, mình cũng hay check in Valley of Love lắm!', now() - interval '5 days'),
(gen_random_uuid(), t17, u5, 'Cozy vibes!! Cafe nào view đẹp nhất vậy bạn?', now() - interval '3 days'),
(gen_random_uuid(), t7,  u6, 'Phú Quốc budget mà còn đẹp vậy siêu xịn! Bãi nào vắng nhất?', now() - interval '4 days'),
(gen_random_uuid(), t8,  u4, 'Fansipan cắm trại 1 đêm trên đỉnh là trải nghiệm không thể quên :ok_hand:', now() - interval '6 days')
ON CONFLICT (id) DO NOTHING;

END $$;

-- =====================================================================
-- DONE! Bạn đã có dữ liệu mock phong phú rồi nha 🎉
-- Refresh trang Explore, Vibe Feed để xem kết quả!
-- =====================================================================
