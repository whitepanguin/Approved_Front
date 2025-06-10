// store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./modules";

export const store = configureStore({
  reducer: rootReducer,
});

// TypeScript용 타입 추출
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
