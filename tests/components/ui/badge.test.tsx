import { Badge } from "@/components/ui/badge";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("Badge Component", () => {
  it("renders with default styles", () => {
    render(<Badge>New</Badge>);
    const badge = screen.getByText(/new/i);

    expect(badge).toBeInTheDocument();
    // Verify default variant classes (bg-primary)
    expect(badge).toHaveClass("bg-primary");
    expect(badge).toHaveClass("rounded-full");
  });

  it("renders destructive variant", () => {
    render(<Badge variant="destructive">Error</Badge>);
    const badge = screen.getByText(/error/i);

    expect(badge).toHaveClass("bg-destructive");
  });

  it("renders outline variant", () => {
    render(<Badge variant="outline">Outline</Badge>);
    const badge = screen.getByText(/outline/i);

    expect(badge).toHaveClass("border");
  });
});
