<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Invoice.php';
require_once __DIR__ . '/../models/InvoiceItem.php';
require_once __DIR__ . '/../models/BusinessProfile.php';
require_once __DIR__ . '/../models/Client.php';

class InvoiceController {
    private $db;
    private $invoiceModel;
    private $invoiceItemModel;
    private $businessProfileModel;
    private $clientModel;

    public function __construct() {
        $database = new Database();
        $this->db = $database->connect();
        $this->invoiceModel = new Invoice($this->db);
        $this->invoiceItemModel = new InvoiceItem($this->db);
        $this->businessProfileModel = new BusinessProfile($this->db);
        $this->clientModel = new Client($this->db);
    }

    private function requireAuth() {
        if (!isset($_SESSION['user_id'])) {
            $this->sendResponse(false, "Unauthorized", null, 401);
        }
        return (int) $_SESSION['user_id'];
    }

    /**
     * Get or auto-create the business profile for the current user.
     *
     * This version will:
     * - Return the existing business_profile_id if found
     * - Otherwise auto-create a default business profile for the user
     *   via BusinessProfile::createDefaultForUser($user_id)
     */
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

    private function validateInvoiceStatus($status) {
        $allowedStatuses = ['draft', 'sent', 'partially_paid', 'paid', 'overdue'];
        return in_array($status, $allowedStatuses, true);
    }

    private function calculateTotals($items, $discount_amount = 0) {
        if (!is_array($items) || empty($items)) {
            $this->sendResponse(false, "At least one invoice item is required", null, 422);
        }

        if ($discount_amount < 0) {
            $this->sendResponse(false, "Discount cannot be negative", null, 422);
        }

        $subtotal = 0;
        $tax_amount = 0;
        $processedItems = [];

        foreach ($items as $item) {
            $item_name   = trim($item['item_name'] ?? '');
            $description = trim($item['description'] ?? '');
            $hsn_code    = trim($item['hsn_code'] ?? '');
            $quantity    = (float) ($item['quantity'] ?? 0);
            $unit_price  = (float) ($item['unit_price'] ?? 0);
            $tax_percent = (float) ($item['tax_percent'] ?? 0);

            if (!$item_name || $quantity <= 0 || $unit_price < 0 || $tax_percent < 0) {
                $this->sendResponse(false, "Invalid invoice item data", [
                    "received_item" => $item
                ], 422);
            }

            $item_base = $quantity * $unit_price;
            $item_tax  = ($item_base * $tax_percent) / 100;
            $line_total = $item_base + $item_tax;

            $subtotal   += $item_base;
            $tax_amount += $item_tax;

            $processedItems[] = [
                "item_name"   => $item_name,
                "description" => $description,
                "hsn_code"    => $hsn_code,
                "quantity"    => round($quantity, 2),
                "unit_price"  => round($unit_price, 2),
                "tax_percent" => round($tax_percent, 2),
                "line_total"  => round($line_total, 2),
            ];
        }

        $gross_total = $subtotal + $tax_amount;

        if ($discount_amount > $gross_total) {
            $this->sendResponse(false, "Discount cannot exceed invoice total", [
                "gross_total"     => round($gross_total, 2),
                "discount_amount" => round($discount_amount, 2),
            ], 422);
        }

        $total_amount = $gross_total - $discount_amount;

        return [
            "subtotal"        => round($subtotal, 2),
            "tax_amount"      => round($tax_amount, 2),
            "discount_amount" => round($discount_amount, 2),
            "total_amount"    => round($total_amount, 2),
            "items"           => $processedItems,
        ];
    }

