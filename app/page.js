'use client'
import Image from "next/image";
import { useState } from "react";
import {getJson} from 'serpapi';


export default function Home() {

  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    try {
      getJson(
        {
          engine: "google_scholar_author",
          author_id: "EicYvbwAAAAJ",
          num:200,
          api_key: process.env.NEXT_PUBLIC_API_KEY,
        },
        (json) => {
          console.log(json);
          setData(json);
        }
      );
    } catch (error) {
      console.log(error.message);
      setLoading(false);
    }
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
      {/* https://scholar.google.com/citations?hl=en&user=rJliK1UAAAAJ */}

      {data && (
        <div className="px-20">
          <h1 className="font-bold text-[1.3rem]">
            Author: {data.author.name}
          </h1>
          <h1 className="font-bold text-[1.3rem]">Articles:</h1>
          {data["articles"].map((element, index) => (
            <div key={index} className="flex gap-5">
              <p className="font-bold text-[1.3rem]">{index + 1}</p>
              <h1 className="font-medium text-[1.3rem]">{element.title}</h1>
            </div>
          ))}
          {/* 5bdc9e6a1aafdb8a94cbfd4bf85aa23b36c648293df4b509f83a73ec9dbdf327 */}
        </div>
      )}
    </div>
  );
}
