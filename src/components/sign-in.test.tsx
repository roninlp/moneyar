import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { vi } from "vitest";

import { authClient } from "@/lib/auth-client";
import { SignIn } from "./sign-in";

// Mock the auth client
const mockSignIn = vi.mocked(authClient.signIn.email);
const mockToastSuccess = vi.mocked(toast.success);
const mockToastError = vi.mocked(toast.error);

// Mock useRouter
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("SignIn Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the sign in form correctly", () => {
    render(<SignIn />);

    expect(screen.getByText("Sign In to Moneyar")).toBeInTheDocument();
    expect(
      screen.getByText("Welcome back! Sign in to continue"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("ایمیل")).toBeInTheDocument();
    expect(screen.getByLabelText("رمز عبور")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ثبت نام" })).toBeInTheDocument();
    expect(screen.getByText("Don't have an account ?")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Create account" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "go home" })).toBeInTheDocument();
  });

  it("shows validation errors for empty required fields", async () => {
    const user = userEvent.setup();
    render(<SignIn />);

    const submitButton = screen.getByRole("button", { name: "ثبت نام" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getAllByText("Invalid input")).toHaveLength(2);
    });
  });

  it("shows validation error for invalid email", async () => {
    const user = userEvent.setup();
    render(<SignIn />);

    // Fill password with valid data
    await user.type(screen.getByLabelText("رمز عبور"), "password123");

    // Type invalid email
    const emailInput = screen.getByLabelText("ایمیل");
    await user.type(emailInput, "invalid-email");

    const submitButton = screen.getByRole("button", { name: "ثبت نام" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid input")).toBeInTheDocument();
    });
  });

  it("shows validation error for short password", async () => {
    const user = userEvent.setup();
    render(<SignIn />);

    // Fill email with valid data
    await user.type(screen.getByLabelText("ایمیل"), "ali@example.com");

    // Type short password
    const passwordInput = screen.getByLabelText("رمز عبور");
    await user.type(passwordInput, "123");

    const submitButton = screen.getByRole("button", { name: "ثبت نام" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid input")).toBeInTheDocument();
    });
  });

  it("submits form successfully and shows success message", async () => {
    const user = userEvent.setup();
    render(<SignIn />);

    // Mock successful signin
    mockSignIn.mockResolvedValueOnce({ data: {}, error: null });

    // Fill out the form
    await user.type(screen.getByLabelText("ایمیل"), "ali@example.com");
    await user.type(screen.getByLabelText("رمز عبور"), "password123");

    // Submit the form
    const submitButton = screen.getByRole("button", { name: "ثبت نام" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: "ali@example.com",
        password: "password123",
      });
      expect(mockToastSuccess).toHaveBeenCalledWith("با موفقیت وارد شدید");
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("shows error message on signin failure", async () => {
    const user = userEvent.setup();
    render(<SignIn />);

    // Mock failed signin
    mockSignIn.mockResolvedValueOnce({
      data: null,
      error: { message: "Invalid credentials" },
    });

    // Fill out the form
    await user.type(screen.getByLabelText("ایمیل"), "ali@example.com");
    await user.type(screen.getByLabelText("رمز عبور"), "password123");

    // Submit the form
    const submitButton = screen.getByRole("button", { name: "ثبت نام" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("Invalid credentials");
    });
  });

  it("disables submit button during form submission", async () => {
    const user = userEvent.setup();
    render(<SignIn />);

    // Mock delayed signin
    mockSignIn.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ data: {}, error: null }), 100),
        ),
    );

    // Fill out the form
    await user.type(screen.getByLabelText("ایمیل"), "ali@example.com");
    await user.type(screen.getByLabelText("رمز عبور"), "password123");

    // Submit the form
    const submitButton = screen.getByRole("button", { name: "ثبت نام" });
    await user.click(submitButton);

    // Button should be disabled and show loading text
    expect(submitButton).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "در حال ثبت نام" }),
    ).toBeInTheDocument();

    // Wait for completion
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it("navigates to forgot password page when link is clicked", () => {
    render(<SignIn />);

    const forgotPasswordLink = screen.getByRole("link", {
      name: "فراموشی رمز عبور؟",
    });
    expect(forgotPasswordLink).toHaveAttribute("href", "/forgot-password");
  });

  it("navigates to create account page when link is clicked", () => {
    render(<SignIn />);

    const createAccountLink = screen.getByRole("link", {
      name: "Create account",
    });
    expect(createAccountLink).toHaveAttribute("href", "#");
  });

  it("navigates to home page when home link is clicked", () => {
    render(<SignIn />);

    const homeLink = screen.getByRole("link", { name: "go home" });
    expect(homeLink).toHaveAttribute("href", "/");
  });
});
