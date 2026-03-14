/* ========================================
   LUXURY TRANSFER - Rezervasyon Sayfası
   ======================================== */

/* vehicleImages is defined in vehicles.js (loaded before this file) */

/* Fiyatlar EUR bazlı saklanır, gösterim varsayılan TRY */
/* Kurlar exchange-rates.json'dan yüklenir, fallback sabit değerler */
const currencyConfig = {
  EUR: { symbol: '€', rate: 1, locale: 'de-DE' },
  TRY: { symbol: '₺', rate: 50.543, locale: 'tr-TR' },
  USD: { symbol: '$', rate: 1.1461, locale: 'en-US' }
};
let selectedCurrency = 'TRY';
let ratesLastUpdate = null;

/* TCMB kurlarını exchange-rates.json'dan yükle */
function loadExchangeRates() {
  fetch('js/exchange-rates.json?t=' + Date.now())
    .then(res => { if (!res.ok) throw new Error(res.status); return res.json(); })
    .then(data => {
      if (data.rates) {
        if (data.rates.TRY) currencyConfig.TRY.rate = data.rates.TRY;
        if (data.rates.USD) currencyConfig.USD.rate = data.rates.USD;
        ratesLastUpdate = data.lastUpdate || null;
        // Fiyatları güncelle
        renderVehicleList();
        if (bookingParams.vehicle) updateSummaryWithVehicle(bookingParams.vehicle);
      }
    })
    .catch(() => { /* fallback kurlar kullanılır */ });
}
loadExchangeRates();

function convertPrice(priceEUR) {
  const cfg = currencyConfig[selectedCurrency];
  return Math.round(priceEUR * cfg.rate * 100) / 100;
}

function formatPrice(priceEUR) {
  const cfg = currencyConfig[selectedCurrency];
  const converted = convertPrice(priceEUR);
  if (selectedCurrency === 'TRY') {
    return converted.toLocaleString('tr-TR') + ' ' + cfg.symbol;
  }
  return converted.toLocaleString(cfg.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + cfg.symbol;
}

function changeCurrency() {
  selectedCurrency = document.getElementById('filter-currency')?.value || 'TRY';
  renderVehicleList();
  if (bookingParams.vehicle) {
    updateSummaryWithVehicle(bookingParams.vehicle);
  }
}

const bookingParams = {};

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('bp-vehicles')) return;

  // Read URL params from hero form
  const params = new URLSearchParams(window.location.search);
  bookingParams.from = params.get('from') || '';
  bookingParams.to = params.get('to') || '';
  bookingParams.date = params.get('date') || '';
  bookingParams.time = params.get('time') || '';
  bookingParams.returnDate = params.get('return_date') || '';
  bookingParams.returnTime = params.get('return_time') || '';
  bookingParams.pax = parseInt(params.get('pax')) || 1;
  bookingParams.service = params.get('service') || 'transfer';
  bookingParams.roundtrip = params.get('roundtrip') === '1';
  bookingParams.hours = parseInt(params.get('hours')) || 0;
  bookingParams.vehicle = params.get('vehicle') || null;
  bookingParams.distanceKm = null;
  bookingParams.duration = null;

  renderVehicleList();
  renderSummary();

  // Mesafe hesapla
  if (bookingParams.from && bookingParams.to) {
    calculateDistance(bookingParams.from, bookingParams.to);
  }
});

/* --- Feature Icon SVGs --- */
const featureIcons = {
  sabitFiyat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>',
  karsilama: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>',
  iptal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  ucusTakip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>'
};

/* --- Araç müsaitlik kontrolü --- */
function isVehicleReserved(vehicle, isHourly) {
  // Saatlik modda: hourlyReserved flag'i olan araçlar rezerve
  if (isHourly) return !!vehicle.hourlyReserved;

  // Transfer (KM bazlı) modda:
  // Standard Sedan her zaman dolu
  if (vehicle.transferAlwaysReserved) return true;

  // BMW 7 ve S-Class: seçilen tarih bugünden 3 günden az ilerideyse dolu
  if (vehicle.transferMinDays && bookingParams.date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(bookingParams.date + 'T00:00:00');
    const diffMs = selected - today;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < vehicle.transferMinDays) return true;
  }

  return false;
}

/* --- Render Vehicle Cards --- */
function applyFilters() {
  renderVehicleList();
}

