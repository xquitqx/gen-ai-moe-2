import React, { useEffect, useState } from "react";
import { get } from "aws-amplify/api";

const ReadingExtractedFilePage: React.FC = () => {
  const [feedback, setFeedback] = useState<string>(""); 
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passages, setPassages] = useState<string[]>([]);

  useEffect(() => {
    const fetchExtractedFile = async () => {
      try {
        const response: any = await get({
          apiName: "myAPI",
          path: "/getExtractReading",
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
          const passage1 = JSON.parse(fileContent).passage1;
          const passage2 = JSON.parse(fileContent).passage2;
          const passage3 = JSON.parse(fileContent).passage3;
          setFeedback(feedbackResults);
          setPassages([passage1, passage2, passage3]);
          setFileContent(feedback); // Update state with file content
          console.log(passage1)
          console.log(passage2)
          console.log(passage3)
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
  console.log(sections)
  const form = document.createElement("form");
  form.action = "/ApproveQuestions";
  form.method = "POST";

  let index = 0
  // Generate divs dynamically
  sections.forEach(section => {
    // Extract question and choices
    const [question] = section.split("\n").map(line => line.trim()).filter(line => line);

    // Create a new div for each "BREAK" section
    const div = document.createElement("div");
    div.classList.add("question-section");
    if (index == 0) {
        const passageInput1 = document.createElement("input");
        passageInput1.value = passages[0];
        passageInput1.style.width = "700px";
        div.appendChild(document.createElement("br"));
        div.appendChild(passageInput1);
        div.appendChild(document.createElement("br"));
    }
    if (index == 4) {
        const passageInput2 = document.createElement("input");
        passageInput2.value = passages[1];
        passageInput2.style.width = "700px";
        div.appendChild(document.createElement("br"));
        div.appendChild(passageInput2);
        div.appendChild(document.createElement("br"));
    }
    if (index == 8) {
        const passageInput3 = document.createElement("input");
        passageInput3.value = passages[2];
        passageInput3.style.width = "700px";
        div.appendChild(document.createElement("br"));
        div.appendChild(passageInput3);
        div.appendChild(document.createElement("br"));
    }

    // Add question as a heading
    const questionHeading = document.createElement("input");
    questionHeading.value = question;
    questionHeading.style.width = "700px";
    div.appendChild(document.createElement("br"));
    div.appendChild(questionHeading);
    div.appendChild(document.createElement("br"));

    // Append the div to the container
    form.appendChild(div);
    index++;
  });
  container?.appendChild(form);
  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.textContent = "Submit";
  form.appendChild(submitButton);
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

export default ReadingExtractedFilePage;
