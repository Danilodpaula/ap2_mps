import axios from "axios";

/* ─────────── instância base ─────────── */
const api = axios.create({
  baseURL: "/api", // A única linha modificada
});

/* ─────────── Auth / Usuários ─────────── */
export const login = async (username: string) => {
  const { data: u } = await api.get(`/users?username=${username}`);
  if (u.length) return u[0];
  const { data } = await api.post("/users", { username });
  return data;
};

/* ─────────── Feed (posts + comentários + subcomentários) ─────────── */
export const fetchPosts = async () => {
  const { data: posts } = await api.get(
    "/posts" +
      "?_embed=likes&_embed=retweets" +
      "&_embed=comments" +
      "&_embed=commentLikes&_embed=commentRetweets"
  );

  const { data: subComments } = await api.get(
    "/subComments?_embed=subCommentLikes&_embed=subCommentRetweets"
  );

  const { data: users } = await api.get("/users");
  return { posts, users, subComments };
};

// Nova função para fazer upload do arquivo e obter a URL
export const uploadMedia = async (file: File) => {
  const formData = new FormData();
  formData.append("media", file); // 'media' deve ser o mesmo nome usado no upload.single('media') do servidor

  const { data } = await api.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data; // Retorna { mediaUrl: '/uploads/arquivo-123.png' }
};

/* ─────────── Publicações ─────────── */
// Função 'publish' modificada
export const publish = (
  userId: string | number,
  content: string,
  media?: { url: string; type: 'image' | 'video' }
) =>
  api.post("/posts", {
    userId,
    content,
    mediaUrl: media?.url,
    mediaType: media?.type,
    createdAt: Date.now(),
  });
export const like = (postId: string | number, userId: string | number) =>
  api.post("/likes", { postId, userId });
export const unlike = (id: string | number) => api.delete(`/likes/${id}`);

export const retweet = (postId: string | number, userId: string | number) =>
  api.post("/retweets", { postId, userId, createdAt: Date.now() });

export const deletePost = (id: string | number) => api.delete(`/posts/${id}`);

/* ─────────── Comentários ─────────── */
export const comment = (
  postId: string | number,
  userId: string | number,
  text: string
) =>
  api.post("/comments", { postId, userId, text, createdAt: Date.now() });

export const deleteComment = (id: string | number) =>
  api.delete(`/comments/${id}`);

export const likeComment = (
  commentId: string | number,
  userId: string | number
) => api.post("/commentLikes", { commentId, userId });
export const unlikeComment = (id: string | number) =>
  api.delete(`/commentLikes/${id}`);

export const retweetComment = (
  commentId: string | number,
  userId: string | number
) =>
  api.post("/commentRetweets", { commentId, userId, createdAt: Date.now() });

/* ─────────── Sub-Comentários ─────────── */
export const replyComment = (
  parentCommentId: string | number,
  userId: string | number,
  text: string
) =>
  api.post("/subComments", {
    parentCommentId,
    userId,
    text,
    createdAt: Date.now(),
  });

export const likeSubComment = (
  subId: string | number,
  userId: string | number
) => api.post("/subCommentLikes", { subCommentId: subId, userId });
export const unlikeSubComment = (id: string | number) =>
  api.delete(`/subCommentLikes/${id}`);

export const retweetSubComment = (
  subId: string | number,
  userId: string | number
) =>
  api.post("/subCommentRetweets", {
    subCommentId: subId,
    userId,
    createdAt: Date.now(),
  });

export default api;