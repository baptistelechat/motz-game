import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

// Radix UI PointerEvents workaround for JSDOM
// https://github.com/radix-ui/primitives/issues/1220
class MockPointerEvent extends Event {
  button: number;
  ctrlKey: boolean;
  pointerType: string;

  constructor(type: string, props: PointerEventInit = {}) {
    super(type, props);
    this.button = props.button || 0;
    this.ctrlKey = props.ctrlKey || false;
    this.pointerType = props.pointerType || "mouse";
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
window.PointerEvent = MockPointerEvent as any;

window.HTMLElement.prototype.scrollIntoView = function () {};
window.HTMLElement.prototype.releasePointerCapture = function () {};
window.HTMLElement.prototype.hasPointerCapture = function () {
  return false;
};

describe("DropdownMenu", () => {
  it("renders trigger and opens content on click", async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>My Menu</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const trigger = screen.getByRole("button", { name: /open menu/i });
    expect(trigger).toBeInTheDocument();

    // Trigger click
    fireEvent.pointerDown(trigger);

    // Wait for content
    const item1 = await screen.findByText("Item 1");
    expect(item1).toBeInTheDocument();

    expect(screen.getByText("My Menu")).toBeInTheDocument();
  });

  it("renders with pixel-pop styles", async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    const trigger = screen.getByRole("button", { name: /open menu/i });
    fireEvent.pointerDown(trigger);

    const content = await screen.findByRole("menu");
    expect(content).toHaveClass("rounded-none");
    expect(content).toHaveClass("border-4");
  });
});
