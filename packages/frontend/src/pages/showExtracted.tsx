import React, { useEffect, useState } from "react";
import { get } from "aws-amplify/api";

const ExtractedFilePage: React.FC = () => {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExtractedFile = async () => {
      try {
        const response: any = await get({
          apiName: "myAPI",
          path: "/getExtract",
        });

        console.log("Raw Response:", response); // Debugging: Check the initial structure

        // Resolve the nested Promise if it exists
        const resolvedResponse = await response.response;

        console.log("Resolved Response:", resolvedResponse); // Debugging: Check the resolved structure

        // Check if body is already an object
        const parsedBody =
          typeof resolvedResponse.body === "string"
            ? JSON.parse(resolvedResponse.body) // Parse if it's a string
            : resolvedResponse.body; // Use directly if it's an object

        console.log("Parsed Body:", parsedBody); // Debugging: Check the parsed content

        if (parsedBody) {
          const fileContent = await parsedBody.text();
          setFileContent(fileContent); // Update state with file content
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
        style={{
          marginTop: "20px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          backgroundColor: "rgba(233, 225, 225, 0.894)",
          maxWidth: "90%", // Adjust to take more horizontal space
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
