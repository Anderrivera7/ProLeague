# Checklist de producción — ProLeague

## Antes del primer deploy

1. **Variables de entorno** (copia desde `.env.example`):
   - `DATABASE_URL` / `DIRECT_URL` (Supabase session pooler IPv4)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
   - `NEXT_PUBLIC_APP_URL` = URL pública HTTPS (sin `/` final)
   - `NEXT_PUBLIC_APP_NAME` (opcional)

2. **Supabase**
   - Redirect URLs OAuth: `{APP_URL}/auth/callback` y `{APP_URL}/api/auth/google/callback`
   - Bucket `avatars` (público lectura / auth escritura) si usas avatares

3. **Base de datos**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```
   No uses `db push` en producción.
   No ejecutes `npm run db:seed` ni `seed:users` en prod.

4. **Build**
   ```bash
   npm ci
   npx prisma generate
   npm run build
   ```

## Seguridad mínima ya cubierta

- Solo el creador genera el fixture
- Resultados de jugadores requieren confirmación del rival
- Seed bloqueado si `NODE_ENV=production` (salvo `ALLOW_PROD_SEED=true`)
- Páginas `not-found` / `error` / `global-error`

## Post-launch recomendado

- [ ] Sentry u otro error tracking
- [ ] CI: `lint` + `build` en PRs
- [ ] Rate limiting en login / reportar resultado
- [ ] Política de privacidad y términos
- [ ] Chat en realtime (hoy hace polling)
