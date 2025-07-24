import {combineReducers} from "redux";

import homeReducer from "./homeSlice.ts";
import projectsReducer from "./projectBycategorySlice.ts";
import singleProjectReducer from "./singleProjectSlice.ts";

export const rootReducer = combineReducers({

    categories: homeReducer,
    projects : projectsReducer,
    singleProject: singleProjectReducer
});

export type RootState = ReturnType<typeof rootReducer>;