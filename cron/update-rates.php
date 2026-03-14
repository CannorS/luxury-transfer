<?php
/**
 * TCMB Döviz Kuru Güncelleme (PHP)
 *
 * TCMB günlük kurlarını çeker ve js/exchange-rates.json dosyasını günceller.
 * Temel para birimi: EUR
 *
 * cPanel Cron Job komutu:
 * /usr/local/bin/php /home/KULLANICI/public_html/cron/update-rates.php
 *
 * Zamanlama: Her gün 09:30 (Türkiye saati)
 */

define('TCMB_URL', 'https://www.tcmb.gov.tr/kurlar/today.xml');
define('OUTPUT_FILE', __DIR__ . '/../js/exchange-rates.json');

// Türkiye saat dilimi
date_default_timezone_set('Europe/Istanbul');

function fetchTCMB() {
    // Önce cURL dene, yoksa file_get_contents
    if (function_exists('curl_init')) {
        $ch = curl_init(TCMB_URL);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 15,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_USERAGENT      => 'LuxuryTransfer-RateUpdater/1.0'
        ]);
        $xml = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($xml === false || $httpCode !== 200) {
            throw new Exception("TCMB isteği başarısız (HTTP $httpCode): $error");
        }
        return $xml;
    }

    // Fallback: file_get_contents
    $context = stream_context_create([
        'http' => [
            'timeout' => 15,
            'user_agent' => 'LuxuryTransfer-RateUpdater/1.0'
        ]
    ]);
    $xml = @file_get_contents(TCMB_URL, false, $context);
    if ($xml === false) {
        throw new Exception("TCMB isteği başarısız (file_get_contents)");
    }
    return $xml;
}

function parseRate($xmlObj, $currencyCode) {
    foreach ($xmlObj->Currency as $currency) {
        if ((string)$currency['CurrencyCode'] === $currencyCode) {
            $selling = (string)$currency->ForexSelling;
            if (empty($selling)) {
                throw new Exception("$currencyCode ForexSelling bulunamadı");
            }
            return floatval(str_replace(',', '.', $selling));
        }
    }
    throw new Exception("$currencyCode kuru bulunamadı");
}

// Ana işlem
try {
    $xmlString = fetchTCMB();
    $xml = simplexml_load_string($xmlString);

    if ($xml === false) {
        throw new Exception("XML parse hatası");
    }

    $eurTry = parseRate($xml, 'EUR');
    $usdTry = parseRate($xml, 'USD');
    $eurUsd = round($eurTry / $usdTry, 4);

    $rates = [
        'baseCurrency' => 'EUR',
        'rates' => [
            'EUR' => 1,
            'TRY' => $eurTry,
            'USD' => $eurUsd
        ],
        'source' => 'TCMB',
        'lastUpdate' => date('c'),
        'rawTCMB' => [
            'EUR_TRY' => $eurTry,
            'USD_TRY' => $usdTry
        ]
    ];

    $json = json_encode($rates, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

    // Dosyayı yaz
    $written = file_put_contents(OUTPUT_FILE, $json . "\n", LOCK_EX);
    if ($written === false) {
        throw new Exception("Dosya yazılamadı: " . OUTPUT_FILE);
    }

    $log  = "[" . date('Y-m-d H:i:s') . "] TCMB kurları güncellendi\n";
    $log .= "  1 EUR = $eurTry TRY\n";
    $log .= "  1 EUR = $eurUsd USD\n";
    $log .= "  1 USD = $usdTry TRY\n";
    echo $log;

} catch (Exception $e) {
    $msg = "[" . date('Y-m-d H:i:s') . "] HATA: " . $e->getMessage() . "\n";
    echo $msg;
    // Mevcut JSON korunur, hata olursa üzerine yazılmaz
    exit(1);
}
