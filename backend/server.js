import express from "express";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import bodyParser from "body-parser";
import cors from "cors";
import crypto from "crypto";

const app = express();
const port = 5009;

//Middleware

app.use(cors());

app.use(bodyParser.json());

// connect to DB
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "banksql",
  // port: 8889,
  port: 3307,
});

// help function to make code look nicer
async function query(sql, params) {
  const [results] = await pool.execute(sql, params);
  return results;
}

function generateOTP() {
  return crypto.randomBytes(16).toString("hex"); // Generera ett OTP med crypto
}

// Routes

///Skapa användare
app.post("/users", async (req, res) => {
  const { username, password } = req.body;
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  try {
    const userExists = await query("SELECT * FROM users WHERE username =?", [
      username,
    ]);

    if (userExists.length > 0) {
      return res.status(400).json({ message: "This user already exists" });
    }

    const result = await query(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, hashedPassword]
    );
    const userId = result.insertId; // Få ID från nyss skapad användare

    // Skapa konto med initialt saldo
    await query("INSERT INTO accounts (user_id, amount) VALUES (?, ?)", [
      userId,
      0,
    ]);

    res.status(201).json({ message: "User created" });
  } catch (error) {
    res.status(500).json({ message: "Error creating user" });
  }
});

//////////////////LOGGA IN/////////////////

