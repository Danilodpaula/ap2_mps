import { createContext, useContext, useState } from "react";
import { login as loginApi } from "../api";
import type { User } from "../types/models";

/* -------- helpers p/ LocalStorage --------- */
const KEY = "tw-lite-user";
const TTL = 10 * 60 * 1000; // 10 min → ms

interface Stored {
  data: User;
  ts: number;
}
const loadUser = (): User | null => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw) as Stored;
    return Date.now() - ts < TTL ? data : null; // válido?
  } catch {
    return null;
  }
};
const saveUser = (u: User) =>
  localStorage.setItem(KEY, JSON.stringify({ data: u, ts: Date.now() }));

/* -------- Contexto --------- */
interface AuthCtx {
  user: User | null;
  login: (username: string) => Promise<void>;
}
const Ctx = createContext<AuthCtx>({} as AuthCtx);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  /* inicia já com o valor do localStorage */
  const [user, setUser] = useState<User | null>(loadUser);

  const login = async (username: string) => {
    const u = await loginApi(username);
    setUser(u);
    saveUser(u);
  };

  return <Ctx.Provider value={{ user, login }}>{children}</Ctx.Provider>;
};

export const useAuth = () => useContext(Ctx);
