# Registro de decisiones

## Supuestos razonables y reversibles que tomé para poder avanzar

Estos no bloquean el trabajo; si quieres cambiarlos, dímelo y se ajustan sin rehacer
nada de fondo.

| Decisión | Qué asumí | Por qué | Qué tan reversible |
|---|---|---|---|
| Ubicación del proyecto | `~/Code/ingles-app`, fuera de la carpeta de Google Drive | Un proyecto Next.js genera miles de archivos (`node_modules`) que Google Drive intentaría sincronizar constantemente — lento y propenso a conflictos | Alta — es solo una carpeta, se puede mover |
| Stack técnico | Next.js + Supabase + Vercel | Cubre persistencia, auth, storage y sync entre dispositivos con un solo proveedor administrado, mantenible por una persona | Media — las integraciones de IA y el frontend quedan igual; cambiar de Supabase implicaría migrar datos, no rediseñar |
| Proveedor de IA por defecto | Anthropic (tutor/texto), adaptador genérico para TTS/STT | Intercambiable por diseño (`LLMProvider`/`TTSProvider`/`STTProvider`) | Alta — es config, no arquitectura |
| Configuración inicial | 45 min, 5 días/semana | Es el valor de respaldo que el propio encargo define si no completas el perfil | Alta — editable en Configuración en cualquier momento |
| Variedad de inglés por defecto (audio generado) | Inglés general americano | Es la opción más disponible por defecto en la mayoría de motores de voz; la exposición gradual a otras variedades (incluida británica) está en el currículo igual, independientemente de la voz de producción | Alta — configurable, y el onboarding te pregunta tu preferencia real |
| Idioma de apoyo inicial | Mayoritariamente español, decreciente con el nivel | Pedido explícito del encargo | Alta — ajustable manualmente en todo momento |

## Lo que sí necesito que resuelvas (no ahora, cuando quieras avanzar a Etapa 2 con infraestructura real)

Esto **no bloquea** el diseño ni el desarrollo local/mock, pero sí bloquea la
sincronización real entre dispositivos y las respuestas reales de IA:

1. **Crear una cuenta en Supabase** (plan gratuito alcanza) — no puedo crear cuentas
   en tu nombre.
2. **Crear una cuenta en Vercel** (plan gratuito alcanza) para desplegar en una
   dirección HTTPS real.
3. **Obtener una clave de API de Anthropic** (tutor de IA) y, si quieres voz de
   calidad en vez del sintetizador del navegador, una clave del proveedor de TTS/STT
   que prefieras.
4. **Un techo de gasto mensual con el que te sientas cómodo** para el punto 3 (hoy
   asumo un valor conservador en `config/thresholds.json`, editable).

Cuando tengas lo anterior (o parte de ello), lo conectamos sin rediseñar nada — es
exactamente para eso que existen los adaptadores de `01-architecture.md`.

## Cómo cambiar un supuesto

Dímelo en cualquier momento ("cambia la ubicación del proyecto a X", "no quiero usar
Supabase, prefiero Y"). Como nada de Etapa 2 en adelante depende de forma
irreversible de estos supuestos, el costo de cambiarlos ahora es bajo.