    public function create() {
        $business_profile_id = $this->getBusinessProfileId();

        $raw_input    = file_get_contents("php://input");
        $content_type = $_SERVER['CONTENT_TYPE'] ?? '';
        $data         = json_decode($raw_input, true);

        if (stripos($content_type, 'application/json') === false) {
            $this->sendResponse(false, "Content-Type must be application/json", [
                "content_type" => $content_type,
            ], 415);
        }

        if (!is_array($data)) {
            $this->sendResponse(false, "Invalid or missing JSON body", [
                "json_error" => json_last_error_msg(),
            ], 400);
        }

        $client_id       = isset($data['client_id']) ? (int) $data['client_id'] : 0;
        $invoice_number  = trim($data['invoice_number'] ?? '');
        $invoice_date    = trim($data['invoice_date'] ?? '');
        $due_date        = isset($data['due_date']) && $data['due_date'] !== '' ? trim($data['due_date']) : null;
        $status          = trim($data['status'] ?? 'draft');
        $discount_amount = (float) ($data['discount_amount'] ?? 0);
        $notes           = trim($data['notes'] ?? '');
        $items           = $data['items'] ?? [];

        if ($client_id <= 0 || !$invoice_number || !$invoice_date || empty($items)) {
            $this->sendResponse(false, "Client, invoice number, invoice date, and items are required", null, 422);
        }

        if (!$this->isValidDate($invoice_date)) {
            $this->sendResponse(false, "Invalid invoice date format. Use Y-m-d", null, 422);
        }

        if ($due_date !== null && !$this->isValidDate($due_date)) {
            $this->sendResponse(false, "Invalid due date format. Use Y-m-d", null, 422);
        }

        if (!$this->validateInvoiceStatus($status)) {
            $this->sendResponse(false, "Invalid invoice status", null, 422);
        }

        $client = $this->clientModel->getById($client_id, $business_profile_id);
        if (!$client) {
            $this->sendResponse(false, "Invalid client selected", [
                "client_id_sent"      => $client_id,
                "business_profile_id" => $business_profile_id,
            ], 404);
        }

        $totals = $this->calculateTotals($items, $discount_amount);

        try {
            $this->db->beginTransaction();

            $invoice_id = $this->invoiceModel->create(
                $business_profile_id,
                $client_id,
                $invoice_number,
                $invoice_date,
                $due_date,
                $status,
                $totals['subtotal'],
                $totals['tax_amount'],
                $totals['discount_amount'],
                $totals['total_amount'],
                $notes
            );

            if (!$invoice_id) {
                throw new Exception("Failed to create invoice");
            }

            foreach ($totals['items'] as $item) {
                $saved = $this->invoiceItemModel->create(
                    $invoice_id,
                    $item['item_name'],
                    $item['description'],
                    $item['hsn_code'],
                    $item['quantity'],
                    $item['unit_price'],
                    $item['tax_percent'],
                    $item['line_total']
                );

                if (!$saved) {
                    throw new Exception("Failed to save invoice item");
                }
            }

            $this->db->commit();
            $this->sendResponse(true, "Invoice created successfully", ["invoice_id" => $invoice_id], 201);
        } catch (Throwable $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }

            $this->sendResponse(false, $e->getMessage(), [
                "business_profile_id" => $business_profile_id,
                "client_id"           => $client_id,
            ], 500);
        }
    }

    public function index() {
        $business_profile_id = $this->getBusinessProfileId();
        $invoices            = $this->invoiceModel->getAllByBusinessProfile($business_profile_id);
        $this->sendResponse(true, "Invoices fetched successfully", $invoices);
    }

    public function show() {
        $business_profile_id = $this->getBusinessProfileId();
        $id                  = isset($_GET['id']) ? (int) $_GET['id'] : 0;

        if ($id <= 0) {
            $this->sendResponse(false, "Invoice ID is required", null, 422);
        }

        $invoice = $this->invoiceModel->getById($id, $business_profile_id);

        if (!$invoice) {
            $this->sendResponse(false, "Invoice not found", null, 404);
        }

        $items          = $this->invoiceItemModel->getByInvoiceId($id);
        $invoice['items'] = $items;

        $this->sendResponse(true, "Invoice fetched successfully", $invoice);
    }

    public function update() {
        $business_profile_id = $this->getBusinessProfileId();
        $id                  = isset($_GET['id']) ? (int) $_GET['id'] : 0;

        $raw_input    = file_get_contents("php://input");
        $content_type = $_SERVER['CONTENT_TYPE'] ?? '';
        $data         = json_decode($raw_input, true);

        if ($id <= 0) {
            $this->sendResponse(false, "Invoice ID is required", null, 422);
        }

        if (stripos($content_type, 'application/json') === false) {
            $this->sendResponse(false, "Content-Type must be application/json", [
                "content_type" => $content_type,
            ], 415);
        }

        if (!is_array($data)) {
            $this->sendResponse(false, "Invalid or missing JSON body", [
                "json_error" => json_last_error_msg(),
            ], 400);
        }

        $client_id       = isset($data['client_id']) ? (int) $data['client_id'] : 0;
        $invoice_number  = trim($data['invoice_number'] ?? '');
        $invoice_date    = trim($data['invoice_date'] ?? '');
        $due_date        = isset($data['due_date']) && $data['due_date'] !== '' ? trim($data['due_date']) : null;
        $status          = trim($data['status'] ?? 'draft');
        $discount_amount = (float) ($data['discount_amount'] ?? 0);
        $notes           = trim($data['notes'] ?? '');
        $items           = $data['items'] ?? [];

        if ($client_id <= 0 || !$invoice_number || !$invoice_date || empty($items)) {
            $this->sendResponse(false, "Client, invoice number, invoice date, and items are required", null, 422);
        }

        if (!$this->isValidDate($invoice_date)) {
            $this->sendResponse(false, "Invalid invoice date format. Use Y-m-d", null, 422);
        }

        if ($due_date !== null && !$this->isValidDate($due_date)) {
            $this->sendResponse(false, "Invalid due date format. Use Y-m-d", null, 422);
        }

        if (!$this->validateInvoiceStatus($status)) {
            $this->sendResponse(false, "Invalid invoice status", null, 422);
        }

        $existingInvoice = $this->invoiceModel->getById($id, $business_profile_id);
        if (!$existingInvoice) {
            $this->sendResponse(false, "Invoice not found", null, 404);
        }

        $client = $this->clientModel->getById($client_id, $business_profile_id);
        if (!$client) {
            $this->sendResponse(false, "Invalid client selected", [
                "client_id_sent"      => $client_id,
                "business_profile_id" => $business_profile_id,
            ], 404);
        }

        $totals = $this->calculateTotals($items, $discount_amount);

        try {
            $this->db->beginTransaction();

            $updated = $this->invoiceModel->update(
                $id,
                $business_profile_id,
                $client_id,
                $invoice_number,
                $invoice_date,
                $due_date,
                $status,
                $totals['subtotal'],
                $totals['tax_amount'],
                $totals['discount_amount'],
                $totals['total_amount'],
                $notes
            );

            if (!$updated) {
                throw new Exception("Failed to update invoice");
            }

            $this->invoiceItemModel->deleteByInvoiceId($id);

            foreach ($totals['items'] as $item) {
                $saved = $this->invoiceItemModel->create(
                    $id,
                    $item['item_name'],
                    $item['description'],
                    $item['hsn_code'],
                    $item['quantity'],
                    $item['unit_price'],
                    $item['tax_percent'],
                    $item['line_total']
                );

                if (!$saved) {
                    throw new Exception("Failed to update invoice items");
                }
            }

            $this->db->commit();
            $this->sendResponse(true, "Invoice updated successfully");
        } catch (Throwable $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }

            $this->sendResponse(false, $e->getMessage(), [
                "invoice_id"          => $id,
                "business_profile_id" => $business_profile_id,
            ], 500);
        }
    }

    public function delete() {
        $business_profile_id = $this->getBusinessProfileId();
        $id                  = isset($_GET['id']) ? (int) $_GET['id'] : 0;

        if ($id <= 0) {
            $this->sendResponse(false, "Invoice ID is required", null, 422);
        }

        $invoice = $this->invoiceModel->getById($id, $business_profile_id);
        if (!$invoice) {
            $this->sendResponse(false, "Invoice not found", null, 404);
        }

        try {
            $this->db->beginTransaction();

            $this->invoiceItemModel->deleteByInvoiceId($id);

            $deleted = $this->invoiceModel->delete($id, $business_profile_id);

            if (!$deleted) {
                throw new Exception("Failed to delete invoice");
            }

            $this->db->commit();
            $this->sendResponse(true, "Invoice deleted successfully");
        } catch (Throwable $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }

            $this->sendResponse(false, $e->getMessage(), [
                "invoice_id"          => $id,
                "business_profile_id" => $business_profile_id,
            ], 500);
        }
    }

    private function sendResponse($success, $message, $data = null, $statusCode = 200) {
        http_response_code($statusCode);
        header("Content-Type: application/json");
        echo json_encode([
            "success" => $success,
            "message" => $message,
            "data"    => $data,
        ]);
        exit;
    }
}

?>