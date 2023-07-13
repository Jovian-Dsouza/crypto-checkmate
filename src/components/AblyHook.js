import Ably from "ably/promises";
import { useEffect } from "react";

function generateRandomWalletAddress() {
  const length = 16;
  const characters = "0123456789ABCDEF";
  let result = "0x";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}

//TODO Replace with actual wallet address
const walletAddress = generateRandomWalletAddress();
const ably = new Ably.Realtime.Promise({
  authUrl: "/api/createTokenRequest",
  clientId: walletAddress,
});

export function useChannel(gameId, callbackOnMessage) {
  const gameChannel = ably.channels.get(`gametest:${gameId}`);
  const chatChannel = ably.channels.get(`chat:${gameId}`);

  const onMount = () => {
    gameChannel.subscribe((msg) => {
      callbackOnMessage(msg);
    });
    chatChannel.subscribe((msg) => {
      callbackOnMessage(msg);
    });
  };

  const onUnmount = () => {
    gameChannel.unsubscribe();
    chatChannel.unsubscribe();
  };

  useEffect(() => {
    onMount();
    return () => {
      onUnmount();
    };
  });

  return [gameChannel, chatChannel, ably];
}
