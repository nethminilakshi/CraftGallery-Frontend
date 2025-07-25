import './App.css';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {DefaultLayout} from "./view/common/DefaultLayout/DefaultLayout.tsx";
import {Login} from "./view/pages/Login/Login.tsx";
import Register from "./view/pages/SignUp/Register.tsx";
function App() {
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/*" element={<DefaultLayout />}></Route>
                <Route path="/login" element={<Login />}></Route>
                <Route path="/register" element={< Register/>}></Route>
            </Routes>
        </BrowserRouter>
    );
}
export default App;