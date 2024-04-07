import React, { useContext } from "react";
import PianoContext from "../../../PianoContext.jsx";
import "./history.css";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

const HistoryTable = () => {
  const { files, setAudioFiles } = useContext(PianoContext);

  const handleDelete = (index) => {
    setAudioFiles((prevFiles) => {
      const updatedFiles = [...prevFiles];
      updatedFiles.splice(index, 1);
      return updatedFiles;
    });
  };

  return (
    <div className="table-container">
      <h2>Track Your Generations <span>Here!</span></h2>
      <table className="history-table">
        <thead>
          <tr>
            <th>Login Date</th>
            <th>Track Produced</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {files.length > 0 ? (
            files.map((file, index) => (
              <tr key={index}>
                <td>{file.date}</td>
                <td>{file.name}</td>
                <td>
                  <DeleteForeverIcon onClick={() => handleDelete(index)} style={{ cursor: 'pointer'}}/>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="no-data">
                No Data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default HistoryTable;
