import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.ticket.deleteMany()
  await prisma.solution.deleteMany()

  // Seed Solutions
  const solutions = await Promise.all([
    prisma.solution.create({
      data: {
        title: 'Robot không sạc được',
        keywords: 'sạc, pin, dock sạc, nguồn',
        videoUrl: 'https://youtube.com/example1',
        description: `1. Kiểm tra đèn LED trên dock sạc có sáng không
2. Đảm bảo tiếp điểm sạc trên robot sạch sẽ
3. Thử cắm lại adapter nguồn
4. Nếu vẫn không được, liên hệ bảo hành`
      }
    }),
    prisma.solution.create({
      data: {
        title: 'Robot kêu bíp liên tục',
        keywords: 'bíp, tiếng kêu, lỗi cảm biến',
        videoUrl: 'https://youtube.com/example2',
        description: `1. Tắt robot và khởi động lại
2. Kiểm tra cảm biến chống va chạm có bị kẹt không
3. Làm sạch các cảm biến
4. Reset robot về cài đặt gốc`
      }
    }),
    prisma.solution.create({
      data: {
        title: 'Robot không hút được rác',
        keywords: 'hút, lực hút, bụi, rác',
        videoUrl: null,
        description: `1. Kiểm tra hộp chứa bụi đã đầy chưa
2. Làm sạch lưới lọc
3. Kiểm tra bàn chải có bị rối tóc không
4. Đảm bảo nắp hộp chứa đóng kín`
      }
    }),
    prisma.solution.create({
      data: {
        title: 'Robot không kết nối WiFi',
        keywords: 'wifi, mạng, kết nối, app',
        videoUrl: 'https://youtube.com/example3',
        description: `1. Kiểm tra mật khẩu WiFi
2. Đảm bảo sử dụng WiFi 2.4GHz (không hỗ trợ 5GHz)
3. Đặt robot gần router khi kết nối
4. Xóa robot khỏi app và thêm lại`
      }
    }),
    prisma.solution.create({
      data: {
        title: 'Robot chạy không theo lịch',
        keywords: 'lịch trình, timer, hẹn giờ',
        videoUrl: null,
        description: `1. Kiểm tra lại cài đặt lịch trong app
2. Đảm bảo robot đã sạc đầy pin
3. Kiểm tra múi giờ trong app
4. Cập nhật firmware mới nhất`
      }
    })
  ])

  // Seed Tickets
  const tickets = await Promise.all([
    prisma.ticket.create({
      data: {
        customerName: 'Nguyễn Văn A',
        phone: '0901234567',
        description: 'Robot của tôi không sạc được sau khi dùng 6 tháng. Đèn dock không sáng.',
        status: 'OPEN',
        warranty: 'ACTIVE'
      }
    }),
    prisma.ticket.create({
      data: {
        customerName: 'Trần Thị B',
        phone: '0912345678',
        description: 'Robot kêu bíp 3 tiếng rồi dừng lại. Không chạy được.',
        status: 'OPEN',
        warranty: 'ACTIVE'
      }
    }),
    prisma.ticket.create({
      data: {
        customerName: 'Lê Văn C',
        phone: '0923456789',
        description: 'Đã thử theo hướng dẫn nhưng robot vẫn không kết nối WiFi được.',
        status: 'ESCALATED',
        warranty: 'EXPIRED'
      }
    }),
    prisma.ticket.create({
      data: {
        phone: '0934567890',
        description: 'Robot chạy được nhưng lực hút yếu, không hút sạch được.',
        status: 'OPEN',
        warranty: 'UNKNOWN'
      }
    }),
    prisma.ticket.create({
      data: {
        customerName: 'Phạm Thị D',
        phone: '0945678901',
        description: 'Cảm ơn team đã hỗ trợ, robot đã hoạt động lại bình thường.',
        status: 'RESOLVED',
        warranty: 'ACTIVE'
      }
    })
  ])

  console.log('✅ Seeded database with:')
  console.log(`   - ${solutions.length} solutions`)
  console.log(`   - ${tickets.length} tickets`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
