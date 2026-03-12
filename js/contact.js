/* ========================================
   LUXURY TRANSFER - İletişim Formu
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (validateContactForm()) {
      submitContactForm();
    }
  });
});

function validateContactForm() {
  let valid = true;
  clearErrors();

  const name = document.getElementById('contact-name');
  const email = document.getElementById('contact-email');
  const phone = document.getElementById('contact-phone');
  const message = document.getElementById('contact-message');

  if (!name.value.trim()) {
    showError(name, 'Ad Soyad gereklidir.');
    valid = false;
  }

  if (!email.value.trim()) {
    showError(email, 'E-posta gereklidir.');
    valid = false;
  } else if (!isValidEmail(email.value)) {
    showError(email, 'Geçerli bir e-posta adresi girin.');
    valid = false;
  }

  if (!phone.value.trim()) {
    showError(phone, 'Telefon numarası gereklidir.');
    valid = false;
  }

  if (!message.value.trim()) {
    showError(message, 'Mesajınızı yazın.');
    valid = false;
  }

  return valid;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(input, message) {
  input.classList.add('form-input--error');
  const error = document.createElement('div');
  error.className = 'form-error';
  error.textContent = message;
  input.parentNode.appendChild(error);
}

function clearErrors() {
  document.querySelectorAll('.form-input--error').forEach(el => el.classList.remove('form-input--error'));
  document.querySelectorAll('.form-error').forEach(el => el.remove());
}

function submitContactForm() {
  const name = document.getElementById('contact-name').value;
  const email = document.getElementById('contact-email').value;
  const phone = document.getElementById('contact-phone').value;
  const message = document.getElementById('contact-message').value;

  const subject = `İletişim Formu - ${name}`;
  const body = `Ad: ${name}\nE-posta: ${email}\nTelefon: ${phone}\n\nMesaj:\n${message}`;
  const mailtoUrl = `mailto:info@luxurytransfer.com.tr?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailtoUrl, '_blank');

  // Show success
  const form = document.getElementById('contact-form');
  form.innerHTML = `
    <div class="text-center" style="padding:3rem">
      <div style="font-size:3rem;margin-bottom:1rem">✅</div>
      <h3>Mesajınız İletildi!</h3>
      <p style="color:#666;margin-top:0.5rem">En kısa sürede size geri dönüş yapacağız.</p>
    </div>`;
}
