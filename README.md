# ShareSphere 
### A Smart Resource-Sharing, Availability and Reservation Management System
**Individual Web Programming Project · React + PHP + MySQL + Bootstrap**

ShareSphere is a centralized, database-driven web platform designed for colleges and campus communities to list shareable equipment (cameras, laptops, scientific calculators, laboratory kits, sports gear), discover real-time availability, prevent overlapping booking conflicts, and manage reservations with role-based access control.

---

## 🚀 Key Modules & Standout Features

### 1. Role-Based Access Control & Security
- **Strict Role Separation**:
  - **Student / Requester**: Browse items, perform conflict-checked reservations, track booking requests, manage profile and change password.
  - **Faculty / Resource Owner**: Add and manage listed equipment, approve/reject incoming reservation requests with decision notes.
  - **Campus Administrator**: Dedicated system-provisioned account. Only administrators have access to the Analytics Dashboard, utilization reports, user management, and campus audit logs.
- **Account Creation Policy**: Public registration allows creating **Student**, **Faculty**, or **Lab Staff** accounts only. Administrator accounts cannot be created via public registration.
- **Secure Backend**: PHP sessions, token-based API verification, and bcrypt password hashing (`password_hash`).

### 2. Intelligent Availability & Conflict Prevention (Core Standout Feature)
- Backend enforces relational validation and conflict prevention before accepting bookings.
- If a resource is reserved for dates (e.g., Oct 15 - Oct 17), overlapping requests are automatically rejected with conflict explanations.
- **Standout Enhancements**:
  - **Alternative Suggestions**: When an item has a scheduling conflict, ShareSphere automatically finds and suggests available alternative resources in the same category.
  - **Visual Availability Calendar**: Monthly color-coded slot calendar (Available, Reserved, Selected) with upcoming booking schedules.
  - **Resource Utilization Analytics**: Real-time category utilization rates, top-requested items, and status breakdown.

### 3. Resource Listing & Dynamic Discovery
- Full search and filtering by keywords, categories, campus locations, condition status, and ratings.
- Pagination, live feedback badges, and detail views.

### 4. Booking & Request Management
- Status filters: `All`, `Pending`, `Approved`, `Rejected`, `Cancelled`.
- Cancellation workflows for students and approval/rejection actions for owners.

### 5. Notifications & Messaging
- Real-time notification updates for approval decisions, cancellations, owner alerts, and direct pickup notes.

---

## 🛠️ Technology Stack & Syllabus Mapping

| Layer | Technology | Usage & Purpose |
|---|---|---|
| **Frontend UI** | React 19 + Vite | Component hierarchy, client-side routing, interactive calendar, dynamic state |
| **Styling** | Bootstrap 5 + Vanilla CSS | Responsive layouts, cards, modals, tables, badges, micro-animations |
| **Icons** | Lucide React | Clean, modern iconography |
| **Backend API** | PHP 8.x (REST API) | REST endpoints, PDO prepared statements, conflict logic, role validation |
| **Database** | MySQL / SQLite | Relational schema (`users`, `resources`, `reservations`, `categories`, `notifications`) |

---

## 🗄️ Database Design

```sql
users (user_id, name, email, password_hash, role, department, phone, avatar, created_at)
categories (category_id, name, icon, description)
resources (resource_id, owner_id, category_id, title, description, specifications, condition_status, location, image_url, rating, reviews_count, status, created_at)
reservations (reservation_id, resource_id, user_id, start_date, end_date, purpose, status, decision_notes, created_at)
notifications (notification_id, user_id, title, message, type, is_read, link, created_at)
```
