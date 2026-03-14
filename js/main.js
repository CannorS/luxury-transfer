/* ========================================
   LUXURY TRANSFER - Main JS
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initHeader();
  initMobileMenu();
  initScrollAnimations();
  initHeroSlider();
  initBookingBar();
  initTestimonialSlider();
});

/* --- Theme Toggle (Dark / Light) --- */
function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
  }

  const toggle = document.querySelector('.theme-toggle');
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
}

/* --- Header Scroll Effect --- */
function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  function updateHeader() {
    if (window.scrollY > 50) {
      header.classList.remove('header--transparent');
      header.classList.add('header--solid');
    } else {
      header.classList.add('header--transparent');
      header.classList.remove('header--solid');
    }
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
}

/* --- Mobile Menu --- */
function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileNav.classList.toggle('active');
    document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
  });

  mobileNav.querySelectorAll('.mobile-nav__link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileNav.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

/* --- Scroll Reveal Animations --- */
function initScrollAnimations() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(el => observer.observe(el));
}

/* --- Hero Slider --- */
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slider__slide');
  if (slides.length < 2) return;

  let current = 0;

  setInterval(() => {
    slides[current].classList.remove('active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('active');
  }, 2000);
}

/* --- Booking Bar: Tab Switching + Date/Time Init --- */
let selectedDepartureTime = '';
let selectedReturnTime = '';
let currentTimePicker = null; // 'departure' or 'return'

function initBookingBar() {
  const tabs = document.querySelectorAll('.booking-bar__tab');
  const toggleField = document.getElementById('field-toggle');
  const durationField = document.getElementById('field-duration');
  const returnField2 = document.getElementById('field-return');

  const fromLabel = document.querySelector('#hero-from')?.closest('.booking-bar__field')?.querySelector('.booking-bar__label');
  const toLabel = document.querySelector('#hero-to')?.closest('.booking-bar__field')?.querySelector('.booking-bar__label');
  const fromInput = document.getElementById('hero-from');
  const toInput = document.getElementById('hero-to');
  const toField = toInput ? toInput.closest('.booking-bar__field') : null;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const isHourly = tab.dataset.tab === 'hourly';
      if (toggleField) toggleField.style.display = isHourly ? 'none' : 'flex';
      if (durationField) durationField.style.display = isHourly ? 'flex' : 'none';
      // Saatlik modda label'ları değiştir, Nereye alanını göster
      if (fromLabel) fromLabel.textContent = isHourly ? 'ALINIŞ LOKASYONU' : 'NEREDEN';
      if (toLabel) toLabel.textContent = isHourly ? 'BIRAKILIŞ NOKTASI' : 'NEREYE';
      if (fromInput) fromInput.placeholder = isHourly ? 'Alınış adresi...' : 'Adres, Havalimanı, Otel...';
      if (toInput) toInput.placeholder = isHourly ? 'Bırakılış adresi...' : 'Adres, Havalimanı, Otel...';
      if (toField) toField.style.display = 'flex';
      if (isHourly && returnField2) returnField2.style.display = 'none';
    });
  });

  const dateInput = document.getElementById('hero-date');
  const returnDateInput = document.getElementById('hero-return-date');
  const returnField = document.getElementById('field-return');
  const roundtripCheckbox = document.getElementById('hero-roundtrip');
  const tripLabel = document.getElementById('trip-label');

  if (!dateInput) return;

  // Set min date to today, no default value
  const today = new Date();
  const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
  dateInput.min = todayStr;
  dateInput.value = '';
  if (returnDateInput) {
    returnDateInput.min = todayStr;
    returnDateInput.value = '';
  }

  // Roundtrip toggle
  if (roundtripCheckbox && tripLabel) {
    roundtripCheckbox.addEventListener('change', () => {
      const isRoundtrip = roundtripCheckbox.checked;
      tripLabel.textContent = isRoundtrip ? 'Gidiş Dönüş' : 'Sadece Gidiş';
      if (returnField) {
        returnField.style.display = isRoundtrip ? 'flex' : 'none';
      }
      if (isRoundtrip && returnDateInput) {
        returnDateInput.min = dateInput.value || todayStr;
        if (!returnDateInput.value) returnDateInput.value = dateInput.value;
      }
    });
  }

  // When departure date changes, update return min date
  dateInput.addEventListener('change', () => {
    if (returnDateInput) {
      returnDateInput.min = dateInput.value;
      if (returnDateInput.value && returnDateInput.value < dateInput.value) {
        returnDateInput.value = dateInput.value;
      }
    }
    // Open time picker after date selection
    openTimePicker('departure', dateInput.value);
  });

  if (returnDateInput) {
    returnDateInput.addEventListener('change', () => {
      openTimePicker('return', returnDateInput.value);
    });
  }

  // Close time picker on overlay click
  const overlay = document.getElementById('time-picker-overlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeTimePicker();
    });
  }
}

