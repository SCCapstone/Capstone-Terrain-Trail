# Terrain Trail 

Our web app lets users plot and rate campus routes for walking, biking, or driving. Routes are rated by terrain and accessibility, helping users find the most efficient path for their chosen mode of transportation on the campus of the University of South Carolina. 

Project description wiki: https://github.com/SCCapstone/Capstone-Terrain-Trail/wiki/Project-Description
Project design wiki: https://github.com/SCCapstone/Capstone-Terrain-Trail/wiki/Design

## External Requirements

Node.js and npm are required to build and run this project.

From the client directory:

```bash
npm install


## Deployment 

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.

See the test section below for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

## Testing

This project uses **Jest**, **Cypress**, and **React Testing Library** for automated testing.

### Test Location

All bahavioral automated tests are located in:
client/src/pages


Tests are identified using the filename patterns:
*.test.js
*.test.jsx

### Running the Behavioral Tests

From the project root:

```bash
cd client
npm install   # if dependencies are not already installed
npm test

When the test runner starts in watch mode, press:
a

# Unit Testing Instructions (Jest)
(CreateTrail.test.js located in client/src/pages)
cd client
npm install (if package-lock.json is not present)
npm test
click "a" if needed

# Authors 

## Kyle Hix

## Madeleine McBride
Email: MM249@email.sc.edu

## Gavin Orme
Email: Gorme@email.sc.edu

## Meetkumar Patel
Email: mmp16@email.sc.edu

## Donovan Williams 
Email: dw58@email.sc.edu



# New way to run  it

git fetch origin
git checkout Meetkumar-p
git pull


Now you should see this structure:
Capstone-Terrain-Trail/
├── client/     # React app
└── server/     # Express + MongoDB

Go into the server folder and install deps:

cd server
npm install

We don’t commit the real .env, so do this:
cp .env.example .env

Then open server/.env and fill in the real MongoDB password that was shared:

MONGODB_URI=mongodb+srv://colatrails:<password>@cluster0.ipndphq.mongodb.net/colatrails?retryWrites=true&w=majority&appName=Cluster0
PORT=4000
JWT_SECRET=anyrandomstring


npm start

You should see:
DB connected
API running on http://localhost:4000

Open a new terminal (keep the server running) and do:

cd client
npm install
npm start


## Testing 
Testing for the setting page:

cd server
npm start

Open another window of terminal:

cd client
npm start

Open another window of terminal:
cd client
npx cypress run

If is there is a error you might need to install cypress with this command in the client: 
npm install -D cypress
