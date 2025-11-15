"use client";

import * as React from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FileGrid } from "@/components/library/FileGrid";
import { UploadZone } from "@/components/library/UploadZone";
import { AudioPlayer } from "@/components/library/AudioPlayer";
import { useAudioStore } from "@/store/audioStore";
import { Upload, FolderOpen, Music, HardDrive } from "lucide-react";

// Mock audio files (replace with R2 API call)
const generateMockFiles = () => {
  return Array.from({ length: 12 }, (_, i) => ({
    id: `file-${i + 1}`,
    name: `Track ${i + 1} - ${["Mix", "Master", "Demo", "Stem", "Loop"][i % 5]}.${["mp3", "wav", "flac"][i % 3]}`,
    url: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(i % 16) + 1}.mp3`,
    duration: 180 + Math.floor(Math.random() * 120),
    size: (2 + Math.random() * 8) * 1024 * 1024,
    format: ["mp3", "wav", "flac"][i % 3],
    uploadedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    tags: ["Electronic", "Rock", "Jazz", "Hip Hop"][Math.floor(Math.random() * 4)]
      ? [["Electronic", "Rock", "Jazz", "Hip Hop"][Math.floor(Math.random() * 4)]]
      : [],
  }));
};

export default function LibraryPage() {
  const [showUpload, setShowUpload] = React.useState(false);
  const [files, setFiles] = React.useState(() => generateMockFiles());
  const [selectedFile, setSelectedFile] = React.useState<any>(null);
  const { currentFile, setCurrentFile } = useAudioStore();

  const handleSelectFile = (file: any) => {
    setSelectedFile(file);
    setCurrentFile(file);
  };

  const handleUploadComplete = (newFiles: any[]) => {
    // Add uploaded files to the list
    setFiles((prev) => [...newFiles, ...prev]);
    setShowUpload(false);
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const totalDuration = files.reduce((sum, file) => sum + file.duration, 0);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  const formatSize = (bytes: number) => {
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Audio Library"
        description="Manage your audio files and recordings"
        showSearch={false}
      />

      <div className="flex-1 p-6 space-y-6 overflow-auto scrollbar-thin pb-32">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Files</p>
                  <p className="text-2xl font-bold text-violet-400 mt-1">
                    {files.length}
                  </p>
                </div>
                <Music className="h-8 w-8 text-violet-400/50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Duration</p>
                  <p className="text-2xl font-bold text-blue-400 mt-1">
                    {formatDuration(totalDuration)}
                  </p>
                </div>
                <FolderOpen className="h-8 w-8 text-blue-400/50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Storage Used</p>
                  <p className="text-2xl font-bold text-green-400 mt-1">
                    {formatSize(totalSize)}
                  </p>
                </div>
                <HardDrive className="h-8 w-8 text-green-400/50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Storage Available</p>
                  <p className="text-2xl font-bold text-yellow-400 mt-1">
                    {formatSize(100 * 1024 * 1024 * 1024 - totalSize)}
                  </p>
                </div>
                <HardDrive className="h-8 w-8 text-yellow-400/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-100">My Files</h2>
            <p className="text-sm text-gray-400">
              {files.length} audio files • Stored on Cloudflare R2
            </p>
          </div>
          <Button onClick={() => setShowUpload(!showUpload)}>
            <Upload className="h-4 w-4 mr-2" />
            {showUpload ? "Hide Upload" : "Upload Files"}
          </Button>
        </div>

        {/* Upload Zone */}
        {showUpload && <UploadZone onUploadComplete={handleUploadComplete} />}

        {/* File Grid */}
        <FileGrid
          files={files}
          onSelectFile={handleSelectFile}
          selectedFileId={selectedFile?.id}
        />
      </div>

      {/* Fixed Audio Player */}
      {(selectedFile || currentFile) && (
        <div className="fixed bottom-0 left-64 right-0 z-10 border-t border-gray-800 bg-gray-950">
          <AudioPlayer audioFile={selectedFile || currentFile} />
        </div>
      )}
    </div>
  );
}
