import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query/react";

import projectApi from "./rtk-apis/api.config";

export const store = configureStore({
  reducer: {
    [projectApi.reducerPath]: projectApi.reducer,
  },

  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(projectApi.middleware),
});

setupListeners(store.dispatch);
