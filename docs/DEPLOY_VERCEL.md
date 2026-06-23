# Deploying To Vercel

## What Vercel Needs

This app is a normal Next.js server deployment. It uses:

- MongoDB through server route handlers
- SMTP for email delivery
- Razorpay keys for payment flows
- Cloudinary credentials for profile image uploads

No custom `vercel.json` is required for a basic deployment.

## Before You Deploy

1. Make sure the project repository is pushed from a clean branch.
2. Ensure your MongoDB instance allows connections from Vercel.
3. Collect the production values for every variable in `.env.example`.
4. Decide the production site URL you want to use for `NEXT_PUBLIC_URL`.

## Vercel Steps

1. Open Vercel and choose `Add New Project`.
2. Import this repository.
3. Confirm these defaults:
   Framework Preset: `Next.js`
   Build Command: `next build`
   Install Command: `npm install`
4. Add the environment variables from `.env.example` to Production.
5. Deploy.

## Important Variables

- `NEXT_PUBLIC_URL`
  Use your production domain, such as `https://boothbandhan.vercel.app`.
- `SECRET_KEY`
  Required for email verification token generation.
- `AUTH_SECRET`
  Recommended so auth cookies and auth token verification use a dedicated secret.
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`
  Required on the client for checkout.
- `RAZORPAY_KEY_SECRET`
  Required on the server for order verification.

## Post-Deploy Checks

After the first deployment, verify:

1. Login works.
2. Verification emails use the production URL.
3. MongoDB-backed pages load on dashboards.
4. Profile image upload works.
5. Razorpay order creation and payment confirmation work.

## Build Note

The root layout uses `next/font/google` for the `Assistant` font. In restricted local environments this may fail during build because Google Fonts cannot be reached. Vercel normally has network access during build, so this is usually not a production blocker.
