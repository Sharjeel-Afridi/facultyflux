"use client"
import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button" 
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Download, FileSpreadsheet, FileText, Upload, ChevronDown, ChevronUp } from 'lucide-react'

// Simulated function to crawl academic databases


type Publication = {
  data: ArrayBuffer;
};


export default function PublicationSummaryGenerator() {
  const [facultyName, setFacultyName] = useState("")
  // const [publications, setPublications] = useState<Publication[]>([])
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null)
  const [expandedPublications, setExpandedPublications] = useState<Set<string>>(new Set())


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/search', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ author: facultyName })
      });
      
      const record = await response.json();
      // setPublications(record.publications)
      setData(record.publications);

    } catch (error) {
        console.error('Error:', error);
  }

    setLoading(false)
  }

  const handleFileUpload =async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
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
          const record = await response.json();
          setData(record.publications);
          // console.log(publications);
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

  const exportToWord = (type: 'journals' | 'conferences') => {
    // In a real application, this would generate a Word document
    console.log(`Exporting ${type} to Word`)
  }

  const exportToExcel = (type: 'journals' | 'conferences') => {
    // In a real application, this would generate an Excel file
    console.log(`Exporting ${type} to Excel`)
  }

  const toggleSummary = (publicationTitle: string) => {
    setExpandedPublications(prev => {
      const newSet = new Set(prev)
      if (newSet.has(publicationTitle)) {
        newSet.delete(publicationTitle)
      } else {
        newSet.add(publicationTitle)
      }
      return newSet
    })
  }
  // let publicationsArray;
  // if(data){
  //   publicationsArray = data;
  // }else{
  //   publicationsArray = publications;
  // }

  const renderPublicationTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Authors</TableHead>
          {/* <TableHead>{type === 'journals' ? 'Journal' : 'Conference'}</TableHead> */}
          <TableHead>DOI</TableHead>
        </TableRow>
      </TableHeader>
        <TableBody>
        {data.map((pub, index) => (
          <React.Fragment key={index}>
            <TableRow>
              <TableCell>{pub.title}</TableCell>
              <TableCell>{pub.author || ''}</TableCell>
              <TableCell>{pub.link ? (<a href={pub.link} >Click to open</a>) : pub.doi ? (<a href={`https://doi.org/${pub.doi}`} >Click to open</a>) : '-'}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSummary(pub.title)}
                  aria-expanded={expandedPublications.has(pub.title)}
                  aria-controls={`summary-${index}`}
                >
                  {expandedPublications.has(pub.title) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  <span className="sr-only">Toggle summary</span>
                </Button>
              </TableCell>
            </TableRow>
            {expandedPublications.has(pub.title) && (
              <TableRow id={`summary-${index}`}>
                <TableCell colSpan={3}>
                  <Card>
                    <CardContent className="p-4">
                      {/* Assuming you have a summary property in the data */}
                      {/* {pub.summary} */}
                    </CardContent>
                  </Card>
                </TableCell>
              </TableRow>
            )}
          </React.Fragment>
        ))}
      </TableBody>
    </Table>
  )

  return (
    <div className="flex flex-col  bg-gray-100 p-4 min-h-screen ">
      <h1 className="text-3xl font-bold mb-4">Publication Summary Generator</h1>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 ">
          <div>
            <Label htmlFor="faculty-name" className='text-lg'>Faculty Name</Label>
            <Input
              id="faculty-name"
              value={facultyName}
              onChange={(e) => setFacultyName(e.target.value)}
              className='text-lg border-2 border-gray-500 py-4'
              required
            />
          </div>
          {/* <div>
            <Label htmlFor="start-year">Start Year</Label>
            <Input
              id="start-year"
              type="number"
              value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="end-year">End Year</Label>
            <Input
              id="end-year"
              type="number"
              value={endYear}
              onChange={(e) => setEndYear(e.target.value)}
              required
            />
          </div> */}
        </div>
        
        <Button type="submit" className="mt-4 " disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </form>
      
      <h1 className='text-lg font-medium'>OR</h1>
      <div className="mb-4">
          <Label htmlFor="file-upload">Upload Faculty Names (BibTex)</Label>
          <div className="flex items-center pt-5">
            <Input
              id="file-upload"
              type="file"
              onChange={handleFileUpload}
              accept=".xlsx,.xls"
              className="sr-only"
            />
            <Label
              htmlFor="file-upload"
              className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Upload className="h-4 w-4 inline-block mr-2" />
              Choose file
            </Label>
            <span className="mx-3 text-sm text-gray-500">
              {file ? file.name : "No file chosen"}
            </span>
            <Button onClick={handleUpload} type="submit" className="" disabled={loading}>
              {loading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>

      <Tabs defaultValue="journals">
        <TabsList>
          <TabsTrigger value="journals">Journals</TabsTrigger>
          <TabsTrigger value="conferences">Conferences</TabsTrigger>
        </TabsList>
        <TabsContent value="journals">
          <div className="flex justify-end mb-2">
            <Button onClick={() => exportToWord('journals')} className="mr-2">
              <FileText className="mr-2 h-4 w-4" /> Export to Word
            </Button>
            <Button onClick={() => exportToExcel('journals')}>
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Export to Excel
            </Button>
          </div>
          {data && renderPublicationTable()}
        </TabsContent>
        {/* <TabsContent value="conferences">
          <div className="flex justify-end mb-2">
            <Button onClick={() => exportToWord('conferences')} className="mr-2">
              <FileText className="mr-2 h-4 w-4" /> Export to Word
            </Button>
            <Button onClick={() => exportToExcel('conferences')}>
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Export to Excel
            </Button>
          </div>
          {renderPublicationTable(publications.conferences, 'conferences')}
        </TabsContent> */}
      </Tabs>
    </div>
  )
}