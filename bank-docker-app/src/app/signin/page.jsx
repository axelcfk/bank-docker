"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  async function handleSignIn(e) {
    e.preventDefault();

    try {
      const response = await fetch("http://13.48.57.238:5009/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        throw new Error("Failed to sign in");
      }

      const data = await response.json();

      if (data.token && data.userId) {
        // Kolla så  att både token och userId finns
        localStorage.setItem("token", data.token); // Lägg till token i local storage
        localStorage.setItem("userId", data.userId); // Lägg till userId i local storage
        router.push("/userpage"); // Gå till userpage
      } else {
        throw new Error("Authentication failed, no token or userId received.");
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  return (
    <div className="sign-in-overlay flex flex-col bg-cover bg-[url('/rock2.jpg')]">
      <div className="px-8">
        <div className="bg-slate-200 h-full rounded-lg px-10 text-slate-950 flex flex-col justify-center items-center mb-10 text-xl font-semibold ">
          <div className=" w-full flex justify-end items-center">
            <div className=" ">
              <Link className="no-underline" href="/">
                <button className="bg-slate-50 h-8 w-8 text-xlflex justify-center items-center rounded-full border-none hover:bg-slate-300 hover:cursor-pointer -mr-5">
                  ✕
                </button>
              </Link>
            </div>
          </div>

          <h2 className="mb-10">Welcome</h2>
          <form onSubmit={handleSignIn}>
            <input
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              value={username}
              placeholder="   Username"
              required
              autoFocus
              className="text-center h-10 w-full rounded-xl border-none text-xl"
            />

            <input
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              value={password}
              placeholder="   Password"
              required
              className="text-center h-10 my-5 w-full rounded-xl border-none text-xl"
            />
            <button
              type="submit"
              className="p-2 hover:cursor-pointer border-none h-10 w-full rounded-full text-base  text-slate-200 bg-blue-950 hover:bg-blue-900"
            >
              Sign in
            </button>
          </form>

          <p className="text-sm text-slate-950">
            Do you not have an account?{" "}
            <Link className="no-underline text-blue-700" href="/signup">
              Sign up here!
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
