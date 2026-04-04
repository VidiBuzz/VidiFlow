<?php
// Database credentials
// UPDATE THESE WITH YOUR POSTGRESQL DATABASE CREDENTIALS
$host = 'localhost';
$port = '5432';
$dbname = 'vidismart_tech';
$username = 'postgres'; // Change this
$password = '';         // Change this

try {
    $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    // In production, log this error instead of showing it
    die("Connection failed: " . $e->getMessage());
}
?>
