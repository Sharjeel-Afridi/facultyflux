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
    <main className="bg-white min-h-screen w-[100%] flex flex-col">
      <div className="w-[95vw] flex justify-start  rounded-[3rem] border-2 border-black mt-10 p-4 mx-auto">
        <h1 className="font-bold text-[2rem] pl-6">Faculty Flux</h1>
      </div>
      <div className=" flex flex-col items-start pt-10 px-[2.5vw]">
        
        <h1 className="font-extrabold text-[3rem] md:text-[3.5rem] md:w-[40vw]">
        Effortlessly Manage and Showcase Faculty Publications
        </h1>
        <p className="text-[1.3rem] md:text-[1.8rem] font-normal md:w-[60vw]">
        Generate comprehensive publication summaries for faculty profiles, customized to meet institutional and accrediting body requirements.
        </p>
        <button className="text-[1.5rem] font-medium bg-[#433878] text-white px-2 py-3 rounded-md mt-10">
          Get Started
        </button>
        <div className="w-[100%] flex justify-center">
          <div className="flex flex-col items-center gap-10 pb-10 mt-10">
            <label className="text-[2rem] md:text-[2.5rem] font-bold">
              SEARCH FOR PUBLICATIONS
            </label>
            <div className="flex items-center gap-5">
              <input
                value={authorInput}
                onChange = {(e)=>handleAuthorInput(e.target.value)}
                className="w-[50vw] md:w-[40vw] h-[6vh]  text-black border-[1px] border-black text-[1.4rem] px-5 rounded-md"
                placeholder="Enter Faculty Name"
              />
              <button
                onClick={handleSearch}
                className="bg-[#73EC8B] hover:bg-[#73EC8B]/80  text-[1.4rem] rounded-md px-4 py-2 font-medium"
                >
                SEARCH
              </button>
            </div>
            <h1 className="text-[1.6rem]">
              OR
            </h1>
            <div className="flex flex-col items-center justify-center gap-10 w-[80%] md:w-[60%]">
                <label
                  htmlFor="dropzone-file"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-800 border-dashed rounded-lg cursor-pointer bg-transparent  hover:border-blue-300"
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
                      <span className="font-semibold text-gray-600">Click to upload</span>{" "}
                      or drag and drop
                    </p>
                    <p className="text-xs text-gray-800">BibTeX File</p>
                  </div>
                  <input
                    id="dropzone-file"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <button
                  className="font-semibold text-[1.25rem] bg-transparent border-2 border-slate-400 hover:border-slate-300 py-3 px-5 rounded-md"
                  onClick={handleSubmit}
                  >
                  {loading ? "Uploading..." : "Submit"}
                </button>
              </div>
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
    </main>
  );
}
