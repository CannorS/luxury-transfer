/* ========================================
   LUXURY TRANSFER - Rezervasyon Wizard
   ======================================== */

const popularRoutes = [
  { label: 'Taksim', km: { IST: 45, SAW: 55 } },
  { label: 'Sultanahmet', km: { IST: 50, SAW: 45 } },
  { label: 'Kadıköy', km: { IST: 55, SAW: 40 } },
  { label: 'Beşiktaş', km: { IST: 42, SAW: 58 } },
  { label: 'Şişli', km: { IST: 40, SAW: 55 } },
  { label: 'Beyoğlu', km: { IST: 45, SAW: 52 } },
  { label: 'Bakırköy', km: { IST: 30, SAW: 50 } },
  { label: 'Ataşehir', km: { IST: 50, SAW: 35 } },
  { label: 'Levent', km: { IST: 38, SAW: 58 } },
  { label: 'Sarıyer', km: { IST: 35, SAW: 70 } }
];

const bookingState = {
  step: 1,
  serviceType: null,     // 'perKm' | 'hourly'
  airport: null,         // 'IST' | 'SAW'
  direction: null,       // 'from' | 'to'
  route: null,           // { label, km }
  customAddress: '',
  flightNo: '',
  passengers: 1,
  luggage: 1,
  date: '',
  time: '',
  hours: 3,             // for hourly
  vehicleId: null,
  name: '',
  phone: '',
  email: '',
  estimatedKm: null,
  totalPrice: null,
  isNight: false
};

const TOTAL_STEPS = 6;

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('booking-wizard')) return;

  // Check URL params
  const params = new URLSearchParams(window.location.search);
  if (params.get('vehicle')) {
    bookingState.vehicleId = params.get('vehicle');
  }

  renderStep();
  updateStepIndicator();
});

function renderStep() {
  const container = document.getElementById('booking-content');
  if (!container) return;

  container.innerHTML = '';

  switch (bookingState.step) {
    case 1: renderStep1(container); break;
    case 2: renderStep2(container); break;
    case 3: renderStep3(container); break;
    case 4: renderStep4(container); break;
    case 5: renderStep5(container); break;
    case 6: renderStep6(container); break;
  }

  updateStepIndicator();
  updateNavButtons();
}

/* Step 1: Service Type */
function renderStep1(container) {
  container.innerHTML = `
    <h2 class="text-center mb-3">Hizmet Tipini Seçin</h2>
    <div class="grid grid--2 gap-4">
      <div class="booking-option ${bookingState.serviceType === 'perKm' ? 'selected' : ''}" onclick="selectService('perKm')">
        <div class="booking-option__icon">🚗</div>
        <h3 class="booking-option__title">KM Bazlı Transfer</h3>
        <p class="booking-option__text">Havalimanı transferi veya şehir içi nokta-nokta transfer hizmeti. Mesafeye göre fiyatlandırma.</p>
      </div>
      <div class="booking-option ${bookingState.serviceType === 'hourly' ? 'selected' : ''}" onclick="selectService('hourly')">
        <div class="booking-option__icon">⏱️</div>
        <h3 class="booking-option__title">Saatlik Kiralama</h3>
        <p class="booking-option__text">Şoförlü araç kiralama. Toplantılar, şehir turları ve etkinlikler için ideal. Minimum 3 saat.</p>
      </div>
    </div>`;
}

function selectService(type) {
  bookingState.serviceType = type;
  renderStep();
}

/* Step 2: Airport & Direction */
function renderStep2(container) {
  container.innerHTML = `
    <h2 class="text-center mb-3">Havalimanı ve Yön Seçin</h2>
    <div class="grid grid--2 gap-4 mb-4">
      <div class="booking-option ${bookingState.airport === 'IST' ? 'selected' : ''}" onclick="selectAirport('IST')">
        <div class="booking-option__icon">✈️</div>
        <h3 class="booking-option__title">İstanbul Havalimanı</h3>
        <p class="booking-option__text">IST - Arnavutköy</p>
      </div>
      <div class="booking-option ${bookingState.airport === 'SAW' ? 'selected' : ''}" onclick="selectAirport('SAW')">
        <div class="booking-option__icon">✈️</div>
        <h3 class="booking-option__title">Sabiha Gökçen</h3>
        <p class="booking-option__text">SAW - Pendik</p>
      </div>
    </div>
    ${bookingState.airport ? `
    <h3 class="text-center mb-2">Transfer Yönü</h3>
    <div class="grid grid--2 gap-4">
      <div class="booking-option ${bookingState.direction === 'from' ? 'selected' : ''}" onclick="selectDirection('from')">
        <div class="booking-option__icon">🛬</div>
        <h3 class="booking-option__title">Havalimanından</h3>
        <p class="booking-option__text">Havalimanından şehre transfer</p>
      </div>
      <div class="booking-option ${bookingState.direction === 'to' ? 'selected' : ''}" onclick="selectDirection('to')">
        <div class="booking-option__icon">🛫</div>
        <h3 class="booking-option__title">Havalimanına</h3>
        <p class="booking-option__text">Şehirden havalimanına transfer</p>
      </div>
    </div>` : ''}`;
}

