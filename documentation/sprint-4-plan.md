# SPRINT 4 PLAN

### Completion Date: 6/02/26

## Goal: Improve community communication with reviews and reports, and improve on previous features.

### User story 1: As a user, I want to review or rate sellers and buyers so that I can help other users make informed decisions. (3 SP)
- **Task 1:** Create reviews table. (Time est: 1 hr, 1 SP)
    - reviewer_id
    - reviewed_user_id
    - listing_id
    - conversation_id
    - rating (1-5)
    - review_text

- **Task 2:** Create review modal/form UI. (Time est: 1 hr, 1 SP)
    - Star selector
    - Optional text review

- **Task 3:** Make "Leave Review" button show up in a user conversation. (Time est: 1 hr, 1 SP)

**Total for user story 1:** 3 hrs

### User story 2: As a user, I want my ratings/reviews to display on my profile so other users can determine if I'm trustworthy. (3 SP)
- **Task 1:** Fetch profile review statistics. (Time est: 1 hr, 1 SP)
    - Average rating
    - Total reviews

- **Task 2:** Render star rating summary on profile. (Time est: 1 hr, 0.5 SP)

- **Task 3:** Display review cards on profile page. (Time est: 1 hr, 1 SP)
    - Reviewer username
    - Rating
    - Review text
    - Date

- **Task 4:** Display review cards on seller's item listing in the seller section. (Time est: 1 hr, 0.5 SP)

**Total for user story 2:** 4 hrs

### User story 3: As a user, I want to see the total amount of items sold on a seller's profile page to help understand their reputation as a good or experienced seller. (1 SP)
- **Task 1:** Count listings marked as sold. (Time est: 1 hr, 0.5 SP)

- **Task 2:** Display "X items sold" on profile page. (Time est: 1 hr, 0.5 SP)

**Total for user story 3:** 2 hrs

### User story 4: As a user, I want to add a bio to my profile page so that other users can learn about me before transacting. (1 SP)
- **Task 1:** Add bio column to profiles table. (Time est: 1 hr, 0.33 SP)

- **Task 2:** Create editable bio section in profile settings. (Time est: 1 hr, 0.33 SP)

- **Task 3:** Display bio on public profile page. (Time est: 1 hr, 0.33 SP)

**Total for user story 4:** 3 hrs

### User story 5: As a user, I want to report a listing or user so that I can flag suspicious or inappropriate content. (2 SP)
- **Task 1:** Create reports table. (Time est: 1 hr, 0.33 SP)
    - id
    - reporter_id (nullable)
    - reported_user_id (nullable)
    - reported_conversation_id (nullable)
    - reason
    - description

- **Task 2:** Add report button to listing page. (Time est: 1 hr, 0.33 SP)

- **Task 3:** Add report button and block button dropdown menu on seller profile page. (Time est: 1 hr, 0.33 SP)

- **Task 4:** Create report form modal. (Time est: 1 hr, 1 SP)
    - Reason dropdown
    - Optional description
    - Submit to database

**Total for user story 5:** 4 hrs

### User story 6: As a user, I want an inbox so that I can be notified of agreements being made or a person interested in my item, etc. (5 SP)
- **Task 1:** Create inbox UI/modal. (Time est: 5 hrs, 5 SP)
    - Notifies if a person is interested or offer made/accepted
    - Shows time happened

**Total for user story 6:** 5 hrs

### Team roles:
- Andrew Le - Product Owner
- Kenny Young - Scrum Master
- Luis Del Rosario - Team Member
- Miguel Zavala - Team Member

### Initial task assignment:
- Andrew Le - user story 7: task 1
- Miguel Zavala - user story 5: task 1
- Kenny Young - user story 1: task 1
- Luis Del Rosario - user story 4: task 1

### Initial burnup chart:

![image](images/init-burnup4.png)

### Initial scrum board:

![image](images/init-scrumboard4.png)

### Scrum times:
- Monday: 1pm - 2pm  
- Wednesday: 1pm - 2pm (TA included) 
- Friday: 1pm - 2pm  

