// ── FAM WHEEL DATABASE SEED ────────────────────────────────────────────────
// Run: node src/prisma/seed.js
// Seeds the database with realistic demo data

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding FAM WHEEL database...');

  // ── USERS ────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('demo123', 10);
  const adminPassword  = await bcrypt.hash('admin123', 10);

  const farmer1 = await prisma.user.upsert({
    where: { email: 'farmer@demo.com' },
    update: {},
    create: {
      firstName: 'Rajesh', lastName: 'Kumar', email: 'farmer@demo.com',
      password: hashedPassword, role: 'FARMER', phone: '+91 98765 43210',
      state: 'Punjab', city: 'Ludhiana', verified: true, avatar: '👨‍🌾',
      bio: 'Third-generation farmer from Punjab. Specializing in wheat and rice. Organic farming since 2015.'
    }
  });

  const buyer1 = await prisma.user.upsert({
    where: { email: 'buyer@demo.com' },
    update: {},
    create: {
      firstName: 'Priya', lastName: 'Sharma', email: 'buyer@demo.com',
      password: hashedPassword, role: 'BUYER', phone: '+91 87654 32109',
      state: 'Maharashtra', city: 'Mumbai', verified: true, avatar: '👩‍💼',
      bio: 'Procurement manager at a leading food processing company. Sourcing fresh produce for 10+ years.'
    }
  });

  const transport1 = await prisma.user.upsert({
    where: { email: 'transport@demo.com' },
    update: {},
    create: {
      firstName: 'Mohan', lastName: 'Singh', email: 'transport@demo.com',
      password: hashedPassword, role: 'TRANSPORT', phone: '+91 76543 21098',
      state: 'Delhi', city: 'Delhi', verified: true, avatar: '🚚',
      bio: 'Fleet owner with 5 vehicles. Specializing in agricultural commodity transport across North India.'
    }
  });

  const admin1 = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      firstName: 'Admin', lastName: 'User', email: 'admin@demo.com',
      password: adminPassword, role: 'ADMIN', phone: '+91 99999 00000',
      state: 'Delhi', city: 'Delhi', verified: true, avatar: '👨‍💼'
    }
  });

  const farmer2 = await prisma.user.upsert({
    where: { email: 'sunita@demo.com' },
    update: {},
    create: {
      firstName: 'Sunita', lastName: 'Patil', email: 'sunita@demo.com',
      password: hashedPassword, role: 'FARMER', phone: '+91 77654 32100',
      state: 'Maharashtra', city: 'Nashik', verified: true, avatar: '👩‍🌾',
      bio: 'Vegetable farmer with 20 acres in Nashik. Specializing in tomatoes, onions, and capsicum.'
    }
  });

  const farmer3 = await prisma.user.upsert({
    where: { email: 'anil@demo.com' },
    update: {},
    create: {
      firstName: 'Anil', lastName: 'Mehta', email: 'anil@demo.com',
      password: hashedPassword, role: 'FARMER', phone: '+91 88888 12345',
      state: 'Maharashtra', city: 'Nashik', verified: true, avatar: '👨‍🌾',
      bio: 'Onion and grape farmer. Exporting produce to UAE and UK for 5+ years.'
    }
  });

  console.log('✅ Users created');

  // ── TRANSPORT PROVIDER ──────────────────────────
  await prisma.transportProvider.upsert({
    where: { userId: transport1.id },
    update: {},
    create: {
      userId: transport1.id, vehicleType: 'Tata Ace', vehicleNo: 'MH-04-XY-1234',
      capacity: 1500, isAvailable: true, currentLoc: 'Delhi'
    }
  });

  console.log('✅ Transport provider created');

  // ── CROPS ────────────────────────────────────────
  const cropsData = [
    { name:'Wheat', emoji:'🌾', category:'GRAIN', quality:'Grade A', description:'Premium quality wheat harvested this season. Suitable for flour mills and export. Chemical-free farming. Moisture content below 12%.', price:2100, unit:'qtl', quantity:20, minOrderQty:1, farmerId:farmer1.id },
    { name:'Rice (Basmati)', emoji:'🍚', category:'GRAIN', quality:'Basmati Premium', description:'Long grain aromatic basmati rice. Certified organic farm. Ideal for export and premium retail. Age-old cultivation methods.', price:3200, unit:'qtl', quantity:30, minOrderQty:1, farmerId:farmer1.id },
    { name:'Maize', emoji:'🌽', category:'GRAIN', quality:'Grade B', description:'Yellow maize suitable for poultry feed and starch industries. Moisture below 14%. Sorted and clean.', price:1800, unit:'qtl', quantity:15, minOrderQty:1, farmerId:farmer1.id },
    { name:'Tomato', emoji:'🍅', category:'VEGETABLE', quality:'Fresh Grade A', description:'Juicy fresh tomatoes directly from farm. Ideal for retail shops and restaurants. No harmful pesticides. Harvested 24 hours ago.', price:45, unit:'kg', quantity:500, minOrderQty:10, farmerId:farmer2.id },
    { name:'Onion', emoji:'🧅', category:'VEGETABLE', quality:'Premium Red', description:'Red onions from Nashik. Long shelf life, low moisture content. Perfect for storage and export. Uniform 45-55mm size.', price:30, unit:'kg', quantity:1000, minOrderQty:20, farmerId:farmer3.id },
    { name:'Soybean', emoji:'🌱', category:'OILSEED', quality:'Non-GMO Premium', description:'Non-GMO soybean. High protein content 42%. Good for oil extraction and animal feed. Cleaned and sorted.', price:4500, unit:'qtl', quantity:8, minOrderQty:1, farmerId:farmer1.id },
    { name:'Chilli (Dry)', emoji:'🌶️', category:'SPICE', quality:'Guntur Special', description:'Hot dry red chilli from Guntur. Capsaicin level 8-10%. Used for spice industry. Sun-dried naturally.', price:120, unit:'kg', quantity:200, minOrderQty:5, farmerId:farmer2.id },
    { name:'Lentils (Masoor)', emoji:'🫘', category:'PULSE', quality:'Grade A', description:'Masoor dal (red lentils). Clean, sorted. Low moisture. Ready for packaging and retail distribution.', price:6000, unit:'qtl', quantity:5, minOrderQty:1, farmerId:farmer3.id },
  ];

  for (const crop of cropsData) {
    await prisma.crop.create({ data: crop });
  }

  console.log('✅ Crops created');

  // ── MARKET PRICES ────────────────────────────────
  const pricesData = [
    { name:'Wheat',    emoji:'🌾', category:'Grain',    region:'Punjab',      price:2100, unit:'qtl', minPrice:1900, maxPrice:2350 },
    { name:'Tomato',   emoji:'🍅', category:'Vegetable', region:'Maharashtra', price:45,   unit:'kg',  minPrice:30,   maxPrice:70   },
    { name:'Onion',    emoji:'🧅', category:'Vegetable', region:'Nashik',      price:30,   unit:'kg',  minPrice:18,   maxPrice:50   },
    { name:'Potato',   emoji:'🥔', category:'Vegetable', region:'UP',          price:22,   unit:'kg',  minPrice:14,   maxPrice:35   },
    { name:'Maize',    emoji:'🌽', category:'Grain',    region:'MP',          price:1800, unit:'qtl', minPrice:1600, maxPrice:2100 },
    { name:'Soybean',  emoji:'🌱', category:'Oilseed',  region:'Rajasthan',   price:4500, unit:'qtl', minPrice:3800, maxPrice:5200 },
    { name:'Rice',     emoji:'🍚', category:'Grain',    region:'West Bengal', price:3200, unit:'qtl', minPrice:2800, maxPrice:3800 },
    { name:'Chilli',   emoji:'🌶️', category:'Spice',   region:'Andhra Pradesh', price:120, unit:'kg', minPrice:80,  maxPrice:180  },
    { name:'Groundnut',emoji:'🥜', category:'Oilseed',  region:'Gujarat',     price:5500, unit:'qtl', minPrice:4500, maxPrice:6200 },
    { name:'Lentils',  emoji:'🫘', category:'Pulse',    region:'MP',          price:6000, unit:'qtl', minPrice:5200, maxPrice:7000 },
    { name:'Carrot',   emoji:'🥕', category:'Vegetable', region:'Himachal Pradesh', price:35, unit:'kg', minPrice:22, maxPrice:55 },
    { name:'Banana',   emoji:'🍌', category:'Fruit',    region:'Kerala',      price:25,   unit:'kg',  minPrice:18,   maxPrice:35   },
  ];

  for (const p of pricesData) {
    await prisma.marketPrice.create({ data: p });
  }

  console.log('✅ Market prices created');

  // ── ORDERS ───────────────────────────────────────
  const crops = await prisma.crop.findMany();
  if (crops.length >= 2) {
    const order1 = await prisma.order.create({
      data: {
        cropId: crops[0].id, farmerId: farmer1.id, buyerId: buyer1.id,
        quantity: 5, pricePerUnit: 2100, totalAmount: 10500,
        status: 'DELIVERED', paymentStatus: 'PAID',
        deliveryAddress: 'Andheri West, Mumbai, Maharashtra',
        deliveryDate: new Date('2026-08-21')
      }
    });

    const order2 = await prisma.order.create({
      data: {
        cropId: crops[3].id, farmerId: farmer2.id, buyerId: buyer1.id,
        quantity: 100, pricePerUnit: 45, totalAmount: 4500,
        status: 'IN_TRANSIT', paymentStatus: 'PAID',
        deliveryAddress: 'Bandra, Mumbai, Maharashtra',
        deliveryDate: new Date('2026-08-23')
      }
    });

    const order3 = await prisma.order.create({
      data: {
        cropId: crops[4].id, farmerId: farmer3.id, buyerId: buyer1.id,
        quantity: 200, pricePerUnit: 30, totalAmount: 6000,
        status: 'CONFIRMED', paymentStatus: 'PENDING',
        deliveryAddress: 'Dadar, Mumbai, Maharashtra'
      }
    });

    const order4 = await prisma.order.create({
      data: {
        cropId: crops[0].id, farmerId: farmer1.id, buyerId: buyer1.id,
        quantity: 3, pricePerUnit: 2100, totalAmount: 6300,
        status: 'PENDING', paymentStatus: 'PENDING',
        deliveryAddress: 'Kurla, Mumbai, Maharashtra'
      }
    });

    console.log('✅ Orders created');

    // ── TRANSPORT REQUESTS ────────────────────────
    const provider = await prisma.transportProvider.findFirst();
    if (provider) {
      await prisma.transportRequest.create({
        data: {
          orderId: order2.id, fromLocation: 'Nashik, Maharashtra',
          toLocation: 'Mumbai, Maharashtra', distance: 170, weight: 100,
          status: 'ASSIGNED', providerId: provider.id, bidAmount: 1200,
          requiredBy: new Date('2026-08-23')
        }
      });
      await prisma.transportRequest.create({
        data: {
          orderId: order3.id, fromLocation: 'Nashik, Maharashtra',
          toLocation: 'Mumbai, Maharashtra', distance: 170, weight: 200,
          status: 'OPEN', requiredBy: new Date('2026-08-25')
        }
      });
    }

    console.log('✅ Transport requests created');
  }

  // ── OFFERS ───────────────────────────────────────
  const allCrops = await prisma.crop.findMany();
  if (allCrops.length > 0) {
    await prisma.offer.create({
      data: {
        cropId: allCrops[0].id, fromId: buyer1.id, toId: farmer1.id,
        offerPrice: 2050, quantity: 5, totalAmount: 10250,
        message: 'Interested in 5 quintals. Can you offer a bulk discount?',
        status: 'PENDING'
      }
    });
    await prisma.offer.create({
      data: {
        cropId: allCrops[3].id, fromId: buyer1.id, toId: farmer2.id,
        offerPrice: 42, quantity: 200, totalAmount: 8400,
        message: 'Regular buyer. Need 200kg weekly. Can give best price.',
        status: 'ACCEPTED'
      }
    });
  }

  console.log('✅ Offers created');

  // ── MESSAGES ─────────────────────────────────────
  await prisma.message.createMany({
    data: [
      { fromId: buyer1.id, toId: farmer1.id, text: 'Hello Rajesh ji, I want to buy 5 quintals of wheat. Is the price negotiable?', isRead: true },
      { fromId: farmer1.id, toId: buyer1.id, text: 'Namaste Priya ji! Yes, for bulk order of 5+ quintals I can do ₹2,050/qtl. Quality is Grade A.', isRead: true },
      { fromId: buyer1.id, toId: farmer1.id, text: 'That sounds good. Can you also arrange transport to Mumbai?', isRead: true },
      { fromId: farmer1.id, toId: buyer1.id, text: 'Yes, I work with a transport provider. Delivery in 3 days. Shall I confirm the order?', isRead: false },
    ]
  });

  console.log('✅ Messages created');

  // ── REVIEWS ──────────────────────────────────────
  await prisma.review.createMany({
    data: [
      { fromId: buyer1.id, toId: farmer1.id, rating: 5, comment: 'Excellent quality wheat! Delivered on time and packaging was great.', cropName: 'Wheat' },
      { fromId: buyer1.id, toId: farmer2.id, rating: 4, comment: 'Fresh tomatoes, good price, cooperative farmer.', cropName: 'Tomato' },
      { fromId: buyer1.id, toId: farmer3.id, rating: 5, comment: 'Best onions I have ever sourced. Will order again!', cropName: 'Onion' },
    ]
  });

  console.log('✅ Reviews created');

  // ── NOTIFICATIONS ────────────────────────────────
  await prisma.notification.createMany({
    data: [
      { userId: farmer1.id, type: 'OFFER', icon: '🤝', title: 'New Offer Received', text: 'Priya Sharma offered ₹2,050/qtl for 5 qtl Wheat', link: '/offers', isRead: false },
      { userId: farmer1.id, type: 'ORDER', icon: '📦', title: 'Order Confirmed', text: 'Order confirmed by Priya Sharma', link: '/orders', isRead: false },
      { userId: farmer1.id, type: 'REVIEW', icon: '⭐', title: 'New Review', text: 'Priya Sharma gave you 5 stars!', link: '/profile', isRead: true },
      { userId: farmer1.id, type: 'PAYMENT', icon: '💰', title: 'Payment Received', text: '₹10,500 received for your wheat order', link: '/orders', isRead: true },
    ]
  });

  console.log('✅ Notifications created');
  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Demo Accounts:');
  console.log('  👨‍🌾 Farmer  : farmer@demo.com  / demo123');
  console.log('  🛒 Buyer   : buyer@demo.com   / demo123');
  console.log('  🚚 Transport: transport@demo.com / demo123');
  console.log('  👨‍💼 Admin   : admin@demo.com   / admin123');
}

main()
  .catch(e => { console.error('❌ Seed error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
