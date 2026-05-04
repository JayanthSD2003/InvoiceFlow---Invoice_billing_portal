<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/BusinessProfile.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class DashboardController {
    private $db;
    private $businessProfileModel;

    public function __construct() {
        $database = new Database();
        $this->db = $database->connect();
        $this->businessProfileModel = new BusinessProfile($this->db);
    }

    private function getBusinessProfileId() {
        $user_id = AuthMiddleware::requireAuth();

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

    public function getStats() {
        try {
            $business_profile_id = $this->getBusinessProfileId();

            $stats = [
                "total_clients" => $this->getTotalClients($business_profile_id),
                "total_invoice_amount" => $this->getTotalInvoiceAmount($business_profile_id),
                "total_revenue" => $this->getTotalRevenue($business_profile_id),
                "pending_amount" => $this->getPendingAmount($business_profile_id),
                "pending_invoices" => $this->getInvoiceCountByStatus($business_profile_id, 'pending'),
                "partially_paid_invoices" => $this->getInvoiceCountByStatus($business_profile_id, 'partially_paid'),
                "paid_invoices" => $this->getInvoiceCountByStatus($business_profile_id, 'paid')
            ];

            $this->sendResponse(true, "Dashboard stats fetched successfully", $stats);

        } catch (Throwable $e) {
            $this->sendResponse(false, "Dashboard error: " . $e->getMessage(), null, 500);
        }
    }

    private function getTotalClients($business_profile_id) {
        $query = "SELECT COUNT(*) AS total_clients
                  FROM clients
                  WHERE business_profile_id = :business_profile_id";

        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':business_profile_id', $business_profile_id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int) ($row['total_clients'] ?? 0);
    }

    private function getTotalInvoiceAmount($business_profile_id) {
        $query = "SELECT COALESCE(SUM(total_amount), 0) AS total_invoice_amount
                  FROM invoices
                  WHERE business_profile_id = :business_profile_id";

        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':business_profile_id', $business_profile_id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return (float) ($row['total_invoice_amount'] ?? 0);
    }

    private function getTotalRevenue($business_profile_id) {
        $query = "SELECT COALESCE(SUM(p.amount_paid), 0) AS total_revenue
                  FROM payments p
                  INNER JOIN invoices i ON p.invoice_id = i.id
                  WHERE i.business_profile_id = :business_profile_id";

        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':business_profile_id', $business_profile_id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return (float) ($row['total_revenue'] ?? 0);
    }

    private function getPendingAmount($business_profile_id) {
        $query = "SELECT
                    COALESCE(SUM(i.total_amount), 0) - COALESCE(SUM(pay.total_paid), 0) AS pending_amount
                  FROM invoices i
                  LEFT JOIN (
                      SELECT invoice_id, SUM(amount_paid) AS total_paid
                      FROM payments
                      GROUP BY invoice_id
                  ) pay ON i.id = pay.invoice_id
                  WHERE i.business_profile_id = :business_profile_id";

        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':business_profile_id', $business_profile_id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return (float) ($row['pending_amount'] ?? 0);
    }

    private function getInvoiceCountByStatus($business_profile_id, $status) {
        $query = "SELECT COUNT(*) AS total
                  FROM invoices
                  WHERE business_profile_id = :business_profile_id
                  AND status = :status";

        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':business_profile_id', $business_profile_id);
        $stmt->bindParam(':status', $status);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int) ($row['total'] ?? 0);
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