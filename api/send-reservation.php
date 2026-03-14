<?php
/**
 * Rezervasyon E-posta Gönderim Endpoint'i
 * POST ile gelen rezervasyon verilerini e-posta olarak gönderir
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// OPTIONS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Sadece POST istekleri kabul edilir.']);
    exit;
}

// JSON body oku
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Geçersiz veri.']);
    exit;
}

// Zorunlu alan kontrolleri
$required = ['customerName', 'customerPhone', 'vehicle'];
foreach ($required as $field) {
    if (empty($input[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => "Eksik alan: $field"]);
        exit;
    }
}

// SMTP ayarları
$smtpHost = 'mail.luxuryairportshuttle.com';
$smtpPort = 465;
$smtpUser = 'bildirim@luxuryairportshuttle.com';
$smtpPass = 'l!Frld=Ffx0FU3kx';
$fromEmail = 'bildirim@luxuryairportshuttle.com';
$fromName = 'Luxury Transfer Rezervasyon';
$recipients = ['cannor.steel@gmail.com', 'rezervasyon@luxuryairportshuttle.com'];

// Verileri güvenli hale getir
function e($str) {
    return htmlspecialchars($str ?? '', ENT_QUOTES, 'UTF-8');
}

// Veri çıkarma
$customerName   = e($input['customerName']);
$customerPhone  = e($input['customerPhone']);
$customerEmail  = e($input['customerEmail'] ?? '');
$customerFlight = e($input['customerFlight'] ?? '');
$vehicleName    = e($input['vehicle']);
$from           = e($input['from'] ?? 'Belirtilmedi');
$to             = e($input['to'] ?? 'Belirtilmedi');
$date           = e($input['date'] ?? '');
$time           = e($input['time'] ?? '');
$returnDate     = e($input['returnDate'] ?? '');
$returnTime     = e($input['returnTime'] ?? '');
$pax            = intval($input['pax'] ?? 1);
$service        = e($input['service'] ?? 'transfer');
$roundtrip      = !empty($input['roundtrip']);
$hours          = intval($input['hours'] ?? 0);
$distanceKm     = e($input['distanceKm'] ?? '');
$duration       = e($input['duration'] ?? '');
$price          = e($input['price'] ?? '');
$extrasTotal    = e($input['extrasTotal'] ?? '');
$grandTotal     = e($input['grandTotal'] ?? '');
$currency       = e($input['currency'] ?? 'TRY');
$paymentMethod  = e($input['paymentMethod'] ?? '');
$customerNote   = e($input['customerNote'] ?? '');

// Ek hizmetler
$childSeatCount = intval($input['childSeatCount'] ?? 0);
$meetGreet      = !empty($input['meetGreet']);

// Ek yolcular
$passengers     = $input['passengers'] ?? [];

// E-posta konusu
$subject = "Yeni Rezervasyon - $customerName | $vehicleName";

// HTML E-posta oluştur
$serviceLabel = $service === 'hourly' ? 'Saatlik Kiralama' : 'Havalimanı Transfer';
$roundtripLabel = $roundtrip ? 'Evet' : 'Hayir';

$html = '
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">

<!-- Header -->
<tr>
<td style="background:linear-gradient(135deg,#1a1a1a 0%,#2d2d2d 100%);padding:30px 40px;text-align:center;">
  <h1 style="color:#ffffff;margin:0;font-size:22px;letter-spacing:1px;">LUXURY TRANSFER</h1>
  <p style="color:#C9A84C;margin:8px 0 0;font-size:14px;">Yeni Rezervasyon Talebi</p>
</td>
</tr>

<!-- Tarih -->
<tr>
<td style="padding:20px 40px 0;text-align:right;">
  <span style="color:#999;font-size:12px;">' . date('d.m.Y H:i') . '</span>
</td>
</tr>

<!-- Musteri Bilgileri -->
<tr>
<td style="padding:20px 40px;">
  <h2 style="color:#1a1a1a;font-size:16px;border-bottom:2px solid #5B9BD5;padding-bottom:8px;margin:0 0 15px;">Musteri Bilgileri</h2>
  <table width="100%" cellpadding="4" cellspacing="0" style="font-size:14px;color:#333;">
    <tr><td style="color:#666;width:160px;">Ad Soyad:</td><td style="font-weight:bold;">' . $customerName . '</td></tr>
    <tr><td style="color:#666;">Telefon:</td><td style="font-weight:bold;"><a href="tel:' . $customerPhone . '" style="color:#5B9BD5;text-decoration:none;">' . $customerPhone . '</a></td></tr>';

if ($customerEmail) {
    $html .= '<tr><td style="color:#666;">E-posta:</td><td><a href="mailto:' . $customerEmail . '" style="color:#5B9BD5;text-decoration:none;">' . $customerEmail . '</a></td></tr>';
}
if ($customerFlight) {
    $html .= '<tr><td style="color:#666;">Ucus No:</td><td style="font-weight:bold;">' . $customerFlight . '</td></tr>';
}

$html .= '
  </table>
</td>
</tr>';

// Ek yolcular
if (count($passengers) > 1) {
    $html .= '
<tr>
<td style="padding:0 40px 20px;">
  <h2 style="color:#1a1a1a;font-size:16px;border-bottom:2px solid #5B9BD5;padding-bottom:8px;margin:0 0 15px;">Diger Yolcular</h2>
  <table width="100%" cellpadding="4" cellspacing="0" style="font-size:14px;color:#333;">';

    for ($i = 1; $i < count($passengers); $i++) {
        $p = $passengers[$i];
        $pName = e($p['name'] ?? '');
        $pPhone = e($p['phone'] ?? '');
        $pFlight = e($p['flight'] ?? '');
        $html .= '<tr><td style="color:#666;width:160px;">' . ($i + 1) . '. Yolcu:</td><td>' . $pName . ' | ' . $pPhone;
        if ($pFlight) $html .= ' | Ucus: ' . $pFlight;
        $html .= '</td></tr>';
    }

    $html .= '</table></td></tr>';
}

// Transfer Detaylari
$html .= '
<tr>
<td style="padding:0 40px 20px;">
  <h2 style="color:#1a1a1a;font-size:16px;border-bottom:2px solid #7BC67E;padding-bottom:8px;margin:0 0 15px;">Transfer Detaylari</h2>
  <table width="100%" cellpadding="4" cellspacing="0" style="font-size:14px;color:#333;">
    <tr><td style="color:#666;width:160px;">Hizmet Tipi:</td><td style="font-weight:bold;">' . $serviceLabel . '</td></tr>
    <tr><td style="color:#666;">Nereden:</td><td>' . $from . '</td></tr>
    <tr><td style="color:#666;">Nereye:</td><td>' . $to . '</td></tr>
    <tr><td style="color:#666;">Gidis Tarihi:</td><td style="font-weight:bold;">' . $date . ($time ? ' - ' . $time : '') . '</td></tr>';

if ($roundtrip && $returnDate) {
    $html .= '<tr><td style="color:#666;">Donus Tarihi:</td><td style="font-weight:bold;">' . $returnDate . ($returnTime ? ' - ' . $returnTime : '') . '</td></tr>';
}

$html .= '<tr><td style="color:#666;">Kisi Sayisi:</td><td>' . $pax . '</td></tr>';

if ($service !== 'hourly') {
    $html .= '<tr><td style="color:#666;">Gidis-Donus:</td><td>' . $roundtripLabel . '</td></tr>';
}

if ($distanceKm) {
    $kmText = $distanceKm . ' KM';
    if ($roundtrip) $kmText .= ' (tek yon) / ' . (floatval($distanceKm) * 2) . ' KM (toplam)';
    $html .= '<tr><td style="color:#666;">Mesafe:</td><td>' . $kmText . '</td></tr>';
}

if ($duration && $service !== 'hourly') {
    $html .= '<tr><td style="color:#666;">Tahmini Sure:</td><td>' . $duration . '</td></tr>';
}

if ($service === 'hourly' && $hours) {
    $html .= '<tr><td style="color:#666;">Kiralama Suresi:</td><td>' . $hours . ' Saat</td></tr>';
}

$html .= '
  </table>
</td>
</tr>';

// Fiyat Bilgileri
$html .= '
<tr>
<td style="padding:0 40px 20px;">
  <h2 style="color:#1a1a1a;font-size:16px;border-bottom:2px solid #C9A84C;padding-bottom:8px;margin:0 0 15px;">Fiyat Bilgileri</h2>
  <table width="100%" cellpadding="6" cellspacing="0" style="font-size:14px;color:#333;background:#f9f9f9;border-radius:6px;">
    <tr><td style="color:#666;width:160px;">Arac:</td><td style="font-weight:bold;">' . $vehicleName . '</td></tr>
    <tr><td style="color:#666;">Arac Fiyati:</td><td>' . $price . '</td></tr>';

if ($childSeatCount > 0) {
    $html .= '<tr><td style="color:#666;">Cocuk Koltugu:</td><td>' . $childSeatCount . ' adet</td></tr>';
}
if ($meetGreet) {
    $html .= '<tr><td style="color:#666;">Havalimani Karsilama:</td><td>Evet</td></tr>';
}
if ($extrasTotal && $extrasTotal !== '0') {
    $html .= '<tr><td style="color:#666;">Ek Hizmetler:</td><td>' . $extrasTotal . '</td></tr>';
}

$html .= '
    <tr style="background:#1a1a1a;">
      <td style="color:#C9A84C;font-weight:bold;padding:12px 6px;border-radius:0 0 0 6px;">TOPLAM:</td>
      <td style="color:#ffffff;font-weight:bold;font-size:18px;padding:12px 6px;border-radius:0 0 6px 0;">' . $grandTotal . '</td>
    </tr>
  </table>
</td>
</tr>';

// Odeme ve Not
if ($paymentMethod || $customerNote) {
    $html .= '
<tr>
<td style="padding:0 40px 20px;">
  <table width="100%" cellpadding="4" cellspacing="0" style="font-size:14px;color:#333;">';
    if ($paymentMethod) {
        $html .= '<tr><td style="color:#666;width:160px;">Odeme Yontemi:</td><td style="font-weight:bold;">' . $paymentMethod . '</td></tr>';
    }
    if ($customerNote) {
        $html .= '<tr><td style="color:#666;">Musteri Notu:</td><td style="background:#fff8e1;padding:10px;border-radius:4px;border-left:3px solid #C9A84C;">' . nl2br($customerNote) . '</td></tr>';
    }
    $html .= '</table></td></tr>';
}

// Para birimi notu
$html .= '
<tr>
<td style="padding:0 40px 10px;">
  <p style="color:#999;font-size:11px;margin:0;">Fiyatlar ' . $currency . ' para birimi ile gosterilmektedir.</p>
</td>
</tr>';

// Footer
$html .= '
<tr>
<td style="background:#1a1a1a;padding:20px 40px;text-align:center;">
  <p style="color:#666;font-size:12px;margin:0;">Bu e-posta luxuryairportshuttle.com uzerinden gonderilmistir.</p>
  <p style="color:#555;font-size:11px;margin:5px 0 0;">Luxury Transfer &copy; ' . date('Y') . '</p>
</td>
</tr>

</table>
</td></tr>
</table>
</body>
</html>';

// SMTP ile gönder
require_once __DIR__ . '/smtp-mailer.php';

try {
    $mailer = new SmtpMailer($smtpHost, $smtpPort, $smtpUser, $smtpPass);
    $mailer->send($fromEmail, $fromName, $recipients, $subject, $html);

    echo json_encode(['success' => true, 'message' => 'Rezervasyon e-postasi basariyla gonderildi.']);
} catch (Exception $ex) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'E-posta gonderilemedi: ' . $ex->getMessage()
    ]);
}
