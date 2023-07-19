<?php
// Retrieve the POST data
$data = json_decode(file_get_contents('php://input'), true);

// Perform necessary validation and sanitization

$servername = "3.6.27.67";
$username = "todolist";
$password = "T2DiXxrNdADW8ksH";
$database = "todolist";

$conn = new mysqli($servername, $username, $password, $database);
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

// Retrieve the id from the POST data
$id = $data['id'];

// Prepare and execute the SQL query to delete the item
$stmt = $conn->prepare("DELETE FROM todos WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();

// Check if the deletion was successful
if ($stmt->affected_rows > 0) {
  // Deletion successful
  http_response_code(200);
} else {
  // No rows affected, deletion unsuccessful
  http_response_code(400);
}

$stmt->close();
$conn->close();
?>
