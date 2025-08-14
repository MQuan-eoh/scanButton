# IoT Device Control Interface

## Cách sử dụng URL Parameters để cấu hình nhiều thiết bị

### 1. Sử dụng 1 URL GitHub Actions cho 3 thiết bị khác nhau:

```
# Thiết bị 1:
https://your-github-pages-url.com/?deviceName=CB%20Tổng&deviceId=device1

# Thiết bị 2:
https://your-github-pages-url.com/?deviceName=CB%20Phòng%20Khách&deviceId=device2

# Thiết bị 3:
https://your-github-pages-url.com/?deviceName=CB%20Phòng%20Ngủ&deviceId=device3
```

### 2. Parameters có sẵn:

- `deviceName`: Tên thiết bị hiển thị
- `deviceId`: ID duy nhất để đồng bộ settings qua E-Ra platform

### 3. Ví dụ sử dụng trong E-Ra Platform:

Khi tạo iFrame widget trong E-Ra, sử dụng URL như sau:

```
https://your-github-pages-url.com/?deviceName=Máy%20bơm%20nước&deviceId=pump001
```

### 4. Đồng bộ Settings:

- **Cấp độ 1 (URL Parameters)**: Cao nhất - từ URL parameters
- **Cấp độ 2 (E-Ra Platform)**: Trung bình - đồng bộ qua E-Ra platform
- **Cấp độ 3 (localStorage)**: Thấp nhất - lưu trên trình duyệt cục bộ

### 5. Cách settings được đồng bộ:

1. **Lưu settings**: Khi user thay đổi settings → lưu vào localStorage + gửi lên E-Ra platform
2. **Load settings**: URL params → E-Ra platform data → localStorage → defaults
3. **Cross-device sync**: Settings được lưu trên E-Ra platform với key `settings_${deviceId}`

### 6. Benefits:

✅ 1 URL GitHub Actions cho nhiều thiết bị  
✅ Settings đồng bộ giữa các thiết bị  
✅ Cấu hình linh hoạt qua URL  
✅ Fallback mechanism cho reliability  
✅ Cross-device synchronization

### 7. Setup GitHub Actions:

Trong repository settings → Pages → Source: GitHub Actions, code sẽ tự động deploy và tạo URL public.

URL sẽ có dạng: `https://username.github.io/repository-name/`
