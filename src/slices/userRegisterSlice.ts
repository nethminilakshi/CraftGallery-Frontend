import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { backendApi } from '../api.ts';

// Types
export interface UserDto {
    id?: string;
    email: string;
    firstName: string;
    lastName: string;
    password?: string;
    role: 'USER' | 'ADMIN';
}

interface UserRegisterState {
    loading: boolean;
    error: string | null;
    success: boolean;
    registeredUser: UserDto | null;
}

const initialState: UserRegisterState = {
    loading: false,
    error: null,
    success: false,
    registeredUser: null,
};

const getErrorMessage = (error: unknown): string => {
    if (error instanceof AxiosError) {
        const data = error.response?.data as { message?: string; error?: string };
        return data?.message || data?.error || error.message;
    }
    return (error as Error).message || 'An unknown error occurred';
};

export const registerUser = createAsyncThunk<
    UserDto,
    Omit<UserDto, 'id'>,
    { rejectValue: string }
>(
    'userRegister/registerUser',
    async (userData, { rejectWithValue }) => {
        try {
            console.log('Making API call to register user:', userData);

            const response = await backendApi.post('/user/save', userData);
            console.log('API Response:', response.data);

            if (response.data.success && response.data.user) {
                return response.data.user;
            } else if (response.data.user) {
                return response.data.user;
            } else if (response.data.id) {
                return response.data as UserDto;
            } else {
                console.error('Unexpected response format:', response.data);
                return rejectWithValue('Unexpected response format from server');
            }
        } catch (error) {
            console.error('Registration API error:', error);

            if (error instanceof AxiosError) {
                console.error('Error response:', error.response?.data);
                console.error('Error status:', error.response?.status);
            }

            return rejectWithValue(getErrorMessage(error));
        }
    }
);

const userRegisterSlice = createSlice({
    name: 'userRegister',
    initialState,
    reducers: {
        clearUserRegisterState: (state) => {
            state.loading = false;
            state.error = null;
            state.success = false;
            state.registeredUser = null;
        },
        clearRegisterError: (state) => {
            state.error = null;
        },
        resetRegisterSuccess: (state) => {
            state.success = false;
        },
        setValidationError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
                console.log('Registration pending...');
            })
            .addCase(registerUser.fulfilled, (state, action: PayloadAction<UserDto>) => {
                state.loading = false;
                state.success = true;
                state.registeredUser = action.payload;
                console.log('Registration successful:', action.payload);
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'User registration failed';
                state.success = false;
                console.error('Registration failed:', action.payload);
            });
    },
});

export const {
    clearUserRegisterState,
    clearRegisterError,
    resetRegisterSuccess,
    setValidationError
} = userRegisterSlice.actions;

export default userRegisterSlice.reducer;