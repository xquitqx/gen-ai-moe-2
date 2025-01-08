import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
{
  /*import { Plan, CefrLevel } from '../utilities/planTypes';*/
}
import { ThemeProvider, createTheme } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { useNavigate } from 'react-router-dom';
import { toJSON } from '../utilities';
import { get } from 'aws-amplify/api';
import { Link } from 'react-router-dom';

{
  /*

const buttonLabels = [
  'Listening',
  'Speaking',
  'Grammer & Vocabulary',
  'Reading',
  'Writing',
] as const;
type ButtonLabel = (typeof buttonLabels)[number];


const plans: { [key in ButtonLabel]: Plan } = {
  Listening: {
    challenges: [
      { challengeId: 'listen1', isCompleted: false },
      { challengeId: 'listen2', isCompleted: true },
      { challengeId: 'listen3', isCompleted: false },
      { challengeId: 'listen4', isCompleted: false },
      { challengeId: 'listen5', isCompleted: false },
    ],
    level: 'B1' as CefrLevel,
  },
  Speaking: {
    challenges: [
      { challengeId: 'speak1', isCompleted: true },
      { challengeId: 'speak2', isCompleted: false },
      { challengeId: 'speak3', isCompleted: false },
    ],
    level: 'A2' as CefrLevel,
  },
  'Grammer & Vocabulary': {
    challenges: [],
    level: 'A2',
  },
  Reading: {
    challenges: [],
    level: 'A1' as CefrLevel,
  },
  Writing: {
    challenges: [],
    level: 'A1' as CefrLevel,
  },
};
*/
}
const buttonsTheme = createTheme({
  palette: {
    primary: {
      main: '#3B828E',
      contrastText: '#ffffff',
    },
  },
});

