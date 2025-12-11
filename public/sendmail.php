<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Decode JSON input
$data = json_decode(file_get_contents("php://input"));

if (!$data) {
    echo json_encode(["status" => "error", "message" => "No data received"]);
    exit;
}

$name = $data->name;
$email = $data->email;
$subject = $data->subject;
$message = $data->message;

// Load SMTP Credentials
// We use require_once so the script fails if the credentials are missing
require_once 'smtp_config.php';

// Ensure variables exist
if (!isset($smtpHost) || !isset($smtpPort) || !isset($smtpUser) || !isset($smtpPass)) {
    echo json_encode(["status" => "error", "message" => "SMTP configuration missing"]);
    exit;
}

// Simple PHP Mailer Function using socket (minimal dependency free SMTP)
function sendSMTP($host, $port, $username, $password, $from, $to, $subject, $body)
{
    $err = "Error: ";
    $socket = fsockopen("ssl://" . $host, $port, $errno, $errstr, 10);
    if (!$socket)
        return ["status" => "error", "message" => "Could not connect to SMTP host: $errstr ($errno)"];

    function readResponse($socket)
    {
        $response = "";
        while ($str = fgets($socket, 515)) {
            $response .= $str;
            if (substr($str, 3, 1) == " ")
                break;
        }
        return $response;
    }

    function sendCommand($socket, $cmd)
    {
        fputs($socket, $cmd . "\r\n");
        return readResponse($socket);
    }

    readResponse($socket); // clear banner
    sendCommand($socket, "EHLO " . $host);
    sendCommand($socket, "AUTH LOGIN");
    sendCommand($socket, base64_encode($username));
    sendCommand($socket, base64_encode($password));
    sendCommand($socket, "MAIL FROM: <$from>");
    sendCommand($socket, "RCPT TO: <$to>");
    sendCommand($socket, "DATA");

    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $headers .= "From: $from\r\n";
    $headers .= "Reply-To: $from\r\n";
    $headers .= "Subject: $subject\r\n";
    $headers .= "X-Mailer: PHP/SMTP\r\n";

    $emailContent = "$headers\r\n$body\r\n.";

    $result = sendCommand($socket, $emailContent);
    sendCommand($socket, "QUIT");
    fclose($socket);

    if (strpos($result, "250") !== false) {
        return ["status" => "success", "message" => "Email sent successfully"];
    } else {
        return ["status" => "error", "message" => "Failed to send email: " . $result];
    }
}

// Prepare the email body
$fullMessage = "Name: $name\n";
$fullMessage .= "Email: $email\n";
$fullMessage .= "Subject: $subject\n\n";
$fullMessage .= "Message:\n$message";

// Send the email
// Note: We send FROM the SMTP user (authenticated) but set Reply-To as the visitor
$result = sendSMTP($smtpHost, $smtpPort, $smtpUser, $smtpPass, $smtpUser, $smtpUser, "New Contact Form Submission: $subject", $fullMessage);

echo json_encode($result);
?>