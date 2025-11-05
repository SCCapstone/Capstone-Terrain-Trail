# Terrain Trail 

Our web app lets users plot and rate campus routes for walking, biking, or driving. Routes are rated by terrain and accessibility, helping users find the most efficient path for their chosen mode of transportation on the campus of the University of South Carolina. 

Project description wiki: https://github.com/SCCapstone/Capstone-Terrain-Trail/wiki/Project-Description
Project design wiki: https://github.com/SCCapstone/Capstone-Terrain-Trail/wiki/Design

## External Requirements 

In order to build this project you will need to run commands: 

npm install


## Deployment 

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)


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

