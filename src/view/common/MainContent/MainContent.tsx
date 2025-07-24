import './MainContent.css';
import {Route, Routes} from "react-router-dom";
import {Home} from "../../pages/Home/Home.tsx";
import {Contact} from "../../pages/Contact/Contact.tsx";
import ViewProjects from "../../pages/ViewProjects/ViewProjects.tsx";
import SingleProjectPage from "../../pages/ViewProjects/SingleProjectPage.tsx";
import ProjectUploadForm from "../../pages/AddProjects/ProjectUploadForm.tsx";

export function MainContent() {
    return (
        <div className="main-content">
            <Routes>
                <Route path="/" element={<Home />}/>
                <Route path="/addProjects" element={<ProjectUploadForm/>}/>
                <Route path="/category/:category" element={<ViewProjects/>}/>
                <Route path="/project/:id" element={<SingleProjectPage />} />
                <Route path="/contact" element={<Contact/>}/>
            </Routes>
        </div>
    );
}