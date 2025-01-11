import { RouteObject, createBrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import TestPage from './pages/TestPage.tsx';
// import ReadingQuestions from './pages/ReadingQuestionsPage.tsx';
// import Speaking from './pages/speaking.tsx';
import Home from './pages/home.tsx';
// import Sections from './pages/sections.tsx';
import SignUp from './pages/signUp.tsx';
import SignIn from './pages/signIn.tsx';
import Exercises from './pages/Exercises.tsx';
import { SpeakingExercisesPage } from './pages/SpeakingExercisesPage.tsx';
import { SpeakingLongQuestionPage } from './pages/SpeakingLongQuestionPage.tsx';
import { SpeakingConversationPage } from './pages/SpeakingConversationPage.tsx';
import LRFeedbackPage from './pages/LRFeedbackPage.tsx';
import PlacementTest from './pages/PlacementTest.tsx';
import { Layout } from './Layout.tsx';
import { AddListeningQPage } from './pages/AddListeningQPage.tsx';
import { SuccessAddListeningQPage } from './pages/SuccessAddListeningQPage.tsx';
import { SignOutPage } from './pages/signOut.tsx';
import ErrorPage from './pages/ErrorPage.tsx';

// import { WritingPage } from './pages/WritingPage.tsx';
//import { writingSection } from './utilities.ts';
// import RAnswersPage from './pages/RAnswersPage.tsx';
// import { SpeakingAudioPage } from './pages/SpeakingAudioPage.tsx';
// import { SpeakingCardPage } from './pages/SpeakingCardPage.tsx';
// import { ListeningQuestionsPage } from './pages/ListeningQuestionsPage.tsx';
import { FullTestPage } from './pages/FullTestPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { AllFeedbacks } from './components/AllFeedbacks.tsx';
import { SpeakingQuestionsPage } from './pages/SpeakingQuestionsPage.tsx';
import { GeneralFulltestFeedbackPage } from './pages/GeneralFulltestFeedbackPage.tsx';
import { PreviousTests } from './pages/PerviousTests.tsx';
import challengePage from './pages/challengePage.tsx';
import { sampleFullTest } from './utilities/sampleFullTest.ts';
import { RequireAuth } from './utilities/authUtilities.tsx';
import { DevPage } from './pages/DevPage.tsx';
import { QuestionsByLevel } from './pages/QuestionsByLevel.tsx';
import ListeningExtractedFilePage from './pages/showExtractedListening.tsx';
import ReadingExtractedFilePage from "./pages/showExtractedReading.tsx";
import WritingExtractedFilePage from "./pages/showExtractedWriting.tsx";
import SpeakingExtractedFilePage from "./pages/showExtractedSpeaking.tsx";


//Abeer changes
import AdminLogin from './pages/AdminLogin.tsx';
import AdminHome from './pages/AdminHome.tsx';
import Schooldatafetch from './pages/schoolsdata.tsx';
import AdminUploadExams from './pages/AdminUploadExams.tsx';
import UploadWriting from './pages/UploadWriting.tsx';
import Dropzone from './components/Dropzone.tsx';
import DropzoneAudio from './components/DropzoneAudio.tsx';
import UploadReading from './pages/UploadReading.tsx';
import UploadSpeaking from './pages/UploadSpeaking.tsx';
import UploadListening from './pages/UploadListening.tsx';
import FullExamUpload from './pages/FullExamUpload.tsx';
import StudentPerformance from './pages/studentsperformancebh.tsx';
import schooltopachievers from './pages/schooltopachievers.tsx';
import VerticalSteps from './pages/howtouse.tsx';
import about from './pages/about.tsx';
import AdminLandingPage from './pages/adminlayout.tsx';
import SchoolsList from './pages/chooseschool.tsx';
import SchoolsList2 from './pages/chooseschool2.tsx';
import AchievementsPage from './pages/AchievementsPage.tsx';

// These routes will have the landing nav bar

const landingRoutes: RouteObject[] = [
  {
    path: '/',
    Component: App,
  },
];

const notLandingRoutes: RouteObject[] = [
  // {
  //   path: '/speaking',
  //   Component: Speaking,
  // },
  // {

  {
    path: '/Exercises',
    Component: Exercises,
  },
  {
    path: '/sections',
    element: <PreviousTests type="section" />,
  },
  {
    path: '/fulltestFeedback',
    element: <GeneralFulltestFeedbackPage fullTestItem={sampleFullTest} />,
  },
  {
    path: '/SpeakingExercises',
    Component: SpeakingExercisesPage,
  },
  {
    path: '/SpeakingLongQuestion',
    Component: SpeakingLongQuestionPage,
  },
  {
    path: '/SpeakingConversation',
    Component: SpeakingConversationPage,
  },
  {
    path: '/Listening/addQuestion',
    Component: AddListeningQPage,
  },
  {
    path: '/Listening/addQuestion/success',
    Component: SuccessAddListeningQPage,
  },
  {
    path: '/full-exam',
    Component: PreviousTests,
  },
  {
    path: '/test',
    Component: TestPage,
  },
  {
    path: '/sign-out',
    Component: SignOutPage,
  },
  {
    path: '/profilePage',
    Component: ProfilePage,
  },
  {
    path: '/PlacementTest',
    Component: PlacementTest,
  },
  {
    path: '/challengePage',
    Component: challengePage,
  },
  {
    path: '/dev/',
    Component: DevPage,
  },
  {
    path: '/questions-by-level',
    Component: QuestionsByLevel,
  },
  {
    path: '/showExtractedListening',
    Component: ListeningExtractedFilePage,
  },
  {
    path: '/showExtractedReading',
    Component: ReadingExtractedFilePage,
  },
  {
    path: '/showExtractedWriting',
    Component: WritingExtractedFilePage,
  },
  {
    path: '/showExtractedSpeaking',
    Component: SpeakingExtractedFilePage,
  },
  {
    path: '/achievements',
    Component: AchievementsPage,
  },
];

const noLayoutRoutes: RouteObject[] = [
  // {
  //   path: '/writing',
  //   element: <WritingPage />,
  // },
  {
    path: '/full-test/:testId',
    Component: FullTestPage,
  },
  {
    path: '/full-test',
    Component: FullTestPage,
  },
  {
    path: '/feedback/:testId',
    Component: AllFeedbacks,
  },
  // These pages don't use `Layout` yet
  // {
  //   path: '/reading/:sk',
  //   Component: ReadingQuestions,
  // },
  // {
  //   path: '/listening/:sk',
  //   Component: ListeningQuestionsPage,
  // },
  {
    //mychange-----
    path: '/admin-login',
    Component: AdminLogin,
  },
  {
    //mychange------
    path: '/admin-home',
    Component: AdminHome,
  },
  {
    //mychange------
    path: '/chooseschoolachievers',
    Component: SchoolsList2,
  },
  {
    //mychange------
    path: '/schooldatagraph',
    Component: Schooldatafetch,
  },
  {
    //mychange------
    path: '/studentperformance',
    Component: StudentPerformance,
  },
  {
    //mychange------
    path: '/about',
    Component: about,
  },
  {
    //mychange------
    path: '/schooltopachievers',
    Component: schooltopachievers,
  },
  {
    //mychange------
    path: '/adminlandingpage',
    Component: AdminLandingPage,
  },
  {
    path: '/howtouse',
    Component: VerticalSteps,
  },
  // {

  //   path: '/AdminUploadExams',
  //   Component: AdminUploadExams,
  // },
  {
    path: '/Dropzone',
    Component: Dropzone,
  },
  {
    path: '/DropzoneAudio',
    Component: DropzoneAudio,
  },
  {
    //mychange------
    path: '/UploadWriting',
    Component: UploadWriting,
  },
  {
    //mychange------
    path: '/chooseschoolperformance',
    Component: SchoolsList,
  },
  {
    //mychange------
    path: '/UploadSpeaking',
    Component: UploadSpeaking,
  },
  {
    //mychange------
    path: '/UploadReading',
    Component: UploadReading,
  },
  {
    //mychange------
    path: '/UploadListening',
    Component: UploadListening,
  },
  {
    path: '/FullExamUpload',
    Component: FullExamUpload,
  },
  {
    path: '/AdminUploadExams',
    Component: AdminUploadExams,
  },

  {
    path: '/scores/:section/:sk',
    Component: LRFeedbackPage,
  },
  // {
  //   path: '/answers/reading/:sk',
  //   Component: RAnswersPage,
  // },
  // {
  //   path: '/answers/listening/:sk',
  //   Component: LAnswersPage,
  // },
  // {
  //   path: '/test-speaking-card-ui',
  //   Component: SpeakingCardPage,
  // },
  // {
  //   path: '/test-speaking-audio-ui',
  //   Component: SpeakingAudioPage,
  // },
  {
    path: '/sign-in',
    Component: SignIn,
  },
  {
    path: '/sign-up',
    Component: SignUp,
  },
  {
    path: '/sample-speaking',
    element: (
      <SpeakingQuestionsPage
        speakingSection={sampleFullTest.questions.speaking}
        submitAnswers={console.log}
      />
    ),
  },
];

// Place pages here
export const routes = createBrowserRouter([
  {
    element: <Layout isLanding={true} />,
    errorElement: <ErrorPage />,
    children: landingRoutes,
  },
  /* Include all the routes that may affect authentication info here */
  {
    element: (
      <RequireAuth>
        <Layout />
      </RequireAuth>
    ),
    children: notLandingRoutes,
  },
  // Note that home page doesn't need a padding, because of the slider
  {
    element: (
      <RequireAuth>
        <Layout noPadding />
      </RequireAuth>
    ),
    children: [
      {
        path: '/home',
        Component: Home,
      },
    ],
  },
  ...noLayoutRoutes,
]);
