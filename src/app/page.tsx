'use client';

import { useState, useEffect } from 'react';
import { ArrowUpTrayIcon, XMarkIcon, PencilIcon, CheckIcon } from '@heroicons/react/24/solid';
import type { ArtilleryReport } from '@/types/artillery';
import ReportViewer from '@/components/ReportViewer';

interface StoredReport {
  name: string;
  data: ArtilleryReport;
  timestamp: number;
}

export default function Home() {
  const [reports, setReports] = useState<StoredReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<StoredReport | null>(null);
  const [editingName, setEditingName] = useState<number | null>(null);
  const [editedName, setEditedName] = useState('');

  // Load reports from localStorage on mount
  useEffect(() => {
    const storedReports = localStorage.getItem('artillery-reports');
    if (storedReports) {
      setReports(JSON.parse(storedReports));
    }
  }, []);

  // Save reports to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('artillery-reports', JSON.stringify(reports));
  }, [reports]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      const newReport: StoredReport = {
        name: file.name,
        data,
        timestamp: Date.now()
      };

      setReports(prev => [newReport, ...prev]);
      setSelectedReport(newReport);
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Error reading file. Please make sure it\'s a valid Artillery JSON report.');
    }
  };

  const deleteReport = (timestamp: number) => {
    setReports(prev => prev.filter(r => r.timestamp !== timestamp));
    if (selectedReport?.timestamp === timestamp) {
      setSelectedReport(null);
    }
  };

  const startEditing = (report: StoredReport) => {
    setEditingName(report.timestamp);
    setEditedName(report.name);
  };

  const saveEditedName = (timestamp: number) => {
    if (!editedName.trim()) return;

    setReports(prev => prev.map(report => {
      if (report.timestamp === timestamp) {
        return { ...report, name: editedName.trim() };
      }
      return report;
    }));

    if (selectedReport?.timestamp === timestamp) {
      setSelectedReport(prev => prev ? { ...prev, name: editedName.trim() } : null);
    }

    setEditingName(null);
    setEditedName('');
  };

  const handleKeyPress = (e: React.KeyboardEvent, timestamp: number) => {
    if (e.key === 'Enter') {
      saveEditedName(timestamp);
    } else if (e.key === 'Escape') {
      setEditingName(null);
      setEditedName('');
    }
  };

  return (
    <main className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#1a1a1a] border-r border-[#242424] p-4 flex flex-col">
        <h2 className="text-lg font-semibold text-white mb-4">Saved Reports</h2>
        
        <label className="flex items-center justify-center w-full p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer mb-4 transition-colors">
          <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
          Upload Report
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        <div className="flex-1 overflow-y-auto">
          {reports.length === 0 ? (
            <p className="text-gray-500 text-sm text-center">No reports yet</p>
          ) : (
            <ul className="space-y-2">
              {reports.map((report) => (
                <li 
                  key={report.timestamp}
                  className={`group flex items-center justify-between p-2 rounded hover:bg-[#2a2a2a] cursor-pointer ${
                    selectedReport?.timestamp === report.timestamp ? 'bg-[#2a2a2a]' : ''
                  }`}
                >
                  {editingName === report.timestamp ? (
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      onKeyDown={(e) => handleKeyPress(e, report.timestamp)}
                      className="flex-1 bg-[#333333] text-white text-sm px-2 py-1 rounded mr-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="text-sm text-gray-300 truncate flex-1 cursor-pointer"
                      onClick={() => setSelectedReport(report)}
                    >
                      {report.name}
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    {editingName === report.timestamp ? (
                      <button
                        onClick={() => saveEditedName(report.timestamp)}
                        className="text-green-500 hover:text-green-400"
                      >
                        <CheckIcon className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(report);
                        }}
                        className="text-gray-500 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteReport(report.timestamp);
                      }}
                      className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-white">Artillery Report Viewer</h1>
          
          {!selectedReport ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] border-2 border-dashed border-[#333333] rounded-lg p-8">
              <ArrowUpTrayIcon className="w-12 h-12 text-gray-400 mb-4" />
              <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded">
                Upload Artillery Report
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <p className="mt-2 text-sm text-gray-500">Upload your Artillery JSON report file</p>
            </div>
          ) : (
            <ReportViewer 
              report={selectedReport.data} 
              onReset={() => setSelectedReport(null)} 
            />
          )}
        </div>
      </div>
    </main>
  );
}
