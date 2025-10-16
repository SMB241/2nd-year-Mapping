<?php
header('Content-Type: application/json');

$host = "localhost";
$user = "root";
$pass = "";
$db   = "mappinggproject";

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    echo json_encode([
        "status" => "error",
        "message" => "DB connection failed: " . $conn->connect_error
    ]);
    exit;
}

// Get categories array from POST
$categories = isset($_POST['categoryList']) ? $_POST['categoryList'] : [];

if (!is_array($categories)) {
    $categories = [];
}

if (count($categories) === 0) {
    // No category filter, select all
    $sql = "SELECT latitude, longitude, category, name, description, id FROM locationtagging";
    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        echo json_encode([
            "status" => "error",
            "message" => "Prepare failed: " . $conn->error
        ]);
        exit;
    }
} else {
    // Filter by selected categories
    $placeholders = implode(',', array_fill(0, count($categories), '?'));
    $sql = "SELECT latitude, longitude, category, name, description, id FROM locationtagging WHERE category IN ($placeholders)";
    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        echo json_encode([
            "status" => "error",
            "message" => "Prepare failed: " . $conn->error
        ]);
        exit;
    }
    $types = str_repeat('s', count($categories));
    $stmt->bind_param($types, ...$categories);
}

$stmt->execute();
$result = $stmt->get_result();

$locations = [];
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $locations[] = $row;
    }
}

echo json_encode([
    "status" => "success",
    "data" => $locations
]);

$stmt->close();
$conn->close();