function renderVehicleList() {
  const container = document.getElementById('bp-vehicles');
  if (!container) return;

  const isHourlyMode = bookingParams.service === 'hourly';

  // Filtre değerlerini oku
  const filterPax = parseInt(document.getElementById('filter-pax')?.value || '0');
  const filterLuggage = parseInt(document.getElementById('filter-luggage')?.value || '0');
  const filterSort = document.getElementById('filter-sort')?.value || 'asc';

  // Filtrele
  let filtered = vehicles.filter(v => {
    if (filterPax > 0 && v.passengers < filterPax) return false;
    if (filterLuggage > 0 && v.luggage < filterLuggage) return false;
    return true;
  });

  // Sırala: rezerve olanlar sona, sonra fiyata göre
  const sorted = [...filtered].sort((a, b) => {
    const aRes = isVehicleReserved(a, isHourlyMode) ? 1 : 0;
    const bRes = isVehicleReserved(b, isHourlyMode) ? 1 : 0;
    if (aRes !== bRes) return aRes - bRes;
    const aPrice = calculateVehiclePrice(a);
    const bPrice = calculateVehiclePrice(b);
    return filterSort === 'asc' ? aPrice - bPrice : bPrice - aPrice;
  });

  const isHourly = bookingParams.service === 'hourly';

  if (sorted.length === 0) {
    container.innerHTML = '<div class="bp-no-results"><p>Seçilen filtrelere uygun araç bulunamadı.</p></div>';
    return;
  }

  container.innerHTML = sorted.map(v => {
    const isReserved = isVehicleReserved(v, isHourly);
    const price = isReserved ? 0 : calculateVehiclePrice(v);
    const isSelected = bookingParams.vehicle === v.id;
    const img = vehicleImages[v.id] || v.image || '';

    return `
    <div class="bp-vehicle-card ${isSelected ? 'selected' : ''} ${isReserved ? 'bp-vehicle-card--reserved' : ''}" id="vc-${v.id}">
      <div class="bp-vehicle-card__image">
        <img src="${img}" alt="${v.name}" loading="lazy">
        ${isReserved ? '<div class="bp-vehicle-card__reserved-overlay"><span>Rezerve</span></div>' : ''}
      </div>
      <div class="bp-vehicle-card__info">
        <!-- Üst: İsim + Kapasite -->
        <div class="bp-vehicle-card__header">
          <div>
            <h3 class="bp-vehicle-card__name">${v.name}</h3>
            <span class="bp-vehicle-card__class">${v.classLabel}</span>
          </div>
          <div class="bp-vehicle-card__capacity">
            <span class="bp-vehicle-card__cap-item">
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              1-${v.passengers} Kişi
            </span>
            <span class="bp-vehicle-card__cap-item">
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M17 6h-2V3H9v3H7c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2 0 .55.45 1 1 1s1-.45 1-1h6c0 .55.45 1 1 1s1-.45 1-1c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM11 5h2v1h-2V5z"/></svg>
              1-${v.luggage} Bagaj
            </span>
          </div>
        </div>

        <!-- Orta: 4 Özellik -->
        <div class="bp-vehicle-card__features">
          <div class="bp-vehicle-card__feature">
            <div class="bp-vehicle-card__feature-icon">${featureIcons.sabitFiyat}</div>
            <span>Sabit<br>Fiyat</span>
          </div>
          <div class="bp-vehicle-card__feature">
            <div class="bp-vehicle-card__feature-icon">${featureIcons.karsilama}</div>
            <span>Havalimanı<br>Karşılama</span>
          </div>
          <div class="bp-vehicle-card__feature">
            <div class="bp-vehicle-card__feature-icon">${featureIcons.iptal}</div>
            <span>Ücretsiz<br>İptal</span>
          </div>
          <div class="bp-vehicle-card__feature">
            <div class="bp-vehicle-card__feature-icon">${featureIcons.ucusTakip}</div>
            <span>Uçuş<br>Takibi</span>
          </div>
        </div>

        ${isReserved
          ? '<p class="bp-vehicle-card__note bp-vehicle-card__note--reserved">Bu araç şu anda müsait değildir. Lütfen başka bir araç seçiniz.</p>'
          : '<p class="bp-vehicle-card__note">Lütfen rezervasyon yaparak detayları gözden geçirin.</p>'
        }

        <!-- Alt: Fiyat + Roundtrip notu + Buton -->
        <div class="bp-vehicle-card__bottom">
          ${isReserved ? `
          <div class="bp-vehicle-card__price-area">
            <span class="bp-vehicle-card__reserved-text">Müsait Değil</span>
          </div>
          <button class="bp-vehicle-card__book-btn bp-vehicle-card__book-btn--disabled" disabled>
            Rezerve Edildi
          </button>
          ` : `
          <div class="bp-vehicle-card__price-area">
            ${bookingParams.roundtrip ? '<span class="bp-vehicle-card__roundtrip-badge">Gidiş dönüş toplam araç fiyatları</span>' : ''}
            <div class="bp-vehicle-card__price-row">
              <span class="bp-vehicle-card__price">${formatPrice(price)}</span>
            </div>
          </div>
          <button class="bp-vehicle-card__book-btn" onclick="selectBookingVehicle('${v.id}')">
            Rezervasyon Yap
          </button>
          `}
        </div>
      </div>
    </div>`;
  }).join('');
}

