# Juice POS Fullstack Deployment

## Files
- `server.js`: Node HTTP server serving API and frontend
- `public/menu.html`: customer menu
- `public/admin.html`: admin control panel
- `data/menu-data.json`: shared published data

## Local run
1. `node server.js`
2. Open:
   - `/menu.html` for menu
   - `/admin.html` for admin

## Deploy
### Render
- Create a new Web Service from this folder
- Start command: `node server.js`
- The app serves both frontend and API from the same domain

## API
- `GET /api/menu`
- `POST /api/menu`
- `GET /api/health`
