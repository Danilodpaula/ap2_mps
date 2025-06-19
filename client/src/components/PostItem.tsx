// src/components/PostItem.tsx
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import type { Post, User } from "../types/models";
import {
  editPost,
  deletePost,
  like,
  unlike,
  retweet,
  comment,
  uploadMedia,
} from "../api";
import { CommentItem } from "./CommentItem";
import { PublishBox } from "./PublishBox"; // Importe o novo componente reutilizável

type PostItemProps = {
  p: Post;
  users: User[];
  usernameById: (id: number) => string;
  formatDate: (t: number) => string;
  refresh: () => void;
};

export const PostItem = ({
  p,
  usernameById,
  formatDate,
  refresh,
}: PostItemProps) => {
  const { user } = useAuth();

  // Estado para controlar a edição do post
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(p.content);

  // Novo estado para controlar a visibilidade da caixa de comentário
  const [showCommentBox, setShowCommentBox] = useState(false);

  const handleSaveEdit = async () => {
    if (editedContent.trim() === "") return;
    await editPost(p.id, editedContent);
    setIsEditing(false);
    refresh();
  };

  const toggleLike = () => {
    if (!user) return;
    const existingLike = p.likes?.find((l) => l.userId === user.id);
    existingLike
      ? unlike(existingLike.id).then(refresh)
      : like(p.id, user.id).then(refresh);
  };

  return (
    <article key={p.id}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>
          <strong>@{usernameById(p.userId)}</strong>
          <time style={{ color: "var(--text-muted)" }}>
            {" "}
            · {formatDate(p.createdAt)}
          </time>
        </span>
        {p.userId === user?.id && (
          <div>
            <button
              onClick={() => setIsEditing(true)}
              title="Editar"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                marginRight: "10px",
              }}
            >
              ✏️
            </button>
            <button
              onClick={() =>
                confirm("Excluir publicação?") && deletePost(p.id).then(refresh)
              }
              title="Excluir"
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
              }}
            >
              🗑️
            </button>
          </div>
        )}
      </header>
      {isEditing ? (
        <div className="edit-box">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            style={{ width: "100%", minHeight: "80px" }}
          />
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button onClick={handleSaveEdit}>Salvar</button>
            <button onClick={() => setIsEditing(false)} className="secondary">
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <p>{p.content}</p>
      )}
      {p.mediaUrl &&
        (() => {
          const mediaSrc = import.meta.env.PROD
            ? `<span class="math-inline">\{import\.meta\.env\.VITE\_API\_URL\}</span>{p.mediaUrl}`
            : p.mediaUrl;
          return p.mediaType === "image" ? (
            <img
              src={mediaSrc}
              alt="Post media"
              style={{ maxWidth: "100%", borderRadius: "8px" }}
            />
          ) : (
            <video
              src={mediaSrc}
              controls
              style={{ maxWidth: "100%", borderRadius: "8px" }}
            />
          );
        })()}
      <footer>
        <button
          className={p.likes?.some((l) => l.userId === user?.id) ? "liked" : ""}
          onClick={toggleLike}
        >
          {p.likes?.some((l) => l.userId === user?.id) ? "♥" : "♡"}{" "}
          {p.likes?.length || 0}
        </button>
        <button onClick={() => user && retweet(p.id, user.id).then(refresh)}>
          🔁 {p.retweets?.length || 0}
        </button>
        {/* Botão de comentar agora apenas abre/fecha a caixa de comentário */}
        <button
          onClick={() => setShowCommentBox(!showCommentBox)}
          className={showCommentBox ? "active" : ""}
        >
          💬 {p.comments?.length || 0}
        </button>
      </footer>
      {/* Formulário para novo comentário, que aparece condicionalmente */}

      {showCommentBox && (
        <PublishBox
          placeholder="Escreva seu comentário..."
          onPublish={async (text, file) => {
            if (!user) return;

            // AQUI ESTÁ A CORREÇÃO: Declaramos o tipo exato da variável
            let mediaPayload:
              | { url: string; type: "image" | "video" }
              | undefined;

            if (file) {
              const { mediaUrl } = await uploadMedia(file);
              mediaPayload = {
                url: mediaUrl,
                type: file.type.startsWith("image/") ? "image" : "video",
              };
            }

            // Agora o erro de tipagem desaparece
            await comment(p.id, user.id, text, mediaPayload);

            setShowCommentBox(false);
            refresh();
          }}
        />
      )}
      {/* Lista de comentários existentes */}
      {p.comments && p.comments.length > 0 && (
        <ul className="comments">
          {p.comments.map((c: any) => (
            <CommentItem
              key={c.id}
              c={c}
              usernameById={usernameById}
              formatDate={formatDate}
              refresh={refresh}
            />
          ))}
        </ul>
      )}
    </article>
  );
};
