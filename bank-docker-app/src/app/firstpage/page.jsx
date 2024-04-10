"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function First() {
  const [signInClicked, setSignInClicked] = useState(false);
  const [signUpClicked, setSignUpClicked] = useState(false);
  const [currentText, setCurrentText] = useState("Banking done right.");
  const [animationPhase, setAnimationPhase] = useState("erasing");
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    let timer;

    const phrases = ["Banking done right.", "A better bank."];

    if (animationPhase === "erasing") {
      if (currentText.length > 0) {
        timer = setTimeout(() => {
          setCurrentText((prev) => prev.substring(0, prev.length - 1));
        }, 50); // hastighet
      } else {
        setAnimationPhase("writing");
        setCurrentPhrase((prev) => (prev === 0 ? 1 : 0)); // Toggle between phrases
      }
    } else if (animationPhase === "writing") {
      if (currentText !== phrases[currentPhrase]) {
        timer = setTimeout(() => {
          setCurrentText((prev) =>
            phrases[currentPhrase].substring(0, prev.length + 1)
          );
        }, 50); // hastighet
      } else {
        timer = setTimeout(() => {
          setAnimationPhase("erasing");
        }, 3000); //vänta 3 sek innan radera
      }
    }

    return () => clearTimeout(timer);
  }, [currentText, animationPhase, currentPhrase]);

  return (
    <div
      className="relative w-screen h-screen"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div
        className="absolute w-full h-full bg-cover bg-[url('/rock2.jpg')] opacity-100"
        style={{ zIndex: -1 }}
      ></div>

      {/* <div className="absolute top-0 right-0 pt-5 px-8"></div> */}

      <div className="flex flex-col h-full ">
        <h3 className="flex text-3xl text-slate-100 justify-start items-center px-8">
          CHAS{" "}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40px"
            height="40px"
            viewBox="0 0 24 24"
            fill="none"
            className="px-1"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21ZM6.63603 7.63605L8.05024 6.22183L13.7071 11.8787L8.05024 17.5355L6.63603 16.1213L10.8787 11.8787L6.63603 7.63605ZM16.5355 11.8787L12.2929 7.63605L13.7071 6.22183L19.364 11.8787L13.7071 17.5355L12.2929 16.1213L16.5355 11.8787Z"
              fill="rgb(226 232 240)"
            />
          </svg>
        </h3>
        <div className="flex-grow flex flex-col justify-center items-start text-gray-950 px-8 -mt-10">
          <h1 className="leading-tight	font-shippori text-6xl md:text-8xl font-thin text-left text-slate-50 -mb-2 ">
            Step into <br />
            the future <br />
            of banking
          </h1>

          <div className="h-5">
            <p className="text-3xl text-slate-50">{currentText}</p>
          </div>
        </div>
        <div className="px-8 border-t-2 border-gray-200 p-4 text-slate-50  h-32 flex flex-col justify-evenly items-start mb-20">
          <Link
            href="/signup"
            onClick={() => setSignUpClicked(true)}
            className="no-underline border-none bg-transparent flex justify-center text-slate-200 rounded-full  text-2xl hover:cursor-pointer hover:font-bold"
          >
            {" "}
            Create account &rarr;
          </Link>
          <Link
            href="/signin"
            onClick={() => setSignInClicked(true)}
            className="no-underline border-none bg-transparent  text-slate-200 rounded-full  text-2xl hover:cursor-pointer hover:font-bold"
          >
            Sign in &rarr;
          </Link>
        </div>
      </div>
      {/* {signInClicked && (
        <div className="sign-in-overlay flex flex-col">
          <div className=" fixed top-28 right-8 ">
            {" "}
            <button
              className="bg-slate-200 h-8 w-8 flex justify-center items-center rounded-full border-none hover:bg-slate-300 hover:cursor-pointer"
              onClick={() => setSignInClicked(false)}
            >
              ✕
            </button>
          </div>
          <div className="px-8">
            <div className="bg-slate-200 h-96 rounded-lg px-10 text-slate-950 flex flex-col justify-center items-center mb-10 text-xl font-semibold  hover:cursor-pointer">
              <h2>Welcome Back</h2>
              <form>
                <input
                  onChange={(e) => setUsername(e.target.value)}
                  type="text"
                  value={username}
                  placeholder="   Username"
                  required
                  className="h-10 w-full rounded-xl border-none "
                />

                <input
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  value={password}
                  placeholder="   Password"
                  required
                  className="h-10 my-5 w-full rounded-xl border-none "
                />
                <button
                  onClick={() => setBankIdClicked(true)}
                  className="p-2 hover:cursor-pointer border-none h-10 w-full rounded-full text-base  text-slate-200 bg-blue-950 hover:bg-blue-900"
                >
                  <Link
                    className="no-underline text-slate-200"
                    href={"/account-userpage"}
                  >
                    Sign in
                  </Link>{" "}
                </button>
              </form>

              <p className="text-sm text-slate-950">
                Do you not yet have an account? Sign up for one here
              </p>
            </div>
          </div>
        </div>
      )}
      {signUpClicked && (
        <div className="sign-in-overlay flex flex-col ">
          <div className=" fixed top-28 right-8 ">
            {" "}
            <button
              className="bg-slate-200 h-8 w-8 flex justify-center items-center rounded-full border-none hover:bg-slate-300 hover:cursor-pointer font-semibold"
              onClick={() => setSignUpClicked(false)}
            >
              ✕
            </button>
          </div>
          <div className="px-8">
            <div className="bg-slate-200 h-96 rounded-lg px-10 text-slate-950 flex flex-col justify-center items-center mb-10 text-xl font-semibold  hover:cursor-pointer">
              <h2>One step closer to better banking</h2>
              <form onSubmit={handleSubmit}>
                <input
                  onChange={(e) => setUsername(e.target.value)}
                  type="text"
                  value={username}
                  required
                  placeholder="   Username"
                  className="h-10 w-full rounded-xl border-none "
                />

                <input
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  value={password}
                  required
                  placeholder="   Password"
                  className="h-10 my-5 w-full rounded-xl border-none "
                />
                <button className="p-2 hover:cursor-pointer border-none h-10 w-full rounded-full text-base  text-slate-200 bg-blue-950">
                  Sign up
                </button>
              </form>

              <p className="text-sm text-slate-950">
                Do already have an account? Sign up for one here
              </p>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}

// async function handleSubmit(e) {
//   e.preventDefault();
//   console.log(`username: ${username}`);
//   console.log(`password: ${password}`);

//   try {
//     const response = await fetch("https://localhost:5000/users", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ username, password }),
//     });
//     if (!response.ok) {
//       throw new Error("Failed to create account");
//     }
//     const data = await response.json();
//     console.log(data);
//     console.log(data);
//   } catch (error) {
//     console.error(error);
//   }
// }
