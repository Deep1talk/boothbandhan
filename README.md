# Boothbandhan

Boothbandhan is a Next.js 16 application with role-based dashboards, authentication, leader/candidate/admin workflows, help-desk flows, and payment handling.

## Local Development

```bash
npm install
npm run dev
```

The app expects environment variables in a local `.env` file. Use `.env.example` as the starting point.

## Vercel Deployment

This project can be deployed directly to Vercel as a standard Next.js app.

1. Import the repository into Vercel.
2. Keep the framework preset as `Next.js`.
3. Add all variables from `.env.example` in the Vercel project settings.
4. Set `NEXT_PUBLIC_URL` to your production domain, for example `https://your-project.vercel.app`.
5. Deploy.

Additional deployment notes are documented in [docs/DEPLOY_VERCEL.md](/E:/Boothbandhan/my-app/docs/DEPLOY_VERCEL.md).
