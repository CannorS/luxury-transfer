/* ========================================
   LUXURY TRANSFER - Araç Verisi & Render
   ======================================== */

const vehicles = [
  {
    id: 'mercedes-maybach',
    name: 'Mercedes-Benz Maybach Ultra Lux',
    class: 'executive',
    classLabel: 'Ultra Lüks',
    passengers: 4,
    luggage: 4,
    amenities: ['Wi-Fi', 'Mini Bar', 'USB Şarj', 'Klima', 'Masaj Koltuk', 'Ambient Aydınlatma', 'TV Ekran', 'Buzdolabı'],
    description: 'Eşsiz lüks ve konforun zirvesi. Maybach ile her yolculuk birinci sınıf bir deneyime dönüşür.',
    image: 'https://www.luxuryairportshuttle.com/wp-content/uploads/2026/02/Mercedes-Vito-Maybach-Ultra-Lux-1-1024x683.webp',
    localImage: 'images/vehicles/Araçlar/Mercedes-Benz Vito Maybach Ultra Lux.webp',
    pricing: {
      perKm: { pricePerKm: 1.20, minKm: 30, minPrice: 100 },
      hourly: { pricePerHour: 22, minHours: 3 }
    },
    featured: true
  },
  {
    id: 'mercedes-vip-sprinter',
    name: 'Mercedes-Benz VIP Sprinter',
    class: 'sprinter',
    classLabel: 'VIP Sprinter',
    passengers: 12,
    luggage: 12,
    amenities: ['Wi-Fi', 'Mini Bar', 'USB Şarj', 'Klima', 'Deri Koltuk', 'TV Ekran', 'Buzdolabı', 'Geniş Bagaj'],
    description: 'Büyük gruplar ve kurumsal etkinlikler için tasarlanmış premium Sprinter. Geniş alan, üstün konfor.',
    image: 'https://www.luxuryairportshuttle.com/wp-content/uploads/2026/02/Mercedes-VIP-Sprinter-Van-1-1024x683.webp',
    localImage: 'images/vehicles/Araçlar/Mercedes-Benz VIP Sprinter.webp',
    pricing: {
      perKm: { pricePerKm: 1.60, minKm: 30, minPrice: 150 },
      hourly: { pricePerHour: 38, minHours: 3 }
    },
    featured: false
  },
  {
    id: 'bmw-7-series',
    name: 'BMW 7 Series',
    class: 'executive',
    classLabel: 'Lüks Sedan',
    passengers: 2,
    luggage: 2,
    amenities: ['Wi-Fi', 'USB Şarj', 'Klima', 'Deri Koltuk', 'Isıtmalı Koltuk'],
    description: 'Sportif zarafet ve dinamik sürüş keyfi. BMW 7 Serisi ile her yolculuk ayrıcalıklı bir deneyime dönüşür.',
    image: 'https://www.luxuryairportshuttle.com/wp-content/uploads/2026/02/BMW-7-Series-1-1024x683.webp',
    localImage: 'images/vehicles/Araçlar/BMW-7-Series.webp',
    pricing: {
      perKm: { pricePerKm: 5.25, minKm: 30, minPrice: 130 },
      hourly: { pricePerHour: 65, minHours: 3 }
    },
    hourlyReserved: true,
    transferMinDays: 3,
    featured: true
  },
  {
    id: 'mercedes-s-class',
    name: 'Mercedes-Benz S-Class',
    class: 'executive',
    classLabel: 'Lüks Sedan',
    passengers: 2,
    luggage: 2,
    amenities: ['Wi-Fi', 'Mini Bar', 'USB Şarj', 'Klima', 'Deri Koltuk', 'Ambient Aydınlatma'],
    description: 'Üst düzey konfor ve prestij arayanlar için. S-Class, İstanbul sokaklarında sessiz ve lüks bir yolculuk sunar.',
    image: 'https://www.luxuryairportshuttle.com/wp-content/uploads/2026/02/Standard-Sedan-Car-1-1024x683.webp',
    localImage: 'images/vehicles/Araçlar/Mercedes-S-Class-Car.webp',
    pricing: {
      perKm: { pricePerKm: 5.25, minKm: 30, minPrice: 130 },
      hourly: { pricePerHour: 69, minHours: 3 }
    },
    hourlyReserved: true,
    transferMinDays: 3,
    featured: true
  },
  {
    id: 'mercedes-vip-vito',
    name: 'Mercedes-Benz VIP Vito',
    class: 'vip-van',
    classLabel: 'VIP Van',
    passengers: 6,
    luggage: 6,
    amenities: ['Wi-Fi', 'Mini Bar', 'USB Şarj', 'Klima', 'Deri Koltuk', 'TV Ekran', 'Geniş Bagaj'],
    description: 'VIP donanımlı geniş iç mekan ile konforlu yolculuk. Grup transferleri ve aile seyahatleri için mükemmel.',
    image: 'https://www.luxuryairportshuttle.com/wp-content/uploads/2026/02/Mercedes-Standard-Vito-Van-1-1024x683.webp',
    localImage: 'images/vehicles/Araçlar/Mercedes-Benz Vip Vito.webp',
    pricing: {
      perKm: { pricePerKm: 1.08, minKm: 30, minPrice: 90 },
      hourly: { pricePerHour: 18, minHours: 3 }
    },
    featured: false
  },
  {
    id: 'mercedes-std-sprinter',
    name: 'Mercedes-Benz Std. Sprinter',
    class: 'sprinter',
    classLabel: 'Standart Sprinter',
    passengers: 16,
    luggage: 16,
    amenities: ['USB Şarj', 'Klima', 'Geniş Bagaj'],
    description: 'Kalabalık gruplar için ekonomik ve geniş standart Sprinter. Pratik ve konforlu ulaşım çözümü.',
    image: 'https://www.luxuryairportshuttle.com/wp-content/uploads/2026/02/Mercedes-Standard-Sprinter-Van-1-1024x683.webp',
    localImage: 'images/vehicles/Araçlar/Mercedes-Benz Standart-Sprinter.webp',
    pricing: {
      perKm: { pricePerKm: 1.30, minKm: 30, minPrice: 130 },
      hourly: { pricePerHour: 28, minHours: 3 }
    },
    featured: false
  },
  {
    id: 'mercedes-std-vito',
    name: 'Mercedes-Benz/VW Standard Vito',
    class: 'vip-van',
    classLabel: 'Standart Van',
    passengers: 7,
    luggage: 7,
    amenities: ['USB Şarj', 'Klima', 'Geniş Bagaj'],
    description: 'Ekonomik ve ferah grup transferleri için ideal standart van seçeneği. Konfor ve pratikliği bir arada sunar.',
    image: 'https://www.luxuryairportshuttle.com/wp-content/uploads/2026/02/Volkswagen-Standard-Vito-Van-1-1024x683.webp',
    localImage: 'images/vehicles/Araçlar/Mercedes-Benz Standart Vito.webp',
    pricing: {
      perKm: { pricePerKm: 0.95, minKm: 30, minPrice: 80 },
      hourly: { pricePerHour: 16, minHours: 3 }
    },
    featured: false
  },
  {
    id: 'standard-sedan',
    name: 'Standard Sedan',
    class: 'executive',
    classLabel: 'Standart Sedan',
    passengers: 2,
    luggage: 2,
    amenities: ['Klima', 'USB Şarj'],
    description: 'Ekonomik ve konforlu şehir içi transferler için ideal standart sedan seçeneği.',
    image: 'https://www.luxuryairportshuttle.com/wp-content/uploads/2026/02/Standard-Sedan-Car-1-1024x683.webp',
    localImage: 'images/vehicles/Araçlar/Standard-Sedan-Car.webp',
    pricing: {
      perKm: { pricePerKm: 0.80, minKm: 30, minPrice: 70 },
      hourly: { pricePerHour: 40, minHours: 3 }
    },
    hourlyReserved: true,
    transferAlwaysReserved: true,
    featured: false
  }
];

