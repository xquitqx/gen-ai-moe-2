import React, { useEffect, useState } from 'react';
import { get } from 'aws-amplify/api';
import { toJSON } from '../utilities';
import badge3 from '../assets/3.png';
import badge7 from '../assets/7.png';
import badge14 from '../assets/14.png';
import badge30 from '../assets/30.png';

const MILESTONES = [3, 7, 14, 30];
const milestoneImages: Record<number, string> = {
    3: badge3,
    7: badge7,
    14: badge14,
    30: badge30,
};

const AchievementsPage: React.FC = () => {
    const [streakCounter, setStreakCounter] = useState<number>(0);

    useEffect(() => {
        toJSON(
            get({
                apiName: 'myAPI',
                path: '/getUserLevel',
            }),
        )
            .then(response => {
                setStreakCounter(response.StreakCounter || 0);
            })
            .catch(error => {
                console.error('Error fetching streak:', error);
            });
    }, []);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Achievements</h1>
            <div className="grid grid-cols-2 gap-4">
                {MILESTONES.map(milestone => (
                    <div key={milestone} className="flex flex-col items-center">
                        <img
                            src={milestoneImages[milestone]}
                            alt={`Milestone ${milestone}`}
                            className={`w-24 h-24 ${streakCounter < milestone ? 'filter grayscale' : ''}`}
                        />
                        <span className="mt-2">{milestone} Days Streak</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AchievementsPage;