# InvoiceFlow — Professional Billing & Tax Portal

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![PHP](https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white)

![Tested with Thunder Client](https://img.shields.io/badge/Tested%20with-Thunder_Client-732cf5?style=for-the-badge&logo=thunder-client&logoColor=white)
![Made with VS Code](https://img.shields.io/badge/Made%20with-VS_Code-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white)

--

### **Supporting Tools**

![Made with Perplexity](https://img.shields.io/badge/Made%20with-Perplexity-black?style=for-the-badge&logo=perplexity&logoColor=white)
![Made with Antigravity](https://img.shields.io/badge/Made%20with-Antigravity-blueviolet?style=for-the-badge&logo=google&logoColor=white)

---

**InvoiceFlow** is a modern, high-performance billing portal designed specifically for freelancers, Kirana stores, and small businesses in India. It simplifies financial management with a premium UI and full compliance with Indian tax regulations.

---

## 🚀 Key Features

### 🏢 Multi-Workspace Management
*   **Dual Profile Support**: Switch seamlessly between **Business** and **Freelance** profiles.
*   **Data Isolation**: Complete separation of clients, invoices, and analytics per workspace.
*   **Real-time Switcher**: Update your entire dashboard context with a single click.

### 🇮🇳 Indian Tax Compliance
*   **GST & HSN/SAC Support**: Built-in fields for GSTIN and HSN/SAC codes for every line item.
*   **Conditional GST Mode**: Automatically hides tax fields for unregistered businesses to keep things simple.
*   **PAN Integration**: Mandatory PAN tracking for business compliance.

### 📄 Professional Invoicing
*   **Tax Invoice Print View**: A clean, industry-standard A4 print layout mirroring traditional Indian tax invoices.
*   **Number-to-Words**: Automatic conversion of grand totals into Indian Rupee words (e.g., *INR Eleven Thousand Eight Hundred Only*).
*   **Smart Print Logic**: Hides portal UI automatically during printing for a pristine physical document.

### 📊 Business Intelligence
*   **Dynamic Dashboard**: Track total revenue, pending payments, and client growth.
*   **Status Tracking**: Manage the lifecycle of invoices from Draft to Paid/Overdue.
*   **Payment History**: Record and track partial or full payments with ease.

---

## 🛠️ Tech Stack & Architecture

### **Frontend: Modern UI/UX Layer**
*   **React 19**: Leveraging the latest React features for efficient component rendering and state management.
*   **Tailwind CSS**: Custom, utility-first styling used to create a premium, glassmorphic design system that supports both Light and Dark modes.
*   **React Router 7**: Managing complex client-side routing, including protected routes and role-based access.
*   **Lucide Icons**: Providing a consistent and sleek iconography throughout the application.

### **Backend: Robust API Layer**
*   **Vanilla PHP (OOP)**: A clean, object-oriented approach using PHP to handle API requests, business logic, and session-based authentication.
*   **PDO (PHP Data Objects)**: Ensures secure, prepared SQL statements to prevent SQL injection and provide a reliable database interface.
*   **Session Management**: Secure user sessions to isolate data between different business profiles.

### **Database: Relational Data Model**
*   **MySQL**: Optimized relational database structure designed to handle multi-tenant data isolation and complex invoicing relationships.

---

## 🚀 API Testing & Validation

During development, the backend was rigorously validated using **Thunder Client**. The testing suite covered the full CRUD lifecycle of the billing system:

*   **`GET` (Data Retrieval)**: Fetching dynamic dashboards, workspace-specific client lists, and detailed invoice data for printing.
*   **`POST` (Resource Creation)**: Creating new invoices with multiple line items, adding new clients to the directory, and processing user registration/login.
*   **`PUT / PATCH` (Record Updates)**: Updating existing client profiles, modifying invoice details, and updating payment statuses.
*   **`DELETE` (Record Removal)**: Safely removing draft invoices, deleting client records, and purging erroneous payment entries.
*   **`FETCH` (Workspace Synchronization)**: Leveraging unified fetch requests to instantly switch application context when a user changes their active business profile.

Every endpoint was tested for:
*   **Authentication & Authorization**: Ensuring only logged-in users can access their own data.
*   **Data Isolation**: Verifying that a user in "Business Profile A" cannot see or modify data in "Business Profile B".
*   **Payload Accuracy**: Validating that tax calculations, subtotal summations, and "Number to Words" logic are 100% accurate before reaching the frontend.

---

## ⚙️ Installation & Comprehensive Setup

### **1. Database Setup (PHPMyAdmin)**
1.  Open your XAMPP Control Panel and start **Apache** and **MySQL**.
2.  Open your browser and navigate to `http://localhost/phpmyadmin`.
3.  Click on the **"New"** tab in the left sidebar to create a new database.
4.  Enter the name: **`invoice_billing_portal`** and click **Create**.
5.  Select your new database, click the **"Import"** tab.
6.  Choose the `database/schema.sql` file from this project and click **Go** at the bottom.

### **2. Backend Configuration**
1.  Move the project folder to your local server root (e.g., `C:\xampp\htdocs\invoice-billing-portal`).
2.  Open `backend/config/database.php` and verify your MySQL credentials:
    ```php
    private $username = "root";
    private $password = ""; // Default XAMPP password is empty
    ```

### **3. Frontend Setup (React App)**
1.  Open your terminal and navigate to the `frontend` folder:
    ```bash
    cd frontend
    ```
2.  Install all necessary dependencies:
    ```bash
    npm install
    ```
3.  Launch the development server:
    ```bash
    npm start
    ```
4.  The application will automatically open at `http://localhost:3000`.


---

## 📸 Preview

### 🔐 Modern Login Experience
![Login Screen](./screenshots/login.png)

### 📊 Comprehensive Dashboard
![Dashboard](./screenshots/dashboard.png)

### 👥 Client Directory
![Clients](./screenshots/clients.png)

### 🧾 Invoice Management
![Invoices](./screenshots/invoices.png)

### 💰 Payment Records & Tracking
![Payments](./screenshots/payments.png)

### ⚙️ Workspace, App, Profile, and Business Profile Settings
![Settings](./screenshots/settings.png)

---

## 🛠️ Built By

This project represents the pinnacle of modern, AI-assisted software engineering, blending human vision with cutting-edge artificial intelligence.

*   **[Jayanth SD](https://github.com/JayanthSD2003) (Lead Architect & Visionary)**:
    Envisioned the core concept of a unified billing portal that scales from freelancers to small businesses. Jayanth directed the high-fidelity UI/UX design, defined the multi-business isolation logic, and oversaw the end-to-end integration of Indian tax compliance laws to ensure the product solves real-world problems for Indian entrepreneurs.

*   **Visual Studio Code (Mission Control)**:
    The backbone of the development workflow. VS Code provided the environment for rapid prototyping, real-time debugging, and code orchestration, enabling the seamless transition between the React frontend and PHP backend.

*   **Thunder Client (API Testing Framework)**:
    Essential for the backend validation phase. Thunder Client was used within VS Code to rigorously test every API endpoint, ensuring that the PHP controllers handled session authentication, data isolation, and tax calculations with 100% accuracy before the frontend was even connected.    

 ### **Supporting Tools and Software**

*   **Perplexity AI (Compliance & Research Specialist)**:
    Served as the critical knowledge engine for the project. Perplexity provided deep research and up-to-date information on Indian GST regulations, HSN/SAC code requirements for freelancers, and mandatory invoicing standards. This allowed the team to build a product that is not just functional, but legally compliant for the 2026 tax landscape.

*   **Antigravity by Google DeepMind (Expert Pair Programmer)**:
    Acted as the primary coding intelligence throughout the development lifecycle. Antigravity was responsible for generating complex React state management systems, building robust PHP PDO models, implementing the "Numbers to Words" Indian numbering utility, and optimizing the application for professional A4 printing. It ensured that every line of code was performant, secure, and followed modern best practices.


---

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
