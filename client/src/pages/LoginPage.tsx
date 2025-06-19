import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [formFadeOut, setFormFadeOut] = useState(false);
  const [imageOpacity, setImageOpacity] = useState(0); // Novo estado para controlar a opacidade da imagem
  const { login } = useAuth();
  const nav = useNavigate();

  // Crie um estado para armazenar o áudio
  const [audio] = useState(new Audio("/a-risada-que-todos-mains-adcs-temem-bmccqfglzbk_h8i9o46j.mp3")); // Defina o caminho do áudio

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    setFormFadeOut(true); // Inicia o fade out do formulário

    // 1. Espera a animação de fade out do formulário terminar
    setTimeout(() => {
      setShowImage(true); // Prepara a imagem para aparecer
      audio.play(); // Começa a tocar o áudio

      // 2. Delay mínimo para o React atualizar o DOM e o 'transition' funcionar no fade in
      setTimeout(() => {
        setImageOpacity(1); // Inicia o fade in da imagem
      }, 10);

      // 3. Define o tempo que a imagem ficará visível antes de começar o fade out
      setTimeout(() => {
        setImageOpacity(0); // Inicia o fade out da imagem

        // 4. Depois que a animação de fade out da imagem terminar
        setTimeout(async () => {
          await login(username.trim() || "anon");
          nav("/");
          audio.pause(); // Pausa o áudio após a transição
        }, 500); // Duração do fade out da imagem (igual ao transition)
      }, 3600); // Tempo que a imagem fica na tela com opacidade 1
    }, 500); // Duração do fade out do formulário (igual ao transition)
  };

  return (
    <div style={{ position: "relative", height: "100vh" }}>
      {/* O formulário só será renderizado se a imagem não estiver sendo exibida */}
      {!showImage && (
        <form
          onSubmit={handleSubmit}
          className="centered-box"
          style={{
            transition: "opacity 0.5s ease-out",
            opacity: formFadeOut ? 0 : 1,
            pointerEvents: isSubmitting ? "none" : "auto",
          }}
        >
          <h1>Entrar</h1>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nome"
          />
          <input type="password" placeholder="Senha (qualquer)" />
          <button type="submit" disabled={isSubmitting}>
            Login
          </button>
        </form>
      )}

      {/* Imagem que aparece durante a animação */}
      {showImage && (
        <div // Usar uma div como container para a imagem facilita o controle
          className="centered-box"
          style={{
            transition: "opacity 1s ease-in-out", // Transição de opacidade para fade in/out
            opacity: imageOpacity, // Controla a opacidade dinamicamente
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <img
            src="/toiter.svg" // Corrigido o caminho da imagem para a pasta public
            alt="Logo animada"
            style={{
              height: "50%", // Defina um tamanho para a imagem
              width: "50%",
              animation: "pulse 1s infinite alternate",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default LoginPage;
