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

        return $_SESSION['user_id'];
    }

    public static function guestOnly() {
        self::startSession();

        if (isset($_SESSION['user_id'])) {
            self::sendJson(409, false, "You are already logged in.", null);
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
