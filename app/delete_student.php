<?php
require_once 'db.php';

if (isset($_GET['id'])) {
    $id = intval($_GET['id']);
    
    // Delete student
    $sql = "DELETE FROM students WHERE id = $id";
    
    if (mysqli_query($conn, $sql)) {
        header("Location: view_students.php?message=deleted");
        exit();
    } else {
        header("Location: view_students.php?error=delete_failed");
        exit();
    }
} else {
    header("Location: view_students.php");
    exit();
}
?>
