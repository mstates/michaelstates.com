import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { createRef } from "react";
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

  // React 19 ref-as-prop: consumers need a DOM handle for scroll-to-heading /
  // skip-link focus patterns.
  it("attaches ref to the rendered heading element", () => {
    const ref = createRef<HTMLHeadingElement>();
    render(
      <Heading level={3} ref={ref}>
        Anchored
      </Heading>,
    );
    expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
    expect(ref.current?.tagName).toBe("H3");
  });

  // Empty headings fail axe's empty-heading rule (SC 2.4.6). The component warns in
  // dev only; axe in CI stays the authoritative gate.
  describe("empty-content dev warning", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("warns when rendered with empty children", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      render(<Heading level={2}>{""}</Heading>);
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining("empty-heading"),
      );
    });

    it("warns when children is null", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      render(<Heading level={2}>{null}</Heading>);
      expect(warn).toHaveBeenCalledTimes(1);
    });

    it("warns when children is a boolean", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      render(<Heading level={2}>{false}</Heading>);
      expect(warn).toHaveBeenCalledTimes(1);
    });

    it("warns when every child in an array is empty", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const condA = false;
      const condB = " ";
      render(
        // Sibling expressions make children an array — [false, " "] here.
        <Heading level={2}>
          {condA}
          {condB}
        </Heading>,
      );
      expect(warn).toHaveBeenCalledTimes(1);
    });

    it("does not warn when aria-labelledby provides the accessible name", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      render(
        <Heading level={2} aria-labelledby="section-label">
          {""}
        </Heading>,
      );
      expect(warn).not.toHaveBeenCalled();
    });

    it("does not warn when aria-label provides the accessible name", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      render(
        <Heading level={2} aria-label="Selected work">
          {""}
        </Heading>,
      );
      expect(warn).not.toHaveBeenCalled();
    });

    it("does not warn with real content", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      render(<Heading level={2}>Selected work</Heading>);
      expect(warn).not.toHaveBeenCalled();
    });
  });
});
