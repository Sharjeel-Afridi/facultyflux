'use client'
import Image from "next/image";
import { useState } from "react";
import {getJson} from 'serpapi';


export default function Home() {

  const [data, setData] = useState(null);
  const [authorInput, setAuthorInput] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    console.log('inside');
    try {
      const response = await fetch('http://localhost:5000/search', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ author: authorInput })
      });
      
      const publications = await response.json();
      setData(publications);
      console.log(data);
    } catch (error) {
        console.error('Error:', error);
        setData(null);
        
    }
  }

  const handleAuthorInput = (e) => {
    setAuthorInput(e);
  }
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      console.log('file selected');
      console.log(file);
    } else {
      alert('Please select a BibTex file.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    if (file) {
      const formData = new FormData();
      formData.append('bibtex', file);

      try {
        const response = await fetch("http://127.0.0.1:5000/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const publications = await response.json();
          setData(publications);
          // setResponse(data.response); // Set the response if needed
        } else {
          alert("Failed to upload file.");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while uploading the file.");
      } finally {
        setLoading(false);
      }
    } else {
      alert("No file selected.");
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center pt-10">
      <h1 className="font-extrabold text-[5rem]">Faculty Flux</h1>
      <p className="font-medium text-[2rem]">
        One stop solution to get all the publications and their summary of any
        individual.
      </p>

      <div className="flex flex-col items-start gap-5 mt-10">
        <label className="text-[1.5rem] font-medium">
          SEARCH FOR PUBLICATIONS
        </label>
        <input
          value={authorInput}
          onChange = {(e)=>handleAuthorInput(e.target.value)}
          className="w-[60vw] h-[6vh]  text-black text-[1.4rem] px-5 rounded-md"
          placeholder="Enter Faculty Name"
        />
        <button
          onClick={handleSearch}
          className="bg-white/5 hover:bg-white/20 shadow-md border-[1px] border-white text-[1.4rem] rounded-md px-4 py-2 font-medium"
        >
          SEARCH
        </button>
        <div className="flex flex-col items-center justify-center gap-10 w-[60%] h-[90vh]">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-400 border-dashed rounded-lg cursor-pointer bg-transparent  hover:border-blue-300"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-8 h-8 mb-4 text-gray-300 hover:text-gray-600"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 16"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold text-gray-300">Click to upload</span>{" "}
                  or drag and drop
                </p>
                <p className="text-xs text-gray-400">BibTeX File</p>
              </div>
              <input
                id="dropzone-file"
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <button
              className="font-semibold text-white bg-transparent border-2 border-slate-400 hover:border-slate-300 py-3 px-5 rounded-md"
              onClick={handleSubmit}
              >
              {/* {loading ? "Uploading..." : "Submit"} */}
              Submit
            </button>
          </div>
      </div>
      
      {data && (
        <div className="px-20">
          <h1 className="font-bold text-[1.3rem]">
            Author: {data.author || authorInput}
          </h1>
          <h1 className="font-bold text-[1.3rem]">Articles:</h1>
          {data.publications.map((element, index) => (
            <div key={index} className="flex gap-5">
              <p className="font-bold text-[1.3rem]">{index + 1}</p>
              <h1 className="font-medium text-[1.3rem]">{element.title}</h1>
              <a href={element.link}>Link</a>
            </div>
          ))}
          
        </div>
      )}
    </div>
  );
}
