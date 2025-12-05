# 🏥 MediVault: Cloud-Based Secure Patient Record System

![Status](https://img.shields.io/badge/Status-In%20Development-orange)

**MediVault** is a centralized, cloud-deployed patient health records management system. It is designed to bridge the gap between fragmented healthcare providers by ensuring secure, authorized access to patient records through a patient-driven permission model.

---

## 👥 Authors

| Name | Section |
| :--- | :--- |
| **Antony, Aldrich Ryan V.** | CS - 4103 |
| **Mirabel, Kevin Hans Aurick S.** | CS - 4103 |

---

## 🔗 Quick Links

- **[📂 Repository Link](Medivault)**
- **[🌐 Live Website]()** *(Link Pending)*

---

## 📖 Project Overview

MediVault aims to improve accessibility, reduce record fragmentation, and enhance patient control over medical data. The platform allows healthcare providers to request access when needed, while patients retain the power to approve or deny these requests. It also features **emergency overrides** for life-threatening situations, paired with strict logging and audit trails to ensure accountability.

### 🚩 Identified Problem
Traditional medical record systems are often siloed, hospital-specific, and reliant on outdated storage practices. Patients who transfer hospitals or visit multiple facilities often experience:

* **Fragmentation:** Difficulty retrieving historical records.
* **Inconsistency:** Missing medical information leading to errors.
* **Delays:** Delayed diagnosis due to inaccessible data.
* **Lack of Transparency:** No visibility regarding who accesses their information.
* **Lack of Control:** Existing systems rarely give patients active control over access authorization.

### 💡 Proposed Solution
MediVault solves these issues via a secure, cloud-based platform that:

1.  **Centralizes Data:** Stores records in a centralized, encrypted database.
2.  **Patient-Driven Access:** Sends real-time notifications to patients to approve/deny hospital access requests.
3.  **Enhanced Security:** Implements Multi-Factor Authentication (MFA) for all users.
4.  **Emergency Protocols:** Provides emergency override access strictly for life-threatening situations.
5.  **Audit Trails:** Maintains comprehensive reports showing exactly who accessed data and why.

---

## 🛠 Technical Architecture

MediVault leverages a modern tech stack to ensure scalability, security, and performance.

### 1. Front-End (Client-Side)
* **Technologies:** ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
* **Patient Interface:** Registration, Access Requests, History Records, Audit Logs.
* **Hospital Interface:** Patient Dashboards, Record Creation, Emergency "Pull" requests.

### 2. Back-End (Server-Side)
* **Technologies:** ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/Express.js-404D59?style=flat)
* **Security:** OAuth2 / JWT for Authentication.
* **Responsibilities:** Application logic, encrypted record transfers, emergency override protocols, and RESTful API architecture.

### 3. Database
* **Provider:** ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white) (PostgreSQL)
* **Data Stored:** Patient data, medical histories, access control lists (ACL), and immutable audit logs.
* **Security:** End-to-end encryption and Row Level Security (RLS).

### 4. Cloud & Deployment
* **Platform:** ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)
* Leverages serverless functions and modern frontend framework integration for high availability.

---

## 🔑 Key Features

| Feature | Description |
| :--- | :--- |
| **User Authentication** | Secure login/registration for patients and hospital staff using OAuth2/JWT. |
| **Permission System** | "Push" notifications for patients to grant or deny record access to doctors. |
| **Emergency Override** | A specific protocol allowing doctors to bypass permission in critical states, triggering immediate audits. |
| **Audit Logging** | A transparent view for patients to see exactly when and by whom their data was accessed. |
| **Interoperability** | API endpoints designed to assist hospital systems in pushing/pulling data. |

---

## 🚀 Getting Started

*(Instructions on how to clone and run the project locally)*

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/yourusername/medivault.git](https://github.com/yourusername/medivault.git)
    cd medivault
    ```

2.  **Install Dependencies**
    ```bash
    npm i
    ```

3.  **Environment Variables**
    Create a `.env` file and configure your Supabase and Auth credentials.

4.  **Run the App**
    ```bash
    npm run dev
    ```

---
*© 2024 MediVault. All Rights Reserved.*
