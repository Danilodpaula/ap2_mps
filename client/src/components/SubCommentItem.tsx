// src/components/SubCommentItem.tsx
import { useAuth } from "../hooks/useAuth";
import { deleteSubComment, likeSubComment, unlikeSubComment, retweetSubComment } from "../api"; // Importe a função

type SubCommentItemProps = {
  sc: any;
  usernameById: (id: number) => string;
  formatDate: (t: number) => string;
  refresh: () => void;
};

export const SubCommentItem = ({ sc, usernameById, formatDate, refresh }: SubCommentItemProps) => {
  const { user } = useAuth();

  const subLikes = (sc: any) => (sc.subCommentLikes ?? []).length;
  const userLiked = (sc: any) => (sc.subCommentLikes ?? []).some((l: any) => l.userId === user?.id);
  const userRetweeted = (sc: any) => (sc.subCommentRetweets ?? []).some((r: any) => r.userId === user?.id);

  const toggleLike = () => {
    if (!user) return;
    const like = (sc.subCommentLikes ?? []).find((l: any) => l.userId === user.id);
    like ? unlikeSubComment(like.id).then(refresh) : likeSubComment(sc.id, user.id).then(refresh);
  };

  return (
    <li key={sc.id}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>
          <strong>@{usernameById(sc.userId)}</strong>: {sc.text}
          <time style={{ color: "var(--text-muted)", fontSize: '.8rem' }}> · {formatDate(sc.createdAt)}</time>
        </span>
        
        {/* BOTÃO DE EXCLUIR */}
        {sc.userId === user?.id && (
          <button
            onClick={() => confirm("Excluir resposta?") && deleteSubComment(sc.id).then(refresh)}
            title="Excluir"
            style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: '2px' }}
          >
            🗑️
          </button>
        )}
      </div>
      
      {/* Adicione a lógica de mídia aqui se houver */}
      {sc.mediaUrl && sc.mediaType === "image" && <img src={sc.mediaUrl} alt="Sub-comment media" style={{ maxWidth: "200px", borderRadius: "8px", marginTop: '5px' }} />}
      {sc.mediaUrl && sc.mediaType === "video" && <video src={sc.mediaUrl} controls style={{ maxWidth: "200px", borderRadius: "8px", marginTop: '5px' }} />}

      <div style={{ display: "flex", gap: "1.2rem", fontSize: ".85rem" }}>
        <button className={userLiked(sc) ? "liked" : ""} onClick={toggleLike}>
          {userLiked(sc) ? "♥" : "♡"} {subLikes(sc)}
        </button>
        <button className={userRetweeted(sc) ? "retweeted" : ""} onClick={() => retweetSubComment(sc.id, user!.id).then(refresh)}>
          🔁 {(sc.subCommentRetweets ?? []).length}
        </button>
      </div>
    </li>
  );
};