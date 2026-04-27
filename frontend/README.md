# Cashflow Frontend

This repository contains the frontend for the Cashflow Monitoring Application.

## Deployment to GitHub Pages

To deploy this project to GitHub Pages:

1.  **Build the project**:
    ```bash
    npm run build
    ```
2.  **Deploy**:
    You can use the `gh-pages` package:
    ```bash
    npm install gh-pages --save-dev
    ```
    Add scripts to `package.json`:
    ```json
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
    ```
    Then run:
    ```bash
    npm run deploy
    ```

## Configuration
The `vite.config.js` is configured with `base: '/TASBDCashflow/'` for GitHub Pages compatibility.
