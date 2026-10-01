"use client";
import { EditorialImage as ResponsiveImage } from "../editorial/image";
import { useState, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { uploadImage } from "@/lib/cms/upload";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Youtube from "@tiptap/extension-youtube";
import { mergeAttributes } from "@tiptap/core";
import Image from "@tiptap/extension-image";
export type RecordItem = {
  id: number;
  title: string;
  category: string;
  status: string;
  date: string;
  slug: string;
  body?: string;
  image?: string;
  [key: string]: string | number | boolean | undefined;
};
const EditorialImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      caption: {
        default: "",
        parseHTML: (e) => e.getAttribute("data-caption"),
        renderHTML: (a) => ({ "data-caption": a.caption }),
      },
      credit: {
        default: "",
        parseHTML: (e) => e.getAttribute("data-credit"),
        renderHTML: (a) => ({ "data-credit": a.credit }),
      },
      alignment: {
        default: "center",
        parseHTML: (e) => e.getAttribute("data-alignment"),
        renderHTML: (a) => ({ "data-alignment": a.alignment }),
      },
    };
  },
  renderHTML({ HTMLAttributes, node }) {
    return [
      "figure",
      {},
      ["img", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)],
      [
        "figcaption",
        String(node.attrs.caption || "") +
          (node.attrs.credit ? " — " + node.attrs.credit : ""),
      ],
    ];
  },
});
function seoChecks(html: string) {
  const imgs = html.match(/<img\b[^>]*>/g) || [];
  return {
    missingAlt: imgs.filter((img) => !/\balt=["'][^"']+/.test(img)).length,
    extraH1: /(<h1[ >])/.test(html),
  };
}
export function TextEditor({
  item,
  onSave,
  onClose,
  onAutosave,
}: {
  item: RecordItem;
  onSave: (r: RecordItem) => void;
  onClose: () => void;
  onAutosave?: (r: RecordItem) => void;
}) {
  const [draft, setDraft] = useState(item);
  const [revision, setRevision] = useState(0);
  const [embed, setEmbed] = useState("");
  const [embedPanel, setEmbedPanel] = useState(false);
  const autosave = useRef(onAutosave);
  useEffect(() => {
    autosave.current = onAutosave;
  }, [onAutosave]);
  const [notice, setNotice] = useState("");
  const [preview, setPreview] = useState(false);
  const [imagePanel, setImagePanel] = useState(false);
  const [imageData, setImageData] = useState({
    src: "",
    alt: "",
    caption: "",
    credit: "",
    alignment: "center",
  });
  const [linkPanel, setLinkPanel] = useState(false);
  const [link, setLink] = useState("");
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Youtube.configure({ nocookie: true }),
      EditorialImage.configure({
        allowBase64: false,
        resize: {
          enabled: true,
          alwaysPreserveAspectRatio: true,
          minWidth: 100,
          minHeight: 100,
        },
      }),
    ],
    content: item.body || "<p></p>",
    immediatelyRender: false,
    onUpdate: () => setRevision((v) => v + 1),
    editorProps: {
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files;
        if (!files?.length) return false;
        event.preventDefault();
        for (const file of Array.from(files))
          uploadImage(file)
            .then((src) =>
              editor?.chain().focus().setImage({ src, alt: "" }).run(),
            )
            .catch((e) => setNotice(e.message));
        return true;
      },
    },
  });
  useEffect(() => {
    if (!draft.title.trim() || draft.status !== "Rascunho") return;
    const timer = setTimeout(() => {
      autosave.current?.({
        ...draft,
        body: editor?.getHTML() || "",
        bodyEdited: true,
        slug:
          draft.slug ||
          draft.title
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, ""),
      });
      setNotice("Rascunho enviado para salvamento automático");
    }, 1800);
    return () => clearTimeout(timer);
  }, [draft, revision, editor]);
  const change = (name: string, value: string | boolean) =>
    setDraft({ ...draft, [name]: value });
  const save = (status: string) =>
    onSave({
      ...draft,
      status,
      scheduledAt: draft.scheduledAt
        ? new Date(String(draft.scheduledAt)).toISOString()
        : "",
      bodyEdited: true,
      body: editor?.getHTML() || "",
      slug:
        draft.slug ||
        draft.title
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-"),
    });
  const tools: [string, () => void, string?][] = [
    ["Vídeo", () => setEmbedPanel(!embedPanel), "Inserir vídeo do YouTube"],
    [
      "Esq.",
      () => editor?.chain().focus().setTextAlign("left").run(),
      "Alinhar à esquerda",
    ],
    [
      "Centro",
      () => editor?.chain().focus().setTextAlign("center").run(),
      "Centralizar",
    ],
    [
      "Dir.",
      () => editor?.chain().focus().setTextAlign("right").run(),
      "Alinhar à direita",
    ],
    ["↶", () => editor?.chain().focus().undo().run(), "Desfazer"],
    ["↷", () => editor?.chain().focus().redo().run(), "Refazer"],
    ["S", () => editor?.chain().focus().toggleStrike().run(), "Tachado"],
    ["B", () => editor?.chain().focus().toggleBold().run(), "Negrito"],
    ["I", () => editor?.chain().focus().toggleItalic().run(), "Itálico"],
    ["U", () => editor?.chain().focus().toggleUnderline().run(), "Sublinhado"],
    ["H1", () => editor?.chain().focus().toggleHeading({ level: 1 }).run()],
    ["H2", () => editor?.chain().focus().toggleHeading({ level: 2 }).run()],
    ["H3", () => editor?.chain().focus().toggleHeading({ level: 3 }).run()],
    ["“", () => editor?.chain().focus().toggleBlockquote().run(), "Citação"],
    ["• Lista", () => editor?.chain().focus().toggleBulletList().run()],
    ["1. Lista", () => editor?.chain().focus().toggleOrderedList().run()],
    ["Link", () => setLinkPanel(!linkPanel)],
    ["Imagem", () => setImagePanel(!imagePanel)],
    ["—", () => editor?.chain().focus().setHorizontalRule().run(), "Divisor"],
  ];
  return (
    <div className="editor-screen">
      {notice && <p role="status">{notice}</p>}
      <div className="admin-heading">
        <div>
          <button className="plain" onClick={onClose}>
            ← Textos
          </button>
          <h1>{item.title ? "Editar texto" : "Novo texto"}</h1>
        </div>
        <div className="admin-actions">
          <button onClick={() => save("Rascunho")}>Salvar rascunho</button>
          <button onClick={() => setPreview(!preview)}>Visualizar</button>
          <button className="primary" onClick={() => save("Publicado")}>
            Publicar
          </button>
        </div>
      </div>
      <div className="editor-layout">
        <section className="editor-paper">
          <input
            className="editor-title"
            aria-label="Título do texto"
            placeholder="Título da sua história"
            value={draft.title}
            onChange={(e) => change("title", e.target.value)}
          />
          <input
            className="editor-subtitle"
            aria-label="Subtítulo"
            placeholder="Um subtítulo para dar contexto..."
            value={String(draft.subtitle || "")}
            onChange={(e) => change("subtitle", e.target.value)}
          />
          <div className="editor-toolbar">
            {tools.map(([label, action, title]) => (
              <button
                type="button"
                key={label}
                onClick={action}
                title={title || label}
                aria-label={title || label}
              >
                {label}
              </button>
            ))}
          </div>
          {embedPanel && (
            <div className="insert-panel">
              <label>
                Vídeo do YouTube
                <input
                  type="url"
                  value={embed}
                  onChange={(e) => setEmbed(e.target.value)}
                />
              </label>
              <button
                onClick={() => {
                  if (
                    /^https:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\//.test(
                      embed,
                    )
                  ) {
                    editor?.commands.setYoutubeVideo({ src: embed });
                    setEmbedPanel(false);
                  } else setNotice("Informe uma URL válida do YouTube.");
                }}
              >
                Inserir vídeo
              </button>
            </div>
          )}
          {linkPanel && (
            <div className="insert-panel">
              <label>
                URL do link
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://"
                />
              </label>
              <button
                onClick={() => {
                  if (/^https?:\/\//.test(link))
                    editor?.chain().focus().setLink({ href: link }).run();
                  setLinkPanel(false);
                }}
              >
                Inserir link
              </button>
            </div>
          )}
          {imagePanel && (
            <div className="insert-panel">
              <label>
                Upload local
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setNotice("Enviando imagem…");
                      uploadImage(file)
                        .then((src) => {
                          setImageData({ ...imageData, src });
                          setNotice("Imagem enviada");
                        })
                        .catch((e) => setNotice(e.message));
                    }
                  }}
                />
              </label>
              <label>
                Alt text
                <input
                  value={imageData.alt}
                  onChange={(e) =>
                    setImageData({ ...imageData, alt: e.target.value })
                  }
                />
              </label>
              <label>
                Legenda
                <input
                  value={imageData.caption}
                  onChange={(e) =>
                    setImageData({ ...imageData, caption: e.target.value })
                  }
                />
              </label>
              <label>
                Crédito
                <input
                  value={imageData.credit}
                  onChange={(e) =>
                    setImageData({ ...imageData, credit: e.target.value })
                  }
                />
              </label>
              <label>
                Alinhamento
                <select
                  value={imageData.alignment}
                  onChange={(e) =>
                    setImageData({ ...imageData, alignment: e.target.value })
                  }
                >
                  <option value="left">Esquerda</option>
                  <option value="center">Centro</option>
                  <option value="right">Direita</option>
                  <option value="full">Largura total</option>
                </select>
              </label>
              <button
                onClick={() => {
                  const attrs = editor?.getAttributes("image");
                  if (attrs?.src) {
                    setImageData({
                      src: attrs.src,
                      alt: attrs.alt || "",
                      caption: attrs.caption || "",
                      credit: attrs.credit || "",
                      alignment: attrs.alignment || "center",
                    });
                  }
                }}
              >
                Editar imagem selecionada
              </button>
              <button
                onClick={() => {
                  editor
                    ?.chain()
                    .focus()
                    .updateAttributes("image", imageData)
                    .run();
                  setImagePanel(false);
                }}
              >
                Aplicar à imagem selecionada
              </button>
              <button
                disabled={!imageData.src}
                onClick={() => {
                  editor
                    ?.chain()
                    .focus()
                    .insertContent({ type: "image", attrs: imageData })
                    .run();
                  setImagePanel(false);
                }}
              >
                Inserir imagem
              </button>
            </div>
          )}
          {preview ? (
            <article className="editor-preview">
              <span className="eyebrow">PRÉVIA / {draft.category}</span>
              <h1>{draft.title}</h1>
              <p>{String(draft.subtitle || "")}</p>
              <div
                dangerouslySetInnerHTML={{ __html: editor?.getHTML() || "" }}
              />
            </article>
          ) : (
            <EditorContent editor={editor} />
          )}
        </section>
        <aside className="publish-panel">
          <h2>Publicação</h2>
          <label className="check-label">
            <input
              type="checkbox"
              checked={Boolean(draft.placeholder)}
              onChange={(e) => change("placeholder", e.target.checked)}
            />
            Conteúdo de exemplo (não indexar)
          </label>
          <label>
            Status
            <select
              value={draft.status}
              onChange={(e) => change("status", e.target.value)}
            >
              {["Rascunho", "Publicado", "Agendado", "Pausado"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Categoria
            <select
              value={draft.category}
              onChange={(e) => change("category", e.target.value)}
            >
              {[
                "Jornalismo",
                "Comunicação",
                "Cultura",
                "Fotografia",
                "Opinião",
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Data
            <input
              type="date"
              value={draft.date}
              onChange={(e) => change("date", e.target.value)}
            />
          </label>
          <label>
            Slug
            <input
              value={draft.slug}
              onChange={(e) => change("slug", e.target.value)}
            />
          </label>
          <label>
            Crédito da capa
            <input
              value={String(draft.coverCredit || "")}
              onChange={(e) => change("coverCredit", e.target.value)}
            />
          </label>
          <label>
            Imagem de capa
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f)
                  uploadImage(f)
                    .then((url) => change("image", url))
                    .catch((e) => setNotice(e.message));
              }}
            />
          </label>
          {draft.image && (
            <ResponsiveImage src={draft.image} alt="Prévia de capa" />
          )}
          <label className="check-label">
            <input
              type="checkbox"
              checked={Boolean(draft.featured)}
              onChange={(e) => change("featured", e.target.checked)}
            />
            Texto em destaque
          </label>
          <label>
            Agendar publicação
            <input
              type="datetime-local"
              value={
                draft.scheduledAt
                  ? new Date(
                      new Date(String(draft.scheduledAt)).getTime() -
                        new Date().getTimezoneOffset() * 60000,
                    )
                      .toISOString()
                      .slice(0, 16)
                  : ""
              }
              onChange={(e) => change("scheduledAt", e.target.value)}
            />
          </label>
          <h2>SEO</h2>
          <label>
            Canonical
            <input
              type="url"
              value={String(draft.canonical || "")}
              onChange={(e) => change("canonical", e.target.value)}
            />
          </label>
          <label>
            Open Graph título
            <input
              value={String(draft.ogTitle || "")}
              onChange={(e) => change("ogTitle", e.target.value)}
            />
          </label>
          <label>
            Open Graph descrição
            <textarea
              value={String(draft.ogDescription || "")}
              onChange={(e) => change("ogDescription", e.target.value)}
            />
          </label>
          <label>
            Título SEO
            <input
              value={String(draft.seoTitle || "")}
              onChange={(e) => change("seoTitle", e.target.value)}
            />
          </label>
          <label>
            Descrição SEO
            <textarea
              value={String(draft.seoDescription || "")}
              onChange={(e) => change("seoDescription", e.target.value)}
            />
          </label>
          <label>
            Imagem social
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f)
                  uploadImage(f)
                    .then((url) => change("socialImage", url))
                    .catch((e) => setNotice(e.message));
              }}
            />
          </label>
          <div className="seo-preview">
            <small>PRÉVIA GOOGLE</small>
            <h3>{String(draft.seoTitle || draft.title)}</h3>
            <p>{String(draft.seoDescription || draft.subtitle || "")}</p>
            <small role="status">
              {seoChecks(editor?.getHTML() || "").extraH1
                ? "Há H1 dentro do texto. O título do artigo já é H1; use H2 para as seções."
                : "Hierarquia: título do artigo + seções H2/H3."}
            </small>
            <small>
              {seoChecks(editor?.getHTML() || "").missingAlt} imagem(ns) sem
              texto alternativo.
            </small>
            <small>
              Título: {String(draft.seoTitle || draft.title).length}/60 ·
              Descrição:{" "}
              {String(draft.seoDescription || draft.subtitle || "").length}/160
            </small>
          </div>
          <button onClick={() => save(draft.status)}>Salvar alterações</button>
          <p>O conteúdo só aparece no site depois de publicado.</p>
        </aside>
      </div>
    </div>
  );
}
