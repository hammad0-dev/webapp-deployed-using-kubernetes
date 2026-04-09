<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Management System</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>Student Management System</h1>
            <p>Simple application for managing student records</p>
        </header>

        <nav>
            <a href="index.php" class="active">Home</a>
            <a href="add_student.php">Add Student</a>
            <a href="view_students.php">View Students</a>
        </nav>

        <main>
            <div class="welcome-box">
                <h2>Welcome to Student Management System</h2>
                <p>This application allows you to manage student records efficiently.</p>
                
                <div class="features">
                    <div class="feature-card">
                        <h3>📝 Add Student</h3>
                        <p>Register new students by entering their name and email address.</p>
                        <a href="add_student.php" class="btn">Add Student</a>
                    </div>
                    
                    <div class="feature-card">
                        <h3>👥 View Students</h3>
                        <p>Browse all registered students and manage their records.</p>
                        <a href="view_students.php" class="btn">View Students</a>
                    </div>
                </div>
            </div>
        </main>

        <footer>
            <p>&copy; 2026 Student Management System - DevOps Assignment</p>
        </footer>
    </div>
</body>
</html>
