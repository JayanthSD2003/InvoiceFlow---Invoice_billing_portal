<?php

class Client {
    private $conn;
    private $table = "clients";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create($business_profile_id, $client_name, $company_name, $email, $phone, $address, $city, $state, $country, $postal_code, $notes) {
        $query = "INSERT INTO {$this->table}
            (business_profile_id, client_name, company_name, email, phone, address, city, state, country, postal_code, notes)
            VALUES
            (:business_profile_id, :client_name, :company_name, :email, :phone, :address, :city, :state, :country, :postal_code, :notes)";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":business_profile_id", $business_profile_id);
        $stmt->bindParam(":client_name", $client_name);
        $stmt->bindParam(":company_name", $company_name);
        $stmt->bindParam(":email", $email);
        $stmt->bindParam(":phone", $phone);
        $stmt->bindParam(":address", $address);
        $stmt->bindParam(":city", $city);
        $stmt->bindParam(":state", $state);
        $stmt->bindParam(":country", $country);
        $stmt->bindParam(":postal_code", $postal_code);
        $stmt->bindParam(":notes", $notes);

        return $stmt->execute();
    }

    public function getAllByBusinessProfile($business_profile_id) {
        $query = "SELECT * FROM {$this->table}
                  WHERE business_profile_id = :business_profile_id
                  ORDER BY id DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":business_profile_id", $business_profile_id);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id, $business_profile_id) {
        $query = "SELECT * FROM {$this->table}
                  WHERE id = :id AND business_profile_id = :business_profile_id
                  LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->bindParam(":business_profile_id", $business_profile_id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function update($id, $business_profile_id, $client_name, $company_name, $email, $phone, $address, $city, $state, $country, $postal_code, $notes) {
        $query = "UPDATE {$this->table}
                  SET client_name = :client_name,
                      company_name = :company_name,
                      email = :email,
                      phone = :phone,
                      address = :address,
                      city = :city,
                      state = :state,
                      country = :country,
                      postal_code = :postal_code,
                      notes = :notes
                  WHERE id = :id AND business_profile_id = :business_profile_id";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":id", $id);
        $stmt->bindParam(":business_profile_id", $business_profile_id);
        $stmt->bindParam(":client_name", $client_name);
        $stmt->bindParam(":company_name", $company_name);
        $stmt->bindParam(":email", $email);
        $stmt->bindParam(":phone", $phone);
        $stmt->bindParam(":address", $address);
        $stmt->bindParam(":city", $city);
        $stmt->bindParam(":state", $state);
        $stmt->bindParam(":country", $country);
        $stmt->bindParam(":postal_code", $postal_code);
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
}
?>