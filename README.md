# Learnix Research Lab website
Plain static website. No database, no Firebase, no login. Upload the folder to any static host.

## Host it
GitHub Pages (recommended, enables the one-click Publish button), or Netlify Drop / any static host.

## Update content (Team, Publications, Research)
Open `/admin/dashboard.html`, use the three modules to add, edit, delete and publish entries, then press **Publish to website** (GitHub token needed once) or **Download data files** and replace the `data/` folder on your host.
Photos are resized automatically and stored inside `data/members.json`.

## Edit once
`js/site-config.js`: contact email, address, social links, optional Google Form link for applications.

## Applications and contact
These open a ready-written email to your address (the applicant adds the CV link or attachment). Paste a Google Form link into `applicationFormUrl` to collect applications and CVs in Google Drive instead.
