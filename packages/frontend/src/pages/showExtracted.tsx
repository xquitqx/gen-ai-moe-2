import React, { useEffect, useState } from "react";
import { get } from "aws-amplify/api";

const ExtractedFilePage: React.FC = () => {
  const [feedback, setFeedback] = useState<string>(""); 
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExtractedFile = async () => {
      try {
        const response: any = await get({
          apiName: "myAPI",
          path: "/getExtract",
        });

        // Resolve the nested Promise if it exists
        const resolvedResponse = await response.response;
        // Check if body is already an object
        const parsedBody =
          typeof resolvedResponse.body === "string"
            ? JSON.parse(resolvedResponse.body) // Parse if it's a string
            : resolvedResponse.body; // Use directly if it's an object

        if (parsedBody) {
          const fileContent = await parsedBody.text();
          const feedbackResults = JSON.parse(fileContent).feedbackResults;
          setFeedback(feedbackResults);
          setFileContent(feedback); // Update state with file content
        } else {
          setError("Failed to retrieve file content.");
        }
      } catch (err: any) {
        console.error("Error fetching file:", err);
        setError("An error occurred while fetching the file.");
      }
    };

    fetchExtractedFile();
  }, []);

  console.log("our feedback:", feedback); // for testing

  const container = document.getElementById("container") ? document.getElementById("container") : null;

  // Split text by "BREAK"
  const sections = feedback.split(/BREAK /).filter(section => section.trim() !== "");

  // Generate divs dynamically
  sections.forEach(section => {
    // Extract question and choices
    const [question, ...choices] = section.split("\n").map(line => line.trim()).filter(line => line);

    // Create a new div for each "BREAK" section
    const div = document.createElement("div");
    div.classList.add("question-section");

    // Add question as a heading
    const questionHeading = document.createElement("h3");
    questionHeading.textContent = question;
    div.appendChild(questionHeading);

    // Add radio buttons and text inputs for choices
    choices.forEach(choice => {
      // Create the radio button
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = question; // Group radios by question
      radio.value = choice.replace(/^CHOICE\s/, ""); // Cleaned-up value

      // Create the text input
      const input = document.createElement("input");
      input.type = "text";
      input.value = choice.replace(/^CHOICE\s/, ""); // Removing "CHOICE" from the text
      input.style.width = "300px"; // Adjusted width to make the text box longer
      input.classList.add("editable-choice");
      input.name = question;

      // Append the radio button and text input to the div
      div.appendChild(radio);
      div.appendChild(input);

      // Add a line break after each set of inputs
      div.appendChild(document.createElement("br"));
    });

    // Append the div to the container
    container?.appendChild(div);
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f8f9fa",
      }}
    >
      <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#333" }}>
        Here is the extracted file:
      </h1>
      <div
        id="container" // Add the id attribute here
        style={{
          marginTop: "20px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          backgroundColor: "rgba(233, 225, 225, 0.894)",
          width: "80%", // Adjust to take more horizontal space
          maxHeight: "auto", // Limit height
          overflowY: "auto", // Add vertical scrolling if needed
          wordWrap: "break-word", // Ensure long words break properly
          overflowWrap: "break-word", // Break long words within content
          whiteSpace: "pre-wrap", // Preserve whitespace and line breaks
          textAlign: "left", // Align text to the left
        }}
      >
        {error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : fileContent ? (
          <pre>{fileContent}</pre>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
};

export default ExtractedFilePage;
