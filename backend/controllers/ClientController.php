<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Client.php';
require_once __DIR__ . '/../models/BusinessProfile.php';

class ClientController {
    private $db;
    private $clientModel;
    private $businessProfileModel;

    public function __construct() {
        $database = new Database();
        $this->db = $database->connect();
        $this->clientModel = new Client($this->db);
        $this->businessProfileModel = new BusinessProfile($this->db);
    }

    private function requireAuth() {
        if (!isset($_SESSION['user_id'])) {
            $this->sendResponse(false, "Unauthorized", null, 401);
        }
        return $_SESSION['user_id'];
    }

    private function getBusinessProfileId() {
        $user_id = $this->requireAuth();

        if (!isset($_SESSION['active_business_profile_id']) || (int) $_SESSION['active_business_profile_id'] <= 0) {
            $this->sendResponse(false, "Please select a business profile first", null, 404);
        }

        $profile_id = (int) $_SESSION['active_business_profile_id'];
        $profile = $this->businessProfileModel->getByIdAndUserId($profile_id, $user_id);

        if (!$profile) {
            $this->sendResponse(false, "Invalid active business profile", null, 404);
        }

        return (int) $profile['id'];
    }

    public function create() {
        $business_profile_id = $this->getBusinessProfileId();
        $data = json_decode(file_get_contents("php://input"), true);

        $client_name = trim($data['client_name'] ?? '');
        $company_name = trim($data['company_name'] ?? '');
        $email = trim($data['email'] ?? '');
        $phone = trim($data['phone'] ?? '');
        $address = trim($data['address'] ?? '');
        $city = trim($data['city'] ?? '');
        $state = trim($data['state'] ?? '');
        $country = trim($data['country'] ?? '');
        $postal_code = trim($data['postal_code'] ?? '');
        $notes = trim($data['notes'] ?? '');

        if (!$client_name) {
            $this->sendResponse(false, "Client name is required", null, 422);
        }

        if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->sendResponse(false, "Invalid email format", null, 422);
        }

        $created = $this->clientModel->create(
            $business_profile_id,
            $client_name,
            $company_name,
            $email,
            $phone,
            $address,
            $city,
            $state,
            $country,
            $postal_code,
            $notes
        );

        if ($created) {
            $this->sendResponse(true, "Client created successfully", null, 201);
        } else {
            $this->sendResponse(false, "Failed to create client", null, 500);
        }
    }

    public function index() {
        $business_profile_id = $this->getBusinessProfileId();
        $clients = $this->clientModel->getAllByBusinessProfile($business_profile_id);
        $this->sendResponse(true, "Clients fetched successfully", $clients);
    }

    public function show() {
        $business_profile_id = $this->getBusinessProfileId();
        $id = $_GET['id'] ?? null;

        if (!$id) {
            $this->sendResponse(false, "Client ID is required", null, 422);
        }

        $client = $this->clientModel->getById($id, $business_profile_id);

        if (!$client) {
            $this->sendResponse(false, "Client not found", null, 404);
        }

        $this->sendResponse(true, "Client fetched successfully", $client);
    }

    public function update() {
        $business_profile_id = $this->getBusinessProfileId();
        $id = $_GET['id'] ?? null;
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$id) {
            $this->sendResponse(false, "Client ID is required", null, 422);
        }

        $client_name = trim($data['client_name'] ?? '');
        $company_name = trim($data['company_name'] ?? '');
        $email = trim($data['email'] ?? '');
        $phone = trim($data['phone'] ?? '');
        $address = trim($data['address'] ?? '');
        $city = trim($data['city'] ?? '');
        $state = trim($data['state'] ?? '');
        $country = trim($data['country'] ?? '');
        $postal_code = trim($data['postal_code'] ?? '');
        $notes = trim($data['notes'] ?? '');

        if (!$client_name) {
            $this->sendResponse(false, "Client name is required", null, 422);
        }

        if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->sendResponse(false, "Invalid email format", null, 422);
        }

        $updated = $this->clientModel->update(
            $id,
            $business_profile_id,
            $client_name,
            $company_name,
            $email,
            $phone,
            $address,
            $city,
            $state,
            $country,
            $postal_code,
            $notes
        );

        if ($updated) {
            $this->sendResponse(true, "Client updated successfully");
        } else {
            $this->sendResponse(false, "Failed to update client", null, 500);
        }
    }

    public function delete() {
        $business_profile_id = $this->getBusinessProfileId();
        $id = $_GET['id'] ?? null;

        if (!$id) {
            $this->sendResponse(false, "Client ID is required", null, 422);
        }

        $deleted = $this->clientModel->delete($id, $business_profile_id);

        if ($deleted) {
            $this->sendResponse(true, "Client deleted successfully");
        } else {
            $this->sendResponse(false, "Failed to delete client", null, 500);
        }
    }

    private function sendResponse($success, $message, $data = null, $statusCode = 200) {
        http_response_code($statusCode);
        echo json_encode([
            "success" => $success,
            "message" => $message,
            "data" => $data
        ]);
        exit;
    }
}
?>