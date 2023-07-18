import { AppContext } from "@/AppContext";
import { useContext, useEffect, useMemo } from "react";

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
// const walletAddress = generateRandomWalletAddress();
// const ably = new Ably.Realtime.Promise({
//   authUrl: "/api/createTokenRequest",
//   clientId: walletAddress,
// });

export function useChannel(gameId, callbackOnMessage) {
  const {ably} = useContext(AppContext);
  const gameChannel = useMemo(()=>{
    if(ably){
      return ably.channels.get(`gametest:${gameId}`);
    }
  }, [ably]);
  
  const chatChannel = useMemo(() => {
    if (ably) {
      return ably.channels.get(`chat:${gameId}`);
    }
  }, [ably]);
  // const gameChannel = ably.channels.get(`gametest:${gameId}`);
  // const chatChannel = ably.channels.get(`chat:${gameId}`);

  const onMount = () => {
    if(gameChannel){
      gameChannel.subscribe((msg) => {
        callbackOnMessage(msg);
      });
    }
  };

  const onUnmount = () => {
    if(gameChannel){
      gameChannel.unsubscribe();
    }
  };

  useEffect(() => {
    onMount();
    return () => {
      onUnmount();
    };
  }, [gameChannel]);

  return [gameChannel, chatChannel, ably];
}
