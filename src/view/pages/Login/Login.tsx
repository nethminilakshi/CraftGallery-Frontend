import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { backendApi } from "../../../api.ts";
import {getUserFromToken} from "../../../Auth/auth.ts";
import type {UserData} from "../../../model/userData.ts";
import {Palette} from "lucide-react";

type FormData = {
    email: string;
    password: string;
};

export function Login() {
    const navigate = useNavigate();
    const { register, handleSubmit } = useForm<FormData>();

    const authenticateUser = async (data: FormData) => {
        try {
            const userCredentials = {
                email: data.email,
                password: data.password
            };

            const response = await backendApi.post('/auth/login', userCredentials);
            const accessToken = response.data.accessToken;
            const refreshToken = response.data.refreshToken;

            localStorage.setItem('token', accessToken);
            localStorage.setItem('refreshToken', refreshToken);


            const user :UserData = getUserFromToken(accessToken);
            localStorage.setItem('username', user.username as string)
            localStorage.setItem('role', user.role as string);

            alert("Successfully logged in!");
            navigate('/');
        } catch (error) {
            console.error(error);
            alert("Login failed");
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">

            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>

            <div className="absolute top-20 left-20 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-600/10 rounded-full blur-2xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-indigo-600/5 rounded-full blur-3xl"></div>

            <div className="relative w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                        <Palette className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-1">Welcome Back</h1>
                    <p className="text-gray-400 text-sm">Sign in to your account</p>
                </div>
                <div className="mt-1 mb-4">
                    <button onClick={() => navigate("/")}
                            className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
                        Go Back
                    </button>
                </div>
                <form className="space-y-4" onSubmit={handleSubmit(authenticateUser)}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                            Email
                        </label>
                        <input
                            type="text"
                            id="email"
                            {...register("email")}
                            className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                            placeholder="Enter your email"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            {...register("password")}
                            className="w-full pl-10 pr-12 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        Sign In
                    </button>


                    <div className="text-center mt-6 pt-6 border-t border-gray-700/50">
                        <p className="text-gray-400 text-sm">
                            Don't have an account?{' '}
                            <a href="/register" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                                Create one now
                            </a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
