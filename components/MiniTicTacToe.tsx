import React, { useState, useEffect, useCallback } from 'react';
import { audioService } from '../services/audioService';

interface Props {
    onWin: () => void;
}

export const MiniTicTacToe: React.FC<Props> = ({ onWin }) => {
    const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true); // X è il giocatore, O è l'AI
    const [winner, setWinner] = useState<string | null>(null);
    const [isDraw, setIsDraw] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [isAiTurn, setIsAiTurn] = useState(false);

    // Controlla vittoria
    const checkWinner = useCallback((squares: (string | null)[]) => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Righe
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colonne
            [0, 4, 8], [2, 4, 6]             // Diagonali
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a];
            }
        }
        return null;
    }, []);

    const startResetTimer = useCallback(() => {
        setIsResetting(true);
        setTimeout(() => {
            setBoard(Array(9).fill(null));
            setWinner(null);
            setIsDraw(false);
            setIsResetting(false);
            setIsXNext(true); // Il giocatore (X) inizia sempre
            setIsAiTurn(false);
        }, 1500);
    }, []);

    // Gestione Mossa
    const handleMove = useCallback((index: number, player: string) => {
        setBoard(prevBoard => {
            const newBoard = [...prevBoard];
            newBoard[index] = player;

            if (player === 'X') {
                audioService.playClick();
            }

            const win = checkWinner(newBoard);
            if (win) {
                setWinner(win);
                if (win === 'X') {
                    onWin();
                    audioService.playCoinWin(1);
                }
                startResetTimer();
            } else if (!newBoard.includes(null)) {
                setIsDraw(true);
                startResetTimer();
            } else {
                setIsXNext(player === 'O');
            }

            return newBoard;
        });
    }, [checkWinner, onWin, startResetTimer]);

    // AI Logic (Ora più "umana/stupida")
    const getBestMove = useCallback((currentBoard: (string | null)[]) => {
        const availableMoves = currentBoard.map((val, idx) => val === null ? idx : null).filter(val => val !== null) as number[];

        if (availableMoves.length === 0) return -1;

        // 30% di probabilità di fare una mossa completamente a caso (errore)
        if (Math.random() < 0.3) {
            return availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }

        // Altrimenti, prova a giocare bene

        // 1. Cerca mossa vincente
        for (let i of availableMoves) {
            const temp = [...currentBoard];
            temp[i] = 'O';
            if (checkWinner(temp) === 'O') return i;
        }

        // 2. Blocca mossa vincente del giocatore
        for (let i of availableMoves) {
            const temp = [...currentBoard];
            temp[i] = 'X';
            if (checkWinner(temp) === 'X') return i;
        }

        // 3. Prendi il centro se disponibile
        if (currentBoard[4] === null) return 4;

        // 4. Prendi un angolo a caso
        const corners = [0, 2, 6, 8].filter(i => currentBoard[i] === null);
        if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];

        // 5. Mossa a caso tra quelle rimaste
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }, [checkWinner]);

    // Trigger AI Turn
    useEffect(() => {
        if (!isXNext && !winner && !isDraw && !isResetting) {
            setIsAiTurn(true);
            const timer = setTimeout(() => {
                const move = getBestMove(board);
                if (move !== -1) {
                    handleMove(move, 'O');
                }
                setIsAiTurn(false);
            }, 600); // Leggermente più lento per "pensare"
            return () => clearTimeout(timer);
        }
    }, [isXNext, winner, isDraw, isResetting, board, handleMove, getBestMove]);

    // Gestione Click Utente
    const handleUserClick = (index: number) => {
        if (board[index] || winner || isResetting || !isXNext || isAiTurn) return;
        handleMove(index, 'X');
    };

    // Colore della cella
    const getCellColor = (val: string | null) => {
        if (val === 'X') return 'text-cyan-400';
        if (val === 'O') return 'text-red-400';
        return 'text-transparent';
    };

    const borderStyle = winner === 'X'
        ? 'border-yellow-500 shadow-[0_0_10px_#eab308]'
        : winner === 'O'
            ? 'border-red-600 shadow-[0_0_10px_#dc2626]'
            : 'border-neutral-700';

    return (
        <div className="flex flex-col items-center ml-4">
            <div className="text-[9px] font-mono text-neutral-500 mb-1 tracking-widest">
                {isAiTurn ? 'AI...' : 'TUO TURNO'}
            </div>
            {/* Aumentata dimensione griglia e celle */}
            <div className={`grid grid-cols-3 gap-1 bg-neutral-800 p-1 border rounded ${borderStyle} transition-all duration-300`}>
                {board.map((cell, i) => (
                    <button
                        key={i}
                        onClick={() => handleUserClick(i)}
                        disabled={isResetting || isAiTurn || !!cell}
                        className={`
                            w-8 h-8 flex items-center justify-center bg-neutral-900 
                            ${!cell && !isAiTurn && !winner ? 'hover:bg-neutral-800 cursor-pointer' : 'cursor-default'}
                            text-sm font-bold font-mono transition-colors
                            ${getCellColor(cell)}
                        `}
                    >
                        {cell || '-'}
                    </button>
                ))}
            </div>
            <div className="h-4 mt-1 flex items-center justify-center">
                {winner === 'X' && <span className="text-[9px] text-yellow-500 font-bold animate-bounce">VITTORIA!</span>}
                {winner === 'O' && <span className="text-[9px] text-red-500 font-bold">PERSO</span>}
                {isDraw && <span className="text-[9px] text-neutral-400">PAREGGIO</span>}
            </div>
        </div>
    );
};