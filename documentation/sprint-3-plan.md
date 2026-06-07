# SPRINT 3 PLAN

### Completion Date: 5/19/26

## Goal: Implement the primary needs of a messaging system and improve seller experience with their own listings.

### User story 1: As a user, I want a messaging page so that I can keep track of my messages. (8 SP)
- **Task 1:** Create conversations table. (Time est: 1 hr, 1 SP)
    - Type: seller/buyer
    - Link to product listings

- **Task 2:** Create messages table. (Time est: 1 hr, 1 SP)

- **Task 3:** Make messaging inbox page. (Time est: 3 hrs, 3 SP)
    - Separate sections (seller, buyer)
    - Organized by latest message
    - Show latest message preview

- **Task 4:** Implement realtime chat functionality. (Time est: 3 hrs, 3 SP)
    - Fetch conversation messages from table
    - Sending new messages updates table

**Total for user story 1:** 8 hrs

### User story 2: As a user, I want to edit/delete my listings so that I can keep my listings accurate or remove sold items. (5 SP)
- **Task 1:** Add edit/delete controls to seller listings. (Time est: 1 hr, 0.5 SP)
    - Add confirmation pop up for deletion

- **Task 2:** Refactor listing form into reusable component. (Time est: 3 hrs, 2 SP)
    - Share form UI between create/edit page
    - Support prefilled initial values

- **Task 3:** Create products/edit page. (Time est: 3 hrs, 2 SP)
    - Fetches existing information of the listing
    - Populate reusable listing form
    - Save updated listing data into product_listings table

- **Task 4:** Implement listing deletion. (Time est: 2 hrs, 0.5 SP)
    - Remove listing from database
    - Handle image clean up

**Total for user story 2:** 9 hrs

### User story 3: As a user, I want to mark a listing as sold so that buyers know it's no longer available. (2 SP)
- **Task 1:** Add "mark as sold" action. (Time est: 3 hrs, 1.5 SP)
    - Files: `app/(main)/products/[id]/page.tsx`, `lib/fetchProducts.ts`
    - `product_listings` already has a sold boolean — use it directly
    - `lib/supabase.ts` exports a single shared client (no cookie-based SSR client) — do NOT use `supabase.auth.getUser()` in server components as it won't reliably return the authenticated user
    - Instead, make the seller action area a `'use client'` component `<SellerActions />` that calls `useAuth()` from AuthProvider to get the current user client-side
    - `<SellerActions />` receives `product.seller_id` as a prop from the server component and compares it to `user.id` from `useAuth()`; renders a 'Listing Status' dropdown only when they match
    - On sold: `UPDATE product_listings SET sold = true`, `INSERT` system message into all conversations for the listing

- **Task 2:** Display sold badge on listing cards. (Time est: 1 hr, 0.5 SP)
    - Prevent new users from being able to message on sold listings
    - Notify other conversations that the item is sold

**Total for user story 3:** 4 hrs

### User story 4: As a user, I want to be able to upload a profile picture so that others can see what I look like. (3 SP)
- **Task 1:** Make profile picture editable on profile page. (Time est: 2 hrs, 2 SP)
    - File: `app/(main)/[username]/page.tsx`
    - Run migration: `ALTER TABLE profiles ADD COLUMN avatar_url text`
    - Profile page will need to be a `'use client'` component (or extract an `<AvatarUpload />` client component) to use `useAuth()` for the current user
    - Show clickable avatar with camera icon overlay only when `user.id === profile.id`
    - Click triggers a hidden `<input type='file' accept='image/jpeg,image/png,image/webp' />`
    - Show loading spinner during upload

- **Task 2:** Implement image upload with file validation and storage. (Time est: 2 hrs, 1 SP)
    - Files: `app/(main)/[username]/page.tsx` (or `<AvatarUpload />` client component), `lib/supabase.ts`
    - Validate: accepted types (jpeg, png, webp), max 5 MB; reject with descriptive toast on failure
    - Upload to `avatars/{userId}/avatar.{ext}` with `upsert: true` using the shared supabase client from `lib/supabase.ts`
    - Get public URL via `supabase.storage.from('avatars').getPublicUrl(path)`
    - `UPDATE profiles SET avatar_url = url WHERE id = user.id` (use `user.id` from `useAuth()`, not `auth.uid()`)
    - Append `?t=Date.now()` to `<img>` src to bust the browser cache after update

**Total for user story 4:** 4 hrs

### User story 5: As a buyer, I want an offering button and system so that I can easily make an offer that shows up rather than possibly going unseen by the seller. (3 SP)
- **Task 1:** Make offer action button above the chat. (Time est: 1 hr, 0.5 SP)

- **Task 2:** Create offers database table. (Time est: 1 hr, 0.5 SP)
    - Store offer amount, sender, status, and timestamps

- **Task 3:** Render offer messages in chat. (Time est: 3 hrs, 1.5 SP)
    - Display accept/decline/counter actions
    - Update offer status

**Total for user story 5:** 6 hrs

### User story 6: As a user, I want to see the count of other users interested in my listing so that I can better manage offering or editing listings. (1 SP)
- **Task 1:** Display count of bookmarks for that listing. (Time est: 2 hrs, 0.5 SP)
    - File: `app/(main)/products/[id]/page.tsx`, `lib/fetchProducts.ts`
    - Add `fetchBookmarkCount(listingId)` to `lib/fetchProducts.ts` — `SELECT COUNT(*) FROM bookmarks WHERE product_id = :listingId`; follow existing error-log-then-throw pattern
    - Call alongside the existing profile fetch in ProductPage; render N saves below the condition badge, visible to all users

- **Task 2:** Display count of offers for that listing. (Time est: 2 hrs, 0.5 SP)

**Total for user story 6:** 4 hrs

### Team roles:
- Andrew Le - Product Owner
- Luis Del Rosario - Scrum Master
- Kenny Young - Team Member
- Miguel Zavala - Team Member

### Initial task assignment:
- Andrew Le - user story 2: task 1
- Miguel Zavala - user story 4: task 1
- Kenny Young - user story 6: task 1
- Luis Del Rosario - user story 6: task 2

### Initial burnup chart:

![image](images/init-burnup3.png)

### Initial scrum board:

![image](images/init-scrumboard3.png)

### Scrum times:
- Monday: 1pm - 2pm
- Wednesday: 1pm - 2pm (TA included)
- Friday: 1pm - 2pm