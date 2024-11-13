import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Home from "./pages";
import Summary from "./pages/summary";

function App() {
    return (
        <Router>
            <Routes>
                <Route exact path="/" element={<Home />}></Route>
                <Route path="/summary" element={<Summary />}></Route>
            </Routes>
        </Router>
    );
}

export default App;