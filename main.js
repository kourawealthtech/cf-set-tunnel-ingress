/**
 * Create CloudFlare Configure Tunnel Action for GitHub
 */

const cp = require("child_process");

const CF_API_BASE_URL = "https://api.cloudflare.com/client/v4";

const getCurrentTunnelId = () => {
  const params = new URLSearchParams({
    name: process.env.INPUT_NAME,
    is_deleted: "false",
  });

  const { status, stdout } = cp.spawnSync("curl", [
    ...["--header", `Authorization: Bearer ${process.env.INPUT_TOKEN}`],
    ...["--header", "Content-Type: application/json"],
    `${CF_API_BASE_URL}/accounts/${process.env.INPUT_ACCOUNT_ID}/cfd_tunnel?${params.toString()}`,
  ]);

  if (status !== 0) {
    process.exit(status);
  }

  const { success, result, errors } = JSON.parse(stdout.toString());

  if (!success) {
    console.log(`::error ::${errors[0].message}`);
    process.exit(1);
  }

  const name = process.env.INPUT_NAME;
  const record = result.find((x) => x.name === name);

  if (!record) {
    return null
  }

  setOutput('id', record.id);
  return record.id;
};

const configureTunnel = (id) => {
  const ingresses = process.env.INPUT_ENDPOINTS.split(",").map((x) => {
    const [hostname, service] = x.replace(/\s/, '').split("|");
    return {
      hostname,
      service,
      origin_request: {
        no_tls_verify: true
      }
    };
  });

  const { status, stdout } = cp.spawnSync("curl", [
    ...["--request", "PUT"],
    ...["--header", `Authorization: Bearer ${process.env.INPUT_TOKEN}`],
    ...["--header", "Content-Type: application/json"],
    ...["--silent", "--data"],
    JSON.stringify({
      config :{
        ingress: [
          ...ingresses,
          {
            service: "http_status:404"
          }
        ],
        type: "http"
      }

    }),
    `${CF_API_BASE_URL}/accounts/${process.env.INPUT_ACCOUNT_ID}/cfd_tunnel/${id}`,
  ]);

  if (status !== 0) {
    process.exit(status);
  }

  const { success, result, errors } = JSON.parse(stdout.toString());

  if (!success) {
    console.dir(errors[0]);
    console.log(`::error ::${errors[0].message}`);
    process.exit(1);
  }
};

const id = process.env.INPUT_ID || getCurrentTunnelId();
if (id) {
  configureTunnel(id);
} else {
  console.log(`::error::Tunnel not found with the provided reference`);
  process.exit(1);
}
