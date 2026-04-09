<?php
require_once 'db.php';

$message = '';
$error = '';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $name = mysqli_real_escape_string($conn, $_POST['name']);
    $email = mysqli_real_escape_string($conn, $_POST['email']);
    
    // Validate inputs
    if (empty($name) || empty($email)) {
        $error = "Both name and email are required!";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = "Please enter a valid email address!";
    } else {
        // Insert into database
        $sql = "INSERT INTO students (name, email) VALUES ('$name', '$email')";
        
        if (mysqli_query($conn, $sql)) {
            $message = "Student added successfully!";
        } else {
            $error = "Error: " . mysqli_error($conn);
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Add Student - Student Management System</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>Student Management System</h1>
            <p>Add New Student</p>
        </header>

        <nav>
            <a href="index.php">Home</a>
            <a href="add_student.php" class="active">Add Student</a>
            <a href="view_students.php">View Students</a>
        </nav>

        <main>
            <div class="form-container">
                <h2>Add New Student</h2>
                
                <?php if ($message): ?>
                    <div class="success-message"><?php echo $message; ?></div>
                <?php endif; ?>
                
                <?php if ($error): ?>
                    <div class="error-message"><?php echo $error; ?></div>
                <?php endif; ?>
                
                <form method="POST" action="add_student.php">
                    <div class="form-group">
                        <label for="name">Student Name:</label>
                        <input type="text" id="name" name="name" placeholder="Enter student name" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="email">Email Address:</label>
                        <input type="email" id="email" name="email" placeholder="Enter email address" required>
                    </div>
                    
                    <button type="submit" class="btn">Add Student</button>
                    <a href="view_students.php" class="btn btn-secondary">View All Students</a>
                </form>
            </div>
        </main>

        <footer>
            <p>&copy; 2026 Student Management System - DevOps Assignment</p>
        </footer>
    </div>
</body>
</html>
