import { useState } from "react";
import { Eye, EyeOff, Loader2, Lock, User } from "lucide-react";
import { useRouter } from "@tanstack/react-router";
import { ADMIN_API_BASE } from "@/lib/admin-api";
import { setAdminSession } from "@/lib/admin-session";
import lgsLogo from "@/assets/lgs_logo.png";

export function AdminLoginPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  return (
    <div className="grid min-h-screen place-items-center bg-[#f7f4ef] p-4">
      <div className="w-full max-w-md rounded-[28px] border border-[#eadfd3] bg-white p-6 shadow-xl sm:p-8">
        <div className="text-center">
          <img src={lgsLogo} alt="LGS" className="mx-auto h-14 w-auto" />
          <h1 className="mt-4 text-2xl font-semibold text-[#7f1d1d]">Admin Login</h1>
          <p className="mt-1 text-sm text-stone-500">Secure access for store management.</p>
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setError("");
            if (!form.email || !form.password) {
              setError("Email and password are required.");
              return;
            }

            setLoading(true);
            try {
              const response = await fetch(`${ADMIN_API_BASE}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
              });
              const payload = await response.json();
              if (!response.ok || !payload.success) {
                throw new Error(payload.message || "Invalid login");
              }
              setAdminSession(payload.data.token, payload.data.admin);
              router.navigate({ to: "/admin/dashboard" });
            } catch (err) {
              setError(err instanceof Error ? err.message : "Login failed");
            } finally {
              setLoading(false);
            }
          }}
        >
          <Field
            label="Email"
            icon={<User size={16} />}
            value={form.email}
            onChange={(value) => setForm((prev) => ({ ...prev, email: value }))}
            placeholder="admin@lgs.com"
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Password</label>
            <div className="flex items-center gap-2 rounded-xl border border-[#ded4c8] bg-white px-3">
              <Lock size={16} className="text-stone-400" />
              <input
                type={show ? "text" : "password"}
                className="h-12 w-full bg-transparent outline-none"
                placeholder="Enter password"
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              />
              <button type="button" onClick={() => setShow((value) => !value)} className="text-stone-400">
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#7f1d1d] text-sm font-semibold text-white transition hover:bg-[#651717] disabled:opacity-70"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  onChange,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  label: string;
  icon: React.ReactNode;
  onChange?: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-stone-700">{label}</label>
      <div className="flex items-center gap-2 rounded-xl border border-[#ded4c8] bg-white px-3">
        <span className="text-stone-400">{icon}</span>
        <input
          className="h-12 w-full bg-transparent outline-none"
          {...props}
          onChange={(event) => onChange?.(event.target.value)}
        />
      </div>
    </div>
  );
}
