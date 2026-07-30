// Extracts the HTML template from a Claude bundled artifact page.
import { readFileSync, writeFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';

const file = process.argv[2];
const html = readFileSync(file, 'utf8');

function extractTag(type) {
  const marker = `<script type="${type}">`;
  const start = html.indexOf(marker);
  if (start === -1) return null;
  const contentStart = start + marker.length;
  const end = html.indexOf('</script>', contentStart);
  return html.slice(contentStart, end);
}

const manifestRaw = extractTag('__bundler/manifest');
const templateRaw = extractTag('__bundler/template');

if (!templateRaw) {
  console.error('No __bundler/template found');
  process.exit(1);
}

let template = JSON.parse(templateRaw);
console.error('Template extracted, length:', template.length);

// Decode manifest resources and substitute into template (skip fonts to keep output small)
const manifest = manifestRaw ? JSON.parse(manifestRaw) : {};
for (const [uuid, entry] of Object.entries(manifest)) {
  if (entry.mime.startsWith('font/')) continue; // skip fonts
  try {
    let bytes = Buffer.from(entry.data, 'base64');
    if (entry.compressed) bytes = gunzipSync(bytes);
    // Only substitute text-ish resources inline; otherwise leave uuid
    if (entry.mime.startsWith('text/') || entry.mime === 'image/svg+xml') {
      const dataUri = `data:${entry.mime};base64,${bytes.toString('base64')}`;
      template = template.split(uuid).join(dataUri);
    }
  } catch (e) {
    console.error('Failed to decode', uuid, e.message);
  }
}

writeFileSync(process.argv[3] || 'extracted.html', template);
console.error('Wrote', process.argv[3] || 'extracted.html');
