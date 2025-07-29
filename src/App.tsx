import './App.css';
import {DefaultLayout} from "./view/common/DefaultLayout/DefaultLayout.tsx";
import {Login} from "./view/pages/Login/Login.tsx";
import Register from "./view/pages/SignUp/Register.tsx";
import {BrowserRouter, Route, Routes,} from "react-router-dom";
import {AdminDefaultLayout} from "./view/common/DefaultLayout/AdminDefaultLayout.tsx";
function App() {

    return(
<BrowserRouter>
            <Routes>
                <Route path="/admin/*" element={<AdminDefaultLayout />}></Route>
                <Route path="/*" element={<DefaultLayout />}></Route>
                <Route path="/login" element={<Login />}></Route>
                <Route path="/register" element={< Register/>}></Route>
            </Routes>
</BrowserRouter>

    );
}
export default App;