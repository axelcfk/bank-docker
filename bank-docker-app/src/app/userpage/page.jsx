"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Clock from "../clock";

export default function UserPage() {
  const router = useRouter();

  const [deposit, setDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdraw, setWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [balance, setBalance] = useState(0);
  const [logOut, setLogOut] = useState(false);
  const [totalPayments, setTotalPayments] = useState();
  const [payAll, setPayAll] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [paymentVisibility, setPaymentVisibility] = useState({
    Mobile: true,
    Internet: true,
    Electricity: true,
    Gym: true,
    Netflix: true,
  });

  console.log(depositAmount);
  console.log(deposit);

  console.log(balance);
  const [token, setToken] = useState("");

  async function fetchBalance() {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`http://13.60.52.124:4002/me/accounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ userId, token }),
      });
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      const data = await response.json();
      setBalance(data.amount);
    } catch (error) {
      console.error("Fetch balance error:", error.message);
    }
  }

  async function handleDeposit(e) {
    e.preventDefault();

    // Hämta userId och token från localStorage
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    const amount = parseFloat(depositAmount); // Gör till siffra

    try {
      const response = await fetch(
        `http://13.60.52.124:4002/me/accounts/deposit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId, token, amount }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to deposit");
      }

      // Hämta det uppdaterade saldot efter deposit
      fetchBalance();
    } catch (error) {
      console.error("Deposit error:", error.message);
    }
    setDeposit(false);
  }

  async function handleWithdraw(e) {
    e.preventDefault();

    // Hämta userId och token från localStorage
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    const amount = parseFloat(withdrawAmount); // Gör till siffra

    try {
      const response = await fetch(
        `http://13.60.52.124:4002/me/accounts/withdraw`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId, token, amount }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to withdraw");
      }

      // Hämta det uppdaterade saldot efter deposit
      fetchBalance();
    } catch (error) {
      console.error("Withdraw error:", error.message);
    }
    setWithdraw(false);
  }

  useEffect(() => {
    fetchBalance(); // Hämta saldo när sidan visas
    const token = localStorage.getItem("token"); // Hämta  token från localStorage
    if (token) {
      setToken(token); // Sätt state för token
    }
  }, []);

  async function handlePayment(amount, itemName) {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    // Kolla om det finns tillräckligt mycket på saldot
    if (balance >= amount) {
      try {
        const response = await fetch(
          `http://13.60.52.124:4002/me/accounts/pay`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ userId, amount, token }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Payment failed");
        }

        // Assuming the server responds with the updated balance
        const updatedData = await response.json();
        setBalance(updatedData.newBalance);

        // Set the visibility to false only if the payment was successful
        setPaymentVisibility((prev) => ({ ...prev, [itemName]: false }));

        setSuccessMessage(`Payment of ${amount} was successful.`);
      } catch (error) {
        console.error("Payment error:", error.message);
        alert(error.message);
      }
    } else {
      // Alert the user about insufficient funds
      setErrorMessage("Insufficient funds for this payment.");
    }
  }

  async function handlePayAll() {
    if (!totalPayments || balance < totalPayments) {
      setErrorMessage("Insufficient funds for this payment.");
      return;
    }

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    // Kolla om det finns tillräckligt mycket på saldot
    if (balance >= totalPayments) {
      try {
        const response = await fetch(
          `http://13.60.52.124:4002/me/accounts/pay/all`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId,
              token,
              totalAmount: totalPayments,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Payment failed");
        }

        const updatedData = await response.json();
        console.log(updatedData);

        setBalance(updatedData.newBalance);

        setPaymentVisibility({
          Mobile: false,
          Internet: false,
          Electricity: false,
          Gym: false,
          Netflix: false,
        });

        setSuccessMessage(`Payment of ${totalPayments} was successful.`);
      } catch (error) {
        console.error("Payment error:", error.message);
        alert(error.message);
      }
    } else {
      setErrorMessage("Insufficient funds for this payment.");
    }
  }

  async function handleLogOut() {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    const response = await fetch(`http://13.60.52.124:4002/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      throw new Error(`Failed to log out with status: ${response.status}`);
    }

    localStorage.removeItem("userId");
    localStorage.removeItem("token");

    router.push("/");
  }

  useEffect(() => {
    fetchBalance(); // Hämta saldo när sidan visas
    const token = localStorage.getItem("token"); // Hämta  token från localStorage
    if (token) {
      setToken(token); // Sätt state för token
    }
  }, []);

  useEffect(() => {
    const payments = {
      Mobile: 649,
      Internet: 489,
      Electricity: 310,
      Gym: 649,
      Netflix: 109,
    };

    const total = Object.keys(paymentVisibility)
      .filter((key) => paymentVisibility[key]) // Filter by visible payments
      .reduce((sum, key) => sum + payments[key], 0); // Sum up their amounts

    setTotalPayments(total);
  }, [paymentVisibility]);

  return (
    <div>
      <div
        className="absolute w-screen h-screen bg-cover bg-[url('/house.jpg')] "
        style={{ zIndex: -1 }}
      ></div>
      <div
        className="px-8 md:flex md:flex-col md:justify-center md:items-center "
        style={{ backdropFilter: "blur(3px)" }}
      >
        <div className="flex justify-between items-center md:w-full ">
          <div className="py-5  md:w-full">
            <Clock />
            <h2 className="text-slate-200 text-xl -mb-2">Your Cards</h2>
            <p className="text-slate-200 text-sm">0 physical, 1 virtual</p>
          </div>
          <div className="">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18px"
              height="18px"
              viewBox="0 0 24 24"
              fill="none"
              className="icon-link hover:cursor-pointer"
              onClick={() => setLogOut(true)}
            >
              <path
                d="M14 20H6C4.89543 20 4 19.1046 4 18L4 6C4 4.89543 4.89543 4 6 4H14M10 12H21M21 12L18 15M21 12L18 9"
                stroke="rgb(226 232 240)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <div
          id="card"
          className=" flex flex-col bg-slate-900 px-10 py-2 rounded-3xl text-slate-200 md:w-80"
        >
          <div className="flex justify-between items-center text-slate-200">
            <h3 className="flex justify-center items-center">
              CHAS{" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30px"
                height="30px"
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
            <p>09/30</p>
          </div>
          <div className=" flex flex-row  justify-between items-end ">
            <div className="flex flex-col">
              <p className="-mb-2 text-4xl font-semibold">
                {balance !== null && balance !== undefined
                  ? balance.toFixed(2)
                  : "Loading..."}
              </p>
              <p className="font-thin text-sm">Total Balance SEK</p>
            </div>
            <div className="">
              <p>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="50px"
                  height="50px"
                  viewBox="0 -11 70 70"
                  fill="none"
                >
                  <rect
                    x="0.5"
                    y="0.5"
                    width="69"
                    height="47"
                    rx="5.5"
                    fill="white"
                    stroke="#D9D9D9"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M21.2505 32.5165H17.0099L13.8299 20.3847C13.679 19.8267 13.3585 19.3333 12.8871 19.1008C11.7106 18.5165 10.4142 18.0514 9 17.8169V17.3498H15.8313C16.7742 17.3498 17.4813 18.0514 17.5991 18.8663L19.2491 27.6173L23.4877 17.3498H27.6104L21.2505 32.5165ZM29.9675 32.5165H25.9626L29.2604 17.3498H33.2653L29.9675 32.5165ZM38.4467 21.5514C38.5646 20.7346 39.2717 20.2675 40.0967 20.2675C41.3931 20.1502 42.8052 20.3848 43.9838 20.9671L44.6909 17.7016C43.5123 17.2345 42.216 17 41.0395 17C37.1524 17 34.3239 19.1008 34.3239 22.0165C34.3239 24.2346 36.3274 25.3992 37.7417 26.1008C39.2717 26.8004 39.861 27.2675 39.7431 27.9671C39.7431 29.0165 38.5646 29.4836 37.3881 29.4836C35.9739 29.4836 34.5596 29.1338 33.2653 28.5494L32.5582 31.8169C33.9724 32.3992 35.5025 32.6338 36.9167 32.6338C41.2752 32.749 43.9838 30.6502 43.9838 27.5C43.9838 23.5329 38.4467 23.3004 38.4467 21.5514ZM58 32.5165L54.82 17.3498H51.4044C50.6972 17.3498 49.9901 17.8169 49.7544 18.5165L43.8659 32.5165H47.9887L48.8116 30.3004H53.8772L54.3486 32.5165H58ZM51.9936 21.4342L53.1701 27.1502H49.8723L51.9936 21.4342Z"
                    fill="#172B85"
                  />
                </svg>
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-evenly items-center py-5  w-full md:justify-center">
          <button
            onClick={() => (setDeposit(true), setDepositAmount(""))}
            className="-mr-5 md:mr-2 border-none my-8 hover:cursor-pointer hover:bg-slate-200 bg-slate-100 h-8 w-24 rounded-full flex justify-center items-center"
          >
            Deposit
          </button>
          <button
            onClick={() => (setWithdraw(true), setWithdrawAmount(""))}
            className="-ml-5 md:ml-2 border-none my-8 hover:cursor-pointer hover:bg-slate-200 bg-slate-100 h-8 w-24 rounded-full flex justify-center items-center"
          >
            Withdraw
          </button>
        </div>
      </div>
      <div className="bg-slate-100 px-8 h-full pb-20">
        {paymentVisibility.Mobile === false &&
        paymentVisibility.Internet === false &&
        paymentVisibility.Gym === false &&
        paymentVisibility.Netflix === false &&
        paymentVisibility.Electricity === false ? (
          <div className="h-10"></div>
        ) : (
          <div className="flex justify-between md:justify-evenly items-center  ">
            <h3 className="text-xl">Quickpay </h3>{" "}
            {/* Det här kommer att betala allt på en gång */}
            <div
              onClick={() => setPayAll(true)}
              className="flex  justify-center  items-center hover:cursor-pointer hover:font-semibold"
            >
              <p className="pr-5 ">Pay all</p>
              <p className="text-4xl hover:cursor-pointer hover:font-semibold text-blue-800">
                +
              </p>
            </div>
          </div>
        )}
        {paymentVisibility.Mobile === false &&
          paymentVisibility.Internet === false &&
          paymentVisibility.Gym === false &&
          paymentVisibility.Netflix === false &&
          paymentVisibility.Electricity === false && (
            <div className=" flex justify-center items-center mt-12 ">
              {" "}
              <p className="text-xl bg-slate-200 rounded-3xl h-20 w-full text-center flex justify-center items-center">
                You have no more payments
              </p>
            </div>
          )}
        <div className="md:grid md:grid-cols-2">
          {paymentVisibility.Mobile && (
            <div
              onClick={() => handlePayment(649, "Mobile")}
              className=" flex justify-between md:justify-evenly items-center border-solid border-t-0 border-r-0 border-l-0 border-b-[0.5px] border-stone-400"
            >
              <div className="flex flex-col">
                <p className="-mb-1">Mobile Phone</p>
                <p>649</p>
              </div>
              <div className="hover:cursor-pointer hover:font-semibold hover:bg-slate-300 bg-slate-200 w-40 rounded-full h-14 flex justify-center items-center">
                <p className="pr-5">Pay now</p>
                <p className="text-xl">&rarr;</p>
              </div>
            </div>
          )}
          {paymentVisibility.Internet && (
            <div
              onClick={() => handlePayment(489, "Internet")}
              className=" flex justify-between md:justify-evenly items-center border-solid border-t-0 border-r-0 border-l-0 border-b-[0.5px] border-stone-400"
            >
              <div className="flex flex-col">
                <p className="-mb-1">Internet</p>
                <p>489</p>
              </div>
              <div className="hover:cursor-pointer hover:font-semibold hover:bg-slate-300 bg-slate-200 w-40 rounded-full h-14 flex justify-center items-center">
                <p className="pr-5">Pay now</p>
                <p className="text-xl">&rarr;</p>
              </div>
            </div>
          )}
          {paymentVisibility.Electricity && (
            <div
              onClick={() => handlePayment(310, "Electricity")}
              className=" flex justify-between md:justify-evenly items-center border-solid border-t-0 border-r-0 border-l-0 border-b-[0.5px] border-stone-400"
            >
              <div className="flex flex-col">
                <p className="-mb-1">Electricity</p>
                <p>310</p>
              </div>
              <div className="hover:cursor-pointer hover:font-semibold hover:bg-slate-300 bg-slate-200 w-40 rounded-full h-14 flex justify-center items-center">
                <p className="pr-5">Pay now</p>
                <p className="text-xl">&rarr;</p>
              </div>
            </div>
          )}
          {paymentVisibility.Gym && (
            <div
              onClick={() => handlePayment(649, "Gym")}
              className=" flex justify-between md:justify-evenly items-center border-solid border-t-0 border-r-0 border-l-0 border-b-[0.5px] border-stone-400"
            >
              <div className="flex flex-col">
                <p className="-mb-1">Gym</p>
                <p>649</p>
              </div>
              <div className="hover:cursor-pointer hover:font-semibold hover:bg-slate-300 bg-slate-200 w-40 rounded-full h-14 flex justify-center items-center">
                <p className="pr-5">Pay now</p>
                <p className="text-xl">&rarr;</p>
              </div>
            </div>
          )}
          {paymentVisibility.Netflix && (
            <div
              onClick={() => handlePayment(109, "Netflix")}
              className=" flex justify-between md:justify-evenly items-center border-solid border-t-0 border-r-0 border-l-0 border-b-[0.5px] border-stone-400"
            >
              <div className="flex flex-col">
                <p className="-mb-1">Netflix</p>
                <p>109</p>
              </div>
              <div className="hover:cursor-pointer hover:font-semibold hover:bg-slate-300 bg-slate-200 w-40 rounded-full h-14 flex justify-center items-center">
                <p className="pr-5">Pay now</p>
                <p className="text-xl">&rarr;</p>
              </div>
            </div>
          )}
        </div>
      </div>
      {deposit && (
        <div className="sign-in-overlay flex flex-col">
          <div className="px-8">
            <div className="bg-slate-200 h-96 rounded-lg px-10 text-slate-950 flex flex-col justify-center items-start  text-xl font-semibold  hover:cursor-pointer">
              <div className=" w-full flex justify-end items-center">
                <div className=" ">
                  <button
                    onClick={() => setDeposit(false)}
                    className="bg-slate-50 h-8 w-8 text-xlflex justify-center items-center rounded-full border-none hover:bg-slate-300 hover:cursor-pointer -mr-5"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <h2 className="leading-snug text-center w-full">
                Enter Deposit Amount
              </h2>
              {/* <p className="text-sm">Your Session Token: {token}</p> */}
              <form onSubmit={handleDeposit} className=" w-full ">
                <input
                  autoFocus
                  onChange={(e) => setDepositAmount(e.target.value)}
                  type="number"
                  placeholder="Enter Deposit Amount"
                  value={depositAmount}
                  required
                  className="text-center flex justify-center items-center decoration-none h-10 my-8 w-full rounded-xl border-none text-xl"
                />

                <button
                  type="submit"
                  onClick={handleDeposit}
                  className="p-2 hover:cursor-pointer border-none h-10 w-full rounded-full text-base  text-slate-200 bg-blue-950 hover:bg-blue-900"
                >
                  Deposit
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      {errorMessage !== "" && (
        <div className="sign-in-overlay flex flex-col">
          <div className="px-8">
            <div className="bg-slate-200 h-60 rounded-lg px-10 text-slate-950 flex flex-col justify-center items-start  text-xl font-semibold  hover:cursor-pointer">
              <div className=" w-full flex justify-end items-center -mt-10">
                <div className=" ">
                  <button
                    onClick={() => setErrorMessage("")}
                    className="bg-slate-50 h-8 w-8 text-xlflex justify-center items-center rounded-full border-none hover:bg-slate-300 hover:cursor-pointer -mr-5"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <h2 className="leading-snug text-center w-full text-2xl">
                {errorMessage}
              </h2>
            </div>
          </div>
        </div>
      )}
      {withdraw && (
        <div className="sign-in-overlay flex flex-col">
          <div className="px-8">
            <div className="bg-slate-200 h-96 rounded-lg px-10 text-slate-950 flex flex-col justify-center items-start  text-xl font-semibold  hover:cursor-pointer">
              <div className=" w-full flex justify-end items-center">
                <div className=" ">
                  <button
                    onClick={() => setWithdraw(false)}
                    className="bg-slate-50 h-8 w-8 text-xlflex justify-center items-center rounded-full border-none hover:bg-slate-300 hover:cursor-pointer -mr-5"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <h2 className="leading-snug text-center w-full">
                Enter Withdraw Amount
              </h2>
              {/* <p className="text-sm">Your Session Token: {token}</p> */}
              <form onSubmit={handleWithdraw} className=" w-full">
                <input
                  autoFocus
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  type="number"
                  placeholder="Enter Withdraw Amount"
                  value={withdrawAmount}
                  required
                  className="text-center h-10 my-8 w-full rounded-xl border-none text-xl"
                />

                <button
                  type="submit"
                  onClick={handleWithdraw}
                  className="p-2 hover:cursor-pointer border-none h-10 w-full rounded-full text-base  text-slate-200 bg-blue-950 hover:bg-blue-900"
                >
                  Withdraw
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      {logOut && (
        <div className="sign-in-overlay flex flex-col ">
          <div className="px-8">
            <div className="leading-snug bg-slate-200 h-full rounded-lg px-10 text-slate-950 flex flex-col justify-center items-center mb-10 text-xl font-semibold ">
              <div className=" w-full flex justify-end items-center">
                <div className=" ">
                  <button
                    onClick={() => setLogOut(false)}
                    className="bg-slate-50 h-8 w-8 text-xlflex justify-center items-center rounded-full border-none hover:bg-slate-300 hover:cursor-pointer -mr-5"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <h2 className="text-center">
                Do you want to <br /> log out?
              </h2>
              <div className="flex  w-full justify-evenly">
                <button
                  onClick={handleLogOut}
                  className="mr-3 hover:cursor-pointer border-none h-10 w-32 rounded-full text-base  text-slate-950 bg-slate-300 hover:bg-slate-400"
                >
                  Yes
                </button>
                <button
                  onClick={() => setLogOut(false)}
                  className="ml-3 hover:cursor-pointer border-none h-10 w-32 rounded-full text-base  text-slate-100 bg-blue-950 hover:bg-blue-900"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {payAll && (
        <div className="sign-in-overlay flex flex-col ">
          <div className="px-8">
            <div className="leading-snug bg-slate-200 h-full rounded-lg px-10 text-slate-950 flex flex-col justify-center items-center mb-10 text-xl font-semibold ">
              <div className=" w-full flex justify-end items-center">
                <button
                  onClick={() => setPayAll(false)}
                  className="bg-slate-50 h-8 w-8 text-xlflex justify-center items-center rounded-full border-none hover:bg-slate-300 hover:cursor-pointer -mr-5"
                >
                  ✕
                </button>
              </div>
              <h2 className="text-center ">
                Are you sure you want to pay all?
              </h2>
              <div className="flex  w-full justify-evenly mb-14">
                <button
                  onClick={async () => {
                    await handlePayAll();
                    setPayAll(false);
                  }}
                  className="mr-3 hover:cursor-pointer border-none h-10 w-32 rounded-full text-base  text-slate-950 bg-slate-300 hover:bg-slate-400"
                >
                  Yes
                </button>
                <button
                  onClick={() => setPayAll(false)}
                  className="ml-3 hover:cursor-pointer border-none h-10 w-32 rounded-full text-base  text-slate-100 bg-blue-950 hover:bg-blue-900"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
