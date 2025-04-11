# Configure CloudFlare Tunnel Ingress Action for GitHub

Configure CloudFlare Tunnel Ingress properties.

The fallback will be set to `{"service": "http_status:404" }`.

## Usage via Github Actions

```yaml
name: example
on: pull_request
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: kourawealthtech/cf-set-tunnel-ingress@v1.0
        with:
          name: "some-tunnel-name"
          endpoints: "endpoint1.domain.com|http://localhost:3000, endpoint2.domain.com|http://localhost:8000"
          account_id: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          token: ${{ secrets.CLOUDFLARE_TOKEN }}
```

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE).
