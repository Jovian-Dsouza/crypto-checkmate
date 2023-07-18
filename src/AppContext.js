'use client';

import { createContext, useState, useEffect, useMemo } from 'react';
import * as fcl from '@onflow/fcl';
import Ably from 'ably/promises';


fcl
  .config()
  .put('flow.network', 'testnet')
  .put('accessNode.api', 'https://rest-testnet.onflow.org') //Api URL for the Flow Blockchain Access Node you want to be communicating with.
  .put('discovery.wallet', 'https://fcl-discovery.onflow.org/testnet/authn') // Points FCL at the Wallet or Wallet Discovery mechanism.
  .put('app.detail.title', 'CryptoKnights')
  .put('app.detail.icon', 'https://crypto-checkmate.vercel.app/imgs/logo.png')
  .put('0xChessKnights', '0xed4dad55d4060467')
  .put('0xChessOracleElo', '0xed4dad55d4060467');

export const AppContext = createContext();

export function AppContextProvider({ children }) {
  const [user, setUser] = useState({ loggedIn: null });
  const ably = useMemo(()=>{
    if(user && user.loggedIn){
      return new Ably.Realtime.Promise({
        authUrl: '/api/createTokenRequest',
        clientId: user.addr,
      });
    }
  }, [user])

  useEffect(() => fcl.currentUser.subscribe(setUser), []); // sets the callback for FCL to use

  return <AppContext.Provider value={{ user, ably }}>{children}</AppContext.Provider>;
}
