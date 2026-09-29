# Instagram gallery

The homepage reads its reels from the backend database. Admins can add a reel
using its Instagram link, optionally upload a thumbnail, and delete reels.
The gallery supports up to 12 entries, newest first.

When deploying this change to an existing database, run once from the project root:

```sh
node backend/scripts/import-instagram-reels.mjs
```

This imports the original six reels without duplicating existing matching links.
Do not run it on every startup: rerunning it after deleting an original reel will
restore that reel. Deploy the `public/reels` assets with the frontend.

Restart the backend after deploying its code. Configure the frontend's
`VITE_API_URL` to point to the deployed backend. Uploaded thumbnails are saved in
`backend/uploads`, which needs persistent storage. If Instagram blocks automatic
thumbnail retrieval, upload a thumbnail using the optional image field.

Git pushes do not transfer the local MySQL database or its subsequent admin edits.
