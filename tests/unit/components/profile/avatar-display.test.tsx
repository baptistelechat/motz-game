import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AvatarDisplay } from "@/components/profile/avatar-display";

describe("AvatarDisplay", () => {
  it("renders the avatar image correctly", () => {
    const animal = "chat";
    const color = "#e63946";
    
    render(<AvatarDisplay animal={animal} color={color} />);
    
    const image = screen.getByRole("img", { name: animal });
    expect(image).toBeInTheDocument();
    
    // Check if the src contains the animal name
    // Next/Image modifies src, so we check if it contains the path
    const src = image.getAttribute("src");
    expect(src).toContain(encodeURIComponent(`/assets/avatar/${animal}.png`));
  });

  it("applies the border color", () => {
    const animal = "chien";
    const color = "#123456";
    
    const { container } = render(<AvatarDisplay animal={animal} color={color} />);
    
    // The outer div should have the border color style
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv).toHaveStyle({ borderColor: color });
  });

  it("applies size classes", () => {
    const animal = "zebre";
    const color = "#000000";
    
    const { container, rerender } = render(<AvatarDisplay animal={animal} color={color} size="sm" />);
    expect(container.firstChild).toHaveClass("w-8", "h-8");
    
    rerender(<AvatarDisplay animal={animal} color={color} size="lg" />);
    expect(container.firstChild).toHaveClass("w-32", "h-32");
  });
});
