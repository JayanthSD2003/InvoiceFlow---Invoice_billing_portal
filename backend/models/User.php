<?php

class User {
    private $conn;
    private $table = "users";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function findByEmail($email) {
        $query = "SELECT id, full_name, email, phone, password_hash, created_at
                  FROM {$this->table}
                  WHERE email = :email
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $email);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function create($full_name, $email, $phone, $password_hash) {
        $query = "INSERT INTO {$this->table} (full_name, email, phone, password_hash)
                  VALUES (:full_name, :email, :phone, :password_hash)";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":full_name", $full_name);
        $stmt->bindParam(":email", $email);
        $stmt->bindParam(":phone", $phone);
        $stmt->bindParam(":password_hash", $password_hash);

        return $stmt->execute();
    }

    public function findById($id) {
        $query = "SELECT id, full_name, email, phone, created_at
                  FROM {$this->table}
                  WHERE id = :id
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }
}
?>