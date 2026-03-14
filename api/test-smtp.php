<?php
/**
 * SMTP Bağlantı Test Scripti
 * Kullanım: tarayıcıdan api/test-smtp.php adresini açın
 * Test sonrası bu dosyayı SİLİN!
 */

header('Content-Type: text/html; charset=utf-8');
echo '<pre style="font-family:monospace;font-size:14px;padding:20px;">';
echo "=== SMTP BAĞLANTI TESTİ ===\n\n";

// 1. PHP Bilgileri
echo "PHP Sürümü: " . PHP_VERSION . "\n";
echo "OpenSSL: " . (extension_loaded('openssl') ? 'YÜKLÜ ✓' : 'YÜKLÜ DEĞİL ✗') . "\n";
echo "fsockopen: " . (function_exists('fsockopen') ? 'MEVCUT ✓' : 'MEVCUT DEĞİL ✗') . "\n";
echo "allow_url_fopen: " . (ini_get('allow_url_fopen') ? 'AÇIK ✓' : 'KAPALI ✗') . "\n\n";

// 2. SMTP Bağlantı Testi
$host = 'mail.luxuryairportshuttle.com';
$port = 465;
$user = 'bildirim@luxuryairportshuttle.com';
$pass = 'l!Frld=Ffx0FU3kx';

echo "--- DNS Çözümleme ---\n";
$ip = gethostbyname($host);
echo "Host: $host\n";
echo "IP: $ip\n";
if ($ip === $host) {
    echo "UYARI: DNS çözümlenemedi!\n";
}
echo "\n";

echo "--- SMTP Bağlantısı ($host:$port SSL) ---\n";
$errno = 0;
$errstr = '';
$socket = @fsockopen('ssl://' . $host, $port, $errno, $errstr, 15);

if (!$socket) {
    echo "HATA: Bağlantı kurulamadı!\n";
    echo "Hata No: $errno\n";
    echo "Hata Mesajı: $errstr\n\n";

    // Alternatif: stream_socket_client dene
    echo "--- Alternatif Yöntem: stream_socket_client ---\n";
    $context = stream_context_create([
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        ]
    ]);
    $socket2 = @stream_socket_client(
        'ssl://' . $host . ':' . $port,
        $errno2, $errstr2, 15,
        STREAM_CLIENT_CONNECT,
        $context
    );
    if ($socket2) {
        echo "stream_socket_client ile bağlantı BAŞARILI ✓\n";
        echo "fsockopen çalışmıyor ama stream_socket_client çalışıyor.\n";
        echo "smtp-mailer.php dosyasında fsockopen yerine stream_socket_client kullanılmalı.\n";
        fclose($socket2);
    } else {
        echo "Bu yöntem de başarısız: $errstr2 ($errno2)\n";
    }
    echo '</pre>';
    exit;
}

echo "Bağlantı BAŞARILI ✓\n\n";
stream_set_timeout($socket, 10);

function readResp($socket) {
    $resp = '';
    while ($line = fgets($socket, 512)) {
        $resp .= $line;
        if (substr($line, 3, 1) === ' ') break;
    }
    return trim($resp);
}

// Greeting
$resp = readResp($socket);
echo "Sunucu: $resp\n";

// EHLO
fwrite($socket, "EHLO " . gethostname() . "\r\n");
$resp = readResp($socket);
echo "EHLO: " . substr($resp, 0, 60) . "...\n";

// AUTH LOGIN
fwrite($socket, "AUTH LOGIN\r\n");
$resp = readResp($socket);
echo "AUTH LOGIN: $resp\n";

// Username
fwrite($socket, base64_encode($user) . "\r\n");
$resp = readResp($socket);
echo "Kullanıcı: $resp\n";

// Password
fwrite($socket, base64_encode($pass) . "\r\n");
$resp = readResp($socket);
$code = intval(substr($resp, 0, 3));
if ($code === 235) {
    echo "Şifre: $resp ✓ GİRİŞ BAŞARILI!\n\n";
} else {
    echo "Şifre: $resp ✗ GİRİŞ BAŞARISIZ!\n\n";
}

// Test mail gönder
echo "--- Test E-posta Gönderimi ---\n";
fwrite($socket, "MAIL FROM:<$user>\r\n");
$resp = readResp($socket);
echo "MAIL FROM: $resp\n";

fwrite($socket, "RCPT TO:<cannor.steel@gmail.com>\r\n");
$resp = readResp($socket);
echo "RCPT TO: $resp\n";

fwrite($socket, "DATA\r\n");
$resp = readResp($socket);
echo "DATA: $resp\n";

$testMsg  = "From: Luxury Transfer Test <$user>\r\n";
$testMsg .= "To: cannor.steel@gmail.com\r\n";
$testMsg .= "Subject: =?UTF-8?B?" . base64_encode("SMTP Test - " . date('H:i:s')) . "?=\r\n";
$testMsg .= "MIME-Version: 1.0\r\n";
$testMsg .= "Content-Type: text/plain; charset=UTF-8\r\n";
$testMsg .= "\r\n";
$testMsg .= "Bu bir SMTP test mesajidir.\r\nTarih: " . date('d.m.Y H:i:s') . "\r\n";

fwrite($socket, $testMsg . "\r\n.\r\n");
$resp = readResp($socket);
$code = intval(substr($resp, 0, 3));
if ($code === 250) {
    echo "GÖNDERIM: $resp ✓ BAŞARILI!\n";
    echo "\n✅ E-posta başarıyla gönderildi! cannor.steel@gmail.com adresini kontrol edin.\n";
} else {
    echo "GÖNDERIM: $resp ✗ BAŞARISIZ!\n";
}

fwrite($socket, "QUIT\r\n");
fclose($socket);

echo "\n=== TEST TAMAMLANDI ===\n";
echo "\n⚠️ GÜVENLİK: Bu dosyayı test sonrası sunucudan SİLİN!\n";
echo '</pre>';
