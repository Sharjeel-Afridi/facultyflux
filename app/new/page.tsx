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
  title: string;
  link: string,
//   year: number;
//   journal?: string;
//   conference?: string;
//   summary: string;
}

export default function PublicationSummaryGenerator() {
  const [facultyName, setFacultyName] = useState("")
  const [startYear, setStartYear] = useState("")
  const [endYear, setEndYear] = useState("")
  const [publications, setPublications] = useState<{ journals: Publication[], conferences: Publication[] }>({ journals: [], conferences: [] })
  const [loading, setLoading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [expandedPublications, setExpandedPublications] = useState<Set<string>>(new Set())

  const crawlDatabases = async (name: string, startYear: number, endYear: number) => {
    try {
        const response = await fetch('http://localhost:5000/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ author: name })
        });
        
        const data = await response.json();
        return data;

      } catch (error) {
          console.error('Error:', error);
    }
}

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const results = await crawlDatabases(facultyName, parseInt(startYear), parseInt(endYear))
    setPublications(results)

    setLoading(false)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0])
    }
  }

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

  const renderPublicationTable = (publications: Publication[], type: 'journals' | 'conferences') => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Year</TableHead>
          <TableHead>{type === 'journals' ? 'Journal' : 'Conference'}</TableHead>
          <TableHead>Summary</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {publications.map((pub, index) => (
          <React.Fragment key={index}>
            <TableRow>
              <TableCell>{pub.title}</TableCell>
              {/* <TableCell>{pub.year}</TableCell> */}
              {/* <TableCell>{pub.journal || pub.conference}</TableCell> */}
              {/* <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSummary(pub.title)}
                  aria-expanded={expandedPublications.has(pub.title)}
                  aria-controls={`summary-${index}`}
                >
                  {expandedPublications.has(pub.title) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  <span className="sr-only">Toggle summary</span>
                </Button>
              </TableCell> */}
            </TableRow>
            {expandedPublications.has(pub.title) && (
              <TableRow id={`summary-${index}`}>
                <TableCell colSpan={4}>
                  <Card>
                    <CardContent className="p-4">
                      {pub.summary}
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Publication Summary Generator</h1>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <Label htmlFor="faculty-name">Faculty Name</Label>
            <Input
              id="faculty-name"
              value={facultyName}
              onChange={(e) => setFacultyName(e.target.value)}
              required
            />
          </div>
          <div>
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
          </div>
        </div>
        <div className="mb-4">
          <Label htmlFor="file-upload">Upload Faculty Names (Excel)</Label>
          <div className="flex items-center mt-1">
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
            <span className="ml-3 text-sm text-gray-500">
              {uploadedFile ? uploadedFile.name : "No file chosen"}
            </span>
          </div>
        </div>
        <Button type="submit" className="mt-4" disabled={loading}>
          {loading ? "Generating..." : "Generate Summary"}
        </Button>
      </form>

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
          {renderPublicationTable(publications.journals, 'journals')}
        </TabsContent>
        <TabsContent value="conferences">
          <div className="flex justify-end mb-2">
            <Button onClick={() => exportToWord('conferences')} className="mr-2">
              <FileText className="mr-2 h-4 w-4" /> Export to Word
            </Button>
            <Button onClick={() => exportToExcel('conferences')}>
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Export to Excel
            </Button>
          </div>
          {renderPublicationTable(publications.conferences, 'conferences')}
        </TabsContent>
      </Tabs>
    </div>
  )
}