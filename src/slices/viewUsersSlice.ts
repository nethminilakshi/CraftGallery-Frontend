import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import {backendApi} from "../api.ts";

export interface UserDTO {
    id?: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface UsersState {
    users: UserDTO[];
    loading: boolean;
    error: string | null;
    selectedUser: UserDTO | null;
}

const initialState: UsersState = {
    users: [],
    loading: false,
    error: null,
    selectedUser: null,
};

export const fetchUsers = createAsyncThunk(
    'users/fetchUsers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await backendApi.get('/user/all');
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch users'
            );
        }
    }
);

export const deleteUser = createAsyncThunk(
    'users/deleteUser',
    async (id: number, { rejectWithValue }) => {
        try {
            await backendApi.delete(`/user/delete/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to delete user'
            );
        }
    }
);

const viewUserSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setSelectedUser: (state, action: PayloadAction<UserDTO | null>) => {
            state.selectedUser = action.payload;
        },
        clearSelectedUser: (state) => {
            state.selectedUser = null;
        },
        resetUsersState: (state) => {
            state.users = [];
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(deleteUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.loading = false;
                state.users = state.users.filter(user => user.id !== action.payload);
                if (state.selectedUser && state.selectedUser.id === action.payload) {
                    state.selectedUser = null;
                }
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    clearError,
    setSelectedUser,
    clearSelectedUser,
} = viewUserSlice.actions;

export default viewUserSlice.reducer;
