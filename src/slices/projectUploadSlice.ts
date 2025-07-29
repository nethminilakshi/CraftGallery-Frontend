import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import {backendApi} from "../api.ts";

export interface Project {
    _id?: string;
    id: string;
    title: string;
    category: string;
    description: string;
    materials: string[];
    steps: string[];
    imageUrl: string;
    author: string;
    uploadedUserEmail: string;
    createdAt: Date | string;
}

export interface ApiErrorResponse {
    success?: boolean;
    error: string;
    message?: string;
}

export interface ApiSuccessResponse<T> {
    success: boolean;
    message: string;
    project: T;
}

export interface ProjectUploadState {
    loading: boolean;
    error: string | null;
    success: boolean;
    uploadedProject: Project | null;
    emailSent: boolean;
    successMessage: string | null;
}

const initialState: ProjectUploadState = {
    loading: false,
    error: null,
    success: false,
    uploadedProject: null,
    emailSent: false,
    successMessage: null,
};

const getErrorMessage = (error: unknown): string => {
    if (error instanceof AxiosError) {
        const apiError = error.response?.data as ApiErrorResponse;
        return apiError?.error || apiError?.message || error.message || 'An error occurred';
    }

    if (error instanceof Error) {
        return error.message;
    }

    if (typeof error === 'string') {
        return error;
    }

    return 'An unknown error occurred';
};

export const uploadProject = createAsyncThunk<
    ApiSuccessResponse<Project>,
    Omit<Project, '_id' | 'createdAt' | 'id'>,
    { rejectValue: string }
>(
    'projectUpload/uploadProject',
    async (projectData, { rejectWithValue }) => {
        try {
            const response = await backendApi.post<ApiSuccessResponse<Project>>('/project/save', {
                title: projectData.title,
                category: projectData.category,
                description: projectData.description,
                materials: projectData.materials,
                steps: projectData.steps,
                imageUrl: projectData.imageUrl,
                author: projectData.author,
                uploadedUserEmail: projectData.uploadedUserEmail
            });

            return response.data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const updateProject = createAsyncThunk<
    ApiSuccessResponse<Project>,
    { id: string; updateData: Partial<Project> },
    { rejectValue: string }
>(
    'projectUpload/updateProject',
    async ({ id, updateData }, { rejectWithValue }) => {
        try {
            const response = await backendApi.put<ApiSuccessResponse<Project>>(`/project/update/${id}`, updateData);
            return response.data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const testEmail = createAsyncThunk<
    { success: boolean; message: string },
    string,
    { rejectValue: string }
>(
    'projectUpload/testEmail',
    async (email, { rejectWithValue }) => {
        try {
            const response = await backendApi.post('/project/test-email', { email });
            return response.data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

const projectUploadSlice = createSlice({
    name: 'projectUpload',
    initialState,
    reducers: {
        clearUploadState: (state) => {
            state.loading = false;
            state.error = null;
            state.success = false;
            state.uploadedProject = null;
            state.emailSent = false;
            state.successMessage = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        resetSuccess: (state) => {
            state.success = false;
            state.emailSent = false;
            state.successMessage = null;
        },
        setEmailSent: (state, action: PayloadAction<boolean>) => {
            state.emailSent = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(uploadProject.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
                state.emailSent = false;
                state.successMessage = null;
            })
            .addCase(uploadProject.fulfilled, (state, action: PayloadAction<ApiSuccessResponse<Project>>) => {
                state.loading = false;
                state.success = true;
                state.uploadedProject = action.payload.project;
                state.successMessage = action.payload.message;
                state.emailSent = action.payload.message.toLowerCase().includes('email');
            })
            .addCase(uploadProject.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Upload failed';
                state.success = false;
                state.emailSent = false;
            })
        // Update Project
        builder
            .addCase(updateProject.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateProject.fulfilled, (state, action: PayloadAction<ApiSuccessResponse<Project>>) => {
                state.loading = false;
                state.success = true;
                state.uploadedProject = action.payload.project;
                state.successMessage = action.payload.message;
                state.emailSent = action.payload.message.toLowerCase().includes('email');
            })
            .addCase(updateProject.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Update failed';
            })
        // Test Email
        builder
            .addCase(testEmail.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(testEmail.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = action.payload.message;
            })
            .addCase(testEmail.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Test email failed';
            });
    },
});

export const { clearUploadState, clearError } = projectUploadSlice.actions;
export default projectUploadSlice.reducer;