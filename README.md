# Emily Wu — Product design portfolio

Live site: https://emilee369.github.io/portfolio/

The HTML, CSS, and JavaScript files are the editable website source. Images, audio, videos, and research-board tiles are preserved in `assets-part-*.zip` bundles so the full portfolio can be uploaded through GitHub's browser interface.

## Publishing updates

Edit the page files and commit to `main`. The **Publish portfolio** GitHub Actions workflow assembles the files and assets, then publishes the site automatically. In Settings → Pages, keep the publishing source set to **GitHub Actions**.

To replace an asset, update its matching `assets/…` entry inside the asset bundle. Preserve its path. For local preview, extract every bundle into this directory, then serve it with a local static server.
