# GIHO Support - Deployment Guide

## Deploy lên Vercel (Khuyến nghị cho Next.js)

### Bước 1: Tạo tài khoản Vercel
1. Truy cập: https://vercel.com/signup
2. Đăng nhập bằng GitHub

### Bước 2: Import Project
1. Vào Dashboard: https://vercel.com/new
2. Chọn repository: `gihocode-hash/giho-support`
3. Click "Import"

### Bước 3: Cấu hình Environment Variables
Thêm các biến sau trong Project Settings → Environment Variables:

```
DATABASE_URL=file:./dev.db
GEMINI_API_KEY=AIzaSyAbSrPV73jvpjR3Hqv5KngeQNfrr43wCNs
ENABLE_AI_SEARCH=true
```

### Bước 4: Deploy
- Click "Deploy"
- Đợi 2-3 phút
- Nhận URL: `giho-support.vercel.app`

### Bước 5: Custom Domain
1. Vào Project Settings → Domains
2. Thêm domain: `support.giho.vn`
3. Cấu hình DNS tại nhà cung cấp domain:
   - Type: CNAME
   - Name: support
   - Value: cname.vercel-dns.com

### Bước 6: Database
⚠️ **LƯU Ý:** SQLite (file:./dev.db) không hoạt động trên serverless!

**Giải pháp:**
- Option 1: Dùng **Supabase** (PostgreSQL free) - Khuyến nghị
- Option 2: Dùng **PlanetScale** (MySQL free)
- Option 3: Dùng **Turso** (SQLite edge)

Tôi sẽ hướng dẫn migrate sang Supabase nếu cần.

---

## Alternative: Deploy lên Netlify

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

---

## Sau khi deploy xong:
URL sẽ là: `support.giho.vn`
Khách hàng truy cập → Chatbot AI hỗ trợ 24/7! 🤖
