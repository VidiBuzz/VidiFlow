<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Allow CORS for testing

require_once 'db_connect.php';

try {
    $stmt = $pdo->query("SELECT * FROM tech_items ORDER BY category, name");
    $items = $stmt->fetchAll();

    $techData = [];

    foreach ($items as $item) {
        $category = $item['category'];
        if (!isset($techData[$category])) {
            $techData[$category] = [];
        }

        $techItem = [
            'id' => $item['slug'],
            'name' => $item['name'],
            'description' => $item['description']
        ];

        if (!empty($item['website'])) {
            $techItem['website'] = $item['website'];
        }

        if (!empty($item['video_url'])) {
            $techItem['video'] = $item['video_url'];
        }

        $techData[$category][] = $techItem;
    }

    echo json_encode($techData);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