/* --- Calculate Price --- */
function calculateVehiclePrice(vehicle) {
  // Hesaplanmış km varsa onu kullan
  const km = bookingParams.calculatedKm || bookingParams.distanceKm;
  if (km && bookingParams.service !== 'hourly') {
    return calculateVehiclePriceWithKm(vehicle, km);
  }

  let price = 0;
  const isRoundtrip = bookingParams.roundtrip;

  if (bookingParams.service === 'hourly') {
    const hours = Math.max(vehicle.pricing.hourly.minHours, bookingParams.hours || vehicle.pricing.hourly.minHours);
    price = hours * vehicle.pricing.hourly.pricePerHour;
    if (isRoundtrip) price *= 2;
  } else {
    const km = vehicle.pricing.perKm.minKm;
    const totalKm = isRoundtrip ? km * 2 : km;
    const kmPrice = totalKm * vehicle.pricing.perKm.pricePerKm;
    const minPrice = vehicle.pricing.perKm.minPrice || 0;
    const effectiveMin = isRoundtrip ? minPrice * 2 : minPrice;
    price = (minPrice > 0 && kmPrice < effectiveMin) ? effectiveMin : kmPrice;
  }

  // Night surcharge
  if (bookingParams.time) {
    const hour = parseInt(bookingParams.time.split(':')[0]);
    if (hour >= 22 || hour < 6) {
      price = Math.round(price * 1.2);
    }
  }

  return Math.round(price);
}

/* --- Render Summary Sidebar --- */
function renderSummary() {
  const body = document.getElementById('bp-summary-body');
  if (!body) return;

  const rows = [];

  // Nereden
  rows.push(summaryRow('location', 'NEREDEN', bookingParams.from || 'Belirtilmedi'));

  // Nereye
  rows.push(summaryRow('location', 'NEREYE', bookingParams.to || 'Belirtilmedi'));

  // Gidiş Tarihi + Saat
  if (bookingParams.date) {
    let gidisLabel = formatDateTR(bookingParams.date);
    if (bookingParams.time) gidisLabel += ' - ' + bookingParams.time;
    rows.push(summaryRow('calendar', 'GİDİŞ TARİHİ', gidisLabel));
  } else {
    rows.push(summaryRow('calendar', 'GİDİŞ TARİHİ', 'Belirtilmedi'));
  }

  // Dönüş Tarihi (sadece gidiş-dönüş ise)
  if (bookingParams.roundtrip) {
    if (bookingParams.returnDate) {
      let donusLabel = formatDateTR(bookingParams.returnDate);
      if (bookingParams.returnTime) donusLabel += ' - ' + bookingParams.returnTime;
      rows.push(summaryRow('calendar', 'DÖNÜŞ TARİHİ', donusLabel));
    } else {
      rows.push(summaryRow('calendar', 'DÖNÜŞ TARİHİ', 'Belirtilmedi'));
    }
  }

  // Mesafe
  if (bookingParams.distanceKm) {
    const totalKm = Math.round(bookingParams.distanceKm * 2 * 10) / 10;
    const kmText = bookingParams.roundtrip
      ? bookingParams.distanceKm + ' KM (tek yön) / ' + totalKm + ' KM (toplam)'
      : bookingParams.distanceKm + ' KM';
    rows.push(summaryRow('distance', 'MESAFE', kmText));
  } else if (bookingParams.from && bookingParams.to) {
    rows.push(summaryRow('distance', 'MESAFE', '<span id="distance-loading">Hesaplanıyor...</span>'));
  }

  // Tahmini Süre (sadece transfer modunda)
  if (bookingParams.duration && bookingParams.service !== 'hourly') {
    rows.push(summaryRow('clock', 'TAHMİNİ SÜRE', bookingParams.duration));
  }

  // Kişi Sayısı
  rows.push(summaryRow('users', 'KİŞİ SAYISI', bookingParams.pax || 1));

  // Süre (saatlik modda)
  if (bookingParams.service === 'hourly' && bookingParams.hours) {
    rows.push(summaryRow('clock', 'SÜRE', bookingParams.hours + ' Saat'));
  }

  // Gidiş - Dönüş Durumu (sadece transfer modunda)
  if (bookingParams.service !== 'hourly') {
    rows.push(summaryRow('repeat', 'GİDİŞ - DÖNÜŞ', bookingParams.roundtrip ? 'EVET' : 'HAYIR'));
  }

  body.innerHTML = rows.join('');
}

function formatDateTR(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  return parts[2] + '/' + parts[1] + '/' + parts[0];
}

