<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class AuthController {
    private $db;
    private $userModel;

    public function __construct() {
        $database = new Database();
        $this->db = $database->connect();
        $this->userModel = new User($this->db);
    }

    public function register() {
        AuthMiddleware::guestOnly();

        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data) {
            $this->sendResponse(false, "Invalid JSON input", null, 400);
        }

        $full_name = trim($data['full_name'] ?? '');
        $email = trim($data['email'] ?? '');
        $phone = trim($data['phone'] ?? '');
        $password = trim($data['password'] ?? '');

        if (!$full_name || !$email || !$phone || !$password) {
            $this->sendResponse(false, "All fields are required", null, 422);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->sendResponse(false, "Invalid email format", null, 422);
        }

        if (strlen($password) < 6) {
            $this->sendResponse(false, "Password must be at least 6 characters", null, 422);
        }

        $existingUser = $this->userModel->findByEmail($email);

        if ($existingUser) {
            $this->sendResponse(false, "Email already exists", null, 409);
        }

        $password_hash = password_hash($password, PASSWORD_DEFAULT);
        $created = $this->userModel->create($full_name, $email, $phone, $password_hash);

        if ($created) {
            $this->sendResponse(true, "User registered successfully", null, 201);
        } else {
            $this->sendResponse(false, "Registration failed", null, 500);
        }
    }

    public function login() {
        AuthMiddleware::guestOnly();

        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data) {
            $this->sendResponse(false, "Invalid JSON input", null, 400);
        }

        $email = trim($data['email'] ?? '');
        $password = trim($data['password'] ?? '');

        if (!$email || !$password) {
            $this->sendResponse(false, "Email and password are required", null, 422);
        }

        $user = $this->userModel->findByEmail($email);

        if (!$user || !password_verify($password, $user['password_hash'])) {
            $this->sendResponse(false, "Invalid email or password", null, 401);
        }

        AuthMiddleware::startSession();
        session_regenerate_id(true);
        $_SESSION['user_id'] = (int) $user['id'];
        $_SESSION['active_business_profile_id'] = $_SESSION['active_business_profile_id'] ?? null;

        $this->sendResponse(true, "Login successful", [
            "user" => [
                "id" => $user['id'],
                "full_name" => $user['full_name'],
                "email" => $user['email'],
                "phone" => $user['phone']
            ],
            "active_business_profile_id" => $_SESSION['active_business_profile_id']
        ]);
    }

    public function me() {
        $user_id = AuthMiddleware::requireAuth();
        $user = $this->userModel->findById($user_id);

        if (!$user) {
            $this->sendResponse(false, "User not found", null, 404);
        }

        unset($user['password_hash']);

        $this->sendResponse(true, "User fetched successfully", [
            "user" => $user,
            "active_business_profile_id" => $_SESSION['active_business_profile_id'] ?? null
        ]);
    }

    public function logout() {
        AuthMiddleware::requireAuth();
        AuthMiddleware::logout();
    }

    private function sendResponse($success, $message, $data = null, $statusCode = 200) {
        http_response_code($statusCode);
        header("Content-Type: application/json");
        echo json_encode([
            "success" => $success,
            "message" => $message,
            "data" => $data
        ]);
        exit;
    }
}
?>