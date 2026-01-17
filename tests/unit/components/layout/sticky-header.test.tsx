import { StickyHeader } from "@/components/layout/sticky-header";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("StickyHeader", () => {
  it("renders children correctly", () => {
    render(
      <StickyHeader>
        <div>Header Content</div>
      </StickyHeader>,
    );
    expect(screen.getByText("Header Content")).toBeInTheDocument();
  });

  it("has sticky positioning and correct z-index", () => {
    render(<StickyHeader>Content</StickyHeader>);
    const header = screen.getByRole("banner");
    expect(header).toHaveClass("sticky");
    expect(header).toHaveClass("top-0");
    expect(header).toHaveClass("z-50");
  });

  it("has pixel-pop border bottom", () => {
    render(<StickyHeader>Content</StickyHeader>);
    const header = screen.getByRole("banner");
    expect(header).toHaveClass("border-b-4");
    expect(header).toHaveClass("border-black");
  });
});
