import './MainContent.css';
import {Navigate, Route, Routes} from "react-router-dom";
import {AdminDashboardContent} from "../../pages/AdminDashboard/AdminDashboard.tsx";
import ViewCategories from "../../pages/ManageCategories/ViewCategories.tsx";
import ViewUsers from "../../pages/ManageUsers/ViewUsers.tsx";


export function AdminMainContent() {
    return (
        <div className="main-content">
            <Routes>
                <Route index element={<Navigate to ="/admin/mainContent" replace/>}/>
                <Route path="/mainContent" element={<AdminDashboardContent/>}/>
                <Route path="categories" element={<ViewCategories/>}/>
                <Route path="users" element={<ViewUsers/>}/>
            </Routes>
        </div>
    );
}