function summaryRow(icon, label, value) {
  const icons = {
    location: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="10" r="3"/><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
    repeat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>',
    service: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
    distance: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18"/><path d="M8 6h10v10"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'
  };

  return `
    <div class="bp-summary__row">
      <div class="bp-summary__icon">${icons[icon] || ''}</div>
      <div class="bp-summary__row-content">
        <div class="bp-summary__label">${label}</div>
        <div class="bp-summary__value">${value}</div>
      </div>
    </div>`;
}

/* --- Ek Hizmetler --- */
let extrasState = {
  childSeatCount: 0,
  meetGreet: false
};

const CHILD_SEAT_PRICE = 5;   // EUR
const MEET_GREET_PRICE = 2;   // EUR

function getExtrasTotal() {
  let total = 0;
  total += extrasState.childSeatCount * CHILD_SEAT_PRICE;
  if (extrasState.meetGreet) total += MEET_GREET_PRICE;
  return total;
}

function changeChildSeat(delta) {
  extrasState.childSeatCount = Math.max(0, extrasState.childSeatCount + delta);
  document.getElementById('child-seat-qty').textContent = extrasState.childSeatCount;
  updateExtrasTotal();
}

function updateExtrasTotal() {
  const toggle = document.getElementById('meet-greet-toggle');
  if (toggle) extrasState.meetGreet = toggle.checked;
  const total = getExtrasTotal();
  const display = document.getElementById('extras-total-display');
  if (display) display.textContent = formatPrice(total);
}

function openExtras() {
  const overlay = document.getElementById('extras-overlay');
  if (overlay) {
    // Fiyat etiketlerini seçili para birimine göre güncelle
    const csLabel = document.getElementById('child-seat-price-label');
    if (csLabel) csLabel.textContent = '+' + formatPrice(CHILD_SEAT_PRICE) + ' / adet';
    const mgLabel = document.getElementById('meet-greet-price-label');
    if (mgLabel) mgLabel.textContent = '+' + formatPrice(MEET_GREET_PRICE);

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeExtras();
    });
  }
}

function closeExtras() {
  const overlay = document.getElementById('extras-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function confirmExtras() {
  closeExtras();
  updateSummaryWithVehicle(bookingParams.vehicle);
  openCustomerForm();
}

/* --- Müşteri Bilgi Formu --- */
function openCustomerForm() {
  const overlay = document.getElementById('customer-overlay');
  if (!overlay) return;

  // Formu dinamik oluştur
  buildCustomerForm();

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeCustomerForm();
  });
}

function buildCustomerForm() {
  const container = document.getElementById('customer-form-content');
  if (!container) return;

  const pax = bookingParams.pax || 1;
  let html = '';

  // 1. Yolcu (her zaman gösterilir)
  html += `
    <div class="customer-form__section">
      <div class="customer-form__section-title">Rezervasyon Sahibi</div>
      <div class="customer-form__group">
        <label class="customer-form__label">Ad Soyad *</label>
        <input type="text" class="customer-form__input" id="pax-name-0" placeholder="Adınız ve soyadınız">
      </div>
      <div class="customer-form__row">
        <div class="customer-form__group customer-form__group--half">
          <label class="customer-form__label">Telefon *</label>
          <input type="tel" class="customer-form__input" id="pax-phone-0" placeholder="+90 5XX XXX XX XX">
        </div>
        <div class="customer-form__group customer-form__group--half">
          <label class="customer-form__label">Uçuş Numarası *</label>
          <input type="text" class="customer-form__input" id="pax-flight-0" placeholder="TK 1234">
        </div>
      </div>
      <div class="customer-form__group">
        <label class="customer-form__label">E-posta *</label>
        <input type="email" class="customer-form__input" id="pax-email-0" placeholder="ornek@email.com">
      </div>
    </div>`;

  // Ek yolcular (2. kişiden itibaren)
  for (let i = 1; i < pax; i++) {
    html += `
    <div class="customer-form__section">
      <div class="customer-form__section-title">${i + 1}. Yolcu</div>
      <div class="customer-form__group">
        <label class="customer-form__label">Ad Soyad *</label>
        <input type="text" class="customer-form__input" id="pax-name-${i}" placeholder="${i + 1}. yolcunun adı soyadı">
      </div>
      <div class="customer-form__row">
        <div class="customer-form__group customer-form__group--half">
          <label class="customer-form__label">Telefon *</label>
          <input type="tel" class="customer-form__input" id="pax-phone-${i}" placeholder="+90 5XX XXX XX XX">
        </div>
        <div class="customer-form__group customer-form__group--half">
          <label class="customer-form__label">Uçuş Numarası *</label>
          <input type="text" class="customer-form__input" id="pax-flight-${i}" placeholder="TK 1234">
        </div>
      </div>
    </div>`;
  }

  // Ödeme Yöntemi
  html += `
    <div class="customer-form__section">
      <div class="customer-form__section-title">Ödeme Yöntemi *</div>
      <div class="customer-form__payment-options" id="payment-options">
        <label class="customer-form__payment-option" id="payment-card-label">
          <input type="radio" name="payment-method" value="card" id="payment-card">
          <div class="customer-form__payment-box">
            <span class="customer-form__payment-icon">💳</span>
            <span class="customer-form__payment-text">Araçta Kredi Kartıyla Ödeme</span>
          </div>
        </label>
        <label class="customer-form__payment-option" id="payment-cash-label">
          <input type="radio" name="payment-method" value="cash" id="payment-cash">
          <div class="customer-form__payment-box">
            <span class="customer-form__payment-icon">💵</span>
            <span class="customer-form__payment-text">Araçta Nakit Ödeme</span>
          </div>
        </label>
      </div>
    </div>`;

  // Not alanı
  html += `
    <div class="customer-form__section">
      <div class="customer-form__group">
        <label class="customer-form__label">Not / Özel İstek</label>
        <textarea class="customer-form__input customer-form__textarea" id="customer-note" rows="3" placeholder="Varsa özel isteklerinizi yazabilirsiniz..."></textarea>
      </div>
    </div>`;

  container.innerHTML = html;
}

