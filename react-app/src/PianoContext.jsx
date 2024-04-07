import React, { useState, useEffect, createContext } from 'react';
import axios from 'axios';

const PianoContext = createContext();

export const PianoProvider = ({ children }) => {
  const [audioFiles, setAudioFiles] = useState([]);
  const [audioResponse, setAudioResponse] = useState('')

  useEffect(() => {
    const fetchTestResponse = async () => {
      try {
        const response = await axios.get('http://localhost:4000/audio');
        setAudioResponse(response.data);
        setAudioFiles(response.data.files)
      } catch (error) {
        console.error('Error fetching test response:', error);
      }
    };

    fetchTestResponse();
  }, [setAudioResponse, setAudioFiles]);

  const files = audioFiles.map(file => ({
    name: file.split('/').pop(),
    date: new Date().toLocaleString()
  }))

  const contextValues = {
    files,
    audioFiles,
    audioResponse,
    setAudioFiles,
    setAudioResponse,
  };

  return <PianoContext.Provider value={contextValues}>{children}</PianoContext.Provider>;
};

export default PianoContext;
