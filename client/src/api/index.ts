import axios from "axios";

/* ─────────── instância base ─────────── */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",
});

/* ─────────── Auth / Usuários ─────────── */
export const login = async (username: string) => {
  // se já existe, retorna; senão cria
  const { data: users } = await api.get(`/users?username=${username}`);
  if (users.length) return users[0];
  const { data: user } = await api.post("/users", { username });
  return user;
};

/* ─────────── Feed ─────────── */
export const fetchPosts = async () => {
  // posts com embeds
  const { data: posts } = await api.get(
    "/posts?_embed=likes&_embed=comments&_embed=retweets"
  );
  // lista completa de usuários (IDs podem ser string ou number)
  const { data: users } = await api.get("/users");
  return { posts, users };
};

/* ─────────── Ações ─────────── */
export const publish = (userId: string | number, content: string) =>
  api.post("/posts", { userId, content, createdAt: Date.now() });

export const like = (postId: string | number, userId: string | number) =>
  api.post("/likes", { postId, userId });

export const unlike = (likeId: string | number) =>
  api.delete(`/likes/${likeId}`);

export const comment = (
  postId: string | number,
  userId: string | number,
  text: string
) => api.post("/comments", { postId, userId, text, createdAt: Date.now() });

export const retweet = (postId: string | number, userId: string | number) =>
  api.post("/retweets", { postId, userId, createdAt: Date.now() });

export default api;
