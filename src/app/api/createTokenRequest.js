import Ably from "ably/promises";

export default async function handler(req, res) {
    const client = new Ably.Realtime(process.env.ABLY_API_KEY)
    const clientId = req.query.clientId ? req.query.clientId : "unknown"
    const tokenRequestData = await client.auth.createTokenRequest({
      clientId: clientId,
    });
    res.status(200).json(tokenRequestData);
}