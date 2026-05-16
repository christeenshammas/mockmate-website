export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const n8nUrl = "https://safaa85.app.n8n.cloud/webhook/f8358328-b12b-4925-acca-891f7893bd32";

  const response = await fetch(n8nUrl, {
    method: "POST",
    body: req,
    headers: {
      ...req.headers,
      host: "safaa85.app.n8n.cloud",
    },
    duplex: "half",
  });

  const data = await response.json();
  res.status(response.status).json(data);
}
