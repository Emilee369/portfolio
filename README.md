# Emily Wu — Product design portfolio

Live site: https://www.emilywu.website/

The editable HTML, CSS, and JavaScript pages are in the repository root. The original images, music, video, and research tiles are stored in `assets-part-*.zip` bundles. `build-site.sh` unpacks them into `_site`, together with page files and the resume PDF.

Vercel uses `vercel.json` to build and publish `_site`. Committing updates to `main` redeploys automatically. GitHub Pages uses the same build through `.github/workflows/publish.yml`.

All shared page links use Emily’s logo as their social preview. Resume navigation opens the supplied PDF in a new tab.
