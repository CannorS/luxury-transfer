/* ========================================
   LUXURY TRANSFER - Araç Verisi & Render
   ======================================== */

const vehicles = [
  {
    id: 'mercedes-s-class',
    name: 'Mercedes-Benz S-Class',
    class: 'executive',
    classLabel: 'Executive Sedan',
    passengers: 3,
    luggage: 3,
    amenities: ['Wi-Fi', 'Mini Bar', 'USB Şarj', 'Klima', 'Deri Koltuk', 'Ambient Aydınlatma'],
    description: 'Üst düzey konfor ve prestij arayanlar için. S-Class, İstanbul sokaklarında sessiz ve lüks bir yolculuk sunar.',
    pricing: {
      perKm: { basePrice: 2500, pricePerKm: 45, minKm: 30 },
      hourly: { pricePerHour: 3500, minHours: 3 }
    },
    featured: true
  },
  {
    id: 'bmw-7-series',
    name: 'BMW 7 Serisi',
    class: 'executive',
    classLabel: 'Executive Sedan',
    passengers: 3,
    luggage: 3,
    amenities: ['Wi-Fi', 'USB Şarj', 'Klima', 'Deri Koltuk', 'Isıtmalı Koltuk'],
    description: 'Sportif zarafet ve dinamik sürüş keyfi. BMW 7 Serisi ile her yolculuk ayrıcalıklı bir deneyime dönüşür.',
    pricing: {
      perKm: { basePrice: 2400, pricePerKm: 42, minKm: 30 },
      hourly: { pricePerHour: 3300, minHours: 3 }
    },
    featured: true
  },
  {
    id: 'mercedes-e-class',
    name: 'Mercedes-Benz E-Class',
    class: 'executive',
    classLabel: 'Business Sedan',
    passengers: 3,
    luggage: 2,
    amenities: ['Wi-Fi', 'USB Şarj', 'Klima', 'Deri Koltuk'],
    description: 'İş seyahatleri ve günlük transferler için ideal denge. Konfor ve şıklığı bir arada sunar.',
    pricing: {
      perKm: { basePrice: 1800, pricePerKm: 35, minKm: 30 },
      hourly: { pricePerHour: 2500, minHours: 3 }
    },
    featured: true
  },
  {
    id: 'mercedes-vito-vip',
    name: 'Mercedes Vito VIP',
    class: 'vip-van',
    classLabel: 'VIP Van',
    passengers: 6,
    luggage: 6,
    amenities: ['Wi-Fi', 'Mini Bar', 'USB Şarj', 'Klima', 'Deri Koltuk', 'TV Ekran', 'Geniş Bagaj'],
    description: 'Grup transferleri ve aile seyahatleri için mükemmel. VIP donanımlı geniş iç mekan ile konforlu yolculuk.',
    pricing: {
      perKm: { basePrice: 3000, pricePerKm: 55, minKm: 30 },
      hourly: { pricePerHour: 4000, minHours: 3 }
    },
    featured: false
  },
  {
    id: 'mercedes-sprinter-vip',
    name: 'Mercedes Sprinter VIP',
    class: 'sprinter',
    classLabel: 'VIP Sprinter',
    passengers: 12,
    luggage: 12,
    amenities: ['Wi-Fi', 'Mini Bar', 'USB Şarj', 'Klima', 'Deri Koltuk', 'TV Ekran', 'Buzdolabı', 'Geniş Bagaj'],
    description: 'Büyük gruplar ve kurumsal etkinlikler için tasarlanmış premium Sprinter. Geniş alan, üstün konfor.',
    pricing: {
      perKm: { basePrice: 4000, pricePerKm: 70, minKm: 30 },
      hourly: { pricePerHour: 5500, minHours: 3 }
    },
    featured: false
  }
];

/* Vehicle SVG placeholder by class */
function getVehiclePlaceholder(cls) {
  const colors = {
    executive: { bg: '#1a2332', accent: '#5B9BD5' },
    'vip-van': { bg: '#1a2318', accent: '#C9A84C' },
    sprinter: { bg: '#1a1a2e', accent: '#7BC67E' }
  };
  const c = colors[cls] || colors.executive;
  return `<div class="vehicle-card__image" style="background:linear-gradient(135deg, ${c.bg}, #111)">
    <svg width="80" height="40" viewBox="0 0 80 40" fill="none">
      <rect x="5" y="15" width="55" height="18" rx="4" fill="${c.accent}" opacity="0.3"/>
      <rect x="10" y="10" width="35" height="15" rx="3" fill="${c.accent}" opacity="0.2"/>
      <circle cx="20" cy="35" r="5" fill="${c.accent}" opacity="0.5"/>
      <circle cx="50" cy="35" r="5" fill="${c.accent}" opacity="0.5"/>
    </svg>
  </div>`;
}

