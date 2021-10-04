# Capstone: Restaurant Reservation System 

The Restaurant Reservation System project was created for restaurants to create, edit, and manage reservations.  The application allows the user to create a new reservation, edit any reservartions, create tables for customers to sit, and search for any existing reservations.  

Front-End & Back-End languages & frameworks: React, as well as Javascript, HTML, & CSS to enhance the user experience, PostgreSQL, Knex.js, Express.js

/ or /dashboard
The dashboard consists of any existing reservations for today, tomorrow, or the previous day.  Reservation status is also shown if a table is occupied or available.  Users can also edit the seating for a specific table from the dashboard (edit a seat or cancel the reservation).  

/search
The search option opens a form for users to search for a reservation by telephone number

/reservations/new
The new reservation option opens a form for the user to input information to create a reservation.  Once submitted, the reservation will appear on the dashboard with the appropriate information

/tables/new
The new table option opens a form where the user can create a new table that will appear on the dashboard, with a name and the capacity of the table. 

To use the application locally: 
1) Fork/Clone the code into a local GIT repository
2) Create a PostgreSQL database to get started
3) Navigate to the parent folder for the project and run npm install
4) Open the code in your editor (e.g. VS Code, etc)
5) Change the URL's in the .env file for the back-end to your created database URL
6) Run "npm start" from the front-end folder
7) The application will automatically run on the localhost:5000 for the server and localhost:3000 for the user interface

Deployed Application: 

