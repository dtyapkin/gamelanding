import { promises as dns } from "node:dns";
import net from "node:net";
import tls from "node:tls";

export const dynamic = "force-dynamic";

type Probe = Record<string, unknown>;

function tcpProbe(host: string, port: number, timeoutMs = 8000): Promise<Probe> {
  return new Promise((resolve) => {
    const started = Date.now();
    const socket = net.connect({ host, port });
    const done = (result: Probe) => {
      try { socket.destroy(); } catch {}
      resolve(result);
    };
    socket.setTimeout(timeoutMs);
    socket.on("connect", () => done({ ok: true, ms: Date.now() - started }));
    socket.on("timeout", () => done({ ok: false, error: "таймаут " + timeoutMs + "мс" }));
    socket.on("error", (e: NodeJS.ErrnoException) =>
      done({ ok: false, error: e.code + " " + (e.message || "").slice(0, 90) }),
    );
  });
}

function smtpHandshake(port: number, user: string, pass: string): Promise<Probe> {
  return new Promise((resolve) => {
    const started = Date.now();
    let stage = "connect";
    const out: Probe = { port, ok: false, stage };

    const socket = port === 465
      ? tls.connect({ host: "smtp.yandex.ru", port, servername: "smtp.yandex.ru", timeout: 10000 })
      : net.connect({ host: "smtp.yandex.ru", port });

    const finish = () => {
      try { socket.destroy(); } catch {}
      resolve({ ...out, ms: Date.now() - started });
    };

    let buf = "";
    const waiters: ((s: string) => void)[] = [];
    const read = () =>
      new Promise<string>((res, rej) => {
        const t = setTimeout(() => rej(new Error("таймаут ответа")), 10000);
        waiters.push((s) => { clearTimeout(t); res(s); });
      });

    socket.on("data", (d) => {
      buf += d.toString("utf8");
      if (buf.includes("\r\n")) {
        const w = waiters.shift();
        const chunk = buf;
        buf = "";
        if (w) w(chunk.trim());
      }
    });

    const send = async (cmd: string) => {
      socket.write(cmd + "\r\n");
      return await read();
    };
    const code = (s: string) => parseInt(s.slice(0, 3), 10);

    (async () => {
      try {
        const banner = await read();
        out.banner = banner.slice(0, 90);
        out.bannerCode = code(banner);
        stage = "ehlo";
        out.stage = stage;
        const ehlo = await send("EHLO gamedive.ru");
        out.ehloCode = code(ehlo);
        if (code(ehlo) !== 250) { out.error = "EHLO отклонён"; return finish(); }

        stage = "auth";
        out.stage = stage;
        // Пароль намеренно не проверяем: он уже проверен отдельно, и незачем
        // класть секрет в окружение приложения.
        if (!user || !pass) {
          out.authCode = null;
          out.ok = out.bannerCode === 220 && out.ehloCode === 250;
          out.note = "дошли до EHLO: сеть и TLS исправны, вход не проверялся";
          finish();
          return;
        }
        const auth = await send(
          "AUTH PLAIN " + Buffer.from("\u0000" + user + "\u0000" + pass, "utf8").toString("base64"),
        );
        out.authCode = code(auth);
        out.ok = code(auth) === 235;
        if (!out.ok) out.error = auth.slice(0, 90);
        finish();
      } catch (e) {
        out.error = String((e as Error).message).slice(0, 120);
        finish();
      }
    })();

    socket.on("error", (e: NodeJS.ErrnoException) => {
      out.error = (e.code || "") + " " + (e.message || "").slice(0, 110);
      out.stage = stage;
      finish();
    });
    setTimeout(() => { if (!out.ok && !out.error) { out.error = "общий таймаут"; finish(); } }, 25000);
  });
}

export async function POST(request: Request) {
  const expected = process.env.DIAG_TOKEN;
  const given = request.headers.get("x-diag-token");
  if (!expected || given !== expected) {
    return new Response("not found", { status: 404 });
  }

  const user = process.env.DIAG_SMTP_USER || "";
  const pass = process.env.DIAG_SMTP_PASS || "";

  const result: Probe = {
    from: process.env.DIAG_LABEL || "unknown",
    at: new Date().toISOString(),
  };

  try {
    result.dns = await dns.lookup("smtp.yandex.ru").then(
      (a) => ({ ok: true, address: a.address, family: a.family }),
      (e) => ({ ok: false, error: String(e.message).slice(0, 100) }),
    );
  } catch (e) {
    result.dns = { ok: false, error: String((e as Error).message).slice(0, 100) };
  }

  result.tcp465 = await tcpProbe("smtp.yandex.ru", 465);
  result.tcp587 = await tcpProbe("smtp.yandex.ru", 587);
  result.tcp443 = await tcpProbe("api.gamedive.ru", 443);
  result.smtp465 = await smtpHandshake(465, user, pass);

  return Response.json(result);
}