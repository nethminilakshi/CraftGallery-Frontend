import './App.css';
import {DefaultLayout} from "./view/common/DefaultLayout/DefaultLayout.tsx";
import {Login} from "./view/pages/Login/Login.tsx";
import Register from "./view/pages/SignUp/Register.tsx";
import {BrowserRouter, Route, Routes,} from "react-router-dom";
function App() {

    // const navigate = useNavigate()
    //
    // useEffect(() =>{
    //     const token = localStorage.getItem('token');
    //     if(!token || isTokenExpired(token)){
    //         localStorage.removeItem('token')
    //         localStorage.removeItem(('refreshToken'))
    //         navigate('/login');
    //     }
    // })

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