app.post("/sessions", async (req, res) => {
  console.log("Login attempt:", req.body);

  const { username, password } = req.body;
  try {
    const user = await query(
      "SELECT id, password FROM users WHERE username = ?",
      [username]
    );
    console.log("User fetch result:", user);

    if (user.length > 0) {
      const userData = user[0];
      const passwordIsValid = await bcrypt.compare(password, userData.password);
      console.log("Password validation result:", passwordIsValid);

      if (passwordIsValid) {
        const token = generateOTP();
        console.log("Generated Token:", token);

        await query("INSERT INTO sessions (user_id, token) VALUES (?, ?)", [
          userData.id,
          token,
        ]);
        res.json({ message: "Login successful", token, userId: userData.id });
      } else {
        console.log("Invalid password");
        res.status(401).json({ message: "Invalid credentials" });
      }
    } else {
      console.log("User not found");
      res.status(401).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Error logging in user");
  }
});

//////////////VISA SALDO//////////////

app.post("/me/accounts", async (req, res) => {
  const { userId, token } = req.body;

  try {
    //Kolla om det finns en valid session
    const validSession = await query(
      "SELECT * FROM sessions WHERE user_id = ? AND token = ?",
      [userId, token]
    );

    // Om inte returnera med felmeddelande
    if (validSession.length === 0) {
      return res.status(401).json({ message: "Invalid or expired session" });
    }

    // Annars hämta account-uppgifter baserat på id
    const account = await query("SELECT * FROM accounts WHERE user_id = ?", [
      userId,
    ]);

    // om inget konto returnera med felmeddelande
    if (account.length === 0) {
      return res.status(404).json({ message: "Account not found" });
    }

    // annars returnera account
    res.json({ amount: account[0].amount });
  } catch (error) {
    // If an error occurs during the process, return with a server error message
    console.error("Error fetching account data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/////////////DEPOSIT//////////////

app.post("/me/accounts/deposit", async (req, res) => {
  console.log("Transaction request received", req.body);

  const { userId, token, amount } = req.body;

  // Kolla om sessionen finns och om token och userId matchar - då blir det en valid session
  const validSession = await query(
    "SELECT * FROM sessions WHERE user_id = ? AND token =?",
    [userId, token]
  );

  //Om inte - returnera med felmeddelande till clienten
  if (!validSession) {
    console.log("Invalid or expired session.");
    return res.status(401).json({ message: "Invalid or expired session." });
  }

  // Hitta kontot och fortsätt med transaktionen
  const account = await query("SELECT * FROM accounts WHERE user_id =?", [
    userId,
  ]);

  //Om inte - returnera med felmeddelande till clienten
  if (!account) {
    console.log("Account not found.");
    return res.status(404).json({ message: "Account not found." });
  }
  console.log(`Original amount: ${account.amount}`);

  const newAmount = account[0].amount + parseFloat(amount);

  await query("UPDATE accounts SET amount =? WHERE user_id =?", [
    newAmount,
    userId,
  ]);
  console.log(`New amount: ${newAmount}`);

  //skicka kontot med nya saldot till clienten
  res.json({ message: "Deposit successful", newBalance: newAmount });
});

/////////////WITHDRAW//////////////

app.post("/me/accounts/withdraw", async (req, res) => {
  console.log("Withdrawal request received", req.body);

  const { userId, token, amount } = req.body;

  // Kolla om sessionen finns och om token och userId matchar - då blir det en valid session
  const validSession = await query(
    "SELECT * FROM sessions WHERE user_id = ? AND token =?",
    [userId, token]
  );

  //Om inte - returnera med felmeddelande till clienten
  if (!validSession) {
    console.log("Invalid or expired session.");
    return res.status(401).json({ message: "Invalid or expired session." });
  }

  // Hitta kontot och fortsätt med transaktionen
  const account = await query("SELECT * FROM accounts WHERE user_id =?", [
    userId,
  ]);

  //Om inte - returnera med felmeddelande till clienten
  if (!account) {
    console.log("Account not found.");
    return res.status(404).json({ message: "Account not found." });
  }
  console.log(`Original amount: ${account.amount}`);

  const newAmount = account[0].amount - parseFloat(amount);

  await query("UPDATE accounts SET amount =? WHERE user_id =?", [
    newAmount,
    userId,
  ]);
  console.log(`New amount: ${newAmount}`);

  //skicka kontot med nya saldot till clienten
  res.json({ message: "Withdrawal successful", newBalance: newAmount });
});

////////ACCOUNT-BETALA//////
app.post("/me/accounts/pay", async (req, res) => {
  const { userId, token, amount } = req.body;

  // Kolla efter en valid session i sessions-arrayen baserat på matchande userId och token
  const validSession = await query(
    "SELECT user_id, token FROM sessions WHERE user_id =? AND token =?",
    [userId, token]
  );

  //Om inte - returnera med felmeddelande
  if (!validSession) {
    return res.status(401).json({ message: "Invalid or expired session" });
  }
  //annars hitta kontot som matchar userId
  // Assume this is inside your async function handling /me/accounts/pay
  const account = await query("SELECT amount FROM accounts WHERE user_id = ?", [
    userId,
  ]);

  if (account.length === 0) {
    return res.status(404).json({ message: "Account not found" });
  }

  const currentAmount = account[0].amount;
  if (currentAmount >= amount) {
    const newAmount = currentAmount - amount; // Räkna ut nya saldot

    // uppdatera databasen
    await query("UPDATE accounts SET amount = ? WHERE user_id = ?", [
      newAmount,
      userId,
    ]);

    //Skicka saldo till clienten
    res.json({ message: "Payment successful", newBalance: newAmount });
  } else {
    res.status(400).json({ message: "Insufficient funds" });
  }
});

///////////ACCOUNT-BETALA ALLT/////////
app.post("/me/accounts/pay/all", async (req, res) => {
  const { userId, token, totalAmount } = req.body;

  // Kolla efter en valid session i sessions-arrayen baserat på matchande userId och token
  const validSession = await query(
    "SELECT user_id, token FROM sessions WHERE user_id =? AND token =?",
    [userId, token]
  );

  if (validSession.length === 0) {
    return res.status(401).json({ message: "Invalid or expired session" });
  }

  //annars hitta kontot som matchar userId
  const account = await query("SELECT amount FROM accounts WHERE user_id =?", [
    userId,
  ]);

  //Om inte - returnera med felmeddelande
  if (account.length === 0) {
    return res.status(404).json({ message: "Account not found" });
  }

  const currentBalance = parseFloat(account[0].amount);
  const requestedAmount = parseFloat(totalAmount);

  if (currentBalance >= requestedAmount) {
    const newBalance = currentBalance - requestedAmount;

    await query("UPDATE accounts SET amount =? WHERE user_id =?", [
      newBalance,
      userId,
    ]);

    res.json({ message: "Payment successful", newBalance: newBalance });
  } else {
    res.json({ message: "Insuficcent funds", currentBalance: currentBalance });
  }
});

/////////////LOGGA UT///////////////
app.post("/logout", async (req, res) => {
  const { token } = req.body;

  // hitta session
  const session = await query("SELECT * FROM sessions WHERE token = ?", [
    token,
  ]);

  // om hittad, ta bort den frpn db
  if (session) {
    await query("DELETE FROM sessions WHERE token =?", [token]);
    res.json({ message: "Logout successful" });
  } else {
    res
      .status(400)
      .json({ message: "Session not found or already logged out" });
  }
});

app.get("/", (req, res) => {
  res.send("Welcome to the Banking Backend!");
});

//startar servern och gör så att appen lyssnar på port

app.listen(port, "0.0.0.0", () => {
  console.log(`Bankens backend körs på http://localhost:${port}`);
});
