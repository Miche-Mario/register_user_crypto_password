var API = "https://staging.backend.leihia.com:8081/app/tech-test";

var form = document.getElementById("register-form");
var pwdIn = document.getElementById("password-input");
var hashOut = document.getElementById("hash-preview");
var photoIn = document.getElementById("photo-input");
var photoLink = document.getElementById("photo-url");
var photoEmpty = document.getElementById("photo-url-empty");
var photoImg = document.getElementById("photo-thumb");
var customs = document.getElementById("custom-fields");
var addCustom = document.getElementById("add-custom-field");
var rowTpl = document.getElementById("custom-field-template");
var statusEl = document.getElementById("status");
var submitBtn = document.getElementById("submit-btn");

var blobUrl = null;

function sha256(s) {
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)).then(function (buf) {
    var hex = "";
    var a = new Uint8Array(buf);
    for (var i = 0; i < a.length; i++) hex += a[i].toString(16).padStart(2, "0");
    return hex;
  });
}

function readAsDataUrl(file) {
  return new Promise(function (res, rej) {
    var r = new FileReader();
    r.onload = function () {
      res(r.result);
    };
    r.onerror = function () {
      rej(r.error);
    };
    r.readAsDataURL(file);
  });
}

pwdIn.oninput = function () {
  var v = pwdIn.value;
  if (!v) {
    hashOut.textContent = "—";
    return;
  }
  sha256(v).then(function (h) {
    if (pwdIn.value === v) hashOut.textContent = h;
  });
};

photoIn.onchange = function () {
  if (blobUrl) {
    URL.revokeObjectURL(blobUrl);
    blobUrl = null;
  }
  photoImg.hidden = true;
  photoLink.hidden = true;
  photoEmpty.hidden = false;
  photoLink.removeAttribute("href");

  var f = photoIn.files[0];
  if (!f) return;

  blobUrl = URL.createObjectURL(f);
  photoLink.href = blobUrl;
  photoLink.textContent = blobUrl;
  photoLink.hidden = false;
  photoEmpty.hidden = true;
  photoImg.src = blobUrl;
  photoImg.hidden = false;
};

addCustom.onclick = function () {
  var frag = rowTpl.content.cloneNode(true);
  var row = frag.querySelector(".custom-row");
  row.querySelector(".remove-custom").onclick = function () {
    row.remove();
  };
  customs.appendChild(frag);
};

form.onsubmit = async function (e) {
  e.preventDefault();
  if (!form.reportValidity()) return;

  if (!crypto.subtle) {
    statusEl.className = "status error";
    statusEl.textContent = "Hash SHA-256 : utilise localhost ou HTTPS, pas file://.";
    return;
  }

  submitBtn.disabled = true;
  statusEl.className = "status pending";
  statusEl.textContent = "Envoi…";

  try {
    var fd = new FormData(form);
    var file = photoIn.files[0];
    var body = {
      nom: fd.get("nom").trim(),
      prenom: fd.get("prenom").trim(),
      adresse: fd.get("adresse").trim(),
      email: fd.get("email").trim(),
      telephone: fd.get("telephone").trim(),
      motDePasseSha256: await sha256(fd.get("motDePasse")),
      photoProfil: {
        blobUrl: blobUrl,
        nomFichier: file ? file.name : null,
        typeMime: file ? file.type : null,
        dataUrl: file ? await readAsDataUrl(file) : null,
      },
    };

    customs.querySelectorAll(".custom-row").forEach(function (row) {
      var key = row.querySelector(".custom-label").value.trim();
      if (key && !Object.prototype.hasOwnProperty.call(body, key))
        body[key] = row.querySelector(".custom-value").value;
    });

    var res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.status === 200) {
      statusEl.className = "status success";
      statusEl.textContent = "Ok, 200.";
    } else {
      var txt = await res.text();
      statusEl.className = "status error";
      statusEl.textContent =
        "Pas 200 (" + res.status + ")" + (txt && txt.length < 300 ? " — " + txt : "");
    }
  } catch (err) {
    statusEl.className = "status error";
    statusEl.textContent = err.message || String(err);
  } finally {
    submitBtn.disabled = false;
  }
};
