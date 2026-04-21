import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, 'data');
const publicDir = path.join(__dirname, 'public');
const dbPath = path.join(dataDir, 'menu-data.json');

const defaultData = {
  title: 'برتقانه',
  intro: '',
  branding: {
    logoText: 'برتقانه',
    accent: '#f97316',
    heroTitle: '',
    heroSubtitle: '',
    linkedMenuUrl: ''
  },
  ads: [],
  video: {
    enabled: true,
    src: '',
    opacity: 0.08,
    blur: 0,
    height: 250,
    fit: 'cover',
    position: 'center'
  },
  layoutControls: {
    title: { x: 0, y: 0, scale: 1 },
    tabs: { x: 0, y: 0, scale: 1, width: null, height: null },
    itemsCard: { x: 0, y: 0, scale: 1, width: null, height: null },
    currentCard: { x: 0, y: 0, scale: 1, width: null, height: null },
    videoCard: { x: 0, y: 0, scale: 1, width: null, height: null }
  },
  textSizes: { section: 30 },
  instapay: { enabled: false, name: '', id: '', note: '' },
  pay: { enabled: false, name: '', id: '', note: '' },
  sections: []
};

function ensureFiles(){
  if(!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if(!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  if(!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify(defaultData, null, 2), 'utf8');
}

function readJson(){
  ensureFiles();
  try {
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch {
    return defaultData;
  }
}

function writeJson(data){
  ensureFiles();
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

function sendJson(res, status, payload){
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(payload));
}

function sendText(res, status, text, type='text/plain; charset=utf-8'){
  res.writeHead(status, {
    'Content-Type': type,
    'Access-Control-Allow-Origin': '*'
  });
  res.end(text);
}

function serveStatic(req, res){
  const reqPath = req.url === '/' ? '/index.html' : req.url;
  const filePath = path.join(publicDir, reqPath.replace(/^\/+/, ''));
  if(!filePath.startsWith(publicDir)){
    sendText(res, 403, 'Forbidden');
    return true;
  }
  if(fs.existsSync(filePath) && fs.statSync(filePath).isFile()){
    const ext = path.extname(filePath).toLowerCase();
    const type = ext === '.html' ? 'text/html; charset=utf-8'
      : ext === '.js' ? 'application/javascript; charset=utf-8'
      : ext === '.css' ? 'text/css; charset=utf-8'
      : ext === '.json' ? 'application/json; charset=utf-8'
      : 'application/octet-stream';
    sendText(res, 200, fs.readFileSync(filePath), type);
    return true;
  }
  return false;
}

const server = http.createServer((req, res) => {
  if(req.method === 'OPTIONS'){
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  if(req.url === '/api/menu' && req.method === 'GET'){
    sendJson(res, 200, readJson());
    return;
  }

  if(req.url === '/api/menu' && (req.method === 'POST' || req.method === 'PUT')){
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body || '{}');
        writeJson(parsed);
        sendJson(res, 200, { ok: true });
      } catch {
        sendJson(res, 400, { ok: false, error: 'invalid_json' });
      }
    });
    return;
  }

  if(req.url === '/api/health'){
    sendJson(res, 200, { ok: true });
    return;
  }

  if(serveStatic(req, res)) return;
  sendText(res, 404, 'Not Found');
});

const PORT = process.env.PORT || 3010;
ensureFiles();
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
