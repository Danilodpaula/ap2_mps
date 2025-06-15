import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const { login } = useAuth();
  const nav = useNavigate();

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(username.trim() || "anon");
    nav("/");
  };

  return (
    <form onSubmit={handle} className="centered-box">
      <h1>Entrar</h1>
      <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Nome" />
      <input type="password" placeholder="Senha (qualquer)" />
      <button type="submit">Login</button>
    </form>
  );
};
export default LoginPage;
