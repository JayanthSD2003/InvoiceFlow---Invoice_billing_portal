<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Payment.php';
require_once __DIR__ . '/../models/Invoice.php';
require_once __DIR__ . '/../models/BusinessProfile.php';

class PaymentController {
    private $db;
    private $paymentModel;
    private $invoiceModel;
    private $businessProfileModel;

    public function __construct() {
        $database = new Database();
        $this->db = $database->connect();
        $this->paymentModel = new Payment($this->db);
        $this->invoiceModel = new Invoice($this->db);
        $this->businessProfileModel = new BusinessProfile($this->db);
    }

    private function requireAuth() {
        if (!isset($_SESSION['user_id'])) {
            $this->sendResponse(false, "Unauthorized", null, 401);
        }
        return (int) $_SESSION['user_id'];
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

    private function isValidDate($date) {
        if (!$date || !is_string($date)) {
            return false;
        }

        $d = DateTime::createFromFormat('Y-m-d', $date);
        return $d && $d->format('Y-m-d') === $date;
    }

    private function validatePaymentMethod($payment_method) {
        $allowedMethods = ['cash', 'bank_transfer', 'upi', 'card', 'cheque'];
        return $payment_method === '' || in_array($payment_method, $allowedMethods, true);
    }

    private function recalculateInvoiceStatus($invoice_id, $business_profile_id) {
        $invoice = $this->invoiceModel->getPaymentSummaryInvoice($invoice_id, $business_profile_id);

        if (!$invoice) {
            throw new Exception("Invoice not found");
        }

        $total_paid = (float) $this->paymentModel->getTotalPaidByInvoiceId($invoice_id);
        $total_amount = (float) $invoice['total_amount'];

        if ($total_paid <= 0) {
            $new_status = 'sent';
        } elseif ($total_paid < $total_amount) {
            $new_status = 'partially_paid';
        } else {
            $new_status = 'paid';
        }

        $updated = $this->invoiceModel->updateStatus($invoice_id, $business_profile_id, $new_status);

        if (!$updated) {
            throw new Exception("Failed to update invoice status");
        }

        return [
            "total_paid" => round($total_paid, 2),
            "balance_due" => round(max($total_amount - $total_paid, 0), 2),
            "status" => $new_status
        ];
    }

    public function create() {
        $business_profile_id = $this->getBusinessProfileId();
        $raw_input = file_get_contents("php://input");
        $data = json_decode($raw_input, true);

        if (!is_array($data)) {
            $this->sendResponse(false, "Invalid JSON input", [
                "json_error" => json_last_error_msg()
            ], 400);
        }

        $invoice_id = isset($data['invoice_id']) ? (int) $data['invoice_id'] : 0;
        $payment_date = trim($data['payment_date'] ?? '');
        $amount_paid = (float) ($data['amount_paid'] ?? 0);
        $payment_method = trim($data['payment_method'] ?? '');
        $reference_note = trim($data['reference_note'] ?? '');

        if ($invoice_id <= 0 || !$payment_date || $amount_paid <= 0) {
            $this->sendResponse(false, "Invoice, payment date, and valid amount are required", null, 422);
        }

        if (!$this->isValidDate($payment_date)) {
            $this->sendResponse(false, "Invalid payment date format. Use Y-m-d", null, 422);
        }

        if (!$this->validatePaymentMethod($payment_method)) {
            $this->sendResponse(false, "Invalid payment method", null, 422);
        }

        $invoice = $this->invoiceModel->getPaymentSummaryInvoice($invoice_id, $business_profile_id);

        if (!$invoice) {
            $this->sendResponse(false, "Invoice not found", [
                "invoice_id_sent" => $invoice_id,
                "business_profile_id_from_session" => $business_profile_id,
                "session_user_id" => $_SESSION['user_id'] ?? null
            ], 404);
        }

        try {
            $this->db->beginTransaction();

            $created = $this->paymentModel->create(
                $invoice_id,
                $payment_date,
                $amount_paid,
                $payment_method,
                $reference_note
            );

            if (!$created) {
                throw new Exception("Failed to record payment");
            }

            $summary = $this->recalculateInvoiceStatus($invoice_id, $business_profile_id);

            $this->db->commit();

            $this->sendResponse(true, "Payment recorded successfully", $summary, 201);

        } catch (Throwable $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }

            $this->sendResponse(false, "Payment error: " . $e->getMessage(), null, 500);
        }
    }

    public function listByInvoice() {
        $business_profile_id = $this->getBusinessProfileId();
        $invoice_id = isset($_GET['invoice_id']) ? (int) $_GET['invoice_id'] : 0;

        if ($invoice_id <= 0) {
            $this->sendResponse(false, "Invoice ID is required", null, 422);
        }

        $invoice = $this->invoiceModel->getPaymentSummaryInvoice($invoice_id, $business_profile_id);

        if (!$invoice) {
            $this->sendResponse(false, "Invoice not found", null, 404);
        }

        $payments = $this->paymentModel->getByInvoiceId($invoice_id);
        $total_paid = (float) $this->paymentModel->getTotalPaidByInvoiceId($invoice_id);

        $summary = [
            "total_amount" => (float) $invoice['total_amount'],
            "total_paid" => round($total_paid, 2),
            "balance_due" => round(max((float) $invoice['total_amount'] - $total_paid, 0), 2),
            "status" => $invoice['status']
        ];

        $this->sendResponse(true, "Payments fetched successfully", [
            "payments" => $payments,
            "summary" => $summary
        ]);
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