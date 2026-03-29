import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modelsDir = path.join(__dirname, 'public', 'models');

if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
}

const url = 'https://raw.githubusercontent.com/opencv/opencv/master/data/haarcascades/haarcascade_frontalface_default.xml';

async function download() {
    console.log(`Downloading haarcascade...`);
    const res = await fetch(url);
    const text = await res.text();
    fs.writeFileSync(path.join(modelsDir, 'haarcascade_frontalface_default.xml'), text);
    console.log(`Saved haarcascade`);
}

download().catch(console.error);
