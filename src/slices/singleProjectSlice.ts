import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchProjectById = createAsyncThunk(
    'project/getProjectById',
    async (id: string) => {
        const response = await axios.get(`/api/project/${id}`);
        return response.data;
    }
);

export const deleteProjectById = createAsyncThunk(
    'project/deleteProjectById',
    async (id: string) => {
        const response = await axios.delete(`/api/project/delete/${id}`);
        return { id, data: response.data };
    }
);

interface Project {
    id: string;
    title: string;
    description: string;
    materials: string;
    steps: string;
    imageUrl: string;
    createdAt: string;
    category: string;
    author: string;
    uploadedUserEmail: string;
}

interface SingleProjectState {
    project: Project | null;
    loading: boolean;
    error: string | null;
    deleteLoading: boolean;
    deleteError: string | null;
    isDeleted: boolean;
}

const initialState: SingleProjectState = {
    project: null,
    loading: false,
    error: null,
    deleteLoading: false,
    deleteError: null,
    isDeleted: false,
};

const singleProjectSlice = createSlice({
    name: 'singleProject',
    initialState,
    reducers: {
        clearDeleteState: (state) => {
            state.deleteLoading = false;
            state.deleteError = null;
            state.isDeleted = false;
        },
        resetProjectState: (state) => {
            state.project = null;
            state.loading = false;
            state.error = null;
            state.deleteLoading = false;
            state.deleteError = null;
            state.isDeleted = false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProjectById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProjectById.fulfilled, (state, action: PayloadAction<Project>) => {
                state.loading = false;
                state.project = action.payload;
            })
            .addCase(fetchProjectById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message ?? 'Something went wrong';
            })
            .addCase(deleteProjectById.pending, (state) => {
                state.deleteLoading = true;
                state.deleteError = null;
            })
            .addCase(deleteProjectById.fulfilled, (state) => {
                state.deleteLoading = false;
                state.isDeleted = true;
                state.project = null; // Clear project after successful deletion
            })
            .addCase(deleteProjectById.rejected, (state, action) => {
                state.deleteLoading = false;
                state.deleteError = action.error.message ?? 'Failed to delete project';
            });
    },
});

export const { clearDeleteState } = singleProjectSlice.actions;
export default singleProjectSlice.reducer;