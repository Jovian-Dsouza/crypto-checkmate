import { Chessboard, Square } from 'react-chessboard';
import { Chess } from 'chess.js';
import { useEffect, useMemo, useState } from 'react';
import { useChannel } from '@/components/AblyHook';
import { GameModal } from '@/components/GameModal';

export function ChessBoard({ gameId, className, myAddr }) {
  const DURATION = 600; //10mins Game time

  const [gameChannel, chatChannel, ably] = useChannel(gameId, onMoveReceived);
  const [game, setGame] = useState(new Chess());
  const [moveFrom, setMoveFrom] = useState('');
  const [moveTo, setMoveTo] = useState(null);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [rightClickedSquares, setRightClickedSquares] = useState({});
  const [moveSquares, setMoveSquares] = useState({});
  const [optionSquares, setOptionSquares] = useState({});
  const [myColor, setMyColor] = useState('white');
  const oppColor = useMemo(() => (myColor === 'white' ? 'black' : 'white'), [myColor]);
  const [showWaiting, setShowWaiting] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState('');
  //timer
  const [player1Time, setPlayer1Time] = useState(DURATION);
  const [player2Time, setPlayer2Time] = useState(DURATION);
  const [activePlayer, setActivePlayer] = useState('white');

  ////////////////////////BOT//////////////////////////////////
  // Bot player function to generate moves
  function botMove() {
    const moves = game.moves({ verbose: true });
    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    const moveCommand = {
      from: randomMove.from,
      to: randomMove.to,
      promotion: 'q', // For simplicity, we promote all pawns to queens
    };
    updateGame((newGame) => {
      newGame.move(moveCommand);
    });
    // sendMove(moveCommand);
    setActivePlayer(myColor);
  }

  /////////////////////////Multiplayer///////////////////////////////////////////////
  function onMoveReceived(message) {
    // Handle the special move indicating the end of the game
    if (message.type === 'game_over') {
      setIsGameOver(true);
      setWinner(message.winner);
    } else {
      // Regular move received
      const { clientId, data: move, timestamp } = message;
      console.log('Move received', move);
      updateGame((newGame) => {
        newGame.move(move);
      });
    }
  }

  function sendMove(message) {
    // console.log('Message sent', message);
    // gameChannel.publish({ name: 'game', data: message });
    // timer = setTimeout(() => {
    //   botMove();
    // }, 300);
  }

  ////////////////////////////////////Game Logic//////////////////////////////////////////////////
  function updateGame(modify) {
    setGame((g) => {
      const update = { ...g }; //clone the curr game object
      modify(update);
      return update;
    });
  }

  function getMoveOptions(square) {
    const moves = game.moves({
      square,
      verbose: true,
    });
    if (moves.length === 0) {
      setOptionSquares({});
      return false;
    }

    const newSquares = {};
    moves.map((move) => {
      newSquares[move.to] = {
        background:
          game.get(move.to) && game.get(move.to).color !== game.get(square).color
            ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
            : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%',
      };
      return move;
    });
    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)',
    };
    setOptionSquares(newSquares);
    return true;
  }

  function onSquareClick(square) {
    setRightClickedSquares({});

    //Check if my turn
    if (game.turn() !== myColor[0]) {
      return;
    }

    // from square
    if (!moveFrom) {
      const hasMoveOptions = getMoveOptions(square);
      if (hasMoveOptions) setMoveFrom(square);
      return;
    }

    // to square
    if (!moveTo) {
      // check if valid move before showing dialog
      const moves = game.moves({
        moveFrom,
        verbose: true,
      });
      const foundMove = moves.find((m) => m.from === moveFrom && m.to === square);
      // not a valid move
      if (!foundMove) {
        // check if clicked on new piece
        const hasMoveOptions = getMoveOptions(square);
        // if new piece, setMoveFrom, otherwise clear moveFrom
        setMoveFrom(hasMoveOptions ? square : '');
        return;
      }

      // valid move
      setMoveTo(square);

      // if promotion move
      if (
        (foundMove.color === 'w' && foundMove.piece === 'p' && square[1] === '8') ||
        (foundMove.color === 'b' && foundMove.piece === 'p' && square[1] === '1')
      ) {
        setShowPromotionDialog(true);
        return;
      }

      // is normal move
      const gameCopy = { ...game };
      const moveCommand = {
        from: moveFrom,
        to: square,
        promotion: 'q',
      };
      const move = gameCopy.move(moveCommand);

      // if invalid, setMoveFrom and getMoveOptions
      if (move === null) {
        const hasMoveOptions = getMoveOptions(square);
        if (hasMoveOptions) setMoveFrom(square);
        return;
      }

      // Switch the active player when a move is made
      setActivePlayer((prevActivePlayer) => (prevActivePlayer === 'white' ? 'black' : 'white'));

      setGame(gameCopy);
      sendMove(moveCommand);

      setMoveFrom('');
      setMoveTo(null);
      setOptionSquares({});
      return;
    }
  }

  function onPromotionPieceSelect(piece) {
    // if no piece passed then user has cancelled dialog, don't make move and reset
    if (piece) {
      const moveCommand = {
        from: moveFrom,
        to: moveTo,
        promotion: piece[1].toLowerCase() ?? 'q',
      };
      updateGame((newGame) => {
        newGame.move(moveCommand);
      });
      sendMove(moveCommand);
      // Switch the active player when a move is made
      setActivePlayer((prevActivePlayer) => (prevActivePlayer === 'white' ? 'black' : 'white'));
    }

    setMoveFrom('');
    setMoveTo(null);
    setShowPromotionDialog(false);
    setOptionSquares({});
    return true;
  }

  function onSquareRightClick(square) {
    const colour = 'rgba(0, 0, 255, 0.4)';
    setRightClickedSquares({
      ...rightClickedSquares,
      [square]:
        rightClickedSquares[square] && rightClickedSquares[square].backgroundColor === colour
          ? undefined
          : { backgroundColor: colour },
    });
  }

  useEffect(() => {
    let timer;
    if (activePlayer === oppColor) {
      timer = setTimeout(() => {
        botMove();
      }, 300);
    }

    // Check if the game is over due to checkmate or stalemate
    if (game.in_checkmate() || game.in_stalemate()) {
      let winnerTmp = '';
      if (game.in_checkmate()) {
        winnerTmp = game.turn() === 'w' ? 'black' : 'white';
        setWinner(winnerTmp);
      }
      setIsGameOver(true);
      return;
    }

    return () => {
      clearInterval(timer);
    };
  }, [activePlayer]);

  function handleQuit() {
    setWinner(oppColor);
    sendMove({
      type: 'game_over',
      winner: oppColor, // 'white', 'black', or null
    });
    setIsGameOver(true);
  }

  return (
    <div className="flex flex-col items-center justify-start w-full p-1">
      <div className="flex w-full justify-end mr-10 mt-2">
        <div
          onClick={handleQuit}
          className="py-2 px-5 mb-3 rounded-xl bg-[#B70000] hover:scale-105 hover:bg-[#ee4040] transition-all"
        >
          Quit Game
        </div>
      </div>
      <div className={className}>
        <div className="flex flex-col w-full justify-center items-center gap-5">
          <GameModal
            show={showWaiting}
            heading="Waiting..."
            status="Waiting for Opponent"
            btnText="Cancel match"
          ></GameModal>
          <GameModal
            show={isGameOver}
            heading="Game Over"
            status={
              winner === 'white' ? '🏆🎉 White Wins 🎉🏆' : winner === 'black' ? '🏆🎉 Black Wins 🎉🏆' : 'Stalemate'
            }
            btnText="Play Again"
            btnStyle={`bg-[#FFAE02] hover:bg-[#b9820d] `}
          />

          <PlayerClock
            player="Opponent"
            address="Game Bot"
            totalSeconds={myColor === 'white' ? player2Time : player1Time}
          />
          <Chessboard
            id="ChessBoard"
            animationDuration={200}
            arePiecesDraggable={false}
            position={game.fen()}
            onSquareClick={onSquareClick}
            onSquareRightClick={onSquareRightClick}
            onPromotionPieceSelect={onPromotionPieceSelect}
            customSquareStyles={{
              ...moveSquares,
              ...optionSquares,
              ...rightClickedSquares,
            }}
            promotionToSquare={moveTo}
            showPromotionDialog={showPromotionDialog}
            customBoardStyle={{
              borderRadius: '4px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
            }}
            customDarkSquareStyle={{ backgroundColor: '#B58863' }}
            customLightSquareStyle={{ backgroundColor: '#F0D9B5' }}
            boardOrientation={myColor}
          />
          <PlayerClock player="Me" address={myAddr} totalSeconds={myColor === 'white' ? player1Time : player2Time} />
        </div>
      </div>
    </div>
  );
}

function PlayerClock({ player, address, totalSeconds }) {
  const padZero = (num) => (num < 10 ? '0' + num : num);

  const HH = padZero(Math.floor(totalSeconds / 3600));
  const MM = padZero(Math.floor((totalSeconds % 3600) / 60));
  const SS = padZero(totalSeconds % 60);

  return (
    <div className="flex w-full justify-between items-center">
      <div className="text-lg text-slate-300">
        {player}: <span className="text-[1rem]">{address}</span>
      </div>
      <div className="w-24 text-center px-2 py-0.5 rounded-lg bg-lavender-100 text-ghostwhite text-xl font-400">
        {`${HH}:${MM}:`}
        <span className="text-[1.1rem]">{SS}</span>
      </div>
    </div>
  );
}
