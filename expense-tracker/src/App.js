import {lazy, Suspense} from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Home from "./pages";

function App() {
    const Summary = lazy(() => import("./pages/summary"));
    return (
        <Router>
            <Routes>
                <Route exact path="/" element={<Home />}></Route>
                <Route path="/summary" element={
                    <Suspense>
                        <Summary />
                    </Suspense>
                }></Route>
            </Routes>
        </Router>
    );
}

export default App;