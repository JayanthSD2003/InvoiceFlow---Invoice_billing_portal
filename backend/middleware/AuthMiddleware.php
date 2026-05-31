<?php

class AuthMiddleware {
    public static function startSession() {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            session_set_cookie_params([
                'lifetime' => 0,
                'path' => '/',
                'domain' => '',
                'secure' => false,
                'httponly' => true,
                'samesite' => 'Lax',
            ]);

            session_start();
        }
    }

    private static function sendJson($statusCode, $success, $message, $data = null) {
        http_response_code($statusCode);
        header("Content-Type: application/json");
        echo json_encode([
            "success" => $success,
            "message" => $message,
            "data" => $data
        ]);
        exit;
    }

    public static function requireAuth() {
        self::startSession();

        if (!isset($_SESSION['user_id'])) {
            self::sendJson(401, false, "Unauthorized. Please log in first.", null);
        }

        // Verify that the user still exists in the database
        require_once __DIR__ . '/../config/database.php';
        require_once __DIR__ . '/../models/User.php';
        
        try {
            $database = new Database();
            $db = $database->connect();
            $userModel = new User($db);
            
            if (!$userModel->findById((int) $_SESSION['user_id'])) {
                // User was deleted or database cleared, destroy session
                session_unset();
                session_destroy();
                self::sendJson(401, false, "Session expired or user not found. Please log in again.", null);
            }
        } catch (Exception $e) {
            // Fallback: If database connection fails, let the controller handle it
        }

        return $_SESSION['user_id'];
    }

    public static function guestOnly() {
        self::startSession();

        if (isset($_SESSION['user_id'])) {
            // Verify that the user still exists in the database
            require_once __DIR__ . '/../config/database.php';
            require_once __DIR__ . '/../models/User.php';
            
            try {
                $database = new Database();
                $db = $database->connect();
                $userModel = new User($db);
                
                if ($userModel->findById((int) $_SESSION['user_id'])) {
                    self::sendJson(409, false, "You are already logged in.", null);
                } else {
                    // Stale session, destroy it so the guest request can proceed
                    session_unset();
                    session_destroy();
                }
            } catch (Exception $e) {
                // Fallback: If database connection fails, allow request
            }
        }
    }

    public static function logout() {
        self::startSession();
        session_unset();
        session_destroy();

        self::sendJson(200, true, "Logged out successfully", null);
    }
}
?>
