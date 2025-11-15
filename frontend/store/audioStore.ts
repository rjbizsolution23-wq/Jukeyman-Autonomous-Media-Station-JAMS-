import { create } from "zustand";

export interface AudioFile {
  id: string;
  filename: string;
  url: string;
  size: number;
  duration?: number;
  format: string;
  waveform?: number[];
  tags?: string[];
  projectId?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AudioStore {
  files: AudioFile[];
  selectedFile: AudioFile | null;
  currentlyPlaying: string | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  loading: boolean;
  error: string | null;

  // Actions
  setFiles: (files: AudioFile[]) => void;
  addFile: (file: AudioFile) => void;
  removeFile: (id: string) => void;
  selectFile: (file: AudioFile | null) => void;
  play: (fileId: string) => void;
  pause: () => void;
  stop: () => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAudioStore = create<AudioStore>((set) => ({
  files: [],
  selectedFile: null,
  currentlyPlaying: null,
  isPlaying: false,
  volume: 0.7,
  currentTime: 0,
  duration: 0,
  loading: false,
  error: null,

  setFiles: (files) => set({ files }),

  addFile: (file) =>
    set((state) => ({
      files: [...state.files, file],
    })),

  removeFile: (id) =>
    set((state) => ({
      files: state.files.filter((file) => file.id !== id),
      selectedFile:
        state.selectedFile?.id === id ? null : state.selectedFile,
      currentlyPlaying:
        state.currentlyPlaying === id ? null : state.currentlyPlaying,
      isPlaying: state.currentlyPlaying === id ? false : state.isPlaying,
    })),

  selectFile: (file) => set({ selectedFile: file }),

  play: (fileId) =>
    set({
      currentlyPlaying: fileId,
      isPlaying: true,
    }),

  pause: () => set({ isPlaying: false }),

  stop: () =>
    set({
      currentlyPlaying: null,
      isPlaying: false,
      currentTime: 0,
    }),

  setVolume: (volume) => set({ volume }),

  setCurrentTime: (time) => set({ currentTime: time }),

  setDuration: (duration) => set({ duration }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),
}));

