/* =============================================
   FAM WHEEL – DATA.JS
   Mock data store — crops, orders, messages, transport
   ============================================= */

const FamData = (() => {

  /* ── CROPS MARKETPLACE ──────────────────── */
  const crops = [
    { id:1,  name:'Wheat', emoji:'🌾', category:'Grain',    farmer:'Rajesh Kumar',  farmerId:1, state:'Punjab',      city:'Ludhiana',    price:2100, unit:'qtl', qty:20,  minQty:1,  quality:'Grade A', description:'Premium quality wheat harvested this season. Suitable for flour mills and export. Chemical-free farming.', img:'grain', listed:'2026-08-20', rating:4.8, reviews:24, available:true },
    { id:2,  name:'Tomato', emoji:'🍅', category:'Vegetable', farmer:'Sunita Patil', farmerId:5, state:'Maharashtra', city:'Nashik',      price:45,   unit:'kg',  qty:500, minQty:10, quality:'Fresh', description:'Juicy fresh tomatoes directly from farm. Ideal for retail shops and restaurants. No pesticides.', img:'vegetable', listed:'2026-08-21', rating:4.6, reviews:18, available:true },
    { id:3,  name:'Onion',  emoji:'🧅', category:'Vegetable', farmer:'Anil Mehta',   farmerId:6, state:'Maharashtra', city:'Nashik',      price:30,   unit:'kg',  qty:1000,minQty:20, quality:'Premium', description:'Red onions from Nashik mandi. Long shelf life, low moisture content. Perfect for storage and export.', img:'vegetable', listed:'2026-08-19', rating:4.9, reviews:35, available:true },
    { id:4,  name:'Potato', emoji:'🥔', category:'Vegetable', farmer:'Vikram Singh', farmerId:7, state:'UP',          city:'Agra',        price:22,   unit:'kg',  qty:800, minQty:20, quality:'A-Grade', description:'Fresh white potatoes from Agra. Uniform size, good for retail. Harvested 3 days ago.', img:'vegetable', listed:'2026-08-18', rating:4.4, reviews:12, available:true },
    { id:5,  name:'Maize',  emoji:'🌽', category:'Grain',    farmer:'Pradeep Yadav',farmerId:8, state:'MP',          city:'Indore',      price:1800, unit:'qtl', qty:15,  minQty:1,  quality:'Grade B', description:'Yellow maize suitable for poultry feed and starch industries. Moisture below 14%.', img:'grain', listed:'2026-08-17', rating:4.3, reviews:9, available:true },
    { id:6,  name:'Soybean',emoji:'🌱', category:'Oilseed',  farmer:'Ramesh Patel', farmerId:9, state:'Rajasthan',   city:'Kota',        price:4500, unit:'qtl', qty:8,   minQty:1,  quality:'Premium', description:'Non-GMO soybean. High protein content 42%. Good for oil extraction and animal feed.', img:'oilseed', listed:'2026-08-16', rating:4.7, reviews:21, available:true },
    { id:7,  name:'Rice',   emoji:'🍚', category:'Grain',    farmer:'Arun Kumar',   farmerId:10,state:'West Bengal',  city:'Kolkata',     price:3200, unit:'qtl', qty:30,  minQty:1,  quality:'Basmati', description:'Long grain basmati rice. Aromatic, suitable for export. Certified organic farm.', img:'grain', listed:'2026-08-15', rating:4.9, reviews:42, available:true },
    { id:8,  name:'Chilli', emoji:'🌶️', category:'Spice',   farmer:'Kavya Reddy',  farmerId:11,state:'Andhra Pradesh','city':'Guntur',   price:120,  unit:'kg',  qty:200, minQty:5,  quality:'Dry Red', description:'Hot dry red chilli from Guntur. Capsaicin level high. Used for spice industry.', img:'spice', listed:'2026-08-14', rating:4.5, reviews:16, available:true },
    { id:9,  name:'Groundnut',emoji:'🥜',category:'Oilseed', farmer:'Nilesh Shah',  farmerId:12,state:'Gujarat',      city:'Rajkot',      price:5500, unit:'qtl', qty:12,  minQty:1,  quality:'Bold', description:'Bold groundnuts from Gujarat. Oil content 48%. Suitable for oil mills and snack industry.', img:'oilseed', listed:'2026-08-13', rating:4.6, reviews:14, available:true },
    { id:10, name:'Carrot', emoji:'🥕', category:'Vegetable', farmer:'Meena Devi',  farmerId:13,state:'Himachal Pradesh','city':'Shimla',  price:35,   unit:'kg',  qty:300, minQty:10, quality:'Fresh', description:'Hill-grown carrots from Shimla. Sweet taste, uniform color. Ideal for juicing and retail.', img:'vegetable', listed:'2026-08-22', rating:4.7, reviews:11, available:true },
    { id:11, name:'Lentils',emoji:'🫘', category:'Pulse',    farmer:'Suresh Gupta', farmerId:14,state:'MP',          city:'Bhopal',      price:6000, unit:'qtl', qty:5,   minQty:1,  quality:'Grade A', description:'Masoor dal (red lentils). Clean, sorted. Low moisture. Ready for packaging.', img:'pulse', listed:'2026-08-11', rating:4.8, reviews:19, available:true },
    { id:12, name:'Banana', emoji:'🍌', category:'Fruit',    farmer:'Joseph Mathew',farmerId:15,state:'Kerala',       city:'Thrissur',    price:25,   unit:'kg',  qty:600, minQty:20, quality:'Grade A', description:'Robusta bananas. 7-day shelf life. Grown without chemical ripening agents.', img:'fruit', listed:'2026-08-10', rating:4.5, reviews:28, available:true },
  ];

  /* ── ORDERS ─────────────────────────────── */
  const orders = [
    { id:'ORD-1001', cropId:1, cropName:'Wheat', cropEmoji:'🌾', farmerId:1, farmerName:'Rajesh Kumar', buyerId:2, buyerName:'Priya Sharma', qty:5, unit:'qtl', pricePerUnit:2100, totalAmount:10500, status:'delivered',  date:'2026-08-18', deliveryDate:'2026-08-21', transportId:3, transportName:'Mohan Singh', paymentStatus:'paid', address:'Andheri West, Mumbai, Maharashtra' },
    { id:'ORD-1002', cropId:2, cropName:'Tomato', cropEmoji:'🍅', farmerId:5, farmerName:'Sunita Patil', buyerId:2, buyerName:'Priya Sharma', qty:100, unit:'kg', pricePerUnit:45,   totalAmount:4500,  status:'in_transit', date:'2026-08-20', deliveryDate:'2026-08-23', transportId:3, transportName:'Mohan Singh', paymentStatus:'paid', address:'Bandra, Mumbai, Maharashtra' },
    { id:'ORD-1003', cropId:3, cropName:'Onion',  cropEmoji:'🧅', farmerId:6, farmerName:'Anil Mehta',  buyerId:2, buyerName:'Priya Sharma', qty:200, unit:'kg', pricePerUnit:30,   totalAmount:6000,  status:'confirmed',  date:'2026-08-21', deliveryDate:'2026-08-25', transportId:null, transportName:null, paymentStatus:'pending', address:'Dadar, Mumbai, Maharashtra' },
    { id:'ORD-1004', cropId:4, cropName:'Potato', cropEmoji:'🥔', farmerId:7, farmerName:'Vikram Singh', buyerId:2, buyerName:'Priya Sharma', qty:50, unit:'kg', pricePerUnit:22,   totalAmount:1100,  status:'pending',    date:'2026-08-22', deliveryDate:'2026-08-26', transportId:null, transportName:null, paymentStatus:'pending', address:'Kurla, Mumbai, Maharashtra' },
    { id:'ORD-1005', cropId:7, cropName:'Rice',   cropEmoji:'🍚', farmerId:1, farmerName:'Rajesh Kumar', buyerId:2, buyerName:'Arjun Nair',   qty:10, unit:'qtl', pricePerUnit:3200, totalAmount:32000, status:'delivered',  date:'2026-08-10', deliveryDate:'2026-08-14', transportId:3, transportName:'Mohan Singh', paymentStatus:'paid', address:'Kozhikode, Kerala' },
  ];

  /* ── OFFERS ─────────────────────────────── */
  const offers = [
    { id:'OFF-201', cropId:1, cropName:'Wheat', cropEmoji:'🌾', fromId:2, fromName:'Priya Sharma', toId:1, toName:'Rajesh Kumar', offerPrice:2050, qty:5, unit:'qtl', totalAmount:10250, status:'pending',  date:'2026-08-22', message:'Interested in 5 quintals. Can you offer a bulk discount?' },
    { id:'OFF-202', cropId:1, cropName:'Wheat', cropEmoji:'🌾', fromId:6, fromName:'Kiran Desai',  toId:1, toName:'Rajesh Kumar', offerPrice:2000, qty:10, unit:'qtl', totalAmount:20000,status:'pending',  date:'2026-08-21', message:'Need 10 quintals urgently. Best price?' },
    { id:'OFF-203', cropId:2, cropName:'Tomato',cropEmoji:'🍅', fromId:2, fromName:'Priya Sharma', toId:5, toName:'Sunita Patil', offerPrice:42, qty:200, unit:'kg', totalAmount:8400, status:'accepted', date:'2026-08-20', message:'Regular buyer. Need 200kg weekly.' },
    { id:'OFF-204', cropId:3, cropName:'Onion', cropEmoji:'🧅', fromId:7, fromName:'Mohan Verma',  toId:6, toName:'Anil Mehta',   offerPrice:28, qty:500, unit:'kg', totalAmount:14000,status:'rejected', date:'2026-08-19', message:'Too much stock. Can give 28/kg for bulk.' },
  ];

  /* ── TRANSPORT REQUESTS ─────────────────── */
  const transportRequests = [
    { id:'TRN-301', orderId:'ORD-1002', cropName:'Tomato', cropEmoji:'🍅', from:'Nashik, Maharashtra', to:'Mumbai, Maharashtra', distance:'170 km', weight:'100 kg', requestedDate:'2026-08-20', requiredBy:'2026-08-23', status:'assigned', driverId:3, driverName:'Mohan Singh', vehicle:'Tata Ace (MH-04-XY-1234)', bidAmount:1200, farmerName:'Sunita Patil', buyerName:'Priya Sharma' },
    { id:'TRN-302', orderId:'ORD-1003', cropName:'Onion',  cropEmoji:'🧅', from:'Nashik, Maharashtra', to:'Mumbai, Maharashtra', distance:'170 km', weight:'200 kg', requestedDate:'2026-08-21', requiredBy:'2026-08-25', status:'open',     driverId:null, driverName:null, vehicle:null, bidAmount:null, farmerName:'Anil Mehta', buyerName:'Priya Sharma' },
    { id:'TRN-303', orderId:'ORD-1004', cropName:'Potato', cropEmoji:'🥔', from:'Agra, UP',           to:'Mumbai, Maharashtra', distance:'1200 km',weight:'50 kg',  requestedDate:'2026-08-22', requiredBy:'2026-08-26', status:'open',     driverId:null, driverName:null, vehicle:null, bidAmount:null, farmerName:'Vikram Singh', buyerName:'Priya Sharma' },
  ];

  /* ── MESSAGES ───────────────────────────── */
  const messages = [
    { id:1, fromId:2, fromName:'Priya Sharma', fromAvatar:'👩‍💼', toId:1, toName:'Rajesh Kumar', text:'Hello Rajesh ji, I want to buy 5 quintals of wheat. Is the price negotiable?', time:'2026-08-22 10:30', read:false },
    { id:2, fromId:1, fromName:'Rajesh Kumar',  fromAvatar:'👨‍🌾', toId:2, toName:'Priya Sharma',  text:'Namaste Priya ji! Yes, for bulk order of 5+ quintals I can do ₹2,050/qtl. Quality is Grade A.', time:'2026-08-22 10:45', read:true },
    { id:3, fromId:2, fromName:'Priya Sharma', fromAvatar:'👩‍💼', toId:1, toName:'Rajesh Kumar', text:'That sounds good. Can you also arrange transport to Mumbai?', time:'2026-08-22 11:00', read:true },
    { id:4, fromId:1, fromName:'Rajesh Kumar',  fromAvatar:'👨‍🌾', toId:2, toName:'Priya Sharma',  text:'Yes, I work with a transport provider. Delivery in 3 days. Shall I confirm the order?', time:'2026-08-22 11:15', read:true },
    { id:5, fromId:6, fromName:'Kiran Desai',   fromAvatar:'🧑‍💼', toId:1, toName:'Rajesh Kumar', text:'Hi, I need 10 quintals of wheat. Do you have stock?', time:'2026-08-21 15:00', read:false },
    { id:6, fromId:3, fromName:'Mohan Singh',   fromAvatar:'🚚', toId:1, toName:'Rajesh Kumar', text:'Rajesh bhai, your delivery is done. Please confirm receipt on app.', time:'2026-08-21 09:00', read:true },
    { id:7, fromId:2, fromName:'Priya Sharma', fromAvatar:'👩‍💼', toId:1, toName:'Rajesh Kumar', text:'When will the onions be available? I need 100kg next week.', time:'2026-08-20 16:30', read:true },
  ];

  /* ── NOTIFICATIONS ──────────────────────── */
  const notifications = [
    { id:1, type:'offer',     icon:'🤝', title:'New Offer Received',    text:'Priya Sharma offered ₹2,050/qtl for 5 qtl Wheat',            time:'2h ago',  read:false, link:'offers.html' },
    { id:2, type:'order',     icon:'📦', title:'Order Confirmed',       text:'Order ORD-1003 confirmed by Anil Mehta',                       time:'4h ago',  read:false, link:'orders.html' },
    { id:3, type:'transport', icon:'🚚', title:'Transport Assigned',    text:'Mohan Singh assigned for Order ORD-1002',                      time:'6h ago',  read:true,  link:'transport.html' },
    { id:4, type:'review',    icon:'⭐', title:'New Review',            text:'Arjun Nair gave you 5 stars: "Excellent quality rice!"',       time:'1d ago',  read:true,  link:'profile.html' },
    { id:5, type:'payment',   icon:'💰', title:'Payment Received',      text:'₹10,500 received for Order ORD-1001',                          time:'2d ago',  read:true,  link:'orders.html' },
    { id:6, type:'offer',     icon:'🤝', title:'New Offer Received',    text:'Kiran Desai offered ₹2,000/qtl for 10 qtl Wheat',             time:'2d ago',  read:true,  link:'offers.html' },
    { id:7, type:'system',    icon:'🔔', title:'Verification Complete', text:'Your account has been verified. All features are now unlocked.','time':'5d ago',read:true,  link:'profile.html' },
  ];

  /* ── REVIEWS ────────────────────────────── */
  const reviews = [
    { id:1, fromName:'Priya Sharma',  fromAvatar:'👩‍💼', rating:5, text:'Excellent quality wheat! Delivered on time and packaging was great. Will buy again.', crop:'Wheat', date:'2026-08-21' },
    { id:2, fromName:'Arjun Nair',    fromAvatar:'🧑',  rating:5, text:'Best basmati rice I have sourced. Very aromatic and long grain. 100% organic as advertised.', crop:'Rice', date:'2026-08-14' },
    { id:3, fromName:'Kiran Desai',   fromAvatar:'🧑‍💼', rating:4, text:'Good quality but slight delay in delivery. Crop quality was as described.', crop:'Onion', date:'2026-08-12' },
    { id:4, fromName:'Meena Singh',   fromAvatar:'👩', rating:5, text:'Fresh tomatoes, great price, cooperative farmer. Highly recommended!', crop:'Tomato', date:'2026-08-08' },
    { id:5, fromName:'Ravi Kumar',    fromAvatar:'👨', rating:4, text:'Maize quality was good. Price slightly high but product was worth it.', crop:'Maize', date:'2026-08-01' },
  ];

  /* ── MARKET PRICES ──────────────────────── */
  const marketPrices = [
    { name:'Wheat',    emoji:'🌾', current:2100, prev:2034, unit:'qtl', region:'Punjab',      min:1900, max:2350 },
    { name:'Tomato',   emoji:'🍅', current:45,   prev:45.8, unit:'kg',  region:'Maharashtra', min:30,   max:70   },
    { name:'Onion',    emoji:'🧅', current:30,   prev:28.5, unit:'kg',  region:'Nashik',      min:18,   max:50   },
    { name:'Potato',   emoji:'🥔', current:22,   prev:22.2, unit:'kg',  region:'UP',          min:14,   max:35   },
    { name:'Maize',    emoji:'🌽', current:1800, prev:1762, unit:'qtl', region:'MP',          min:1600, max:2100 },
    { name:'Soybean',  emoji:'🌱', current:4500, prev:4295, unit:'qtl', region:'Rajasthan',   min:3800, max:5200 },
    { name:'Rice',     emoji:'🍚', current:3200, prev:3150, unit:'qtl', region:'WB',          min:2800, max:3800 },
    { name:'Chilli',   emoji:'🌶️', current:120,  prev:118,  unit:'kg',  region:'AP',          min:80,   max:180  },
    { name:'Groundnut',emoji:'🥜', current:5500, prev:5280, unit:'qtl', region:'Gujarat',     min:4500, max:6200 },
    { name:'Lentils',  emoji:'🫘', current:6000, prev:5940, unit:'qtl', region:'MP',          min:5200, max:7000 },
    { name:'Carrot',   emoji:'🥕', current:35,   prev:36,   unit:'kg',  region:'HP',          min:22,   max:55   },
    { name:'Banana',   emoji:'🍌', current:25,   prev:24.5, unit:'kg',  region:'Kerala',      min:18,   max:35   },
  ];

  /* ── API-LIKE GETTERS ───────────────────── */
  function getCrops(filters = {}) {
    let list = [...crops];
    if (filters.category) list = list.filter(c => c.category === filters.category);
    if (filters.state) list = list.filter(c => c.state === filters.state);
    if (filters.search) list = list.filter(c => c.name.toLowerCase().includes(filters.search.toLowerCase()) || c.farmer.toLowerCase().includes(filters.search.toLowerCase()));
    if (filters.maxPrice) list = list.filter(c => c.price <= filters.maxPrice);
    if (filters.farmerId) list = list.filter(c => c.farmerId === filters.farmerId);
    return list;
  }

  function getCrop(id) { return crops.find(c => c.id === id); }
  function getOrders(userId, role) {
    if (!userId) return orders;
    if (role === 'farmer') return orders.filter(o => o.farmerId === userId);
    if (role === 'buyer')  return orders.filter(o => o.buyerId  === userId);
    if (role === 'transport') return orders.filter(o => o.transportId === userId);
    return orders;
  }
  function getOffers(userId) { return offers.filter(o => o.toId === userId || o.fromId === userId); }
  function getTransportRequests() { return transportRequests; }
  function getMessages(userId) { return messages.filter(m => m.fromId === userId || m.toId === userId); }
  function getNotifications(userId) { return notifications; }
  function getReviews(userId) { return reviews; }
  function getMarketPrices() { return marketPrices; }

  /* ── STATUS HELPERS ─────────────────────── */
  function statusBadge(status) {
    const map = {
      delivered:  { label:'Delivered',   cls:'badge-green'  },
      in_transit: { label:'In Transit',  cls:'badge-yellow' },
      confirmed:  { label:'Confirmed',   cls:'badge-blue'   },
      pending:    { label:'Pending',     cls:'badge-yellow' },
      cancelled:  { label:'Cancelled',   cls:'badge-red'    },
      accepted:   { label:'Accepted',    cls:'badge-green'  },
      rejected:   { label:'Rejected',    cls:'badge-red'    },
      open:       { label:'Open',        cls:'badge-blue'   },
      assigned:   { label:'Assigned',    cls:'badge-green'  },
    };
    const s = map[status] || { label: status, cls: 'badge-yellow' };
    return `<span class="badge ${s.cls}">${s.label}</span>`;
  }

  function formatMoney(n) {
    return '₹' + Number(n).toLocaleString('en-IN');
  }

  return { getCrops, getCrop, getOrders, getOffers, getTransportRequests, getMessages, getNotifications, getReviews, getMarketPrices, statusBadge, formatMoney };
})();

window.FamData = FamData;
