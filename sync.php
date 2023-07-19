<?php
$data = json_decode(file_get_contents('php://input'), true);
$servername = "3.6.27.67";
$username = "todolist";
$password = "T2DiXxrNdADW8ksH";
$database = "todolist";

$conn = new mysqli($servername, $username, $password, $database);
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

foreach ($data as $item) {
  $todo = $item['todo'];
  $sql = "INSERT INTO todos (todo) VALUES ('$todo')";
  $conn->query($sql);
}

$conn->close();
?>
