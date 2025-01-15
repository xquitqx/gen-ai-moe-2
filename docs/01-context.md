# LINGUI - IELTS Exam Training Website

This repository contains the codebase for LINGUI, a web application designed to help users improve their english proficiency and train for the IELTS (International English Language Testing System) exam.

## Key Features

*   **IELTS Exam Simulation:** Users can take simulated IELTS exams to assess and improve their English proficiency.
*   **Personalized Feedback:** After completing an exam, users receive detailed, personalized feedback on their performance, highlighting areas of strength and weakness using Generative AI.
*   **Motivational Gamification:** A daily streak system encourages consistent practice. Users build streaks by taking learning activities daily.
*   **Streak Milestone Rewards:** Users unlock milestones and receive email notifications upon reaching the significant streak milestones, providing further motivation.
*   **Admin Dashboard:** A dedicated admin dashboard provides comprehensive management capabilities.
*   **Data Visualization:** The admin dashboard features data visualizations of system performance metrics and student performance data across Bahrain and per school, offering valuable insights.
*   **Exam Upload and Processing:** Admins can upload new IELTS exam content.
*   **AI-Powered Content Processing:** Uploaded exams are processed using Generative AI and Textract to extract text and format the content into an editable format for admin review and approval. This streamlines the process of adding new exam materials.

## Technologies Used

*   Frontend: React
*   Backend: Node.js, Python
*   Database: DynamoDB
*   AI/ML: Generative AI models (Amazon Bedrock - Titan model), Amazon Textract
*   Email Service: Amazon Simple Notification Service
*   Deployment: Amazon CodeCatalyst as the CI/CD
