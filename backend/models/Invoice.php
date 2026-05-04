<?php

class Invoice {
    private $conn;
    private $table = "invoices";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create($business_profile_id, $client_id, $invoice_number, $invoice_date, $due_date, $status, $subtotal, $tax_amount, $discount_amount, $total_amount, $notes) {
        $query = "INSERT INTO {$this->table}
            (business_profile_id, client_id, invoice_number, invoice_date, due_date, status, subtotal, tax_amount, discount_amount, total_amount, notes)
            VALUES
            (:business_profile_id, :client_id, :invoice_number, :invoice_date, :due_date, :status, :subtotal, :tax_amount, :discount_amount, :total_amount, :notes)";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":business_profile_id", $business_profile_id);
        $stmt->bindParam(":client_id", $client_id);
        $stmt->bindParam(":invoice_number", $invoice_number);
        $stmt->bindParam(":invoice_date", $invoice_date);
        $stmt->bindParam(":due_date", $due_date);
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":subtotal", $subtotal);
        $stmt->bindParam(":tax_amount", $tax_amount);
        $stmt->bindParam(":discount_amount", $discount_amount);
        $stmt->bindParam(":total_amount", $total_amount);
        $stmt->bindParam(":notes", $notes);

        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }

        return false;
    }

    public function getAllByBusinessProfile($business_profile_id) {
    $query = "SELECT invoices.*, clients.client_name, clients.company_name
              FROM {$this->table}
              LEFT JOIN clients ON invoices.client_id = clients.id
              WHERE invoices.business_profile_id = :business_profile_id
              ORDER BY invoices.id DESC";

    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(":business_profile_id", $business_profile_id, PDO::PARAM_INT);
    $stmt->execute();

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

    public function getById($id, $business_profile_id) {
    $query = "SELECT invoices.*, clients.client_name, clients.company_name
              FROM {$this->table}
              LEFT JOIN clients ON invoices.client_id = clients.id
              WHERE invoices.id = :id AND invoices.business_profile_id = :business_profile_id
              LIMIT 1";

    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(":id", $id, PDO::PARAM_INT);
    $stmt->bindParam(":business_profile_id", $business_profile_id, PDO::PARAM_INT);
    $stmt->execute();

    return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
}

    public function update($id, $business_profile_id, $client_id, $invoice_number, $invoice_date, $due_date, $status, $subtotal, $tax_amount, $discount_amount, $total_amount, $notes) {
        $query = "UPDATE {$this->table}
                  SET client_id = :client_id,
                      invoice_number = :invoice_number,
                      invoice_date = :invoice_date,
                      due_date = :due_date,
                      status = :status,
                      subtotal = :subtotal,
                      tax_amount = :tax_amount,
                      discount_amount = :discount_amount,
                      total_amount = :total_amount,
                      notes = :notes
                  WHERE id = :id AND business_profile_id = :business_profile_id";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":id", $id);
        $stmt->bindParam(":business_profile_id", $business_profile_id);
        $stmt->bindParam(":client_id", $client_id);
        $stmt->bindParam(":invoice_number", $invoice_number);
        $stmt->bindParam(":invoice_date", $invoice_date);
        $stmt->bindParam(":due_date", $due_date);
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":subtotal", $subtotal);
        $stmt->bindParam(":tax_amount", $tax_amount);
        $stmt->bindParam(":discount_amount", $discount_amount);
        $stmt->bindParam(":total_amount", $total_amount);
        $stmt->bindParam(":notes", $notes);

        return $stmt->execute();
    }

    public function delete($id, $business_profile_id) {
        $query = "DELETE FROM {$this->table}
                  WHERE id = :id AND business_profile_id = :business_profile_id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->bindParam(":business_profile_id", $business_profile_id);

        return $stmt->execute();
    }

    public function getPaymentSummaryInvoice($invoice_id, $business_profile_id) {
    $query = "SELECT id, business_profile_id, total_amount, status
              FROM invoices
              WHERE id = :id
              AND business_profile_id = :business_profile_id
              LIMIT 1";

    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':id', $invoice_id, PDO::PARAM_INT);
    $stmt->bindParam(':business_profile_id', $business_profile_id, PDO::PARAM_INT);
    $stmt->execute();

    return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
}

public function updateStatus($id, $business_profile_id, $status) {
    $query = "UPDATE {$this->table}
              SET status = :status
              WHERE id = :id AND business_profile_id = :business_profile_id";

    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(":id", $id);
    $stmt->bindParam(":business_profile_id", $business_profile_id);
    $stmt->bindParam(":status", $status);

    return $stmt->execute();
}
}
?>