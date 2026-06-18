"use client";

import React from "react";
import { init, RematchRootState } from "@rematch/core";
import { Provider } from "react-redux";
import { models, RootModel } from "@/models";

const store = init({
  models,
});

export type Store = typeof store;
export type RootState = RematchRootState<RootModel>;

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
