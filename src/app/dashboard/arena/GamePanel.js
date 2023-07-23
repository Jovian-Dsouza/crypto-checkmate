'use client';
import useFlowChess from '@/components/useFlowChess';
import { useContext, useRef, useState } from 'react';
import { AppContext } from '@/AppContext';
import { useRouter, useSelectedLayoutSegment } from 'next/navigation';

function generateRandomGameUUID() {
  const length = 8;
  const characters = '0123456789ABCDEF';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}

export default function GamePanel({ children, gameType }) {
  const layoutSegment = useSelectedLayoutSegment();
  const flowchess = new useFlowChess();
  const { user } = useContext(AppContext);
  const router = useRouter();
  const playerCodeRef = useRef('');
  const [gameId, setGameId] = useState(layoutSegment);

  async function handleMatchMaking() {
    let gameUuid = '';
    if(gameType === "standard"){
      gameUuid = generateRandomGameUUID();
    }
    else{
      const res = await flowchess.transactionEnterMacthMaking(user.addr);
      gameUuid = res.uuid
    }
    
    console.log('Game uuid: ', gameUuid);
    setGameId(gameUuid)
    router.push(`/dashboard/arena/${gameType}/${gameUuid}`);
  }

  async function handleJoin() {
    console.log('join code', playerCodeRef.current.value);
    setGameId(playerCodeRef.current.value);
    router.push(`/dashboard/arena/game/${playerCodeRef.current.value}`);
  }

  return (
    <div className="flex h-full w-full  justify-end text-white overflow-y-hidden">
      {children}

      <div className="hidden flex-col md:flex items-start md:min-w-[15%] py-16 px-8 gap-6 border-solid border-0 border-l-2 border-white">
        <div className="font-space-grotesk text-2xl pb-3">Invite Player</div>
        {/* Display the game ID if available */}
        {gameId && <div className="py-2 px-2 text-center text-white font-semibold bg-indigo-600 rounded-md">Game ID: {gameId}</div>}

        <div
          onClick={handleMatchMaking}
          className="py-3 w-full text-center rounded-md text-black font-semibold bg-yellowGreen  hover:bg-[#83b34c] transition-all"
        >
          Find Match
        </div>
        <input
          ref={playerCodeRef}
          className="py-3 w-full text-center rounded-md font-space-grotesk font-bold bg-lightsteelblue"
          type="text"
          name="playerCode"
          placeholder="Enter Code"
        />
        {/* Join button */}
        <div className="flex w-full justify-end">
          <div
            onClick={handleJoin}
            className="py-2 px-5 rounded-md bg-[#4F458C] hover:scale-105 hover:bg-[#7869ce] transition-all"
          >
            Join
          </div>
        </div>
      </div>
    </div>
  );
}
