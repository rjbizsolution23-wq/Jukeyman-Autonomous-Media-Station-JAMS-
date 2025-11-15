"use client";

import { useState } from 'react';

export default function ProductionInterface() {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState(180);
  const [genre, setGenre] = useState('lofi-hiphop');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:8000/generate/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          duration,
          genre,
          target_lufs: -14.0,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Production Studio</h2>

      <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Generate New Track</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Music Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the music you want to create..."
              className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 h-24 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Genre</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2"
              >
                <option value="lofi-hiphop">Lo-fi Hip Hop</option>
                <option value="electronic">Electronic</option>
                <option value="ambient">Ambient</option>
                <option value="pop">Pop</option>
                <option value="rock">Rock</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Duration ({duration}s)
              </label>
              <input
                type="range"
                min="30"
                max="300"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!prompt || generating}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium py-3 rounded-lg transition"
          >
            {generating ? 'Generating with 110 Agents...' : 'Generate Track 🎵'}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-green-900/20 border border-green-700 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-2 text-green-400">✅ Track Generated!</h3>
          <div className="space-y-2 text-sm">
            <p>Track ID: {result.track_id}</p>
            <p>Duration: {result.duration?.toFixed(2)}s</p>
            <p>Outputs: {result.outputs?.join(', ')}</p>
          </div>
        </div>
      )}

      {/* Waveform Placeholder */}
      <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Audio Waveform</h3>
        <div className="h-32 bg-gray-900 rounded flex items-center justify-center text-gray-500">
          Waveform visualization will appear here
        </div>
      </div>
    </div>
  );
}

