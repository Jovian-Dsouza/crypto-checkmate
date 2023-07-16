import { Chessboard, Square } from 'react-chessboard';
import { Chess } from 'chess.js';
import { useEffect, useState } from 'react';
import { useChannel } from '@/components/AblyHook';
import { GameModal } from '@/components/GameModal';


export function ChessBoard({ gameId, className }) {
  const [gameChannel, chatChannel, ably] = useChannel(gameId, onMoveReceived);
  const [game, setGame] = useState(new Chess());
  const [moveFrom, setMoveFrom] = useState('');
  const [moveTo, setMoveTo] = useState(null);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [rightClickedSquares, setRightClickedSquares] = useState({});
  const [moveSquares, setMoveSquares] = useState({});
  const [optionSquares, setOptionSquares] = useState({});
  const [myColor, setMyColor] = useState('white');
  const [showWaiting, setShowWaiting] = useState(false);
  const [showWinner, setShowWinner] = useState(false);
  const [winner, setWinner] = useState('')

  /////////////////////////Multiplayer///////////////////////////////////////////////
  function onMoveReceived(message) {
    // console.log(message);
    const { clientId, data: move, timestamp } = message;
    console.log('Move received', move);
    updateGame((newGame) => {
      newGame.move(move);
    });
  }

  function sendMove(message) {
    console.log('Message sent', message);
    gameChannel.publish({ name: 'game', data: message });
  }

  function getGameHistory() {
    gameChannel.history({ direction: 'forwards' }, (err, result) => {
      if (!result || result.items.length == 0) {
        return;
      }
      console.log('Replaying moves', result.items.length);

      //Load game from history
      updateGame((game) => {
        for (let i = 0; i < result.items.length; i++) {
          console.log('from history', result.items[i].data);
          const { from, to, promotion } = result.items[i].data;

          game.move({
            from: from,
            to: to,
            promotion: promotion,
          });
        }
      });

      //Cal my Color from history
      // console.log('My client id', ably.options.clientId);
      // console.log('first move client Id', result.items[0].clientId);
      if (result.items[0].clientId === ably.options.clientId) {
        setMyColor('white');
      } else {
        setMyColor('black');
      }
    });
  }

  useEffect(() => {
    getGameHistory();
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

  return (
    <div className={className}>
      <div className="flex flex-col w-full justify-center items-center gap-5">
        <GameModal
          show={showWaiting}
          heading="Waiting..."
          status="Waiting for Opponent"
          btnText="Cancel match"
        ></GameModal>
        <GameModal
          show={showWinner}
          heading="Times Up"
          status={`🏆🎉 ${winner} Wins 🎉🏆`}
          btnText="Congrats  🎉"
          btnStyle={`bg-[#FFAE02] hover:bg-[#b9820d] `}
        ></GameModal>

        <PlayerClock player="Player 1" address="0x23232..." time="09:34:07" />
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
        <PlayerClock player="Player 2" address="0x23232..." time="09:34:07" />
      </div>
    </div>
  );
}

function PlayerClock({player, address, time}){
  let min = "00"
  let sec = "00"
  let subsec = "00"
  if(time != null){
     const time_split = time.split(':');
     min = time_split[0];
     sec = time_split[1];
     subsec = time_split[2];
  }
  
  return (
    <div className="flex w-full justify-between items-center">
      <div className="text-lg text-slate-300">
        {player}: <span className="text-[1rem]">{address}</span>
      </div>
      <div className="px-2 py-0.5 rounded-lg bg-lavender-100 text-ghostwhite text-xl font-400">
        {`${min}:${sec}:`}
        <span className="text-[1.1rem]">{subsec}</span>
      </div>
    </div>
  );
}