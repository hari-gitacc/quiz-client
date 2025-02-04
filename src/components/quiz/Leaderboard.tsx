// Leaderboard.tsx
import { useEffect, useState } from 'react';
import WebSocketService from '../../services/websocket';
import api from '../../services/api';
import { getUserFromToken } from '../../utils/auth';

interface LeaderboardEntry {
    username: string;
    score: number;
    position: number;
    isCurrentUser?: boolean;
}

interface Props {
    quizCode: string;
    finalScores?: boolean;
}

const Leaderboard = ({ quizCode, finalScores = false }: Props) => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const currentUser = getUserFromToken();

    useEffect(() => {
        loadLeaderboard();
        
        if (!finalScores) {
            WebSocketService.on('leaderboard_update', (data) => {
                setLeaderboard(data.leaderboard.map((entry: LeaderboardEntry, index: number) => ({
                    ...entry,
                    position: index + 1,
                    isCurrentUser: entry.username === currentUser?.username
                })));
            });
        }

        return () => {
            if (!finalScores) {
                WebSocketService.off('leaderboard_update', () => {});
            }
        };
    }, [quizCode, finalScores]);

    const loadLeaderboard = async () => {
        try {
            setLoading(true);
            const response = await api.getLeaderboard(quizCode);
            const leaderboardData = response.data.map((entry: LeaderboardEntry, index: number) => ({
                ...entry,
                position: index + 1,
                isCurrentUser: entry.username === currentUser?.username
            }));
            setLeaderboard(leaderboardData);
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>;
    }

    return (
        <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">
                {finalScores ? 'Final Results' : 'Live Leaderboard'}
            </h2>
            
            <div className="space-y-4">
                {leaderboard.map((entry) => (
                    <div
                        key={entry.username}
                        className={`flex items-center justify-between p-4 border rounded-lg transition-colors
                            ${entry.isCurrentUser ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`}
                    >
                        <div className="flex items-center space-x-4">
                            <span className={`text-xl font-semibold ${entry.position <= 3 ? 'text-yellow-500' : ''}`}>
                                #{entry.position}
                            </span>
                            <span className={entry.isCurrentUser ? 'font-semibold' : ''}>
                                {entry.username}
                                {entry.isCurrentUser && ' (You)'}
                            </span>
                        </div>
                        <span className="text-lg font-semibold">{entry.score} points</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Leaderboard;