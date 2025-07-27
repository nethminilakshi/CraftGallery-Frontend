import './MainContent.css';
import {Navigate, Route, Routes} from "react-router-dom";
import {AdminDashboardContent} from "../../pages/AdminDashboard/AdminDashboard.tsx";
import ViewCategories from "../../pages/AdminSideCategory/ViewCategories.tsx";


export function AdminMainContent() {
    return (
        <div className="main-content">
            <Routes>
                <Route index element={<Navigate to ="/admin/mainContent" replace/>}/>
                <Route path="/mainContent" element={<AdminDashboardContent/>}/>
                <Route path="/admin/categories" element={<ViewCategories/>}/>
            </Routes>
        </div>
    );
}