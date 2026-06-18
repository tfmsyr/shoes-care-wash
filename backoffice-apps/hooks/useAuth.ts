"use client";
import { useSelector, useDispatch } from "react-redux";
import { RootState, Dispatch } from "@/lib/store";

export const useAuth = () => {
  const { user, pendingUser, token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<Dispatch>(); // <- ini penting!
  return { user, pendingUser, token, dispatch };
};
