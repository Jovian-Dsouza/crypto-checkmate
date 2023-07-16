"use client";

import { ChessBoard } from "@/components/ChessBoard";
export default function GamePage({params}){
    return (
      <div className="flex flex-col items-center justify-center w-full p-20">
        <div>Started game for {params.gameId}</div>
        <ChessBoard gameId={params.gameId} />
      </div>
    );
}