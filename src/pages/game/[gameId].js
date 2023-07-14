import { useRouter } from "next/router"
import { ChessBoard } from "@/components/ChessBoard";
export default function GamePage(){
    const router = useRouter();

    
    return (
      <div>
        <div>Started game for {router.query.gameId} </div>
        <ChessBoard gameId={router.query.gameId} />
      </div>
    );
}