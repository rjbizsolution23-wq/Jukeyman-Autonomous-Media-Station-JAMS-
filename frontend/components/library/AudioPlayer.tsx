"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Slider } from "@/components/ui/Slider";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Download,
  Repeat,
  Shuffle,
} from "lucide-react";

interface AudioPlayerProps {
  audioFile?: {
    id: string;
    name: string;
    url: string;
    duration?: number;
    size?: number;
    format?: string;
  };
}

export function AudioPlayer({ audioFile }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [volume, setVolume] = React.useState(0.7);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isRepeat, setIsRepeat] = React.useState(false);
  const [isShuffle, setIsShuffle] = React.useState(false);

  const waveformRef = React.useRef<HTMLDivElement>(null);
  const wavesurferRef = React.useRef<any>(null);

  // Initialize WaveSurfer
  React.useEffect(() => {
    if (!audioFile || !waveformRef.current) return;

    const initWaveSurfer = async () => {
      const WaveSurfer = (await import("wavesurfer.js")).default;

      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }

      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current!,
        waveColor: "#4a5568",
        progressColor: "#8b5cf6",
        cursorColor: "#a78bfa",
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
        height: 80,
        normalize: true,
        backend: "WebAudio",
      });

      wavesurferRef.current.load(audioFile.url);

      wavesurferRef.current.on("ready", () => {
        setDuration(wavesurferRef.current.getDuration());
      });

      wavesurferRef.current.on("audioprocess", () => {
        setCurrentTime(wavesurferRef.current.getCurrentTime());
      });

      wavesurferRef.current.on("play", () => {
        setIsPlaying(true);
      });

      wavesurferRef.current.on("pause", () => {
        setIsPlaying(false);
      });

      wavesurferRef.current.on("finish", () => {
        if (isRepeat) {
          wavesurferRef.current.play();
        } else {
          setIsPlaying(false);
        }
      });
    };

    initWaveSurfer();

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
    };
  }, [audioFile?.url]);

  const togglePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
      // State will update via wavesurfer events
    }
  };

  const handleSeek = (value: number[]) => {
    if (wavesurferRef.current) {
      const seekTime = (value[0] / 100) * duration;
      wavesurferRef.current.seekTo(seekTime / duration);
      setCurrentTime(seekTime);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    setVolume(newVolume);
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(newVolume);
    }
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (wavesurferRef.current) {
      if (isMuted) {
        wavesurferRef.current.setVolume(volume);
        setIsMuted(false);
      } else {
        wavesurferRef.current.setVolume(0);
        setIsMuted(true);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!audioFile) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Play className="h-12 w-12 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">Select an audio file to play</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky bottom-0">
      <CardContent className="p-4 space-y-4">
        {/* Track Info */}
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-100 truncate">
              {audioFile.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              {audioFile.format && (
                <Badge variant="outline" className="text-xs">
                  {audioFile.format.toUpperCase()}
                </Badge>
              )}
              {audioFile.size && (
                <span className="text-xs text-gray-500">
                  {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              )}
            </div>
          </div>
          <Button size="sm" variant="ghost">
            <Download className="h-4 w-4" />
          </Button>
        </div>

        {/* Waveform */}
        <div ref={waveformRef} className="w-full bg-black/20 rounded-lg" />

        {/* Progress */}
        <div className="space-y-2">
          <Slider
            value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
            onValueChange={handleSeek}
            max={100}
            step={0.1}
            className="w-full"
          />
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={isShuffle ? "primary" : "ghost"}
              onClick={() => setIsShuffle(!isShuffle)}
            >
              <Shuffle className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="primary" onClick={togglePlayPause}>
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
            <Button size="sm" variant="ghost">
              <SkipForward className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={isRepeat ? "primary" : "ghost"}
              onClick={() => setIsRepeat(!isRepeat)}
            >
              <Repeat className="h-4 w-4" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2 w-32">
            <Button size="sm" variant="ghost" onClick={toggleMute}>
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume * 100]}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              className="flex-1"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

