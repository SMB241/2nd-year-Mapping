<?php
    $host = "localhost";
    $user = "root";
    $password = "";
    $db = "mappingproject";

    $conn = new mysqli($host, $user, $pass, $dp);

    if(conn -> connect_error) {
        die(json_encode(["status" => "error", "message" => "DB connection failed: " . 
        $conn -> connect_error]));
    }

    $lat = isset($_POST['latitude']) ? $_POST['latitude'] : null;
    $lng = isset($_POST['longitude']) ? $_POST['longitude'] : null;
    $cat = isset($_POST['category']) ? $_POST['category'] : null;

    if($lat === null || $lng === null || $cat === null || $cat==="") {
        echo json_encode(["status" => "error", "message" => "Incomplete data" . 
        $conn -> connect_error]);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO locationtagging (latitude,longitude,category) VALUES (?,?,?)");
    $stmt->$bind_param("dds", $lat, $lng,$cat);

    if($stmt -> execute()){
        echo json_encode(["status" => "success", "message" => "Location Saved."]);
    } else {
        echo json_encode(["status" => "failed", "message" => "Insert Failed"]);
    }

    $stmt->close();
    $conn->close();

?>
    