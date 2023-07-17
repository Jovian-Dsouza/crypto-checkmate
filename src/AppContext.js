'use client';

import { createContext, useState, useEffect } from 'react';
import * as fcl from '@onflow/fcl';

fcl
  .config()
  .put('flow.network', 'testnet')
  .put('accessNode.api', 'https://rest-testnet.onflow.org') //Api URL for the Flow Blockchain Access Node you want to be communicating with.
  .put('discovery.wallet', 'https://fcl-discovery.onflow.org/testnet/authn') // Points FCL at the Wallet or Wallet Discovery mechanism.
  .put('app.detail.title', 'CryptoKnights')
  .put('app.detail.icon', 'https://crypto-checkmate.vercel.app/imgs/logo.png');

export const AppContext = createContext();

export function AppContextProvider({ children }) {
  const [user, setUser] = useState({ loggedIn: null });
  useEffect(() => fcl.currentUser.subscribe(setUser), []); // sets the callback for FCL to use

  return <AppContext.Provider value={{ user }}>{children}</AppContext.Provider>;
}
