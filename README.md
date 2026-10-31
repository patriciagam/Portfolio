# Developer Portfolio

My developer portfolio, built with Next.js and TypeScript and deployed on Cloudflare Workers. Designed in Figma.

🔗 **Live site:** [patriciagameiro.com](https://patriciagameiro.com)

## Pages

- `/` About: a short introduction, my technical skills, a CV download and links to my LinkedIn and GitHub
- `/education` Education: my academic background
- `/experience` Experience: my work, teaching and team experience
- `/projects` Projects: fetched from the GitHub API, so it stays up to date with my repositories
- `/contact` Contact: how to reach me

My CV is served as a static PDF at `/cv.pdf`.

## Tech stack

- Next.js
- TypeScript
- HTML and CSS
- GitHub API (projects)
- Figma (design)
- Cloudflare Workers (hosting)

## Design

I designed the interface in Figma and exported the decorative graphics as SVGs, which are served from `public/figma/`.

## Running it locally

```bash
git clone https://github.com/patriciagam/<repo-name>.git
cd <repo-name>
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Building for production

```bash
npm run build
```

## Deployment

The site is deployed on Cloudflare Workers.
