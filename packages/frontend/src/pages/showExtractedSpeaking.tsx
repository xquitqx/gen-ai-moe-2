import React, { useEffect, useState, useRef } from "react";
import { get } from "aws-amplify/api";
import WaveSurfer from "wavesurfer.js";

const SpeakingExtractedFilePage: React.FC = () => {
  const [feedback, setFeedback] = useState<string>(""); 
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioUrls, setAudioUrls] = useState<string[] | null>(null);

  const wavesurferRefs = useRef<(WaveSurfer | null)[]>([]);  // Ref to store WaveSurfer instances for each audio file
  //const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const fetchExtractedFile = async () => {
      try {
        const response: any = await get({
          apiName: "myAPI",
          path: "/getExtractSpeaking",
        });

        const resolvedResponse = await response.response;
        const parsedBody =
          typeof resolvedResponse.body === "string"
            ? JSON.parse(resolvedResponse.body)
            : resolvedResponse.body;

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

      try {
        const audioResponse: any = await get({
          apiName: "myAPI",
          path: "/getAudioFiles", // Ensure this matches your API Gateway path
        });

        const actualAudioFiles = await audioResponse.response;
        const AudioFiles =
          typeof actualAudioFiles.body === "string"
            ? JSON.parse(actualAudioFiles.body)
            : actualAudioFiles.body;

        const txtFiles = await AudioFiles.text();
        console.log("We got it now right? ", txtFiles);

        const parsedFiles = JSON.parse(txtFiles);

        const myAudioFiles = parsedFiles.mp3Files;
        const choosed = myAudioFiles.slice(0, 7);
        setAudioUrls(choosed);

        console.log("Only the files here: ", myAudioFiles);

        if (myAudioFiles && myAudioFiles.length > 0) {
          console.log("Fetched audio files:", myAudioFiles);
        } else {
          console.log("No MP3 files found in the S3 bucket.");
        }
      } catch (error) {
        console.error("Error in fetching audio files:", error);
      }
    };

    fetchExtractedFile();
  }, []);

  useEffect(() => {
    // Initialize WaveSurfer instances for each audio URL
    let i = 0;
  if (audioUrls && audioUrls.length > 0) {
  for (let index = 0; index < audioUrls.length; index++) {
    if (i === 7) break; // Stop after 3 elements

    const url = audioUrls[index];
    const waveSurferInstance = WaveSurfer.create({
      container: `#wavesurfer-container-${index}`,
      waveColor: "#9ca3af",
      progressColor: "#4caf50",
      height: 60,
      barWidth: 3,
      barRadius: 2,
      barGap: 2,
    });

    wavesurferRefs.current[index] = waveSurferInstance; // Store instance for each URL
    waveSurferInstance.load(url);
    i++;
  }
}

  }, [audioUrls]); // Add audioUrls as a dependency

  const togglePlay = (index: number) => {
    const waveSurferInstance = wavesurferRefs.current[index];
    if (waveSurferInstance) {
      if (waveSurferInstance.isPlaying()) {
        waveSurferInstance.pause();
      } else {
        waveSurferInstance.play();
      }
    }
  };
  

  const container = document.getElementById("container") ? document.getElementById("container") : null;

  useEffect(() => {
    // Create form and textarea only once
    if (container) {
      const form = document.createElement("form");
      form.action = "/ApproveQuestions";
      form.method = "POST";
      const paragraphs = document.createElement("textarea");
      paragraphs.rows = 10;
      paragraphs.style.width = "95%";
      paragraphs.value = feedback;
      form.appendChild(paragraphs);
      container.appendChild(form);

      const statusElement = document.getElementById("status");
      const buttonTry = document.getElementById("btnTry");
      const buttonApprove = document.getElementById("btnApprove");

      if (statusElement && buttonTry && buttonApprove) { 
        statusElement.style.visibility = "hidden";
        buttonTry.style.visibility = "visible";
        buttonApprove.style.visibility = "visible";
      }
    }
  }, [feedback]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "750px",
        backgroundColor: "#f8f9fa",
      }}
    >
      <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#333" }}>
        Here is the extracted file:
      </h1>
      <div
        id="container"
        style={{
          marginTop: "20px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          width: "80%",
          height: "500px",
          maxHeight: "auto",
          overflowY: "auto",
          wordWrap: "break-word",
          overflowWrap: "break-word",
          whiteSpace: "pre-wrap",
          textAlign: "left",
        }}
      >
        {error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : fileContent ? (
          <pre>{fileContent}</pre>
        ) : (
          <div style={{ textAlign: "center" }}>
            <button
              id="btnTry"
              onClick={() => location.reload()}
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
                display: "inline-block",
                marginRight: "25px",
              }}
            >
              Try again
            </button>
            <p style={{ display: "inline-block" }} id="status">
              Loading...
            </p>
            <button
              id="btnApprove"
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
                display: "inline-block",
                marginLeft: "25px",
              }}
            >
              Approve questions
            </button>
          </div>
        )}
      </div>

      {/* Render audio files as separate icons with start/pause buttons */}
      <div
        style={{
          marginTop: "20px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          width: "80%",
        }}
      >
        {audioUrls &&
          audioUrls.map((url, index) => (
            console.log(url),
            <div
              key={index}
              style={{
                margin: "10px",
                padding: "20px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                backgroundColor: "#fff",
                textAlign: "center",
                width: "200px",
              }}
            >
              <div
                id={`wavesurfer-container-${index}`}
                style={{
                  width: "100%",
                  height: "60px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  marginBottom: "10px",
                }}
              ></div>
              <button
                onClick={() => togglePlay(index)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#4caf50",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Play / Pause
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default SpeakingExtractedFilePage;
