"use client";

import { ChessBoard } from "@/components/ChessBoard";
export default function GamePage({params}){
    return (
      <div className="flex flex-col items-center justify-start w-full p-1 bg-red-80">
        {/* Quit */}
        <div className="flex w-full justify-end mr-10 mt-2">
          <div className="py-2 px-5 rounded-xl bg-[#B70000] hover:scale-105 hover:bg-[#ee4040] transition-all">
            Quit Game
          </div>
        </div>

        {/* <div className="max-w-lg w-full text-left text-2xl font-500 mb-8">Chess Game</div> */}
        <ChessBoard className="max-w-lg w-full" gameId={params.gameId} />
      </div>
    );
}