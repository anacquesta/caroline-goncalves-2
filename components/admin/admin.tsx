"use client";
import { readResult } from "@/lib/cms/result";

import { EditorialImage } from "../editorial/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { TextEditor, RecordItem } from "./text-editor";
import { Messages } from "./messages";
import { useDialogFocus } from "@/hooks/use-dialog-focus";
import { seed, type Store } from "@/lib/cms/seed";
import { uploadImage } from "@/lib/cms/upload";
function today() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date());
}
const menu = [
  "Visão geral",
  "Textos",
  "Projetos",
  "Fotografias",
  "Álbuns",
  "Depoimentos",
  "Mensagens",
  "Página inicial",
  "Perfil",
  "Contato",
  "SEO",
  "Configurações",
];
const extras: Record<string, string[]> = {
  Projetos: [
    "Cliente",
    "Ano",
    "Descrição",
    "Participação",
    "Contexto",
    "Atuação",
    "Entregas",
    "Competências",
    "Conteúdo",
  ],
  Álbuns: ["Descrição", "Local", "Categoria", "Data"],
  Depoimentos: ["Cargo", "Empresa", "Texto", "LinkedIn", "Ordem"],
  Fotografias: ["Álbum", "Alt text", "Legenda", "Crédito", "Local", "Data"],
};
const fieldKeys: Record<string, string> = {
  Participação: "participation",
  Contexto: "context",
  Atuação: "contribution",
  Entregas: "deliveries",
  Competências: "skills",
  Cliente: "client",
  Ano: "year",
  Descrição: "description",
  Conteúdo: "body",
  Galeria: "gallery",
  Local: "place",
  Cargo: "role",
  Empresa: "company",
  Texto: "description",
  LinkedIn: "linkedin",
  Ordem: "order",
  Álbum: "album",
  "Alt text": "alt",
  Legenda: "caption",
  Crédito: "credit",
  Categoria: "category",
  Data: "date",
};
export function Admin() {
  const [section, setSection] = useState("Visão geral");
  const [data, setData] = useState<Store>(seed);
  const [ready, setReady] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [editing, setEditing] = useState<RecordItem | null>(null);
  const [toast, setToast] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);
  useDialogFocus(deleting !== null);
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDeleting(null);
    };
    addEventListener("keydown", close);
    return () => removeEventListener("keydown", close);
  }, []);
  const [drag, setDrag] = useState<number | null>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const saved = useRef("");
  const queue = useRef(Promise.resolve());
  const [saveError, setSaveError] = useState("");
  useEffect(() => {
    fetch("/api/cms")
      .then(async (r) => {
        const result = await readResult(r);
        if (!r.ok) throw new Error(result.error);
        saved.current = JSON.stringify(result.store);
        setData(result.store);
        setReady(true);
      })
      .catch((e) => setSaveError(e.message));
    fetch("/api/settings")
      .then((r) => readResult(r))
      .then((r) => setSettings(r.settings || {}))
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (!ready) return;
    const snapshot = JSON.stringify(data);
    if (snapshot === saved.current) return;
    const timer = setTimeout(() => {
      queue.current = queue.current.then(async () => {
        try {
          const r = await fetch("/api/cms", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: snapshot,
          });
          const result = await readResult(r);
          if (!r.ok) throw new Error(result.error);
          saved.current = snapshot;
          setSaveError("");
          setToast("Alterações salvas no banco");
        } catch (e) {
          setSaveError(
            e instanceof Error
              ? e.message
              : "Falha ao salvar. Tente novamente.",
          );
        }
      });
    }, 600);
    return () => clearTimeout(timer);
  }, [data, ready]);
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(""), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  const go = (s: string) => {
    setSection(s);
    setEditing(null);
    setSearch("");
    setFilter("Todos");
  };
  const records = data[section] || [];
  const bulkUpload = async (files: File[]) => {
    const additions: RecordItem[] = [];
    setToast("Enviando fotografias…");
    for (const file of files) {
      try {
        const image = await uploadImage(file);
        const id = Date.now() + additions.length;
        additions.push({
          id,
          title: file.name.replace(/\.[^.]+$/, ""),
          slug: "foto-" + id,
          category: "Editorial",
          date: today(),
          status: "Rascunho",
          image,
          alt: "",
          album: "",
        });
      } catch (e) {
        setSaveError(e instanceof Error ? e.message : "Falha no upload");
      }
    }
    setData((current) => ({
      ...current,
      Fotografias: [...current.Fotografias, ...additions],
    }));
  };
  const update = (items: RecordItem[]) =>
    setData({ ...data, [section]: items });
  const action = (id: number, status: string) => {
    update(records.map((r) => (r.id === id ? { ...r, status } : r)));
    setToast("Status atualizado");
  };
  const save = (record: RecordItem) => {
    if (!record.title.trim()) {
      setToast("Informe um título para salvar");
      return;
    }
    const id = record.id || Date.now();
    record = {
      ...record,
      id,
      slug:
        record.slug ||
        record.title
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
    };
    update(
      records.some((r) => r.id === id)
        ? records.map((r) => (r.id === id ? record : r))
        : [{ ...record, id }, ...records],
    );
    setEditing(null);
    setToast("Salvando alterações…");
  };
  const add = () =>
    setEditing({
      id: Date.now(),
      title: "",
      slug: "",
      category: section === "Textos" ? "Jornalismo" : "Editorial",
      status: "Rascunho",
      date: today(),
    });
  const reorder = (from: number, to: number) => {
    const visible = records.filter(
      (r) =>
        (filter === "Todos" || r.status === filter) &&
        r.title.toLowerCase().includes(search.toLowerCase()),
    );
    const a = records.findIndex((r) => r.id === visible[from]?.id);
    const b = records.findIndex((r) => r.id === visible[to]?.id);
    if (a < 0 || b < 0) return;
    const result = [...records];
    const item = result.splice(a, 1)[0];
    result.splice(b, 0, item);
    update(result);
    setToast("Ordem atualizada");
  };
  const shown = records.filter(
    (r) =>
      (filter === "Todos" || r.status === filter) &&
      r.title.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="admin-shell" data-ready={ready}>
      <aside className="admin-sidebar">
        <Link href="/" className="admin-brand">
          CAROLINE <span>ADMIN</span>
        </Link>
        <nav>
          {menu.map((s, i) => (
            <div key={s}>
              {i === 1 && <small>CONTEÚDO</small>}
              {i === 6 && <small>SITE</small>}
              <button
                className={s === section ? "active" : ""}
                onClick={() => go(s)}
              >
                {s}
              </button>
            </div>
          ))}
        </nav>
        <Link href="/">↗ Ver site</Link>
        <p>
          CMS editorial
          <br />
          Conteúdo protegido por autenticação
        </p>
      </aside>
      <main className="admin-main">
        <header className="admin-top">
          <span>Seu arquivo editorial</span>
          <span>
            Caroline Gonçalves <b>CG</b>
          </span>
        </header>
        <div className="admin-mobile-nav">
          <select
            aria-label="Seção administrativa"
            value={section}
            onChange={(e) => go(e.target.value)}
          >
            {menu.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <Link href="/">Ver site ↗</Link>
        </div>
        <div className="admin-content">
          {saveError && (
            <p role="alert" className="admin-save-error">
              {saveError}{" "}
              <button
                onClick={() => {
                  setReady(false);
                  setTimeout(() => setReady(true), 0);
                }}
              >
                Tentar novamente
              </button>
            </p>
          )}
          {section === "Mensagens" ? (
            <Messages />
          ) : editing && section === "Textos" ? (
            <TextEditor
              key={editing.id}
              item={editing}
              onSave={save}
              onAutosave={(r) => {
                const id = r.id || Date.now();
                update(
                  records.some((p) => p.id === id)
                    ? records.map((p) => (p.id === id ? { ...r, id } : p))
                    : [{ ...r, id }, ...records],
                );
              }}
              onClose={() => setEditing(null)}
            />
          ) : editing ? (
            <div>
              <div className="admin-heading">
                <div>
                  <button className="plain" onClick={() => setEditing(null)}>
                    ← {section}
                  </button>
                  <h1>
                    {editing.id ? "Editar" : "Adicionar"}{" "}
                    {section === "Depoimentos"
                      ? "depoimento"
                      : section === "Álbuns"
                        ? "álbum"
                        : section === "Fotografias"
                          ? "fotografia"
                          : "projeto"}
                  </h1>
                </div>
              </div>
              <form
                className="record-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  save(editing);
                }}
              >
                <label>
                  {section === "Depoimentos" ? "Nome" : "Título"}
                  <input
                    required
                    value={editing.title}
                    onChange={(e) =>
                      setEditing({ ...editing, title: e.target.value })
                    }
                  />
                </label>
                <label>
                  Slug
                  <input
                    value={editing.slug}
                    onChange={(e) =>
                      setEditing({ ...editing, slug: e.target.value })
                    }
                  />
                </label>
                <label>
                  Status
                  <select
                    value={editing.status}
                    onChange={(e) =>
                      setEditing({ ...editing, status: e.target.value })
                    }
                  >
                    {["Rascunho", "Publicado", "Arquivado", "Oculto"].map(
                      (s) => (
                        <option key={s}>{s}</option>
                      ),
                    )}
                  </select>
                </label>
                <label>
                  Categoria
                  <input
                    value={editing.category}
                    onChange={(e) =>
                      setEditing({ ...editing, category: e.target.value })
                    }
                  />
                </label>
                {(extras[section] || []).map((f) => (
                  <label key={f}>
                    {f}
                    {[
                      "Descrição",
                      "Conteúdo",
                      "Texto",
                      "Contexto",
                      "Atuação",
                      "Entregas",
                      "Competências",
                    ].includes(f) ? (
                      <textarea
                        value={String(editing[fieldKeys[f]] || "")}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            [fieldKeys[f]]: e.target.value,
                          })
                        }
                      />
                    ) : f === "Álbum" ? (
                      <select
                        value={String(editing.album || "")}
                        onChange={(e) =>
                          setEditing({ ...editing, album: e.target.value })
                        }
                      >
                        <option value="">Sem álbum</option>
                        {data["Álbuns"].map((a) => (
                          <option key={a.id} value={a.slug}>
                            {a.title}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        value={String(editing[fieldKeys[f]] || "")}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            [fieldKeys[f]]: e.target.value,
                          })
                        }
                      />
                    )}
                  </label>
                ))}
                <label>
                  Imagem / capa
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setToast("Enviando imagem…");
                        uploadImage(f)
                          .then((image) => setEditing({ ...editing, image }))
                          .catch((e) => setSaveError(e.message));
                      }
                    }}
                  />
                </label>
                {editing.image && (
                  <EditorialImage
                    className="record-image"
                    src={editing.image}
                    alt="Prévia da imagem"
                  />
                )}
                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={Boolean(editing.placeholder)}
                    onChange={(e) =>
                      setEditing({ ...editing, placeholder: e.target.checked })
                    }
                  />
                  Conteúdo de exemplo (não indexar)
                </label>
                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={Boolean(editing.featured)}
                    onChange={(e) =>
                      setEditing({ ...editing, featured: e.target.checked })
                    }
                  />
                  Destaque
                </label>
                <button className="primary">Salvar alterações</button>
              </form>
            </div>
          ) : section === "Visão geral" ? (
            <>
              <div className="admin-heading">
                <div>
                  <span className="eyebrow">SEU ARQUIVO EDITORIAL</span>
                  <h1>Olá, Caroline.</h1>
                  <p>Um novo dia, novas histórias para contar.</p>
                </div>
                <button
                  className="primary"
                  onClick={() => {
                    go("Textos");
                    setEditing({
                      id: 0,
                      title: "",
                      slug: "",
                      category: "Jornalismo",
                      status: "Rascunho",
                      date: today(),
                    });
                  }}
                >
                  + Novo texto
                </button>
              </div>
              <div className="admin-stats">
                {[
                  [
                    String(
                      data.Textos.filter((r) => r.status === "Publicado")
                        .length,
                    ),
                    "Textos",
                  ],
                  [
                    String(
                      data.Textos.filter((r) => r.status === "Rascunho").length,
                    ),
                    "Rascunhos",
                  ],
                  [String(data.Fotografias.length), "Fotografias"],
                  [String(data.Projetos.length), "Projetos"],
                  [String(data.Depoimentos.length), "Depoimentos"],
                ].map(([n, l]) => (
                  <button
                    key={l}
                    onClick={() => go(l === "Rascunhos" ? "Textos" : l)}
                  >
                    <span>{n}</span>
                    {l}
                    <small>Registros no arquivo</small>
                  </button>
                ))}
              </div>
              <div className="dashboard-grid">
                <section className="admin-panel">
                  <h2>Publicações recentes</h2>
                  {data.Textos.slice(0, 4).map((p) => (
                    <button
                      className="recent-row"
                      key={p.id}
                      onClick={() => {
                        go("Textos");
                        setEditing(p);
                      }}
                    >
                      <div>
                        {p.title}
                        <small>
                          {p.category} / {p.date}
                        </small>
                      </div>
                      <span className={"status " + p.status.toLowerCase()}>
                        {p.status}
                      </span>
                    </button>
                  ))}
                </section>
                <section className="admin-panel">
                  <h2>Atalhos</h2>
                  {["Textos", "Fotografias", "Projetos"].map((s) => (
                    <button
                      className="shortcut"
                      key={s}
                      onClick={() => {
                        go(s);
                        setEditing({
                          id: 0,
                          title: "",
                          slug: "",
                          category: "Editorial",
                          status: "Rascunho",
                          date: today(),
                        });
                      }}
                    >
                      +{" "}
                      {s === "Textos"
                        ? "Novo texto"
                        : s === "Fotografias"
                          ? "Nova fotografia"
                          : "Novo projeto"}
                    </button>
                  ))}
                  <h2 className="changes-heading">Últimas alterações</h2>
                  <p>
                    Os registros e status do arquivo são atualizados após salvar
                    no banco.
                  </p>
                </section>
              </div>
            </>
          ) : data[section] ? (
            <>
              <div className="admin-heading">
                <div>
                  <span className="eyebrow">
                    CONTEÚDO / {records.length} REGISTROS
                  </span>
                  <h1>{section}</h1>
                  <p>Organize, edite e publique seu arquivo.</p>
                </div>
                <button className="primary" onClick={add}>
                  +{" "}
                  {section === "Textos"
                    ? "Novo texto"
                    : section === "Fotografias"
                      ? "Adicionar foto"
                      : section === "Álbuns"
                        ? "Novo álbum"
                        : section === "Depoimentos"
                          ? "Novo depoimento"
                          : "Novo projeto"}
                </button>
              </div>
              {section === "Fotografias" && (
                <div
                  className="upload-zone"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    void bulkUpload(Array.from(e.dataTransfer.files));
                  }}
                >
                  <label>
                    Arraste fotografias ou selecione arquivos
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      onChange={(e) =>
                        void bulkUpload(Array.from(e.target.files || []))
                      }
                    />
                  </label>
                  <small>
                    Otimização automática · até 12 MB por arquivo · imagens
                    entram como rascunho
                  </small>
                </div>
              )}
              <div className="admin-filters">
                <div>
                  {["Todos", "Publicado", "Rascunho", "Pausado"].map((s) => (
                    <button
                      className={filter === s ? "active" : ""}
                      key={s}
                      onClick={() => setFilter(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <input
                  aria-label="Buscar conteúdo"
                  placeholder="Buscar no arquivo..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              {["Fotografias", "Álbuns"].includes(section) ? (
                <>
                  <p className="admin-hint">
                    Arraste as imagens para reorganizar. Use as setas para
                    ordenar pelo teclado.
                  </p>
                  <div className="admin-photo-grid">
                    {shown.map((r, i) => (
                      <article
                        key={r.id}
                        draggable
                        onDragStart={() => setDrag(i)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => {
                          if (drag !== null) reorder(drag, i);
                          setDrag(null);
                        }}
                      >
                        <EditorialImage
                          src={r.image || "/images/light.jpg"}
                          alt={r.title}
                        />
                        <div>
                          <h3>{r.title}</h3>
                          <p>{String(r.album || r.category)}</p>
                          <span className="status">{r.status}</span>
                          <div className="photo-actions">
                            <button onClick={() => setEditing(r)}>
                              Editar
                            </button>
                            <button
                              onClick={() =>
                                action(
                                  r.id,
                                  r.status === "Publicado"
                                    ? "Oculto"
                                    : "Publicado",
                                )
                              }
                            >
                              {r.status === "Publicado" ? "Ocultar" : "Mostrar"}
                            </button>
                            <button
                              onClick={() => setDeleting(r.id)}
                              aria-label={"Remover " + r.title}
                            >
                              ×
                            </button>
                            <button
                              disabled={i === 0}
                              onClick={() => reorder(i, i - 1)}
                              aria-label={"Mover " + r.title + " antes"}
                            >
                              ←
                            </button>
                            <button
                              disabled={i === shown.length - 1}
                              onClick={() => reorder(i, i + 1)}
                              aria-label={"Mover " + r.title + " depois"}
                            >
                              →
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>{section === "Depoimentos" ? "Nome" : "Título"}</th>
                        <th>Categoria</th>
                        <th>Status</th>
                        <th>Data / atualizado</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shown.map((r, i) => (
                        <tr key={r.id}>
                          <td>
                            <button
                              className="table-title"
                              onClick={() => setEditing(r)}
                            >
                              {r.title}
                            </button>
                            {r.featured && <small>EM DESTAQUE</small>}
                          </td>
                          <td>{r.category}</td>
                          <td>
                            <span
                              className={"status " + r.status.toLowerCase()}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td>{r.date}</td>
                          <td>
                            <div className="table-actions">
                              <button onClick={() => setEditing(r)}>
                                Editar
                              </button>
                              <button
                                onClick={() =>
                                  action(
                                    r.id,
                                    r.status === "Publicado"
                                      ? "Pausado"
                                      : "Publicado",
                                  )
                                }
                              >
                                {r.status === "Publicado"
                                  ? "Pausar"
                                  : "Publicar"}
                              </button>
                              <button
                                onClick={() => {
                                  update([
                                    {
                                      ...r,
                                      id: Date.now(),
                                      title: r.title + " (cópia)",
                                      slug: r.slug + "-copia-" + Date.now(),
                                      status: "Rascunho",
                                    },
                                    ...records,
                                  ]);
                                  setToast("Registro duplicado");
                                }}
                              >
                                Duplicar
                              </button>
                              {section === "Depoimentos" && (
                                <>
                                  <button
                                    onClick={() =>
                                      action(
                                        r.id,
                                        r.status === "Oculto"
                                          ? "Publicado"
                                          : "Oculto",
                                      )
                                    }
                                  >
                                    Visibilidade
                                  </button>
                                  <button
                                    disabled={i === 0}
                                    onClick={() => reorder(i, i - 1)}
                                    aria-label="Mover para cima"
                                  >
                                    ↑
                                  </button>
                                </>
                              )}
                              <button
                                className="danger"
                                onClick={() => setDeleting(r.id)}
                              >
                                Excluir
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {shown.length === 0 && (
                    <div className="admin-empty">
                      Nenhum registro encontrado. Tente outro filtro ou adicione
                      um novo conteúdo.
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="admin-heading">
                <div>
                  <span className="eyebrow">SITE / EDIÇÃO</span>
                  <h1>{section}</h1>
                  <p>Ajuste as informações e salve no site.</p>
                </div>
              </div>
              <form
                className="settings-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  fetch("/api/settings", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(settings),
                  })
                    .then(async (r) => {
                      const result = await readResult(r);
                      if (!r.ok) throw new Error(result.error);
                      setToast("Configurações salvas");
                    })
                    .catch((e) => setSaveError(e.message));
                }}
              >
                {(section === "SEO"
                  ? [
                      "Título do site",
                      "Descrição SEO",
                      "OpenGraph título",
                      "OpenGraph descrição",
                    ]
                  : section === "Contato"
                    ? [
                        "E-mail",
                        "WhatsApp",
                        "Mensagem WhatsApp",
                        "Instagram",
                        "LinkedIn",
                        "Link de agendamento",
                      ]
                    : section === "Perfil"
                      ? ["Nome", "Apresentação", "Trajetória", "Formação"]
                      : section === "Página inicial"
                        ? [
                            "Assinatura",
                            "Manifesto",
                            "Texto de abertura",
                            "Projeto em destaque",
                          ]
                        : ["Nome do site"]
                ).map((f) => (
                  <label key={f}>
                    {f}
                    <textarea
                      value={settings[section + f] || ""}
                      placeholder={
                        f === "Nome"
                          ? "Caroline Gonçalves"
                          : f === "E-mail"
                            ? "jornalistacarolinegoncalves@gmail.com"
                            : f
                      }
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          [section + f]: e.target.value,
                        })
                      }
                    />
                  </label>
                ))}
                <button className="primary">Salvar alterações</button>
              </form>
            </>
          )}
          {toast && (
            <div className="admin-toast" role="status">
              ✓ {toast}
            </div>
          )}
          {deleting !== null && (
            <div
              className="confirm-overlay"
              role="dialog"
              aria-modal="true"
              aria-label="Excluir registro"
            >
              <section>
                <h2>Excluir este registro?</h2>
                <p>
                  Você pode cancelar antes de remover o conteúdo da
                  demonstração.
                </p>
                <div>
                  <button autoFocus onClick={() => setDeleting(null)}>
                    Cancelar
                  </button>
                  <button
                    className="danger-button"
                    onClick={() => {
                      update(records.filter((r) => r.id !== deleting));
                      setDeleting(null);
                      setToast("Remoção em processamento");
                    }}
                  >
                    Excluir registro
                  </button>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