/* Vehicle image map — localImage for booking/fleet pages */
const vehicleImages = {};
vehicles.forEach(v => { vehicleImages[v.id] = v.localImage || v.image; });

/* Render fleet card for home page */
function renderFleetCard(v) {
  return `
    <div class="fleet-card">
      <h4 class="fleet-card__name">${v.name}</h4>
      <p class="fleet-card__desc">${v.classLabel} · ${v.passengers} Yolcu · ${v.luggage} Bagaj</p>
      <div class="fleet-card__image">
        <img src="${v.image}" alt="${v.name}" draggable="false">
      </div>
      <div class="fleet-card__specs">
        <span class="fleet-card__spec">
          <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          ${v.passengers} Yolcu
        </span>
        <span class="fleet-card__spec">
          <svg viewBox="0 0 24 24"><path d="M17 6h-2V3H9v3H7c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2 0 .55.45 1 1 1s1-.45 1-1h6c0 .55.45 1 1 1s1-.45 1-1c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM11 5h2v1h-2V5z"/></svg>
          ${v.luggage} Bagaj
        </span>
      </div>
    </div>`;
}

function renderFeaturedVehicles() {
  const container = document.getElementById('featured-vehicles');
  if (!container) return;
  container.innerHTML = vehicles.map(v => renderFleetCard(v)).join('');
  initFleetDrag();
}

/* Drag to scroll */
function initFleetDrag() {
  const slider = document.getElementById('fleet-slider');
  const track = document.getElementById('featured-vehicles');
  if (!slider || !track) return;

  let isDragging = false;
  let startX = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;

  function getMaxTranslate() {
    return -(track.scrollWidth - slider.offsetWidth);
  }

  function clamp(val) {
    return Math.max(getMaxTranslate(), Math.min(0, val));
  }

  function setPosition(px) {
    track.style.transform = `translateX(${px}px)`;
  }

  slider.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    slider.classList.add('dragging');
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const diff = e.clientX - startX;
    currentTranslate = clamp(prevTranslate + diff);
    setPosition(currentTranslate);
  });

  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    slider.classList.remove('dragging');
    prevTranslate = currentTranslate;
  });

  slider.addEventListener('touchstart', (e) => {
    isDragging = true;
    startX = e.touches[0].clientX;
    slider.classList.add('dragging');
  }, { passive: true });

  slider.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const diff = e.touches[0].clientX - startX;
    currentTranslate = clamp(prevTranslate + diff);
    setPosition(currentTranslate);
  }, { passive: true });

  slider.addEventListener('touchend', () => {
    isDragging = false;
    slider.classList.remove('dragging');
    prevTranslate = currentTranslate;
  });

  window.addEventListener('resize', () => {
    currentTranslate = clamp(currentTranslate);
    prevTranslate = currentTranslate;
    setPosition(currentTranslate);
  });
}

/* Init */
document.addEventListener('DOMContentLoaded', () => {
  renderFeaturedVehicles();
});
