"use client";

import { ChessBoard } from "@/components/ChessBoard";
export default function GamePage({params}){
  console.log(params.gameId)
    return (
      <div>
        <div>Started game for {params.gameId}</div>
        <ChessBoard gameId={params.gameId} />
      </div>
    );
}