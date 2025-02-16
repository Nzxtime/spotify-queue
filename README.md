# Spotify Track Search

## Purpose

This project is a web application that allows users to search for tracks on Spotify and add them to a specified playlist - just like a public queue.

## How to Deploy

Follow these steps to deploy the Spotify Track Search application on your own server or hosting platform (e.g., Vercel).

### Prerequisites

Before you begin, ensure you have the following:
1. A **Spotify Developer Account**.
2. A **Spotify Playlist ID** (create a playlist on Spotify and get its ID from the URL).
3. A **GitHub account** (for deploying to Vercel or similar platforms).

---

### Step 1: Set Up Spotify Developer Application

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications).
2. Log in with your Spotify account.
3. Create a new application.
4. Note down the **Client ID** and **Client Secret**.
5. Set the **Redirect URI** to `http://localhost/callback/`.

---

### Step 2: Spotify Refresh Token ([credits](https://github.com/novatorem/novatorem/blob/main/SetUp.md))

### Powershell

<details>

<summary>Script to complete this section</summary>

```powershell
$ClientId = Read-Host "Client ID"
$ClientSecret = Read-Host "Client Secret"

Start-Process "https://accounts.spotify.com/authorize?client_id=$ClientId&response_type=code&scope=user-read-currently-playing,user-read-recently-played&redirect_uri=http://localhost/callback/"

$Code = Read-Host "Please insert everything after 'https://localhost/callback/?code='"

$ClientBytes = [System.Text.Encoding]::UTF8.GetBytes("${ClientId}:${ClientSecret}")
$EncodedClientInfo =[Convert]::ToBase64String($ClientBytes)

curl -X POST -H "Content-Type: application/x-www-form-urlencoded" -H "Authorization: Basic $EncodedClientInfo" -d "grant_type=authorization_code&redirect_uri=http://localhost/callback/&code=$Code" https://accounts.spotify.com/api/token
```

</details>

### Manual

- Navigate to the following URL:

```
https://accounts.spotify.com/authorize?client_id={SPOTIFY_CLIENT_ID}&response_type=code&scope=user-read-currently-playing,user-read-recently-played&redirect_uri=http://localhost/callback/
```

- After logging in, save the {CODE} portion of: `http://localhost/callback/?code={CODE}`

- Create a string combining `{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_SECRET}` (e.g. `5n7o4v5a3t7o5r2e3m1:5a8n7d3r4e2w5n8o2v3a7c5`) and **encode** into [Base64](https://base64.io/).

- Then run a [curl command](https://httpie.org/run) in the form of:

```sh
curl -X POST -H "Content-Type: application/x-www-form-urlencoded" -H "Authorization: Basic {BASE64}" -d "grant_type=authorization_code&redirect_uri=http://localhost/callback/&code={CODE}" https://accounts.spotify.com/api/token
```

- Save the Refresh token

### Step 3: Deploy to Vercel

1. Make an [Vercel](https://vercel.com/) Account and link it with GitHub
2. Fork this repository and create a Vercel project, that is linked to it
3. Add the following Environment Variables:
   ```
   CLIENT_ID=your_spotify_client_id
   CLIENT_SECRET=your_spotify_client_secret
   PLAYLIST_ID=your_spotify_playlist_id
   REFRESH_TOKEN=your_spotify_refresh_token
   ```
4. Deploy the project and open the URL
5. Test if searched songs get added


## Wanna help?

I love contributions! Whether you've spotted a bug, have a feature request, or want to improve the code, your input is highly valued. Here's how you can help:

1. **Report Bugs**: If you find a bug, please open an [issue](https://github.com/Nzxtime/spotify-queue/issues) and let us know. Be sure to include details like steps to reproduce, expected behavior, and actual behavior.

2. **Suggest Features**: Have an idea to make this project better? Share it with us by creating a new [issue](https://github.com/Nzxtime/spotify-queue/issues) and describing your suggestion.

3. **Contribute Code**: Want to fix a bug or implement a feature? Fork the repository, create a branch, and submit a pull request.

4. **Improve Documentation**: Found a typo or unclear section? Even small improvements to the docs are appreciated!

Every contribution is welcome!

---