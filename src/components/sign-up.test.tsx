import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { vi } from "vitest";

import { authClient } from "@/lib/auth-client";
import { SignUp } from "./sign-up";

// Mock the auth client
const mockSignUp = vi.mocked(authClient.signUp.email);
const mockToastSuccess = vi.mocked(toast.success);
const mockToastError = vi.mocked(toast.error);

// Mock useRouter
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("SignUp Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the sign up form correctly", () => {
    render(<SignUp />);

    expect(screen.getByText(/ساخت اکانت/)).toBeInTheDocument();
    expect(
      screen.getByText("خوش آمدید! اکانت خودتون رو بسازید و وارد شوید"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("نام")).toBeInTheDocument();
    expect(screen.getByLabelText("نام خانوادگی")).toBeInTheDocument();
    expect(screen.getByLabelText("ایمیل")).toBeInTheDocument();
    expect(screen.getByLabelText("رمز عبور")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ثبت نام" })).toBeInTheDocument();
    expect(screen.getByText("اکانت دارید؟")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ورود" })).toBeInTheDocument();
  });

  it("shows validation errors for empty required fields", async () => {
    const user = userEvent.setup();
    render(<SignUp />);

    const submitButton = screen.getByRole("button", { name: "ثبت نام" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getAllByText("Invalid input")).toHaveLength(4);
    });
  });

  it("shows validation error for invalid email", async () => {
    const user = userEvent.setup();
    render(<SignUp />);

    // Fill required fields with valid data
    await user.type(screen.getByLabelText("نام"), "علی");
    await user.type(screen.getByLabelText("نام خانوادگی"), "فهیم");
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
    render(<SignUp />);

    // Fill required fields with valid data
    await user.type(screen.getByLabelText("نام"), "علی");
    await user.type(screen.getByLabelText("نام خانوادگی"), "فهیم");
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
    render(<SignUp />);

    // Mock successful signup
    mockSignUp.mockResolvedValueOnce({ data: {}, error: null });

    // Fill out the form
    await user.type(screen.getByLabelText("نام"), "علی");
    await user.type(screen.getByLabelText("نام خانوادگی"), "فهیم");
    await user.type(screen.getByLabelText("ایمیل"), "ali@example.com");
    await user.type(screen.getByLabelText("رمز عبور"), "password123");

    // Submit the form
    const submitButton = screen.getByRole("button", { name: "ثبت نام" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: "ali@example.com",
        password: "password123",
        name: "علی فهیم",
      });
      expect(mockToastSuccess).toHaveBeenCalledWith(
        "لطفا ایمیل خود را برای فعالسازی اکانت چک کنید",
      );
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("shows error message on signup failure", async () => {
    const user = userEvent.setup();
    render(<SignUp />);

    // Mock failed signup
    mockSignUp.mockResolvedValueOnce({
      data: null,
      error: { message: "Email already exists" },
    });

    // Fill out the form
    await user.type(screen.getByLabelText("نام"), "علی");
    await user.type(screen.getByLabelText("نام خانوادگی"), "فهیم");
    await user.type(screen.getByLabelText("ایمیل"), "ali@example.com");
    await user.type(screen.getByLabelText("رمز عبور"), "password123");

    // Submit the form
    const submitButton = screen.getByRole("button", { name: "ثبت نام" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("Email already exists");
    });
  });

  it("disables submit button during form submission", async () => {
    const user = userEvent.setup();
    render(<SignUp />);

    // Mock delayed signup
    mockSignUp.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ data: {}, error: null }), 100),
        ),
    );

    // Fill out the form
    await user.type(screen.getByLabelText("نام"), "علی");
    await user.type(screen.getByLabelText("نام خانوادگی"), "فهیم");
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

  it("navigates to sign in page when link is clicked", () => {
    render(<SignUp />);

    const signInLink = screen.getByRole("link", { name: "ورود" });
    expect(signInLink).toHaveAttribute("href", "/signin");
  });
});
