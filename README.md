# Terrain Trail

Our web app lets users plot and rate campus routes for walking, biking, or driving.
Routes are rated by terrain and accessibility, helping users find the most efficient
path for their chosen mode of transportation on the campus of the University of
South Carolina.

Project description wiki:
https://github.com/SCCapstone/Capstone-Terrain-Trail/wiki/Project-Description

Project design wiki:
https://github.com/SCCapstone/Capstone-Terrain-Trail/wiki/Design


## External Requirements

Node.js and npm are required to build and run this project.

From the client directory:

npm install


## Deployment

### Running the Client

From the project root:

cd client
npm install
npm start

Runs the app in development mode at:
http://localhost:3000

The page will reload when you make changes.
You may also see lint errors in the console.


### Running the Server

Fetch the latest code and switch to the active branch:

git fetch origin
git checkout Meetkumar-p
git pull

Project structure:

Capstone-Terrain-Trail/
├── client/     # React frontend
└── server/     # Express + MongoDB backend


From the server directory:

cd server
npm install


Environment variables are not committed. Create a local .env file:

cp .env.example .env


Edit server/.env and add the provided credentials:

MONGODB_URI=mongodb+srv://colatrails:<password>@cluster0.ipndphq.mongodb.net/colatrails?retryWrites=true&w=majority&appName=Cluster0
PORT=4000
JWT_SECRET=anyrandomstring


Start the server:

npm start

Expected output:

DB connected
API running on http://localhost:4000


## Testing

This project uses Jest and React Testing Library for automated testing.


### Test Location

All automated tests are located in:

client/src/pages/


Tests are identified using the filename patterns:

*.test.js
*.test.jsx


### Running the Tests

From the project root:

cd client
npm install
npm test

When the test runner starts in watch mode, press:

a

to run all tests.


### Test Types Included

Unit / Component Tests
- Verify that individual pages and components render correctly and contain required UI elements.

Behavioral Tests
- Simulate user-visible behavior such as loading saved routes and rendering the Sign Up page
  to ensure core workflows function as expected.

All tests must pass before code is committed or merged.


## Authors

Kyle Hix

Madeleine McBride
Email: MM249@email.sc.edu

Gavin Orme
Email: Gorme@email.sc.edu

Meetkumar Patel
Email: mmp16@email.sc.edu

Donovan Williams
Email: dw58@email.sc.edu