function selectAirport(code) {
  bookingState.airport = code;
  bookingState.route = null;
  bookingState.estimatedKm = null;
  renderStep();
}

function selectDirection(dir) {
  bookingState.direction = dir;
  renderStep();
}

/* Step 3: Address / Route + Passenger Info */
function renderStep3(container) {
  const isHourly = bookingState.serviceType === 'hourly';

  container.innerHTML = `
    <h2 class="text-center mb-3">${isHourly ? 'Buluşma Noktası ve Detaylar' : 'Adres ve Yolcu Bilgileri'}</h2>
    ${!isHourly ? `
    <div class="mb-3">
      <label class="form-label">Popüler Rotalar</label>
      <div style="display:flex;flex-wrap:wrap;gap:0.5rem">
        ${popularRoutes.map(r => `
          <span class="chip ${bookingState.route && bookingState.route.label === r.label ? 'selected' : ''}"
                onclick="selectRoute('${r.label}', ${r.km[bookingState.airport] || 50})">
            ${r.label} (~${r.km[bookingState.airport] || 50} km)
          </span>`).join('')}
      </div>
    </div>` : ''}
    <div class="form-group">
      <label class="form-label">${isHourly ? 'Buluşma Adresi' : 'Özel Adres (opsiyonel)'}</label>
      <input type="text" class="form-input" id="custom-address" placeholder="Adres veya otel adını yazın..."
             value="${bookingState.customAddress}" onchange="bookingState.customAddress=this.value">
    </div>
    ${!isHourly ? `
    <div class="form-group">
      <label class="form-label">Uçuş No (opsiyonel)</label>
      <input type="text" class="form-input" id="flight-no" placeholder="TK1234"
             value="${bookingState.flightNo}" onchange="bookingState.flightNo=this.value">
    </div>` : ''}
    <div class="grid grid--2 gap-2">
      <div class="form-group">
        <label class="form-label">Yolcu Sayısı</label>
        <select class="form-select" id="passenger-count" onchange="bookingState.passengers=parseInt(this.value)">
          ${[1,2,3,4,5,6,7,8,9,10,11,12].map(n => `<option value="${n}" ${bookingState.passengers === n ? 'selected' : ''}>${n}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Bagaj Sayısı</label>
        <select class="form-select" id="luggage-count" onchange="bookingState.luggage=parseInt(this.value)">
          ${[0,1,2,3,4,5,6,7,8,9,10,11,12].map(n => `<option value="${n}" ${bookingState.luggage === n ? 'selected' : ''}>${n}</option>`).join('')}
        </select>
      </div>
    </div>
    ${isHourly ? `
    <div class="form-group">
      <label class="form-label">Kaç Saat</label>
      <select class="form-select" id="hour-count" onchange="bookingState.hours=parseInt(this.value)">
        ${[3,4,5,6,7,8,10,12].map(n => `<option value="${n}" ${bookingState.hours === n ? 'selected' : ''}>${n} saat</option>`).join('')}
      </select>
    </div>` : ''}`;
}

function selectRoute(label, km) {
  bookingState.route = { label, km };
  bookingState.estimatedKm = km;
  bookingState.customAddress = '';
  renderStep();
}

/* Step 4: Date & Time */
function renderStep4(container) {
  const today = new Date().toISOString().split('T')[0];
  container.innerHTML = `
    <h2 class="text-center mb-3">Tarih ve Saat</h2>
    <div class="grid grid--2 gap-2">
      <div class="form-group">
        <label class="form-label">Tarih</label>
        <input type="date" class="form-input" id="booking-date" min="${today}"
               value="${bookingState.date}" onchange="bookingState.date=this.value; checkNightSurcharge();">
      </div>
      <div class="form-group">
        <label class="form-label">Saat</label>
        <input type="time" class="form-input" id="booking-time"
               value="${bookingState.time}" onchange="bookingState.time=this.value; checkNightSurcharge();">
      </div>
    </div>
    <div class="night-notice" id="night-notice">
      🌙 Gece ücreti: 22:00 - 06:00 arası transferlere %20 ek ücret uygulanır.
    </div>`;

  if (bookingState.time) checkNightSurcharge();
}

function checkNightSurcharge() {
  const time = document.getElementById('booking-time')?.value;
  const notice = document.getElementById('night-notice');
  if (!time || !notice) return;

  const hour = parseInt(time.split(':')[0]);
  bookingState.isNight = (hour >= 22 || hour < 6);
  notice.classList.toggle('visible', bookingState.isNight);
}

/* Step 5: Vehicle Selection */
function renderStep5(container) {
  const suitableVehicles = vehicles.filter(v => v.passengers >= bookingState.passengers);

  container.innerHTML = `
    <h2 class="text-center mb-3">Araç Seçimi</h2>
    <div class="grid grid--3" id="booking-vehicles">
      ${suitableVehicles.map(v => {
        const price = calculatePrice(v);
        const isSelected = bookingState.vehicleId === v.id;
        return `
          <div class="booking-option ${isSelected ? 'selected' : ''}" onclick="selectVehicle('${v.id}')" style="text-align:left;padding:1.25rem">
            <h4 style="margin-bottom:0.25rem">${v.name}</h4>
            <div style="font-size:0.85rem;color:var(--primary);margin-bottom:0.5rem">${v.classLabel}</div>
            <div style="font-size:0.8rem;color:#666;margin-bottom:0.75rem">${v.passengers} yolcu · ${v.luggage} bagaj</div>
            <div style="font-size:0.8rem;color:#666">Tahmini Fiyat</div>
            <div style="font-size:1.4rem;font-family:var(--font-heading);font-weight:700;color:var(--black)">${price.toLocaleString('tr-TR')} ₺</div>
            ${bookingState.isNight ? '<div style="font-size:0.75rem;color:var(--gold)">Gece ücreti dahil</div>' : ''}
          </div>`;
      }).join('')}
    </div>
    ${!bookingState.route && bookingState.serviceType === 'perKm' ? '<p class="text-center mt-4" style="color:#666;font-size:0.85rem">* Özel adres seçildi. Kesin fiyat WhatsApp üzerinden onaylanacaktır.</p>' : ''}`;
}

function selectVehicle(id) {
  bookingState.vehicleId = id;
  const v = vehicles.find(veh => veh.id === id);
  if (v) bookingState.totalPrice = calculatePrice(v);
  renderStep();
}

/* Step 6: Summary + Contact */
function renderStep6(container) {
  const v = vehicles.find(veh => veh.id === bookingState.vehicleId);
  if (!v) { bookingState.step = 5; renderStep(); return; }

  const price = calculatePrice(v);
  bookingState.totalPrice = price;

  const dirLabel = bookingState.direction === 'from' ? 'Havalimanından' : 'Havalimanına';
  const airportLabel = bookingState.airport === 'IST' ? 'İstanbul Havalimanı' : 'Sabiha Gökçen';
  const addr = bookingState.route ? bookingState.route.label : (bookingState.customAddress || 'Belirtilecek');

  container.innerHTML = `
    <h2 class="text-center mb-3">Rezervasyon Özeti</h2>
    <div class="booking-summary mb-4">
      <div class="booking-summary__row"><span class="booking-summary__label">Hizmet</span><span class="booking-summary__value">${bookingState.serviceType === 'perKm' ? 'KM Bazlı Transfer' : 'Saatlik Kiralama'}</span></div>
      <div class="booking-summary__row"><span class="booking-summary__label">Havalimanı</span><span class="booking-summary__value">${airportLabel}</span></div>
      ${bookingState.serviceType === 'perKm' ? `
      <div class="booking-summary__row"><span class="booking-summary__label">Yön</span><span class="booking-summary__value">${dirLabel}</span></div>
      <div class="booking-summary__row"><span class="booking-summary__label">Adres</span><span class="booking-summary__value">${addr}</span></div>
      ${bookingState.estimatedKm ? `<div class="booking-summary__row"><span class="booking-summary__label">Tahmini Mesafe</span><span class="booking-summary__value">~${bookingState.estimatedKm} km</span></div>` : ''}
      ` : `
      <div class="booking-summary__row"><span class="booking-summary__label">Süre</span><span class="booking-summary__value">${bookingState.hours} saat</span></div>
      `}
      ${bookingState.flightNo ? `<div class="booking-summary__row"><span class="booking-summary__label">Uçuş No</span><span class="booking-summary__value">${bookingState.flightNo}</span></div>` : ''}
      <div class="booking-summary__row"><span class="booking-summary__label">Tarih</span><span class="booking-summary__value">${bookingState.date}</span></div>
      <div class="booking-summary__row"><span class="booking-summary__label">Saat</span><span class="booking-summary__value">${bookingState.time}</span></div>
      <div class="booking-summary__row"><span class="booking-summary__label">Yolcu / Bagaj</span><span class="booking-summary__value">${bookingState.passengers} yolcu / ${bookingState.luggage} bagaj</span></div>
      <div class="booking-summary__row"><span class="booking-summary__label">Araç</span><span class="booking-summary__value">${v.name}</span></div>
      ${bookingState.isNight ? `<div class="booking-summary__row"><span class="booking-summary__label">Gece Ücreti (%20)</span><span class="booking-summary__value" style="color:var(--gold)">Dahil</span></div>` : ''}
      <div class="booking-summary__row" style="font-size:1.1rem"><span class="booking-summary__label" style="font-weight:700">Toplam</span><span class="booking-summary__value booking-summary__total">${price.toLocaleString('tr-TR')} ₺</span></div>
    </div>

    <h3 class="mb-2">İletişim Bilgileriniz</h3>
    <div class="form-group">
      <label class="form-label">Ad Soyad *</label>
      <input type="text" class="form-input" id="book-name" placeholder="Ad Soyad" value="${bookingState.name}" onchange="bookingState.name=this.value">
    </div>
    <div class="grid grid--2 gap-2">
      <div class="form-group">
        <label class="form-label">Telefon *</label>
        <input type="tel" class="form-input" id="book-phone" placeholder="+90 5XX XXX XXXX" value="${bookingState.phone}" onchange="bookingState.phone=this.value">
      </div>
      <div class="form-group">
        <label class="form-label">E-posta</label>
        <input type="email" class="form-input" id="book-email" placeholder="ornek@email.com" value="${bookingState.email}" onchange="bookingState.email=this.value">
      </div>
    </div>
    <div style="display:flex;gap:1rem;flex-wrap:wrap;margin-top:1.5rem">
      <button class="btn btn--whatsapp btn--lg" onclick="sendWhatsApp()" style="flex:1">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.682-1.415A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.24 0-4.318-.726-6.003-1.956l-.42-.312-2.774.838.87-2.675-.342-.462A9.956 9.956 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
        WhatsApp ile Rezervasyon
      </button>
      <button class="btn btn--primary btn--lg" onclick="sendEmail()" style="flex:1">
        E-posta ile Gönder
      </button>
    </div>`;
}

/* --- Price Calculation --- */
function calculatePrice(vehicle) {
  let price = 0;

  if (bookingState.serviceType === 'perKm') {
    const km = bookingState.estimatedKm || vehicle.pricing.perKm.minKm;
    price = Math.max(vehicle.pricing.perKm.basePrice, km * vehicle.pricing.perKm.pricePerKm);
  } else {
    const hours = Math.max(vehicle.pricing.hourly.minHours, bookingState.hours || 3);
    price = hours * vehicle.pricing.hourly.pricePerHour;
  }

  // Night surcharge
  if (bookingState.isNight) {
    price = Math.round(price * 1.2);
  }

  return Math.round(price);
}

/* --- Navigation --- */
function nextStep() {
  if (!validateCurrentStep()) return;
  if (bookingState.step < TOTAL_STEPS) {
    bookingState.step++;
    renderStep();
    window.scrollTo({ top: document.getElementById('booking-wizard').offsetTop - 100, behavior: 'smooth' });
  }
}

function prevStep() {
  if (bookingState.step > 1) {
    bookingState.step--;
    renderStep();
  }
}

function validateCurrentStep() {
  switch (bookingState.step) {
    case 1: return !!bookingState.serviceType;
    case 2: return !!bookingState.airport && (bookingState.serviceType === 'hourly' || !!bookingState.direction);
    case 3: return bookingState.serviceType === 'hourly' || !!bookingState.route || !!bookingState.customAddress;
    case 4: return !!bookingState.date && !!bookingState.time;
    case 5: return !!bookingState.vehicleId;
    case 6: return !!bookingState.name && !!bookingState.phone;
  }
  return true;
}

function updateStepIndicator() {
  document.querySelectorAll('.step-indicator__circle').forEach((circle, i) => {
    const stepNum = i + 1;
    circle.classList.remove('step-indicator__circle--active', 'step-indicator__circle--done');
    if (stepNum === bookingState.step) circle.classList.add('step-indicator__circle--active');
    else if (stepNum < bookingState.step) circle.classList.add('step-indicator__circle--done');
  });

  document.querySelectorAll('.step-indicator__line').forEach((line, i) => {
    line.classList.toggle('step-indicator__line--done', i + 1 < bookingState.step);
  });
}

function updateNavButtons() {
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  if (prevBtn) prevBtn.style.visibility = bookingState.step > 1 ? 'visible' : 'hidden';
  if (nextBtn) nextBtn.style.display = bookingState.step < TOTAL_STEPS ? '' : 'none';
}
