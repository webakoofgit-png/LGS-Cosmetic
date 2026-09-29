import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";

function decode(value) {
  return value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

async function readLimited(response, maxBytes) {
  if (!response.ok) throw new Error("Instagram request failed");
  const chunks = [];
  let size = 0;
  for await (const chunk of response.body) {
    size += chunk.length;
    if (size > maxBytes) throw new Error("Preview exceeds size limit");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export async function saveInstagramPreview(link) {
  // The route supplies a canonical, validated Instagram post URL.
  const page = await fetch(link, { signal: AbortSignal.timeout(15000), redirect: "error" });
  const html = (await readLimited(page, 5 * 1024 * 1024)).toString("utf8");
  let image;
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    const attrs = Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/gs)].map((m) => [m[1].toLowerCase(), m[3]]));
    if (attrs.property === "og:image") image = attrs.content;
  }
  if (!image) throw new Error("No public thumbnail available");
  const url = new URL(decode(image));
  if (url.protocol !== "https:" || url.port || url.username || url.password ||
    !["cdninstagram.com", "fbcdn.net"].some((host) => url.hostname.endsWith(`.${host}`))) {
    throw new Error("Unsupported thumbnail host");
  }
  const response = await fetch(url, { signal: AbortSignal.timeout(15000), redirect: "error" });
  const ext = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[response.headers.get("content-type")?.split(";")[0]];
  if (!ext) throw new Error("Unsupported thumbnail format");
  const bytes = await readLimited(response, 5 * 1024 * 1024);
  const folder = new URL("../uploads/", import.meta.url);
  await mkdir(folder, { recursive: true });
  const filename = `instagram-${randomUUID()}.${ext}`;
  await writeFile(new URL(filename, folder), bytes);
  return `/uploads/${filename}`;
}
