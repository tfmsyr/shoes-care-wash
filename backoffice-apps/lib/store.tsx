"use client";
import { init, RematchDispatch, RematchRootState } from "@rematch/core";
import { Provider } from "react-redux"; 
import { models, RootModel } from "@/models";

export const store = init({ models });

export type Store = typeof store;
export type Dispatch = RematchDispatch<RootModel>;
export type RootState = RematchRootState<RootModel>;

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>; // ✅ JSX
}
