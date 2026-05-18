# Formulaire d’inscription

Projet statique : formulaire HTML, POST JSON vers l’API de staging (`app.js`, constante `API`).

## Lancer en local

npx --yes serve .

## Je recois une erreur lors du test de l’API

```bash
curl --noproxy '*' -sS -X POST 'https://staging.backend.leihia.com:8081/app/tech-test' \
  -H 'Content-Type: application/json' \
  -d '{"nom":"x","prenom":"y","adresse":"z","email":"a@b.c","telephone":"0","motDePasseSha256":"00","photoProfil":{"blobUrl":null,"nomFichier":null,"typeMime":null,"dataUrl":null}}'
```

curl ne joint pas le serveur (timeout, erreur réseau), le problème vient peut etre du réseau, du pare-feu ou du service
le formulaire affiche Failed to fetch sans une requête OPTIONS (preflight CORS)

### Fichiers

`index.html`| Formulaire et gabarits  
 `styles.css`| Styles  
`app.js` | SHA‑256, champs dynamiques, fetc
