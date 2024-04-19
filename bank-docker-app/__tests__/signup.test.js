import SignUp from "@/app/signup/page";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

describe("SignIn", () => {
  it("renders a heading with text Welcome", () => {
    render(<SignUp />);

    const heading = screen.getByRole("heading", { level: 2 });

    expect(heading).toHaveTextContent("One step closer to better banking");
  });
});
