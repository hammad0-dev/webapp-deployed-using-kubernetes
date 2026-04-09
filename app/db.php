<?php
$host = "db";
$user = "root";
$password = "password";
$dbname = "studentsdb";

$conn = new mysqli($host, $user, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>