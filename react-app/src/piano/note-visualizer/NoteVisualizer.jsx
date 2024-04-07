import React from "react";
import "./noteVisual.css";

const NotesVisualizer = ({
  notes,
  midiRange,
  defaultDuration = 0.5,
  offset = 0,
  durationFactor = 100
}) => {
  const notesToRender = notes.filter(
    note => Math.abs(note.timestamp * durationFactor) <= 2000
  );

  const noteOffsets = {};

  return (
    <div className="grid-container">
      {Array.from(
        { length: midiRange.last - midiRange.first + 1 },
        (_, index) => {
          const midiNumber = index + midiRange.first;
          const key = `row-${midiNumber}`;

          const notesForMidi = sortNotes(
            notesToRender.filter(note => note.midiNumber === midiNumber)
          );

          return (
            <div key={key} className="grid-row">
              <div className="label-column">{midiNumber}</div>
              <div className="grid-column">
                {notesForMidi.map((note, noteIndex) => {
                  const duration = note.stop * durationFactor;
                  const width = duration;

                  const noteOffset = noteOffsets[note.id] || 0;
                  noteOffsets[note.id] = noteOffset + width;

                  return (
                    <div
                      key={noteIndex}
                      className="note"
                      style={{
                        left: `${noteOffset}px`,
                        position: "absolute",
                        height: "100%",
                        width: `${width}px`,
                        backgroundColor: "var(--primary)",
                        border: "1.5px solid #000",
                        borderRadius: ".4rem",
                        zIndex: 1
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        }
      )}
    </div>
  );
};

const sortNotes = notes => {
  return notes.sort((a, b) => a.timestamp - b.timestamp);
};

export default NotesVisualizer;
