- I want to create a web application using Next.js, Firebase, and TypeScript.
- The application should have a responsive design that works well on both desktop and mobile devices, keep it mobile-first.
- The application should have a clean and intuitive user interface refer DESIGN.md for more details.
- Users of my app
    - Committee
    - Normal User
- The application should have a secure login system that uses Firebase Authentication.
    - Committee can login using their email and password.
          - Committee cannot login using Google account.
    - Normal Users can login only using their Google account.

--- LOGIN SYSTEM ---

1. Existing User's Login Flow
- As soon as any user lands on the application, they are redirected to the login page.
- There will be a radio button to select the user type.
    - Committee
    - Normal User
- If user selects Committee, the bottom form shows email and password fields.
- If user selects Normal User, the bottom form shows Google Account login button.

2. New User's Login Flow
- As soon as any user lands on the application, they are redirected to the login page.
- The Page shows 2 options.
    - Login
    - Register
- If user selects Login, they are redirected to the login page.
    It follow the above existing user login flow.
- If user selects Register, they are redirected to the register page.
    - If its a Normal User, they simple login with Google account.
    - If its a Committee, a form is shown asking below details.
        -  logo, 
        -  name, 
        -  email, 
        -  phone number, 
        -  address, 
        -  website, 
        -  description
    - After filling the form a request is sent for approval from the admin (owner of the application).
    - Admin can approve or reject the request. (Create a basic admin dashboard with fixed email address and password, its not part of main web application)
        - Admin will review the details and approve or reject the request.
    - If approved, they can login with their email and password.
    - If not approved, they are notified about the rejection.


    --- ADMIN DASHBOARD ---
    - A Simple Login form that asks for email and password.
    - Dashboard shows all the committees that have requested approval.
    - Admin can approve or reject the request from the dashboard.
    - Show 4 cards regarding the total number of committees, approved committees, rejected committees, and pending requests.
    - A table that shows all the committees with their details.
        - Name
        - Email
        - Phone Number
        - Address
        - Website
        - Description
        - Status (Approved, Rejected, Pending)
        - Action (Approve, Reject).
        - Logo

--- WEB APPLICATION ---
    --- HOMEPAGE ---
    - Shows List of all Juloos (Events) happening currently. 
    - User can click on any event to view details.

    --- EVENT DETAILS PAGE ---
    - Shows details of the selected event.
    - User can view the event details, including the committee that organized the event, the event time, the event location, and the event description.
    - Each Juloos (Event) has following cards
        - Organizing Committee
        - Announcements
        - Register as Volunteer
        - Route of the Juloos (Start and End Point plotted on a map)
        - SOS Button (To report any incident or emergency) [Request can be seen by committee & volunteers]
        - Register Niyaz (It can be individual or a sabeel/booth)
        - Lost and Found Section (can be a person or an item) -> can be raised by a nearby volunteer only or report directly to the committee (offline).

    --- DEDICATED SECTION FOR COMMITTEE ---
        - An Additional Page, where the committee can view all their events.
        - They are shown list of all their events.
        - They can click on any event to view details.
        - On Details Page, they can view the event details and cards that shows the volunteers registered, the lost & found items, niyaz registration requests, and the SOS requests. (Each cards shows number of records registered)

        - On clicking each card, they can view the details of that card.
          - Volunteers registered
             - Shows a table that displays id, name, phone number, email, profile picture, status (Approved, Rejected, Pending), attendance (Present, Absent)
             - Action (Approve, Reject)
          - Lost & Found items/persons (Both of them will have their dedicated tables)
              - shows a table that displays id, item name, item description, item location, item status (Found, Lost), item type (Person, Item), reported by (Volunteer details (show in a popup card))
              - Action (Pending, Resolved)
              - They can also send the lost persons details directly in the announcements section of the event from here.
              - Only committee can resolve the lost item.
              - The table is visible to committee and volunteers.
          - Niyaz registration requests
            - Shows a table that displays id, niyaz name, type of distributor (Individual, Sabeel/Booth), distributor name, distributor phone number, distributor email, distributor address, distributor website, distributor description, status (Approved, Rejected, Pending), expiration date etc.
            - Action (Approve, Reject)
            - If approved by committee, they will get the qr code that can be verified by the volunteers during the event (juloos).

          - SOS requests
            - Shows a table that displays id, incident description, incident location, incident time, incident status (Pending, Resolved)
            - Action (Pending, Resolved)
            - The table is visible to committee and volunteers.
            - Only committee can resolve the incident.

    --- VOLUNTEER FEATURES ---
    - The volunteers can view all sections that everyone can see in the application.
    - The have the following additional features:
        - They can scan the qr code of the niyaz to verify the identity of the distributor.
        - They can view the SOS requests, but cannot resolve them.
        - They can report lost and found items/persons and can view existing reports.
        - They can mark their attendance as present or absent, by using a button.


