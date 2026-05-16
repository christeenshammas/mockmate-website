export const config = {
  api: {
    bodyParser: false,
    sizeLimit: "100mb",
  },
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const n8nUrl = "https://safaa85.app.n8n.cloud/webhook/f8358328-b12b-4925-acca-891f7893bd32";

  try {
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
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