{
  /*
const sectionDescriptions: {
  [key in ButtonLabel]: { [key in CefrLevel]: string };
} = {
  Listening: {
    A1: 'You can understand familiar words and very basic phrases when people speak slowly and clearly.',
    A2: 'You can understand sentences and frequently used expressions related to areas of most immediate relevance (e.g., personal and family information, shopping, local geography, employment).',
    B1: 'You can understand the main points of clear standard input on familiar matters regularly encountered in work, school, leisure, etc.',
    B2: 'You can understand the main ideas of complex text on both concrete and abstract topics, including technical discussions in your field of specialization.',
    C1: 'You can understand a wide range of demanding, longer spoken material, even if it is delivered at fast speed and includes idiomatic expressions.',
    C2: 'You can effortlessly understand virtually everything heard, whether live or recorded, including fast speech delivered in difficult contexts, such as technical discussions or academic lectures.',
  },
  Speaking: {
    A1: 'You can use simple greetings and short exchanges when meeting someone new. ',
    A2: 'You can communicate in simple and routine tasks requiring a simple and direct exchange of information on familiar and routine matters.',
    B1: 'You can deal with most situations likely to arise while traveling in an area where the language is spoken. You can produce simple connected text on topics which are familiar or of personal interest.',
    B2: 'You can interact with a degree of fluency and spontaneity that makes regular interaction with native speakers quite possible without strain for either party.',
    C1: 'You can express yourself fluently and spontaneously without much obvious searching for expressions. You can use language flexibly and effectively for social, academic, and professional purposes.',
    C2: 'You can express yourself spontaneously, very fluently and precisely, differentiating finer shades of meaning even in the most complex situations. You can effortlessly participate in any conversation or discussion, however demanding.',
  },
  'Grammer & Vocabulary': {
    A1: 'A1 Grammer & Vocabulary',
    A2: 'A2 Grammer & Vocabulary',
    B1: 'B1 Grammer & Vocabulary',
    B2: 'B2 Grammer & Vocabulary',
    C1: 'C1 Grammer & Vocabulary',
    C2: 'C2 Grammer & Vocabulary',
  },
  Reading: {
    A1: 'You can understand very short and simple texts, like greetings, signs, or labels.',
    A2: 'You can understand very short, simple texts related to everyday life',
    B1: 'You can understand the main points of clear standard input on familiar and frequently encountered matters related to work, school, leisure, etc. You can understand the description of events, feelings and wishes in personal letters.',
    B2: 'You can read a wide range of demanding, longer texts, and understand implicit meaning.',
    C1: 'You can understand a wide range of demanding, longer written text, and recognize implicit meaning.',
    C2: 'You can read with ease virtually any kind of written text, including abstract, complex literary works, technical manuals, or philosophical treatises. You can grasp implicit meanings and subtle nuances.',
  },
  Writing: {
    A1: 'You can write short, simple phrases and personal details about yourself, like your name, where you live, and things you have.',
    A2: 'You can write short, simple connected text on topics that are familiar or of personal interest.',
    B1: 'You can write simple connected text on topics which are familiar or of personal interest. You can write personal letters describing experiences and impressions.',
    B2: 'You can produce clear, detailed text on a wide range of subjects and explain a viewpoint on a topical issue giving the advantages and disadvantages of various options.',
    C1: 'You can write clear, detailed text on a wide range of subjects and explain a viewpoint on a complex issue giving the advantages and disadvantages of various options.',
    C2: 'You can produce clear, well-structured and detailed text on complex subjects, showing controlled use of cohesive devices, paragraphing, and register variation. You can write persuasive arguments or imaginative narratives.',
  },
};

const levelCardLabels = [
  'Listening',
  'Speaking',
  'Reading',
  'Writing',
] as const;
  */
}
const levelDetails = [
  {
    title: 'Elementary',
    description:
      'Learners who achieve A1 Elementary level can communicate using familiar everyday expressions and very basic phrases. They can introduce themselves and others and ask and answer simple questions about personal details.',
    level: 'A1',
  },
  {
    title: 'Pre-intermediate',
    description:
      'Learners who achieve A2 Pre-intermediate level can communicate using frequently used expressions in everyday situations. They can interact in simple and direct exchanges of information and can describe things around them and things they need.',
    level: 'A2',
  },
  {
    title: 'Intermediate',
    description:
      'Learners who achieve B1 Intermediate level can understand information about familiar topics. They can communicate in most situations whilst travelling in an English-speaking area. They can write simple connected texts on familiar topics.',
    level: 'B1',
  },
  {
    title: 'Upper intermediate',
    description:
      'Learners who achieve B2 Upper intermediate level can understand the main ideas of complex texts. They can interact with some fluency and communicate easily. They can write clear, detailed texts on a wide range of topics and express their opinions.',
    level: 'B2',
  },
  {
    title: ' Advanced',
    description:
      'Learners who achieve C1 Advanced level can understand a wide range of long, complex texts. They can interact and express themselves fluently and spontaneously and use language flexibly and effectively in social, academic, and professional situations.',
    level: 'C1',
  },
  {
    title: ' Proficiency',
    description:
      'Learners who achieve C2 Proficiency level can easily understand almost everything they hear or read. They can express themselves fluently and spontaneously with precision in complex situations.',
    level: 'C2',
  },
];

