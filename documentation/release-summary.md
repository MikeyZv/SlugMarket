# Release Summary — SlugMarket  
**Team:** SlugMarket Development Team  
**Date:** June 8th 2026  

---

## 1. Key User Stories & Acceptance Criteria

### Browsable Homepage (8 points)  
**User Story:** “As a user, I want a browsable homepage so that I can discover available listings quickly.”  
**Acceptance Criteria:**  
- Homepage displays all active listings in a grid or list format.  
- Listings show title, price, thumbnail, and seller.  
- Page updates when new listings are added.

---

### Listing Form & Creation (8 points)  
**User Story:** “As a user, I want to fill out and submit a listing form so that I can post an item for sale.”  
**Acceptance Criteria:**  
- Form includes title, description, price, category, and images.  
- Submitting the form creates a new listing visible on the homepage.  
- Validation prevents empty or invalid fields.

---

### Login / Account Creation (5 points)  
**User Story:** “As a user, I want a login page so that I can log into my account or create an account.”  
**Acceptance Criteria:**  
- Users can register with email + password.  
- Users can log in and remain authenticated.  
- Incorrect credentials produce an error message.

---

### Listing Details Page (2 points)  
**User Story:** “As a user, I want to view listing details so that I can decide whether to buy an item.”  
**Acceptance Criteria:**  
- Page displays full description, seller info, images, and price.  
- Includes a button to message the seller.  
- Displays listing status (active, pending, sold).

---

### Messaging System (8 points)  
**User Story:** “As a user, I want a messaging page so that I can keep track of my messages.”  
**Acceptance Criteria:**  
- Users can send and receive messages.  
- Messages persist and appear chronologically.  
- Conversations are grouped by user.

---

### Search & Filter (3 + 5 points)  
**User Stories:**  
- “As a user, I want to search listings by keyword…”  
- “As a user, I want to filter listings so that I can narrow results by price or category.”  
**Acceptance Criteria:**  
- Search bar filters listings by title/description.  
- Filters update results without reloading the page.  
- Search and filters can be combined.

---

### Edit/Delete Listings (5 points)  
**User Story:** “As a user, I want to edit/delete my listings so that I can keep my listings accurate or remove sold items.”  
**Acceptance Criteria:**  
- Users can edit any field of their own listings.  
- Deleting a listing removes it from all views.  
- Only the owner can edit or delete.

---

### Reviews & Ratings (3 + 3 points)  
**User Stories:**  
- “As a user I want to review or rate sellers and buyers…”  
- “As a user, I want my ratings/reviews to display on my profile…”  
**Acceptance Criteria:**  
- Users can leave a rating and optional review.  
- Reviews appear on profile pages.  
- Average rating is calculated and displayed.

---

## 2. Known Problems

### Functional Gaps  
- Some advanced features (offering system, inbox notifications) may be partially implemented.  
- Reporting/blocking may not fully restrict interactions.

### Design Shortcuts  
- Some pages use placeholder styling.  
- Certain data (e.g., interested user counts) may be computed inefficiently.

### Technical Limitations  
- Image uploads may lack full validation.  
- Messaging may not support real‑time updates.  
- Search/filter performance may degrade with large datasets.

### Known Bugs  
- Bookmarking may not sync immediately.  
- Editing listings may not refresh cached homepage results.  
- Profile picture uploads may fail on slow connections.

---

## 3. Product Backlog (High‑Priority Items)

### High‑Priority Features  
- Inbox system for notifications (5)  
- Offering system (3)  
- Report/block chat improvements (3)  
- Reporting listings/users (2)  
- Share listings (1)  
- Seller statistics (1)

### Technical Enhancements  
- Real‑time messaging  
- Improved search ranking  
- Better image compression  
- Stronger moderation tools

### Bug Fixes  
- Fix bookmark syncing  
- Improve listing status updates  
- Address profile picture upload failures  
- Strengthen validation for listing creation/editing

---

## 4. Summary

This release delivers the core functionality of **SlugMarket**, including browsing, posting listings, user accounts, messaging, search, and profile features. While the system is functional and demonstrates the core marketplace experience, several enhancements and known issues remain for future development.