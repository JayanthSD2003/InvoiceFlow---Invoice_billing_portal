<?php

class InvoiceItem {
    private $conn;
    private $table = "invoice_items";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create($invoice_id, $item_name, $description, $hsn_code, $quantity, $unit_price, $tax_percent, $line_total) {
        $query = "INSERT INTO {$this->table}
            (invoice_id, item_name, description, hsn_code, quantity, unit_price, tax_percent, line_total)
            VALUES
            (:invoice_id, :item_name, :description, :hsn_code, :quantity, :unit_price, :tax_percent, :line_total)";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":invoice_id", $invoice_id);
        $stmt->bindParam(":item_name", $item_name);
        $stmt->bindParam(":description", $description);
        $stmt->bindParam(":hsn_code", $hsn_code);
        $stmt->bindParam(":quantity", $quantity);
        $stmt->bindParam(":unit_price", $unit_price);
        $stmt->bindParam(":tax_percent", $tax_percent);
        $stmt->bindParam(":line_total", $line_total);

        return $stmt->execute();
    }

    public function getByInvoiceId($invoice_id) {
        $query = "SELECT * FROM {$this->table} WHERE invoice_id = :invoice_id ORDER BY id ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":invoice_id", $invoice_id);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function deleteByInvoiceId($invoice_id) {
        $query = "DELETE FROM {$this->table} WHERE invoice_id = :invoice_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":invoice_id", $invoice_id);
        return $stmt->execute();
    }
}
?>