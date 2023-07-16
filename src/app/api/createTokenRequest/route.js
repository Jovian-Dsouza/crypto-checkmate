import Ably from "ably/promises";
import { NextResponse } from 'next/server';

export async function GET(request) {
  const client = new Ably.Realtime(process.env.ABLY_API_KEY);
  const { searchParams } = new URL(request.url);
  let clientId = searchParams.get('clientId');
  clientId = clientId ? clientId : "unknown";
  const tokenRequestData = await client.auth.createTokenRequest({
    clientId: clientId,
  });
  console.log('clientId', clientId);

  return NextResponse.json(tokenRequestData);
}