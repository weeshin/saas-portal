# GHCR Container Publishing

The workflow in `.github/workflows/publish-images.yml` publishes two private container images:

```text
ghcr.io/<owner>/<repository>-api
ghcr.io/<owner>/<repository>-web
```

It runs after pushes to `main`, semantic-version tags such as `v1.0.0`, or a manual dispatch. The workflow uses GitHub's repository-scoped `GITHUB_TOKEN`; no personal access token is required for publishing.

## Tags

| Git event | Tags produced |
| --- | --- |
| Push to `main` | `main`, `latest`, `sha-<commit>` |
| Push tag `v1.2.3` | `1.2.3`, `1.2`, `sha-<commit>` |

Deploy production images by digest from the workflow summary:

```text
ghcr.io/<owner>/<repository>-api@sha256:<digest>
ghcr.io/<owner>/<repository>-web@sha256:<digest>
```

## Repository configuration

In GitHub, open **Settings → Actions → General → Workflow permissions** and allow workflows to have read and write permissions if organization policy does not already permit `packages: write`.

After the first publish, open each package's settings and keep it linked to this repository. Private visibility is recommended for the Portal.

## Pulling on the VPS

Create a dedicated classic personal access token with only `read:packages`, then authenticate without placing the token on the command line:

```bash
echo "$GHCR_PULL_TOKEN" | docker login ghcr.io --username YOUR_GITHUB_USER --password-stdin
docker pull ghcr.io/<owner>/<repository>-api:1.0.0
docker pull ghcr.io/<owner>/<repository>-web:1.0.0
```

Do not commit the pull token or add it to an application container.

## Runtime details

- The API listens on port `3100` and exposes `/api/v1/health/live`.
- The web image listens on port `80`, serves Vue history routes, and proxies `/api/*` to `API_UPSTREAM`.
- `API_UPSTREAM` defaults to `http://api:3100` and can be overridden in Compose.
- Run production migrations with `npm run migration:run:prod -w @saas-portal/api` inside the API image before starting a newly deployed release.
