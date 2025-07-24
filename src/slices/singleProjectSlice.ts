import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchProjectById = createAsyncThunk(
    'project/getProjectById',
    async (id: string) => {
        const response = await axios.get(`/api/project/${id}`);
        return response.data;
    }
);

interface Project {
    id: string;
    title: string;
    description: string;
    materials: string;
    steps: string;
    image: string;
    createdAt: string;
    category: string;
    author: string;
    uploadedUserEmail: string;
}

interface SingleProjectState {
    project: Project | null;
    loading: boolean;
    error: string | null;
}

const initialState: SingleProjectState = {
    project: null,
    loading: false,
    error: null,
};

const singleProjectSlice = createSlice({
    name: 'singleProject',
    initialState,
    reducers: {},
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
            });
    },
});

export default singleProjectSlice.reducer;