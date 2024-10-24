import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './components/ui/alert';

const WORD_LIST = [
    "APPLE", "BEACH", "CRANE", "DANCE", "EAGLE", "FLAME", "GRAPE", "HEART",
    "IMAGE", "JUDGE", "KNIFE", "LEMON", "MOUSE", "NIGHT", "OCEAN", "PAINT",
    "QUEEN", "RADIO", "SNAKE", "TRAIN", "UNCLE", "VOICE", "WATER", "YOUTH",
    "ZEBRA", "ALTAR", "BLAST", "COVER", "DEMON", "FRESH", "GLASS", "HONEY",
    "INDEX", "JOKER", "KARMA", "LIGHT", "MARCH", "NOVEL", "OPERA", "PLANE",
    "QUIET", "RIVER", "STORM", "TOWER", "UNDER", "VOWEL", "WITCH", "XENON",
    "YEAST", "BRAVE", "CHAIR", "DREAM", "EARTH", "FLAIR", "GRASS", "HOUSE",
    "INPUT", "JOINT", "KNOCK", "LEARN", "MAGIC", "NURSE", "OFFER", "PLANT",
    "QUEST", "ROUND", "STAGE", "THUMB", "UPPER", "VAULT", "WORLD", "YIELD",
    "BREAD", "CLEAR", "DRILL", "ELECT", "FORCE", "GRIND", "HUMOR", "INTRO",
    "JOLLY", "KNEEL", "LUNCH", "MIGHT", "NEVER", "OLDER", "POWER", "QUICK",
    "REACT", "SHARE", "TRUST", "USUAL", "VITAL", "WHEEL", "YACHT", "ZONAL",
    "ANGEL", "BASIC", "CATCH", "DELTA", "ERROR", "FLUID", "GRAVE", "HAPPY",
    "ISSUE", "JAZZY", "KNOCK", "LAYER", "MINUS", "NOBLE", "ORDER", "POINT",
    "QUEST", "RAPID", "SOLID", "TIGHT", "UNION", "VISIT", "WHOLE", "XRAYS",
    "YOUNG", "BRICK", "CHALK", "DODGE", "ELITE", "FRAME", "GRILL", "HEAVY",
    "INNER", "JUICE", "KNOCK", "LARGE", "MOTOR", "NEIGH", "OPERA", "PRIDE",
    "QUICK", "RANGE", "STICK", "THEME", "URBAN", "VIRUS", "WINDY", "XENON",
    "YEARN", "BRIDE", "CLEAN", "DRINK", "ENJOY", "FRESH", "GLOBE", "HOTEL",
    "IDEAL", "JUDGE", "KNACK", "LEVER", "MUSIC", "NERVE", "OVERT", "PEACE",
    "QUIRK", "RESET", "SUGAR", "TOUCH", "UNITY", "VAGUE", "WORRY", "ZEBRA"
];

const getRandomWord = () => {
    return WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
};

const App = () => {
    const [word, setWord] = useState(getRandomWord);
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

    const resetGame = () => {
        setWord(getRandomWord());
        setTries(5);
        setGuess("");
        setMessage("");
        setGameOver(false);
        setGuessHistory([]);
    };

    // Create preview squares for the word length
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

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6">
                <h1 className="text-2xl font-bold mb-6 text-center">Guess the Word!</h1>

                {message && (
                    <Alert className="mb-4" variant={gameOver ? (message.includes("Congratulations") ? "default" : "destructive") : "default"}>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>{gameOver ? "Game Ended" : "Status"}</AlertTitle>
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                )}

                <div className="mb-4">
                    <div className="text-lg text-center mb-2">Tries Remaining: {tries}</div>
                </div>

                {/* Preview Row */}
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