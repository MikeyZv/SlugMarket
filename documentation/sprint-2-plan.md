# SPRINT 2 PLAN

### Completion Date: 5/05/26

## Goal: Implement the search functionality and bookmarking feature for when browsing product listings and the ability to navigate through other user profiles.

### User story 1: As a user, I want to view listing details so that I can decide whether to buy an item. (3 SP)
- **Task 1:** Create a dynamic route page for the product details. (Time est: 2 hrs, 1 SP)
    - UI + frontend design

- **Task 2:** Fetch listing data using listing id. (Time est: 2 hrs, 1 SP)

- **Task 3:** Render listing images/details/seller info. (Time est: 2 hrs, 0.5 SP)

- **Task 4:** Handle invalid or missing listing ids. (Time est: 1 hr, 0.5 SP)
    - 404 page not found displayed

**Total for user story 1:** 7 hrs

### User story 2: As a user, I want to search listings by keyword so that I can quickly find items I'm looking for. (3 SP)
- **Task 1:** Create search bar as input. (Time est: 1 hr, 1 SP)
    - UI + frontend design

- **Task 2:** Link search input to URL query to fetch listings. (Time est: 3 hrs, 1 SP)
    - Select from database using title and description

- **Task 3:** Handle empty search results and loading state. (Time est: 1 hr, 1 SP)

**Total for user story 2:** 5 hrs

### User story 3: As a user, I want to filter listings so that I can narrow results by price or category. (5 SP)
- **Task 1:** Create filter form UI. (Time est: 2 hrs, 2 SP)
    - UI + frontend
    - Category dropdown
    - Price range inputs
    - Filter button or live filter layout

- **Task 2:** Implement filtering queries and update results. (Time est: 3 hrs, 2 SP)
    - Filter by selected category (price/condition from product_listings table)
    - Test multiple category cases
    - Min price, max price
    - Update listings shown

- **Task 3:** Test combined filtering behavior and preserve URL params. (Time est: 2 hrs, 1 SP)
    - Category and price together
    - Verify correct results appear
    - Preserve filters in URL query params (searching by keyword with filters)

**Total for user story 3:** 7 hrs

### User story 4: As a user, I want my own listings to display on my profile so that I can track what I currently have for sale. (3 SP)
- **Task 1:** Create My Listings section on profile page. (Time est: 2 hrs, 1 SP)
    - Add "My Listings" section
    - Reserve space for cards/items

- **Task 2:** Fetch listings using current user_id and render listings. (Time est: 3 hrs, 1 SP)
    - Connect user listings data
    - Render listing cards or rows
    - Select from table using user_id (sold, or active)

- **Task 3:** Add separate section for sold or inactive items. (Time est: 2 hrs, 1 SP)
    - Sold items section
    - Organize by listing status

**Total for user story 4:** 7 hrs

### User story 5: As a user, I want to bookmark listings so that I can keep track of the items I'm interested in. (5 SP)
- **Task 1:** Create bookmarks table. (Time est: 2 hrs, 1 SP)
    - Columns include user_id, product_listings id

- **Task 2:** Create a button to bookmark. (Time est: 2 hrs, 1 SP)
    - UI
    - OnClick will change symbol color and save to storage of bookmarked items
    - Can unbookmark as well

- **Task 3:** Create a page that lists all bookmarked items. (Time est: 3 hrs, 3 SP)
    - Selected using user_id and boolean "saved"
    - Page renders all bookmarked items in a grid

**Total for user story 5:** 7 hrs

### User story 6: As a user, I want to visit other users' profiles so that I can learn about sellers before buying from them and also see what other things they could be selling. (5 SP)
- **Task 1:** Make username/pfp a clickable link. (Time est: 1 hr, 1 SP)

- **Task 2:** Make links fetch user profile data from database. (Time est: 2 hrs, 2 SP)
    - Display/route to seller profile page

- **Task 3:** Fetch seller listings for seller profile page. (Time est: 2 hrs, 2 SP)
    - Display product listings data on page

**Total for user story 6:** 5 hrs

### Team roles:
- Andrew Le - Product Owner
- Luis Del Rosario - Scrum Master
- Kenny Young - Team Member
- Miguel Zavala - Team Member

### Initial task assignment:
- Andrew Le - user story 1: task 1, user story 6
- Miguel Zavala - user story 2, task 1
- Kenny Young - user story 1, task 1
- Luis Del Rosario - user story 4, task 1

### Initial burnup chart:

![image](images/init-burnup2.png)

### Initial scrum board:

![image](images/init-scrumboard2.png)

### Scrum times:
- Monday: 1pm - 2pm
- Wednesday: 1pm - 2pm (TA included)
- Friday: 1pm - 2pm