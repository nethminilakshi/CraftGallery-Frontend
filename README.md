# 🎨 Art and Craft Gallery

A modern, full-stack web application for showcasing and managing art and craft projects.  
Built with **React**, **TypeScript**, and **Express.js**, this platform provides a comprehensive solution for **artists**, **art enthusiasts**, and **gallery administrators**.

---

## 📸 Screenshots  

### 🛡️ Admin Side :
<img width="1349" height="637" alt="Admin Screenshot 1" src="https://github.com/user-attachments/assets/1b3ba446-5311-4f9f-ac3f-2a060711a289" />  
<img width="1347" height="642" alt="Admin Screenshot 2" src="https://github.com/user-attachments/assets/5d870cad-e207-4ea9-8bb7-3dda6a88ba73" />  

### 👥 User Side : 
<img width="1350" height="637" alt="User Screenshot 1" src="https://github.com/user-attachments/assets/bc693320-2631-4e1a-b8ad-22513cf7098b" />  


### 🎯 Artist Side :
<img width="1351" height="638" alt="Artist Screenshot 1" src="https://github.com/user-attachments/assets/184f8d27-9150-47ce-8172-f4c07ec98099" />
<img width="1351" height="637" alt="Artist Screenshot 2" src="https://github.com/user-attachments/assets/7ac28cff-91b1-4810-be5d-e70dc5f890d2" />
<img width="1148" height="637" alt="Artist Screenshot 3" src="https://github.com/user-attachments/assets/f031bdd6-f1e0-4f89-8df6-224794792bce" />
<img width="1351" height="637" alt="Artist Screenshot 4" src="https://github.com/user-attachments/assets/ad16b19a-452f-42f4-ba78-3d21d953733c" />  
<img width="1347" height="637" alt="Artist Screenshot 5" src="https://github.com/user-attachments/assets/1e2ce765-7d76-4765-b921-bb126bd77582" />  
<img width="1352" height="639" alt="Artist Screenshot 6" src="https://github.com/user-attachments/assets/438bda6c-704a-42ea-8f4c-6318c6654c38" />  

---


## ✨ Key Features  

### 🎯 For Artists  
- **Project Upload** – Easy artwork submission with detailed descriptions  
- **Portfolio Management** – Personal dashboard to manage artworks  
- **Real-time Editing** – Update project details instantly  
- **Category Organization** – Organize works by art categories  

### 👥 For Users  
- **Browse Gallery** – Explore artworks by categories  
- **Detailed Views** – View complete project information and steps  
- **User Authentication** – Secure login/registration system  
- **Responsive Design** – Optimized for all devices  

### 🛡️ For Administrators  
- **User Management** – Control user accounts and permissions  
- **Category Management** – Add, edit, and organize categories  
- **Content Moderation** – Review and manage uploaded content  
- **Analytics Dashboard** – Track platform usage and engagement  

---

## 🚀 Tech Stack  

### 🎨 Frontend  
- **React 18** – Modern UI library  
- **TypeScript** – Type-safe JavaScript  
- **Redux Toolkit** – State management  
- **React Router** – Navigation  
- **Tailwind CSS** – Utility-first styling  
- **Vite** – Fast build tool  
- **Lucide React** – Beautiful icons  

### ⚙️ Backend  
- **Node.js** – Runtime environment  
- **Express.js** – Web framework  
- **TypeScript** – Type safety  
- **JWT** – Authentication  
- **CORS** – Cross-origin requests  
- **bcrypt** – Password hashing  

### 🗄️ Database  
- **MongoDB** – Document database  
- **Mongoose** – ODM for MongoDB  

---

## 🔒 Authentication & Security
- **JWT Tokens – Secure authentication
- **Role-based Access – Admin, Artist, User roles
- **Session Management – 24-hour token expiry
- **CORS Protection – Configured origins
- **Input Validation – Server-side validation
- **Password Hashing – bcrypt encryption

---

## 📁 Project Structure  

```bash
art-and-craft-gallery/
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── store/             # Redux store configuration
│   │   ├── slices/            # Redux slices
│   │   ├── model/             # TypeScript interfaces
│   │   ├── Auth/              # Authentication utilities
│   │   └── api.ts             # API configuration
│   ├── public/                # Static assets
│   └── package.json
├── backend/                    # Express backend
│   ├── src/
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Custom middleware
│   │   ├── models/            # Database models
│   │   ├── controllers/       # Route handlers
│   │   └── app.ts             # Express app configuration
│   └── package.json
└── README.md

