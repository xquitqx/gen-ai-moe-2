import '../components/AdminStyle/about.css'; // Importing the CSS for styling
import { Nav } from '../components/Nav'; // Importing the Nav component

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
      <Nav entries={navLinks} />

      {/* Page Content */}
      <div className="containerabout">
        <h1 className="page-title">The European Framework - CEFR Levels</h1>

        {/* Level Boxes */}
        {[
          {
            title: 'A1 Elementary',
            description:
              'Learners who achieve A1 Elementary level can communicate using familiar everyday expressions and very basic phrases. They can introduce themselves and others and ask and answer simple questions about personal details.',
          },
          {
            title: 'A2 Pre-intermediate',
            description:
              'Learners who achieve A2 Pre-intermediate level can communicate using frequently used expressions in everyday situations. They can interact in simple and direct exchanges of information and can describe things around them and things they need.',
          },
          {
            title: 'B1 Intermediate',
            description:
              'Learners who achieve B1 Intermediate level can understand information about familiar topics. They can communicate in most situations whilst travelling in an English-speaking area. They can write simple connected texts on familiar topics.',
          },
          {
            title: 'B2 Upper intermediate',
            description:
              'Learners who achieve B2 Upper intermediate level can understand the main ideas of complex texts. They can interact with some fluency and communicate easily. They can write clear, detailed texts on a wide range of topics and express their opinions.',
          },
          {
            title: 'C1 Advanced',
            description:
              'Learners who achieve C1 Advanced level can understand a wide range of long, complex texts. They can interact and express themselves fluently and spontaneously and use language flexibly and effectively in social, academic, and professional situations.',
          },
          {
            title: 'C2 Proficiency',
            description:
              'Learners who achieve C2 Proficiency level can easily understand almost everything they hear or read. They can express themselves fluently and spontaneously with precision in complex situations.',
          },
        ].map((level, index) => (
          <div className="levelabout" key={index}>
            <h2 className="level-title">{level.title}</h2>
            <p className="level-description">{level.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default About;
