<?php
/**
 * Lightweight SMTP Mailer - Harici bağımlılık gerektirmez
 */
class SmtpMailer {
    private $host;
    private $port;
    private $user;
    private $pass;
    private $socket;
    private $log = [];

    public function __construct($host, $port, $user, $pass) {
        $this->host = $host;
        $this->port = $port;
        $this->user = $user;
        $this->pass = $pass;
    }

    public function send($from, $fromName, $to, $subject, $htmlBody) {
        // SSL bağlantısı
        $this->socket = @fsockopen(
            'ssl://' . $this->host,
            $this->port,
            $errno, $errstr, 10
        );

        if (!$this->socket) {
            throw new Exception("SMTP bağlantı hatası: $errstr ($errno)");
        }

        stream_set_timeout($this->socket, 10);

        $this->readResponse(220);
        $this->sendCommand("EHLO " . gethostname(), 250);
        $this->sendCommand("AUTH LOGIN", 334);
        $this->sendCommand(base64_encode($this->user), 334);
        $this->sendCommand(base64_encode($this->pass), 235);
        $this->sendCommand("MAIL FROM:<{$from}>", 250);

        // Birden fazla alıcı
        $recipients = is_array($to) ? $to : [$to];
        foreach ($recipients as $recipient) {
            $this->sendCommand("RCPT TO:<{$recipient}>", 250);
        }

        $this->sendCommand("DATA", 354);

        // Mail headers + body
        $toHeader = implode(', ', $recipients);
        $boundary = md5(uniqid(time()));

        $headers  = "From: {$fromName} <{$from}>\r\n";
        $headers .= "To: {$toHeader}\r\n";
        $headers .= "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=\r\n";
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: multipart/alternative; boundary=\"{$boundary}\"\r\n";
        $headers .= "Date: " . date('r') . "\r\n";
        $headers .= "\r\n";

        // Plain text version
        $plainText = strip_tags(str_replace(['<br>', '<br/>', '<br />', '</tr>'], "\n", $htmlBody));
        $plainText = html_entity_decode($plainText, ENT_QUOTES, 'UTF-8');

        $body  = "--{$boundary}\r\n";
        $body .= "Content-Type: text/plain; charset=UTF-8\r\n";
        $body .= "Content-Transfer-Encoding: base64\r\n\r\n";
        $body .= chunk_split(base64_encode($plainText)) . "\r\n";
        $body .= "--{$boundary}\r\n";
        $body .= "Content-Type: text/html; charset=UTF-8\r\n";
        $body .= "Content-Transfer-Encoding: base64\r\n\r\n";
        $body .= chunk_split(base64_encode($htmlBody)) . "\r\n";
        $body .= "--{$boundary}--\r\n";

        // Noktayla başlayan satırları escape et
        $message = $headers . $body;
        $message = str_replace("\n.", "\n..", $message);

        fwrite($this->socket, $message . "\r\n.\r\n");
        $this->readResponse(250);

        $this->sendCommand("QUIT", 221);
        fclose($this->socket);

        return true;
    }

    private function sendCommand($cmd, $expectedCode) {
        fwrite($this->socket, $cmd . "\r\n");
        return $this->readResponse($expectedCode);
    }

    private function readResponse($expectedCode) {
        $response = '';
        while ($line = fgets($this->socket, 512)) {
            $response .= $line;
            if (substr($line, 3, 1) === ' ') break;
        }
        $this->log[] = trim($response);
        $code = intval(substr($response, 0, 3));
        if ($code !== $expectedCode) {
            throw new Exception("SMTP hatası (beklenen: $expectedCode, gelen: $code): " . trim($response));
        }
        return $response;
    }

    public function getLog() {
        return $this->log;
    }
}
