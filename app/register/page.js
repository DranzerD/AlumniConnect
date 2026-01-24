"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./register.module.css";
import Toast from "@/components/Toast";
import PasswordStrength from "@/components/PasswordStrength";
import { useToast } from "@/hooks/useToast";

export default function RegisterPage() {
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    role: "",
    graduationYear: "",
    department: "",
    college: "",
  });
  const [errors, setErrors] = useState({});

  const colleges = [
    { id: 1, name: "Demo University", domain: "demo.edu" },
    { id: 2, name: "Tech Institute", domain: "tech.edu" },
    { id: 3, name: "Engineering College", domain: "engineering.edu" },
  ];

  const departments = [
    "Computer Science",
    "Electronics",
    "Mechanical",
    "Civil",
    "Chemical",
    "Biotechnology",
    "Information Technology",
    "Business Administration",
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when field is modified
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.fullName) {
      newErrors.fullName = "Full name is required";
    }
    if (!formData.role) {
      newErrors.role = "Please select your role";
    }
    if (!formData.college) {
      newErrors.college = "Please select your college";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      showToast("Account created successfully! Please sign in.", "success");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    }, 1500);
  };

  return (
    <>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      <div className={styles.container}>
        <div className={styles.leftPanel}>
          <div className={styles.brandContent}>
            <Link href="/" className={styles.logo}>
              🎓 AlumniConnect
            </Link>
            <h1 className={styles.headline}>Join the largest alumni network</h1>
            <p className={styles.tagline}>
              Connect with 50,000+ alumni across 100+ colleges. Build meaningful
              relationships and accelerate your career.
            </p>

            <div className={styles.features}>
              <div className={styles.featureItem}>
                <span className={styles.featureIcon}>🤝</span>
                <div>
                  <h4>Network with Alumni</h4>
                  <p>Connect with successful graduates from your college</p>
                </div>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureIcon}>💼</span>
                <div>
                  <h4>Exclusive Job Board</h4>
                  <p>Access opportunities shared by alumni at top companies</p>
                </div>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureIcon}>🎯</span>
                <div>
                  <h4>Mentorship Program</h4>
                  <p>Get guidance from experienced professionals</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.rightPanel}>
          <div className={styles.formContainer}>
            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>Create your account</h2>
              <p className={styles.formSubtitle}>
                Already have an account?{" "}
                <Link href="/login" className={styles.loginLink}>
                  Sign in
                </Link>
              </p>
            </div>

            <div className={styles.stepIndicator}>
              <div
                className={`${styles.step} ${step >= 1 ? styles.active : ""}`}
              >
                <div className={styles.stepNumber}>1</div>
                <span>Account</span>
              </div>
              <div className={styles.stepLine}></div>
              <div
                className={`${styles.step} ${step >= 2 ? styles.active : ""}`}
              >
                <div className={styles.stepNumber}>2</div>
                <span>Profile</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              {step === 1 && (
                <div className={styles.stepContent}>
                  <div className={styles.formGroup}>
                    <label htmlFor="email">College Email</label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@college.edu"
                      className={errors.email ? styles.inputError : ""}
                    />
                    {errors.email && (
                      <span className={styles.error}>{errors.email}</span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="password">Password</label>
                    <input
                      id="password"
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a strong password"
                      className={errors.password ? styles.inputError : ""}
                    />
                    {errors.password && (
                      <span className={styles.error}>{errors.password}</span>
                    )}
                    {formData.password && (
                      <PasswordStrength password={formData.password} />
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                      id="confirmPassword"
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      className={
                        errors.confirmPassword ? styles.inputError : ""
                      }
                    />
                    {errors.confirmPassword && (
                      <span className={styles.error}>
                        {errors.confirmPassword}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    className={styles.nextBtn}
                    onClick={handleNext}
                  >
                    Continue
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className={styles.stepContent}>
                  <div className={styles.formGroup}>
                    <label htmlFor="fullName">Full Name</label>
                    <input
                      id="fullName"
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className={errors.fullName ? styles.inputError : ""}
                    />
                    {errors.fullName && (
                      <span className={styles.error}>{errors.fullName}</span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="role">I am a</label>
                    <div className={styles.roleOptions}>
                      {["student", "alumni", "faculty"].map((role) => (
                        <label
                          key={role}
                          className={`${styles.roleOption} ${
                            formData.role === role ? styles.roleSelected : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name="role"
                            value={role}
                            checked={formData.role === role}
                            onChange={handleChange}
                          />
                          <span className={styles.roleIcon}>
                            {role === "student" && "🎓"}
                            {role === "alumni" && "👔"}
                            {role === "faculty" && "👨‍🏫"}
                          </span>
                          <span className={styles.roleLabel}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </span>
                        </label>
                      ))}
                    </div>
                    {errors.role && (
                      <span className={styles.error}>{errors.role}</span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="college">College</label>
                    <select
                      id="college"
                      name="college"
                      value={formData.college}
                      onChange={handleChange}
                      className={errors.college ? styles.inputError : ""}
                    >
                      <option value="">Select your college</option>
                      {colleges.map((college) => (
                        <option key={college.id} value={college.id}>
                          {college.name}
                        </option>
                      ))}
                    </select>
                    {errors.college && (
                      <span className={styles.error}>{errors.college}</span>
                    )}
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="department">Department</label>
                      <select
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                      >
                        <option value="">Select department</option>
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="graduationYear">
                        {formData.role === "student"
                          ? "Expected Graduation"
                          : "Graduation Year"}
                      </label>
                      <select
                        id="graduationYear"
                        name="graduationYear"
                        value={formData.graduationYear}
                        onChange={handleChange}
                      >
                        <option value="">Select year</option>
                        {years.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={styles.buttonGroup}>
                    <button
                      type="button"
                      className={styles.backBtn}
                      onClick={handleBack}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M7 8l-4 4m0 0l4 4m-4-4h18" />
                      </svg>
                      Back
                    </button>
                    <button
                      type="submit"
                      className={styles.submitBtn}
                      disabled={loading}
                    >
                      {loading ? "Creating account..." : "Create Account"}
                    </button>
                  </div>
                </div>
              )}
            </form>

            <p className={styles.terms}>
              By creating an account, you agree to our{" "}
              <a href="#">Terms of Service</a> and{" "}
              <a href="#">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
