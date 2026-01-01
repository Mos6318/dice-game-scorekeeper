# 🚀 How to Deploy Your Dice Game

Follow these steps exactly to publish your game on GitHub.

## Step 1: Create the Repository on GitHub
1.  Log in to [GitHub.com](https://github.com).
2.  Click the **+** icon in the top-right corner and select **New repository**.
3.  **Repository name**: `dice-game-scorekeeper` (or whatever you like).
4.  **Public/Private**: Choose **Public** (required for free GitHub Pages).
5.  **Initialize this repository with**: Leave all checkboxes **unchecked**.
6.  Click **Create repository**.

## Step 2: Upload Your Files
1.  On the next screen, look for the link that says **"uploading an existing file"** (it's usually small text).
2.  Drag and drop ALL files from your `dice-game-scorekeeper` folder into the browser window.
    > **Note:** Do NOT include `dice-game-scorekeeper-local` or `backups`. Only the files inside the main folder.
    *   `index.html`
    *   `index.css`
    *   `index.js`
    *   `README.md`
    *   `.nojekyll` (Important!)
3.  Wait for the files to finish uploading.
4.  In the "Commit changes" box at the bottom, type "Initial upload".
5.  Click **Commit changes**.

## Step 3: Configure GitHub Pages (CRITICAL STEP)
1.  Click on the **Settings** tab at the top of your repository page.
2.  In the left sidebar, click **Pages** (under the "Code and automation" section).
3.  **Source**: Ensure it says **Deploy from a branch**.
4.  **Branch**: Select **main** (or *master*) from the dropdown, and keep folder as **/(root)**.
5.  Click **Save**.

## Step 4: Verify
1.  Refresh the Pages settings page.
2.  You should see a message at the top: **"GitHub Pages source saved."**
3.  Wait about 1-2 minutes.
4.  Refresh again. You will see a link: `https://your-username.github.io/dice-game-scorekeeper/`.
5.  Click that link to see your live game!

> **Note:** If you see a 404 error immediately, wait 2 more minutes and refresh. It takes time for GitHub to start the server.
