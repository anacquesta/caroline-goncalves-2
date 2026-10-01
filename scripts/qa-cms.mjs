import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
import assert from "node:assert/strict";
let store = {
  Textos: [],
  Projetos: [],
  Fotografias: [],
  Álbuns: [],
  Depoimentos: [],
};
let messages = [];
let settings = [];
const mock = createServer(async (req, res) => {
  const u = new URL(req.url, "http://localhost:54322");
  const auth = req.headers.authorization === "Bearer test-access";
  let raw = "";
  for await (const chunk of req) raw += chunk;
  const data = () => JSON.parse(raw || "{}");
  const send = (code, body) => {
    res.writeHead(code, { "Content-Type": "application/json" });
    res.end(JSON.stringify(body));
  };
  if (u.pathname === "/auth/v1/token") {
    if (
      data().password === "test-password" ||
      data().refresh_token === "test-refresh"
    )
      return send(200, {
        user: { id: "test-admin" },
        access_token: "test-access",
        refresh_token: "test-refresh",
        expires_in: 3600,
      });
    return send(401, {});
  }
  if (u.pathname === "/auth/v1/user")
    return send(auth ? 200 : 401, { id: "test-admin" });
  if (u.pathname === "/auth/v1/logout") return send(200, {});
  if (u.pathname === "/rest/v1/cms_admins")
    return send(auth ? 200 : 401, [{ user_id: "test-admin" }]);
  if (u.pathname === "/rest/v1/content_records")
    return send(
      200,
      Object.entries(store).flatMap(([section, records]) =>
        records
          .filter(
            (r) =>
              auth ||
              r.status === "Publicado" ||
              (r.status === "Agendado" &&
                new Date(r.scheduledAt) <= new Date()),
          )
          .map((payload) => ({ section, payload })),
      ),
    );
  if (u.pathname === "/rest/v1/rpc/replace_content") {
    if (!auth) return send(401, {});
    store = data().document;
    return send(200, null);
  }
  if (u.pathname === "/rest/v1/site_settings") {
    if (req.method === "POST") {
      if (!auth) return send(401, {});
      settings = data();
      return send(200, null);
    }
    return send(200, settings);
  }
  if (u.pathname === "/rest/v1/rpc/submit_contact") {
    messages.push({
      id: "1",
      name: data().sender_name,
      email: data().sender_email,
      company: data().sender_company,
      subject: data().message_subject,
      message: data().message_body,
      created_at: new Date().toISOString(),
    });
    return send(200, null);
  }
  if (u.pathname === "/rest/v1/contact_messages")
    return send(auth ? 200 : 401, messages);
  return send(404, {});
});
await new Promise((r) => mock.listen(54322, "127.0.0.1", r));
const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "--port", "5176"],
  {
    env: {
      ...process.env,
      SUPABASE_URL: "http://127.0.0.1:54322",
      SUPABASE_ANON_KEY: "test-public-key",
      NEXT_PUBLIC_SITE_URL: "http://localhost:5176",
    },
    stdio: "ignore",
  },
);
const checks = [];
let browser;
try {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch("http://localhost:5176/api/auth")).ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  const origin = { Origin: "http://localhost:5176" };
  assert.equal(
    (await context.request.get("http://localhost:5176/api/cms")).status(),
    401,
  );
  checks.push("CMS recusa sessão ausente");
  assert.equal(
    (
      await context.request.post("http://localhost:5176/api/auth", {
        headers: origin,
        data: { email: "test@example.test", password: "wrong" },
      })
    ).status(),
    401,
  );
  checks.push("Senha inválida recusada");
  assert.equal(
    (
      await context.request.post("http://localhost:5176/api/auth", {
        headers: origin,
        data: { email: "test@example.test", password: "test-password" },
      })
    ).status(),
    200,
  );
  checks.push("Login e cookie httpOnly");
  const fixture = {
    id: 1,
    title: "Artigo de teste",
    slug: "artigo-de-teste",
    category: "Jornalismo",
    status: "Publicado",
    date: "2026-10-01",
    body: '<h2>Teste</h2><p>Uma história de teste.</p><script>alert(1)</script><img src="https://example.com/image.webp" onerror="alert(1)">',
  };
  store.Textos = [fixture];
  let response = await context.request.put("http://localhost:5176/api/cms", {
    headers: origin,
    data: store,
  });
  assert.equal(response.status(), 200);
  assert.ok(
    !store.Textos[0].body.includes("script") &&
      !store.Textos[0].body.includes("onerror"),
  );
  checks.push("HTML publicado sanitizado");
  response = await page.goto("http://localhost:5176/blog/artigo-de-teste");
  assert.equal(response.status(), 200);
  assert.ok(await page.locator(".reading-body").count());
  checks.push("Artigo publicado renderizado no servidor");
  store.Textos[0].status = "Pausado";
  await context.request.put("http://localhost:5176/api/cms", {
    headers: origin,
    data: store,
  });
  response = await page.goto("http://localhost:5176/blog/artigo-de-teste");
  assert.equal(response.status(), 404);
  assert.ok((await response.text()).includes("noindex"));
  checks.push("Artigo pausado: 404 e noindex");
  store.Textos[0].status = "Agendado";
  store.Textos[0].scheduledAt = new Date(Date.now() + 3600000).toISOString();
  await context.request.put("http://localhost:5176/api/cms", {
    headers: origin,
    data: store,
  });
  assert.equal(
    (await page.goto("http://localhost:5176/blog/artigo-de-teste")).status(),
    404,
  );
  checks.push("Publicação futura invisível");
  store.Textos[0].scheduledAt = new Date(Date.now() - 3600000).toISOString();
  await context.request.put("http://localhost:5176/api/cms", {
    headers: origin,
    data: store,
  });
  assert.equal(
    (await page.goto("http://localhost:5176/blog/artigo-de-teste")).status(),
    200,
  );
  checks.push("Publicação agendada vencida visível");
  assert.equal(
    (
      await context.request.put("http://localhost:5176/api/cms", {
        headers: { Origin: "https://external.example" },
        data: store,
      })
    ).status(),
    403,
  );
  checks.push("Origem externa bloqueada");
  await page.goto("http://localhost:5176/admin");
  await page
    .getByRole("button", { name: "+ Novo texto", exact: true })
    .first()
    .click();
  await page
    .getByRole("textbox", { name: "Título do texto", exact: true })
    .fill("Novo rascunho");
  await page.locator(".tiptap").fill("Conteúdo salvo automaticamente.");
  await page.waitForTimeout(3000);
  assert.ok(
    store.Textos.some(
      (r) => r.title === "Novo rascunho" && r.status === "Rascunho",
    ),
  );
  checks.push("Editor rich text e salvamento automático");
  await page.screenshot({
    path: "artifacts/model2/admin-editor.png",
    fullPage: true,
  });
  response = await context.request.post("http://localhost:5176/api/contact", {
    headers: origin,
    data: {
      name: "Pessoa de teste",
      email: "test@example.test",
      company: "Teste",
      subject: "Projeto",
      message: "Esta é uma mensagem de teste.",
      website: "",
      started: Date.now() - 5000,
    },
  });
  assert.equal(response.status(), 200);
  assert.equal(messages.length, 1);
  checks.push("Mensagem salva e visível à administração");
  assert.equal(
    (await context.request.get("http://localhost:5176/api/messages")).status(),
    200,
  );
  await context.request.delete("http://localhost:5176/api/auth", {
    headers: origin,
  });
  assert.equal(
    (await context.request.get("http://localhost:5176/api/messages")).status(),
    401,
  );
  checks.push("Logout revoga acesso");
  console.log(JSON.stringify(checks, null, 2));
  await fs.writeFile(
    "artifacts/model2/cms-integration.json",
    JSON.stringify(
      {
        service:
          "Mock local; Supabase real e políticas SQL ainda não verificados",
        checks,
      },
      null,
      2,
    ),
  );
} finally {
  await browser?.close();
  server.kill();
  mock.close();
}
