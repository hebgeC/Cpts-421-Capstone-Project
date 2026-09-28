# TRM App Authentication (WordPress plugin)

Lets the app's backend verify a trm.org username/password by calling
`POST /wp-json/trm/v1/authenticate`, so the mobile app never needs a WebView
or ever sees the site's real login form. It runs `wp_authenticate()` on your
behalf and returns the WordPress user's profile if the credentials are valid.

## Install (via the wp-admin dashboard, no FTP needed)

1. In this folder, `trm-app-auth.zip` is a ready-to-upload zip of the plugin
   (contains `trm-app-auth/trm-app-auth.php`). Regenerate it any time with:
   `cd wordpress-plugin && zip -r trm-app-auth.zip trm-app-auth`
2. Log into `https://www.trm.org/wp-admin/` as an Administrator.
3. Go to **Plugins -> Add New Plugin -> Upload Plugin** (button near the top).
4. Choose `trm-app-auth.zip` from this folder and click **Install Now**.
5. Click **Activate Plugin** once install finishes.
6. Confirm the site is served over HTTPS. WordPress Application Passwords are
   disabled over plain HTTP by default.
7. Make sure the admin account whose Application Password the backend uses
   has the `manage_options` capability (i.e. is an Administrator) - the
   endpoint refuses any caller that isn't an admin, since it's effectively a
   password-verification oracle and must stay locked down to just your
   backend server.

If you ever get direct file access to the server (SFTP or a hosting file
manager), you can instead drop `trm-app-auth/trm-app-auth.php` into
`wp-content/mu-plugins/trm-app-auth.php` (the file directly, not the folder) -
"must-use" plugins load automatically with no Activate step and can't be
accidentally deactivated from the Plugins screen.

## Wire up the backend

In `backend/.env` (create it if missing, it's gitignored):

```
WP_SITE_URL=https://www.trm.org
WP_ADMIN_USERNAME=your-wp-admin-username
WP_ADMIN_APP_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx
JWT_SECRET=some-long-random-string
```

- `WP_ADMIN_APP_PASSWORD` is the Application Password you generated for your
  own admin account under **Users -> Profile -> Application Passwords**.
  Keep the spaces exactly as WordPress displays them, or strip them - either
  works, WordPress ignores spaces in the value.
- `JWT_SECRET` is only used by this app's backend to sign its own session
  tokens (separate from anything WordPress issues) - generate any long random
  string, e.g. `openssl rand -hex 32`.
- This admin credential must never be sent to or stored on a mobile device.
  It lives only in `backend/.env`, on the server.

## What this endpoint is (and isn't)

- It is a narrow, throttled, admin-only bridge: "is this trm.org
  username/password valid, and if so, who is it." It returns basic profile
  fields only (id, username, display name, email, avatar, roles).
- It is not a general-purpose WordPress API proxy, and it does not expose
  application passwords, real passwords, or any other WP secrets in its
  response.
- Failed attempts are rate-limited per username+IP (10 attempts / 15 minutes)
  to reduce brute-force risk. Consider also restricting
  `/wp-json/trm/v1/authenticate` to your backend server's outbound IP at the
  host/firewall level if your hosting provider supports it, for
  defense-in-depth.
