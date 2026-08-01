# SmartTemp — API & Route Reference

## Base URLs

| Environment | Frontend | Backend API | Static/uploaded files |
|---|---|---|---|
| **Production** | `https://smarttemp.72.61.254.7.sslip.io` | `https://smarttemp.72.61.254.7.sslip.io/api` | `https://smarttemp.72.61.254.7.sslip.io/public/...` |
| **Local dev** | `http://localhost:5173` | `http://localhost:6300/api` | `http://localhost:6300/public/...` |

**Auth model:** protected endpoints require a Firebase ID token in the header
`Authorization: Bearer <idToken>`. The client attaches this automatically
(`apiClient` request interceptor). Roles: `public` (no token), `auth` (any
logged-in user), `admin` (user whose Firebase claim `admin=true`).

---

## Backend API

### Auth — `/api/auth`
| Method | Path | Access | Body / notes |
|---|---|---|---|
| POST | `/sign-up/google` | public | `{ email, name, userId }` — register or log in a Google user |
| POST | `/profile` | auth | returns the current user document |
| PATCH | `/profile/update` | auth | `{ name?, contact?, address?, city?, state?, pincode? }` (whitelisted) |
| POST | `/wishlist` | auth | returns wishlisted templates |
| POST | `/wishlist/toggle` | auth | `{ templateId }` |
| POST | `/saved-blogs` | auth | returns saved blogs |
| POST | `/saved-blogs/toggle` | auth | `{ blogId }` |

### Templates — `/api/template`
| Method | Path | Access | Body / notes |
|---|---|---|---|
| POST | `/get-all` | auth | all templates |
| POST | `/get-all-by-category` | auth | `{ template_category }` |
| POST | `/get-one/:templateId` | auth | single template |
| POST | `/download/:templateId` | auth | **gated download** — streams the deliverable file, or returns `{ link }` for link-delivered templates. Allowed only if the user purchased it, it's free, or admin. |
| POST | `/create` | admin | multipart: text fields + `card_image` (1), `template_images` (≤5), `template_file` (1 deliverable), `template_link` |
| PATCH | `/update/:templateId` | admin | JSON, or multipart to replace `template_file` |
| DELETE | `/delete/:templateId` | admin | also deletes stored images + deliverable |

### Orders — `/api/order`
| Method | Path | Access | Body / notes |
|---|---|---|---|
| POST | `/create` | auth | `{ items:[{templateId, quantity}], userEmail, userPhone, userName, userCity, userState, userCountry, userZip, paymentMethod? }` — creates order **and emails the buyer the templates** |
| POST | `/get-by-user` | auth | logged-in user's orders |
| POST | `/get-all` | admin | all orders |

### Blogs — `/api/blog`
| Method | Path | Access | Body / notes |
|---|---|---|---|
| POST | `/get-all` | auth | paginated blogs |
| POST | `/get-all-by-category` | auth | by category |
| POST | `/get-one/:blogId` | auth | single blog |
| POST | `/create` | admin | multipart (images) |
| PATCH | `/update/:blogId` | admin | multipart |
| DELETE | `/delete/:blogId` | admin | — |
| GET | `/stream/:filename` | public | streams optimized blog images |

### Admin — `/api/admin`
| Method | Path | Access | Body / notes |
|---|---|---|---|
| POST | `/` | admin | admin check / ping |
| POST | `/users` | admin | all users (with reorder flag) |
| POST | `/stats` | admin | dashboard stats |

### Contact — `/api/contact`
| Method | Path | Access | Body / notes |
|---|---|---|---|
| POST | `/create` | public | `{ name, email, comments }` |
| POST | `/get-all` | admin | all contact submissions |

---

## Frontend routes (React Router)

| Path | Page | Access |
|---|---|---|
| `/` | Home | public |
| `/login` | Login (Google) | public |
| `/templates` | Template listing | public |
| `/templates/:templateId` | Template detail + add to cart | public |
| `/blogs` | Blog listing | public |
| `/blogs/:blogId` | Blog detail | public |
| `/contact` | Contact form | public |
| `/cart` | Cart + checkout | logged-in |
| `/profile` | Profile, purchases, **downloads** | logged-in |
| `/admin/*` | Admin dashboard (templates, blogs, orders, users, stats) | admin |

---

## Server operations (VPS)

- Backend service: `systemctl {status|restart|stop} smarttemp` — logs: `journalctl -u smarttemp -f`
- App location: `/var/www/smarttemp` (server + client)
- Backend binds `127.0.0.1:6300`; nginx (`/etc/nginx/sites-available/smarttemp_nginx`) reverse-proxies `/api` and `/public`, serves `client/dist`.
- Rebuild frontend after changes:
  `cd /var/www/smarttemp/client && VITE_API_BASE_URL=https://smarttemp.72.61.254.7.sslip.io/api npm run build`
- Deliverable files (private, not web-served): `/var/www/smarttemp/server/private/templates/`
- Env: `/var/www/smarttemp/server/.env.production` (DB, EMAIL_*, CLIENT_URL)
