'use client'
import Image from "next/image";
import { useState } from "react";
import {getJson} from 'serpapi';


export default function Home() {

  const [data, setData] = useState(null);
  const [authorInput, setAuthorInput] = useState('');
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
      </div>
      
      {data && (
        <div className="px-20">
          <h1 className="font-bold text-[1.3rem]">
            Author: {authorInput}
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
