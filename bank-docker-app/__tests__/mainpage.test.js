import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import First from "../src/app/firstpage/page";

describe("First", () => {
  it("renders a heading", () => {
    render(<First />);

    const heading = screen.getByRole("heading", { level: 3 });

    expect(heading).toBeInTheDocument();
  });
});
