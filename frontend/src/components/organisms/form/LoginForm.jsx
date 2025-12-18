import { useState, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import FormInput from "../../molecules/FormInput";
import Input from "../../atoms/input/Input";
import Button from "../../atoms/buttons/Button";

function LoginForm({ onSubmit }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const { login } = useContext(AuthContext);

  const update = (field, value) =>
    setForm({ ...form, [field]: value });

  const handleLogin = async () =>{
    try {
      const result = await login(form.email, form.password);
      if (result.ok) {
        alert("Login successful!");
        window.location.href = "/";
      } else {
        alert(`Login failed: ${result.message || 'Invalid credentials'}`);
      }
    } catch (error) {
      console.error('Error during Login:', error);
      alert('An unexpected error occured.')
    }
  }

  return (
    <form className="flex flex-col gap-5">
      <FormInput
        label="Email Address"
        type="email"
        value={form.email}
        onChange={(e) => update("email", e.target.value)}
        required
      />

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Password
            <span className="text-red-500 ml-1">*</span>
          </label>
          <a href="#" className="text-xs text-indigo-600 hover:text-indigo-700 transition-colors">
            Forgot password?
          </a>
        </div>
        <Input
          type="password"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          required
        />
      </div>

      <Button
        text="Sign In"
        onClick={handleLogin}
      />

      
    </form>
  );
}

export default LoginForm;
