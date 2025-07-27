import {AdminMainContent} from "../MainContent/AdminMainContent.tsx";
import AdminSidebar from "../SideBar/AdminSideBar.tsx";

export function AdminDefaultLayout() {

    return (
        <>
            <div className="flex min-h-screen bg-gray-100">
                {/* Sidebar */}
                <aside className="w-64 bg-white shadow-lg">
                    <AdminSidebar/>
                </aside>
                    <AdminMainContent/>
            </div>
        </>
    );
}