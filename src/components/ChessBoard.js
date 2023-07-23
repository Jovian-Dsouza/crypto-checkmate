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
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState('');
  const [isGameStarted, setIsGameStarted] = useState(false);
  //timer
  const [player1Time, setPlayer1Time] = useState(DURATION);
  const [player2Time, setPlayer2Time] = useState(DURATION);
  const [activePlayer, setActivePlayer] = useState('white');

  /////////////////////////Multiplayer///////////////////////////////////////////////
  function onMoveReceived(message) {
    // Handle the special move indicating the end of the game
    if (message.type === 'game_over') {
      setIsGameOver(true);
      setWinner(message.winner);
    } else if (message.type === 'start_game') {
      const color = message.oppColor;
      if (myColor !== color) {
        setMyColor(color);
      }
    } else {
      // Regular move received
      const { clientId, data: move, timestamp } = message;

      if (myAddr !== clientId) {
        console.log('Move received', move);
        updateGame((newGame) => {
          newGame.move(move);
        });
        setActivePlayer((prevActivePlayer) => (prevActivePlayer === 'white' ? 'black' : 'white'));
      }
    }
  }

  function sendMove(message) {
    console.log('Message sent', message);
    gameChannel.publish({ name: 'game', data: message });
  }

  //TODO Fix Game history when refreshed
  function getGameHistory() {
    if (gameChannel) {
      gameChannel.history({ direction: 'forwards' }, (err, result) => {
        if (!result || result.items.length == 0) {
          return;
        }
        console.log('Replaying moves', result.items.length);

        // Calculate initial times based on history
        let player1Time = DURATION;
        let player2Time = DURATION;
        let currentPlayer = 'white';
        for (const item of result.items) {
          if (item.type === 'game_over') {
            setIsGameOver(true);
            setWinner(item.winner);
            break;
          }

          const { clientId, data: move, timestamp } = item;

          // Calculate time spent for each move
          const timeSpent = Math.floor((timestamp - result.items[0].timestamp) / 1000);

          // Subtract time spent from the corresponding player's initial time
          if (currentPlayer === 'white') {
            player1Time -= timeSpent;
          } else {
            player2Time -= timeSpent;
          }

          // Switch the current player for the next move
          currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
        }

        setPlayer1Time(player1Time);
        setPlayer2Time(player2Time);

        // Check for the last occurrence of 'game_over' move
        let lastGameOverIndex = -1;
        for (let i = result.items.length - 1; i >= 0; i--) {
          if (result.items[i].data.type === 'game_over') {
            lastGameOverIndex = i;
            break;
          }
        }

        //Load game from history
        updateGame((game) => {
          for (let i = lastGameOverIndex + 1; i < result.items.length; i++) {
            console.log('from history', result.items[i].data);
            const { from, to, promotion } = result.items[i].data;

            game.move({
              from: from,
              to: to,
              promotion: promotion,
            });
          }
        });
      });
    }
  }

  // useEffect(() => {
  //   getGameHistory();
  // }, [gameChannel]);

  useEffect(() => {
    if (gameChannel && (gameId !== 'standard' || gameId != 'betting')) {
      // Get the presence information for the game channel
      gameChannel.presence.get((err, members) => {
        if (err) {
          console.error('Error getting presence information:', err);
          return;
        }

        console.log('Number of players: ', members.length);
        for (let i = 0; i < members.length; i++) {
          console.log(`Player ${i} = ` + members[i].clientId);

          if (members[i].clientId !== myAddr) {
            setIsGameStarted(true);
            setMyColor('black');
          }
        }
      });

      gameChannel.presence.enter(myAddr, function (err) {});

      gameChannel.presence.subscribe('enter', function (member) {
        if (member.clientId !== myAddr) {
          setIsGameStarted(true);
        }
      });

      //TODO Pause the match when the player leaves
      // gameChannel.presence.subscribe('leave', function (member) {
      //   console.log('member left', member.data); // => not moving
      // });
    }
  }, [gameChannel]);

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

  /////////////////////////////Timer/////////////////////////
  // Timer Use effect
  let timer;
  useEffect(() => {
    if (!isGameStarted) {
      return;
    }
    if (activePlayer === 'white') {
      timer = setInterval(() => {
        setPlayer1Time((prevTime) => {
          if (prevTime === 0) {
            setIsGameOver(true);
            setWinner('black');
            clearInterval(timer);

            // Notify both players about the end of the game
            const message = {
              type: 'game_over',
              winner: 'black',
            };
            sendMove(message);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (activePlayer === 'black') {
      timer = setInterval(() => {
        setPlayer2Time((prevTime) => {
          if (prevTime === 0) {
            setIsGameOver(true);
            setWinner('white');
            clearInterval(timer);

            // Notify both players about the end of the game
            const message = {
              type: 'game_over',
              winner: 'white',
            };
            sendMove(message);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    // Check if the game is over due to checkmate or stalemate
    if (game.in_checkmate() || game.in_stalemate()) {
      let winnerTmp = '';
      if (game.in_checkmate()) {
        winnerTmp = game.turn() === 'w' ? 'black' : 'white';
        setWinner(winnerTmp);
      }
      clearInterval(timer);
      sendMove({
        type: 'game_over',
        winner: winnerTmp, // 'white', 'black', or null
      });
      setIsGameOver(true);
      return;
    }

    return () => clearInterval(timer);
  }, [activePlayer, isGameStarted]);

  function handleQuit() {
    clearInterval(timer);
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
            show={!isGameStarted}
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
            address="Anonymous"
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
