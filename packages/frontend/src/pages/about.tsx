import '../components/AdminStyle/about.css';
import { Nav } from '../components/Nav';

const About = () => {
  // Navigation links for the Nav component
  const navLinks = [
    { text: 'Home', to: '/' },
    { text: 'How to use', to: '/howtouse' },
    { text: 'About', to: '/about' },
  ];

  return (
    <div className="steps-page">
      {/* Navigation Bar */}
      <Nav showLogo={true} entries={navLinks} /> 

      <div className="container">
        <h1 className="page-title">The European framework -CEFR Levels</h1>

        <div className="level">
          <h2 className="level-title">A1 Elementary</h2>
          <p className="level-description">
            Learners who achieve A1 Elementary level can communicate using
            familiar everyday expressions and very basic phrases. They can
            introduce themselves and others and ask and answer simple questions
            about personal details.
          </p>
        </div>

        <div className="level">
          <h2 className="level-title">A2 Pre-intermediate</h2>
          <p className="level-description">
            Learners who achieve A2 Pre-intermediate level can communicate using
            frequently used expressions in everyday situations. They can
            interact in simple and direct exchanges of information and can
            describe things around them and things they need.
          </p>
        </div>

        <div className="level">
          <h2 className="level-title">B1 Intermediate</h2>
          <p className="level-description">
            Learners who achieve B1 Intermediate level can understand
            information about familiar topics. They can communicate in most
            situations whilst travelling in an English-speaking area. They can
            write simple connected texts on familiar topics.
          </p>
        </div>

        <div className="level">
          <h2 className="level-title">B2 Upper intermediate</h2>
          <p className="level-description">
            Learners who achieve B2 Upper intermediate level can understand the
            main ideas of complex texts. They can interact with some fluency and
            communicate easily. They can write clear, detailed texts on a wide
            range of topics and express their opinions.
          </p>
        </div>

        <div className="level">
          <h2 className="level-title">C1 Advanced</h2>
          <p className="level-description">
            Learners who achieve C1 Advanced level can understand a wide range
            of long, complex texts. They can interact and express themselves
            fluently and spontaneously and use language flexibly and effectively
            in social, academic and professional situations.
          </p>
        </div>

        <div className="level">
          <h2 className="level-title">C2 Proficiency</h2>
          <p className="level-description">
            Learners who achieve C2 Proficiency level can easily understand
            almost everything they hear or read. They can express themselves
            fluently and spontaneously with precision in complex situations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
