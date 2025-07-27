import {combineReducers} from "redux";

import homeReducer from "./homeSlice.ts";
import projectsReducer from "./projectBycategorySlice.ts";
import singleProjectReducer from "./singleProjectSlice.ts";
import projectUploadSlice from "./projectUploadSlice.ts";
import userRegisterSlice from "./userRegisterSlice.ts";
import viewCategorySlice from "./viewCategorySlice.ts";

export const rootReducer = combineReducers({

    categories: homeReducer,
    projects : projectsReducer,
    singleProject: singleProjectReducer,
    projectUpload: projectUploadSlice,
    userRegister: userRegisterSlice,
    adminCategories: viewCategorySlice

});

export type RootState = ReturnType<typeof rootReducer>;