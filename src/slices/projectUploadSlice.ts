// projectUploadSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import {backendApi} from "../api.ts";

// Types
export interface Project {
    _id?: string;
    id: string;
    title: string;
    category: string;
    description: string;
    materials: string[];
    steps: string[];
    imageUrl?: string;
    author: string;
    uploadedUserEmail: string;
    createdAt: string;
    updatedAt?: string;
}

export interface ApiErrorResponse {
    success: boolean;
    message: string;
    error?: string;
}

export interface ApiSuccessResponse<T> {
    success: boolean;
    message?: string;
    project?: T;
    projects?: T[];
}

export interface ProjectUploadState {
    loading: boolean;
    error: string | null;
    success: boolean;
    uploadedProject: Project | null;
}

const initialState: ProjectUploadState = {
    loading: false,
    error: null,
    success: false,
    uploadedProject: null,

};

// Helper function to extract error message
const getErrorMessage = (error: unknown): string => {
    if (error instanceof AxiosError) {
        const apiError = error.response?.data as ApiErrorResponse;
        return apiError?.message || error.message || 'An error occurred';
    }

    if (error instanceof Error) {
        return error.message;
    }

    if (typeof error === 'string') {
        return error;
    }

    return 'An unknown error occurred';
};

// Upload Project Async Thunk
export const uploadProject = createAsyncThunk<
    Project,
    Omit<Project, '_id' | 'createdAt' | 'updatedAt'>,
    { rejectValue: string }
>(
    'projectUpload/uploadProject',
    async (projectData, { rejectWithValue }) => {
        try {
            const response = await backendApi.post<ApiSuccessResponse<Project>>('/project/save', {
                ...projectData,
                createdAt: new Date().toISOString(),
            });

            return response.data.project || response.data as unknown as Project;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

// Slice
const projectUploadSlice = createSlice({
    name: 'projectUpload',
    initialState,
    reducers: {
        clearUploadState: (state) => {
            state.loading = false;
            state.error = null;
            state.success = false;
            state.uploadedProject = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        resetSuccess: (state) => {
            state.success = false;
        },
    },
    extraReducers: (builder) => {
        // Upload Project
        builder
            .addCase(uploadProject.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(uploadProject.fulfilled, (state, action: PayloadAction<Project>) => {
                state.loading = false;
                state.success = true;
                state.uploadedProject = action.payload;
            })
            .addCase(uploadProject.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Upload failed';
                state.success = false;
            });
    },
});

export const { clearUploadState, clearError, resetSuccess } = projectUploadSlice.actions;
export default projectUploadSlice.reducer;