function closeCustomerForm() {
  const overlay = document.getElementById('customer-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function submitCustomerForm() {
  const pax = bookingParams.pax || 1;
  const errorFields = [];

  // Tüm yolcuları doğrula
  for (let i = 0; i < pax; i++) {
    const name = document.getElementById('pax-name-' + i);
    const phone = document.getElementById('pax-phone-' + i);
    const flight = document.getElementById('pax-flight-' + i);

    if (name && !name.value.trim()) errorFields.push(name);
    if (phone && !phone.value.trim()) errorFields.push(phone);
    if (flight && !flight.value.trim()) errorFields.push(flight);
  }

  // E-posta kontrolü
  const emailEl = document.getElementById('pax-email-0');
  if (emailEl && !emailEl.value.trim()) errorFields.push(emailEl);

  // Ödeme yöntemi kontrolü
  const paymentMethod = document.querySelector('input[name="payment-method"]:checked');
  if (!paymentMethod) {
    const paymentOptions = document.getElementById('payment-options');
    if (paymentOptions) {
      paymentOptions.classList.add('customer-form__payment-options--error');
      setTimeout(() => paymentOptions.classList.remove('customer-form__payment-options--error'), 3000);
      paymentOptions.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  if (errorFields.length > 0) {
    errorFields.forEach(f => {
      f.classList.add('customer-form__input--error');
      setTimeout(() => f.classList.remove('customer-form__input--error'), 3000);
    });
    errorFields[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // Bilgileri kaydet
  bookingParams.passengers = [];
  for (let i = 0; i < pax; i++) {
    bookingParams.passengers.push({
      name: document.getElementById('pax-name-' + i).value.trim(),
      phone: document.getElementById('pax-phone-' + i).value.trim(),
      flight: document.getElementById('pax-flight-' + i).value.trim()
    });
  }

  bookingParams.customerEmail = emailEl ? emailEl.value.trim() : '';
  bookingParams.customerNote = (document.getElementById('customer-note')?.value || '').trim();
  bookingParams.paymentMethod = paymentMethod.value === 'card' ? 'Araçta Kredi Kartı' : 'Araçta Nakit';

  // Eski alanları da set et (WhatsApp mesajı için)
  bookingParams.customerName = bookingParams.passengers[0].name;
  bookingParams.customerPhone = bookingParams.passengers[0].phone;
  bookingParams.customerFlight = bookingParams.passengers[0].flight;

  closeCustomerForm();

  // E-posta gönderimi (arka planda)
  sendReservationEmail();

  // WhatsApp'ı aç
  sendBookingWhatsApp();
}

/* --- Rezervasyon E-posta Gönderimi --- */
function sendReservationEmail() {
  const v = vehicles.find(veh => veh.id === bookingParams.vehicle);
  if (!v) return;

  const km = bookingParams.calculatedKm || bookingParams.distanceKm;
  const price = km ? calculateVehiclePriceWithKm(v, km) : calculateVehiclePrice(v);
  const extrasTotal = getExtrasTotal();
  const grandTotal = price + extrasTotal;

  const payload = {
    customerName: bookingParams.customerName,
    customerPhone: bookingParams.customerPhone,
    customerEmail: bookingParams.customerEmail || '',
    customerFlight: bookingParams.customerFlight || '',
    vehicle: v.name,
    from: bookingParams.from || '',
    to: bookingParams.to || '',
    date: bookingParams.date ? formatDateTR(bookingParams.date) : '',
    time: bookingParams.time || '',
    returnDate: bookingParams.returnDate ? formatDateTR(bookingParams.returnDate) : '',
    returnTime: bookingParams.returnTime || '',
    pax: bookingParams.pax || 1,
    service: bookingParams.service || 'transfer',
    roundtrip: !!bookingParams.roundtrip,
    hours: bookingParams.hours || 0,
    distanceKm: bookingParams.distanceKm || '',
    duration: bookingParams.duration || '',
    price: formatPrice(price),
    extrasTotal: formatPrice(extrasTotal),
    grandTotal: formatPrice(grandTotal),
    currency: selectedCurrency,
    paymentMethod: bookingParams.paymentMethod || '',
    customerNote: bookingParams.customerNote || '',
    childSeatCount: extrasState.childSeatCount,
    meetGreet: extrasState.meetGreet,
    passengers: bookingParams.passengers || []
  };

  fetch('api/send-reservation.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(data => {
    if (!data.success) {
      console.warn('E-posta gönderilemedi:', data.error);
    }
  })
  .catch(err => {
    console.warn('E-posta gönderim hatası:', err);
  });
}

/* --- Select Vehicle → Open Extras --- */
function selectBookingVehicle(id) {
  bookingParams.vehicle = id;

  // Highlight selected
  document.querySelectorAll('.bp-vehicle-card').forEach(c => c.classList.remove('selected'));
  const card = document.getElementById('vc-' + id);
  if (card) card.classList.add('selected');

  // Reset extras
  extrasState.childSeatCount = 0;
  extrasState.meetGreet = false;
  const qtyEl = document.getElementById('child-seat-qty');
  if (qtyEl) qtyEl.textContent = '0';
  const toggleEl = document.getElementById('meet-greet-toggle');
  if (toggleEl) toggleEl.checked = false;
  updateExtrasTotal();

  // Sidebar'da seçilen aracı ve toplam tutarı göster
  updateSummaryWithVehicle(id);

  // Ek hizmetler modalını aç
  openExtras();
}

function updateSummaryWithVehicle(id) {
  const v = vehicles.find(veh => veh.id === id);
  if (!v) return;

  const km = bookingParams.calculatedKm || bookingParams.distanceKm;
  let price, priceDetail;
  if (km && bookingParams.service !== 'hourly') {
    priceDetail = calculateVehiclePriceDetailed(v, km);
    price = priceDetail.total;
  } else {
    price = calculateVehiclePrice(v);
    priceDetail = null;
  }
  const extrasTotal = getExtrasTotal();
  const grandTotal = price + extrasTotal;

  // Toplam satırını sidebar'a ekle
  const summary = document.getElementById('bp-summary');
  if (!summary) return;

  // Önceki eklenen bölümleri kaldır
  const oldTotal = summary.querySelector('.bp-summary__total-row');
  if (oldTotal) oldTotal.remove();
  summary.querySelectorAll('.bp-summary__extras-section').forEach(el => el.remove());
  summary.querySelectorAll('.bp-summary__surcharge-note').forEach(el => el.remove());
  const oldAction = summary.querySelector('.bp-summary__action');
  if (oldAction) oldAction.remove();

  // Araç bilgisi
  let html = '';
  html += `<div class="bp-summary__extras-section">`;
  html += `<div class="bp-summary__section-title">Seçilen Araç</div>`;
  html += `<div class="bp-summary__line-item"><span>${v.name}</span><span>${formatPrice(price)}</span></div>`;
  html += `</div>`;

  // Ek Hizmetler
  if (extrasState.childSeatCount > 0 || extrasState.meetGreet) {
    html += `<div class="bp-summary__extras-section">`;
    html += `<div class="bp-summary__section-title">Ek Hizmetler</div>`;
    if (extrasState.childSeatCount > 0) {
      html += `<div class="bp-summary__line-item"><span>Çocuk Koltuğu x${extrasState.childSeatCount}</span><span>${formatPrice(extrasState.childSeatCount * CHILD_SEAT_PRICE)}</span></div>`;
    }
    if (extrasState.meetGreet) {
      html += `<div class="bp-summary__line-item"><span>Havalimanı Karşılama</span><span>${formatPrice(MEET_GREET_PRICE)}</span></div>`;
    }
    html += `</div>`;
  }

  // Toplam
  html += `<div class="bp-summary__total-row"><span class="bp-summary__total-label">TOPLAM TUTAR</span><span class="bp-summary__total-price">${formatPrice(grandTotal)}</span></div>`;

  // Minimum ücret farkı açıklaması
  if (priceDetail && priceDetail.minApplied) {
    html += `<div class="bp-summary__surcharge-note">`;
    html += `<div class="bp-summary__surcharge-icon">ℹ️</div>`;
    html += `<div class="bp-summary__surcharge-text">`;
    html += `KM bazlı ücret (${formatPrice(priceDetail.kmPrice)}) minimum ücretin altında kaldığı için <strong>+${formatPrice(priceDetail.surchargeAmount)}</strong> minimum ücret farkı uygulanmıştır.`;
    html += `</div></div>`;
  }

  // Rezervasyonu Onayla butonu
  html += `<div class="bp-summary__action"><button class="bp-summary__confirm-btn" onclick="openCustomerForm()">Rezervasyonu Onayla</button></div>`;

  summary.insertAdjacentHTML('beforeend', html);
}

/* --- Send WhatsApp --- */
function sendBookingWhatsApp() {
  const v = vehicles.find(veh => veh.id === bookingParams.vehicle);
  if (!v) return;

  const km = bookingParams.calculatedKm || bookingParams.distanceKm;
  const price = km ? calculateVehiclePriceWithKm(v, km) : calculateVehiclePrice(v);
  const extrasTotal = getExtrasTotal();
  const grandTotal = price + extrasTotal;

  updateSummaryWithVehicle(bookingParams.vehicle);

  const extras = [];
  if (extrasState.childSeatCount > 0) {
    extras.push(`🪑 Çocuk Koltuğu: ${extrasState.childSeatCount} adet (${formatPrice(extrasState.childSeatCount * CHILD_SEAT_PRICE)})`);
  }
  if (extrasState.meetGreet) {
    extras.push(`🪧 Havalimanı Karşılama Hizmeti (${formatPrice(MEET_GREET_PRICE)})`);
  }

  const paxLines = [];
  if (bookingParams.passengers && bookingParams.passengers.length > 0) {
    bookingParams.passengers.forEach((p, i) => {
      if (bookingParams.passengers.length === 1) {
        paxLines.push(`👤 Ad Soyad: ${p.name}`);
        paxLines.push(`📞 Telefon: ${p.phone}`);
        if (p.flight) paxLines.push(`✈️ Uçuş No: ${p.flight}`);
      } else {
        paxLines.push(`👤 ${i + 1}. Yolcu: ${p.name} | Tel: ${p.phone}${p.flight ? ' | Uçuş: ' + p.flight : ''}`);
      }
    });
  }

  const msg = [
    '🚗 *LUXURY TRANSFER - Rezervasyon Talebi*',
    '',
    ...paxLines,
    bookingParams.customerEmail ? `📧 E-posta: ${bookingParams.customerEmail}` : '',
    '',
    `📍 Nereden: ${bookingParams.from || 'Belirtilmedi'}`,
    `📍 Nereye: ${bookingParams.to || 'Belirtilmedi'}`,
    `📅 Gidiş: ${formatDateTR(bookingParams.date)} ${bookingParams.time || ''}`,
    bookingParams.roundtrip ? `📅 Dönüş: ${formatDateTR(bookingParams.returnDate)} ${bookingParams.returnTime || ''}` : '',
    `👥 Kişi Sayısı: ${bookingParams.pax}`,
    bookingParams.service !== 'hourly' ? `🔄 Gidiş-Dönüş: ${bookingParams.roundtrip ? 'Evet' : 'Hayır'}` : '',
    bookingParams.distanceKm ? `📏 Mesafe: ${bookingParams.distanceKm} KM${bookingParams.roundtrip ? ' (tek yön) / ' + (bookingParams.distanceKm * 2) + ' KM (toplam)' : ''}` : '',
    bookingParams.duration && bookingParams.service !== 'hourly' ? `⏱️ Tahmini Süre: ${bookingParams.duration}` : '',
    bookingParams.service === 'hourly' && bookingParams.hours ? `⏱️ Kiralama Süresi: ${bookingParams.hours} Saat` : '',
    '',
    `🚘 Araç: ${v.name} (${formatPrice(price)})`,
    extras.length > 0 ? '\n📌 *Ek Hizmetler:*' : '',
    ...extras,
    '',
    `💰 *TOPLAM: ${formatPrice(grandTotal)}*`,
    bookingParams.paymentMethod ? `\n💳 *Ödeme Yöntemi:* ${bookingParams.paymentMethod}` : '',
    bookingParams.customerNote ? `\n📝 Not: ${bookingParams.customerNote}` : '',
    '',
    'Rezervasyonumu onaylamak istiyorum.'
  ].filter(Boolean).join('\n');

  const encoded = encodeURIComponent(msg);
  window.open(`https://wa.me/905302544784?text=${encoded}`, '_blank');
}

/* --- Google Maps Distance Calculation --- */
function calculateDistance(origin, destination) {
  // 10 saniye timeout — API yanıt vermezse fallback
  const timeout = setTimeout(() => {
    distanceFallback();
  }, 10000);

  function onSuccess() {
    clearTimeout(timeout);
    runDistanceCalc(origin, destination, timeout);
  }

  if (typeof google === 'undefined' || !google.maps) {
    const script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAKn8rCHTdXarUOSOrqj-i0QgZStNB7IL8&libraries=places';
    script.onload = onSuccess;
    script.onerror = () => { clearTimeout(timeout); distanceFallback(); };
    document.head.appendChild(script);
    return;
  }
  onSuccess();
}

function distanceFallback() {
  bookingParams.distanceKm = null;
  const el = document.getElementById('distance-loading');
  if (el) el.textContent = 'Hesaplanamadı — fiyatlar minimum mesafeye göre gösterilmektedir.';
}

function runDistanceCalc(origin, destination) {
  try {
    const service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [origin],
        destinations: [destination],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC
      },
      function(response, status) {
        if (status === 'OK' && response.rows[0] && response.rows[0].elements[0]) {
          const element = response.rows[0].elements[0];
          if (element.status === 'OK') {
            const distanceKm = Math.round(element.distance.value / 100) / 10;
            bookingParams.distanceKm = distanceKm;
            bookingParams.duration = element.duration.text;
            renderSummary();
            updatePricesWithDistance(distanceKm);
            return;
          }
        }
        distanceFallback();
      }
    );
  } catch (e) {
    distanceFallback();
  }
}

function updatePricesWithDistance(km) {
  bookingParams.calculatedKm = km;

  // Araç kartlarındaki fiyatları güncelle
  const container = document.getElementById('bp-vehicles');
  if (!container) return;

  document.querySelectorAll('.bp-vehicle-card').forEach(card => {
    const id = card.id.replace('vc-', '');
    const v = vehicles.find(veh => veh.id === id);
    if (!v) return;

    const price = calculateVehiclePriceWithKm(v, km);
    const priceEl = card.querySelector('.bp-vehicle-card__price');
    if (priceEl) {
      priceEl.innerHTML = formatPrice(price);
    }
  });
}

function calculateVehiclePriceWithKm(vehicle, km) {
  let price = 0;
  const isRoundtrip = bookingParams.roundtrip;
  let totalKm = isRoundtrip ? km * 2 : km;
  let minApplied = false;
  let surchargeAmount = 0;

  if (bookingParams.service === 'hourly') {
    const hours = Math.max(vehicle.pricing.hourly.minHours, bookingParams.hours || vehicle.pricing.hourly.minHours);
    price = hours * vehicle.pricing.hourly.pricePerHour;
    if (isRoundtrip) price *= 2;
  } else {
    const kmPrice = totalKm * vehicle.pricing.perKm.pricePerKm;
    const minPrice = vehicle.pricing.perKm.minPrice || 0;
    const effectiveMin = isRoundtrip ? minPrice * 2 : minPrice;
    if (minPrice > 0 && kmPrice < effectiveMin) {
      surchargeAmount = effectiveMin - kmPrice;
      price = effectiveMin;
      minApplied = true;
    } else {
      price = kmPrice;
    }
  }

  // Night surcharge
  if (bookingParams.time) {
    const hour = parseInt(bookingParams.time.split(':')[0]);
    if (hour >= 22 || hour < 6) {
      price = Math.round(price * 1.2);
    }
  }

  return Math.round(price);
}

/* Detaylı fiyat bilgisi döndüren versiyon (sidebar için) */
function calculateVehiclePriceDetailed(vehicle, km) {
  let price = 0;
  const isRoundtrip = bookingParams.roundtrip;
  let totalKm = isRoundtrip ? km * 2 : km;
  let minApplied = false;
  let surchargeAmount = 0;
  let kmPrice = 0;

  if (bookingParams.service === 'hourly') {
    const hours = Math.max(vehicle.pricing.hourly.minHours, bookingParams.hours || vehicle.pricing.hourly.minHours);
    price = hours * vehicle.pricing.hourly.pricePerHour;
    if (isRoundtrip) price *= 2;
  } else {
    kmPrice = totalKm * vehicle.pricing.perKm.pricePerKm;
    const minPrice = vehicle.pricing.perKm.minPrice || 0;
    const effectiveMin = isRoundtrip ? minPrice * 2 : minPrice;
    if (minPrice > 0 && kmPrice < effectiveMin) {
      surchargeAmount = Math.round(effectiveMin - kmPrice);
      price = effectiveMin;
      minApplied = true;
    } else {
      price = kmPrice;
    }
  }

  // Night surcharge
  let nightSurcharge = false;
  if (bookingParams.time) {
    const hour = parseInt(bookingParams.time.split(':')[0]);
    if (hour >= 22 || hour < 6) {
      price = Math.round(price * 1.2);
      nightSurcharge = true;
    }
  }

  return {
    total: Math.round(price),
    kmPrice: Math.round(kmPrice),
    minApplied,
    surchargeAmount,
    nightSurcharge
  };
}
