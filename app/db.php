<?php
$host = "mysql-service";
$user = "root";
$password = "rootpassword";
$dbname = "studentdb";

$conn = new mysqli($host, $user, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>