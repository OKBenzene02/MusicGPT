import "./app.css"
import PianoBoard from "./piano/PianoBoard";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";

import { PianoProvider } from './PianoContext';
import Navigation from "./components/header/Navigation";
import HistoryTable from "./piano/utils/history-table/HistoryTable";
import Main from "./pages/main/Main";
import Contact from "./pages/contact/Contact";
import Footer from './components/footer/Footer.jsx'



function App() {

  return (
    <>
    
      <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/play" element={<PianoProvider><PianoBoard /></PianoProvider>} />
        <Route path="/history" element={<PianoProvider><HistoryTable /></PianoProvider>} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      <Footer />
    </Router>
    </>
  );
}

export default App;
