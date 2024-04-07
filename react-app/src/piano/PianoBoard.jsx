import React, { useState, useEffect } from "react";
import { Piano, KeyboardShortcuts, MidiNumbers } from "react-piano";
import "react-piano/dist/styles.css";
import SoundfontProvider from "./SoundFontProvider";
import NotesVisualizer from "./note-visualizer/NoteVisualizer";
import HistoryTable from "./utils/history-table/HistoryTable";
import AudioPlayer from "react-audio-player";
import axios from "axios";
import "./pianoboard.css";

function PianoBoard(props) {
  // ------------------------------ API Component -----------------------------------

  const BASE_URL = 'http://localhost:4000/'
  const [response, setResponse] = useState('');

    // Fetch response from Flask server test route
    useEffect(() => {
        const fetchTestResponse = async () => {
            try {
                const response = await axios.get('http://localhost:4000/test');
                setResponse(response.data.PORT);
                setTimeout(() => {
                  setResponse(null);
                }, 5000);
            } catch (error) {
                console.error('Error fetching test response:', error);
            }
        };

        fetchTestResponse();
    }, [setResponse]);

  // -------------------------- File Uploader && History Table--------------------------------

  const [selectedFile, setSelectedFile] = useState(null);
  const [loginDate, setLoginDate] = useState("");
  const [generated, setGenerated] = useState(false);
    
    const handleFileChange = (event) => {
      setSelectedFile(event.target.files[0]);
    };
    
    const handleGenerate = async () => {
      if (!selectedFile) {
        console.error('No file selected');
        return;
      }
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      try {
        const uploadResponse = await axios.post(`${BASE_URL}upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        console.log('File uploaded successfully:', uploadResponse.data.message);
        
        // Call the generate route
        const generateResponse = await axios.post(`${BASE_URL}generate`, {
          temp_path: uploadResponse.data.temp_path,
          file_name: selectedFile.name
        });
        
        console.log('Generation successful:', generateResponse.data.success);
        // You can set some state or display a message to indicate success
      } catch (error) {
        console.error('Error generating file:', error);
        // You can set some state or display a message to indicate error
      }
      setGenerated(true);
      setLoginDate(new Date().toLocaleDateString()) // Set generated flag to true to render HistoryTable
    };

    // -------------------------- Audio files render --------------------------------
  
    const [audioFiles, setAudioFiles] = useState([]);
    const [audioResponse, setAudioResponse] = useState('')
  
    useEffect(() => {
      const fetchTestResponse = async () => {
        try {
          const response = await axios.get('http://localhost:4000/audio');
          setAudioResponse(response.data);
          setLoginDate(new Date().toLocaleDateString())
          setAudioFiles(response.data.files)
        } catch (error) {
          console.error('Error fetching test response:', error);
        }
      };
      console.log(response.files)
  
      fetchTestResponse();
    }, [setAudioResponse, setAudioFiles]);
  
    const files = audioFiles.map(file => ({
      name: file.split('/').pop(),
      date: new Date().toLocaleDateString()
    }))
    
    // ---------------------- Piano rendering component -------------------------------
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const soundfontHostname = "https://d1pzp51pvbm36p.cloudfront.net";
    
    const [isRecording, setIsRecording] = useState(false);
    const [recordedNotes, setRecordedNotes] = useState([]);

  const noteRange = {
    first: MidiNumbers.fromNote("c4"),
    last: MidiNumbers.fromNote("f5"),
  };

  const keyboardShortcuts = KeyboardShortcuts.create({
    firstNote: noteRange.first,
    lastNote: noteRange.last,
    keyboardConfig: KeyboardShortcuts.HOME_ROW,
  });

  // Track recording start time for relative timing
  const [recordingStartTime, setRecordingStartTime] = useState(null);

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordedNotes([]); // Clear previous notes
    setRecordingStartTime(audioContext.currentTime); // Set recording start time
    setLoginDate(new Date().toLocaleString()); // Record login date
  };

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  const handleNotePlay = (midiNumber) => {
    if (isRecording) {
      const timestamp = audioContext.currentTime - recordingStartTime;
      setRecordedNotes((prevNotes) => [
        ...prevNotes,
        {
          midiNumber,
          timestamp,
          start: recordingStartTime,
          stop: audioContext.currentTime,
        },
      ]);
    }
  };

  // --------------------- Temperature Slider -------------------------
  const [temperature, setTemperature] = useState(0.7);

  // Function to handle temperature change
  const handleTemperatureChange = (event) => {
    const value = parseFloat(event.target.value);
    setTemperature(value);
  };


  console.log(response)
  console.log(audioFiles, files)
  console.log('selectedFile:', selectedFile);
console.log('isRecording:', isRecording);
console.log('recordedNotes length:', recordedNotes.length);


  return (
    <>
    {response && <div className="model-server">{response}</div> }
      <div className="piano-container">
        <NotesVisualizer notes={recordedNotes} midiRange={noteRange}/>

        <div className="inputs">
          <p>Higher temperature may result in incorrect generations</p>
          <div className="slider-container">
            <label htmlFor="temperatureSlider">Temperature</label>
            <input
              type="range"
              id="temperatureSlider"
              name="temperature"
              min={0}
              max={1.7}
              step={0.1}
              value={temperature}
              onChange={handleTemperatureChange}
            />
            <span>{temperature.toFixed(1)}</span>
          </div>
          <div className="buttons">
            <button onClick={handleStartRecording} disabled={isRecording || selectedFile !== null}>
              Start Recording
            </button>
            <button onClick={handleStopRecording} disabled={!isRecording}>
              Stop Recording
            </button>
            <button
              onClick={handleGenerate}
            >
              Generate
            </button>
          </div>
          <div className="pianoBoard">
            <SoundfontProvider
              instrumentName="acoustic_grand_piano"
              audioContext={audioContext}
              hostname={soundfontHostname}
              render={({ isLoading, playNote, stopNote }) => {
                if (isLoading) return null;

                return (
                  <Piano
                    noteRange={noteRange}
                    width={600}
                    playNote={(midiNumber) => {
                      handleNotePlay(midiNumber);
                      playNote(midiNumber);
                    }}
                    stopNote={stopNote}
                    disabled={false} // Keep the piano enabled regardless of recording state
                    keyboardShortcuts={keyboardShortcuts}
                    {...props}
                  />
                );
              }}
            />
            <p>or</p>
              <div className="drag-drop">
                <label htmlFor="fileUpload">Upload MIDI File</label>
                <input
                  type="file"
                  id="fileUpload"
                  accept="*"
                  onChange={handleFileChange}
                />
              </div>
          </div>
        </div>

        <div className="horizontal"></div>
        <div className="generated-content">
          <p className="heading">Generated Audio <span>Files!</span></p>
          <div className="audio-container">
          {audioFiles.map((fileUrl, index) => (
    <div key={index} className="audio-player-wrapper">
      <AudioPlayer
        src={`${BASE_URL}${fileUrl}`}
        controls
        className="audio-player"
      />
      <p>{fileUrl.split('/').pop()}</p>
    </div>
  ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default PianoBoard;