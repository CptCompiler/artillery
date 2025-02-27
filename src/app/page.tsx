'use client';

import { useState } from 'react';
import { ArrowUpTrayIcon } from '@heroicons/react/24/solid';
import type { ArtilleryReport } from '@/types/artillery';
import ReportViewer from '@/components/ReportViewer';

export default function Home() {
  const [report, setReport] = useState<ArtilleryReport | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      setReport(data);
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Error reading file. Please make sure it\'s a valid Artillery JSON report.');
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Artillery Report Viewer</h1>
        
        {!report ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] border-2 border-dashed border-gray-300 rounded-lg p-8">
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
          <ReportViewer report={report} onReset={() => setReport(null)} />
        )}
      </div>
    </main>
  );
}
