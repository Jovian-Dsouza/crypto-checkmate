'use client';
import { AppContext } from '@/AppContext';
import { ChessBoard } from '@/components/ChessBoard';
import { useContext, useMemo } from 'react';

export default function GamePage({ params }) {
  const { user } = useContext(AppContext);
  const address = useMemo(() => (user.addr ? user.addr : ''), [user]);

  return (
    <div className="flex flex-col items-center justify-start w-full p-1">
      <ChessBoard className="max-w-lg w-full" gameId={params.gameId} myAddr={address} />
    </div>
  );
}
