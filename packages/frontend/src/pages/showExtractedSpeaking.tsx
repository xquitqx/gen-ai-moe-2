import React, { useEffect, useState } from "react";
import { get } from "aws-amplify/api";

const SpeakingExtractedFilePage: React.FC = () => {
  const [feedback, setFeedback] = useState<string>(""); 
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExtractedFile = async () => {
      try {
        const response: any = await get({
          apiName: "myAPI",
          path: "/getExtractSpeaking",
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
          const feedbackResults = JSON.parse(fileContent).objectContent;
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
  const form = document.createElement("form");
  form.action = "/ApproveQuestions";
  form.method = "POST";
  const paragraphs  = document.createElement("textarea")
  paragraphs.value = feedback
  form.appendChild(paragraphs)
  
  container?.appendChild(form);
  const statusElement = document.getElementById("status");
  const buttonTry = document.getElementById("btnTry");
  const buttonApprove = document.getElementById("btnApprove");


  if (statusElement && buttonTry && buttonApprove)
  { 
    statusElement.style.visibility = "hidden";
    buttonTry.style.visibility = "visible";
    buttonApprove.style.visibility = "visible";
  }
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
          backgroundColor: "rgba(255, 255, 255, 0.9)",
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
        ) : (<div style={{textAlign: "center"}}>
          <button id="btnTry" onClick={() => location.reload()} style={{
            backgroundColor: "#4c929f",
            color: "white",
            padding: "1rem 2rem",
            border: "none",
            borderRadius: "0.5rem",
            cursor: "pointer",
            marginTop: "1.5rem",
            fontWeight: "bold",
            visibility: "hidden",
            //float: "right",
            display: "inline-block",
            marginRight: "25px",
          }}>Try again</button>
          <p style={{display: "inline-block",}} id="status">Loading...</p>
          <button id="btnApprove"
          style={{
            backgroundColor: "#4c929f",
            color: "white",
            padding: "1rem 2rem",
            border: "none",
            borderRadius: "0.5rem",
            cursor: "pointer",
            marginTop: "1.5rem",
            fontWeight: "bold",
            visibility: "hidden",
            //float: "right",
            display: "inline-block",
            marginLeft: "25px",
          }}
          >
            Approve questions
          </button>          

          </div>
          
        )}
      </div>
    </div>
  );
};

export default SpeakingExtractedFilePage;
