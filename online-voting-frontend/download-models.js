import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modelsDir = path.join(__dirname, 'public', 'models');

if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
}

const baseUrl = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
const files = [
    'tiny_face_detector_model-weights_manifest.json',
    'tiny_face_detector_model-shard1'
];

async function download() {
    for (const file of files) {
        console.log(`Downloading ${file}...`);
        const res = await fetch(baseUrl + file);
        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        fs.writeFileSync(path.join(modelsDir, file), buffer);
        console.log(`Saved ${file}`);
    }
}

download().catch(console.error);
