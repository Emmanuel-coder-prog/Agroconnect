import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import { AuthContext } from "../../../context/AuthContext";
import FormInput from "../../molecules/FormInput";
import Button from "../../atoms/buttons/Button";

function SignupForm() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    password: "",
    role: "farmer",
    phone: "",
    address: "",
    farmSize: "",
    cropType: "",
    serviceType: ""
  });

  const update = (field, value) =>
    setForm({ ...form, [field]: value });

  const handleRegister = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    try {
      const response = await api.post('/api/auth/register', form);
      
      console.log("Registration response:", response.data);
      
      if (response.status === 201 || response.status === 200) {
        alert("Registration successful! Logging you in...");
        
        try {
          await login(form.email, form.password);
          navigate("/");
        } catch (loginError) {
          console.error("Auto-login failed:", loginError);
          navigate("/login");
        }
      } else {
        alert(`Registration failed: ${response.data?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Registration error details:", error);
      
      if (error.response?.data) {
        alert(`Registration error: ${error.response.data}`);
      } else if (error.message) {
        alert(`Registration error: ${error.message}`);
      } else {
        alert('Registration failed. Please try again.');
      }
    }
  };

  const handleRoleChange = (role) => {
    setForm({ 
      ...form, 
      role,
      farmSize: role === "farmer" ? form.farmSize : "",
      cropType: role === "farmer" ? form.cropType : "",
      serviceType: role === "provider" ? form.serviceType : ""
    });
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={handleRegister}>
      {/* <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Create an Account</h1>
        {}
        <p className="text-gray-600 mt-1">Join AgroConnect today and access professional farm services</p>
      </div> */}

      <FormInput
        label="Full Name"
        type="text"
        value={form.name}
        onChange={(e) => update("name", e.target.value)}
        required
        placeholder="Enter your full name"
      />
      
      <FormInput
        label="Email Address"
        type="email"
        value={form.email}
        onChange={(e) => update("email", e.target.value)}
        required
        placeholder="Enter your email"
      />
      
      <FormInput
        label="Password"
        type="password"
        value={form.password}
        onChange={(e) => update("password", e.target.value)}
        required
        minLength={6}
        placeholder="At least 6 characters"
      />

      <FormInput
        label="Phone Number (Optional)"
        type="tel"
        value={form.phone}
        onChange={(e) => update("phone", e.target.value)}
        placeholder="Enter your phone number"
      />

      <FormInput
        label="Address (Optional)"
        type="text"
        value={form.address}
        onChange={(e) => update("address", e.target.value)}
        placeholder="Enter your address"
      />

      {/* Role Selection - Farmer or Provider only */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">
          Account Type
          <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="radio"
              name="role"
              value="farmer"
              checked={form.role === "farmer"}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="text-indigo-600"
            />
            <div>
              <span className="font-medium">Farmer</span>
              <p className="text-xs text-gray-500">Request farm services</p>
            </div>
          </label>
          
          <label className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="radio"
              name="role"
              value="provider"
              checked={form.role === "provider"}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="text-indigo-600"
            />
            <div>
              <span className="font-medium">Service Provider</span>
              <p className="text-xs text-gray-500">Offer drone/tractor services</p>
            </div>
          </label>
        </div>
      </div>

      {/* Conditionally show farmer fields */}
      {form.role === "farmer" && (
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <h3 className="font-medium text-gray-700">Farmer Details (Optional)</h3>
          <FormInput
            label="Farm Size (acres)"
            type="number"
            value={form.farmSize}
            onChange={(e) => update("farmSize", e.target.value)}
            placeholder="e.g., 50"
            min="0"
          />
          
          <FormInput
            label="Crop Type"
            type="text"
            value={form.cropType}
            onChange={(e) => update("cropType", e.target.value)}
            placeholder="e.g., Corn, Wheat, Vegetables"
          />
        </div>
      )}

      {/* Conditionally show provider fields */}
      {form.role === "provider" && (
        <div className="p-4 border rounded-lg bg-gray-50">
          <FormInput
            label="Service Type"
            type="text"
            value={form.serviceType}
            onChange={(e) => update("serviceType", e.target.value)}
            placeholder="e.g., Drone Spraying, Tractor Service"
          />
        </div>
      )}

      <div className="flex items-start gap-2 mt-4">
        <input
          type="checkbox"
          id="terms"
          required
          className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <label htmlFor="terms" className="text-sm text-gray-600">
          I agree to the{" "}
          <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Terms and Conditions
          </a>{" "}
          and{" "}
          <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Privacy Policy
          </a>
        </label>
      </div>

      <Button
        text="Create Account"
        type="submit"
        className="mt-4"
      />

      {/*" */}
      <p className="text-center text-sm text-gray-600 mt-4">
        Already have an account?{" "}
        <a href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
          Sign in here
        </a>
      </p>
    </form>
  );
}

export default SignupForm;