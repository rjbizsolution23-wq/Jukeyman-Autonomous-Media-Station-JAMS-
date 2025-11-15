"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

interface UploadZoneProps {
  onUploadComplete?: (files: any[]) => void;
}

export function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const [uploadFiles, setUploadFiles] = React.useState<UploadFile[]>([]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "audio/*": [".mp3", ".wav", ".flac", ".m4a", ".aac", ".ogg", ".wma"],
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach((rejection) => {
          toast.error(`${rejection.file.name}: ${rejection.errors[0].message}`);
        });
      }

      const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
        id: `${Date.now()}-${file.name}`,
        file,
        progress: 0,
        status: "pending",
      }));

      setUploadFiles((prev) => [...prev, ...newFiles]);
      uploadFilesToR2(newFiles);
    },
  });

  const uploadFilesToR2 = async (files: UploadFile[]) => {
    for (const uploadFile of files) {
      try {
        // Update status to uploading
        setUploadFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id ? { ...f, status: "uploading" } : f
          )
        );

        // Simulate upload progress (replace with actual R2 upload)
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise((resolve) => setTimeout(resolve, 200));
          setUploadFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id ? { ...f, progress } : f
            )
          );
        }

        // TODO: Replace with actual R2 upload
        // const formData = new FormData();
        // formData.append("file", uploadFile.file);
        // const response = await api.post("/storage/upload", formData);

        // Update status to success
        setUploadFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? { ...f, status: "success", progress: 100 }
              : f
          )
        );

        toast.success(`${uploadFile.file.name} uploaded successfully`);
      } catch (error: any) {
        setUploadFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? { ...f, status: "error", error: error.message }
              : f
          )
        );
        toast.error(`Failed to upload ${uploadFile.file.name}`);
      }
    }

    // Notify parent when all uploads complete
    const successFiles = uploadFiles.filter((f) => f.status === "success");
    if (successFiles.length > 0) {
      onUploadComplete?.(successFiles);
    }
  };

  const removeFile = (id: string) => {
    setUploadFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const clearCompleted = () => {
    setUploadFiles((prev) =>
      prev.filter((f) => f.status !== "success" && f.status !== "error")
    );
  };

  const getStatusIcon = (status: UploadFile["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      case "uploading":
        return <Upload className="h-4 w-4 text-blue-400 animate-pulse" />;
      default:
        return <File className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <Card
        {...getRootProps()}
        className={`border-2 border-dashed cursor-pointer transition-all ${
          isDragActive
            ? "border-violet-500 bg-violet-950/20"
            : "border-gray-700 hover:border-gray-600"
        }`}
      >
        <CardContent className="py-12">
          <input {...getInputProps()} />
          <div className="text-center">
            <Upload
              className={`h-12 w-12 mx-auto mb-4 ${
                isDragActive ? "text-violet-400 animate-bounce" : "text-gray-600"
              }`}
            />
            {isDragActive ? (
              <p className="text-lg text-violet-400 font-medium">
                Drop your audio files here...
              </p>
            ) : (
              <>
                <p className="text-lg text-gray-300 font-medium mb-2">
                  Drag & drop audio files here
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  or click to browse your files
                </p>
                <Button size="lg">Browse Files</Button>
                <p className="text-xs text-gray-600 mt-4">
                  Supports: MP3, WAV, FLAC, M4A, AAC, OGG (Max 100MB)
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload List */}
      {uploadFiles.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-300">
                Uploads ({uploadFiles.length})
              </h3>
              {uploadFiles.some(
                (f) => f.status === "success" || f.status === "error"
              ) && (
                <Button size="sm" variant="ghost" onClick={clearCompleted}>
                  Clear Completed
                </Button>
              )}
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin">
              <AnimatePresence mode="popLayout">
                {uploadFiles.map((uploadFile) => (
                  <motion.div
                    key={uploadFile.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getStatusIcon(uploadFile.status)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-200 truncate">
                            {uploadFile.file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(uploadFile.file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFile(uploadFile.id)}
                          disabled={uploadFile.status === "uploading"}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>

                      {uploadFile.status === "uploading" && (
                        <div className="mt-2">
                          <ProgressBar
                            value={uploadFile.progress}
                            max={100}
                            className="h-1"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {uploadFile.progress}%
                          </p>
                        </div>
                      )}

                      {uploadFile.status === "error" && uploadFile.error && (
                        <p className="text-xs text-red-400 mt-1">
                          {uploadFile.error}
                        </p>
                      )}

                      {uploadFile.status === "success" && (
                        <Badge variant="success" className="text-xs mt-1">
                          Uploaded
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