/* Render single vehicle card */
function renderVehicleCard(v, showBookBtn = true) {
  const badgeClass = v.class === 'vip-van' ? 'vip' : v.class === 'sprinter' ? 'sprinter' : 'executive';
  return `
    <div class="vehicle-card" data-id="${v.id}" data-class="${v.class}" data-passengers="${v.passengers}">
      <div class="vehicle-card__image-wrap">
        ${getVehiclePlaceholder(v.class)}
        <span class="vehicle-card__badge badge badge--${badgeClass}">${v.classLabel}</span>
      </div>
      <div class="vehicle-card__body">
        <h3 class="vehicle-card__name">${v.name}</h3>
        <div class="vehicle-card__class">${v.classLabel}</div>
        <div class="vehicle-card__specs">
          <span class="vehicle-card__spec">
            <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            ${v.passengers} Yolcu
          </span>
          <span class="vehicle-card__spec">
            <svg viewBox="0 0 24 24"><path d="M17 6h-2V3H9v3H7c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2 0 .55.45 1 1 1s1-.45 1-1h6c0 .55.45 1 1 1s1-.45 1-1c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM11 5h2v1h-2V5z"/></svg>
            ${v.luggage} Bagaj
          </span>
        </div>
        <div class="vehicle-card__amenities">
          ${v.amenities.slice(0, 4).map(a => `<span class="vehicle-card__amenity">${a}</span>`).join('')}
          ${v.amenities.length > 4 ? `<span class="vehicle-card__amenity">+${v.amenities.length - 4}</span>` : ''}
        </div>
        <div class="vehicle-card__footer">
          <div class="vehicle-card__price">
            Başlangıç
            <strong>${v.pricing.perKm.basePrice.toLocaleString('tr-TR')} ₺</strong>
          </div>
          ${showBookBtn
            ? `<a href="rezervasyon.html?vehicle=${v.id}" class="btn btn--primary btn--sm">Rezervasyon</a>`
            : `<button class="btn btn--primary btn--sm" onclick="openVehicleModal('${v.id}')">Detay</button>`
          }
        </div>
      </div>
    </div>`;
}

/* Render featured vehicles on home page */
function renderFeaturedVehicles() {
  const container = document.getElementById('featured-vehicles');
  if (!container) return;
  const featured = vehicles.filter(v => v.featured);
  container.innerHTML = featured.map(v => renderVehicleCard(v)).join('');
}

/* Render all vehicles on fleet page */
function renderVehicleGrid(filterClass, filterPassengers) {
  const container = document.getElementById('vehicle-grid');
  if (!container) return;

  let filtered = [...vehicles];

  if (filterClass && filterClass !== 'all') {
    filtered = filtered.filter(v => v.class === filterClass);
  }

  if (filterPassengers) {
    const min = parseInt(filterPassengers);
    filtered = filtered.filter(v => v.passengers >= min);
  }

  if (filtered.length === 0) {
    container.innerHTML = '<p class="text-center" style="grid-column:1/-1;padding:3rem;color:#666;">Seçilen kriterlere uygun araç bulunamadı.</p>';
    return;
  }

  container.innerHTML = filtered.map(v => renderVehicleCard(v, false)).join('');
}

/* Vehicle detail modal */
function openVehicleModal(id) {
  const v = vehicles.find(veh => veh.id === id);
  if (!v) return;

  const modal = document.getElementById('vehicle-modal');
  if (!modal) return;

  modal.querySelector('.modal__image-placeholder').innerHTML = getVehiclePlaceholder(v.class).replace('vehicle-card__image', 'modal__image');
  modal.querySelector('.modal__title').textContent = v.name;
  modal.querySelector('.modal__class').textContent = v.classLabel;
  modal.querySelector('.modal__description').textContent = v.description;
  modal.querySelector('.modal__amenities').innerHTML = v.amenities.map(a => `<span class="modal__amenity">${a}</span>`).join('');
  modal.querySelector('.modal__pricing').innerHTML = `
    <div class="modal__pricing-row"><span class="modal__pricing-label">KM Başına</span><span class="modal__pricing-value">${v.pricing.perKm.pricePerKm} ₺/km</span></div>
    <div class="modal__pricing-row"><span class="modal__pricing-label">Minimum Ücret</span><span class="modal__pricing-value">${v.pricing.perKm.basePrice.toLocaleString('tr-TR')} ₺</span></div>
    <div class="modal__pricing-row"><span class="modal__pricing-label">Saatlik</span><span class="modal__pricing-value">${v.pricing.hourly.pricePerHour.toLocaleString('tr-TR')} ₺/saat</span></div>
    <div class="modal__pricing-row"><span class="modal__pricing-label">Minimum Süre</span><span class="modal__pricing-value">${v.pricing.hourly.minHours} saat</span></div>
  `;
  modal.querySelector('.modal__book-btn').href = `rezervasyon.html?vehicle=${v.id}`;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeVehicleModal() {
  const modal = document.getElementById('vehicle-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/* Init fleet page filters */
function initFleetFilters() {
  const classFilter = document.getElementById('filter-class');
  const passFilter = document.getElementById('filter-passengers');
  if (!classFilter || !passFilter) return;

  function applyFilters() {
    renderVehicleGrid(classFilter.value, passFilter.value);
  }

  classFilter.addEventListener('change', applyFilters);
  passFilter.addEventListener('change', applyFilters);
}

/* Init */
document.addEventListener('DOMContentLoaded', () => {
  renderFeaturedVehicles();
  renderVehicleGrid();
  initFleetFilters();
});
