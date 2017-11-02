# Backstroke Dashboard

## Overview
The Backstroke dashboard interacts with the api to provide a simple management interface for
Backstroke links.

<img src="http://i.imgur.com/YuK5Nd8.png" width="" />
<img src="http://i.imgur.com/GuwtFiu.png" width="400" />

# Development
1. Yarn is used to manage dependencies - run `yarn` to download all dependencies of the dashboard. 
3. Run `yarn start` to start the development server, courtesy of [Create React App](https://github.com/facebookincubator/create-react-app).
4. To make a production build, run `yarn build`. The build will be outputted into a `build/` folder
   created in the root of the repo. Th make a clean build, remove the `build/` folder prior to
   building.

# Environment switcher
When developing, press bang-bang-grave-space in quick succession (bang = !, grave = \`). This opens
a small modal that lets the user choose an environment to point the system to (locally, production,
staging, or something else). One option is the environment variable `REACT_APP_API_URL`. This
setting persists in `localStorage` between page reloads.

## Environment variables disambiguation
- `REACT_APP_APP_URL`: The path to this project. In production, this is `https://app.backstroke.co`.
- `REACT_APP_API_URL`: The path to the api that this project interacts with. In production, this is
  `https://api.backstroke.co`.
- `REACT_APP_ROOT_URL`: The path to the main site. In production, this is `https://backstroke.co`.
- `REACT_APP_MIXPANEL_TOKEN`: An optonal mixpanel token to use for tracking dashboard usage.
- `REACT_APP_SENTRY_DSN`: An optonal sentry DSN to use when reporting errors.
