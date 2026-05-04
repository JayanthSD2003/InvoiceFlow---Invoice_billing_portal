<?php

class Payment {
    private $conn;
    private $table = "payments";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create($invoice_id, $payment_date, $amount_paid, $payment_method, $reference_note) {
        $query = "INSERT INTO {$this->table}
                  (invoice_id, payment_date, amount_paid, payment_method, reference_note)
                  VALUES
                  (:invoice_id, :payment_date, :amount_paid, :payment_method, :reference_note)";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":invoice_id", $invoice_id);
        $stmt->bindParam(":payment_date", $payment_date);
        $stmt->bindParam(":amount_paid", $amount_paid);
        $stmt->bindParam(":payment_method", $payment_method);
        $stmt->bindParam(":reference_note", $reference_note);

        return $stmt->execute();
    }

    public function getByInvoiceId($invoice_id) {
        $query = "SELECT * FROM {$this->table}
                  WHERE invoice_id = :invoice_id
                  ORDER BY payment_date DESC, id DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":invoice_id", $invoice_id);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getTotalPaidByInvoiceId($invoice_id) {
        $query = "SELECT COALESCE(SUM(amount_paid), 0) AS total_paid
                  FROM {$this->table}
                  WHERE invoice_id = :invoice_id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":invoice_id", $invoice_id);
        $stmt->execute();

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['total_paid'] ?? 0;
    }

    public function delete($id) {
        $query = "DELETE FROM {$this->table} WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        return $stmt->execute();
    }
}
?>