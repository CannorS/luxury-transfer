/* ========================================
   LUXURY TRANSFER - WhatsApp Integration
   ======================================== */

const WHATSAPP_NUMBER = '905551234567'; // Değiştirilecek gerçek numara

function buildWhatsAppMessage() {
  const s = bookingState;
  const v = vehicles.find(veh => veh.id === s.vehicleId);
  const airportLabel = s.airport === 'IST' ? 'İstanbul Havalimanı' : 'Sabiha Gökçen';
  const dirLabel = s.direction === 'from' ? 'Havalimanından' : 'Havalimanına';
  const addr = s.route ? s.route.label : (s.customAddress || 'Belirtilecek');

  let msg = `🚗 *LUXURY TRANSFER - Yeni Rezervasyon*\n\n`;
  msg += `👤 *İsim:* ${s.name}\n`;
  msg += `📞 *Telefon:* ${s.phone}\n`;
  if (s.email) msg += `📧 *E-posta:* ${s.email}\n`;
  msg += `\n`;
  msg += `📋 *Hizmet:* ${s.serviceType === 'perKm' ? 'KM Bazlı Transfer' : 'Saatlik Kiralama'}\n`;
  msg += `✈️ *Havalimanı:* ${airportLabel}\n`;

  if (s.serviceType === 'perKm') {
    msg += `🔄 *Yön:* ${dirLabel}\n`;
    msg += `📍 *Adres:* ${addr}\n`;
    if (s.estimatedKm) msg += `📏 *Tahmini Mesafe:* ~${s.estimatedKm} km\n`;
  } else {
    msg += `⏱️ *Süre:* ${s.hours} saat\n`;
  }

  if (s.flightNo) msg += `✈️ *Uçuş No:* ${s.flightNo}\n`;
  msg += `📅 *Tarih:* ${s.date}\n`;
  msg += `🕐 *Saat:* ${s.time}\n`;
  msg += `👥 *Yolcu:* ${s.passengers} | 🧳 *Bagaj:* ${s.luggage}\n`;
  if (v) msg += `🚘 *Araç:* ${v.name}\n`;
  if (s.isNight) msg += `🌙 *Gece Ücreti:* Dahil\n`;
  msg += `\n💰 *Tahmini Tutar:* ${s.totalPrice ? s.totalPrice.toLocaleString('tr-TR') + ' ₺' : 'Hesaplanacak'}\n`;

  return msg;
}

function sendWhatsApp() {
  // Update state from form
  bookingState.name = document.getElementById('book-name')?.value || bookingState.name;
  bookingState.phone = document.getElementById('book-phone')?.value || bookingState.phone;
  bookingState.email = document.getElementById('book-email')?.value || bookingState.email;

  if (!bookingState.name || !bookingState.phone) {
    alert('Lütfen ad ve telefon bilgilerinizi girin.');
    return;
  }

  const msg = buildWhatsAppMessage();
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

function sendEmail() {
  bookingState.name = document.getElementById('book-name')?.value || bookingState.name;
  bookingState.phone = document.getElementById('book-phone')?.value || bookingState.phone;
  bookingState.email = document.getElementById('book-email')?.value || bookingState.email;

  if (!bookingState.name || !bookingState.phone) {
    alert('Lütfen ad ve telefon bilgilerinizi girin.');
    return;
  }

  const msg = buildWhatsAppMessage().replace(/\*/g, '').replace(/🚗|👤|📞|📧|📋|✈️|🔄|📍|📏|⏱️|📅|🕐|👥|🧳|🚘|🌙|💰/g, '');
  const subject = `Luxury Transfer Rezervasyon - ${bookingState.name}`;
  const mailtoUrl = `mailto:info@luxurytransfer.com.tr?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(msg)}`;
  window.open(mailtoUrl, '_blank');
}

/* WhatsApp FAB - quick message */
function openWhatsAppGeneral() {
  const msg = 'Merhaba, Luxury Transfer hakkında bilgi almak istiyorum.';
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}