function openTimePicker(type, selectedDate) {
  currentTimePicker = type;
  const overlay = document.getElementById('time-picker-overlay');
  const grid = document.getElementById('time-picker-grid');
  const title = document.getElementById('time-picker-title');
  if (!overlay || !grid || !title) return;

  title.textContent = type === 'departure' ? 'Gidiş Saati Seçin' : 'Dönüş Saati Seçin';

  const now = new Date();
  const todayStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
  const isToday = selectedDate === todayStr;

  let startHour = 0;
  let startMin = 0;

  if (isToday) {
    // Şu anki saat + 1 saat sonrasından itibaren seçilebilir
    const minTime = new Date(now.getTime() + 60 * 60 * 1000);
    startHour = minTime.getHours();
    startMin = minTime.getMinutes();
    if (startMin > 0 && startMin <= 30) {
      startMin = 30;
    } else if (startMin > 30) {
      startHour++;
      startMin = 0;
    }
    if (startHour >= 24) { startHour = 23; startMin = 30; }
  }

  grid.innerHTML = '';
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const label = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'time-picker__slot';
      btn.textContent = label;

      if (isToday && (h < startHour || (h === startHour && m < startMin))) {
        btn.classList.add('disabled');
      } else {
        btn.addEventListener('click', () => selectTime(type, label, selectedDate));
      }
      grid.appendChild(btn);
    }
  }

  overlay.classList.add('active');
}

function selectTime(type, time, date) {
  if (type === 'departure') {
    selectedDepartureTime = time;
  } else {
    selectedReturnTime = time;
  }
  closeTimePicker();
}

function formatDateTR(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  return parts[2] + '.' + parts[1] + '.' + parts[0];
}

function closeTimePicker() {
  const overlay = document.getElementById('time-picker-overlay');
  if (overlay) overlay.classList.remove('active');
  currentTimePicker = null;
}

