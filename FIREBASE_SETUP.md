# Firebase Setup Guide cho GIHO Support

## 🔥 Bước 1: Tạo Firebase Project

1. Vào https://console.firebase.google.com
2. Click **"Add project"**
3. Đặt tên: **"GIHO Support"**
4. Bỏ Google Analytics
5. Click **Create project**

## 📱 Bước 2: Add Web App

1. Click vào project vừa tạo
2. Click **Web icon (</>)** trong phần "Get started"
3. Đặt nickname: **"GIHO Support Web"**
4. **KHÔNG** check "Also set up Firebase Hosting"
5. Click **Register app**

## 🔑 Bước 3: Copy Config

Copy đoạn `firebaseConfig` và paste vào file:
**`lib/firebase.ts`**

Thay thế các giá trị YOUR_XXX bằng giá trị thực.

## 💾 Bước 4: Enable Storage

1. Trong Firebase Console, click **Storage** ở menu bên trái
2. Click **Get Started**
3. Chọn **Start in production mode** (hoặc test mode)
4. Click **Next**
5. Chọn location: **asia-southeast1** (Singapore - gần VN nhất)
6. Click **Done**

## 🔒 Bước 5: Setup Storage Rules

Vào **Storage → Rules** và paste:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /tickets/{ticketId}/{filename} {
      // Allow anyone to upload (for support tickets)
      allow write: if request.resource.size < 100 * 1024 * 1024; // Max 100MB
      // Allow anyone to read
      allow read: if true;
    }
  }
}
```

Click **Publish**

## ✅ Xong!

Sau khi hoàn thành, hệ thống sẽ:
- ✅ Upload ảnh/video lên Firebase Storage
- ✅ Validate thời lượng video (max 60s)
- ✅ Validate size (video 100MB, ảnh 5MB)
- ✅ Auto-delete files sau 3 ngày

## 🔧 CRON Job (Optional)

Để tự động xóa files cũ, setup CRON job gọi:
```
POST http://localhost:3000/api/cleanup
```
Mỗi ngày 1 lần (ví dụ: 2:00 AM)
