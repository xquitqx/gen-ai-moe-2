import React, { useEffect, useState } from "react";
import { get } from "aws-amplify/api";
import { post } from 'aws-amplify/api';

const ReadingExtractedFilePage: React.FC = () => {
  const [feedback, setFeedback] = useState<string>(""); 
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [/*passages*/, setPassages] = useState<string[]>([]);

  useEffect(() => {
    const fetchExtractedFile = async () => {
      try {
        const response: any = await get({
          apiName: "myAPI",
          path: "/getExtractReading",
        });

        // Resolve the nested Promise if it exists
        const resolvedResponse = await response.response;
        if(resolvedResponse.statusCode >= 500){
          const statusElement = document.getElementById("status");
          if(statusElement)
          statusElement.textContent = `${resolvedResponse.body.message}, Please try again later`
        }
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

  const approving = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      // Gather the content of all "question-section" divs and their inputs
      const sections = Array.from(document.getElementsByClassName("question-section")).map((section) => {
        const question = (section.querySelector("input.question-input") as HTMLInputElement)?.value || "";
  
        // Gather choices
        const choices = Array.from(section.querySelectorAll("input[type='text'].editable-choice")).map(
          (input) => (input as HTMLInputElement).value
        );
  
        // Gather selected answers
        const selectedAnswer = (section.querySelector("input[type='radio']:checked") as HTMLInputElement)?.value || null;
  
        return {
          question,
          choices,
          selectedAnswer,
        };
      });
  
      // Filter out empty questions
      const validSections = sections.filter((section) => section.question.trim() !== "");
      console.log(validSections)
      // Send the gathered data to your Lambda function
      const response = await post({
        apiName: "myAPI",
        path: "/approveReading",
        options: { body: JSON.stringify(validSections) },
      });
  
      console.log("Approve response:", response);
  
      // Redirect to admin landing page
      window.location.href = "/adminLandingPage";
    } catch (error) {
      console.error(`Approve failed: ${(error as Error).message}`);
    }
  };
  
       
  console.log("our feedback:", feedback); // for testing

  const container = document.getElementById("container") ? document.getElementById("container") : null;
  const sections = feedback.split(/BREAK/).filter(section => section.trim() !== "");
  const form = document.createElement("form");
  form.action = "/ApproveQuestions";
  form.method = "POST";


  // Generate divs dynamically
  sections.forEach(section => {
    // Extract question and choices
    //const [question, ...choices] = section.split("a)").map(line => line.trim()).filter(line => line);
    const [question, ...choices] = section.split("CHOICE").map(line => line.trim()).filter(line => line);
    // Create a new div for each "BREAK" section
    const div = document.createElement("div");
    div.classList.add("question-section");

    // Add question as a heading
    const questionHeading = document.createElement("input");
    questionHeading.classList.add("question-input");
    questionHeading.value = question;
    questionHeading.style.width = "100%";
    questionHeading.style.height = "auto";
    questionHeading.style.border = "1px solid grey";


    div.appendChild(document.createElement("br"));
    div.appendChild(questionHeading);
    div.appendChild(document.createElement("br"));

    // Add radio buttons and text inputs for choices
    if(question.includes("True") && question.includes("False")){
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = question; // Group radios by question
      radio.value = "True" // Cleaned-up value
      const choiceA = document.createElement("input");
      choiceA.type = "Text"
      choiceA.value = "True";
      const radio2 = document.createElement("input");
      radio2.type = "radio";
      radio.name = question; // Group radios by question
      radio2.value = "False" // Cleaned-up value
      const choiceB = document.createElement("input");
      choiceB.type = "Text"
      choiceB.value = "False";
      choiceA.style.width = "90%"; // Adjusted width to make the text box longer
      choiceA.classList.add("editable-choice");
      choiceB.style.width = "90%"; // Adjusted width to make the text box longer
      choiceB.classList.add("editable-choice");
      div.appendChild(radio);
      choiceA.style.border = "1px solid grey";
      div.appendChild(choiceA)
      div.appendChild(document.createElement("br"));
      div.appendChild(radio2);
      choiceB.style.border = "1px solid grey";
      div.appendChild(choiceB)

      

    }
    choices.forEach(choice => {
      // Create the radio button
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = question; // Group radios by question
      radio.value = choice.replace(/^CHOICE/, ""); // Cleaned-up value

      // Create the text input
      const input = document.createElement("input");
      input.type = "text";
      input.value = choice.replace(/^CHOICE/, ""); // Removing "CHOICE" from the text
      input.style.width = `90%`; // Adjusted width to make the text box longer
      input.classList.add("editable-choice");
      input.name = question;
      input.style.border = "1px solid grey";

      // Append the radio button and text input to the div
      div.appendChild(radio);
      div.appendChild(input);

      // Add a line break after each set of inputs
      div.appendChild(document.createElement("br"));
    });

    // Append the div to the container
    form.appendChild(div);
  });
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
  

  // Split text by "BREAK"
  // const sections = feedback.split(/BREAK /).filter(section => section.trim() !== "");
  // console.log(sections)
  // const form = document.createElement("form");
  // form.action = "/ApproveQuestions";
  // form.method = "POST";

  // let index = 0
  // // Generate divs dynamically
  // sections.forEach(section => {
  //   // Extract question and choices
  //   const [question] = section.split("\n").map(line => line.trim()).filter(line => line);

  //   // Create a new div for each "BREAK" section
  //   const div = document.createElement("div");
  //   div.classList.add("question-section");
  //   if (index == 0) {
  //       const passageInput1 = document.createElement("input");
  //       passageInput1.value = passages[0];
  //       passageInput1.style.width = "700px";
  //       div.appendChild(document.createElement("br"));
  //       div.appendChild(passageInput1);
  //       div.appendChild(document.createElement("br"));
  //   }
  //   if (index == 4) {
  //       const passageInput2 = document.createElement("input");
  //       passageInput2.value = passages[1];
  //       passageInput2.style.width = "700px";
  //       div.appendChild(document.createElement("br"));
  //       div.appendChild(passageInput2);
  //       div.appendChild(document.createElement("br"));
  //   }
  //   if (index == 8) {
  //       const passageInput3 = document.createElement("input");
  //       passageInput3.value = passages[2];
  //       passageInput3.style.width = "700px";
  //       div.appendChild(document.createElement("br"));
  //       div.appendChild(passageInput3);
  //       div.appendChild(document.createElement("br"));
  //   }

  //   // Add question as a heading
  //   const questionHeading = document.createElement("input");
  //   questionHeading.value = question;
  //   questionHeading.style.width = "700px";
  //   div.appendChild(document.createElement("br"));
  //   div.appendChild(questionHeading);
  //   div.appendChild(document.createElement("br"));

  //   // Append the div to the container
  //   form.appendChild(div);
  //   index++;
  // });
  // container?.appendChild(form);
  // const submitButton = document.createElement("button");
  // submitButton.type = "submit";
  // submitButton.textContent = "Submit";
  // form.appendChild(submitButton);
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
          <button onClick = {approving} id="btnApprove"
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

          </div>)}
      </div>
    </div>
  );
};

export default ReadingExtractedFilePage;


