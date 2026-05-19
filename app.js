const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.send(`
        <h1>Skyapp</h1>

        <form id="form">
            <input type="text" id="name" placeholder="Navn" /><br><br>
            <input type="email" id="email" placeholder="E-post" /><br><br>

            <select id="status">
                <option>Aktiv</option>
                <option>Inaktiv</option>
            </select>

            <br><br>

            <button type="submit">Send</button>
        </form>

        <script>
            document.getElementById("form").addEventListener("submit", async (e) => {
                e.preventDefault();

                const data = {
                    name: document.getElementById("name").value,
                    email: document.getElementById("email").value,
                    status: document.getElementById("status").value
                };

                const response = await fetch("/api/submit", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                alert(result.message);
            });
        </script>
    `);
});

const GOOGLE_SHEETS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzfEZrrbWWcdPZ_ZOaUnY3QbjhekykIaCi3Npy2ZoCyGgmWNCyOYKSOabC_V3crGNTy/exec";

app.post("/api/submit", async (req, res) => {
    console.log("Mottok data fra frontend:", req.body);

    try {
        // Videresend dataene til Google Sheets via et POST-kall
        const googleResponse = await fetch(GOOGLE_SHEETS_SCRIPT_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(req.body) // Sender { name, email, status } videre
        });

        const googleResult = await googleResponse.json();
        console.log("Svar fra Google Sheets:", googleResult);

        // Hvis alt gikk bra, send suksess-svar tilbake til nettleseren (frontend)
        res.json({
            message: "Suksess! Data er mottatt og lagret i Google Sheets.",
            received: req.body
        });

    } catch (error) {
        console.error("Feil ved lagring til Google Sheets:", error);
        
        // Hvis noe feiler, gi beskjed til frontend
        res.status(500).json({
            message: "Klarte ikke å lagre data i Google Sheets.",
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("Server kjører på port " + PORT);
});