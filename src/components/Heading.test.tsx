import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Heading } from "./Heading";

// `level` is the semantic outline; `size` is purely visual. The two must stay decoupled
// so the heading outline (SC 1.3.1 / 2.4.6) never bends to a typographic choice.
describe("Heading", () => {
  it("renders the semantic level requested", () => {
    render(<Heading level={2}>About</Heading>);
    expect(
      screen.getByRole("heading", { level: 2, name: "About" }),
    ).toBeInTheDocument();
  });

  it("keeps the heading level independent of the visual size", () => {
    render(
      <Heading level={1} size="body">
        Title
      </Heading>,
    );
    expect(
      screen.getByRole("heading", { level: 1, name: "Title" }),
    ).toBeInTheDocument();
  });
});
