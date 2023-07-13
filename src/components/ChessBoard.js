import { Chessboard, Square } from 'react-chessboard';
import { Chess } from 'chess.js';
import { useEffect, useState } from 'react';
import { useChannel } from '@/components/AblyHook';

export function ChessBoard({ gameId }) {
  const [gameChannel, chatChannel, ably] = useChannel(gameId, onMoveReceived);
  const [game, setGame] = useState(new Chess());
  const [moveFrom, setMoveFrom] = useState('');
  const [moveTo, setMoveTo] = useState(null);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [rightClickedSquares, setRightClickedSquares] = useState({});
  const [moveSquares, setMoveSquares] = useState({});
  const [optionSquares, setOptionSquares] = useState({});

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
    <div className="w-11/12 md:w-5/12">
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
        customDarkSquareStyle={{ backgroundColor: '#779952' }}
        customLightSquareStyle={{ backgroundColor: '#edeed1' }}
      />
    </div>
  );
}
