<?php

class BusinessProfile {
    private $conn;
    private $table = "business_profiles";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function findByUserId($user_id) {
        $query = "SELECT * FROM {$this->table} WHERE user_id = :user_id ORDER BY id DESC LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function findLatestByUserId($user_id) {
        $query = "SELECT * FROM {$this->table} WHERE user_id = :user_id ORDER BY id DESC LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getAllByUserId($user_id) {
        $query = "SELECT * FROM {$this->table} WHERE user_id = :user_id ORDER BY id DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getByIdAndUserId($profile_id, $user_id) {
        $query = "SELECT * FROM {$this->table}
                  WHERE id = :profile_id AND user_id = :user_id
                  LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':profile_id', $profile_id, PDO::PARAM_INT);
        $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($user_id, $business_name, $owner_name, $email, $phone, $address, $tax_number, $pan_number, $is_gst_registered = 0) {
        $profile_type = "business";

        $query = "INSERT INTO {$this->table}
                  (user_id, profile_name, owner_name, profile_type, is_gst_registered, business_email, business_phone, address, tax_number, pan_number)
                  VALUES
                  (:user_id, :profile_name, :owner_name, :profile_type, :is_gst_registered, :business_email, :business_phone, :address, :tax_number, :pan_number)";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id, PDO::PARAM_INT);
        $stmt->bindParam(":profile_name", $business_name, PDO::PARAM_STR);
        $stmt->bindParam(":owner_name", $owner_name, PDO::PARAM_STR);
        $stmt->bindParam(":profile_type", $profile_type, PDO::PARAM_STR);
        $stmt->bindParam(":is_gst_registered", $is_gst_registered, PDO::PARAM_INT);
        $stmt->bindParam(":business_email", $email, PDO::PARAM_STR);
        $stmt->bindParam(":business_phone", $phone, PDO::PARAM_STR);
        $stmt->bindParam(":address", $address, PDO::PARAM_STR);
        $stmt->bindParam(":tax_number", $tax_number, PDO::PARAM_STR);
        $stmt->bindParam(":pan_number", $pan_number, PDO::PARAM_STR);

        return $stmt->execute();
    }

    public function createDefaultForUser($user_id) {
        $profile_type = "business";
        $profile_name = "My Business";
        $owner_name = "Business Owner";
        $business_email = "";
        $business_phone = "";
        $address = "";
        $tax_number = "";
        $pan_number = "";
        $is_gst_registered = 0;

        $query = "INSERT INTO {$this->table}
                  (user_id, profile_name, owner_name, profile_type, is_gst_registered, business_email, business_phone, address, tax_number, pan_number)
                  VALUES
                  (:user_id, :profile_name, :owner_name, :profile_type, :is_gst_registered, :business_email, :business_phone, :address, :tax_number, :pan_number)";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id, PDO::PARAM_INT);
        $stmt->bindParam(":profile_name", $profile_name, PDO::PARAM_STR);
        $stmt->bindParam(":owner_name", $owner_name, PDO::PARAM_STR);
        $stmt->bindParam(":profile_type", $profile_type, PDO::PARAM_STR);
        $stmt->bindParam(":is_gst_registered", $is_gst_registered, PDO::PARAM_INT);
        $stmt->bindParam(":business_email", $business_email, PDO::PARAM_STR);
        $stmt->bindParam(":business_phone", $business_phone, PDO::PARAM_STR);
        $stmt->bindParam(":address", $address, PDO::PARAM_STR);
        $stmt->bindParam(":tax_number", $tax_number, PDO::PARAM_STR);
        $stmt->bindParam(":pan_number", $pan_number, PDO::PARAM_STR);

        if ($stmt->execute()) {
            return (int) $this->conn->lastInsertId();
        }

        return false;
    }

    public function updateByUserId($user_id, $business_name, $owner_name, $email, $phone, $address, $tax_number, $pan_number, $is_gst_registered = 0) {
        $query = "UPDATE {$this->table}
                  SET profile_name = :profile_name,
                      owner_name = :owner_name,
                      is_gst_registered = :is_gst_registered,
                      business_email = :business_email,
                      business_phone = :business_phone,
                      address = :address,
                      tax_number = :tax_number,
                      pan_number = :pan_number
                  WHERE user_id = :user_id
                  ORDER BY id DESC
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":profile_name", $business_name, PDO::PARAM_STR);
        $stmt->bindParam(":owner_name", $owner_name, PDO::PARAM_STR);
        $stmt->bindParam(":is_gst_registered", $is_gst_registered, PDO::PARAM_INT);
        $stmt->bindParam(":business_email", $email, PDO::PARAM_STR);
        $stmt->bindParam(":business_phone", $phone, PDO::PARAM_STR);
        $stmt->bindParam(":address", $address, PDO::PARAM_STR);
        $stmt->bindParam(":tax_number", $tax_number, PDO::PARAM_STR);
        $stmt->bindParam(":pan_number", $pan_number, PDO::PARAM_STR);
        $stmt->bindParam(":user_id", $user_id, PDO::PARAM_INT);

        return $stmt->execute();
    }

    public function updateById($id, $user_id, $business_name, $owner_name, $email, $phone, $address, $tax_number, $pan_number, $is_gst_registered = 0) {
        $query = "UPDATE {$this->table}
                  SET profile_name = :profile_name,
                      owner_name = :owner_name,
                      is_gst_registered = :is_gst_registered,
                      business_email = :business_email,
                      business_phone = :business_phone,
                      address = :address,
                      tax_number = :tax_number,
                      pan_number = :pan_number
                  WHERE id = :id AND user_id = :user_id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":profile_name", $business_name, PDO::PARAM_STR);
        $stmt->bindParam(":owner_name", $owner_name, PDO::PARAM_STR);
        $stmt->bindParam(":is_gst_registered", $is_gst_registered, PDO::PARAM_INT);
        $stmt->bindParam(":business_email", $email, PDO::PARAM_STR);
        $stmt->bindParam(":business_phone", $phone, PDO::PARAM_STR);
        $stmt->bindParam(":address", $address, PDO::PARAM_STR);
        $stmt->bindParam(":tax_number", $tax_number, PDO::PARAM_STR);
        $stmt->bindParam(":pan_number", $pan_number, PDO::PARAM_STR);
        $stmt->bindParam(":id", $id, PDO::PARAM_INT);
        $stmt->bindParam(":user_id", $user_id, PDO::PARAM_INT);

        return $stmt->execute();
    }

    public function deleteById($id, $user_id) {
        $query = "DELETE FROM {$this->table} WHERE id = :id AND user_id = :user_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id, PDO::PARAM_INT);
        $stmt->bindParam(":user_id", $user_id, PDO::PARAM_INT);

        return $stmt->execute();
    }
}
?>