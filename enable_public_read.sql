-- Cấp quyền truy cập ĐỌC công khai (Public Read) cho khách vãng lai (hoặc user chưa đăng nhập)

-- 1. Bảng Trips (Chỉ cho phép đọc những Trips được đánh dấu là is_public = true)
CREATE POLICY "Public Read public trips"
ON public.trips 
FOR SELECT
USING (is_public = true);

-- 2. Bảng Locations (Cho phép đọc các locations thuộc về public trips)
-- Vì location không có cờ is_public, ta join ngầm với bảng trips để kiểm tra.
CREATE POLICY "Public Read public locations"
ON public.locations 
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.trips 
    WHERE trips.id = locations.trip_id AND trips.is_public = true
  )
);

-- 3. Bảng Reviews (Cho phép đọc tất cả các reviews)
CREATE POLICY "Public Read all reviews"
ON public.reviews 
FOR SELECT
USING (true);

-- 4. Bảng Profiles (Cho phép đọc thông tin cơ bản của user để hiển thị tên/avatar)
CREATE POLICY "Public Read profiles"
ON public.profiles 
FOR SELECT
USING (true);

-- LƯU Ý: Những policy này KHÔNG ghi đè các policy UPDATE/INSERT cũ (nếu có). 
-- Nó chỉ BỔ SUNG thêm quyền SELECT cho role "anon" và "authenticated".
