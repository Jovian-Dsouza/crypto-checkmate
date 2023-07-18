'use client';
import { ChessBoard } from '@/components/ChessBoard';

export default function GamePage({ params }) {
  return (
    <div className="flex flex-col items-center justify-start w-full p-1">
      <ChessBoard className="max-w-lg w-full" gameId={params.gameId} />
    </div>
  );
}
