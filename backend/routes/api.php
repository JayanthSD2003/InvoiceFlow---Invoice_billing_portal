<?php

require_once __DIR__ . '/../middleware/AuthMiddleware.php';

AuthMiddleware::startSession();

header("Content-Type: application/json");

$allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
}

header("Vary: Origin");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept");

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/ClientController.php';
require_once __DIR__ . '/../controllers/InvoiceController.php';
require_once __DIR__ . '/../controllers/PaymentController.php';
require_once __DIR__ . '/../controllers/DashboardController.php';
require_once __DIR__ . '/../controllers/ProfileController.php';

$authController = new AuthController();
$clientController = new ClientController();
$invoiceController = new InvoiceController();
$paymentController = new PaymentController();
$dashboardController = new DashboardController();
$profileController = new ProfileController();

$requestMethod = $_SERVER['REQUEST_METHOD'] ?? '';
$route = $_GET['route'] ?? '';

switch ($route) {
    case 'register':
        if ($requestMethod === 'POST') {
            $authController->register();
            exit;
        }
        break;

    case 'login':
        if ($requestMethod === 'POST') {
            $authController->login();
            exit;
        }
        break;

    case 'me':
        if ($requestMethod === 'GET') {
            AuthMiddleware::requireAuth();
            $authController->me();
            exit;
        }
        break;

    case 'logout':
        if ($requestMethod === 'POST') {
            AuthMiddleware::requireAuth();
            $authController->logout();
            exit;
        }
        break;

    case 'clients':
        AuthMiddleware::requireAuth();

        if ($requestMethod === 'POST') {
            $clientController->create();
            exit;
        } elseif ($requestMethod === 'GET' && isset($_GET['id'])) {
            $clientController->show();
            exit;
        } elseif ($requestMethod === 'GET') {
            $clientController->index();
            exit;
        } elseif ($requestMethod === 'PUT') {
            $clientController->update();
            exit;
        } elseif ($requestMethod === 'DELETE') {
            $clientController->delete();
            exit;
        }
        break;

    case 'invoices':
        AuthMiddleware::requireAuth();

        if ($requestMethod === 'POST') {
            $invoiceController->create();
            exit;
        } elseif ($requestMethod === 'GET' && isset($_GET['id'])) {
            $invoiceController->show();
            exit;
        } elseif ($requestMethod === 'GET') {
            $invoiceController->index();
            exit;
        } elseif ($requestMethod === 'PUT') {
            $invoiceController->update();
            exit;
        } elseif ($requestMethod === 'DELETE') {
            $invoiceController->delete();
            exit;
        }
        break;

    case 'payments':
        AuthMiddleware::requireAuth();

        if ($requestMethod === 'POST') {
            $paymentController->create();
            exit;
        } elseif ($requestMethod === 'GET' && isset($_GET['invoice_id'])) {
            $paymentController->listByInvoice();
            exit;
        } else {
            http_response_code(405);
            echo json_encode([
                "success" => false,
                "message" => "Method not allowed for payments route",
                "data" => null
            ]);
            exit;
        }

    case 'dashboard':
        if ($requestMethod === 'GET') {
            AuthMiddleware::requireAuth();
            $dashboardController->getStats();
            exit;
        }
        break;

    case 'profiles':
        AuthMiddleware::requireAuth();

        if ($requestMethod === 'GET') {
            $profileController->index();
            exit;
        } elseif ($requestMethod === 'POST') {
            $profileController->createProfile();
            exit;
        }
        break;

    case 'profiles/active':
        AuthMiddleware::requireAuth();

        if ($requestMethod === 'GET') {
            $profileController->getActiveProfile();
            exit;
        }
        break;

    case 'profiles/select':
        AuthMiddleware::requireAuth();

        if ($requestMethod === 'POST') {
            $profileController->selectProfile();
            exit;
        }
        break;

    case 'profiles/update':
        AuthMiddleware::requireAuth();

        if ($requestMethod === 'PUT') {
            $profileController->updateProfile();
            exit;
        }
        break;

    case 'profiles/delete':
        AuthMiddleware::requireAuth();

        if ($requestMethod === 'DELETE') {
            $profileController->deleteProfile();
            exit;
        }
        break;
}

http_response_code(404);
echo json_encode([
    "success" => false,
    "message" => "Route not found",
    "data" => null
]);
exit;
?>