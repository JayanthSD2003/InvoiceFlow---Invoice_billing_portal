<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/BusinessProfile.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class ProfileController {
    private $db;
    private $businessProfileModel;

    public function __construct() {
        $database = new Database();
        $this->db = $database->connect();
        $this->businessProfileModel = new BusinessProfile($this->db);
    }

    private function transformProfile($profile) {
        if (!$profile) return null;

        return [
            "id" => $profile["id"] ?? null,
            "user_id" => $profile["user_id"] ?? null,
            "business_name" => $profile["profile_name"] ?? "",
            "owner_name" => $profile["owner_name"] ?? "",
            "profile_type" => $profile["profile_type"] ?? "business",
            "is_gst_registered" => (bool) ($profile["is_gst_registered"] ?? false),
            "email" => $profile["business_email"] ?? "",
            "phone" => $profile["business_phone"] ?? "",
            "address" => $profile["address"] ?? "",
            "tax_number" => $profile["tax_number"] ?? "",
            "pan_number" => $profile["pan_number"] ?? "",
            "created_at" => $profile["created_at"] ?? null,
            "updated_at" => $profile["updated_at"] ?? null
        ];
    }

    public function index() {
        try {
            $user_id = AuthMiddleware::requireAuth();
            $profiles = $this->businessProfileModel->getAllByUserId($user_id);
            $active_profile_id = $_SESSION['active_business_profile_id'] ?? null;

            $mapped = array_map(function ($profile) use ($active_profile_id) {
                $item = $this->transformProfile($profile);
                $item["is_active"] = ((int) $profile["id"] === (int) $active_profile_id);
                return $item;
            }, $profiles);

            $this->sendResponse(true, "Profiles fetched successfully", [
                "profiles" => $mapped,
                "active_business_profile_id" => $active_profile_id
            ]);
        } catch (Throwable $e) {
            $this->sendResponse(false, "Profile error: " . $e->getMessage(), null, 500);
        }
    }

    public function getActiveProfile() {
        try {
            $user_id = AuthMiddleware::requireAuth();
            $active_profile_id = $_SESSION['active_business_profile_id'] ?? null;

            if (!$active_profile_id) {
                $this->sendResponse(false, "No active business profile selected", null, 404);
            }

            $profile = $this->businessProfileModel->getByIdAndUserId((int) $active_profile_id, $user_id);

            if (!$profile) {
                $this->sendResponse(false, "Active business profile not found", null, 404);
            }

            $this->sendResponse(true, "Active business profile fetched successfully", [
                "profile" => $this->transformProfile($profile),
                "active_business_profile_id" => (int) $active_profile_id
            ]);
        } catch (Throwable $e) {
            $this->sendResponse(false, "Profile error: " . $e->getMessage(), null, 500);
        }
    }

    public function createProfile() {
        try {
            $user_id = AuthMiddleware::requireAuth();
            $data = json_decode(file_get_contents("php://input"), true);

            if (!$data) {
                $this->sendResponse(false, "Invalid JSON input", null, 400);
            }

            $business_name = trim($data['business_name'] ?? '');
            $owner_name = trim($data['owner_name'] ?? '');
            $email = trim($data['email'] ?? '');
            $phone = trim($data['phone'] ?? '');
            $address = trim($data['address'] ?? '');
            $tax_number = trim($data['tax_number'] ?? '');
            $pan_number = trim($data['pan_number'] ?? '');
            $is_gst_registered = isset($data['is_gst_registered']) ? (int) filter_var($data['is_gst_registered'], FILTER_VALIDATE_BOOLEAN) : 0;

            if (!$business_name || !$owner_name || !$email) {
                $this->sendResponse(false, "Business name, owner name, and email are required", null, 422);
            }

            $created = $this->businessProfileModel->create(
                $user_id,
                $business_name,
                $owner_name,
                $email,
                $phone,
                $address,
                $tax_number,
                $pan_number,
                $is_gst_registered
            );

            if (!$created) {
                $this->sendResponse(false, "Failed to create business profile", null, 500);
            }

            $profile = $this->businessProfileModel->findLatestByUserId($user_id);

            if (!isset($_SESSION['active_business_profile_id']) || !$_SESSION['active_business_profile_id']) {
                $_SESSION['active_business_profile_id'] = (int) $profile['id'];
            }

            $this->sendResponse(true, "Business profile created successfully", [
                "profile" => $this->transformProfile($profile),
                "active_business_profile_id" => $_SESSION['active_business_profile_id']
            ], 201);

        } catch (Throwable $e) {
            $this->sendResponse(false, "Profile error: " . $e->getMessage(), null, 500);
        }
    }

    public function selectProfile() {
        try {
            $user_id = AuthMiddleware::requireAuth();
            $data = json_decode(file_get_contents("php://input"), true);

            if (!$data) {
                $this->sendResponse(false, "Invalid JSON input", null, 400);
            }

            $profile_id = isset($data['profile_id']) ? (int) $data['profile_id'] : 0;

            if ($profile_id <= 0) {
                $this->sendResponse(false, "Valid profile_id is required", null, 422);
            }

            $profile = $this->businessProfileModel->getByIdAndUserId($profile_id, $user_id);

            if (!$profile) {
                $this->sendResponse(false, "Profile not found", null, 404);
            }

            $_SESSION['active_business_profile_id'] = (int) $profile['id'];

            $this->sendResponse(true, "Active profile selected successfully", [
                "active_business_profile_id" => (int) $profile['id'],
                "profile" => $this->transformProfile($profile)
            ]);
        } catch (Throwable $e) {
            $this->sendResponse(false, "Profile error: " . $e->getMessage(), null, 500);
        }
    }

    public function updateProfile() {
        try {
            $user_id = AuthMiddleware::requireAuth();
            $data = json_decode(file_get_contents("php://input"), true);

            if (!$data) {
                $this->sendResponse(false, "Invalid JSON input", null, 400);
            }

            $profile_id = isset($data['profile_id']) ? (int) $data['profile_id'] : 0;
            $business_name = trim($data['business_name'] ?? '');
            $owner_name = trim($data['owner_name'] ?? '');
            $email = trim($data['email'] ?? '');
            $phone = trim($data['phone'] ?? '');
            $address = trim($data['address'] ?? '');
            $tax_number = trim($data['tax_number'] ?? '');
            $pan_number = trim($data['pan_number'] ?? '');
            $is_gst_registered = isset($data['is_gst_registered']) ? (int) filter_var($data['is_gst_registered'], FILTER_VALIDATE_BOOLEAN) : 0;

            if ($profile_id <= 0) {
                $this->sendResponse(false, "Valid profile_id is required", null, 422);
            }

            if (!$business_name || !$owner_name || !$email) {
                $this->sendResponse(false, "Business name, owner name, and email are required", null, 422);
            }

            $existingProfile = $this->businessProfileModel->getByIdAndUserId($profile_id, $user_id);

            if (!$existingProfile) {
                $this->sendResponse(false, "Business profile not found", null, 404);
            }

            $updated = $this->businessProfileModel->updateById(
                $profile_id,
                $user_id,
                $business_name,
                $owner_name,
                $email,
                $phone,
                $address,
                $tax_number,
                $pan_number,
                $is_gst_registered
            );

            if (!$updated) {
                $this->sendResponse(false, "Failed to update business profile", null, 500);
            }

            $profile = $this->businessProfileModel->getByIdAndUserId($profile_id, $user_id);

            $this->sendResponse(true, "Business profile updated successfully", [
                "profile" => $this->transformProfile($profile)
            ]);

        } catch (Throwable $e) {
            $this->sendResponse(false, "Profile error: " . $e->getMessage(), null, 500);
        }
    }

    public function deleteProfile() {
        try {
            $user_id = AuthMiddleware::requireAuth();
            $data = json_decode(file_get_contents("php://input"), true);

            if (!$data) {
                $this->sendResponse(false, "Invalid JSON input", null, 400);
            }

            $profile_id = isset($data['profile_id']) ? (int) $data['profile_id'] : 0;

            if ($profile_id <= 0) {
                $this->sendResponse(false, "Valid profile_id is required", null, 422);
            }

            $existingProfile = $this->businessProfileModel->getByIdAndUserId($profile_id, $user_id);

            if (!$existingProfile) {
                $this->sendResponse(false, "Business profile not found", null, 404);
            }

            $deleted = $this->businessProfileModel->deleteById($profile_id, $user_id);

            if (!$deleted) {
                $this->sendResponse(false, "Failed to delete business profile", null, 500);
            }

            if (isset($_SESSION['active_business_profile_id']) && (int) $_SESSION['active_business_profile_id'] === $profile_id) {
                $_SESSION['active_business_profile_id'] = null;

                $remainingProfiles = $this->businessProfileModel->getAllByUserId($user_id);
                if (!empty($remainingProfiles)) {
                    $_SESSION['active_business_profile_id'] = (int) $remainingProfiles[0]['id'];
                }
            }

            $this->sendResponse(true, "Business profile deleted successfully", [
                "active_business_profile_id" => $_SESSION['active_business_profile_id'] ?? null
            ]);

        } catch (Throwable $e) {
            $this->sendResponse(false, "Profile error: " . $e->getMessage(), null, 500);
        }
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