/* --- Booking Bar: Submit → Redirect to Rezervasyon --- */
function submitHeroForm() {
  const from = document.getElementById('hero-from').value.trim();
  const to = document.getElementById('hero-to').value.trim();
  const date = document.getElementById('hero-date').value;
  const returnDate = document.getElementById('hero-return-date').value;
  const pax = document.getElementById('hero-pax').value;
  const activeTab = document.querySelector('.booking-bar__tab.active');
  const serviceType = activeTab ? activeTab.dataset.tab : 'transfer';

  const roundtrip = document.getElementById('hero-roundtrip');
  const isRoundtrip = roundtrip ? roundtrip.checked : false;

  const durationEl = document.getElementById('hero-duration');
  const duration = durationEl ? durationEl.value : '';

  // Validasyon - boş alanları kırmızı ile işaretle
  let hasError = false;
  const isHourly = serviceType === 'hourly';

  // Önceki hataları temizle
  document.querySelectorAll('.booking-bar__field--error').forEach(el => el.classList.remove('booking-bar__field--error'));

  const fromField = document.getElementById('hero-from').closest('.booking-bar__field');
  const toFieldEl = document.getElementById('hero-to').closest('.booking-bar__field');
  const dateField = document.getElementById('field-departure');
  const paxField = document.getElementById('hero-pax').closest('.booking-bar__field');

  if (!from) { fromField.classList.add('booking-bar__field--error'); hasError = true; }
  if (!to) { toFieldEl.classList.add('booking-bar__field--error'); hasError = true; }
  if (!date) { dateField.classList.add('booking-bar__field--error'); hasError = true; }
  if (!selectedDepartureTime) { dateField.classList.add('booking-bar__field--error'); hasError = true; }
  if (!pax || pax < 1) { paxField.classList.add('booking-bar__field--error'); hasError = true; }

  if (!isHourly && isRoundtrip) {
    const returnFieldEl = document.getElementById('field-return');
    if (!returnDate || !selectedReturnTime) { returnFieldEl.classList.add('booking-bar__field--error'); hasError = true; }
  }

  if (hasError) {
    setTimeout(() => {
      document.querySelectorAll('.booking-bar__field--error').forEach(el => el.classList.remove('booking-bar__field--error'));
    }, 3000);
    return;
  }

  const params = new URLSearchParams();
  params.set('from', from);
  params.set('to', to);
  params.set('date', date);
  params.set('time', selectedDepartureTime);
  params.set('pax', pax);
  params.set('service', serviceType);
  if (isHourly && duration) {
    params.set('hours', duration);
  }
  if (!isHourly && isRoundtrip) {
    params.set('roundtrip', '1');
    params.set('return_date', returnDate);
    params.set('return_time', selectedReturnTime);
  }

  window.location.href = 'rezervasyon.html?' + params.toString();
}

/* --- Booking Bar: Hata mesajı göster --- */
function showBookingError(msg) {
  // Mevcut hata varsa kaldır
  const existing = document.querySelector('.booking-bar__error');
  if (existing) existing.remove();

  const form = document.getElementById('hero-booking-form');
  if (!form) return;

  const errorEl = document.createElement('div');
  errorEl.className = 'booking-bar__error';
  errorEl.textContent = msg;
  form.appendChild(errorEl);

  setTimeout(() => errorEl.remove(), 5000);
}

/* --- Smooth scroll for anchor links --- */
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  const target = document.querySelector(link.getAttribute('href'));
  if (target) {
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

/* --- Popüler Lokasyonlar Tab Filter --- */
document.addEventListener('click', (e) => {
  const tab = e.target.closest('.locations-tab');
  if (!tab) return;

  document.querySelectorAll('.locations-tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');

  const filter = tab.dataset.filter;
  document.querySelectorAll('.loc-item').forEach(card => {
    if (filter === 'all' || card.dataset.cat === filter) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });
});

/* --- Testimonial Slider --- */
function initTestimonialSlider() {
  const track = document.getElementById('testi-track');
  const prevBtn = document.getElementById('testi-prev');
  const nextBtn = document.getElementById('testi-next');
  if (!track || !prevBtn || !nextBtn) return;

  let currentIndex = 0;

  function getVisibleCount() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  function getCardWidth() {
    const card = track.querySelector('.testimonial-card');
    if (!card) return 0;
    const gap = parseFloat(getComputedStyle(track).gap) || 24;
    return card.offsetWidth + gap;
  }

  function slide() {
    const offset = currentIndex * getCardWidth();
    track.style.transform = `translateX(-${offset}px)`;
  }

  function maxIndex() {
    const total = track.querySelectorAll('.testimonial-card').length;
    return Math.max(0, total - getVisibleCount());
  }

  prevBtn.addEventListener('click', () => {
    currentIndex = Math.max(0, currentIndex - 1);
    slide();
  });

  nextBtn.addEventListener('click', () => {
    currentIndex = Math.min(maxIndex(), currentIndex + 1);
    slide();
  });

  window.addEventListener('resize', () => {
    if (currentIndex > maxIndex()) currentIndex = maxIndex();
    slide();
  });

  // Auto-slide
  setInterval(() => {
    if (currentIndex >= maxIndex()) {
      currentIndex = 0;
    } else {
      currentIndex++;
    }
    slide();
  }, 5000);
}
