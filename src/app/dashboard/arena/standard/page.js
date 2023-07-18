'use client';
import { AppContext } from '@/AppContext';
import { ChessBoard } from '@/components/ChessBoard';
import { useContext, useMemo } from 'react';

export default function Arena() {
  const { user } = useContext(AppContext);
  const address = useMemo(() => (user.addr ? user.addr : ''), [user]);
  //TODO if no user show waiting screen

  return (
    <div className="flex flex-col items-center justify-start w-full p-1">
      <ChessBoard className="max-w-lg w-full" gameId={`sd_${address}`} myAddr={address} />
    </div>
  );
}