const Exercises: React.FC = () => {
  const [level, setLevel] = useState<string | null>(null);
  const [streakCounter, setStreakCounter] = useState<number>(0);
  console.log('🚀 ~ streakCounter:', streakCounter);
  const [loadingStreak, setLoadingStreak] = useState<boolean>(true);
  console.log('🚀 ~ loadingStreak:', loadingStreak);

  const navigate = useNavigate();

  useEffect(() => {
    toJSON(
      get({
        apiName: 'myAPI',
        path: '/getUserLevel',
      }),
    ).then(response => {
      setLevel(response.CEFRLevel);
      setStreakCounter(response.StreakCounter);
      setLoadingStreak(false);
      console.log('level', level);
    });
  }, []);

  const navigateToQuestions = () => {
    level ? navigate('/questions-by-level') : navigate('/PlacementTest');
  };

  return (
    <main className="flex flex-col items-center gap-y-16">
      <div className="w-full md:w-3/4">
        <h1 className="text-4xl font-bold underline underline-offset-[14px] decoration-4 decoration-blue-4 flex items-center justify-center">
          Vocabulary Gamification
          {streakCounter && !loadingStreak && (
            <span className="ml-4 flex items-center text-yellow-500">
              🔥 {streakCounter}
            </span>
          )}
        </h1>
      </div>
      <div className="hidden md:flex w-1/2 justify-between">
        <ThemeProvider theme={buttonsTheme} key={'Grammer & Vocabulary'}>
          <Button variant={'contained'} color="primary">
            <h1 className="font-semibold">{'Grammer & Vocabulary'}</h1>
          </Button>
        </ThemeProvider>
      </div>
      <div className="md:hidden w-3/4">
        <ThemeProvider theme={buttonsTheme}>
          <FormControl fullWidth>
            <InputLabel id="plan-select-label">Select Plan</InputLabel>
            <Select
              labelId="plan-select-label"
              id="plan-select"
              value={'Grammer & Vocabulary'}
              label="Select Plan"
            >
              <MenuItem
                key={'Grammer & Vocabulary'}
                value={'Grammer & Vocabulary'}
              >
                Grammer & Vocabulary{' '}
              </MenuItem>
            </Select>
          </FormControl>
        </ThemeProvider>
      </div>
      <div className="w-3/4 border-2 rounded-lg min-h-28 flex flex-col items-center justify-center gap-y-5 md:w-1/2">
        <h1 className="font-semibold text-xl text-center">
          {level
            ? 'Practice more to get to the next level!'
            : 'You need to take the placement test!'}
        </h1>
        <ThemeProvider theme={buttonsTheme}>
          <div onClick={navigateToQuestions}>
            <Button variant="contained" color="primary">
              Take Test
            </Button>
          </div>
        </ThemeProvider>
      </div>

      {level && (
        <img
          src={`assets/Levels/${level}.png`}
          alt={`${level} CEFR Level`}
          className="w-64 h-auto"
        />
      )}

      {levelDetails.some(levelDetail => level === levelDetail.level) && (
        <div className="flex flex-col items-center w-full space-y-8">
          {/* Title Section */}
          <div className="w-full md:w-3/4 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              What is {level}?
            </h1>
          </div>

          {/* Display Level Description Section */}
          <div className="flex flex-wrap w-full md:w-3/4 justify-center gap-8 max-md:flex-col">
            {levelDetails.map(levelDetail => {
              if (level === levelDetail.level) {
                return (
                  <div
                    key={levelDetail.level}
                    className="flex flex-col items-center border-2 border-gray-200 p-6 rounded-lg bg-white shadow-md w-full md:w-1/3"
                  >
                    <div className="text-xl md:text-2xl font-semibold text-gray-800 text-center">
                      {levelDetail.title}
                    </div>
                    <div className="text-sm md:text-base text-gray-600 mt-2 text-center">
                      {levelDetail.description}
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>

          {/* Click Here Section */}
          <div className="flex justify-center items-center w-full">
            <Link to="/about" className="w-full md:w-1/3">
              <div className="border-2 border-[#4a6e77] rounded-lg py-4 px-6 bg-transparent hover:bg-transparent transition-all flex flex-col items-center">
                <h1 className="text-base md:text-lg font-medium text-[#4a6e77]">
                  Click here to know more about other levels
                </h1>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* 
  <div className="flex flex-wrap w-full md:w-3/4 justify-center gap-16 max-md:flex-col">
    {levelCardLabels.map(button => {
      const plan = plans[button];
      const level = plan.challenges.length > 0 ? plan.level : '--';
      const description =
        plan.challenges.length > 0
          ? sectionDescriptions[button][plan.level]
          : '';
      return LevelCard(button, level, description);
    })}
  </div>
  */}
    </main>
  );
};

export default Exercises;

/*
const LevelCard = (icon: string, level: string, description: string) => (
  <>
    {level && (
      <div className="flex flex-col md:flex-row items-center border-2 border-gray-200 p-4 rounded-lg bg-white shadow-md w-full md:w-1/3 mb-4 md:mb-0">
        <div className="flex-shrink-0 mb-4 md:mb-0">
          <div className="flex items-center justify-center w-12 h-12 md:w-12 md:h-12 rounded-full border-2 border-gray-200">
            <img
              src={`assets/Sections/${icon}.png`}
              alt={icon}
              className="w-8 h-8"
            />
          </div>
        </div>
        <div className="flex flex-col items-center md:items-start flex-grow ml-0 md:ml-4">
          <div className="text-2xl md:text-4xl font-bold text-gray-800">
            {level}
          </div>
          <div className="text-sm md:text-base text-gray-500 mt-1 text-center md:text-left max-w-full">
            {description}
          </div>
        </div>
      </div>
    )}
  </>
);
*/
