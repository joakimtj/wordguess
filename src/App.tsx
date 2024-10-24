import React, { useState, useEffect } from 'react';
import { AlertCircle, HelpCircle, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './components/ui/alert';

const App = () => {
    const [word, setWord] = useState("");
    const [hint, setHint] = useState("");
    const [showHint, setShowHint] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [tries, setTries] = useState(5);
    const [guess, setGuess] = useState("");
    const [message, setMessage] = useState("");
    const [gameOver, setGameOver] = useState(false);
    const [guessHistory, setGuessHistory] = useState<Array<{
        guess: string;
        feedback: Array<{
            letter: string;
            status: 'correct' | 'wrong-position' | 'incorrect'
        }>
    }>>([]);

    const fetchNewWord = async () => {
        try {
            setLoading(true);
            setError("");
            setShowHint(false);
            const response = await fetch('/api/word');
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            setWord(data.word);
            setHint(data.hint);
        } catch (err) {
            setError("Failed to get a new word. Using default word 'APPLE'");
            setWord("APPLE");
            setHint("A fruit that keeps the doctor away");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNewWord();
    }, []);

    const getLetterFeedback = (guessWord: string) => {
        const feedback = [];
        const wordLetters = [...word];
        const remainingLetters = new Map();

        for (const letter of wordLetters) {
            remainingLetters.set(letter, (remainingLetters.get(letter) || 0) + 1);
        }

        for (let i = 0; i < guessWord.length; i++) {
            const letter = guessWord[i];
            if (letter === wordLetters[i]) {
                feedback[i] = { letter, status: 'correct' as const };
                remainingLetters.set(letter, remainingLetters.get(letter) - 1);
            }
        }

        for (let i = 0; i < guessWord.length; i++) {
            if (feedback[i]) continue;

            const letter = guessWord[i];
            if (remainingLetters.get(letter) > 0) {
                feedback[i] = { letter, status: 'wrong-position' as const };
                remainingLetters.set(letter, remainingLetters.get(letter) - 1);
            } else {
                feedback[i] = { letter, status: 'incorrect' as const };
            }
        }

        return feedback;
    };

    const handleGuess = () => {
        if (guess.length !== word.length) {
            setMessage(`Guess must be ${word.length} letters long!`);
            return;
        }

        const formattedGuess = guess.toUpperCase();

        if (guessHistory.some(h => h.guess === formattedGuess)) {
            setMessage("You've already tried this word!");
            return;
        }

        const feedback = getLetterFeedback(formattedGuess);
        setGuessHistory([...guessHistory, { guess: formattedGuess, feedback }]);

        if (formattedGuess === word) {
            setMessage("Congratulations! You've won!");
            setGameOver(true);
            return;
        }

        const newTries = tries - 1;
        setTries(newTries);

        if (newTries === 0) {
            setMessage(`Game Over! The word was ${word}`);
            setGameOver(true);
            return;
        }

        setMessage(`${newTries} tries remaining`);
        setGuess("");
    };

    const resetGame = async () => {
        await fetchNewWord();
        setTries(5);
        setGuess("");
        setMessage("");
        setGameOver(false);
        setGuessHistory([]);
    };

    const toggleHint = () => {
        setShowHint(!showHint);
    };

    const PreviewRow = () => (
        <div className="flex justify-center gap-1 mb-4">
            {[...Array(word.length)].map((_, index) => (
                <div
                    key={index}
                    className="w-10 h-10 flex items-center justify-center font-bold border-2 border-gray-300 rounded"
                >
                    _
                </div>
            ))}
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6">
                    <div className="text-center">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Word Guessing Game</h1>
                    <button
                        onClick={toggleHint}
                        className="flex items-center gap-2 text-blue-500 hover:text-blue-700"
                    >
                        {showHint ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        {showHint ? 'Hide Hint' : 'Show Hint'}
                    </button>
                </div>

                {showHint && hint && (
                    <Alert className="mb-4">
                        <HelpCircle className="h-4 w-4" />
                        <AlertTitle>Hint</AlertTitle>
                        <AlertDescription>{hint}</AlertDescription>
                    </Alert>
                )}

                {(message || error) && (
                    <Alert className="mb-4" variant={error ? "destructive" : gameOver ? (message.includes("Congratulations") ? "default" : "destructive") : "default"}>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>{error ? "Error" : gameOver ? "Game Ended" : "Status"}</AlertTitle>
                        <AlertDescription>{error || message}</AlertDescription>
                    </Alert>
                )}

                <div className="mb-4">
                    <div className="text-lg text-center mb-2">Tries Remaining: {tries}</div>
                </div>

                <PreviewRow />

                <div className="space-y-2 mb-4">
                    {guessHistory.map((historyItem, index) => (
                        <div key={index} className="flex justify-center gap-1">
                            {historyItem.feedback.map((letterFeedback, letterIndex) => (
                                <div
                                    key={letterIndex}
                                    className={`
                        w-10 h-10 flex items-center justify-center font-bold border rounded
                        ${letterFeedback.status === 'correct' ? 'bg-green-500 text-white' :
                                            letterFeedback.status === 'wrong-position' ? 'bg-yellow-500 text-white' :
                                                'bg-gray-300 text-gray-700'}
                      `}
                                >
                                    {letterFeedback.letter}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={guess}
                        onChange={(e) => setGuess(e.target.value.toUpperCase())}
                        disabled={gameOver}
                        maxLength={word.length}
                        className="flex-1 p-2 border rounded uppercase"
                        placeholder={`Enter ${word.length} letters`}
                    />
                    <button
                        onClick={handleGuess}
                        disabled={gameOver}
                        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
                    >
                        Guess
                    </button>
                </div>

                {gameOver && (
                    <button
                        onClick={resetGame}
                        className="mt-4 w-full bg-green-500 text-white px-4 py-2 rounded"
                    >
                        Play Again
                    </button>
                )}
            </div>
        </div>
    );
};

export default App;